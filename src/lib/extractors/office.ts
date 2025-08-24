import type { NewScan } from '$lib/db/schema/scans';
import type { QueueItem } from '$lib/types/indexing';
import { sanitizeText } from '$lib/utils/sanitizeText';
import { splitSmartForDb } from '$lib/utils/split';
import { readFile } from '@tauri-apps/plugin-fs';
import { extractOfficeContent } from '../utils/officeUtils';
import { createWorker } from 'tesseract.js';
import { settings } from '$lib/stores/settings.svelte';

export async function extract(file: QueueItem, id: number): Promise<NewScan[]> {
	const uint8Array = await readFile(file.file);

	const handleImage = settings.enableImageTextExtraction ? myhandleImage : undefined;

	const text = await extractOfficeContent(uint8Array, {
		normalizeWhitespace: true,
		includeHeadersFooters: false,
		includeComments: false,
		handleImage
	});

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

async function myhandleImage(imageBuffer: Uint8Array, mimeType: string): Promise<string> {
	// Blob erzeugen
	const blob = new Blob([new Uint8Array(imageBuffer)], { type: mimeType });

	// Worker mit Sprache erstellen (z. B. 'eng' oder 'deu')
	const worker = await createWorker('eng');

	// OCR starten
	const {
		data: { text }
	} = await worker.recognize(blob);

	// Worker wieder freigeben
	await worker.terminate();

	return text;
}
