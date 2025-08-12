import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { files } from './files';

// Scans-Tabelle
export const scans = sqliteTable('scans', {
	id: integer('id').primaryKey({ autoIncrement: true }),

	// Inhalt, der durchsuchbar ist (z. B. OCR-Text)
	content: text('content').notNull(),

	// Referenz zur Datei
	fileId: integer('file_id')
		.notNull()
		.references(() => files.id, { onDelete: 'cascade' }),

	// Zeitstempel, wann der Scan erstellt wurde
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export type Scan = typeof scans.$inferSelect;
export type NewScan = typeof scans.$inferInsert;
