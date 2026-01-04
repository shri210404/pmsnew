import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaService } from '../util/prisma.service';
import { AppLogger } from '../util/applogger.service';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logContext = 'RolesGuard';

  constructor(
    private reflector: Reflector,
    private prismaService: PrismaService,
    private logger: AppLogger,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required roles from @Roles() decorator
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const user = request.user;

    if (!user) {
      this.logger.warn('User not found in request for role check', this.logContext);
      throw new ForbiddenException('User information not available');
    }

    // Fetch user role from database
    const userWithRole = await this.prismaService.user.findUnique({
      where: { id: user.id },
      include: {
        userRole: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!userWithRole || !userWithRole.userRole) {
      this.logger.warn(`User ${user.id} has no role assigned`, this.logContext);
      throw new ForbiddenException('User role not found');
    }

    const userRole = userWithRole.userRole.role.roleName;

    // Check if user's role matches any of the required roles
    const hasRole = requiredRoles.includes(userRole);

    if (!hasRole) {
      this.logger.warn(
        `User ${user.id} with role ${userRole} attempted to access resource requiring roles: ${requiredRoles.join(', ')}`,
        this.logContext,
      );
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    // Attach role to request for use in controllers
    request.user = {
      ...user,
      role: userRole,
    };

    return true;
  }
}



