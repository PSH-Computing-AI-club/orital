CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` text(26) NOT NULL,
	`poster_user_id` integer NOT NULL,
	`state` text NOT NULL,
	`title` text(64) COLLATE NOCASE NOT NULL,
	`content` text NOT NULL,
	`created_at` integer DEFAULT (UNIXEPOCH('now', 'subsec') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (UNIXEPOCH('now', 'subsec') * 1000) NOT NULL,
	`published_at` integer,
	FOREIGN KEY (`poster_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `events_event_id_unique` ON `events` (`event_id`);--> statement-breakpoint
CREATE INDEX `events_created_at_idx` ON `events` (`created_at`);--> statement-breakpoint
CREATE INDEX `events_published_at_idx` ON `events` (`published_at`);--> statement-breakpoint
CREATE INDEX `events_state_idx` ON `events` (`state`);--> statement-breakpoint
CREATE INDEX `events_title_idx` ON `events` (`title`);--> statement-breakpoint
CREATE INDEX `events_updated_at_idx` ON `events` (`updated_at`);--> statement-breakpoint
CREATE INDEX `events_state_published_at_idx` ON `events` (`state`,`published_at`);--> statement-breakpoint
CREATE TABLE `events_attachments` (
	`target_id` integer NOT NULL,
	`upload_id` integer NOT NULL,
	FOREIGN KEY (`target_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`upload_id`) REFERENCES `uploads`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `events_attachments_upload_id_unique` ON `events_attachments` (`upload_id`);--> statement-breakpoint
CREATE INDEX `events_attachments_target_id_idx` ON `events_attachments` (`target_id`);--> statement-breakpoint
CREATE INDEX `events_attachments_target_id_upload_id_idx` ON `events_attachments` (`target_id`,`upload_id`);--> statement-breakpoint
CREATE VIEW `events_with_poster` AS select "events"."id", "events"."event_id", "events"."poster_user_id", "events"."state", "events"."title", "events"."content", "events"."created_at", "events"."updated_at", "events"."published_at", "users"."id", "users"."account_id", "users"."first_name", "users"."last_name", "users"."created_at" from "events" inner join "users" on "events"."poster_user_id" = "users"."id";--> statement-breakpoint
CREATE VIEW `published_events` AS select "id", "event_id", "poster_user_id", "state", "title", "content", "created_at", "updated_at", "published_at" from "events" where ("events"."state" = 'STATE_PUBLISHED' and "events"."published_at" <= (UNIXEPOCH('now', 'subsec') * 1000));