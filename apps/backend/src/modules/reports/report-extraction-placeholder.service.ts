import { Injectable } from '@nestjs/common';

type MockExtractionInput = {
  patient: {
    bloodGroup: string;
    urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    medicalProfile?: {
      primaryDiagnosis?: string | null;
      comorbidities?: string | null;
    } | null;
  };
  fileName: string;
};

@Injectable()
export class ReportExtractionPlaceholderService {
  extractReport(input: MockExtractionInput) {
    const diagnosis =
      input.patient.medicalProfile?.primaryDiagnosis ?? 'Clinical summary pending consultant review';

    const keyNotes = `Mock extraction from ${input.fileName}. Refer clinician validation before final action.`;

    const urgencyHint =
      input.patient.urgencyLevel === 'CRITICAL'
        ? 'Critical case. Prioritize immediate panel review.'
        : input.patient.urgencyLevel === 'HIGH'
          ? 'High urgency. Schedule review in the next cycle.'
          : 'Routine review queue suitable.';

    const flaggedConditions =
      input.patient.medicalProfile?.comorbidities
        ?.split(',')
        .map((item) => item.trim())
        .filter(Boolean) ?? [];

    return {
      bloodGroup: input.patient.bloodGroup,
      diagnosis,
      keyNotes,
      urgencyHint,
      flaggedConditions: flaggedConditions.length
        ? flaggedConditions
        : ['No major flagged conditions in mock extraction'],
      rawPayload: {
        engine: 'mock-report-parser-v1',
        confidence: 0.81,
        generatedAt: new Date().toISOString(),
      },
    };
  }
}
