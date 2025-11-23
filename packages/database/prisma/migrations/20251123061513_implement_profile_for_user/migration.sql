/*
  Warnings:

  - You are about to drop the column `userId` on the `team_members` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `generationId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `nickname` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `_SessionToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pre_users` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[teamSessionId,profileId]` on the table `team_members` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `profileId` to the `team_members` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."_SessionToUser" DROP CONSTRAINT "_SessionToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_SessionToUser" DROP CONSTRAINT "_SessionToUser_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."generations" DROP CONSTRAINT "generations_leaderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."sessions" DROP CONSTRAINT "sessions_leaderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."team_members" DROP CONSTRAINT "team_members_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."teams" DROP CONSTRAINT "teams_leaderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."users" DROP CONSTRAINT "users_generationId_fkey";

-- DropIndex
DROP INDEX "public"."team_members_teamSessionId_userId_key";

-- DropIndex
DROP INDEX "public"."users_nickname_key";

-- AlterTable
ALTER TABLE "public"."team_members" DROP COLUMN "userId",
ADD COLUMN     "profileId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "bio",
DROP COLUMN "generationId",
DROP COLUMN "image",
DROP COLUMN "nickname";

-- DropTable
DROP TABLE "public"."_SessionToUser";

-- DropTable
DROP TABLE "public"."pre_users";

-- CreateTable
CREATE TABLE "public"."profiles" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "nickname" TEXT NOT NULL,
    "bio" TEXT,
    "image" TEXT,
    "generationId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_ProfileToSession" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ProfileToSession_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "public"."profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_nickname_key" ON "public"."profiles"("nickname");

-- CreateIndex
CREATE INDEX "_ProfileToSession_B_index" ON "public"."_ProfileToSession"("B");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_teamSessionId_profileId_key" ON "public"."team_members"("teamSessionId", "profileId");

-- AddForeignKey
ALTER TABLE "public"."generations" ADD CONSTRAINT "generations_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "public"."profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "public"."profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teams" ADD CONSTRAINT "teams_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."team_members" ADD CONSTRAINT "team_members_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "public"."generations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ProfileToSession" ADD CONSTRAINT "_ProfileToSession_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ProfileToSession" ADD CONSTRAINT "_ProfileToSession_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
