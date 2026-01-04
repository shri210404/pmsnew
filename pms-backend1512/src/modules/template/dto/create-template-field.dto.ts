import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateTemplateFieldDto {
  @ApiProperty({
    description: "The name of the dynamic field",
    example: "Name",
  })
  @IsString()
  fieldName: string;

  @ApiProperty({
    description: "The type of the dynamic field",
    example: "Text",
  })
  @IsString()
  fieldType: string;

  @ApiProperty({
    description: "The form control name of dynamic field",
    example: "name",
  })

  
  @IsString()
  formControlName: string;
}
