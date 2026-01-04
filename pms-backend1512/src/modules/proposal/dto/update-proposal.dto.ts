import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsEmail, IsNumber, IsOptional, IsString, IsNotEmpty } from "class-validator";
import { ProposalStatus } from '@prisma/client';

export class UpdateProposalDto {

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  profielId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  candidateName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  roleApplied?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  @IsString()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(ProposalStatus)
  submittedStatus?: ProposalStatus; 

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  contact?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  noticePeriod?: string;

  @ApiProperty({ required: false, type: "string", format: "date-time" })
  @IsOptional()
  @IsDateString()
  passportValidity?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  currentSalary?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  primarySkills?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  attachment?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiProperty({ type: "string", format: "binary", required: false })
  @IsOptional()
  file?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  proposedTo?: string;

  // Newly added fields
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  currentLocation?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  university?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  educationLevel?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  visaType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  interviewAvailable?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  totalYearsExperience?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  relevantYearsExperience?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reasonForJobChange?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  passport?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  currentJobDetails?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  jobLanguage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  proficiency?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  proficiencyEnglish?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
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
  salaryCurrency?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  selectionDate?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  updatedBy?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  jobOrderId?: string;
}
