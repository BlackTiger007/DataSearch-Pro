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

		// Sheet als Array von Arrays auslesen (erste Zeile wird behalten)
		const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
			header: 1,
			defval: ''
		});

		console.log('row type', rows, typeof rows);

		for (const row of rows) {
			// Array von Strings direkt zusammenführen
			const line = row.join(' ');
			const clean = sanitizeText(line);
			if (!clean) continue;
			lineNumber++;
			textChunks.push(...splitSmartForDb(clean, lineNumber, id));
		}
	}

	return textChunks;
}
