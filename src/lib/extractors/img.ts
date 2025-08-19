import type { NewScan } from '$lib/db/schema/scans';
import type { QueueItem } from '$lib/types/indexing';
import { sanitizeText } from '$lib/utils/sanitizeText';
import { splitSmartForDb } from '$lib/utils/split';
import { readFile } from '@tauri-apps/plugin-fs';
import { createWorker } from 'tesseract.js';

/**
 * OCR nur für Bilder (PNG, JPG, etc.) mit Tesseract.js
 */
export async function extractImageOcr(file: QueueItem, id: number): Promise<NewScan[]> {
	// Datei einlesen
	const binary = await readFile(file.file);

	// Blob erzeugen
	const blob = new Blob([new Uint8Array(binary)], { type: 'image/png' });

	// Worker mit Sprache erstellen (z. B. 'eng' oder 'deu')
	const worker = await createWorker('eng');

	// OCR starten
	const {
		data: { text }
	} = await worker.recognize(blob);

	// Worker wieder freigeben
	await worker.terminate();

	const textChunks: NewScan[] = [];
	let lineNumber = 0;

	// Text in Zeilen zerlegen
	const lines = text.split(/\r?\n/);
	for (const line of lines) {
		lineNumber++;
		const clean = sanitizeText(line);
		if (!clean) continue;
		textChunks.push(...splitSmartForDb(clean, lineNumber, id));
	}

	return textChunks;
}
