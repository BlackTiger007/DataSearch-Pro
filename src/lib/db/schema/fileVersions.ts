import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { files } from './files';

export const fileVersions = sqliteTable('file_versions', {
	id: integer('id').primaryKey({ autoIncrement: true }),

	// Referenz zur Datei
	fileId: integer('file_id')
		.notNull()
		.references(() => files.id, { onDelete: 'cascade' }),

	// Versionsnummer (1, 2, 3, …)
	versionNumber: integer('version_number').notNull(),

	// Optional: Beschreibung oder Kommentar
	description: text('description'),

	// Zeitstempel, wann diese Version angelegt wurde
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export type FileVersion = typeof fileVersions.$inferSelect;
export type NewFileVersion = typeof fileVersions.$inferInsert;
