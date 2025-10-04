/*
  Warnings:

  - You are about to alter the column `order` on the `generations` table. The data in that column could be lost. The data in that column will be cast from `Decimal(3,1)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "public"."generations" ALTER COLUMN "order" SET DATA TYPE INTEGER;
