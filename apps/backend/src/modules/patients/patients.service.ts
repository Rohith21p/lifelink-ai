import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CaseStatus } from '../../common/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

const patientInclude = {
  hospital: true,
  coordinator: true,
  medicalProfile: true,
  request: true,
  guardians: true,
  caseTimelines: {
    orderBy: {
      eventAt: 'desc' as const,
    },
  },
};

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreatePatientDto) {
    return this.prisma.patient.create({
      data: {
        hospitalId: dto.hospitalId,
        coordinatorId: dto.coordinatorId,
        uhid: dto.uhid,
        fullName: dto.fullName,
        age: dto.age,
        gender: dto.gender,
        bloodGroup: dto.bloodGroup,
        city: dto.city,
        district: dto.district,
        state: dto.state,
        organNeeded: dto.organNeeded,
        urgencyLevel: dto.urgencyLevel,
        caseStatus: dto.caseStatus ?? CaseStatus.NEW,
        requestActive: dto.requestActive ?? true,
        medicalProfile: {
          create: {
            primaryDiagnosis: dto.medicalProfile.primaryDiagnosis,
            comorbidities: dto.medicalProfile.comorbidities,
            heightCm: dto.medicalProfile.heightCm,
            weightKg: dto.medicalProfile.weightKg,
            allergies: dto.medicalProfile.allergies,
            currentMedication: dto.medicalProfile.currentMedication,
            lastAssessmentDate: dto.medicalProfile.lastAssessmentDate
              ? new Date(dto.medicalProfile.lastAssessmentDate)
              : undefined,
          },
        },
        request: {
          create: {
            organType: dto.request.organType,
            requestedOn: dto.request.requestedOn ? new Date(dto.request.requestedOn) : undefined,
            requiredBy: dto.request.requiredBy ? new Date(dto.request.requiredBy) : undefined,
            hospitalPriority: dto.request.hospitalPriority,
            notes: dto.request.notes,
          },
        },
        guardians: dto.guardians?.length
          ? {
              create: dto.guardians.map((guardian) => ({
                fullName: guardian.fullName,
                relation: guardian.relation,
                phone: guardian.phone,
                email: guardian.email,
                isPrimary: guardian.isPrimary ?? false,
              })),
            }
          : undefined,
      },
      include: patientInclude,
    });
  }

  findAll() {
    return this.prisma.patient.findMany({
      include: patientInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: patientInclude,
    });

    if (!patient) {
      throw new NotFoundException(`Patient ${id} not found`);
    }

    return patient;
  }

  async update(id: string, dto: UpdatePatientDto) {
    await this.findOne(id);

    await this.prisma.$transaction(async (tx) => {
      await tx.patient.update({
        where: { id },
        data: {
          hospitalId: dto.hospitalId,
          coordinatorId: dto.coordinatorId,
          uhid: dto.uhid,
          fullName: dto.fullName,
          age: dto.age,
          gender: dto.gender,
          bloodGroup: dto.bloodGroup,
          city: dto.city,
          district: dto.district,
          state: dto.state,
          organNeeded: dto.organNeeded,
          urgencyLevel: dto.urgencyLevel,
          caseStatus: dto.caseStatus,
          requestActive: dto.requestActive,
        },
      });

      if (dto.medicalProfile) {
        await tx.patientMedicalProfile.upsert({
          where: { patientId: id },
          create: {
            patientId: id,
            primaryDiagnosis: dto.medicalProfile.primaryDiagnosis ?? 'Pending diagnosis update',
            comorbidities: dto.medicalProfile.comorbidities,
            heightCm: dto.medicalProfile.heightCm,
            weightKg: dto.medicalProfile.weightKg,
            allergies: dto.medicalProfile.allergies,
            currentMedication: dto.medicalProfile.currentMedication,
            lastAssessmentDate: dto.medicalProfile.lastAssessmentDate
              ? new Date(dto.medicalProfile.lastAssessmentDate)
              : undefined,
          },
          update: {
            primaryDiagnosis: dto.medicalProfile.primaryDiagnosis,
            comorbidities: dto.medicalProfile.comorbidities,
            heightCm: dto.medicalProfile.heightCm,
            weightKg: dto.medicalProfile.weightKg,
            allergies: dto.medicalProfile.allergies,
            currentMedication: dto.medicalProfile.currentMedication,
            lastAssessmentDate: dto.medicalProfile.lastAssessmentDate
              ? new Date(dto.medicalProfile.lastAssessmentDate)
              : undefined,
          },
        });
      }

      if (dto.request) {
        await tx.patientRequest.upsert({
          where: { patientId: id },
          create: {
            patientId: id,
            organType: dto.request.organType ?? 'KIDNEY',
            requestedOn: dto.request.requestedOn ? new Date(dto.request.requestedOn) : undefined,
            requiredBy: dto.request.requiredBy ? new Date(dto.request.requiredBy) : undefined,
            hospitalPriority: dto.request.hospitalPriority,
            notes: dto.request.notes,
          },
          update: {
            organType: dto.request.organType,
            requestedOn: dto.request.requestedOn ? new Date(dto.request.requestedOn) : undefined,
            requiredBy: dto.request.requiredBy ? new Date(dto.request.requiredBy) : undefined,
            hospitalPriority: dto.request.hospitalPriority,
            notes: dto.request.notes,
          },
        });
      }

      if (dto.guardians) {
        await tx.patientGuardian.deleteMany({
          where: { patientId: id },
        });

        if (dto.guardians.length) {
          await tx.patientGuardian.createMany({
            data: dto.guardians.map((guardian) => ({
              patientId: id,
              fullName: guardian.fullName ?? 'Guardian',
              relation: guardian.relation ?? 'Family',
              phone: guardian.phone ?? 'Not Provided',
              email: guardian.email ?? null,
              isPrimary: guardian.isPrimary ?? false,
            })),
          });
        }
      }

      if (dto.caseStatus && dto.caseStatus !== CaseStatus.CLOSED) {
        await tx.caseTimeline.create({
          data: {
            patientId: id,
            eventType: 'STATUS_UPDATE',
            description: `Case status updated to ${dto.caseStatus}`,
            createdBy: 'System',
          },
        });
      }
    });

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.patient.delete({ where: { id } });
    return { success: true, message: `Patient ${id} deleted` };
  }
}
