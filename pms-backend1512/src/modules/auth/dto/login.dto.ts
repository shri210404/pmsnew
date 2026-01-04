import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class LoginDto {
  @ApiProperty({ description: "username" })
  @IsString()
  username: string;

  @ApiProperty({ description: "user password" })
  @IsString()
  secret: string;
}
