-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false;

-- Approve all existing users
UPDATE "users" SET "isApproved" = true;
