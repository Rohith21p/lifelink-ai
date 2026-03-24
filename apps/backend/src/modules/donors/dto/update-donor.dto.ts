import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { DonationType, DonorStatus, Gender } from '../../../common/enums';

export class UpdateDonorMedicalProfileDto {
  @ApiPropertyOptional({ example: 23.4 })
  @IsOptional()
  @IsNumber()
  bmi?: number;

  @ApiPropertyOptional({ example: 'No chronic diseases' })
  @IsOptional()
  @IsString()
  medicalConditions?: string;

  @ApiPropertyOptional({ example: 'Negative for common infections' })
  @IsOptional()
  @IsString()
  infectiousDiseaseScreening?: string;

  @ApiPropertyOptional({ example: '2026-03-01T09:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  lastScreeningDate?: string;

  @ApiPropertyOptional({ example: 'Fit for donation' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateDonorAvailabilityDto {
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ example: ['MONDAY', 'THURSDAY'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableDays?: string[];

  @ApiPropertyOptional({ example: 'Morning' })
  @IsOptional()
  @IsString()
  preferredTimeWindow?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsInt()
  @Min(0)
  travelRadiusKm?: number;
}

export class UpdateDonorPreferenceDto {
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  organDonationOptIn?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  bloodDonationOptIn?: boolean;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  maxRequestsPerMonth?: number;

  @ApiPropertyOptional({ example: ['Apollo Hospitals Navi Mumbai', 'AIIMS Delhi'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredHospitals?: string[];

  @ApiPropertyOptional({ enum: DonationType, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(DonationType, { each: true })
  supportedDonationTypes?: DonationType[];
}

export class UpdateDonorDto {
  @ApiPropertyOptional({ example: '2f93f77a-4a8e-4f67-98f0-3f4472f93430' })
  @IsOptional()
  @IsUUID()
  hospitalId?: string;

  @ApiPropertyOptional({ example: '35c2b376-4c58-45c6-b467-4fea96eb2f7e' })
  @IsOptional()
  @IsUUID()
  coordinatorId?: string;

  @ApiPropertyOptional({ example: 'DON-MUM-2001' })
  @IsOptional()
  @IsString()
  donorCode?: string;

  @ApiPropertyOptional({ example: 'Sneha Kulkarni' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 31 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120)
  age?: number;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ example: 'O+' })
  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @ApiPropertyOptional({ example: 'Pune' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Pune District' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ example: 'Maharashtra' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ enum: DonorStatus })
  @IsOptional()
  @IsEnum(DonorStatus)
  status?: DonorStatus;

  @ApiPropertyOptional({ example: '2025-11-15T09:30:00.000Z' })
  @IsOptional()
  @IsDateString()
  lastDonationDate?: string;

  @ApiPropertyOptional({ example: '2026-03-25T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  availableFrom?: string;

  @ApiPropertyOptional({ type: UpdateDonorMedicalProfileDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateDonorMedicalProfileDto)
  medicalProfile?: UpdateDonorMedicalProfileDto;

  @ApiPropertyOptional({ type: UpdateDonorAvailabilityDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateDonorAvailabilityDto)
  availability?: UpdateDonorAvailabilityDto;

  @ApiPropertyOptional({ type: UpdateDonorPreferenceDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateDonorPreferenceDto)
  preference?: UpdateDonorPreferenceDto;
}
