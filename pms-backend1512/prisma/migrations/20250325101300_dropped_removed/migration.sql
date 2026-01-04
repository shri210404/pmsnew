/*
  Warnings:

  - The values [DROPPED] on the enum `Proposal_submittedStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Proposal` MODIFY `submittedStatus` ENUM('PROPOSED', 'REJECTED_CLIENT', 'REJECTED_INTERNAL', 'IN_PROCESS', 'SELECTED', 'SUBMITTED', 'JOINED', 'DROPPED_CLIENT', 'DROPPED_INTERNAL') NULL;
