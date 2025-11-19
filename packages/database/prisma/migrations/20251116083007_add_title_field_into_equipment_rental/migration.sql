/*
  Warnings:

  - Added the required column `title` to the `equipment_rentals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."equipment_rentals" ADD COLUMN     "title" TEXT NOT NULL;
