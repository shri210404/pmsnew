import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLanguageDto {
  @ApiProperty({ description: 'Name of the language' })
  @IsString()
  @IsNotEmpty()
  languageName: string;
}

export class UpdateLanguageDto {
  @ApiProperty({ description: 'UUID of the language' })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Name of the language', required: false })
  @IsString()
  languageName?: string;
}
