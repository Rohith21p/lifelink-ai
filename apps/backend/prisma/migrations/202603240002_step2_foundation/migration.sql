CREATE TYPE "MatchReviewAction" AS ENUM ('REVIEW', 'SHORTLIST', 'APPROVE', 'REJECT', 'NOTIFY');
CREATE TYPE "DonationType" AS ENUM ('ORGAN', 'BLOOD', 'PLASMA');
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'SMS', 'EMAIL', 'WHATSAPP');
CREATE TYPE "NotificationEventType" AS ENUM (
  'NEW_MATCH_FOUND',
  'URGENT_CASE_CREATED',
  'DONOR_SHORTLISTED',
  'PATIENT_STATUS_UPDATED',
  'APPOINTMENT_REMINDER',
  'LOW_BLOOD_STOCK_ALERT'
);
CREATE TYPE "NotificationDeliveryStatus" AS ENUM ('QUEUED', 'SENT', 'FAILED');
CREATE TYPE "ReportFileType" AS ENUM ('PDF', 'IMAGE');
CREATE TYPE "ExtractionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
CREATE TYPE "BloodRequestStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'FULFILLED', 'CANCELLED');

ALTER TABLE "patients"
  ADD COLUMN "district" TEXT;

ALTER TABLE "donors"
  ADD COLUMN "district" TEXT;

ALTER TABLE "donor_preferences"
  ADD COLUMN "supported_donation_types" "DonationType"[] NOT NULL DEFAULT ARRAY[]::"DonationType"[];

ALTER TABLE "donor_patient_matches"
  ADD COLUMN "blood_compatibility_score" DOUBLE PRECISION,
  ADD COLUMN "location_score" DOUBLE PRECISION,
  ADD COLUMN "availability_score" DOUBLE PRECISION,
  ADD COLUMN "overall_score" DOUBLE PRECISION,
  ADD COLUMN "urgency_level" "UrgencyLevel",
  ADD COLUMN "review_notes" TEXT,
  ADD COLUMN "reviewed_at" TIMESTAMP(3),
  ADD COLUMN "notified_at" TIMESTAMP(3);

ALTER TABLE "notifications"
  ADD COLUMN "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
  ADD COLUMN "event_type" "NotificationEventType",
  ADD COLUMN "metadata" JSONB;

CREATE TABLE "match_reviews" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "match_id" UUID NOT NULL,
  "reviewer_coordinator_id" UUID,
  "action" "MatchReviewAction" NOT NULL,
  "note" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "match_reviews_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notification_templates" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "event_type" "NotificationEventType" NOT NULL,
  "channel" "NotificationChannel" NOT NULL,
  "subject" TEXT,
  "body_template" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "report_files" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "patient_id" UUID NOT NULL,
  "uploaded_by_coordinator_id" UUID,
  "file_name" TEXT NOT NULL,
  "file_type" "ReportFileType" NOT NULL,
  "file_url" TEXT,
  "file_size_kb" INTEGER,
  "notes" TEXT,
  "extraction_status" "ExtractionStatus" NOT NULL DEFAULT 'PENDING',
  "extracted_summary" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "report_files_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "report_extractions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "report_file_id" UUID NOT NULL,
  "status" "ExtractionStatus" NOT NULL DEFAULT 'PENDING',
  "blood_group" TEXT,
  "diagnosis" TEXT,
  "key_notes" TEXT,
  "urgency_hint" TEXT,
  "flagged_conditions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "raw_payload" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "report_extractions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "blood_banks" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "hospital_id" UUID,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "district" TEXT,
  "state" TEXT NOT NULL,
  "contact_number" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "blood_banks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "blood_inventory" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "blood_bank_id" UUID NOT NULL,
  "blood_group" TEXT NOT NULL,
  "units_available" INTEGER NOT NULL DEFAULT 0,
  "low_stock_threshold" INTEGER NOT NULL DEFAULT 10,
  "last_updated_by" TEXT,
  "last_updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "blood_inventory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "blood_requests" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "blood_bank_id" UUID NOT NULL,
  "patient_id" UUID,
  "requested_by_coordinator_id" UUID,
  "blood_group" TEXT NOT NULL,
  "units_requested" INTEGER NOT NULL,
  "status" "BloodRequestStatus" NOT NULL DEFAULT 'OPEN',
  "priority" "UrgencyLevel" NOT NULL DEFAULT 'MEDIUM',
  "required_by" TIMESTAMP(3),
  "notes" TEXT,
  "fulfilled_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "blood_requests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notification_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "notification_id" UUID,
  "template_id" UUID,
  "channel" "NotificationChannel" NOT NULL,
  "event_type" "NotificationEventType",
  "status" "NotificationDeliveryStatus" NOT NULL DEFAULT 'QUEUED',
  "recipient" TEXT,
  "message" TEXT NOT NULL,
  "metadata" JSONB,
  "patient_id" UUID,
  "donor_id" UUID,
  "match_id" UUID,
  "report_file_id" UUID,
  "blood_bank_id" UUID,
  "sent_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "notification_templates_name_key" ON "notification_templates"("name");
CREATE INDEX "notification_templates_event_type_channel_is_active_idx" ON "notification_templates"("event_type", "channel", "is_active");

CREATE INDEX "patients_city_district_state_idx" ON "patients"("city", "district", "state");
CREATE INDEX "donors_city_district_state_idx" ON "donors"("city", "district", "state");

CREATE INDEX "donor_patient_matches_urgency_level_status_idx" ON "donor_patient_matches"("urgency_level", "status");
CREATE INDEX "donor_patient_matches_overall_score_idx" ON "donor_patient_matches"("overall_score");

CREATE INDEX "notifications_event_type_created_at_idx" ON "notifications"("event_type", "created_at");

CREATE INDEX "match_reviews_match_id_created_at_idx" ON "match_reviews"("match_id", "created_at");

CREATE INDEX "report_files_patient_id_created_at_idx" ON "report_files"("patient_id", "created_at");
CREATE INDEX "report_files_extraction_status_idx" ON "report_files"("extraction_status");

CREATE INDEX "report_extractions_report_file_id_status_idx" ON "report_extractions"("report_file_id", "status");

CREATE UNIQUE INDEX "blood_banks_code_key" ON "blood_banks"("code");
CREATE INDEX "blood_banks_city_district_state_idx" ON "blood_banks"("city", "district", "state");

CREATE UNIQUE INDEX "blood_inventory_blood_bank_id_blood_group_key" ON "blood_inventory"("blood_bank_id", "blood_group");
CREATE INDEX "blood_inventory_units_available_low_stock_threshold_idx" ON "blood_inventory"("units_available", "low_stock_threshold");

CREATE INDEX "blood_requests_blood_bank_id_status_idx" ON "blood_requests"("blood_bank_id", "status");
CREATE INDEX "blood_requests_blood_group_priority_idx" ON "blood_requests"("blood_group", "priority");

CREATE INDEX "notification_logs_channel_status_created_at_idx" ON "notification_logs"("channel", "status", "created_at");
CREATE INDEX "notification_logs_event_type_created_at_idx" ON "notification_logs"("event_type", "created_at");

ALTER TABLE "match_reviews"
  ADD CONSTRAINT "match_reviews_match_id_fkey"
  FOREIGN KEY ("match_id") REFERENCES "donor_patient_matches"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "match_reviews"
  ADD CONSTRAINT "match_reviews_reviewer_coordinator_id_fkey"
  FOREIGN KEY ("reviewer_coordinator_id") REFERENCES "coordinators"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "report_files"
  ADD CONSTRAINT "report_files_patient_id_fkey"
  FOREIGN KEY ("patient_id") REFERENCES "patients"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "report_files"
  ADD CONSTRAINT "report_files_uploaded_by_coordinator_id_fkey"
  FOREIGN KEY ("uploaded_by_coordinator_id") REFERENCES "coordinators"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "report_extractions"
  ADD CONSTRAINT "report_extractions_report_file_id_fkey"
  FOREIGN KEY ("report_file_id") REFERENCES "report_files"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "blood_banks"
  ADD CONSTRAINT "blood_banks_hospital_id_fkey"
  FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "blood_inventory"
  ADD CONSTRAINT "blood_inventory_blood_bank_id_fkey"
  FOREIGN KEY ("blood_bank_id") REFERENCES "blood_banks"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "blood_requests"
  ADD CONSTRAINT "blood_requests_blood_bank_id_fkey"
  FOREIGN KEY ("blood_bank_id") REFERENCES "blood_banks"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "blood_requests"
  ADD CONSTRAINT "blood_requests_patient_id_fkey"
  FOREIGN KEY ("patient_id") REFERENCES "patients"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "blood_requests"
  ADD CONSTRAINT "blood_requests_requested_by_coordinator_id_fkey"
  FOREIGN KEY ("requested_by_coordinator_id") REFERENCES "coordinators"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "notification_logs"
  ADD CONSTRAINT "notification_logs_notification_id_fkey"
  FOREIGN KEY ("notification_id") REFERENCES "notifications"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "notification_logs"
  ADD CONSTRAINT "notification_logs_template_id_fkey"
  FOREIGN KEY ("template_id") REFERENCES "notification_templates"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "notification_logs"
  ADD CONSTRAINT "notification_logs_patient_id_fkey"
  FOREIGN KEY ("patient_id") REFERENCES "patients"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "notification_logs"
  ADD CONSTRAINT "notification_logs_donor_id_fkey"
  FOREIGN KEY ("donor_id") REFERENCES "donors"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "notification_logs"
  ADD CONSTRAINT "notification_logs_match_id_fkey"
  FOREIGN KEY ("match_id") REFERENCES "donor_patient_matches"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "notification_logs"
  ADD CONSTRAINT "notification_logs_report_file_id_fkey"
  FOREIGN KEY ("report_file_id") REFERENCES "report_files"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "notification_logs"
  ADD CONSTRAINT "notification_logs_blood_bank_id_fkey"
  FOREIGN KEY ("blood_bank_id") REFERENCES "blood_banks"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
