-- Enum values are added one per statement so Postgres can commit each value
-- before the next migration references them (see check_safe_enum_use).
ALTER TYPE "ComplaintStatus" ADD VALUE 'SUBMITTED';
ALTER TYPE "ComplaintStatus" ADD VALUE 'ACKNOWLEDGED';
ALTER TYPE "ComplaintStatus" ADD VALUE 'DEPARTMENT_ASSIGNED';
ALTER TYPE "ComplaintStatus" ADD VALUE 'INVESTIGATION_IN_PROGRESS';
ALTER TYPE "ComplaintStatus" ADD VALUE 'ACTION_TAKEN';
ALTER TYPE "ComplaintStatus" ADD VALUE 'REOPENED';
ALTER TYPE "ComplaintStatus" ADD VALUE 'MORE_INFO_REQUIRED';
