import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { FastifyRequest } from 'fastify';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { AppLogger } from '../util/applogger.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PrismaService } from '../util/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logContext = 'JwtAuthGuard';
  private readonly publicKey: Buffer;

  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private logger: AppLogger,
    private prismaService: PrismaService,
  ) {
    // Load public key once during guard initialization
    const publicKeyFilePath = resolve('certs/public.pem');
    this.publicKey = readFileSync(publicKeyFilePath);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    
    // Check if route is marked as public (handled by Public decorator)
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      this.logger.warn('No token provided in request', this.logContext);
      throw new UnauthorizedException('Authentication token is required');
    }

    try {
      // Verify and decode the JWT token with explicit public key
      const payload = await this.jwtService.verifyAsync(token, {
        publicKey: this.publicKey,
        algorithms: ['ES512'],
      });

      // Check if user account is active (account deactivation check)
      const user = await this.prismaService.user.findUnique({
        where: { id: payload.id },
        select: { id: true, username: true, status: true },
      });

      if (!user) {
        this.logger.warn(
          `Token valid but user not found: ${payload.id}`,
          this.logContext,
        );
        throw new UnauthorizedException('User account not found');
      }

      // Check if account is deactivated or locked
      if (user.status === 'INACTIVE' || user.status === 'LOCKED' || user.status === '0' || user.status === '2') {
        this.logger.warn(
          `Access denied: User ${user.username} (${user.id}) has status: ${user.status}`,
          this.logContext,
        );
        throw new UnauthorizedException('Account is deactivated or locked. Please contact administrator.');
      }

      // Attach user information to request object
      request.user = {
        id: user.id,
        username: user.username,
      };

      this.logger.debug(
        `Token validated successfully for user: ${user.username}`,
        this.logContext,
      );

      return true;
    } catch (error) {
      // Log detailed error information for debugging
      const errorDetails = {
        message: error.message,
        name: error.name,
        tokenPrefix: token?.substring(0, 20) + '...',
      };
      
      this.logger.error(
        `Token validation failed: ${JSON.stringify(errorDetails)}`,
        this.logContext,
      );
      
      // Provide more specific error message based on error type
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired. Please login again.');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token format or signature');
      } else {
        throw new UnauthorizedException('Invalid or expired token');
      }
    }
  }

  private extractTokenFromHeader(request: FastifyRequest): string | undefined {
    // FastifyRequest headers are accessed via the raw request object
    const req = request as any;
    const headers = req.headers || req.raw?.headers || {};
    
    // Fastify headers are case-insensitive, but we check both lowercase and original case
    const authHeader = 
      headers.authorization || 
      headers.Authorization ||
      headers['authorization'];
    
    if (!authHeader || typeof authHeader !== 'string') {
      this.logger.warn(
        `No Authorization header found. Available headers: ${JSON.stringify(Object.keys(headers))}`,
        this.logContext,
      );
      return undefined;
    }
    
    const [type, token] = authHeader.split(' ') ?? [];
    if (type !== 'Bearer' || !token) {
      this.logger.warn(
        `Invalid Authorization header format. Expected "Bearer <token>", got: ${type}`,
        this.logContext,
      );
      return undefined;
    }
    
    return token;
  }
}

