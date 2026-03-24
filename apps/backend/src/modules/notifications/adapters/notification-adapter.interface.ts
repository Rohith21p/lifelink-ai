import {
  NotificationChannel,
  NotificationDeliveryStatus,
} from '../../../common/enums';

export type NotificationDispatchPayload = {
  recipient?: string | null;
  title: string;
  message: string;
  metadata?: Record<string, unknown> | null;
};

export type NotificationDispatchResult = {
  status: NotificationDeliveryStatus;
  providerMessageId?: string;
  errorMessage?: string;
};

export interface NotificationAdapter {
  readonly channel: NotificationChannel;
  send(payload: NotificationDispatchPayload): Promise<NotificationDispatchResult>;
}
