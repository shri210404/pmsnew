import { ApiProperty } from '@nestjs/swagger';

export class CreateProfileDto {
  @ApiProperty()
  profileId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  contact: string;

  @ApiProperty({ required: false })
  jobSkill?: string;

  @ApiProperty({ required: false })
  jobRole?: string;

  @ApiProperty()
  location: string;

  @ApiProperty({ required: false })
  readyToRelocate?: string;

  @ApiProperty()
  nationality: string;

  @ApiProperty()
  nativeLanguage: string;

  @ApiProperty()
  jobLanguage: string;

  @ApiProperty()
  languageLevel: string;

  @ApiProperty()
  noticePeriod: string;

  @ApiProperty()
  salary: string;

  @ApiProperty()
  salaryCurrency: string;

  @ApiProperty()
  profileForClient: string;

  @ApiProperty()
  profileForJobRole: string;

  @ApiProperty({ required: false })
  jobOrderId?: string;

  @ApiProperty({ required: false })
  currentCompany?: string;

  @ApiProperty({ required: false })
  education?: string;

  @ApiProperty({ required: false })
  totalYearOfExp?: string;

  @ApiProperty({ required: false })
  profileSource?: string;

  @ApiProperty({ required: false })
  profileSourceLink?: string;

  @ApiProperty({ required: false })
  availability?: string;

  @ApiProperty({ required: false, type: String, format: 'date-time' })
  availabilityDate?: Date;

  @ApiProperty({ required: false })
  recruiterNotes?: string;

  @ApiProperty({ required: false })
  resume?: string;

  @ApiProperty({ required: false, type: String, format: 'date-time' })
  submissionDate?: Date;

  @ApiProperty({ required: false })
  submittedBy?: string;

  @ApiProperty({ required: false, type: String, format: 'date-time' })
  lastUpdate?: Date;

  @ApiProperty({ required: false })
  profileStory?: string;

  @ApiProperty({ required: false })
  createdById?: string;

  @ApiProperty({required:false})
  status?:string
}
