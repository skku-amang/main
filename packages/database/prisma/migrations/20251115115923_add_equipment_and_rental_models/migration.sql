-- CreateEnum
CREATE TYPE "public"."EquipCategory" AS ENUM ('ROOM', 'SYNTHESIZER', 'MICROPHONE', 'GUITAR', 'BASS', 'DRUM', 'AUDIO_INTERFACE', 'CABLE', 'AMPLIFIER', 'SPEAKER', 'MIXER', 'ETC');

-- CreateTable
CREATE TABLE "public"."equipments" (
    "id" SERIAL NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "category" "public"."EquipCategory" NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."equipment_rentals" (
    "id" SERIAL NOT NULL,
    "equipmentId" INTEGER,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_rentals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_EquipmentRentalToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_EquipmentRentalToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EquipmentRentalToUser_B_index" ON "public"."_EquipmentRentalToUser"("B");

-- AddForeignKey
ALTER TABLE "public"."equipment_rentals" ADD CONSTRAINT "equipment_rentals_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "public"."equipments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EquipmentRentalToUser" ADD CONSTRAINT "_EquipmentRentalToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."equipment_rentals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EquipmentRentalToUser" ADD CONSTRAINT "_EquipmentRentalToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
