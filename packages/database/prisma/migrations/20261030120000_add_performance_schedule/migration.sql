-- AlterTable
ALTER TABLE "performances" ADD COLUMN     "decidedAt" TIMESTAMP(3),
ADD COLUMN     "feedbackEndAt" TIMESTAMP(3),
ADD COLUMN     "feedbackStartAt" TIMESTAMP(3),
ADD COLUMN     "passCount" INTEGER,
ADD COLUMN     "penaltyPerMissingReview" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "recruitEndAt" TIMESTAMP(3),
ADD COLUMN     "recruitStartAt" TIMESTAMP(3);

-- 옛 공연은 "공연 종료까지 팀 모집"이던 동작을 그대로 보존
-- 공연이 끝난 뒤 등록된 옛 공연(createdAt > endAt)도 모집 시작 ≤ 모집 종료가 되게 LEAST (NULL은 무시)
UPDATE "performances" SET "recruitStartAt" = LEAST("createdAt", "endAt"), "recruitEndAt" = "endAt";
