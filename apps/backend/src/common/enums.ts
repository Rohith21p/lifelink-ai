export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum CoordinatorRole {
  ADMIN = 'ADMIN',
  COORDINATOR = 'COORDINATOR',
  EXECUTIVE = 'EXECUTIVE',
}

export enum OrganType {
  KIDNEY = 'KIDNEY',
  LIVER = 'LIVER',
  HEART = 'HEART',
  LUNG = 'LUNG',
  PANCREAS = 'PANCREAS',
  CORNEA = 'CORNEA',
  BLOOD = 'BLOOD',
  PLASMA = 'PLASMA',
}

export enum UrgencyLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum CaseStatus {
  NEW = 'NEW',
  UNDER_REVIEW = 'UNDER_REVIEW',
  MATCHING = 'MATCHING',
  TRANSPLANT_SCHEDULED = 'TRANSPLANT_SCHEDULED',
  CLOSED = 'CLOSED',
}

export enum DonorStatus {
  AVAILABLE = 'AVAILABLE',
  TEMP_UNAVAILABLE = 'TEMP_UNAVAILABLE',
  INACTIVE = 'INACTIVE',
}

export enum MatchStatus {
  PENDING = 'PENDING',
  SHORTLISTED = 'SHORTLISTED',
  CONTACTED = 'CONTACTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

export enum MatchReviewAction {
  REVIEW = 'REVIEW',
  SHORTLIST = 'SHORTLIST',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  NOTIFY = 'NOTIFY',
}

export enum DonationType {
  ORGAN = 'ORGAN',
  BLOOD = 'BLOOD',
  PLASMA = 'PLASMA',
}

export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ALERT = 'ALERT',
}

export enum NotificationChannel {
  IN_APP = 'IN_APP',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
}

export enum NotificationEventType {
  NEW_MATCH_FOUND = 'NEW_MATCH_FOUND',
  URGENT_CASE_CREATED = 'URGENT_CASE_CREATED',
  DONOR_SHORTLISTED = 'DONOR_SHORTLISTED',
  PATIENT_STATUS_UPDATED = 'PATIENT_STATUS_UPDATED',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  LOW_BLOOD_STOCK_ALERT = 'LOW_BLOOD_STOCK_ALERT',
}

export enum NotificationDeliveryStatus {
  QUEUED = 'QUEUED',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

export enum ReportFileType {
  PDF = 'PDF',
  IMAGE = 'IMAGE',
}

export enum ExtractionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum BloodRequestStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  FULFILLED = 'FULFILLED',
  CANCELLED = 'CANCELLED',
}
