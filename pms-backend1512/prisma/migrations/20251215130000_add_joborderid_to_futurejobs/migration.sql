-- AlterTable
ALTER TABLE `FutureJobsProfile` ADD COLUMN `jobOrderId` VARCHAR(36) NULL;

-- AddForeignKey
ALTER TABLE `FutureJobsProfile` ADD CONSTRAINT `FutureJobsProfile_jobOrderId_fkey` FOREIGN KEY (`jobOrderId`) REFERENCES `JobOrder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;


