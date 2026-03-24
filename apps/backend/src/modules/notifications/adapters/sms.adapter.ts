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
export class SmsNotificationAdapter implements NotificationAdapter {
  readonly channel = NotificationChannel.SMS;

  async send(payload: NotificationDispatchPayload) {
    if (!payload.recipient) {
      return {
        status: NotificationDeliveryStatus.FAILED,
        errorMessage: 'SMS recipient not provided for mock dispatch.',
      };
    }

    return {
      status: NotificationDeliveryStatus.SENT,
      providerMessageId: `sms-mock-${Date.now()}`,
    };
  }
}
