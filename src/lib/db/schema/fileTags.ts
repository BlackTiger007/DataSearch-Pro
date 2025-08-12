import { sqliteTable, integer } from 'drizzle-orm/sqlite-core';
import { files } from './files';
import { tags } from './tags';

// Zwischentabelle für viele-zu-viele Beziehung zwischen Dateien und Tags
export const fileTags = sqliteTable('file_tags', {
	fileId: integer('file_id')
		.notNull()
		.references(() => files.id, { onDelete: 'cascade' }),

	tagId: integer('tag_id')
		.notNull()
		.references(() => tags.id, { onDelete: 'cascade' })
});

export type FileTag = typeof fileTags.$inferSelect;
export type NewFileTag = typeof fileTags.$inferInsert;
