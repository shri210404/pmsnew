/*
  Warnings:

  - Made the column `updatedAt` on table `Proposal` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Proposal` MODIFY `createdAt` VARCHAR(191) NULL,
    MODIFY `updatedAt` VARCHAR(191) NOT NULL;
