import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { NotificationService } from '../notifications/notifications.service';
import {
  MatchReviewAction,
  MatchStatus,
  NotificationChannel,
  NotificationEventType,
} from '../../common/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { CreateMatchReviewDto } from './dto/create-match-review.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { UpdateMatchStatusDto } from './dto/update-match-status.dto';
import { MatchingEngineService } from './matching-engine.service';

const matchInclude = {
  patient: {
    select: {
      id: true,
      fullName: true,
      uhid: true,
      bloodGroup: true,
      city: true,
      district: true,
      state: true,
      organNeeded: true,
      urgencyLevel: true,
      caseStatus: true,
      request: true,
      medicalProfile: true,
      hospital: {
        select: {
          id: true,
          name: true,
          city: true,
          state: true,
        },
      },
    },
  },
  donor: {
    select: {
      id: true,
      fullName: true,
      donorCode: true,
      bloodGroup: true,
      city: true,
      district: true,
      state: true,
      status: true,
      availableFrom: true,
      availability: true,
      preference: true,
      medicalProfile: true,
      hospital: {
        select: {
          id: true,
          name: true,
          city: true,
          state: true,
        },
      },
    },
  },
  reviewedByCoordinator: {
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  },
  reviews: {
    orderBy: {
      createdAt: 'desc' as const,
    },
    include: {
      reviewer: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  },
};

@Injectable()
export class MatchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly matchingEngine: MatchingEngineService,
    private readonly notificationService: NotificationService,
  ) {}

  findAll(status?: MatchStatus) {
    return this.prisma.donorPatientMatch.findMany({
      where: status ? { status } : undefined,
      include: matchInclude,
      orderBy: [{ overallScore: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const match = await this.prisma.donorPatientMatch.findUnique({
      where: { id },
      include: matchInclude,
    });

    if (!match) {
      throw new NotFoundException(`Match ${id} not found`);
    }

    return match;
  }

  async create(dto: CreateMatchDto) {
    const [patient, donor] = await Promise.all([
      this.getPatientForScoring(dto.patientId),
      this.getDonorForScoring(dto.donorId),
    ]);

    const scoreBreakdown = this.matchingEngine.calculateCompatibility(patient, donor);

    let created;
    try {
      created = await this.prisma.donorPatientMatch.create({
        data: {
          patientId: dto.patientId,
          donorId: dto.donorId,
          status: dto.status ?? MatchStatus.PENDING,
          compatibilityScore: dto.compatibilityScore ?? scoreBreakdown.overallScore,
          bloodCompatibilityScore: scoreBreakdown.bloodCompatibilityScore,
          locationScore: scoreBreakdown.locationScore,
          availabilityScore: scoreBreakdown.availabilityScore,
          overallScore: scoreBreakdown.overallScore,
          urgencyLevel: dto.urgencyLevel ?? patient.urgencyLevel,
          matchReason: dto.matchReason ?? scoreBreakdown.reasons.join(' '),
          reviewNotes: dto.reviewNotes,
          reviewedByCoordinatorId: dto.reviewedByCoordinatorId,
          reviewedAt: dto.reviewedByCoordinatorId ? new Date() : undefined,
        },
        include: matchInclude,
      });
    } catch (error) {
      this.handleMatchWriteError(error, dto.patientId, dto.donorId);
    }

    await this.notificationService.sendFromTemplate({
      eventType: NotificationEventType.NEW_MATCH_FOUND,
      channel: NotificationChannel.IN_APP,
      hospitalId: created.patient.hospital.id,
      titleOverride: 'New Match Found',
      context: {
        patientName: created.patient.fullName,
        donorName: created.donor.fullName,
        score: `${created.overallScore ?? created.compatibilityScore ?? 0}`,
      },
      matchId: created.id,
      patientId: created.patient.id,
      donorId: created.donor.id,
    });

    return created;
  }

  async update(id: string, dto: UpdateMatchDto) {
    const existing = await this.prisma.donorPatientMatch.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Match ${id} not found`);
    }

    const patientId = dto.patientId ?? existing.patientId;
    const donorId = dto.donorId ?? existing.donorId;

    const [patient, donor] = await Promise.all([
      this.getPatientForScoring(patientId),
      this.getDonorForScoring(donorId),
    ]);

    const scoreBreakdown = this.matchingEngine.calculateCompatibility(patient, donor);

    try {
      await this.prisma.donorPatientMatch.update({
        where: { id },
        data: {
          patientId,
          donorId,
          status: dto.status,
          compatibilityScore: dto.compatibilityScore ?? scoreBreakdown.overallScore,
          bloodCompatibilityScore: scoreBreakdown.bloodCompatibilityScore,
          locationScore: scoreBreakdown.locationScore,
          availabilityScore: scoreBreakdown.availabilityScore,
          overallScore: scoreBreakdown.overallScore,
          urgencyLevel: dto.urgencyLevel ?? patient.urgencyLevel,
          matchReason: dto.matchReason ?? scoreBreakdown.reasons.join(' '),
          reviewNotes: dto.reviewNotes,
          reviewedByCoordinatorId: dto.reviewedByCoordinatorId,
          reviewedAt: dto.reviewedByCoordinatorId ? new Date() : undefined,
        },
      });
    } catch (error) {
      this.handleMatchWriteError(error, patientId, donorId);
    }

    return this.findOne(id);
  }

  async updateStatus(id: string, dto: UpdateMatchStatusDto) {
    await this.findOne(id);

    await this.prisma.donorPatientMatch.update({
      where: { id },
      data: {
        status: dto.status,
        reviewedByCoordinatorId: dto.reviewedByCoordinatorId,
        reviewNotes: dto.reviewNotes,
        reviewedAt: dto.reviewedByCoordinatorId ? new Date() : undefined,
      },
    });

    const updated = await this.findOne(id);
    await this.notificationService.sendFromTemplate({
      eventType:
        dto.status === MatchStatus.SHORTLISTED
          ? NotificationEventType.DONOR_SHORTLISTED
          : NotificationEventType.PATIENT_STATUS_UPDATED,
      channel: NotificationChannel.IN_APP,
      hospitalId: updated.patient.hospital.id,
      context: {
        patientName: updated.patient.fullName,
        donorName: updated.donor.fullName,
        status: dto.status,
      },
      matchId: updated.id,
      patientId: updated.patient.id,
      donorId: updated.donor.id,
    });

    return updated;
  }

  async addReview(id: string, dto: CreateMatchReviewDto) {
    const match = await this.findOne(id);

    const nextStatus = this.resolveStatusFromAction(dto.action, match.status as MatchStatus);
    const eventType = this.resolveEventTypeFromAction(dto.action);

    await this.prisma.$transaction(async (tx) => {
      await tx.matchReview.create({
        data: {
          matchId: id,
          reviewerCoordinatorId: dto.reviewerCoordinatorId,
          action: dto.action,
          note: dto.note,
        },
      });

      await tx.donorPatientMatch.update({
        where: { id },
        data: {
          status: nextStatus,
          reviewNotes: dto.note,
          reviewedByCoordinatorId: dto.reviewerCoordinatorId,
          reviewedAt: dto.reviewerCoordinatorId ? new Date() : undefined,
          notifiedAt: dto.action === MatchReviewAction.NOTIFY ? new Date() : undefined,
        },
      });
    });

    if (eventType) {
      await this.notificationService.sendFromTemplate({
        eventType,
        channel: NotificationChannel.IN_APP,
        hospitalId: match.patient.hospital.id,
        context: {
          patientName: match.patient.fullName,
          donorName: match.donor.fullName,
          action: dto.action,
          note: dto.note ?? '',
        },
        matchId: match.id,
        patientId: match.patient.id,
        donorId: match.donor.id,
      });
    }

    return this.findOne(id);
  }

  async getScoreBreakdown(id: string) {
    const match = await this.findOne(id);

    const computed = this.matchingEngine.calculateCompatibility(match.patient, match.donor);

    return {
      matchId: match.id,
      bloodCompatibilityScore: match.bloodCompatibilityScore ?? computed.bloodCompatibilityScore,
      locationScore: match.locationScore ?? computed.locationScore,
      availabilityScore: match.availabilityScore ?? computed.availabilityScore,
      overallScore:
        match.overallScore ?? match.compatibilityScore ?? computed.overallScore,
      reviewNotes: match.reviewNotes,
      reasons: computed.reasons,
      updatedAt: match.updatedAt,
    };
  }

  private async getPatientForScoring(patientId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      select: {
        id: true,
        bloodGroup: true,
        city: true,
        district: true,
        state: true,
        organNeeded: true,
        urgencyLevel: true,
      },
    });

    if (!patient) {
      throw new BadRequestException(`Patient ${patientId} not found`);
    }

    return patient;
  }

  private async getDonorForScoring(donorId: string) {
    const donor = await this.prisma.donor.findUnique({
      where: { id: donorId },
      select: {
        id: true,
        bloodGroup: true,
        city: true,
        district: true,
        state: true,
        status: true,
        availableFrom: true,
        availability: {
          select: {
            isAvailable: true,
          },
        },
        preference: {
          select: {
            organDonationOptIn: true,
            bloodDonationOptIn: true,
            supportedDonationTypes: true,
          },
        },
        medicalProfile: {
          select: {
            medicalConditions: true,
            infectiousDiseaseScreening: true,
          },
        },
      },
    });

    if (!donor) {
      throw new BadRequestException(`Donor ${donorId} not found`);
    }

    return donor;
  }

  private resolveStatusFromAction(action: MatchReviewAction, currentStatus: MatchStatus) {
    if (action === MatchReviewAction.SHORTLIST) {
      return MatchStatus.SHORTLISTED;
    }

    if (action === MatchReviewAction.APPROVE) {
      return MatchStatus.APPROVED;
    }

    if (action === MatchReviewAction.REJECT) {
      return MatchStatus.REJECTED;
    }

    if (action === MatchReviewAction.REVIEW) {
      return MatchStatus.PENDING;
    }

    return currentStatus;
  }

  private resolveEventTypeFromAction(action: MatchReviewAction) {
    if (action === MatchReviewAction.SHORTLIST) {
      return NotificationEventType.DONOR_SHORTLISTED;
    }

    if (action === MatchReviewAction.NOTIFY) {
      return NotificationEventType.NEW_MATCH_FOUND;
    }

    if (
      action === MatchReviewAction.APPROVE ||
      action === MatchReviewAction.REJECT ||
      action === MatchReviewAction.REVIEW
    ) {
      return NotificationEventType.PATIENT_STATUS_UPDATED;
    }

    return null;
  }

  private handleMatchWriteError(error: unknown, patientId: string, donorId: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException(
        `Match already exists for patient ${patientId} and donor ${donorId}`,
      );
    }

    throw error;
  }
}
