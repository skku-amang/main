-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'PERFORMANCE_UPDATED';
ALTER TYPE "NotificationType" ADD VALUE 'TEAM_DELETED';
ALTER TYPE "NotificationType" ADD VALUE 'TEAM_LEADER_CHANGED';
ALTER TYPE "NotificationType" ADD VALUE 'TEAM_FILLED';
ALTER TYPE "NotificationType" ADD VALUE 'USER_SIGNED_UP';
ALTER TYPE "NotificationType" ADD VALUE 'USER_APPROVED';
