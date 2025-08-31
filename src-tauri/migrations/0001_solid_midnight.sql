CREATE TABLE `file_versions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`file_id` integer NOT NULL,
	`version_number` integer NOT NULL,
	`description` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`file_id`) REFERENCES `files`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP INDEX `scans_file_chunk_unique`;--> statement-breakpoint
ALTER TABLE `scans` ADD `file_version_id` integer NOT NULL REFERENCES file_versions(id);--> statement-breakpoint
CREATE UNIQUE INDEX `scans_version_chunk_unique` ON `scans` (`file_version_id`,`line_number`,`chunk_number`);