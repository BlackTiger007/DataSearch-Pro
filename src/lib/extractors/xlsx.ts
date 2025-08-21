import type { NewScan } from '$lib/db/schema/scans';
import type { QueueItem } from '$lib/types/indexing';
import { sanitizeText } from '$lib/utils/sanitizeText';
import { splitSmartForDb } from '$lib/utils/split';
import { readFile } from '@tauri-apps/plugin-fs';
import * as XLSX from 'xlsx';

/**
 * Extrahiert den Text aus einer .xlsx Datei (Browser/Tauri-kompatibel)
 * und gibt ihn in NewScan-Chunks zurück.
 */
export async function extractXlsx(file: QueueItem, id: number): Promise<NewScan[]> {
	// Datei als Uint8Array lesen
	const uint8Array = await readFile(file.file);

	// ArrayBuffer erzeugen
	const arrayBuffer = uint8Array.slice().buffer;

	// Workbook parsen
	const workbook = XLSX.read(arrayBuffer, { type: 'array' });

	const textChunks: NewScan[] = [];
	let lineNumber = 0;

	// Alle Sheets durchgehen
	for (const sheetName of workbook.SheetNames) {
		const sheet = workbook.Sheets[sheetName];

		// Sheet in JSON auslesen
		const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

		for (const row of rows) {
			// Alle Zellen des Rows zusammenführen
			const line = Object.values(row).join(' ');
			const clean = sanitizeText(line);
			if (!clean) continue;
			lineNumber++;
			textChunks.push(...splitSmartForDb(clean, lineNumber, id));
		}
	}

	console.log('XLSX:', textChunks);

	return textChunks;
}
