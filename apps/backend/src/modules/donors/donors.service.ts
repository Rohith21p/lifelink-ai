import { Injectable, NotFoundException } from '@nestjs/common';
import { DonorStatus } from '../../common/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDonorDto } from './dto/create-donor.dto';
import { UpdateDonorDto } from './dto/update-donor.dto';

const donorInclude = {
  hospital: true,
  coordinator: true,
  medicalProfile: true,
  availability: true,
  preference: true,
  matches: {
    include: {
      patient: true,
    },
    orderBy: {
      createdAt: 'desc' as const,
    },
  },
};

@Injectable()
export class DonorsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateDonorDto) {
    return this.prisma.donor.create({
      data: {
        hospitalId: dto.hospitalId,
        coordinatorId: dto.coordinatorId,
        donorCode: dto.donorCode,
        fullName: dto.fullName,
        age: dto.age,
        gender: dto.gender,
        bloodGroup: dto.bloodGroup,
        city: dto.city,
        district: dto.district,
        state: dto.state,
        status: dto.status ?? DonorStatus.AVAILABLE,
        lastDonationDate: dto.lastDonationDate ? new Date(dto.lastDonationDate) : undefined,
        availableFrom: dto.availableFrom ? new Date(dto.availableFrom) : undefined,
        medicalProfile: {
          create: {
            bmi: dto.medicalProfile.bmi,
            medicalConditions: dto.medicalProfile.medicalConditions,
            infectiousDiseaseScreening: dto.medicalProfile.infectiousDiseaseScreening,
            lastScreeningDate: dto.medicalProfile.lastScreeningDate
              ? new Date(dto.medicalProfile.lastScreeningDate)
              : undefined,
            notes: dto.medicalProfile.notes,
          },
        },
        availability: {
          create: {
            isAvailable: dto.availability.isAvailable ?? true,
            availableDays: dto.availability.availableDays ?? [],
            preferredTimeWindow: dto.availability.preferredTimeWindow,
            travelRadiusKm: dto.availability.travelRadiusKm,
          },
        },
        preference: {
          create: {
            organDonationOptIn: dto.preference.organDonationOptIn ?? true,
            bloodDonationOptIn: dto.preference.bloodDonationOptIn ?? true,
            maxRequestsPerMonth: dto.preference.maxRequestsPerMonth,
            supportedDonationTypes: dto.preference.supportedDonationTypes ?? [],
            preferredHospitals: dto.preference.preferredHospitals ?? [],
          },
        },
      },
      include: donorInclude,
    });
  }

  findAll() {
    return this.prisma.donor.findMany({
      include: donorInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const donor = await this.prisma.donor.findUnique({
      where: { id },
      include: donorInclude,
    });

    if (!donor) {
      throw new NotFoundException(`Donor ${id} not found`);
    }

    return donor;
  }

  async update(id: string, dto: UpdateDonorDto) {
    await this.findOne(id);

    await this.prisma.$transaction(async (tx) => {
      await tx.donor.update({
        where: { id },
        data: {
          hospitalId: dto.hospitalId,
          coordinatorId: dto.coordinatorId,
          donorCode: dto.donorCode,
          fullName: dto.fullName,
          age: dto.age,
          gender: dto.gender,
          bloodGroup: dto.bloodGroup,
          city: dto.city,
          district: dto.district,
          state: dto.state,
          status: dto.status,
          lastDonationDate: dto.lastDonationDate ? new Date(dto.lastDonationDate) : undefined,
          availableFrom: dto.availableFrom ? new Date(dto.availableFrom) : undefined,
        },
      });

      if (dto.medicalProfile) {
        await tx.donorMedicalProfile.upsert({
          where: { donorId: id },
          create: {
            donorId: id,
            bmi: dto.medicalProfile.bmi,
            medicalConditions: dto.medicalProfile.medicalConditions,
            infectiousDiseaseScreening: dto.medicalProfile.infectiousDiseaseScreening,
            lastScreeningDate: dto.medicalProfile.lastScreeningDate
              ? new Date(dto.medicalProfile.lastScreeningDate)
              : undefined,
            notes: dto.medicalProfile.notes,
          },
          update: {
            bmi: dto.medicalProfile.bmi,
            medicalConditions: dto.medicalProfile.medicalConditions,
            infectiousDiseaseScreening: dto.medicalProfile.infectiousDiseaseScreening,
            lastScreeningDate: dto.medicalProfile.lastScreeningDate
              ? new Date(dto.medicalProfile.lastScreeningDate)
              : undefined,
            notes: dto.medicalProfile.notes,
          },
        });
      }

      if (dto.availability) {
        await tx.donorAvailability.upsert({
          where: { donorId: id },
          create: {
            donorId: id,
            isAvailable: dto.availability.isAvailable ?? true,
            availableDays: dto.availability.availableDays ?? [],
            preferredTimeWindow: dto.availability.preferredTimeWindow,
            travelRadiusKm: dto.availability.travelRadiusKm,
          },
          update: {
            isAvailable: dto.availability.isAvailable,
            availableDays: dto.availability.availableDays,
            preferredTimeWindow: dto.availability.preferredTimeWindow,
            travelRadiusKm: dto.availability.travelRadiusKm,
          },
        });
      }

      if (dto.preference) {
        await tx.donorPreference.upsert({
          where: { donorId: id },
          create: {
            donorId: id,
            organDonationOptIn: dto.preference.organDonationOptIn ?? true,
            bloodDonationOptIn: dto.preference.bloodDonationOptIn ?? true,
            maxRequestsPerMonth: dto.preference.maxRequestsPerMonth,
            preferredHospitals: dto.preference.preferredHospitals ?? [],
          },
          update: {
            organDonationOptIn: dto.preference.organDonationOptIn,
            bloodDonationOptIn: dto.preference.bloodDonationOptIn,
            maxRequestsPerMonth: dto.preference.maxRequestsPerMonth,
            supportedDonationTypes: dto.preference.supportedDonationTypes,
            preferredHospitals: dto.preference.preferredHospitals,
          },
        });
      }
    });

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.donor.delete({ where: { id } });
    return { success: true, message: `Donor ${id} deleted` };
  }
}
