CREATE INDEX `articles_created_at_idx` ON `articles` (`created_at`);--> statement-breakpoint
CREATE INDEX `articles_published_at_idx` ON `articles` (`published_at`);--> statement-breakpoint
CREATE INDEX `articles_state_idx` ON `articles` (`state`);--> statement-breakpoint
CREATE INDEX `articles_title_idx` ON `articles` (`title`);--> statement-breakpoint
CREATE INDEX `articles_updated_at_idx` ON `articles` (`updated_at`);--> statement-breakpoint
CREATE INDEX `articles_state_published_at_idx` ON `articles` (`state`,`published_at`);