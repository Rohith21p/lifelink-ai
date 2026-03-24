import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ReportFileType } from '../../../common/enums';

export class UploadReportDto {
  @ApiProperty({ example: '9e8f2494-6ef9-47d8-807e-3a1204f403af' })
  @IsUUID()
  patientId!: string;

  @ApiPropertyOptional({ example: '35c2b376-4c58-45c6-b467-4fea96eb2f7e' })
  @IsOptional()
  @IsUUID()
  uploadedByCoordinatorId?: string;

  @ApiProperty({ example: 'rahul-sharma-cbc-report.pdf' })
  @IsString()
  fileName!: string;

  @ApiProperty({ enum: ReportFileType })
  @IsEnum(ReportFileType)
  fileType!: ReportFileType;

  @ApiPropertyOptional({ example: '/demo/reports/rahul-sharma-cbc-report.pdf' })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional({ example: 860 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(25_000)
  fileSizeKb?: number;

  @ApiPropertyOptional({ example: 'CBC report uploaded after urgent OPD consultation.' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: { source: 'manual-upload', mimeType: 'application/pdf' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
