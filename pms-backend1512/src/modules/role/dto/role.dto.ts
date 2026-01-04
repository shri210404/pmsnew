import { ApiProperty } from '@nestjs/swagger';

export class RoleDto {
  

  @ApiProperty()
  roleName: string;

  @ApiProperty()
  shortRoleName: string;


}
