ALTER TABLE `Job` ADD COLUMN `accessKey` VARCHAR(191) NULL;

UPDATE `Job` SET `accessKey` = REPLACE(UUID(), '-', '') WHERE `accessKey` IS NULL;

ALTER TABLE `Job` MODIFY `accessKey` VARCHAR(191) NOT NULL;

CREATE UNIQUE INDEX `Job_accessKey_key` ON `Job`(`accessKey`);
