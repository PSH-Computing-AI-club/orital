CREATE INDEX `uploads_file_name_idx` ON `uploads` (`file_name`);--> statement-breakpoint
CREATE INDEX `uploads_file_size_idx` ON `uploads` (`file_size`);--> statement-breakpoint
CREATE INDEX `uploads_mime_type_idx` ON `uploads` (`mime_type`);--> statement-breakpoint
CREATE INDEX `uploads_uploader_user_id_idx` ON `uploads` (`uploader_user_id`);