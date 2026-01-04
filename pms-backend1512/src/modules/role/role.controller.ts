import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleDto } from './dto/role.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Roles } from '@shared/decorators/roles.decorator';

@ApiTags('Roles')
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Roles('Admin', 'HR Manager')
  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  async getAllRoles() {
    return this.roleService.getAllRoles();
  }

  @Roles('Admin', 'HR Manager')
  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID' })
  async getRoleById(@Param('id') id: string) {
    return this.roleService.getRoleById(id);
  }

  @Roles('Admin')
  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  async createRole(@Body() roleData: RoleDto) {
    return this.roleService.createRole(roleData);
  }

  @Roles('Admin')
  @Put(':id')
  @ApiOperation({ summary: 'Update a role' })
  async updateRole(@Param('id') id: string, @Body() roleData: RoleDto) {
    return this.roleService.updateRole(id, roleData);
  }

  @Roles('Admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a role' })
  async deleteRole(@Param('id') id: string) {
    return this.roleService.deleteRole(id);
  }
}
