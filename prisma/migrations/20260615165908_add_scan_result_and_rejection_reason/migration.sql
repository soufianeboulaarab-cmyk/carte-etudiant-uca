-- CreateEnum
CREATE TYPE "ScanResult" AS ENUM ('APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RejectionReason" AS ENUM ('PHOTO_MISMATCH', 'NOT_ENROLLED', 'QR_EXPIRED', 'CARD_SUSPENDED', 'WRONG_ESTABLISHMENT', 'OTHER');

-- AlterTable
ALTER TABLE "ScanLog" ADD COLUMN     "rejectionReason" "RejectionReason",
ADD COLUMN     "result" "ScanResult" NOT NULL DEFAULT 'APPROVED';
