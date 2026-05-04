-- AlterTable
ALTER TABLE "users" ADD COLUMN     "previousHashedRefreshToken" TEXT,
ADD COLUMN     "refreshTokenRotatedAt" TIMESTAMP(3);
