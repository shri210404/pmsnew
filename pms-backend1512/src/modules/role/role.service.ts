import { Injectable } from '@nestjs/common';
import { PrismaService } from "../../shared/util/prisma.service";
import { RoleDto } from './dto/role.dto';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async getAllRoles(): Promise<RoleDto[]> {
    return this.prisma.role.findMany();
  }

  async getRoleById(id: string): Promise<RoleDto> {
    return this.prisma.role.findUnique({ where: { id } });
  }

  async createRole(data: RoleDto): Promise<RoleDto> {
    return this.prisma.role.create({ data });
  }

  async updateRole(id: string, data: RoleDto): Promise<RoleDto> {
    return this.prisma.role.update({
      where: { id },
      data,
    });
  }

  async deleteRole(id: string): Promise<void> {
    await this.prisma.role.delete({ where: { id } });
  }
}
