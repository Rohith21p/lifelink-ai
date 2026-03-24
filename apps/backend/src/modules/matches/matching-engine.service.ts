import { Injectable } from '@nestjs/common';

type DonationTypeValue = 'ORGAN' | 'BLOOD' | 'PLASMA';
type DonorStatusValue = 'AVAILABLE' | 'TEMP_UNAVAILABLE' | 'INACTIVE';
type OrganTypeValue =
  | 'KIDNEY'
  | 'LIVER'
  | 'HEART'
  | 'LUNG'
  | 'PANCREAS'
  | 'CORNEA'
  | 'BLOOD'
  | 'PLASMA';
type UrgencyLevelValue = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

type MatchPatientInput = {
  bloodGroup: string;
  city: string;
  district?: string | null;
  state: string;
  organNeeded: OrganTypeValue;
  urgencyLevel: UrgencyLevelValue;
};

type MatchDonorInput = {
  bloodGroup: string;
  city: string;
  district?: string | null;
  state: string;
  status: DonorStatusValue;
  availableFrom?: Date | null;
  availability?: {
    isAvailable: boolean;
  } | null;
  preference?: {
    organDonationOptIn: boolean;
    bloodDonationOptIn: boolean;
    supportedDonationTypes: DonationTypeValue[];
  } | null;
  medicalProfile?: {
    medicalConditions?: string | null;
    infectiousDiseaseScreening?: string | null;
  } | null;
};

export type MatchScoreBreakdown = {
  bloodCompatibilityScore: number;
  locationScore: number;
  availabilityScore: number;
  overallScore: number;
  donationTypeScore: number;
  healthScore: number;
  reasons: string[];
};

const RECIPIENT_DONOR_BLOOD_COMPATIBILITY: Record<string, string[]> = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
};

const HEALTH_CONCERN_KEYWORDS = [
  'chronic',
  'hypertension',
  'diabetes',
  'recovering',
  'pending',
  'infection',
  'positive',
  'cardiac',
  'renal',
];

@Injectable()
export class MatchingEngineService {
  calculateCompatibility(patient: MatchPatientInput, donor: MatchDonorInput): MatchScoreBreakdown {
    const bloodCompatibilityScore = this.calculateBloodScore(patient.bloodGroup, donor.bloodGroup);
    const locationScore = this.calculateLocationScore(patient, donor);
    const availabilityScore = this.calculateAvailabilityScore(donor);
    const donationTypeScore = this.calculateDonationTypeScore(patient.organNeeded, donor);
    const healthScore = this.calculateHealthScore(donor);

    const urgencyBoost = this.getUrgencyBoost(patient.urgencyLevel);
    const weightedOverall =
      bloodCompatibilityScore * 0.4 +
      locationScore * 0.2 +
      availabilityScore * 0.2 +
      donationTypeScore * 0.15 +
      healthScore * 0.05 +
      urgencyBoost;

    const overallScore = this.roundScore(weightedOverall);

    return {
      bloodCompatibilityScore,
      locationScore,
      availabilityScore,
      donationTypeScore,
      healthScore,
      overallScore,
      reasons: this.buildReasonSummary({
        bloodCompatibilityScore,
        locationScore,
        availabilityScore,
        donationTypeScore,
        healthScore,
      }),
    };
  }

  private calculateBloodScore(patientBloodGroup: string, donorBloodGroup: string) {
    const recipient = patientBloodGroup.toUpperCase();
    const donor = donorBloodGroup.toUpperCase();

    if (recipient === donor) {
      return 100;
    }

    const compatibleDonors = RECIPIENT_DONOR_BLOOD_COMPATIBILITY[recipient] ?? [];
    if (compatibleDonors.includes(donor)) {
      return 80;
    }

    return 0;
  }

  private calculateLocationScore(patient: MatchPatientInput, donor: MatchDonorInput) {
    const patientDistrict = (patient.district ?? '').trim().toLowerCase();
    const donorDistrict = (donor.district ?? '').trim().toLowerCase();
    const sameDistrict =
      patientDistrict.length > 0 && donorDistrict.length > 0 && patientDistrict === donorDistrict;

    if (sameDistrict) {
      return 100;
    }

    if (patient.city.trim().toLowerCase() === donor.city.trim().toLowerCase()) {
      return 85;
    }

    if (patient.state.trim().toLowerCase() === donor.state.trim().toLowerCase()) {
      return 65;
    }

    return 35;
  }

  private calculateAvailabilityScore(donor: MatchDonorInput) {
    let score = 100;

    if (donor.status === 'TEMP_UNAVAILABLE') {
      score = Math.min(score, 30);
    }

    if (donor.status === 'INACTIVE') {
      score = Math.min(score, 5);
    }

    if (donor.availability && !donor.availability.isAvailable) {
      score = Math.min(score, 20);
    }

    if (donor.availableFrom && donor.availableFrom.getTime() > Date.now()) {
      score = Math.min(score, 50);
    }

    if (!donor.availability) {
      score = Math.min(score, 70);
    }

    return this.roundScore(score);
  }

  private calculateDonationTypeScore(organNeeded: OrganTypeValue, donor: MatchDonorInput) {
    const requiredDonationType = this.resolveDonationType(organNeeded);

    if (!donor.preference) {
      return 60;
    }

    const supportsType = donor.preference.supportedDonationTypes.includes(requiredDonationType);

    if (supportsType) {
      return 100;
    }

    if (requiredDonationType === 'ORGAN') {
      return donor.preference.organDonationOptIn ? 85 : 0;
    }

    return donor.preference.bloodDonationOptIn ? 85 : 0;
  }

  private calculateHealthScore(donor: MatchDonorInput) {
    const medicalText = [
      donor.medicalProfile?.medicalConditions ?? '',
      donor.medicalProfile?.infectiousDiseaseScreening ?? '',
    ]
      .join(' ')
      .toLowerCase();

    if (!medicalText.trim()) {
      return 90;
    }

    let penalty = 0;
    for (const keyword of HEALTH_CONCERN_KEYWORDS) {
      if (medicalText.includes(keyword)) {
        penalty += 8;
      }
    }

    if (medicalText.includes('positive')) {
      penalty += 20;
    }

    const score = Math.max(0, 100 - Math.min(penalty, 70));
    return this.roundScore(score);
  }

  private getUrgencyBoost(urgencyLevel: UrgencyLevelValue) {
    if (urgencyLevel === 'CRITICAL') {
      return 10;
    }

    if (urgencyLevel === 'HIGH') {
      return 5;
    }

    return 0;
  }

  private resolveDonationType(organNeeded: OrganTypeValue): DonationTypeValue {
    if (organNeeded === 'BLOOD') {
      return 'BLOOD';
    }

    if (organNeeded === 'PLASMA') {
      return 'PLASMA';
    }

    return 'ORGAN';
  }

  private buildReasonSummary(scores: {
    bloodCompatibilityScore: number;
    locationScore: number;
    availabilityScore: number;
    donationTypeScore: number;
    healthScore: number;
  }) {
    const reasons: string[] = [];

    reasons.push(
      scores.bloodCompatibilityScore >= 80
        ? 'Blood group compatibility is favorable.'
        : 'Blood group compatibility needs clinical validation.',
    );

    reasons.push(
      scores.locationScore >= 85
        ? 'Patient and donor are geographically close.'
        : 'Location mismatch may impact donor coordination speed.',
    );

    reasons.push(
      scores.availabilityScore >= 70
        ? 'Donor availability is currently supportive.'
        : 'Donor availability may delay coordination timelines.',
    );

    reasons.push(
      scores.donationTypeScore >= 85
        ? 'Donation preference aligns with requested case type.'
        : 'Donation type preference is only partially aligned.',
    );

    reasons.push(
      scores.healthScore >= 70
        ? 'Donor medical profile appears suitable for shortlist review.'
        : 'Medical profile flags suggest additional screening before approval.',
    );

    return reasons;
  }

  private roundScore(value: number) {
    return Math.max(0, Math.min(100, Number(value.toFixed(1))));
  }
}
