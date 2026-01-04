import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsEmail, IsNumber, IsOptional, IsString, IsNotEmpty } from "class-validator";
import { ProposalStatus } from '@prisma/client';

export class CreateProposalDto {

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  profileId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  remarks?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  candidateName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  roleApplied: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  nationality?: string;

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  contact?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  noticePeriod?: string;

  @ApiProperty({ required: false, type: "string", format: "date" })
  @IsDateString()
  @IsOptional()
  passportValidity?: Date;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  currentSalary?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  primarySkills?: string;

  @ApiProperty({ enum: ProposalStatus, description: 'Status of the proposal' })
  @IsEnum(ProposalStatus)
  @IsNotEmpty()
  submittedStatus: ProposalStatus;

  @ApiProperty({ type: "string", format: "binary", required: false })
  @IsOptional()
  file?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  createdBy: string; // User ID (foreign key)

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  attachment?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  proposedTo?: string;

  // Newly added fields
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  currentLocation?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  university?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  educationLevel?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  visaType?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  interviewAvailable?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  totalYearsExperience?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  relevantYearsExperience?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  reasonForJobChange?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  passport?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  currentJobDetails?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  jobLanguage?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  proficiency?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  proficiencyEnglish?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  nativeLanguage?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  billingCurrency?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  billingNo?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  invoiceDate?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  invoiceNo?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  joiningDate?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  rejection_dropped_Date?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  salaryCurrency?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  selectionDate?: string;


  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  previousStatus?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  jobOrderId?: string;
}


export class UsernameDto {
  @ApiProperty({ description: 'Username of the recruiter' })
  username: string;

  @ApiProperty({ description: 'Role name of the recruiter' })  // Add @ApiProperty here for roleName
  roleName: string;
}
