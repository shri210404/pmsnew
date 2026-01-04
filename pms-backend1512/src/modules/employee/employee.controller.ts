import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeDto } from './dto/create-employye.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Roles } from '@shared/decorators/roles.decorator';

@ApiTags('Employees')
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Roles('Admin', 'HR Manager', 'Finance Manager')
  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  async getAllEmployees() {
    return this.employeeService.getAllEmployees();
  }

  @Roles('Admin', 'HR Manager', 'Finance Manager')
  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  async getEmployeeById(@Param('id') id: string) {
    return this.employeeService.getEmployeeById(id);
  }

  @Roles('Admin', 'HR Manager')
  @Post()
  @ApiOperation({ summary: 'Create a new employee' })
  async createEmployee(@Body() employeeData: EmployeeDto) {
    return this.employeeService.createEmployee(employeeData);
  }

  @Roles('Admin', 'HR Manager')
  @Put(':id')
  @ApiOperation({ summary: 'Update an employee' })
  async updateEmployee(@Param('id') id: string, @Body() employeeData: EmployeeDto) {
    return this.employeeService.updateEmployee(id, employeeData);
  }

  @Roles('Admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an employee' })
  async deleteEmployee(@Param('id') id: string) {
    return this.employeeService.deleteEmployee(id);
  }
}
