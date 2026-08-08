CREATE TABLE "complaint_evidence" (
    "id" TEXT NOT NULL,
    "complaint_id" TEXT NOT NULL,
    "media_url" TEXT NOT NULL,
    "media_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "complaint_evidence_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "complaint_evidence_complaint_id_idx" ON "complaint_evidence"("complaint_id");

ALTER TABLE "complaint_evidence" ADD CONSTRAINT "complaint_evidence_complaint_id_fkey"
  FOREIGN KEY ("complaint_id") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;
