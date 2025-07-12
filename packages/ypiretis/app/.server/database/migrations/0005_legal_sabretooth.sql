PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_articles` (
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
INSERT INTO `__new_articles`("id", "article_id", "poster_user_id", "state", "title", "content", "created_at", "updated_at", "published_at") SELECT "id", "article_id", "poster_user_id", "state", "title", "content", "created_at", "updated_at", "published_at" FROM `articles`;--> statement-breakpoint
DROP TABLE `articles`;--> statement-breakpoint
ALTER TABLE `__new_articles` RENAME TO `articles`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `articles_article_id_unique` ON `articles` (`article_id`);