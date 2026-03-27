/*
  Warnings:

  - You are about to drop the `_EquipmentRentalToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_EquipmentRentalToUser" DROP CONSTRAINT "_EquipmentRentalToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_EquipmentRentalToUser" DROP CONSTRAINT "_EquipmentRentalToUser_B_fkey";

-- AlterTable
ALTER TABLE "equipment_rentals" ADD COLUMN     "renterId" INTEGER;

-- DropTable
DROP TABLE "_EquipmentRentalToUser";

-- CreateTable
CREATE TABLE "_rentalUsers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_rentalUsers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_rentalUsers_B_index" ON "_rentalUsers"("B");

-- AddForeignKey
ALTER TABLE "equipment_rentals" ADD CONSTRAINT "equipment_rentals_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_rentalUsers" ADD CONSTRAINT "_rentalUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "equipment_rentals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_rentalUsers" ADD CONSTRAINT "_rentalUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
