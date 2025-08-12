import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Tags-Tabelle
export const tags = sqliteTable('tags', {
	id: integer('id').primaryKey({ autoIncrement: true }),

	// Name des Tags (z. B. "Rechnung", "Privat")
	name: text('name').notNull().unique(),

	// Farbe in HEX (z. B. "#ff0000")
	color: text('color').notNull()
});

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
