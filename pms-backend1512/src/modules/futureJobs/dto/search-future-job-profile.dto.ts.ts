// src/futurejobs/dto/search-future-job-profile.dto.ts
import { IsOptional, IsString, IsBoolean, IsDateString } from 'class-validator';

export class SearchFutureJobProfileDto {
  @IsOptional()
  @IsString()
  profileId?: string;

  @IsOptional()
  @IsDateString()
  resumeSubmissionFrom?: string;

  @IsOptional()
  @IsDateString()
  resumeSubmissionTo?: string;

  @IsOptional()
  @IsString()
  currentJobRole?: string;

  @IsOptional()
  @IsString()
  profileForClient?: string;

  @IsOptional()
  @IsDateString()
  availabilityFrom?: string;

  @IsOptional()
  @IsDateString()
  availabilityTo?: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsBoolean()
  readyToRelocate?: boolean;

  @IsOptional()
  @IsString()
  currentLocation?: string;

  @IsOptional()
  @IsString()
  nativeLanguage?: string;

  @IsOptional()
  @IsString()
  jobLanguage?: string;

  @IsOptional()
  @IsString()
  submittedBy?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  reportsTo?: string;

  @IsOptional()
  @IsString()
  id?: string;
}
