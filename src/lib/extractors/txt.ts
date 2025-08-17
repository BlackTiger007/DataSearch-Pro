import type { NewScan } from '$lib/db/schema/scans';
import type { QueueItem } from '$lib/types/indexing';
import { sanitizeText } from '$lib/utils/sanitizeText';
import { splitSmartForDb } from '$lib/utils/split';
import { readTextFileLines } from '@tauri-apps/plugin-fs';

export async function extractTxt(file: QueueItem, id: number): Promise<NewScan[]> {
	const lines = await readTextFileLines(file.file);

	// DEFAULT
	const textChunks: NewScan[] = [];
	let lineNumber = 0;
	for await (const line of lines) {
		lineNumber++;
		const clean = sanitizeText(line);
		if (clean.length === 0) continue;

		textChunks.push(...splitSmartForDb(clean, lineNumber, id));
	}
	return textChunks;
}
