import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { MatchStatus, UrgencyLevel } from '../../../common/enums';

export class UpdateMatchDto {
  @ApiPropertyOptional({ example: '9e8f2494-6ef9-47d8-807e-3a1204f403af' })
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @ApiPropertyOptional({ example: '311a4214-f5ee-4e03-a942-7ef7ebcfd9fe' })
  @IsOptional()
  @IsUUID()
  donorId?: string;

  @ApiPropertyOptional({ enum: MatchStatus })
  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @ApiPropertyOptional({ example: 74 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  compatibilityScore?: number;

  @ApiPropertyOptional({ enum: UrgencyLevel })
  @IsOptional()
  @IsEnum(UrgencyLevel)
  urgencyLevel?: UrgencyLevel;

  @ApiPropertyOptional({ example: 'Manual review updated the score after additional reports.' })
  @IsOptional()
  @IsString()
  matchReason?: string;

  @ApiPropertyOptional({ example: 'Follow-up review note from coordinator.' })
  @IsOptional()
  @IsString()
  reviewNotes?: string;

  @ApiPropertyOptional({ example: '35c2b376-4c58-45c6-b467-4fea96eb2f7e' })
  @IsOptional()
  @IsUUID()
  reviewedByCoordinatorId?: string;
}
