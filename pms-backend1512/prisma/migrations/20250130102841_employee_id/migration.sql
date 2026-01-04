/*
  Warnings:

  - A unique constraint covering the columns `[employeeId]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Employee` ADD COLUMN `employeeId` VARCHAR(191) NULL,
    MODIFY `name` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Employee_employeeId_key` ON `Employee`(`employeeId`);
