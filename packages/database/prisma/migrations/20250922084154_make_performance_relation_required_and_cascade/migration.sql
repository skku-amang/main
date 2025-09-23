/*
  Warnings:

  - Made the column `performanceId` on table `teams` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."teams" DROP CONSTRAINT "teams_performanceId_fkey";

-- AlterTable
ALTER TABLE "public"."teams" ALTER COLUMN "performanceId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."teams" ADD CONSTRAINT "teams_performanceId_fkey" FOREIGN KEY ("performanceId") REFERENCES "public"."performances"("id") ON DELETE CASCADE ON UPDATE CASCADE;
