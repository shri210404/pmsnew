import { Injectable } from '@nestjs/common';
import { PrismaService } from "../../shared/util/prisma.service";
import { EmployeeDto } from './dto/create-employye.dto';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

  async getAllEmployees(): Promise<EmployeeDto[]> {
    return this.prisma.employee.findMany();
  }

  async getEmployeeById(id: string): Promise<EmployeeDto> {
    return this.prisma.employee.findUnique({ where: { id } });
  }

  async createEmployee(data: EmployeeDto): Promise<EmployeeDto> {
    return this.prisma.employee.create({ data });
  }

  async updateEmployee(id: string, data: EmployeeDto): Promise<EmployeeDto> {
    return this.prisma.employee.update({
      where: { id },
      data,
    });
  }

  async deleteEmployee(id: string): Promise<void> {
    await this.prisma.employee.delete({ where: { id } });
  }
}
