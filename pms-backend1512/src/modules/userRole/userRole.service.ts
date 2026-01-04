import { Injectable } from '@nestjs/common';
import { PrismaService } from "../../shared/util/prisma.service";
import { UserRoleDto } from './dto/userRole.dto';
import { AuthService } from '@modules/auth/auth.service';

@Injectable()
export class UserRoleService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async getAllUserRoles(): Promise<UserRoleDto[]> {
    return this.prisma.userRole.findMany({ include: { role: true, managerDetails: true } });
  }

  async getUserRoleById(id: string): Promise<UserRoleDto> {
    return this.prisma.userRole.findUnique({ where: { id }, include: { role: true, managerDetails: true } });
  }

  async getUserRoleByUsername(username: string): Promise<UserRoleDto> {
    const userRoles = await this.prisma.userRole.findMany({ 
      where: { username: username }, 
      include: { role: true, managerDetails: true } 
    });
  
    if (userRoles.length === 0) {
      throw new Error(`User role not found for username: ${username}`);
    }
  
    // If only one role is expected, return the first one.
    return userRoles[0];
  }
  

  async createUserRole(data: UserRoleDto): Promise<UserRoleDto> {
    return this.prisma.userRole.create({ data });
  }

  async updateUserRole(id: string, data: UserRoleDto): Promise<UserRoleDto> {
    // Get the old role to check if roleId changed
    const oldUserRole = await this.prisma.userRole.findUnique({
      where: { id },
    });

    const updated = await this.prisma.userRole.update({
      where: { id },
      data,
    });

    // If roleId changed, revoke all tokens for users with this UserRole
    if (oldUserRole && data.roleId && oldUserRole.roleId !== data.roleId) {
      const usersWithThisRole = await this.prisma.user.findMany({
        where: { userRoleId: id },
        select: { id: true },
      });

      // Revoke tokens for all users with this role
      for (const user of usersWithThisRole) {
        await this.authService.revokeAllUserTokens(user.id);
      }
    }

    return updated;
  }

  async deleteUserRole(id: string): Promise<void> {
    await this.prisma.userRole.delete({ where: { id } });
  }

  async getUserRoleList() {
    // Query to fetch all users where role is not 'Recruiter'
    const users = await this.prisma.userRole.findMany({
      where: {
        role: {
          roleName: {
            not: 'Recruiter',
          },
        },
      },
      include: {
        role: true,
        managerDetails: true,
      },
    });
  
    return users;
  }
}



