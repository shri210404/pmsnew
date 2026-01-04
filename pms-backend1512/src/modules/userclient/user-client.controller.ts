import { Controller, Post, Get, Delete, Param, Body, Put } from '@nestjs/common';
import { UserClientService } from './user-client.service'
import { CreateUserClientDto } from './dto/user-client.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from '@shared/decorators/roles.decorator';

@ApiTags('UserClient') // Swagger tag for grouping the endpoints
@Controller('user-client')
export class UserClientController {
  constructor(private readonly userClientService: UserClientService) {}

  @Roles('Admin', 'HR Manager')
  @Post()
  @ApiOperation({ summary: 'Create a user-client relation' })
  @ApiResponse({ status: 201, description: 'Relation created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid data.' })
  async create(@Body() createUserClientDto: CreateUserClientDto) {
    return this.userClientService.create(createUserClientDto);
  }

  @Roles('Admin', 'HR Manager')
  @Get()
  @ApiOperation({ summary: 'Get all user-client relations' })
  @ApiResponse({ status: 200, description: 'All relations fetched.' })
  async findAll() {
    return this.userClientService.findAll();
  }

  @Roles('Admin', 'HR Manager', 'Client Manager')
  @Get(':userId')
  @ApiOperation({ summary: 'Get a specific user-client relation' })
  @ApiResponse({ status: 200, description: 'Relation fetched successfully.' })
  @ApiResponse({ status: 404, description: 'Relation not found.' })
  async find(
    @Param('userId') userId: string,
  ) {
    return this.userClientService.getDetailsByUserId(userId);
  }
  
  @Roles('Admin', 'HR Manager', 'Client Manager')
  @Get(':userId/:clientId')
  @ApiOperation({ summary: 'Get a specific user-client relation' })
  @ApiResponse({ status: 200, description: 'Relation fetched successfully.' })
  @ApiResponse({ status: 404, description: 'Relation not found.' })
  async findOne(
    @Param('userId') userId: string,
    @Param('clientId') clientId: string,
  ) {
    return this.userClientService.findOne(userId, clientId);
  }

  @Roles('Admin', 'HR Manager')
  @Delete(':userId/:clientId')
  @ApiOperation({ summary: 'Delete a specific user-client relation' })
  @ApiResponse({ status: 200, description: 'Relation deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Relation not found.' })
  async delete(
    @Param('userId') userId: string,
    @Param('clientId') clientId: string,
  ) {
    return this.userClientService.delete(userId, clientId);
  }

  @Roles('Admin', 'HR Manager')
  @Put(':userId/:clientId')
  @ApiOperation({ summary: 'Update a user-client relation' })
  @ApiResponse({ status: 200, description: 'Relation updated successfully.' })
  @ApiResponse({ status: 404, description: 'Relation not found.' })
  async update(
    @Param('userId') userId: string,
    @Param('clientId') clientId: string,
    @Body() updateUserClientDto: CreateUserClientDto, // Taking the same DTO as input
  ) {
    return this.userClientService.update(userId, clientId, updateUserClientDto);
  }
}
