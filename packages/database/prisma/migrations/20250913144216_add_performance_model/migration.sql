/*
  Warnings:

  - Added the required column `performanceId` to the `teams` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."teams" ADD COLUMN     "performanceId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."performances" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "representativeImage" TEXT,
    "location" TEXT,
    "startDatetime" TIMESTAMP(3),
    "endDatetime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performances_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."teams" ADD CONSTRAINT "teams_performanceId_fkey" FOREIGN KEY ("performanceId") REFERENCES "public"."performances"("id") ON DELETE CASCADE ON UPDATE CASCADE;
