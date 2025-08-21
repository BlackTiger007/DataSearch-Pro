import type { QueueItem } from '$lib/types/indexing';
import type { NewScan } from '$lib/db/schema';
import { extractTxt } from './txt';
import { extractPdf } from './pdf';
import { extractImageOcr } from './img';
import { extractDocx } from './docx';
import { extractXlsx } from './xlsx';

type ExtractFn = (file: QueueItem, fileId: number) => Promise<NewScan[]>;

export const extractors: Record<string, ExtractFn> = {
	txt: extractTxt,
	csv: extractTxt,
	tsv: extractTxt,
	log: extractTxt,
	md: extractTxt,
	ini: extractTxt,
	yaml: extractTxt,
	yml: extractTxt,
	json: extractTxt,
	pdf: extractPdf,
	png: extractImageOcr,
	jpg: extractImageOcr,
	docx: extractDocx,
	xlsx: extractXlsx
};
