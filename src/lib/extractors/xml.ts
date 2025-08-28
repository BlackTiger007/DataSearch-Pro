import type { NewScan } from '$lib/db/schema/scans';
import { createTextDecoder } from '$lib/types/encodings';
import type { QueueItem } from '$lib/types/indexing';
import { sanitizeText } from '$lib/utils/sanitizeText';
import { splitSmartForDb } from '$lib/utils/split';
import { readFile } from '@tauri-apps/plugin-fs';

/**
 * Extrahiert Text aus einer XML-Datei und gibt ihn in NewScan-Chunks zurück.
 * @param file Die zu extrahierende XML-Datei
 * @param id Die ID des übergeordneten Scans
 * @returns Array von NewScan-Objekten
 */
export async function extract(file: QueueItem, id: number): Promise<NewScan[]> {
	const binary = await readFile(file.file);
	const decoder = createTextDecoder();
	const xmlText = decoder.decode(binary);

	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(xmlText, 'application/xml');

	const textChunks: NewScan[] = [];
	let lineNumber = 0;

	// Rekursiv alle Textknoten extrahieren
	function extractNodeText(node: Node) {
		if (node.nodeType === Node.TEXT_NODE) {
			const clean = sanitizeText(node.textContent ?? '');
			if (clean) {
				lineNumber++;
				textChunks.push(...splitSmartForDb(clean, lineNumber, id));
			}
		} else {
			node.childNodes.forEach(extractNodeText);
		}
	}

	extractNodeText(xmlDoc);

	return textChunks;
}
