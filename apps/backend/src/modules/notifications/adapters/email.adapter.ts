import { Injectable } from '@nestjs/common';
import {
  NotificationChannel,
  NotificationDeliveryStatus,
} from '../../../common/enums';
import {
  NotificationAdapter,
  NotificationDispatchPayload,
} from './notification-adapter.interface';

@Injectable()
export class EmailNotificationAdapter implements NotificationAdapter {
  readonly channel = NotificationChannel.EMAIL;

  async send(payload: NotificationDispatchPayload) {
    if (!payload.recipient) {
      return {
        status: NotificationDeliveryStatus.FAILED,
        errorMessage: 'Email recipient not provided for mock dispatch.',
      };
    }

    return {
      status: NotificationDeliveryStatus.SENT,
      providerMessageId: `email-mock-${Date.now()}`,
    };
  }
}
