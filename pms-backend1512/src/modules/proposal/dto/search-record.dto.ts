import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchRecordsDto {
  @ApiPropertyOptional({ description: 'Client name to filter records' })
  client?: string;

  @ApiPropertyOptional({ description: 'Location to filter records' })
  location?: string;

  @ApiPropertyOptional({ description: 'Recruiter name to filter records' })
  recruiter?: string;

  @ApiPropertyOptional({ description: 'Start date for range filter', type: String, format: 'date' })
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'End date for range filter', type: String, format: 'date' })
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Partial match for candidate name' })
  candidateName?: string;

  @ApiPropertyOptional({ description: 'Status of the record' })
  status?: string;

  @ApiPropertyOptional({ description: 'Profile Id of the record' })
  profileId?: string;
}

export class EmailCheckDto {
  @ApiPropertyOptional({ description: 'Email of the profile' })
  email: string;
}
