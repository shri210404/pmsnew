/*
  Warnings:

  - You are about to drop the column `expectedSalary` on the `Proposal` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `Proposal` table. All the data in the column will be lost.
  - You are about to drop the column `templateName` on the `Proposal` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Proposal` DROP COLUMN `expectedSalary`,
    DROP COLUMN `gender`,
    DROP COLUMN `templateName`,
    ADD COLUMN `billingCurrency` VARCHAR(191) NULL,
    ADD COLUMN `billingNo` VARCHAR(191) NULL,
    ADD COLUMN `invoiceDate` VARCHAR(191) NULL,
    ADD COLUMN `invoiceNo` VARCHAR(191) NULL,
    ADD COLUMN `joiningDate` VARCHAR(191) NULL,
    ADD COLUMN `salaryCurrency` VARCHAR(191) NULL,
    ADD COLUMN `selectionDate` VARCHAR(191) NULL;
