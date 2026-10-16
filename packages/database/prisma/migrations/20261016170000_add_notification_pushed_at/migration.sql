-- AlterTable
ALTER TABLE "notifications" ADD COLUMN "pushedAt" TIMESTAMP(3);

-- 기존 알림은 이미 (즉시) 푸시됐거나 지난 것이라 미발송으로 취급하지 않는다
UPDATE "notifications" SET "pushedAt" = "createdAt";

-- CreateIndex
CREATE INDEX "notifications_pushedAt_idx" ON "notifications"("pushedAt");
