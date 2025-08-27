import JSZip from 'jszip';

/** Optionen für die Extraktion von Office-Dateien */
export interface ExtractOptions {
	/**
	 * Entfernt mehrfaches Whitespace → normalisiert den Text.
	 * Dies betrifft Leerzeichen, Tabs und Zeilenumbrüche innerhalb eines Absatzes.
	 * @default true
	 */
	normalizeWhitespace?: boolean;

	/**
	 * Soll Text aus Kopf- und Fußzeilen extrahiert werden?
	 * Unterstützt DOCX, ODT und PPTX.
	 * @default false
	 */
	includeHeadersFooters?: boolean;

	/**
	 * Soll Text aus Kommentaren extrahiert werden?
	 * Unterstützt DOCX und PPTX.
	 * @default false
	 */
	includeComments?: boolean;

	/**
	 * Optionaler Custom-Handler für eingebettete Bilder (z. B. OCR).
	 * Wird unabhängig von `includeImageText` aufgerufen, wenn ein Bild verarbeitet werden soll.
	 */
	handleImage?: (imageBuffer: Uint8Array, mimeType: string) => Promise<string>;

	/**
	 * In ODF-Formaten (ODT, ODS, ODP) Bilder, die innerhalb von `<text:p>` referenziert sind,
	 * auch extrahieren – es wird **nur der Text aus `<svg:desc>`** verwendet, nicht das Bild selbst.
	 * @default false
	 */
	includeImageText?: boolean;
}

/** Hilfsfunktion für Whitespace-Normalisierung */
function normalize(text: string, enabled: boolean) {
	return enabled ? text.replace(/\s+/g, ' ').trim() : text;
}

/** MIME-Type anhand Dateiendung schätzen */
function guessMimeType(path: string): string {
	if (path.endsWith('.png')) return 'image/png';
	if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
	if (path.endsWith('.gif')) return 'image/gif';
	return 'application/octet-stream';
}

/** DOCX-Extraktion */
async function extractDocx(
	zip: JSZip,
	parser: DOMParser,
	opts: ExtractOptions,
	collected: string[]
) {
	const files = ['word/document.xml'];
	if (opts.includeHeadersFooters) files.push('word/header1.xml', 'word/footer1.xml');
	if (opts.includeComments) files.push('word/comments.xml');

	for (const path of files) {
		const file = zip.file(path);
		if (!file) continue;
		const xmlContent = await file.async('text');
		const doc = parser.parseFromString(xmlContent, 'application/xml');

		const pNodes = doc.getElementsByTagName('w:p');
		for (const p of Array.from(pNodes)) {
			let paraText = '';
			const tNodes = p.getElementsByTagName('w:t');
			for (const t of Array.from(tNodes)) paraText += t.textContent ?? '';
			if (paraText) collected.push(normalize(paraText, opts.normalizeWhitespace ?? true));
		}
	}
}

/** XLSX-Extraktion (alle Sheets) */
async function extractXlsx(
	zip: JSZip,
	parser: DOMParser,
	opts: ExtractOptions,
	collected: string[]
) {
	const sharedStringsFile = zip.file('xl/sharedStrings.xml');
	if (!sharedStringsFile) return;

	const sharedXml = await sharedStringsFile.async('text');
	const sharedDoc = parser.parseFromString(sharedXml, 'application/xml');
	const sharedNodes = Array.from(sharedDoc.getElementsByTagName('t'));
	const sharedStrings = sharedNodes.map((t) =>
		normalize(t.textContent ?? '', opts.normalizeWhitespace ?? true)
	);

	// alle Sheets sammeln
	for (const path in zip.files) {
		if (/^xl\/worksheets\/sheet\d+\.xml$/.test(path)) {
			const sheetXml = await zip.file(path)!.async('text');
			const sheetDoc = parser.parseFromString(sheetXml, 'application/xml');
			const rows = Array.from(sheetDoc.getElementsByTagName('row'));

			for (const row of rows) {
				const cells = Array.from(row.getElementsByTagName('c'));
				const parts: string[] = [];
				for (const cell of cells) {
					const v = cell.getElementsByTagName('v')[0];
					if (!v) continue;
					if (cell.getAttribute('t') === 's') {
						const idx = parseInt(v.textContent ?? '', 10);
						if (!isNaN(idx)) parts.push(sharedStrings[idx]);
					} else {
						parts.push(normalize(v.textContent ?? '', opts.normalizeWhitespace ?? true));
					}
				}
				if (parts.length > 0) collected.push(parts.join(' '));
			}
		}
	}
}

/** PPTX-Extraktion (alle Slides, optional Kommentare) */
async function extractPptx(
	zip: JSZip,
	parser: DOMParser,
	opts: ExtractOptions,
	collected: string[]
) {
	for (const path in zip.files) {
		// Folien
		if (/^ppt\/slides\/slide\d+\.xml$/.test(path)) {
			const xmlContent = await zip.file(path)!.async('text');
			const doc = parser.parseFromString(xmlContent, 'application/xml');
			const tNodes = doc.getElementsByTagName('a:t');
			for (const t of Array.from(tNodes)) {
				const text = normalize(t.textContent ?? '', opts.normalizeWhitespace ?? true);
				if (text) collected.push(text);
			}
		}

		// Kommentare
		if (opts.includeComments && /^ppt\/comments\/comment\d+\.xml$/.test(path)) {
			const xmlContent = await zip.file(path)!.async('text');
			const doc = parser.parseFromString(xmlContent, 'application/xml');
			const tNodes = doc.getElementsByTagName('a:t');
			for (const t of Array.from(tNodes)) {
				const text = normalize(t.textContent ?? '', opts.normalizeWhitespace ?? true);
				if (text) collected.push(text);
			}
		}
	}
}

/** ODF-Extraktion (ODT, ODS, ODP) */
async function extractOdf(
	zip: JSZip,
	parser: DOMParser,
	opts: ExtractOptions,
	collected: string[]
) {
	const contentXml = zip.file('content.xml');
	if (!contentXml) return;

	const xmlContent = await contentXml.async('text');
	const doc = parser.parseFromString(xmlContent, 'application/xml');
	const pNodes = doc.getElementsByTagName('text:p');

	for (const p of Array.from(pNodes)) {
		// normalen Text extrahieren
		const text = normalize(p.textContent ?? '', opts.normalizeWhitespace ?? true);
		if (text) collected.push(text);

		// Nur Text aus Bild-Frames extrahieren, wenn Option aktiv
		if (opts.includeImageText) {
			const frames = p.getElementsByTagName('draw:frame');
			for (const frame of Array.from(frames)) {
				const descNode = frame.getElementsByTagName('svg:desc')[0];
				if (!descNode) continue;

				const imgText = normalize(descNode.textContent ?? '', opts.normalizeWhitespace ?? true);
				if (imgText) collected.push(imgText);
			}
		}
	}
}

/** Bilder mit optionalem OCR behandeln */
async function extractImages(zip: JSZip, opts: ExtractOptions, collected: string[]) {
	if (!opts.handleImage) return;

	const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp'];

	for (const path in zip.files) {
		// skip directories
		if (zip.files[path].dir) continue;

		// prüfe nur auf bekannte Bild-Endungen (case-insensitive)
		const lowerPath = path.toLowerCase();
		if (!imageExtensions.some((ext) => lowerPath.endsWith(ext))) continue;

		const file = zip.file(path);
		if (!file) continue;

		const buffer = new Uint8Array(await file.async('uint8array'));
		const mimeType = guessMimeType(path); // darf so bleiben, falls du es schon nutzt
		const extractedText = await opts.handleImage(buffer, mimeType);

		if (extractedText) {
			collected.push(normalize(extractedText, opts.normalizeWhitespace ?? true));
		}
	}
}

/** Hauptfunktion: alle Office-Formate extrahieren */
export async function extractOfficeContent(
	fileBuffer: Uint8Array,
	options: ExtractOptions = {}
): Promise<string> {
	const zip = await JSZip.loadAsync(fileBuffer);
	const parser = new DOMParser();
	const collected: string[] = [];

	// DOCX
	if (zip.file('word/document.xml')) {
		await extractDocx(zip, parser, options, collected);
	}

	// XLSX
	if (zip.file('xl/workbook.xml')) {
		await extractXlsx(zip, parser, options, collected);
	}

	// PPTX
	if (zip.file('ppt/presentation.xml')) {
		await extractPptx(zip, parser, options, collected);
	}

	// ODT / ODS / ODP
	if (zip.file('content.xml')) {
		await extractOdf(zip, parser, options, collected);
	}

	// Bilder (OCR)
	await extractImages(zip, options, collected);

	return collected.join('\n');
}
