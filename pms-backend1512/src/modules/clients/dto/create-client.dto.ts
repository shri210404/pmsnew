import { ApiProperty } from "@nestjs/swagger";

export class CreateClientDto {
  @ApiProperty({ description: "The name of the client" })
  clientName: string;

  @ApiProperty({ description: "The name of the client manager" })
  clientManager: string;
}
