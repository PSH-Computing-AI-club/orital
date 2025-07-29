CREATE TABLE `uploads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`upload_id` text(26) NOT NULL,
	`uploader_user_id` integer NOT NULL,
	`file_name` text(256) NOT NULL,
	`file_size` integer NOT NULL,
	`mime_type` text NOT NULL,
	`created_at` integer DEFAULT (UNIXEPOCH('now', 'subsec') * 1000) NOT NULL,
	FOREIGN KEY (`uploader_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uploads_upload_id_unique` ON `uploads` (`upload_id`);--> statement-breakpoint
CREATE INDEX `uploads_created_at_idx` ON `uploads` (`created_at`);