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
export class InAppNotificationAdapter implements NotificationAdapter {
  readonly channel = NotificationChannel.IN_APP;

  async send(_payload: NotificationDispatchPayload) {
    return {
      status: NotificationDeliveryStatus.SENT,
      providerMessageId: `inapp-${Date.now()}`,
    };
  }
}
