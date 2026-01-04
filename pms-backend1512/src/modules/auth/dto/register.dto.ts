import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength } from "class-validator";

export class RegistrationDto {
  @ApiProperty({
    description: "username",
  })
  @IsString()
  @MaxLength(12)
  @MinLength(6)
  username: string;

  @ApiProperty({
    description: "first name of the user",
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: "last name of the user",
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: "email-id of the user",
  })
  @IsString()
  @MaxLength(128)
  @MinLength(12)
  email: string;

  @ApiProperty({
    description: "user password",
  })
  @IsString()
  password: string;
}
