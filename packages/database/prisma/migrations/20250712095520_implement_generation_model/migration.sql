/*
  Warnings:

  - You are about to drop the column `isActive` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isStaff` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isSuperuser` on the `users` table. All the data in the column will be lost.
  - Added the required column `generationId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "isActive",
DROP COLUMN "isStaff",
DROP COLUMN "isSuperuser",
ADD COLUMN     "generationId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "generations" (
    "id" SERIAL NOT NULL,
    "order" DECIMAL(3,1) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "leaderId" INTEGER,

    CONSTRAINT "generations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "generations_order_key" ON "generations"("order");

-- CreateIndex
CREATE UNIQUE INDEX "generations_leaderId_key" ON "generations"("leaderId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "generations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generations" ADD CONSTRAINT "generations_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
