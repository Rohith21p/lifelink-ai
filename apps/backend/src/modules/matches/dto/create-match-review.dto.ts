import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { MatchReviewAction } from '../../../common/enums';

export class CreateMatchReviewDto {
  @ApiProperty({ enum: MatchReviewAction })
  @IsEnum(MatchReviewAction)
  action!: MatchReviewAction;

  @ApiPropertyOptional({ example: 'Shortlisting donor for panel review due to strong blood and location scores.' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ example: '35c2b376-4c58-45c6-b467-4fea96eb2f7e' })
  @IsOptional()
  @IsUUID()
  reviewerCoordinatorId?: string;
}
