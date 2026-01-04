import { ApiProperty } from '@nestjs/swagger';

export class EmployeeDto {


  @ApiProperty()
  employeeId: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

}
