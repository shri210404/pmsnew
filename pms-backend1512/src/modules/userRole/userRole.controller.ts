import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { UserRoleService } from './userRole.service';
import { UserRoleDto } from './dto/userRole.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Roles } from '@shared/decorators/roles.decorator';

@ApiTags('UserRoles')
@Controller('userroles')
export class UserRoleController {
  constructor(private readonly userRoleService: UserRoleService) {}

  @Roles('Admin', 'HR Manager')
  @Get()
  @ApiOperation({ summary: 'Get all user roles' })
  async getAllUserRoles() {
    return this.userRoleService.getAllUserRoles();
  }

  @Roles('Admin', 'HR Manager', 'Delivery Manager', 'Business Head')
  @Get('list')
  @ApiOperation({summary:'Get All user where role is not recriuter'})
  async getUserRoleList(){
    return this.userRoleService.getUserRoleList();
  }

  @Roles('Admin', 'HR Manager')
  @Get(':id')
  @ApiOperation({ summary: 'Get user role by ID' })
  async getUserRoleById(@Param('id') id: string) {
    return this.userRoleService.getUserRoleById(id);
  }

  @Roles('Admin', 'HR Manager')
  @Get('by-username/:username') // Specify that this route is for getting by username
  @ApiOperation({ summary: 'Get user role by username' })
  async getUserRoleByUsername(@Param('username') username: string) {
    return this.userRoleService.getUserRoleByUsername(username);
  }

  @Roles('Admin', 'HR Manager')
  @Post()
  @ApiOperation({ summary: 'Create a new user role' })
  async createUserRole(@Body() userRoleData: UserRoleDto) {
    return this.userRoleService.createUserRole(userRoleData);
  }

  @Roles('Admin', 'HR Manager')
  @Put(':id')
  @ApiOperation({ summary: 'Update a user role' })
  async updateUserRole(@Param('id') id: string, @Body() userRoleData: UserRoleDto) {
    return this.userRoleService.updateUserRole(id, userRoleData);
  }

  @Roles('Admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user role' })
  async deleteUserRole(@Param('id') id: string) {
    return this.userRoleService.deleteUserRole(id);
  }
}
