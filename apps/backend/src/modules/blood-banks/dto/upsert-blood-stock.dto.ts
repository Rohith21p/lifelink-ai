import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class UpsertBloodStockDto {
  @ApiProperty({ example: '2f93f77a-4a8e-4f67-98f0-3f4472f93430' })
  @IsUUID()
  bloodBankId!: string;

  @ApiProperty({ example: 'O+' })
  @IsString()
  bloodGroup!: string;

  @ApiProperty({ example: 34 })
  @IsInt()
  @Min(0)
  @Max(5000)
  unitsAvailable!: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5000)
  lowStockThreshold?: number;

  @ApiPropertyOptional({ example: 'Demo Coordinator' })
  @IsOptional()
  @IsString()
  lastUpdatedBy?: string;
}
