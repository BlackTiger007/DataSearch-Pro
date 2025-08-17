import { db } from '$lib/db';
import { schema } from '$lib/db/schema';
import { exists } from '@tauri-apps/plugin-fs';
import { eq } from 'drizzle-orm';

/**
 * Überprüft alle DB-Dateien und entfernt Einträge,
 * deren Dateien nicht mehr existieren.
 */
export async function cleanupMissingFiles() {
	const allFiles = await db.query.files.findMany();

	for (const file of allFiles) {
		if (await exists(file.path)) continue;
		await db.delete(schema.files).where(eq(schema.files.id, file.id));
	}
}
