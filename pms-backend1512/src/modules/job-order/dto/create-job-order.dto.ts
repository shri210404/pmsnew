import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, IsInt, IsDateString, Min } from "class-validator";

export class CreateJobOrderDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  jobId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  clientType: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  jobTitle: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  jobDescriptionSummary: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  workLocationCountry: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  remoteHybridOnsite: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  jobStartDate: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  jobEndDate: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  contractType: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  numberOfPositions: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  requiredSkills?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  yearsOfExperience?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  minEducationalQualification?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  salaryCtcRange: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  shift?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  shiftTiming?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  languageRequirement?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  languageProficiencyLevel?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  nationalityPreference?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  visaWorkPermitProvided?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  clientSpocName: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  internalRecruiterAssigned?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  remarksNotes?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  detailedJdAttachment?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  jobOwner: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  deliveryLead: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  createdBy: string;
}

