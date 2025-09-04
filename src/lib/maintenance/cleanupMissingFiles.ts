import { db } from '$lib/db';
import { schema } from '$lib/db/schema';
import { message } from '@tauri-apps/plugin-dialog';
import { exists } from '@tauri-apps/plugin-fs';
import { eq } from 'drizzle-orm';
import { m } from '$lib/paraglide/messages';

/**
 * Überprüft alle DB-Dateien und entfernt Einträge,
 * deren Dateien nicht mehr existieren.
 * Liefert eine Statistik über geprüfte und gelöschte Einträge.
 */
export async function cleanupMissingFiles() {
	const allFiles = await db.query.files.findMany();
	let deletedCount = 0;

	for (const file of allFiles) {
		const fileExists = await exists(file.path);
		if (!fileExists) {
			await db.delete(schema.files).where(eq(schema.files.id, file.id));
			deletedCount++;
		}
	}

	const messageText = m.cleanup_missing_files_summary({
		total: allFiles.length,
		deleted: deletedCount,
		remaining: allFiles.length - deletedCount
	});

	message(messageText, { kind: 'info' });
}
