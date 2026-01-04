/*
  Warnings:

  - You are about to drop the column `createdBy` on the `Proposal` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `UserRole` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdById` to the `Proposal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `UserRole` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `UserRole` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `UserRole` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `UserRole` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Proposal` DROP FOREIGN KEY `Proposal_createdBy_fkey`;

-- AlterTable
ALTER TABLE `Proposal` DROP COLUMN `createdBy`,
    ADD COLUMN `createdById` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `UserRole` ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `firstName` VARCHAR(191) NOT NULL,
    ADD COLUMN `lastName` VARCHAR(191) NOT NULL,
    ADD COLUMN `username` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `UserRole_email_key` ON `UserRole`(`email`);

-- AddForeignKey
ALTER TABLE `Proposal` ADD CONSTRAINT `Proposal_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
