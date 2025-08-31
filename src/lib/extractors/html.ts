import type { NewScan } from '$lib/db/schema/scans';
import { createTextDecoder } from '$lib/types/encodings';
import type { QueueItem } from '$lib/types/indexing';
import { sanitizeText } from '$lib/utils/sanitizeText';
import { splitSmartForDb } from '$lib/utils/split';
import { readFile } from '@tauri-apps/plugin-fs';

/**
 * Extrahiert Text aus einer HTML-Datei und gibt ihn in NewScan-Chunks zurück.
 * @param file Die zu extrahierende HTML-Datei
 * @param id Die ID des übergeordneten Scans
 * @returns Array von NewScan-Objekten
 */
export async function extract(
	file: QueueItem,
	id: number,
	fileVersionId: number
): Promise<NewScan[]> {
	const binary = await readFile(file.file);
	const decoder = createTextDecoder();
	const htmlText = decoder.decode(binary);

	const parser = new DOMParser();
	const doc = parser.parseFromString(htmlText, 'text/html');

	const textChunks: NewScan[] = [];
	let lineNumber = 0;

	// Rekursiv alle sichtbaren Textknoten extrahieren
	function extractNodeText(node: Node) {
		if (node.nodeType === Node.TEXT_NODE) {
			const parent = node.parentNode as HTMLElement | null;
			// Optional: Skripte, Styles, Meta etc. ignorieren
			if (parent && ['SCRIPT', 'STYLE', 'NOSCRIPT', 'META', 'HEAD'].includes(parent.nodeName))
				return;

			const clean = sanitizeText(node.textContent ?? '');
			if (clean) {
				lineNumber++;
				textChunks.push(...splitSmartForDb(clean, lineNumber, id, fileVersionId));
			}
		} else {
			node.childNodes.forEach(extractNodeText);
		}
	}

	extractNodeText(doc.body);

	return textChunks;
}
