import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import {
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationEventType,
  NotificationType,
} from '../../common/enums';
import { EmailNotificationAdapter } from './adapters/email.adapter';
import { InAppNotificationAdapter } from './adapters/in-app.adapter';
import {
  NotificationAdapter,
  NotificationDispatchPayload,
} from './adapters/notification-adapter.interface';
import { SmsNotificationAdapter } from './adapters/sms.adapter';
import { WhatsAppNotificationAdapter } from './adapters/whatsapp.adapter';

type SendFromTemplateInput = {
  eventType: NotificationEventType;
  channel?: NotificationChannel;
  hospitalId?: string;
  titleOverride?: string;
  context?: Record<string, unknown>;
  recipient?: string;
  patientId?: string;
  donorId?: string;
  matchId?: string;
  reportFileId?: string;
  bloodBankId?: string;
};

@Injectable()
export class NotificationService {
  private readonly adapters: Map<string, NotificationAdapter>;

  constructor(
    private readonly prisma: PrismaService,
    inAppAdapter: InAppNotificationAdapter,
    smsAdapter: SmsNotificationAdapter,
    emailAdapter: EmailNotificationAdapter,
    whatsappAdapter: WhatsAppNotificationAdapter,
  ) {
    this.adapters = new Map<string, NotificationAdapter>([
      [NotificationChannel.IN_APP, inAppAdapter],
      [NotificationChannel.SMS, smsAdapter],
      [NotificationChannel.EMAIL, emailAdapter],
      [NotificationChannel.WHATSAPP, whatsappAdapter],
    ]);
  }

  async getNotifications(unreadOnly = false, limit = 30) {
    return this.prisma.notification.findMany({
      where: unreadOnly ? { isRead: false } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async create(dto: CreateNotificationDto) {
    const channel = dto.channel ?? NotificationChannel.IN_APP;

    const notification = await this.prisma.notification.create({
      data: {
        hospitalId: dto.hospitalId,
        type: dto.type ?? NotificationType.INFO,
        channel,
        eventType: dto.eventType,
        targetRole: dto.targetRole,
        title: dto.title,
        message: dto.message,
        metadata: this.toJson(dto.metadata),
      },
    });

    const dispatchResult = await this.dispatchChannel(channel, {
      recipient: dto.recipient,
      title: dto.title,
      message: dto.message,
      metadata: dto.metadata ?? null,
    });

    await this.prisma.notificationLog.create({
      data: {
        notificationId: notification.id,
        channel,
        eventType: dto.eventType,
        status: dispatchResult.status,
        recipient: dto.recipient,
        message: dto.message,
        metadata: this.toJson(dto.metadata),
        patientId: dto.patientId,
        donorId: dto.donorId,
        matchId: dto.matchId,
        reportFileId: dto.reportFileId,
        bloodBankId: dto.bloodBankId,
        sentAt:
          dispatchResult.status === NotificationDeliveryStatus.SENT
            ? new Date()
            : undefined,
      },
    });

    return notification;
  }

  async markAsRead(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Notification ${id} not found`);
    }

    return this.prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
      },
    });
  }

  async getLogs(limit = 50) {
    return this.prisma.notificationLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        notification: true,
        template: true,
        patient: {
          select: {
            id: true,
            fullName: true,
            uhid: true,
          },
        },
        donor: {
          select: {
            id: true,
            fullName: true,
            donorCode: true,
          },
        },
      },
    });
  }

  async getTemplates() {
    return this.prisma.notificationTemplate.findMany({
      orderBy: [{ eventType: 'asc' }, { channel: 'asc' }],
    });
  }

  async sendFromTemplate(input: SendFromTemplateInput) {
    const templates = await this.prisma.notificationTemplate.findMany({
      where: {
        eventType: input.eventType,
        isActive: true,
        channel: input.channel,
      },
      orderBy: { createdAt: 'asc' },
    });

    const templateSet =
      templates.length > 0
        ? templates
        : [
            {
              id: null,
              channel: input.channel ?? NotificationChannel.IN_APP,
              subject: this.humanizeEventType(input.eventType),
              bodyTemplate: `${this.humanizeEventType(input.eventType)} for {{patientName}}`,
            },
          ];

    const notifications = [];
    for (const template of templateSet) {
      const title = input.titleOverride ?? template.subject ?? this.humanizeEventType(input.eventType);
      const message = this.renderTemplate(template.bodyTemplate, {
        eventType: input.eventType,
        ...input.context,
      });

      const notification = await this.prisma.notification.create({
        data: {
          hospitalId: input.hospitalId,
          type: this.resolveNotificationType(input.eventType),
          channel: template.channel as NotificationChannel,
          eventType: input.eventType,
          title,
          message,
          metadata: this.toJson(input.context),
        },
      });

      const dispatchResult = await this.dispatchChannel(template.channel as string, {
        recipient: input.recipient,
        title,
        message,
        metadata: input.context ?? null,
      });

      await this.prisma.notificationLog.create({
        data: {
          notificationId: notification.id,
          templateId: template.id ?? undefined,
          channel: template.channel as NotificationChannel,
          eventType: input.eventType,
          status: dispatchResult.status,
          recipient: input.recipient,
          message,
          metadata: this.toJson(input.context),
          patientId: input.patientId,
          donorId: input.donorId,
          matchId: input.matchId,
          reportFileId: input.reportFileId,
          bloodBankId: input.bloodBankId,
          sentAt:
            dispatchResult.status === NotificationDeliveryStatus.SENT
              ? new Date()
              : undefined,
        },
      });

      notifications.push(notification);
    }

    return notifications;
  }

  private async dispatchChannel(channel: string, payload: NotificationDispatchPayload) {
    const adapter = this.adapters.get(channel);

    if (!adapter) {
      return {
        status: NotificationDeliveryStatus.FAILED,
        errorMessage: `No adapter found for channel ${channel}`,
      };
    }

    return adapter.send(payload);
  }

  private resolveNotificationType(eventType: NotificationEventType) {
    if (
      eventType === NotificationEventType.LOW_BLOOD_STOCK_ALERT ||
      eventType === NotificationEventType.URGENT_CASE_CREATED
    ) {
      return NotificationType.ALERT;
    }

    if (eventType === NotificationEventType.DONOR_SHORTLISTED) {
      return NotificationType.WARNING;
    }

    return NotificationType.INFO;
  }

  private renderTemplate(template: string, context: Record<string, unknown>) {
    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_match, key: string) => {
      const value = context[key];
      if (value === undefined || value === null) {
        return '';
      }
      return String(value);
    });
  }

  private humanizeEventType(eventType: NotificationEventType) {
    return eventType
      .split('_')
      .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
      .join(' ');
  }

  private toJson(value?: Record<string, unknown>) {
    if (!value) {
      return undefined;
    }

    return value as Prisma.InputJsonValue;
  }
}
