CREATE TABLE `articles_attachments` (
	`target_id` integer NOT NULL,
	`upload_id` integer NOT NULL,
	FOREIGN KEY (`target_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`upload_id`) REFERENCES `uploads`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `articles_attachments_upload_id_unique` ON `articles_attachments` (`upload_id`);--> statement-breakpoint
CREATE INDEX `articles_attachments_target_id_idx` ON `articles_attachments` (`target_id`);--> statement-breakpoint
CREATE INDEX `articles_attachments_target_id_upload_id_idx` ON `articles_attachments` (`target_id`,`upload_id`);