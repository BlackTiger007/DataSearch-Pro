import type { NewScan } from '$lib/db/schema/scans';
import type { QueueItem } from '$lib/types/indexing';
import { sanitizeText } from '$lib/utils/sanitizeText';
import { splitSmartForDb } from '$lib/utils/split';
import { readFile } from '@tauri-apps/plugin-fs';
import { extractOfficeContent } from '../utils/officeUtils';

export async function extract(file: QueueItem, id: number): Promise<NewScan[]> {
	const uint8Array = await readFile(file.file);

	const text = await extractOfficeContent(uint8Array, {
		normalizeWhitespace: true,
		includeHeadersFooters: false,
		includeComments: false
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
