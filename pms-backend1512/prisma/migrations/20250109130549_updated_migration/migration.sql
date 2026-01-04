/*
  Warnings:

  - You are about to drop the column `status` on the `Proposal` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Proposal` DROP COLUMN `status`,
    ADD COLUMN `currentJobDetails` VARCHAR(191) NULL,
    ADD COLUMN `currentLocation` VARCHAR(191) NULL,
    ADD COLUMN `educationLevel` VARCHAR(191) NULL,
    ADD COLUMN `gender` VARCHAR(191) NULL,
    ADD COLUMN `interviewAvailable` VARCHAR(191) NULL,
    ADD COLUMN `jobLanguage` VARCHAR(191) NULL,
    ADD COLUMN `passport` VARCHAR(191) NULL,
    ADD COLUMN `proficiency` VARCHAR(191) NULL,
    ADD COLUMN `proficiencyEnglish` VARCHAR(191) NULL,
    ADD COLUMN `reasonForJobChange` VARCHAR(191) NULL,
    ADD COLUMN `relevantYearsExperience` INTEGER NULL,
    ADD COLUMN `submittedStatus` ENUM('PROPOSED', 'REJECTED', 'IN_PROCESS', 'SELECTED') NULL,
    ADD COLUMN `totalYearsExperience` INTEGER NULL,
    ADD COLUMN `university` VARCHAR(191) NULL,
    ADD COLUMN `visaType` VARCHAR(191) NULL;
