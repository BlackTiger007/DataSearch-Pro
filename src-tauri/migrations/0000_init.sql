CREATE TABLE
	`file_tags` (
		`file_id` integer NOT NULL,
		`tag_id` integer NOT NULL,
		FOREIGN KEY (`file_id`) REFERENCES `files` (`id`) ON UPDATE no action ON DELETE cascade,
		FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON UPDATE no action ON DELETE cascade
	);

--> statement-breakpoint
CREATE TABLE
	`files` (
		`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
		`name` text NOT NULL,
		`path` text NOT NULL,
		`size` integer NOT NULL,
		`mime_type` text NOT NULL,
		`hash` text,
		`created_at` integer NOT NULL,
		`updated_at` integer NOT NULL,
		`indexed_at` integer NOT NULL
	);

--> statement-breakpoint
CREATE UNIQUE INDEX `files_path_unique` ON `files` (`path`);

--> statement-breakpoint
CREATE TABLE
	`scans` (
		`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
		`content` text NOT NULL,
		`file_id` integer NOT NULL,
		`line_number` integer NOT NULL,
		`chunk_number` integer NOT NULL,
		`created_at` integer NOT NULL,
		FOREIGN KEY (`file_id`) REFERENCES `files` (`id`) ON UPDATE no action ON DELETE cascade
	);

--> statement-breakpoint
CREATE UNIQUE INDEX `scans_file_chunk_unique` ON `scans` (`file_id`, `line_number`, `chunk_number`);

--> statement-breakpoint
CREATE TABLE
	`settings` (
		`key` text PRIMARY KEY NOT NULL,
		`value` text NOT NULL
	);

--> statement-breakpoint
CREATE TABLE
	`tags` (
		`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
		`name` text NOT NULL,
		`color` text NOT NULL
	);

--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);