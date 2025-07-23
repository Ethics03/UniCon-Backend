/*
  Warnings:

  - You are about to drop the column `email` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `googleId` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `pictureUrl` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `verificationToken` on the `Users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bio]` on the table `Users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bio` to the `Users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `college` to the `Users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `graduationYear` to the `Users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('student', 'dropout', 'alumni', 'explorer');

-- DropIndex
DROP INDEX "Users_email_key";

-- DropIndex
DROP INDEX "Users_googleId_key";

-- DropIndex
DROP INDEX "Users_username_key";

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "email",
DROP COLUMN "googleId",
DROP COLUMN "isVerified",
DROP COLUMN "password",
DROP COLUMN "pictureUrl",
DROP COLUMN "username",
DROP COLUMN "verificationToken",
ADD COLUMN     "bio" VARCHAR(300) NOT NULL,
ADD COLUMN     "college" VARCHAR(100) NOT NULL,
ADD COLUMN     "collegeEmail" VARCHAR(150),
ADD COLUMN     "graduationYear" INTEGER NOT NULL,
ADD COLUMN     "role" "ROLE" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Users_bio_key" ON "Users"("bio");
