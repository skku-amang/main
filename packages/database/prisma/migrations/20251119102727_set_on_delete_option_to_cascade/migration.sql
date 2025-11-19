-- DropForeignKey
ALTER TABLE "public"."equipment_rentals" DROP CONSTRAINT "equipment_rentals_equipmentId_fkey";

-- AddForeignKey
ALTER TABLE "public"."equipment_rentals" ADD CONSTRAINT "equipment_rentals_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "public"."equipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
