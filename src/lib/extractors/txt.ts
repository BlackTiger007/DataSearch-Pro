import type { NewScan } from '$lib/db/schema/scans';
import type { QueueItem } from '$lib/types/indexing';
import { sanitizeText } from '$lib/utils/sanitizeText';
import { splitSmartForDb } from '$lib/utils/split';
import { readFile } from '@tauri-apps/plugin-fs';
import { createTextDecoder } from '$lib/types/encodings';

/**
 * Extrahiert Text aus einer Datei und gibt ihn in NewScan-Chunks zurück.
 * @param file Die zu extrahierende Datei
 * @param id Die ID des übergeordneten Scans
 * @param encoding Optional: Text-Encoding (default aus Settings)
 * @returns Array von NewScan-Objekten
 */
export async function extract(file: QueueItem, id: number): Promise<NewScan[]> {
	const binary = await readFile(file.file);
	const decoder = createTextDecoder();
	const text = decoder.decode(binary);

	const lines = text.split(/\r?\n/); // Zeilenweise

	const textChunks: NewScan[] = [];
	let lineNumber = 0;

	for (const line of lines) {
		const clean = sanitizeText(line);
		if (!clean) continue;
		lineNumber++;

		textChunks.push(...splitSmartForDb(clean, lineNumber, id));
	}

	return textChunks;
}
