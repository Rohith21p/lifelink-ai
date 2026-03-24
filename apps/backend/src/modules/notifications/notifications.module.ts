import { Module } from '@nestjs/common';
import { EmailNotificationAdapter } from './adapters/email.adapter';
import { InAppNotificationAdapter } from './adapters/in-app.adapter';
import { SmsNotificationAdapter } from './adapters/sms.adapter';
import { WhatsAppNotificationAdapter } from './adapters/whatsapp.adapter';
import { NotificationsController } from './notifications.controller';
import { NotificationService } from './notifications.service';

@Module({
  controllers: [NotificationsController],
  providers: [
    NotificationService,
    InAppNotificationAdapter,
    SmsNotificationAdapter,
    EmailNotificationAdapter,
    WhatsAppNotificationAdapter,
  ],
  exports: [NotificationService],
})
export class NotificationsModule {}
