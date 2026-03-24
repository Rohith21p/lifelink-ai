import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
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
import { CaseStatus, Gender, OrganType, UrgencyLevel } from '../../../common/enums';

export class CreatePatientMedicalProfileDto {
  @ApiProperty({ example: 'End-stage renal disease' })
  @IsString()
  primaryDiagnosis!: string;

  @ApiPropertyOptional({ example: 'Type 2 diabetes, hypertension' })
  @IsOptional()
  @IsString()
  comorbidities?: string;

  @ApiPropertyOptional({ example: 168 })
  @IsOptional()
  @IsNumber()
  heightCm?: number;

  @ApiPropertyOptional({ example: 71 })
  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @ApiPropertyOptional({ example: 'Penicillin' })
  @IsOptional()
  @IsString()
  allergies?: string;

  @ApiPropertyOptional({ example: 'Tacrolimus, Prednisone' })
  @IsOptional()
  @IsString()
  currentMedication?: string;

  @ApiPropertyOptional({ example: '2026-03-20T10:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  lastAssessmentDate?: string;
}

export class CreatePatientRequestDto {
  @ApiProperty({ enum: OrganType })
  @IsEnum(OrganType)
  organType!: OrganType;

  @ApiPropertyOptional({ example: '2026-03-22T09:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  requestedOn?: string;

  @ApiPropertyOptional({ example: '2026-04-10T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  requiredBy?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  hospitalPriority?: number;

  @ApiPropertyOptional({ example: 'Crossmatch pending from external lab' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreatePatientGuardianDto {
  @ApiProperty({ example: 'Asha Sharma' })
  @IsString()
  fullName!: string;

  @ApiProperty({ example: 'Spouse' })
  @IsString()
  relation!: string;

  @ApiProperty({ example: '+91-9876543210' })
  @IsString()
  phone!: string;

  @ApiPropertyOptional({ example: 'asha.sharma@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class CreatePatientDto {
  @ApiProperty({ example: '2f93f77a-4a8e-4f67-98f0-3f4472f93430' })
  @IsUUID()
  hospitalId!: string;

  @ApiPropertyOptional({ example: '35c2b376-4c58-45c6-b467-4fea96eb2f7e' })
  @IsOptional()
  @IsUUID()
  coordinatorId?: string;

  @ApiProperty({ example: 'UHID-MUM-1001' })
  @IsString()
  uhid!: string;

  @ApiProperty({ example: 'Rahul Sharma' })
  @IsString()
  fullName!: string;

  @ApiProperty({ example: 42 })
  @IsInt()
  @Min(0)
  @Max(120)
  age!: number;

  @ApiProperty({ enum: Gender })
  @IsEnum(Gender)
  gender!: Gender;

  @ApiProperty({ example: 'B+' })
  @IsString()
  bloodGroup!: string;

  @ApiProperty({ example: 'Mumbai' })
  @IsString()
  city!: string;

  @ApiPropertyOptional({ example: 'Mumbai Suburban' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiProperty({ example: 'Maharashtra' })
  @IsString()
  state!: string;

  @ApiProperty({ enum: OrganType })
  @IsEnum(OrganType)
  organNeeded!: OrganType;

  @ApiProperty({ enum: UrgencyLevel })
  @IsEnum(UrgencyLevel)
  urgencyLevel!: UrgencyLevel;

  @ApiPropertyOptional({ enum: CaseStatus, default: CaseStatus.NEW })
  @IsOptional()
  @IsEnum(CaseStatus)
  caseStatus?: CaseStatus;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  requestActive?: boolean;

  @ApiProperty({ type: CreatePatientMedicalProfileDto })
  @ValidateNested()
  @Type(() => CreatePatientMedicalProfileDto)
  medicalProfile!: CreatePatientMedicalProfileDto;

  @ApiProperty({ type: CreatePatientRequestDto })
  @ValidateNested()
  @Type(() => CreatePatientRequestDto)
  request!: CreatePatientRequestDto;

  @ApiPropertyOptional({ type: [CreatePatientGuardianDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePatientGuardianDto)
  guardians?: CreatePatientGuardianDto[];
}
