import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsOptional } from "class-validator";

export class CreateTemplateDto {
  @ApiProperty({
    description: "Name of the template",
    example: "Software Engineer Application",
  })
  @IsNotEmpty()
  @IsString()
  templateName: string;

  @ApiProperty({
    description: "Location associated with the template",
    example: "New York",
  })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({
    description: "Client associated with the template",
    example: "Tech Corp",
  })
  @IsNotEmpty()
  @IsString()
  client: string;

  @ApiProperty({
    description: "Remarks about the template",
    example: "For senior developers only",
    required: false,
  })
  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsString()
  createdBy: string;



}
