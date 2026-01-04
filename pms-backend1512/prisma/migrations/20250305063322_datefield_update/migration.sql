/*
  Warnings:

  - Made the column `createdAt` on table `Proposal` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Proposal` MODIFY `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6);
