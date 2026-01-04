import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@shared/util/prisma.service';
import { AppLogger } from './applogger.service';

/**
 * Helper function to check if a user can access a resource
 * @param userId - The ID of the user requesting access
 * @param resourceId - The ID of the resource being accessed
 * @param action - The action being performed ('view', 'edit', 'delete')
 * @param resourceType - The type of resource ('proposal', 'job-order', 'report')
 * @param prismaService - Prisma service instance
 * @param logger - Logger service instance
 * @returns Promise<boolean> - True if user can access, throws ForbiddenException if not
 */
@Injectable()
export class ResourceAuthorizationHelper {
  private readonly logContext = 'ResourceAuthorizationHelper';

  constructor(
    private prismaService: PrismaService,
    private logger: AppLogger,
  ) {}

  /**
   * Check if user can access a resource based on ownership and role
   */
  async canUserAccessResource(
    userId: string,
    resourceId: string,
    action: 'view' | 'edit' | 'delete',
    resourceType: 'proposal' | 'job-order' | 'report',
  ): Promise<boolean> {
    // Get user with role information
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        userRole: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || !user.userRole) {
      this.logger.warn(
        `User ${userId} not found or has no role assigned`,
        this.logContext,
      );
      throw new ForbiddenException('User information not available');
    }

    const userRole = user.userRole.role.roleName;

    // Admin, HR Manager, and Finance Manager can access all resources
    const privilegedRoles = ['Admin', 'HR Manager', 'Finance Manager'];
    if (privilegedRoles.includes(userRole)) {
      this.logger.debug(
        `User ${userId} with role ${userRole} granted access to ${resourceType} ${resourceId}`,
        this.logContext,
      );
      return true;
    }

    // Check resource ownership based on type
    let resourceOwnerId: string | null = null;

    switch (resourceType) {
      case 'proposal':
        const proposal = await this.prismaService.proposal.findUnique({
          where: { id: resourceId },
          select: { createdById: true },
        });
        resourceOwnerId = proposal?.createdById || null;
        break;

      case 'job-order':
        const jobOrder = await this.prismaService.jobOrder.findUnique({
          where: { id: resourceId },
          select: { createdById: true },
        });
        resourceOwnerId = jobOrder?.createdById || null;
        break;

      case 'report':
        // Reports are typically filtered by createdBy in the service layer
        // This is a placeholder for future implementation
        return true;

      default:
        this.logger.warn(
          `Unknown resource type: ${resourceType}`,
          this.logContext,
        );
        throw new ForbiddenException('Invalid resource type');
    }

    if (!resourceOwnerId) {
      this.logger.warn(
        `Resource ${resourceId} of type ${resourceType} not found`,
        this.logContext,
      );
      throw new ForbiddenException('Resource not found');
    }

    // Check if user is the owner
    if (resourceOwnerId === userId) {
      this.logger.debug(
        `User ${userId} granted access to own ${resourceType} ${resourceId}`,
        this.logContext,
      );
      return true;
    }

    // For managers, check if they can access resources of their team members
    const managerRoles = ['Delivery Manager', 'Business Head', 'Client Manager'];
    if (managerRoles.includes(userRole)) {
      // Check if the resource owner reports to this manager
      // reportsTo is stored in UserRole, not User
      const resourceOwner = await this.prismaService.user.findUnique({
        where: { id: resourceOwnerId },
        include: {
          userRole: {
            select: {
              reportsTo: true,
            },
          },
        },
      });

      // Check if resource owner's reportsTo matches the manager's user ID
      // Note: reportsTo in UserRole references Employee.id, but in practice it may store User.id
      if (resourceOwner?.userRole?.reportsTo === userId) {
        this.logger.debug(
          `User ${userId} (${userRole}) granted access to ${resourceType} ${resourceId} owned by team member`,
          this.logContext,
        );
        return true;
      }
    }

    // Access denied
    this.logger.warn(
      `User ${userId} with role ${userRole} denied ${action} access to ${resourceType} ${resourceId} (owner: ${resourceOwnerId})`,
      this.logContext,
    );
    throw new ForbiddenException(
      `You do not have permission to ${action} this ${resourceType}`,
    );
  }
}

