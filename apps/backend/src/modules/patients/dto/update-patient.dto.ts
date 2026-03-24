import { ApiPropertyOptional } from '@nestjs/swagger';
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

export class UpdatePatientMedicalProfileDto {
  @ApiPropertyOptional({ example: 'End-stage renal disease' })
  @IsOptional()
  @IsString()
  primaryDiagnosis?: string;

  @ApiPropertyOptional({ example: 'Type 2 diabetes' })
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

  @ApiPropertyOptional({ example: 'Tacrolimus' })
  @IsOptional()
  @IsString()
  currentMedication?: string;

  @ApiPropertyOptional({ example: '2026-03-20T10:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  lastAssessmentDate?: string;
}

export class UpdatePatientRequestDto {
  @ApiPropertyOptional({ enum: OrganType })
  @IsOptional()
  @IsEnum(OrganType)
  organType?: OrganType;

  @ApiPropertyOptional({ example: '2026-03-22T09:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  requestedOn?: string;

  @ApiPropertyOptional({ example: '2026-04-10T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  requiredBy?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  hospitalPriority?: number;

  @ApiPropertyOptional({ example: 'Lab pending' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePatientGuardianDto {
  @ApiPropertyOptional({ example: 'Asha Sharma' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 'Spouse' })
  @IsOptional()
  @IsString()
  relation?: string;

  @ApiPropertyOptional({ example: '+91-9876543210' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'asha.sharma@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class UpdatePatientDto {
  @ApiPropertyOptional({ example: '2f93f77a-4a8e-4f67-98f0-3f4472f93430' })
  @IsOptional()
  @IsUUID()
  hospitalId?: string;

  @ApiPropertyOptional({ example: '35c2b376-4c58-45c6-b467-4fea96eb2f7e' })
  @IsOptional()
  @IsUUID()
  coordinatorId?: string;

  @ApiPropertyOptional({ example: 'UHID-MUM-1001' })
  @IsOptional()
  @IsString()
  uhid?: string;

  @ApiPropertyOptional({ example: 'Rahul Sharma' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 42 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120)
  age?: number;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ example: 'B+' })
  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @ApiPropertyOptional({ example: 'Mumbai' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Mumbai Suburban' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ example: 'Maharashtra' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ enum: OrganType })
  @IsOptional()
  @IsEnum(OrganType)
  organNeeded?: OrganType;

  @ApiPropertyOptional({ enum: UrgencyLevel })
  @IsOptional()
  @IsEnum(UrgencyLevel)
  urgencyLevel?: UrgencyLevel;

  @ApiPropertyOptional({ enum: CaseStatus })
  @IsOptional()
  @IsEnum(CaseStatus)
  caseStatus?: CaseStatus;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  requestActive?: boolean;

  @ApiPropertyOptional({ type: UpdatePatientMedicalProfileDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePatientMedicalProfileDto)
  medicalProfile?: UpdatePatientMedicalProfileDto;

  @ApiPropertyOptional({ type: UpdatePatientRequestDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePatientRequestDto)
  request?: UpdatePatientRequestDto;

  @ApiPropertyOptional({ type: [UpdatePatientGuardianDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePatientGuardianDto)
  guardians?: UpdatePatientGuardianDto[];
}
