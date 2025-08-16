/**
 * Berechnet einen SHA-256 Hash für die übergebenen Daten (Browser-kompatibel).
 * @param data Inhalt der Datei als Uint8Array oder string
 * @returns Hex-String des Hashes
 */
export async function computeHash(data: Uint8Array | string): Promise<string> {
	let buffer: BufferSource;

	if (typeof data === 'string') {
		buffer = new TextEncoder().encode(data);
	} else {
		// explizit als BufferSource casten
		buffer = data as unknown as BufferSource;
	}

	const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
