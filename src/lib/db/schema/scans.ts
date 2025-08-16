import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { files } from './files';

// Scans-Tabelle (zerlegte Text-Chunks)
export const scans = sqliteTable(
	'scans',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),

		// Text-Chunk (Teilinhalt, max. X Zeichen)
		content: text('content').notNull(),

		// Referenz zur Datei
		fileId: integer('file_id')
			.notNull()
			.references(() => files.id, { onDelete: 'cascade' }),

		// Nummer der Zeile in der Originaldatei
		lineNumber: integer('line_number').notNull(),

		// Nummer des Chunks innerhalb der Zeile (falls sie geteilt wurde)
		chunkNumber: integer('chunk_number').notNull(),

		// Zeitstempel
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
	},
	(table) => [
		uniqueIndex('scans_file_chunk_unique').on(table.fileId, table.lineNumber, table.chunkNumber)
	]
);

export type Scan = typeof scans.$inferSelect;
export type NewScan = typeof scans.$inferInsert;
