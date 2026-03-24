import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationService } from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get in-app notifications' })
  getNotifications(
    @Query('unread') unread?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationsService.getNotifications(
      unread === 'true',
      limit ? Number(limit) : undefined,
    );
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get notification delivery logs' })
  getLogs(@Query('limit') limit?: string) {
    return this.notificationsService.getLogs(limit ? Number(limit) : undefined);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get notification templates' })
  getTemplates() {
    return this.notificationsService.getTemplates();
  }

  @Post()
  @ApiOperation({ summary: 'Create and dispatch notification via mock adapter' })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markAsRead(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.notificationsService.markAsRead(id);
  }
}
