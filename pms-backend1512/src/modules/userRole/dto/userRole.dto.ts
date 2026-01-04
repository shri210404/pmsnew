import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UserRoleDto {

  @ApiProperty()
  username: string;

  @ApiProperty()
  @IsOptional()
  email: string;

  @ApiProperty()
  roleId: string;

  @ApiProperty()
  reportsTo: string;
}
