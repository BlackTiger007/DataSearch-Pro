import type { NewScan } from '$lib/db/schema/scans';
import type { QueueItem } from '$lib/types/indexing';
import { sanitizeText } from '$lib/utils/sanitizeText';
import { splitSmartForDb } from '$lib/utils/split';
import { readFile } from '@tauri-apps/plugin-fs';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker?worker&url';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';

// Worker explizit setzen
GlobalWorkerOptions.workerSrc = workerSrc;

export async function extractPdf(file: QueueItem, id: number): Promise<NewScan[]> {
	const binary = await readFile(file.file);
	const pdf = await getDocument({ data: binary }).promise;

	const textChunks: NewScan[] = [];
	let lineNumber = 0;

	for (let i = 1; i <= pdf.numPages; i++) {
		const page = await pdf.getPage(i);
		const content = await page.getTextContent();

		const pageText = content.items
			.filter((item): item is TextItem => 'str' in item)
			.map((item) => item.str)
			.join(' ');

		const lines = pageText.split(/\r?\n/);
		for (const line of lines) {
			const clean = sanitizeText(line);
			if (!clean) continue;
			lineNumber++;
			textChunks.push(...splitSmartForDb(clean, lineNumber, id));
		}
	}

	return textChunks;
}
