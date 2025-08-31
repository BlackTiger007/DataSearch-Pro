import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { files } from './files';
import { fileVersions } from './fileVersions';

// Scans-Tabelle (zerlegte Text-Chunks pro Version)
export const scans = sqliteTable(
	'scans',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),

		// Text-Chunk
		content: text('content').notNull(),

		// Referenz zur Datei (direkter Zugriff möglich)
		fileId: integer('file_id')
			.notNull()
			.references(() => files.id, { onDelete: 'cascade' }),

		// Referenz zur Datei-Version
		fileVersionId: integer('file_version_id')
			.notNull()
			.references(() => fileVersions.id, { onDelete: 'cascade' }),

		// Zeilennummer in der Originaldatei
		lineNumber: integer('line_number').notNull(),

		// Chunknummer innerhalb der Zeile
		chunkNumber: integer('chunk_number').notNull(),

		// Zeitstempel
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
	},
	(table) => [
		uniqueIndex('scans_version_chunk_unique').on(
			table.fileVersionId,
			table.lineNumber,
			table.chunkNumber
		)
	]
);

export type Scan = typeof scans.$inferSelect;
export type NewScan = typeof scans.$inferInsert;
