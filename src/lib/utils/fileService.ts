import { db } from '$lib/db';
import { schema } from '$lib/db/schema';
import { indexing } from '$lib/stores/indexing.svelte';
import { inArray } from 'drizzle-orm';

/**
 * Gibt eine Liste von Pfaden aller Dateien zurück, für die keine Scans existieren,
 * löscht diese Dateien optional oder setzt den Hash auf null.
 */
export async function handleUnscannedFiles() {
	// Alle Dateien abfragen
	const files = await db.select().from(schema.files);

	// Alle Scans abfragen (nur fileId)
	const scans = await db.select({ fileId: schema.scans.fileId }).from(schema.scans);

	const scannedFileIds = new Set(scans.map((s) => s.fileId));

	// Filtere Dateien, die keine Scans haben
	const unscanned = files.filter((f) => !scannedFileIds.has(f.id)).map((f) => f.path);

	if (unscanned.length === 0) return;

	// Alternativ Hash auf null setzen
	await db.update(schema.files).set({ hash: null }).where(inArray(schema.files.path, unscanned));

	// Optional wieder in Queue einfügen, um sie ggf. neu zu verarbeiten
	indexing.addToQueue(unscanned);
}
