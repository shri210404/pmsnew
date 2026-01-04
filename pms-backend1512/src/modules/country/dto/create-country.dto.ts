import { ApiProperty } from "@nestjs/swagger";

export class CreateCountryDto {
  @ApiProperty({ description: "The name of the country" })
  countryName: string;
}
