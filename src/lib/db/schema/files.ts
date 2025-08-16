import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const files = sqliteTable('files', {
	// Eindeutige ID für jede Datei
	id: integer('id').primaryKey({ autoIncrement: true }),

	// Name der Datei (z. B. "bericht.pdf")
	name: text('name').notNull(),

	// Absoluter oder relativer Pfad auf dem System/Speicherort
	path: text('path').notNull().unique(),

	// Dateigröße in Bytes
	size: integer('size').notNull(),

	// MIME-Type (z. B. "application/pdf", "image/png")
	mimeType: text('mime_type').notNull(),

	// Optional: Hash für Integritätsprüfung oder Dublettenprüfung
	hash: text('hash'),

	// Zeitstempel, wann die Datei hinzugefügt wurde
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),

	// Zeitstempel, wann die Datei zuletzt geändert wurde
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),

	// Zeitstempel, wann die Datei zuletzt indexiert wurde
	indexedAt: integer('indexed_at', { mode: 'timestamp' }).notNull()
});

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
