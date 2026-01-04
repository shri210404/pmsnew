import { resolve } from "path";
import { readFile } from "fs/promises";

import { BadRequestException, Body, Controller, Get, HttpStatus, Post, Req, Res, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { FastifyReply, FastifyRequest } from "fastify";

import { AppLogger } from "@shared/util/applogger.service";
import { LoginDto } from "./dto/login.dto";
import { RegistrationDto } from "./dto/register.dto";
import { AuthService } from "./auth.service";
import { Public } from "@shared/decorators/public.decorator";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  private readonly logContext = "AuthController";
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private logger: AppLogger
  ) {}

  @Public()
  @Post("register")
  registerUser(@Body() userRegistrationDto: RegistrationDto) {
    return this.authService.registerUser(userRegistrationDto);
  }

  @Post("change-password")
  changePassword(@Body() payload:any){
    return this.authService.changePassword(payload);
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 password reset emails per hour per IP
  @Post("forgot-password")
  forgotPassword(@Body() payload: any) {
    const { emailOrUsername } = payload;
    if (!emailOrUsername) {
      throw new BadRequestException("Email or username is required");
    }
    return this.authService.forgotPassword(emailOrUsername);
  }

  @Public()
  @Post("reset-password")
  resetPassword(@Body() payload: any) {
    const { token, newPassword } = payload;
    if (!token || !newPassword) {
      throw new BadRequestException("Token and new password are required");
    }
    return this.authService.resetPassword(token, newPassword);
  }

  @Public()
  @Post("login")
  async userLogin(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: FastifyReply) {
    const userdetails = await this.authService.userLogin(loginDto);

    // #AccessToken generation: start //
    const authPayload = { id: userdetails.id, username: userdetails.username };
    const privateKeyFilePath = resolve("certs/private.key"),
      privateKeyCert = await readFile(privateKeyFilePath);

    const authToken = this.jwtService.sign(authPayload, {
      privateKey: privateKeyCert,
      algorithm: "ES512",
      expiresIn: "5m",
    });
    // #AccessToken generation: end //

    // Pass user ID (UUID) not username - this is stored in token.user_id
    const token = await this.authService.registerToken(authToken, userdetails.id);

    if (token) {
      const refreshTokenName = this.configService.get<string>("REFRESH_TOKEN_NAME");
      // Get refresh token expiry days from config (default: 7 days)
      const refreshTokenExpiryDays = parseInt(
        this.configService.get<string>("REFRESH_TOKEN_EXPIRY_DAYS") || "7",
        10,
      );
      const cookieExpiry = new Date();
      cookieExpiry.setDate(cookieExpiry.getDate() + refreshTokenExpiryDays);

      // Cookie options - for localhost with different ports, we need special handling
      const cookieOptions: any = {
        httpOnly: true,
        expires: cookieExpiry,
        path: '/', // Ensure cookie is available for all paths
        domain: undefined, // Don't set domain for localhost - allows cookie to work across ports
      };

      if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true;
        cookieOptions.sameSite = 'strict';
      } else {
        // For localhost development with proxy: use 'lax' with secure: false
        // Proxy makes frontend and backend appear on same origin, so 'lax' works
        // If not using proxy, you may need 'none' with secure: true (requires HTTPS)
        cookieOptions.secure = false;
        cookieOptions.sameSite = 'lax';
      }

      this.logger.log(
        `Setting refresh token cookie: ${refreshTokenName}, Options: ${JSON.stringify(cookieOptions)}`,
        this.logContext
      );

      res 
        .setCookie(refreshTokenName, token, cookieOptions)
        //.status(HttpStatus.OK);

      return { authToken, userdetails };
    } else {
      throw new BadRequestException("User Authentication failed");
    }
  }

  @Public()
  @Get("renew-token")
  async renewAccessToken(@Req() request: FastifyRequest, @Res({ passthrough: true }) res: FastifyReply) {
    const cookieName = this.configService.get<string>("REFRESH_TOKEN_NAME");
    const req = request as any;
    const allCookies = req.cookies || {};
    const refreshTokenValue = allCookies[cookieName] || null;

    // Enhanced logging for debugging
    if (!refreshTokenValue) {
      this.logger.warn(
        `Cookie retrieval failed. Cookie name: ${cookieName}, Available cookies: ${Object.keys(allCookies).join(', ') || 'none'}, Headers: ${JSON.stringify(req.headers || {})}`,
        this.logContext
      );
      throw new BadRequestException("Token refresh execution failed: Refresh token cookie not found");
    }

    try {
      // Step1: find & gather user details
      const userDetails = await this.authService.findUserDetailsFromTokens(refreshTokenValue);

      // Validate user details
      if (!userDetails || !userDetails.id || !userDetails.username) {
        this.logger.error(
          `Invalid user details returned from token: ${JSON.stringify(userDetails)}`,
          this.logContext,
        );
        throw new BadRequestException("Invalid user data associated with token");
      }

      // Step2: generate new access token
      const privateKeyFilePath = resolve("certs/private.key"),
        privateKeyCert = await readFile(privateKeyFilePath);

      const authToken = this.jwtService.sign(
        { id: userDetails.id, username: userDetails.username },
        {
          privateKey: privateKeyCert,
          algorithm: "ES512",
          expiresIn: "5m",
        },
      );

      // Step3: Rotate refresh token (invalidate old, create new)
      const newRefreshToken = await this.authService.rotateRefreshToken(refreshTokenValue, authToken);

      // Step4: Set new refresh token cookie
      const refreshTokenExpiryDays = parseInt(
        this.configService.get<string>("REFRESH_TOKEN_EXPIRY_DAYS") || "7",
        10,
      );
      const cookieExpiry = new Date();
      cookieExpiry.setDate(cookieExpiry.getDate() + refreshTokenExpiryDays);

      // Cookie options - same as login
      const cookieOptions: any = {
        httpOnly: true,
        expires: cookieExpiry,
        path: '/',
        domain: undefined, // Don't set domain for localhost - allows cookie to work across ports
      };

      if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true;
        cookieOptions.sameSite = 'strict';
      } else {
        // For localhost development with proxy: use 'lax' with secure: false
        // Proxy makes frontend and backend appear on same origin, so 'lax' works
        cookieOptions.secure = false;
        cookieOptions.sameSite = 'lax';
      }

      (res).setCookie(cookieName, newRefreshToken, cookieOptions);

      // Log successful token renewal for debugging
      this.logger.log(
        `Token renewal successful for user ${userDetails.id}. New refresh token set in cookie.`,
        this.logContext
      );

      // Return in the same format as login endpoint (userdetails lowercase for consistency)
      const response = { authToken, userdetails: userDetails };
      this.logger.debug(
        `Token renewal response: ${JSON.stringify({ authToken: authToken.substring(0, 20) + '...', userdetails: userDetails })}`,
        this.logContext
      );
      return response;
    } catch (error) {
      this.logger.error(`Token renewal failed: ${error.message}`, this.logContext, error);
      // Provide more specific error messages
      if (error instanceof NotFoundException) {
        throw new BadRequestException(error.message || "Token refresh execution failed");
      }
      throw new BadRequestException(error.message || "Token refresh execution failed");
    }
  }

  @Post("logout")
  async logout(@Req() request: FastifyRequest, @Res({ passthrough: true }) res: FastifyReply) {
    const cookieName = this.configService.get<string>("REFRESH_TOKEN_NAME");
    const refreshTokenValue = request.cookies[cookieName] || null;

    if (refreshTokenValue) {
      // Revoke the refresh token
      await this.authService.revokeToken(refreshTokenValue);
    }

    // Clear the cookie with same options used to set it
    const clearCookieOptions: any = {
      httpOnly: true,
      path: '/',
      domain: undefined, // Don't set domain for localhost
    };
    if (process.env.NODE_ENV === 'production') {
      clearCookieOptions.secure = true;
      clearCookieOptions.sameSite = 'strict';
    } else {
      clearCookieOptions.secure = false;
      clearCookieOptions.sameSite = 'lax';
    }
    (res).clearCookie(cookieName, clearCookieOptions);

    return { message: "Logged out successfully" };
  }

  @Get("users")
  async getAllUsers() {
    try {
      const users = await this.authService.getAllUsers(); // Call the service to get users
      return { users };
    } catch (error) {
      this.logger.error("Error fetching user list", this.logContext, error);
      throw new BadRequestException("Failed to fetch user list");
    }
  }
}
