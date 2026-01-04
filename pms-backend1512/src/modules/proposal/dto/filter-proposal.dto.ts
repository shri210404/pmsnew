import { ApiProperty } from '@nestjs/swagger';

export class ProposalFilterDto {
  @ApiProperty({ description: 'The role of the user (e.g. recruiter, manager, admin)', example: 'recruiter' })
  role: string;

  @ApiProperty({ description: 'The name of the manager/TL/admin to whom the recruiter reports', example: 'manager1', required: false })
  reportsTo?: string;

  @ApiProperty({ description: 'The name of the user (recruiter)', example: 'recruiter1' })
  id: string;

  @ApiProperty({ description: 'The name of the manager/TL/admin to whom the recruiter reports', example: 'manager1', required: false })
  dateFrom?: string;

  @ApiProperty({ description: 'The name of the manager/TL/admin to whom the recruiter reports', example: 'manager1', required: false })
  dateTo?: string;

  @ApiProperty({ description: 'The name of the manager/TL/admin to whom the recruiter reports', example: 'manager1', required: false })
  isDashboard?: string;


}

