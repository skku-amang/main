/*
  Warnings:

  - You are about to drop the column `image` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `hashedRefreshToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isAdmin` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `_ProfileToSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."BandSessionName" AS ENUM ('VOCAL', 'GUITAR', 'BASS', 'SYNTH', 'DRUM', 'STRINGS', 'WINDS');

-- DropForeignKey
ALTER TABLE "public"."_ProfileToSession" DROP CONSTRAINT "_ProfileToSession_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ProfileToSession" DROP CONSTRAINT "_ProfileToSession_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."sessions" DROP CONSTRAINT "sessions_leaderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."team_sessions" DROP CONSTRAINT "team_sessions_sessionId_fkey";

-- AlterTable
ALTER TABLE "public"."profiles" DROP COLUMN "image";

-- AlterTable
ALTER TABLE "public"."session" ADD COLUMN     "impersonatedBy" TEXT;

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "hashedRefreshToken",
DROP COLUMN "isAdmin",
ADD COLUMN     "banExpires" TIMESTAMP(3),
ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "banned" BOOLEAN DEFAULT false,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "role" TEXT;

-- DropTable
DROP TABLE "public"."_ProfileToSession";

-- DropTable
DROP TABLE "public"."sessions";

-- DropEnum
DROP TYPE "public"."SessionName";

-- CreateTable
CREATE TABLE "public"."band_sessions" (
    "id" SERIAL NOT NULL,
    "name" "public"."BandSessionName" NOT NULL,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "leaderId" INTEGER,

    CONSTRAINT "band_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_BandSessionToProfile" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_BandSessionToProfile_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "band_sessions_name_key" ON "public"."band_sessions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "band_sessions_leaderId_key" ON "public"."band_sessions"("leaderId");

-- CreateIndex
CREATE INDEX "_BandSessionToProfile_B_index" ON "public"."_BandSessionToProfile"("B");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "public"."account"("userId");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "public"."session"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "public"."verification"("identifier");

-- AddForeignKey
ALTER TABLE "public"."band_sessions" ADD CONSTRAINT "band_sessions_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "public"."profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."team_sessions" ADD CONSTRAINT "team_sessions_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."band_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_BandSessionToProfile" ADD CONSTRAINT "_BandSessionToProfile_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."band_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_BandSessionToProfile" ADD CONSTRAINT "_BandSessionToProfile_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
