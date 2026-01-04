/*
  Warnings:

  - Added the required column `proposedTo` to the `Proposal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Proposal` ADD COLUMN `proposedTo` VARCHAR(191) NOT NULL;
