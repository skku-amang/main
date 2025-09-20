/*
  Warnings:

  - You are about to drop the column `endDatetime` on the `performances` table. All the data in the column will be lost.
  - You are about to drop the column `startDatetime` on the `performances` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."performances" DROP COLUMN "endDatetime",
DROP COLUMN "startDatetime",
ADD COLUMN     "endDateTime" TIMESTAMP(3),
ADD COLUMN     "startDateTime" TIMESTAMP(3);
