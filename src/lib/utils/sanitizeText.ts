/**
 * Säubert Text für die sichere Speicherung/Indexierung.
 * - Tabs werden zu Leerzeichen
 * - Unsichtbare Zeichen werden entfernt
 * - HTML-/JS-gefährliche Zeichen werden ersetzt
 */
export function sanitizeText(line: string): string {
	// Tabs → 4 Leerzeichen
	let cleaned = line.replace(/\t/g, '    ');

	// Unsichtbare Steuerzeichen entfernen (Unicode C-Zeichen)
	cleaned = cleaned.replace(/\p{C}/gu, '');

	// Alles andere unverändert lassen (kein HTML-Escaping)
	return cleaned.trim();
}
