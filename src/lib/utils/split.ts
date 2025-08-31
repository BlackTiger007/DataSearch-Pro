import type { NewScan } from '$lib/db/schema/scans';

/**
 * Teilt eine Zeile "schlau" auf und erzeugt DB-Inserts.
 *
 * @param line - Textzeile (bereits bereinigt)
 * @param lineNumber - Ursprüngliche Zeilennummer in der Datei
 * @param fileId - Referenz zur Datei
 * @param maxLen - Maximale Länge pro Chunk
 * @returns Array von NewScan-Einträgen
 */
export function splitSmartForDb(
	line: string,
	lineNumber: number,
	fileId: number,
	fileVersionId: number,
	maxLen = 10000
): NewScan[] {
	if (line.length <= maxLen) {
		return [
			{
				content: line,
				fileId,
				fileVersionId,
				lineNumber,
				chunkNumber: 1,
				createdAt: new Date()
			}
		];
	}

	const parts = Math.ceil(line.length / maxLen);
	const chunkSize = Math.ceil(line.length / parts);

	const chunks: NewScan[] = [];
	for (let i = 0; i < parts; i++) {
		const start = i * chunkSize;
		const end = start + chunkSize;
		chunks.push({
			content: line.slice(start, end),
			fileId,
			fileVersionId,
			lineNumber,
			chunkNumber: i + 1,
			createdAt: new Date()
		});
	}
	return chunks;
}
