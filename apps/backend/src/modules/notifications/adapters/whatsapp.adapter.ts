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
export class WhatsAppNotificationAdapter implements NotificationAdapter {
  readonly channel = NotificationChannel.WHATSAPP;

  async send(payload: NotificationDispatchPayload) {
    if (!payload.recipient) {
      return {
        status: NotificationDeliveryStatus.FAILED,
        errorMessage: 'WhatsApp recipient not provided for mock dispatch.',
      };
    }

    return {
      status: NotificationDeliveryStatus.SENT,
      providerMessageId: `wa-mock-${Date.now()}`,
    };
  }
}
