export type ID = string;

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type OrganType =
  | 'KIDNEY'
  | 'LIVER'
  | 'HEART'
  | 'LUNG'
  | 'PANCREAS'
  | 'CORNEA'
  | 'BLOOD'
  | 'PLASMA';
export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type CaseStatus =
  | 'NEW'
  | 'UNDER_REVIEW'
  | 'MATCHING'
  | 'TRANSPLANT_SCHEDULED'
  | 'CLOSED';
export type DonorStatus = 'AVAILABLE' | 'TEMP_UNAVAILABLE' | 'INACTIVE';
export type MatchStatus =
  | 'PENDING'
  | 'SHORTLISTED'
  | 'CONTACTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED';
export type MatchReviewAction = 'REVIEW' | 'SHORTLIST' | 'APPROVE' | 'REJECT' | 'NOTIFY';
export type DonationType = 'ORGAN' | 'BLOOD' | 'PLASMA';

export type NotificationType = 'INFO' | 'WARNING' | 'ALERT';
export type NotificationChannel = 'IN_APP' | 'SMS' | 'EMAIL' | 'WHATSAPP';
export type NotificationEventType =
  | 'NEW_MATCH_FOUND'
  | 'URGENT_CASE_CREATED'
  | 'DONOR_SHORTLISTED'
  | 'PATIENT_STATUS_UPDATED'
  | 'APPOINTMENT_REMINDER'
  | 'LOW_BLOOD_STOCK_ALERT';
export type NotificationDeliveryStatus = 'QUEUED' | 'SENT' | 'FAILED';

export type ReportFileType = 'PDF' | 'IMAGE';
export type ExtractionStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type BloodRequestStatus = 'OPEN' | 'IN_PROGRESS' | 'FULFILLED' | 'CANCELLED';

export type Hospital = {
  id: ID;
  name: string;
  code: string;
  city: string;
  state: string;
};

export type Coordinator = {
  id: ID;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'COORDINATOR' | 'EXECUTIVE';
};

export type PatientMedicalProfile = {
  id?: ID;
  primaryDiagnosis: string;
  comorbidities?: string;
  heightCm?: number;
  weightKg?: number;
  allergies?: string;
  currentMedication?: string;
  lastAssessmentDate?: string;
};

export type PatientRequest = {
  id?: ID;
  organType: OrganType;
  requestedOn?: string;
  requiredBy?: string;
  hospitalPriority?: number;
  notes?: string;
};

export type PatientGuardian = {
  id?: ID;
  fullName: string;
  relation: string;
  phone: string;
  email?: string;
  isPrimary?: boolean;
};

export type CaseTimeline = {
  id: ID;
  eventType: string;
  description: string;
  eventAt: string;
  createdBy: string;
};

export type Patient = {
  id: ID;
  hospitalId: ID;
  coordinatorId?: ID;
  uhid: string;
  fullName: string;
  age: number;
  gender: Gender;
  bloodGroup: string;
  city: string;
  district?: string | null;
  state: string;
  organNeeded: OrganType;
  urgencyLevel: UrgencyLevel;
  caseStatus: CaseStatus;
  requestActive: boolean;
  hospital?: Hospital;
  coordinator?: Coordinator;
  medicalProfile: PatientMedicalProfile;
  request: PatientRequest;
  guardians: PatientGuardian[];
  caseTimelines?: CaseTimeline[];
  createdAt: string;
  updatedAt: string;
};

export type CreatePatientPayload = Omit<
  Patient,
  'id' | 'hospital' | 'coordinator' | 'caseTimelines' | 'createdAt' | 'updatedAt'
>;

export type DonorMedicalProfile = {
  id?: ID;
  bmi?: number;
  medicalConditions?: string;
  infectiousDiseaseScreening?: string;
  lastScreeningDate?: string;
  notes?: string;
};

export type DonorAvailability = {
  id?: ID;
  isAvailable: boolean;
  availableDays: string[];
  preferredTimeWindow?: string;
  travelRadiusKm?: number;
};

export type DonorPreference = {
  id?: ID;
  organDonationOptIn: boolean;
  bloodDonationOptIn: boolean;
  maxRequestsPerMonth?: number;
  supportedDonationTypes?: DonationType[];
  preferredHospitals: string[];
};

export type Donor = {
  id: ID;
  hospitalId: ID;
  coordinatorId?: ID;
  donorCode: string;
  fullName: string;
  age: number;
  gender: Gender;
  bloodGroup: string;
  city: string;
  district?: string | null;
  state: string;
  status: DonorStatus;
  lastDonationDate?: string;
  availableFrom?: string;
  hospital?: Hospital;
  coordinator?: Coordinator;
  medicalProfile: DonorMedicalProfile;
  availability: DonorAvailability;
  preference: DonorPreference;
  createdAt: string;
  updatedAt: string;
};

export type CreateDonorPayload = Omit<Donor, 'id' | 'hospital' | 'coordinator' | 'createdAt' | 'updatedAt'>;

export type MatchReview = {
  id: ID;
  action: MatchReviewAction;
  note?: string | null;
  reviewerCoordinatorId?: ID;
  reviewer?: {
    id: ID;
    fullName: string;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type Match = {
  id: ID;
  patientId: ID;
  donorId: ID;
  status: MatchStatus;
  compatibilityScore?: number | null;
  bloodCompatibilityScore?: number | null;
  locationScore?: number | null;
  availabilityScore?: number | null;
  overallScore?: number | null;
  urgencyLevel?: UrgencyLevel | null;
  matchReason?: string | null;
  reviewNotes?: string | null;
  reviewedByCoordinatorId?: ID | null;
  reviewedAt?: string | null;
  notifiedAt?: string | null;
  patient: {
    id: ID;
    fullName: string;
    uhid: string;
    bloodGroup: string;
    city?: string;
    district?: string | null;
    state?: string;
    organNeeded: OrganType;
    urgencyLevel: UrgencyLevel;
    caseStatus?: CaseStatus;
    hospital?: {
      id: ID;
      name: string;
      city: string;
      state: string;
    };
    request?: PatientRequest | null;
    medicalProfile?: PatientMedicalProfile | null;
  };
  donor: {
    id: ID;
    fullName: string;
    donorCode: string;
    bloodGroup: string;
    city?: string;
    district?: string | null;
    state?: string;
    status: DonorStatus;
    availableFrom?: string | null;
    availability?: DonorAvailability | null;
    preference?: DonorPreference | null;
    medicalProfile?: DonorMedicalProfile | null;
    hospital?: {
      id: ID;
      name: string;
      city: string;
      state: string;
    };
  };
  reviews?: MatchReview[];
  createdAt: string;
  updatedAt: string;
};

export type MatchScoreBreakdown = {
  matchId: ID;
  bloodCompatibilityScore: number;
  locationScore: number;
  availabilityScore: number;
  overallScore: number;
  reviewNotes?: string | null;
  reasons: string[];
  updatedAt: string;
};

export type NotificationTemplate = {
  id: ID;
  name: string;
  eventType: NotificationEventType;
  channel: NotificationChannel;
  subject?: string | null;
  bodyTemplate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Notification = {
  id: ID;
  hospitalId?: ID | null;
  type: NotificationType;
  channel: NotificationChannel;
  eventType?: NotificationEventType | null;
  targetRole?: string | null;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NotificationLog = {
  id: ID;
  notificationId?: ID | null;
  templateId?: ID | null;
  channel: NotificationChannel;
  eventType?: NotificationEventType | null;
  status: NotificationDeliveryStatus;
  recipient?: string | null;
  message: string;
  metadata?: Record<string, unknown>;
  patientId?: ID | null;
  donorId?: ID | null;
  matchId?: ID | null;
  reportFileId?: ID | null;
  bloodBankId?: ID | null;
  sentAt?: string | null;
  createdAt: string;
  updatedAt: string;
  notification?: Notification | null;
  template?: NotificationTemplate | null;
};

export type ReportExtraction = {
  id: ID;
  reportFileId: ID;
  status: ExtractionStatus;
  bloodGroup?: string | null;
  diagnosis?: string | null;
  keyNotes?: string | null;
  urgencyHint?: string | null;
  flaggedConditions: string[];
  rawPayload?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type ReportFile = {
  id: ID;
  patientId: ID;
  uploadedByCoordinatorId?: ID | null;
  fileName: string;
  fileType: ReportFileType;
  fileUrl?: string | null;
  fileSizeKb?: number | null;
  notes?: string | null;
  extractionStatus: ExtractionStatus;
  extractedSummary?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  patient?: {
    id: ID;
    fullName: string;
    uhid: string;
    bloodGroup: string;
    urgencyLevel: UrgencyLevel;
    medicalProfile?: {
      primaryDiagnosis?: string | null;
      comorbidities?: string | null;
    } | null;
  };
  uploadedBy?: Coordinator | null;
  extractions?: ReportExtraction[];
};

export type BloodInventoryItem = {
  id: ID;
  bloodBankId: ID;
  bloodGroup: string;
  unitsAvailable: number;
  lowStockThreshold: number;
  lastUpdatedBy?: string | null;
  lastUpdatedAt: string;
  createdAt: string;
  updatedAt: string;
  bloodBank?: {
    id: ID;
    name: string;
    code: string;
    city: string;
    district?: string | null;
    state: string;
  };
};

export type BloodBank = {
  id: ID;
  hospitalId?: ID | null;
  name: string;
  code: string;
  address: string;
  city: string;
  district?: string | null;
  state: string;
  contactNumber: string;
  createdAt: string;
  updatedAt: string;
  inventory?: BloodInventoryItem[];
};

export type BloodRequest = {
  id: ID;
  bloodBankId: ID;
  patientId?: ID | null;
  requestedByCoordinatorId?: ID | null;
  bloodGroup: string;
  unitsRequested: number;
  status: BloodRequestStatus;
  priority: UrgencyLevel;
  requiredBy?: string | null;
  notes?: string | null;
  fulfilledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  patient?: {
    id: ID;
    fullName: string;
    uhid: string;
  } | null;
  requestedBy?: Coordinator | null;
  bloodBank?: {
    id: ID;
    name: string;
    code: string;
  };
};

export type DashboardSummary = {
  totalPatients: number;
  totalDonors: number;
  activeRequests: number;
  urgentCases: number;
  totalMatches: number;
  pendingReviews: number;
  approvedMatches: number;
  uploadedReportsCount: number;
  lowBloodStockAlerts: number;
  unreadNotifications: number;
  patientStatusBreakdown: { status: CaseStatus; count: number }[];
  donorStatusBreakdown: { status: DonorStatus; count: number }[];
  monthlyTrend: { month: string; requests: number; donations: number }[];
};

export type ActivityItem = {
  id: ID;
  category: string;
  title: string;
  description: string;
  timestamp: string;
};

export type CreateMatchPayload = {
  patientId: string;
  donorId: string;
  status?: MatchStatus;
  compatibilityScore?: number;
  urgencyLevel?: UrgencyLevel;
  matchReason?: string;
  reviewNotes?: string;
  reviewedByCoordinatorId?: string;
};

export type UpdateMatchStatusPayload = {
  status: MatchStatus;
  reviewedByCoordinatorId?: string;
  reviewNotes?: string;
};

export type UpdateMatchPayload = {
  patientId?: string;
  donorId?: string;
  status?: MatchStatus;
  compatibilityScore?: number;
  urgencyLevel?: UrgencyLevel;
  matchReason?: string;
  reviewNotes?: string;
  reviewedByCoordinatorId?: string;
};

export type CreateMatchReviewPayload = {
  action: MatchReviewAction;
  note?: string;
  reviewerCoordinatorId?: string;
};

export type CreateNotificationPayload = {
  hospitalId?: string;
  type?: NotificationType;
  channel?: NotificationChannel;
  eventType?: NotificationEventType;
  targetRole?: string;
  title: string;
  message: string;
  recipient?: string;
  patientId?: string;
  donorId?: string;
  matchId?: string;
  reportFileId?: string;
  bloodBankId?: string;
  metadata?: Record<string, unknown>;
};

export type UploadReportPayload = {
  patientId: string;
  uploadedByCoordinatorId?: string;
  fileName: string;
  fileType: ReportFileType;
  fileUrl?: string;
  fileSizeKb?: number;
  notes?: string;
  metadata?: Record<string, unknown>;
};

export type UpsertBloodStockPayload = {
  bloodBankId: string;
  bloodGroup: string;
  unitsAvailable: number;
  lowStockThreshold?: number;
  lastUpdatedBy?: string;
};
