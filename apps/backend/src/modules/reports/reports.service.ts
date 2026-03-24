import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  ExtractionStatus,
  NotificationChannel,
  NotificationEventType,
} from '../../common/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notifications/notifications.service';
import { UploadReportDto } from './dto/upload-report.dto';
import { ReportExtractionPlaceholderService } from './report-extraction-placeholder.service';

const reportInclude = {
  patient: {
    select: {
      id: true,
      fullName: true,
      uhid: true,
      bloodGroup: true,
      urgencyLevel: true,
      medicalProfile: {
        select: {
          primaryDiagnosis: true,
          comorbidities: true,
        },
      },
    },
  },
  uploadedBy: {
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  },
  extractions: {
    orderBy: {
      createdAt: 'desc' as const,
    },
  },
};

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly extractionService: ReportExtractionPlaceholderService,
    private readonly notificationService: NotificationService,
  ) {}

  uploadMetadata(dto: UploadReportDto) {
    return this.prisma.reportFile.create({
      data: {
        patientId: dto.patientId,
        uploadedByCoordinatorId: dto.uploadedByCoordinatorId,
        fileName: dto.fileName,
        fileType: dto.fileType,
        fileUrl: dto.fileUrl,
        fileSizeKb: dto.fileSizeKb,
        notes: dto.notes,
        metadata: dto.metadata as Prisma.InputJsonValue | undefined,
        extractionStatus: ExtractionStatus.PENDING,
      },
      include: reportInclude,
    });
  }

  list(patientId?: string) {
    return this.prisma.reportFile.findMany({
      where: patientId ? { patientId } : undefined,
      include: reportInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const report = await this.prisma.reportFile.findUnique({
      where: { id },
      include: reportInclude,
    });

    if (!report) {
      throw new NotFoundException(`Report ${id} not found`);
    }

    return report;
  }

  async getExtractionSummary(id: string) {
    const report = await this.findOne(id);
    const latestExtraction = report.extractions[0] ?? null;

    return {
      reportId: report.id,
      extractionStatus: report.extractionStatus,
      extractedSummary: report.extractedSummary,
      extraction: latestExtraction,
    };
  }

  async triggerMockExtraction(id: string) {
    const report = await this.findOne(id);

    await this.prisma.reportFile.update({
      where: { id },
      data: {
        extractionStatus: ExtractionStatus.PROCESSING,
      },
    });

    const extracted = this.extractionService.extractReport({
      patient: report.patient,
      fileName: report.fileName,
    });

    const extractedSummary = [
      `Blood Group: ${extracted.bloodGroup}`,
      `Diagnosis: ${extracted.diagnosis}`,
      `Urgency Hint: ${extracted.urgencyHint}`,
      `Key Notes: ${extracted.keyNotes}`,
      `Flags: ${extracted.flaggedConditions.join(', ')}`,
    ].join('\n');

    await this.prisma.$transaction(async (tx) => {
      await tx.reportExtraction.create({
        data: {
          reportFileId: report.id,
          status: ExtractionStatus.COMPLETED,
          bloodGroup: extracted.bloodGroup,
          diagnosis: extracted.diagnosis,
          keyNotes: extracted.keyNotes,
          urgencyHint: extracted.urgencyHint,
          flaggedConditions: extracted.flaggedConditions,
          rawPayload: extracted.rawPayload,
        },
      });

      await tx.reportFile.update({
        where: { id: report.id },
        data: {
          extractionStatus: ExtractionStatus.COMPLETED,
          extractedSummary,
        },
      });
    });

    await this.notificationService.sendFromTemplate({
      eventType: NotificationEventType.PATIENT_STATUS_UPDATED,
      channel: NotificationChannel.IN_APP,
      context: {
        patientName: report.patient.fullName,
        status: 'REPORT_EXTRACTED',
        reportName: report.fileName,
      },
      patientId: report.patient.id,
      reportFileId: report.id,
    });

    return this.findOne(id);
  }
}
