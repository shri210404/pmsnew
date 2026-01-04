import { ApiProperty } from "@nestjs/swagger";
import { CreateTemplateFieldDto } from "./create-template-field.dto";
import { IsString, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class CreateTemplateWithFieldsDto {
  @ApiProperty({
    description: "The name of the template",
    example: "Job Application Template",
  })
  @IsString()
  templateName: string;

  @ApiProperty({
    description: "Location associated with the template",
    example: "New York",
  })
  @IsString()
  location: string;

  @ApiProperty({
    description: "Client name associated with the template",
    example: "ABC Corp",
  })
  @IsString()
  client: string;
  

  @ApiProperty({
    description: "Additional remarks for the template",
    example: "This template is for senior-level positions.",
  })
  @IsString()
  remarks?: string;

  @ApiProperty({
    description: "Name of User By Template Created ",
    example: "User@mps.com"
  })
  @IsString()
  createdBy: string;

  @ApiProperty({
    description: "List of dynamic fields",
    type: [CreateTemplateFieldDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTemplateFieldDto)
  fields: CreateTemplateFieldDto[];
}
