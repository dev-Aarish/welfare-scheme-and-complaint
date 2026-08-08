-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CITIZEN', 'OFFICER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('OPEN', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATED');

-- DropIndex
DROP INDEX "users_phone_key";

-- AlterTable (preserve existing role values)
ALTER TABLE "users" ADD COLUMN     "password_hash" TEXT;
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role" USING (CASE WHEN "role" = 'citizen' THEN 'CITIZEN'::"Role" WHEN "role" = 'officer' THEN 'OFFICER'::"Role" WHEN "role" = 'admin' THEN 'ADMIN'::"Role" ELSE 'CITIZEN'::"Role" END);
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'CITIZEN';

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
CREATE TABLE "complaints" (
    "id" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT NOT NULL,
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
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "complaints_ref_key" ON "complaints"("ref");

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_assigned_department_id_fkey" FOREIGN KEY ("assigned_department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_assigned_officer_id_fkey" FOREIGN KEY ("assigned_officer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_remarks" ADD CONSTRAINT "complaint_remarks_complaint_id_fkey" FOREIGN KEY ("complaint_id") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_remarks" ADD CONSTRAINT "complaint_remarks_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_status_histories" ADD CONSTRAINT "complaint_status_histories_complaint_id_fkey" FOREIGN KEY ("complaint_id") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_status_histories" ADD CONSTRAINT "complaint_status_histories_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
