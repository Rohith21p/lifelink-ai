CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE "CoordinatorRole" AS ENUM ('ADMIN', 'COORDINATOR', 'EXECUTIVE');
CREATE TYPE "OrganType" AS ENUM ('KIDNEY', 'LIVER', 'HEART', 'LUNG', 'PANCREAS', 'CORNEA', 'BLOOD', 'PLASMA');
CREATE TYPE "UrgencyLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "CaseStatus" AS ENUM ('NEW', 'UNDER_REVIEW', 'MATCHING', 'TRANSPLANT_SCHEDULED', 'CLOSED');
CREATE TYPE "DonorStatus" AS ENUM ('AVAILABLE', 'TEMP_UNAVAILABLE', 'INACTIVE');
CREATE TYPE "MatchStatus" AS ENUM ('PENDING', 'SHORTLISTED', 'CONTACTED', 'APPROVED', 'REJECTED', 'COMPLETED');
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'WARNING', 'ALERT');

CREATE TABLE "hospitals" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "contact_number" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "hospitals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "coordinators" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "hospital_id" UUID NOT NULL,
  "full_name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "role" "CoordinatorRole" NOT NULL DEFAULT 'COORDINATOR',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "coordinators_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "patients" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "hospital_id" UUID NOT NULL,
  "coordinator_id" UUID,
  "uhid" TEXT NOT NULL,
  "full_name" TEXT NOT NULL,
  "age" INTEGER NOT NULL,
  "gender" "Gender" NOT NULL,
  "blood_group" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "organ_needed" "OrganType" NOT NULL,
  "urgency_level" "UrgencyLevel" NOT NULL,
  "case_status" "CaseStatus" NOT NULL DEFAULT 'NEW',
  "request_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "patient_medical_profiles" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "patient_id" UUID NOT NULL,
  "primary_diagnosis" TEXT NOT NULL,
  "comorbidities" TEXT,
  "height_cm" DOUBLE PRECISION,
  "weight_kg" DOUBLE PRECISION,
  "allergies" TEXT,
  "current_medication" TEXT,
  "last_assessment_date" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "patient_medical_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "patient_requests" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "patient_id" UUID NOT NULL,
  "organ_type" "OrganType" NOT NULL,
  "requested_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "required_by" TIMESTAMP(3),
  "hospital_priority" INTEGER NOT NULL DEFAULT 3,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "patient_requests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "patient_guardians" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "patient_id" UUID NOT NULL,
  "full_name" TEXT NOT NULL,
  "relation" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT,
  "is_primary" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "patient_guardians_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "donors" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "hospital_id" UUID NOT NULL,
  "coordinator_id" UUID,
  "donor_code" TEXT NOT NULL,
  "full_name" TEXT NOT NULL,
  "age" INTEGER NOT NULL,
  "gender" "Gender" NOT NULL,
  "blood_group" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "status" "DonorStatus" NOT NULL DEFAULT 'AVAILABLE',
  "last_donation_date" TIMESTAMP(3),
  "available_from" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "donors_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "donor_medical_profiles" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "donor_id" UUID NOT NULL,
  "bmi" DOUBLE PRECISION,
  "medical_conditions" TEXT,
  "infectious_disease_screening" TEXT,
  "last_screening_date" TIMESTAMP(3),
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "donor_medical_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "donor_availability" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "donor_id" UUID NOT NULL,
  "is_available" BOOLEAN NOT NULL DEFAULT true,
  "available_days" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "preferred_time_window" TEXT,
  "travel_radius_km" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "donor_availability_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "donor_preferences" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "donor_id" UUID NOT NULL,
  "organ_donation_opt_in" BOOLEAN NOT NULL DEFAULT true,
  "blood_donation_opt_in" BOOLEAN NOT NULL DEFAULT true,
  "max_requests_per_month" INTEGER NOT NULL DEFAULT 2,
  "preferred_hospitals" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "donor_preferences_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "donor_patient_matches" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "patient_id" UUID NOT NULL,
  "donor_id" UUID NOT NULL,
  "status" "MatchStatus" NOT NULL DEFAULT 'PENDING',
  "compatibility_score" DOUBLE PRECISION,
  "match_reason" TEXT,
  "reviewed_by_coordinator_id" UUID,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "donor_patient_matches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notifications" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "hospital_id" UUID,
  "type" "NotificationType" NOT NULL,
  "target_role" TEXT,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "is_read" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "case_timelines" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "patient_id" UUID NOT NULL,
  "event_type" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "event_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "case_timelines_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "settings" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "hospital_id" UUID,
  "key" TEXT NOT NULL,
  "value" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "hospitals_code_key" ON "hospitals"("code");
CREATE INDEX "hospitals_city_state_idx" ON "hospitals"("city", "state");

CREATE UNIQUE INDEX "coordinators_email_key" ON "coordinators"("email");
CREATE INDEX "coordinators_hospital_id_role_idx" ON "coordinators"("hospital_id", "role");

CREATE UNIQUE INDEX "patients_uhid_key" ON "patients"("uhid");
CREATE INDEX "patients_hospital_id_idx" ON "patients"("hospital_id");
CREATE INDEX "patients_case_status_urgency_level_idx" ON "patients"("case_status", "urgency_level");
CREATE INDEX "patients_blood_group_organ_needed_idx" ON "patients"("blood_group", "organ_needed");

CREATE UNIQUE INDEX "patient_medical_profiles_patient_id_key" ON "patient_medical_profiles"("patient_id");
CREATE UNIQUE INDEX "patient_requests_patient_id_key" ON "patient_requests"("patient_id");
CREATE INDEX "patient_requests_organ_type_required_by_idx" ON "patient_requests"("organ_type", "required_by");
CREATE INDEX "patient_guardians_patient_id_is_primary_idx" ON "patient_guardians"("patient_id", "is_primary");

CREATE UNIQUE INDEX "donors_donor_code_key" ON "donors"("donor_code");
CREATE INDEX "donors_hospital_id_status_idx" ON "donors"("hospital_id", "status");
CREATE INDEX "donors_blood_group_status_idx" ON "donors"("blood_group", "status");

CREATE UNIQUE INDEX "donor_medical_profiles_donor_id_key" ON "donor_medical_profiles"("donor_id");
CREATE UNIQUE INDEX "donor_availability_donor_id_key" ON "donor_availability"("donor_id");
CREATE INDEX "donor_availability_is_available_idx" ON "donor_availability"("is_available");
CREATE UNIQUE INDEX "donor_preferences_donor_id_key" ON "donor_preferences"("donor_id");

CREATE UNIQUE INDEX "donor_patient_matches_patient_id_donor_id_key" ON "donor_patient_matches"("patient_id", "donor_id");
CREATE INDEX "donor_patient_matches_status_idx" ON "donor_patient_matches"("status");
CREATE INDEX "donor_patient_matches_patient_id_donor_id_idx" ON "donor_patient_matches"("patient_id", "donor_id");

CREATE INDEX "notifications_is_read_created_at_idx" ON "notifications"("is_read", "created_at");
CREATE INDEX "case_timelines_patient_id_event_at_idx" ON "case_timelines"("patient_id", "event_at");

CREATE UNIQUE INDEX "settings_hospital_id_key_key" ON "settings"("hospital_id", "key");
CREATE INDEX "settings_key_idx" ON "settings"("key");

ALTER TABLE "coordinators"
  ADD CONSTRAINT "coordinators_hospital_id_fkey"
  FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "patients"
  ADD CONSTRAINT "patients_hospital_id_fkey"
  FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "patients"
  ADD CONSTRAINT "patients_coordinator_id_fkey"
  FOREIGN KEY ("coordinator_id") REFERENCES "coordinators"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "patient_medical_profiles"
  ADD CONSTRAINT "patient_medical_profiles_patient_id_fkey"
  FOREIGN KEY ("patient_id") REFERENCES "patients"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "patient_requests"
  ADD CONSTRAINT "patient_requests_patient_id_fkey"
  FOREIGN KEY ("patient_id") REFERENCES "patients"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "patient_guardians"
  ADD CONSTRAINT "patient_guardians_patient_id_fkey"
  FOREIGN KEY ("patient_id") REFERENCES "patients"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "donors"
  ADD CONSTRAINT "donors_hospital_id_fkey"
  FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "donors"
  ADD CONSTRAINT "donors_coordinator_id_fkey"
  FOREIGN KEY ("coordinator_id") REFERENCES "coordinators"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "donor_medical_profiles"
  ADD CONSTRAINT "donor_medical_profiles_donor_id_fkey"
  FOREIGN KEY ("donor_id") REFERENCES "donors"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "donor_availability"
  ADD CONSTRAINT "donor_availability_donor_id_fkey"
  FOREIGN KEY ("donor_id") REFERENCES "donors"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "donor_preferences"
  ADD CONSTRAINT "donor_preferences_donor_id_fkey"
  FOREIGN KEY ("donor_id") REFERENCES "donors"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "donor_patient_matches"
  ADD CONSTRAINT "donor_patient_matches_patient_id_fkey"
  FOREIGN KEY ("patient_id") REFERENCES "patients"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "donor_patient_matches"
  ADD CONSTRAINT "donor_patient_matches_donor_id_fkey"
  FOREIGN KEY ("donor_id") REFERENCES "donors"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "donor_patient_matches"
  ADD CONSTRAINT "donor_patient_matches_reviewed_by_coordinator_id_fkey"
  FOREIGN KEY ("reviewed_by_coordinator_id") REFERENCES "coordinators"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "notifications"
  ADD CONSTRAINT "notifications_hospital_id_fkey"
  FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "case_timelines"
  ADD CONSTRAINT "case_timelines_patient_id_fkey"
  FOREIGN KEY ("patient_id") REFERENCES "patients"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "settings"
  ADD CONSTRAINT "settings_hospital_id_fkey"
  FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
