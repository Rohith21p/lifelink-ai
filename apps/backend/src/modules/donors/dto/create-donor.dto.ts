import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class CreateDonorMedicalProfileDto {
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

  @ApiPropertyOptional({ example: 'Fit for donation after routine checks' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateDonorAvailabilityDto {
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

export class CreateDonorPreferenceDto {
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

export class CreateDonorDto {
  @ApiProperty({ example: '2f93f77a-4a8e-4f67-98f0-3f4472f93430' })
  @IsUUID()
  hospitalId!: string;

  @ApiPropertyOptional({ example: '35c2b376-4c58-45c6-b467-4fea96eb2f7e' })
  @IsOptional()
  @IsUUID()
  coordinatorId?: string;

  @ApiProperty({ example: 'DON-MUM-2001' })
  @IsString()
  donorCode!: string;

  @ApiProperty({ example: 'Sneha Kulkarni' })
  @IsString()
  fullName!: string;

  @ApiProperty({ example: 31 })
  @IsInt()
  @Min(0)
  @Max(120)
  age!: number;

  @ApiProperty({ enum: Gender })
  @IsEnum(Gender)
  gender!: Gender;

  @ApiProperty({ example: 'O+' })
  @IsString()
  bloodGroup!: string;

  @ApiProperty({ example: 'Pune' })
  @IsString()
  city!: string;

  @ApiPropertyOptional({ example: 'Pune District' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiProperty({ example: 'Maharashtra' })
  @IsString()
  state!: string;

  @ApiPropertyOptional({ enum: DonorStatus, default: DonorStatus.AVAILABLE })
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

  @ApiProperty({ type: CreateDonorMedicalProfileDto })
  @ValidateNested()
  @Type(() => CreateDonorMedicalProfileDto)
  medicalProfile!: CreateDonorMedicalProfileDto;

  @ApiProperty({ type: CreateDonorAvailabilityDto })
  @ValidateNested()
  @Type(() => CreateDonorAvailabilityDto)
  availability!: CreateDonorAvailabilityDto;

  @ApiProperty({ type: CreateDonorPreferenceDto })
  @ValidateNested()
  @Type(() => CreateDonorPreferenceDto)
  preference!: CreateDonorPreferenceDto;
}
