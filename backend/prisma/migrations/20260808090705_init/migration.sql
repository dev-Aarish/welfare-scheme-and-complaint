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
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "full_name" TEXT NOT NULL,
    "phone" TEXT,
    "state" TEXT NOT NULL DEFAULT 'WEST_BENGAL',
    "caste_category" TEXT NOT NULL DEFAULT 'General',
    "annual_income" DOUBLE PRECISION NOT NULL DEFAULT 120000,
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

-- CreateIndex
CREATE INDEX "schemes_category_idx" ON "schemes"("category");

-- CreateIndex
CREATE INDEX "schemes_title_idx" ON "schemes"("title");

-- CreateIndex
CREATE UNIQUE INDEX "schemes_source_external_id_key" ON "schemes"("source", "external_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
