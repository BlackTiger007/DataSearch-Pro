import type { QueueItem } from '$lib/types/indexing';
import type { NewScan } from '$lib/db/schema';
import { extractTxt } from './txt';
import { extractPdf } from './pdf';

type ExtractFn = (file: QueueItem, fileId: number) => Promise<NewScan[]>;

export const extractors: Record<string, ExtractFn> = {
	// Klartext
	txt: extractTxt,
	csv: extractTxt, // CSV kann man wie Text behandeln
	tsv: extractTxt,
	log: extractTxt,
	md: extractTxt,
	ini: extractTxt,
	yaml: extractTxt,
	yml: extractTxt,
	json: extractTxt, // JSON kann als Text eingelesen werden
	pdf: extractPdf

	// Platzhalter für spezielle Formate
	// docx: extractDocx,
	// pdf: extractPdf,
};
