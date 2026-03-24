import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  NotificationChannel,
  NotificationEventType,
  NotificationType,
} from '../../../common/enums';

export class CreateNotificationDto {
  @ApiPropertyOptional({ example: '2f93f77a-4a8e-4f67-98f0-3f4472f93430' })
  @IsOptional()
  @IsUUID()
  hospitalId?: string;

  @ApiPropertyOptional({ enum: NotificationType, default: NotificationType.INFO })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({ enum: NotificationChannel, default: NotificationChannel.IN_APP })
  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;

  @ApiPropertyOptional({ enum: NotificationEventType })
  @IsOptional()
  @IsEnum(NotificationEventType)
  eventType?: NotificationEventType;

  @ApiPropertyOptional({ example: 'COORDINATOR' })
  @IsOptional()
  @IsString()
  targetRole?: string;

  @ApiProperty({ example: 'Donor shortlisted for urgent liver case' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Please review shortlist and contact donor within 30 minutes.' })
  @IsString()
  message!: string;

  @ApiPropertyOptional({ example: '+91-9876543210 or user@example.com' })
  @IsOptional()
  @IsString()
  recipient?: string;

  @ApiPropertyOptional({ example: '9e8f2494-6ef9-47d8-807e-3a1204f403af' })
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @ApiPropertyOptional({ example: '311a4214-f5ee-4e03-a942-7ef7ebcfd9fe' })
  @IsOptional()
  @IsUUID()
  donorId?: string;

  @ApiPropertyOptional({ example: '2d2f2494-6ef9-47d8-807e-3a1204f403bf' })
  @IsOptional()
  @IsUUID()
  matchId?: string;

  @ApiPropertyOptional({ example: 'f56f2494-6ef9-47d8-807e-3a1204f40bbb' })
  @IsOptional()
  @IsUUID()
  reportFileId?: string;

  @ApiPropertyOptional({ example: 'bf4f2494-6ef9-47d8-807e-3a1204f40acc' })
  @IsOptional()
  @IsUUID()
  bloodBankId?: string;

  @ApiPropertyOptional({
    example: { patientName: 'Rahul Sharma', urgency: 'CRITICAL' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
