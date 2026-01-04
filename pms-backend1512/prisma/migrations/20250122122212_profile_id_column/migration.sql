/*
  Warnings:

  - Added the required column `profileId` to the `Proposal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Proposal` ADD COLUMN `profileId` VARCHAR(191) NOT NULL;
