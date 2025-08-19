import type { NewScan } from '$lib/db/schema/scans';
import type { QueueItem } from '$lib/types/indexing';
import { sanitizeText } from '$lib/utils/sanitizeText';
import { splitSmartForDb } from '$lib/utils/split';
import { readFile } from '@tauri-apps/plugin-fs';
import mammoth from 'mammoth';

/**
 * Extrahiert den reinen Text aus einer .docx Datei (Browser/Tauri-kompatibel)
 * und gibt ihn in NewScan-Chunks zurück.
 */
export async function extractDocx(file: QueueItem, id: number): Promise<NewScan[]> {
	const uint8Array = await readFile(file.file);

	const arrayBuffer = uint8Array.slice().buffer;

	// TODO: Einbauen das bilder verarbeitet werden

	const { value: text, messages } = await mammoth.extractRawText({ arrayBuffer });

	if (messages.length > 0) {
		console.warn('Mammoth messages:', messages);
	}

	const textChunks: NewScan[] = [];
	let lineNumber = 0;

	for (const line of text.split(/\r?\n/)) {
		const clean = sanitizeText(line);
		if (!clean) continue;
		lineNumber++;
		textChunks.push(...splitSmartForDb(clean, lineNumber, id));
	}

	return textChunks;
}
