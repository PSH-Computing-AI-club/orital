CREATE TABLE `articles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`article_id` text(26) NOT NULL,
	`poster_user_id` integer NOT NULL,
	`state` text NOT NULL,
	`title` text(64) NOT NULL,
	`content` text NOT NULL,
	`created_at` integer DEFAULT (UNIXEPOCH('now', 'subsec') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (UNIXEPOCH('now', 'subsec') * 1000) NOT NULL,
	`published_at` integer,
	FOREIGN KEY (`poster_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `articles_article_id_unique` ON `articles` (`article_id`);--> statement-breakpoint
CREATE INDEX `articles_created_at_idx` ON `articles` (`created_at`);--> statement-breakpoint
CREATE INDEX `articles_published_at_idx` ON `articles` (`published_at`);--> statement-breakpoint
CREATE INDEX `articles_state_idx` ON `articles` (`state`);--> statement-breakpoint
CREATE INDEX `articles_title_idx` ON `articles` (`title`);--> statement-breakpoint
CREATE INDEX `articles_updated_at_idx` ON `articles` (`updated_at`);--> statement-breakpoint
CREATE INDEX `articles_state_published_at_idx` ON `articles` (`state`,`published_at`);--> statement-breakpoint
CREATE TABLE `articles_attachments` (
	`target_id` integer NOT NULL,
	`upload_id` integer NOT NULL,
	FOREIGN KEY (`target_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`upload_id`) REFERENCES `uploads`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `articles_attachments_upload_id_unique` ON `articles_attachments` (`upload_id`);--> statement-breakpoint
CREATE INDEX `articles_attachments_target_id_idx` ON `articles_attachments` (`target_id`);--> statement-breakpoint
CREATE INDEX `articles_attachments_target_id_upload_id_idx` ON `articles_attachments` (`target_id`,`upload_id`);--> statement-breakpoint
CREATE TABLE `attendees` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`room_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`created_at` integer DEFAULT (UNIXEPOCH('now', 'subsec') * 1000) NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attendees_room_id_user_id_unique` ON `attendees` (`room_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `callback_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hash` text NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `callback_tokens_hash_unique` ON `callback_tokens` (`hash`);--> statement-breakpoint
CREATE INDEX `callback_tokens_idx_hash` ON `callback_tokens` (`hash`);--> statement-breakpoint
CREATE INDEX `callback_tokens_idx_expires_at` ON `callback_tokens` (`expires_at`);--> statement-breakpoint
CREATE TABLE `consent_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hash` text NOT NULL,
	`account_id` text NOT NULL,
	`callback_token_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`callback_token_id`) REFERENCES `callback_tokens`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `consent_tokens_hash_unique` ON `consent_tokens` (`hash`);--> statement-breakpoint
CREATE UNIQUE INDEX `consent_tokens_callback_token_id_unique` ON `consent_tokens` (`callback_token_id`);--> statement-breakpoint
CREATE INDEX `consent_tokens_idx_hash` ON `consent_tokens` (`hash`);--> statement-breakpoint
CREATE INDEX `consent_tokens_idx_expires_at` ON `consent_tokens` (`expires_at`);--> statement-breakpoint
CREATE TABLE `grant_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hash` text NOT NULL,
	`account_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `grant_tokens_hash_unique` ON `grant_tokens` (`hash`);--> statement-breakpoint
CREATE INDEX `grant_tokens_idx_hash` ON `grant_tokens` (`hash`);--> statement-breakpoint
CREATE INDEX `grant_tokens_idx_expires_at` ON `grant_tokens` (`expires_at`);--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`room_id` text(26) NOT NULL,
	`presenter_user_id` integer NOT NULL,
	`title` text(32) DEFAULT 'A Presentation Room' NOT NULL,
	`created_at` integer DEFAULT (UNIXEPOCH('now', 'subsec') * 1000) NOT NULL,
	FOREIGN KEY (`presenter_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rooms_room_id_unique` ON `rooms` (`room_id`);--> statement-breakpoint
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
CREATE INDEX `uploads_created_at_idx` ON `uploads` (`created_at`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`account_id` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`created_at` integer DEFAULT (UNIXEPOCH('now', 'subsec') * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_account_id_unique` ON `users` (`account_id`);--> statement-breakpoint
CREATE VIEW `articles_with_poster` AS select "articles"."id", "articles"."article_id", "articles"."poster_user_id", "articles"."state", "articles"."title", "articles"."content", "articles"."created_at", "articles"."updated_at", "articles"."published_at", "users"."id", "users"."account_id", "users"."first_name", "users"."last_name", "users"."created_at" from "articles" inner join "users" on "articles"."poster_user_id" = "users"."id";--> statement-breakpoint
CREATE VIEW `published_articles` AS select "id", "article_id", "poster_user_id", "state", "title", "content", "created_at", "updated_at", "published_at" from "articles" where ("articles"."state" = 'STATE_PUBLISHED' and "articles"."published_at" <= (UNIXEPOCH('now', 'subsec') * 1000));--> statement-breakpoint
CREATE VIEW `published_articles_with_poster` AS select "articles"."id", "articles"."article_id", "articles"."poster_user_id", "articles"."state", "articles"."title", "articles"."content", "articles"."created_at", "articles"."updated_at", "articles"."published_at", "users"."id", "users"."account_id", "users"."first_name", "users"."last_name", "users"."created_at" from "articles" inner join "users" on "articles"."poster_user_id" = "users"."id" where ("articles"."state" = 'STATE_PUBLISHED' and "articles"."published_at" <= (UNIXEPOCH('now', 'subsec') * 1000));