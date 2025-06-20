CREATE TABLE `rooms` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`room_id` text NOT NULL,
	`presenter_user_id` integer NOT NULL,
	`title` text(32) DEFAULT 'A Presentation Room' NOT NULL,
	`created_at` integer DEFAULT (UNIXEPOCH('now', 'subsec') * 1000) NOT NULL,
	FOREIGN KEY (`presenter_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rooms_room_id_unique` ON `rooms` (`room_id`);