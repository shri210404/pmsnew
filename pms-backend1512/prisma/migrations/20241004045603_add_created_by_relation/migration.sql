/*
  Warnings:

  - You are about to drop the column `createdBy` on the `Proposal` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `Proposal` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Proposal` DROP FOREIGN KEY `Proposal_createdBy_fkey`;

-- AlterTable
ALTER TABLE `Proposal` DROP COLUMN `createdBy`,
    ADD COLUMN `createdById` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Proposal` ADD CONSTRAINT `Proposal_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
