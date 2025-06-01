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
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`account_id` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`created_at` integer DEFAULT (UNIXEPOCH('now', 'subsec') * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_account_id_unique` ON `users` (`account_id`);