import { BadRequestException, Injectable } from '@nestjs/common';
import {
  BloodRequestStatus,
  NotificationChannel,
  NotificationEventType,
} from '../../common/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notifications/notifications.service';
import { UpsertBloodStockDto } from './dto/upsert-blood-stock.dto';

@Injectable()
export class BloodBanksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  getAllBloodBanks() {
    return this.prisma.bloodBank.findMany({
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
          },
        },
        inventory: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  getBloodInventory(bloodBankId?: string) {
    return this.prisma.bloodInventory.findMany({
      where: bloodBankId ? { bloodBankId } : undefined,
      include: {
        bloodBank: {
          select: {
            id: true,
            name: true,
            code: true,
            city: true,
            district: true,
            state: true,
          },
        },
      },
      orderBy: [{ bloodGroup: 'asc' }, { updatedAt: 'desc' }],
    });
  }

  async upsertBloodStock(dto: UpsertBloodStockDto) {
    const inventory = await this.prisma.bloodInventory.upsert({
      where: {
        bloodBankId_bloodGroup: {
          bloodBankId: dto.bloodBankId,
          bloodGroup: dto.bloodGroup.toUpperCase(),
        },
      },
      create: {
        bloodBankId: dto.bloodBankId,
        bloodGroup: dto.bloodGroup.toUpperCase(),
        unitsAvailable: dto.unitsAvailable,
        lowStockThreshold: dto.lowStockThreshold ?? 10,
        lastUpdatedBy: dto.lastUpdatedBy,
        lastUpdatedAt: new Date(),
      },
      update: {
        unitsAvailable: dto.unitsAvailable,
        lowStockThreshold: dto.lowStockThreshold,
        lastUpdatedBy: dto.lastUpdatedBy,
        lastUpdatedAt: new Date(),
      },
      include: {
        bloodBank: {
          select: {
            id: true,
            name: true,
            hospitalId: true,
          },
        },
      },
    });

    if (inventory.unitsAvailable <= inventory.lowStockThreshold) {
      await this.notificationService.sendFromTemplate({
        eventType: NotificationEventType.LOW_BLOOD_STOCK_ALERT,
        channel: NotificationChannel.IN_APP,
        hospitalId: inventory.bloodBank.hospitalId ?? undefined,
        context: {
          bloodGroup: inventory.bloodGroup,
          unitsAvailable: inventory.unitsAvailable,
          bloodBankName: inventory.bloodBank.name,
        },
        bloodBankId: inventory.bloodBank.id,
      });
    }

    return inventory;
  }

  getBloodRequests(bloodBankId?: string, status?: string) {
    const normalizedBankId = bloodBankId?.trim();
    const normalizedStatus = status?.trim();

    let parsedStatus: BloodRequestStatus | undefined;
    if (normalizedStatus) {
      const isValidStatus = Object.values(BloodRequestStatus).includes(
        normalizedStatus as BloodRequestStatus,
      );

      if (!isValidStatus) {
        throw new BadRequestException(
          `Invalid blood request status '${normalizedStatus}'. Expected one of ${Object.values(
            BloodRequestStatus,
          ).join(', ')}`,
        );
      }

      parsedStatus = normalizedStatus as BloodRequestStatus;
    }

    return this.prisma.bloodRequest.findMany({
      where: {
        bloodBankId: normalizedBankId,
        status: parsedStatus,
      },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            uhid: true,
          },
        },
        requestedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        bloodBank: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async getLowStockAlerts() {
    const inventory = await this.getBloodInventory();
    return inventory.filter((item) => item.unitsAvailable <= item.lowStockThreshold);
  }

  getRecentStockActivity() {
    return this.prisma.bloodInventory.findMany({
      include: {
        bloodBank: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 12,
    });
  }
}
