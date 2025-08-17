import type { QueueItem } from '$lib/types/indexing';
import type { NewScan } from '$lib/db/schema';
import { extractTxt } from './txt';
// später: import { extractCsv } from './extractors/csv';

type ExtractFn = (file: QueueItem, fileId: number) => Promise<NewScan[]>;

export const extractors: Record<string, ExtractFn> = {
	txt: extractTxt,
	csv: extractTxt // CSV ist auch "plain text"
	// 'docx': extractDocx, usw.
};
