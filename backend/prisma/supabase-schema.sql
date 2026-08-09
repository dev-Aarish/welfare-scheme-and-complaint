-- ============================================================
-- sevanest – full schema for Supabase (PostgreSQL)
-- Generated from backend/prisma/schema.prisma via
--   prisma migrate diff --from-empty --to-schema-datamodel
--
-- How to run:
--   Option A (recommended): paste into Supabase Dashboard →
--     SQL Editor → Run. Creates everything below.
--   Option B (CLI): npx prisma migrate deploy (applies the
--     migrations folder automatically against DATABASE_URL).
-- ============================================================

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CITIZEN', 'OFFICER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('OPEN', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATED');

-- CreateTable
CREATE TABLE "schemes" (
    "id" TEXT NOT NULL,
    "external_id" TEXT,
    "source" TEXT NOT NULL DEFAULT 'system',
    "source_url" TEXT,
    "source_last_updated" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tag" TEXT,
    "description" TEXT NOT NULL,
    "benefit" TEXT NOT NULL,
    "eligibility" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "applications_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schemes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "supabase_id" TEXT,
    "email" TEXT,
    "full_name" TEXT NOT NULL,
    "phone" TEXT,
    "password_hash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CITIZEN',
    "gender" TEXT,
    "age" INTEGER,
    "state" TEXT,
    "caste_category" TEXT,
    "annual_income" DOUBLE PRECISION,
    "occupation" TEXT,
    "income_source" TEXT,
    "land_acres" DOUBLE PRECISION,
    "village" TEXT,
    "block" TEXT,
    "district" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_members" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "full_name" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "dob" TEXT,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'WEST_BENGAL',
    "residence_type" TEXT NOT NULL DEFAULT 'RURAL',
    "occupation" TEXT NOT NULL,
    "annual_income" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "is_student" BOOLEAN NOT NULL DEFAULT false,
    "is_disability" BOOLEAN NOT NULL DEFAULT false,
    "land_acres" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "family_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaints" (
    "id" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "category" TEXT NOT NULL DEFAULT 'OTHER',
    "priority" TEXT NOT NULL DEFAULT 'LOW',
    "photo_url" TEXT,
    "video_url" TEXT,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'OPEN',
    "is_escalated" BOOLEAN NOT NULL DEFAULT false,
    "escalation_level" INTEGER NOT NULL DEFAULT 0,
    "escalated_at" TIMESTAMP(3),
    "user_id" TEXT,
    "assigned_department_id" TEXT,
    "assigned_officer_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaint_evidence" (
    "id" TEXT NOT NULL,
    "complaint_id" TEXT NOT NULL,
    "media_url" TEXT NOT NULL,
    "media_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "complaint_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaint_remarks" (
    "id" TEXT NOT NULL,
    "complaint_id" TEXT NOT NULL,
    "admin_id" TEXT,
    "remark" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "complaint_remarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaint_status_histories" (
    "id" TEXT NOT NULL,
    "complaint_id" TEXT NOT NULL,
    "previous_status" TEXT,
    "new_status" TEXT NOT NULL,
    "changed_by_id" TEXT,
    "remark" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "complaint_status_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "schemes_category_idx" ON "schemes"("category");

-- CreateIndex
CREATE INDEX "schemes_title_idx" ON "schemes"("title");

-- CreateIndex
CREATE UNIQUE INDEX "schemes_source_external_id_key" ON "schemes"("source", "external_id");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_supabase_id_key" ON "users"("supabase_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "complaints_ref_key" ON "complaints"("ref");

-- CreateIndex
CREATE INDEX "complaint_evidence_complaint_id_idx" ON "complaint_evidence"("complaint_id");

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_assigned_department_id_fkey" FOREIGN KEY ("assigned_department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_assigned_officer_id_fkey" FOREIGN KEY ("assigned_officer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_evidence" ADD CONSTRAINT "complaint_evidence_complaint_id_fkey" FOREIGN KEY ("complaint_id") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_remarks" ADD CONSTRAINT "complaint_remarks_complaint_id_fkey" FOREIGN KEY ("complaint_id") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_remarks" ADD CONSTRAINT "complaint_remarks_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_status_histories" ADD CONSTRAINT "complaint_status_histories_complaint_id_fkey" FOREIGN KEY ("complaint_id") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_status_histories" ADD CONSTRAINT "complaint_status_histories_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
