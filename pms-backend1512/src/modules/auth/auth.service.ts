import { randomBytes } from "crypto";

import { HttpException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcryptjs";

import { AppLogger } from "@shared/util/applogger.service";
import { PrismaService } from "@shared/util/prisma.service";
import { NodeEmailService } from "@shared/util/sendgridService";

import { RegistrationDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { UserRoleDto } from "@modules/userRole/dto/userRole.dto";

@Injectable()
export class AuthService {
  private logContext = "AuthService";
  constructor(
    private readonly prismaService: PrismaService,
    private readonly config: ConfigService,
    private readonly logger: AppLogger,
    private readonly emailService: NodeEmailService
  ) {}

  private generateRefreshToken(): string {
    let tokenLength = +this.config.get<string>("REFRESH_TOKEN_LENGTH");

    // Handling odd length values.
    if (tokenLength % 2 !== 0) {
      tokenLength++;

      // Max length 32 is allowed.
      tokenLength = tokenLength > 32 ? 32 : tokenLength;
    }

    return randomBytes(tokenLength / 2).toString("hex");
  }

  async registerUser(userRegistrationDto: RegistrationDto) {
    const now = new Date();

    const hashLength = +this.config.get<string>("PASSWORD_HASH_LENGTH");
    const pwdHash = await bcrypt.hash(userRegistrationDto.password, hashLength);

    const userRoleResponse = await this.getUserRoleByUsername(userRegistrationDto.username);
    
    const createdUserResponse = await this.prismaService.user
      .create({
        data: {
          username: userRegistrationDto.username,
          firstName: userRegistrationDto.firstName,
          lastName:userRegistrationDto.lastName,
          email: userRegistrationDto.email,
          password: pwdHash,
          userRoleId:userRoleResponse['id'],
          status: 'ACTIVE',
          createdAt: now,
          updatedAt: now,
        },
      })
      .catch(() => null);

    if (createdUserResponse) {
      this.logger.log(`New user created with given credentials, id: ${createdUserResponse.id}`, this.logContext);
      return {
        id: createdUserResponse.id,
        username: createdUserResponse.username,
        name: createdUserResponse.firstName + " " + createdUserResponse.lastName,
      };
    } else {
      this.logger.error("Failed to save user data for new user", this.logContext);
      throw new HttpException("Record could not be created", 403);
    }
  }

  // async userLogin(loginDto: LoginDto) {
  //   const { username, secret } = loginDto;

  //   const user = await this.prismaService.user.findUnique({
  //     where: { 'email':username },
  //     include:{
  //       userRole:{
  //         include:{
  //           role:true,
  //         }
  //       }
        
  //     }
  //   });
    

  //   if (!user) {
  //     this.logger.error(`user : ${username} - login attempt failed, user not available !!`, this.logContext);

  //     throw new NotFoundException("Provided credential does not match !!");
  //   } else {
  //     if (bcrypt.compareSync(secret, user.password)) {
  //       this.logger.log(`user : ${username} - login attempt succeded !!`, this.logContext);
  //       return {
  //         id: user.id,
  //         name: user.firstName,
  //         username: user.username,
  //         role:user.userRole.role.roleName
  //       };
  //     } else {
  //       this.logger.warn(`user : ${username} - login attempt failed, password mismatch !!`, this.logContext);
  //       throw new NotFoundException("Provided credential does not match !!");
  //     }
  //   }
  // }

  async userLogin(loginDto: LoginDto) {
    const { username, secret } = loginDto;
  
    const user = await this.prismaService.user.findUnique({
      where: { email: username },
      include: {
        userRole: {
          include: {
            role: true,
          },
        },
      },
    });
  
    if (!user) {
      this.logger.error(`user: ${username} - login attempt failed, user not available !!`, this.logContext);
      throw new NotFoundException("Provided credential does not match !!");
    }
  
    const isPasswordValid = bcrypt.compareSync(secret, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`user: ${username} - login attempt failed, password mismatch !!`, this.logContext);
      throw new NotFoundException("Provided credential does not match !!");
    }
  
    // ✅ Update lastLogin timestamp
    await this.prismaService.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });
  
    this.logger.log(`user: ${username} - login attempt succeeded !!`, this.logContext);
  
    return {
      id: user.id,
      name: user.firstName,
      username: user.username,
      role: user.userRole.role.roleName,
    };
  }
  

   async getUserRoleByUsername(username: string): Promise<UserRoleDto> {
      const userRoles = await this.prismaService.userRole.findMany({ 
        where: { username: username }, 
        include: { role: true, managerDetails: true } 
      });
    
      if (userRoles.length === 0) {
        throw new Error(`User role not found for username: ${username}`);
      }
    
      // If only one role is expected, return the first one.
      return userRoles[0];
    }

    async changePassword(payload:any) {
      const now = new Date();
    
      // Check if the email is registered
      const user = await this.prismaService.user.findUnique({
        where: { username: payload.email },
      });
    
      if (!user) {
        this.logger.error(`Email not found: ${payload.email}`, this.logContext);
        throw new HttpException("Email not found. Please register first.", 404);
      }
    
      // Hash the new password
      const hashLength = +this.config.get<string>("PASSWORD_HASH_LENGTH");
      const newPwdHash = await bcrypt.hash(payload.newPassword, hashLength);
    
      // Update the password
      const updatedUser = await this.prismaService.user
        .update({
          where: { username: payload.email },
          data: {
            password: newPwdHash,
            updatedAt: now,
          },
        })
        .catch(() => null);
    
      if (updatedUser) {
        // Revoke all existing tokens for security (user must login again)
        await this.revokeAllUserTokens(updatedUser.id);
        this.logger.log(`Password updated and all tokens revoked for user ID: ${updatedUser.id}`, this.logContext);
        return { message: "Password updated successfully. Please login again." };
      } else {
        this.logger.error(`Failed to update password for email: ${payload.email}`, this.logContext);
        throw new HttpException("Password update failed. Try again later.", 500);
      }
    }
    

  async findUserDetailsFromId(id:string){
    const userDetails = await this.prismaService.user.findUnique({
      where:{'id':id}
    })
    return await this.prismaService.userRole.findUnique({
      where:{id:userDetails['userRoleId']}
    })
  }

  async registerToken(token: string, user_id: string, parentTokenId?: string) {
    const refreshtoken = this.generateRefreshToken();
    const tokenRecord = await this.prismaService.token.create({ 
      data: { 
        accesstoken: token, 
        user_id, 
        refreshtoken,
        parentTokenId: parentTokenId || null,
        isRevoked: false,
      } 
    });
    return tokenRecord.refreshtoken;
  }

  async findUserDetailsFromTokens(refreshtoken: string) {
    const record = await this.prismaService.token
      .findFirst({
        where: { refreshtoken },
      })
      .catch(() => null);

    if (!record) {
      this.logger.warn(
        `Token not found: ${refreshtoken.substring(0, 8)}...`,
        this.logContext,
      );
      throw new NotFoundException("Invalid or tampered token provided");
    }

    // Check if token is revoked (token reuse detection)
    if (record.isRevoked) {
      // This is a security breach - someone is trying to use a revoked token
      this.logger.error(
        `SECURITY ALERT: Attempted use of revoked token ${refreshtoken.substring(0, 8)}... for user ${record.user_id}. Possible token theft or replay attack.`,
        this.logContext,
      );
      
      // Revoke all tokens in the token family (parent and all children)
      if (record.parentTokenId) {
        await this.revokeTokenFamily(record.parentTokenId);
      }
      await this.revokeAllUserTokens(record.user_id);
      
      throw new NotFoundException("Token has been revoked. Please login again.");
    }

    // Check token expiry based on createdAt and REFRESH_TOKEN_EXPIRY_DAYS
    const refreshTokenExpiryDays = parseInt(
      this.config.get<string>("REFRESH_TOKEN_EXPIRY_DAYS") || "7",
      10,
    );
    const tokenAge = Date.now() - new Date(record.createdAt).getTime();
    const maxAge = refreshTokenExpiryDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds

    if (tokenAge > maxAge) {
      this.logger.warn(
        `Token expired: ${refreshtoken.substring(0, 8)}... Age: ${Math.round(tokenAge / (24 * 60 * 60 * 1000))} days, Max: ${refreshTokenExpiryDays} days`,
        this.logContext,
      );
      throw new NotFoundException("Token has expired. Please login again.");
    }

    // Fetch user with role information
    const user = await this.prismaService.user.findFirst({
      where: { id: record.user_id },
      include: {
        userRole: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      this.logger.error(
        `User not found for token. Token user_id: ${record.user_id}`,
        this.logContext,
      );
      throw new NotFoundException("User associated with token not found");
    }

    if (!user.userRole || !user.userRole.role) {
      this.logger.error(
        `User role not found for user ${user.id}`,
        this.logContext,
      );
      throw new NotFoundException("User role not found");
    }

    // Return user details in the same format as login
    return {
      id: user.id,
      name: user.firstName,
      username: user.username,
      role: user.userRole.role.roleName,
    };
  }

  /**
   * Revoke entire token family (parent and all children) - used when token reuse is detected
   */
  private async revokeTokenFamily(parentTokenId: string): Promise<void> {
    try {
      // Revoke parent token
      await this.prismaService.token.updateMany({
        where: { id: parentTokenId },
        data: { isRevoked: true, revokedAt: new Date() },
      });

      // Revoke all child tokens
      await this.prismaService.token.updateMany({
        where: { parentTokenId },
        data: { isRevoked: true, revokedAt: new Date() },
      });

      this.logger.warn(
        `Revoked entire token family starting from ${parentTokenId}`,
        this.logContext,
      );
    } catch (error) {
      this.logger.error(
        `Failed to revoke token family: ${error.message}`,
        this.logContext,
      );
    }
  }

  /**
   * Revoke a refresh token (mark as revoked instead of deleting for reuse detection)
   */
  async revokeToken(refreshtoken: string): Promise<boolean> {
    try {
      const result = await this.prismaService.token.updateMany({
        where: { 
          refreshtoken,
          isRevoked: false, // Only revoke if not already revoked
        },
        data: {
          isRevoked: true,
          revokedAt: new Date(),
        },
      });
      
      if (result.count > 0) {
        this.logger.log(`Token revoked: ${refreshtoken.substring(0, 8)}...`, this.logContext);
      }
      
      return result.count > 0;
    } catch (error) {
      this.logger.error(`Failed to revoke token: ${error.message}`, this.logContext);
      return false;
    }
  }

  /**
   * Revoke all tokens for a user (e.g., on password change, role change, account deactivation)
   */
  async revokeAllUserTokens(userId: string): Promise<number> {
    try {
      const result = await this.prismaService.token.updateMany({
        where: { 
          user_id: userId,
          isRevoked: false, // Only revoke active tokens
        },
        data: {
          isRevoked: true,
          revokedAt: new Date(),
        },
      });
      this.logger.log(`Revoked ${result.count} tokens for user ${userId}`, this.logContext);
      return result.count;
    } catch (error) {
      this.logger.error(`Failed to revoke all tokens for user ${userId}: ${error.message}`, this.logContext);
      return 0;
    }
  }

  /**
   * Revoke tokens when user account status changes to INACTIVE or LOCKED
   * This should be called whenever user status is updated to INACTIVE or LOCKED
   */
  async revokeTokensOnAccountDeactivation(userId: string, newStatus: string): Promise<void> {
    const inactiveStatuses = ['INACTIVE', 'LOCKED', '0', '2'];
    
    if (inactiveStatuses.includes(newStatus)) {
      const revokedCount = await this.revokeAllUserTokens(userId);
      this.logger.log(
        `Account deactivation detected for user ${userId}. Revoked ${revokedCount} active tokens.`,
        this.logContext,
      );
    }
  }

  /**
   * Rotate refresh token: invalidate old token and create new one
   * Returns new refresh token
   * Implements token family tracking for security
   */
  async rotateRefreshToken(oldRefreshToken: string, newAccessToken: string): Promise<string> {
    // Find the old token record
    const oldTokenRecord = await this.prismaService.token.findFirst({
      where: { refreshtoken: oldRefreshToken },
    });

    if (!oldTokenRecord) {
      throw new NotFoundException("Invalid refresh token");
    }

    // Check if token is already revoked (reuse detection)
    if (oldTokenRecord.isRevoked) {
      this.logger.error(
        `SECURITY ALERT: Attempted rotation of revoked token ${oldRefreshToken.substring(0, 8)}... for user ${oldTokenRecord.user_id}`,
        this.logContext,
      );
      
      // Revoke entire token family
      if (oldTokenRecord.parentTokenId) {
        await this.revokeTokenFamily(oldTokenRecord.parentTokenId);
      }
      await this.revokeAllUserTokens(oldTokenRecord.user_id);
      
      throw new NotFoundException("Token has been revoked. Please login again.");
    }

    // Mark old token as revoked (don't delete - keep for audit and reuse detection)
    await this.prismaService.token.update({
      where: { id: oldTokenRecord.id },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
      },
    });

    // Generate new refresh token with parent reference (token family tracking)
    const parentTokenId = oldTokenRecord.parentTokenId || oldTokenRecord.id;
    const newRefreshToken = await this.registerToken(
      newAccessToken,
      oldTokenRecord.user_id,
      parentTokenId, // Track token family
    );

    this.logger.log(
      `Token rotated for user ${oldTokenRecord.user_id} (family: ${parentTokenId})`,
      this.logContext,
    );

    return newRefreshToken;
  }

  async getAllUsers() {
    // Replace with actual logic to fetch users, e.g., using a database query.
    return await this.prismaService.user.findMany(); // Assuming `userRepository` is used for DB operations
  }

  async forgotPassword(emailOrUsername: string) {
    // Check if user exists by email
    let user = await this.prismaService.user.findUnique({
      where: { email: emailOrUsername },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
      },
    });

    // If not found by email, check by username
    if (!user) {
      user = await this.prismaService.user.findUnique({
        where: { username: emailOrUsername },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
        },
      });
    }

    // If user not found, return error message
    if (!user) {
      this.logger.warn(`Password reset requested for non-existent user: ${emailOrUsername}`, this.logContext);
      throw new HttpException("No account found with the provided email/username.", 404);
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token expires in 1 hour

    // Store reset token in database
    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetToken,
        resetTokenExpiry: resetTokenExpiry,
      },
    });

    // Generate reset link (frontend URL)
    const frontendUrl = this.config.get<string>("FRONTEND_URL");
    if (!frontendUrl) {
      this.logger.error("FRONTEND_URL environment variable is not set", this.logContext);
      throw new HttpException("Frontend URL configuration is missing", 500);
    }
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    // Create email body
    const emailSubject = "Password Reset Request";
    const emailBody = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4CAF50;">Password Reset Request</h2>
            <p>Hello ${user.firstName} ${user.lastName},</p>
            <p>You have requested to reset your password. Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #4CAF50; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetLink}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you did not request a password reset, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #999;">This is an automated message, please do not reply.</p>
          </div>
        </body>
      </html>
    `;

    try {
      // Send email only if user exists
      await this.emailService.sendEmail(
        "PMS System",
        user.email,
        emailSubject,
        emailBody
      );

      this.logger.log(`Password reset email sent to: ${user.email}`, this.logContext);
      
      return {
        message: "Password reset link has been sent to your email address.",
      };
    } catch (error) {
      this.logger.error(`Failed to send password reset email to: ${user.email}`, this.logContext, error);
      throw new HttpException("Failed to send password reset email. Please try again later.", 500);
    }
  }

  async resetPassword(token: string, newPassword: string) {
    const now = new Date();

    // Find user by reset token
    const user = await this.prismaService.user.findFirst({
      where: {
        resetToken: token,
      },
      select: {
        id: true,
        email: true,
        resetToken: true,
        resetTokenExpiry: true,
      },
    });

    if (!user) {
      this.logger.error(`Invalid reset token provided`, this.logContext);
      throw new HttpException("Invalid or expired reset token", 400);
    }

    // Check if token is expired
    if (!user.resetTokenExpiry || user.resetTokenExpiry < now) {
      this.logger.error(`Expired reset token for user: ${user.email}`, this.logContext);
      throw new HttpException("Reset token has expired. Please request a new password reset.", 400);
    }

    // Hash the new password
    const hashLength = +this.config.get<string>("PASSWORD_HASH_LENGTH");
    const newPwdHash = await bcrypt.hash(newPassword, hashLength);

    // Update the password and clear reset token
    const updatedUser = await this.prismaService.user
      .update({
        where: { id: user.id },
        data: {
          password: newPwdHash,
          resetToken: null,
          resetTokenExpiry: null,
          updatedAt: now,
        },
      })
      .catch(() => null);

    if (updatedUser) {
      this.logger.log(`Password reset successfully for user ID: ${updatedUser.id}`, this.logContext);
      return { message: "Password reset successfully" };
    } else {
      this.logger.error(`Failed to reset password for user: ${user.email}`, this.logContext);
      throw new HttpException("Password reset failed. Try again later.", 500);
    }
  }
}
