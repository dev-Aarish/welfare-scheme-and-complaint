-- Make profile fields nullable and drop the hardcoded defaults so a brand-new
-- user starts with a blank profile instead of seeded demo values.
ALTER TABLE "users" ALTER COLUMN "state" DROP NOT NULL;
ALTER TABLE "users" ALTER COLUMN "state" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "caste_category" DROP NOT NULL;
ALTER TABLE "users" ALTER COLUMN "caste_category" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "annual_income" DROP NOT NULL;
ALTER TABLE "users" ALTER COLUMN "annual_income" DROP DEFAULT;

-- Clear rows that only carry the old hardcoded defaults so existing users see
-- a blank profile until they fill it in themselves.
UPDATE "users"
SET "state" = NULL, "caste_category" = NULL, "annual_income" = NULL;

-- Add the new editable profile fields (all optional).
ALTER TABLE "users" ADD COLUMN "gender" TEXT;
ALTER TABLE "users" ADD COLUMN "age" INTEGER;
ALTER TABLE "users" ADD COLUMN "occupation" TEXT;
ALTER TABLE "users" ADD COLUMN "income_source" TEXT;
ALTER TABLE "users" ADD COLUMN "land_acres" DOUBLE PRECISION;
ALTER TABLE "users" ADD COLUMN "village" TEXT;
ALTER TABLE "users" ADD COLUMN "block" TEXT;
ALTER TABLE "users" ADD COLUMN "district" TEXT;