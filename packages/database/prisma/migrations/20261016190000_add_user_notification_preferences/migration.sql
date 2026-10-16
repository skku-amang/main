-- AlterTable
ALTER TABLE "users"
  ADD COLUMN "mutedNotificationTypes" "NotificationType"[] DEFAULT ARRAY[]::"NotificationType"[],
  ADD COLUMN "quietHoursEnabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "quietHoursStart" INTEGER NOT NULL DEFAULT 23,
  ADD COLUMN "quietHoursEnd" INTEGER NOT NULL DEFAULT 8;
