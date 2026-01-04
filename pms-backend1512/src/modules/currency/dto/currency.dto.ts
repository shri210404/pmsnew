import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCurrencyDto {
  @ApiProperty({ description: 'Name of the currency' })
  @IsString()
  @IsNotEmpty()
  currencyName: string;
}

export class UpdateCurrencyDto {
  @ApiProperty({ description: 'UUID of the currency' })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Name of the currency', required: false })
  @IsString()
  currencyName?: string;
}
