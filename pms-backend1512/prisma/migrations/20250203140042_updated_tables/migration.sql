/*
  Warnings:

  - You are about to alter the column `invoiceDate` on the `Proposal` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.
  - You are about to alter the column `joiningDate` on the `Proposal` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.
  - You are about to alter the column `selectionDate` on the `Proposal` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.
  - A unique constraint covering the columns `[email]` on the table `Proposal` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[invoiceNo]` on the table `Proposal` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[billingNo]` on the table `Proposal` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `UserRole` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Proposal` ADD COLUMN `proposalDate` DATETIME(3) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NULL,
    ADD COLUMN `updatedById` VARCHAR(191) NULL,
    MODIFY `nationality` VARCHAR(191) NULL,
    MODIFY `noticePeriod` INTEGER NULL,
    MODIFY `currentSalary` DOUBLE NULL,
    MODIFY `primarySkills` VARCHAR(191) NULL,
    MODIFY `invoiceDate` DATETIME(3) NULL,
    MODIFY `joiningDate` DATETIME(3) NULL,
    MODIFY `selectionDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `UserRole` MODIFY `email` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Language` (
    `id` VARCHAR(36) NOT NULL,
    `languageName` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `currency` (
    `id` VARCHAR(36) NOT NULL,
    `currencyName` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Proposal_email_key` ON `Proposal`(`email`);

-- CreateIndex
CREATE UNIQUE INDEX `Proposal_invoiceNo_key` ON `Proposal`(`invoiceNo`);

-- CreateIndex
CREATE UNIQUE INDEX `Proposal_billingNo_key` ON `Proposal`(`billingNo`);

-- CreateIndex
CREATE UNIQUE INDEX `UserRole_username_key` ON `UserRole`(`username`);

-- AddForeignKey
ALTER TABLE `Proposal` ADD CONSTRAINT `Proposal_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
