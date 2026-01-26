/*
  Warnings:

  - Made the column `equipmentId` on table `equipment_rentals` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."equipment_rentals" DROP CONSTRAINT "equipment_rentals_equipmentId_fkey";

-- AlterTable
ALTER TABLE "public"."equipment_rentals" ALTER COLUMN "equipmentId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."equipment_rentals" ADD CONSTRAINT "equipment_rentals_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "public"."equipments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
