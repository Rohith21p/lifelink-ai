import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { MatchStatus } from '../../../common/enums';

export class UpdateMatchStatusDto {
  @ApiProperty({ enum: MatchStatus })
  @IsEnum(MatchStatus)
  status!: MatchStatus;

  @ApiPropertyOptional({ example: '35c2b376-4c58-45c6-b467-4fea96eb2f7e' })
  @IsOptional()
  @IsUUID()
  reviewedByCoordinatorId?: string;

  @ApiPropertyOptional({ example: 'Status reviewed by transplant panel.' })
  @IsOptional()
  @IsString()
  reviewNotes?: string;
}
