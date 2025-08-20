ALTER TABLE `events` ADD `start_at` integer;--> statement-breakpoint
ALTER TABLE `events` ADD `end_at` integer;--> statement-breakpoint
CREATE INDEX `events_end_at_idx` ON `events` (`end_at`);--> statement-breakpoint
CREATE INDEX `events_start_at_idx` ON `events` (`start_at`);--> statement-breakpoint
DROP VIEW `events_with_poster`;--> statement-breakpoint
DROP VIEW `published_events`;--> statement-breakpoint
CREATE VIEW `events_with_poster` AS select "events"."id", "events"."event_id", "events"."poster_user_id", "events"."state", "events"."title", "events"."content", "events"."start_at", "events"."end_at", "events"."created_at", "events"."updated_at", "events"."published_at", "users"."id", "users"."account_id", "users"."first_name", "users"."last_name", "users"."created_at" from "events" inner join "users" on "events"."poster_user_id" = "users"."id";--> statement-breakpoint
CREATE VIEW `published_events` AS select "id", "event_id", "poster_user_id", "state", "title", "content", "start_at", "end_at", "created_at", "updated_at", "published_at" from "events" where ("events"."state" = 'STATE_PUBLISHED' and "events"."published_at" <= (UNIXEPOCH('now', 'subsec') * 1000));