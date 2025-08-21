import type { QueueItem } from '$lib/types/indexing';
import type { NewScan } from '$lib/db/schema';

type ExtractFn = (file: QueueItem, fileId: number) => Promise<NewScan[]>;

export const extractors: Record<string, () => Promise<ExtractFn>> = {
	txt: () => import('./txt').then((m) => m.extract),
	csv: () => import('./txt').then((m) => m.extract),
	tsv: () => import('./txt').then((m) => m.extract),
	log: () => import('./txt').then((m) => m.extract),
	md: () => import('./txt').then((m) => m.extract),
	ini: () => import('./txt').then((m) => m.extract),
	yaml: () => import('./txt').then((m) => m.extract),
	yml: () => import('./txt').then((m) => m.extract),
	json: () => import('./txt').then((m) => m.extract),
	pdf: () => import('./pdf').then((m) => m.extract),
	png: () => import('./img').then((m) => m.extract),
	jpg: () => import('./img').then((m) => m.extract),
	docx: () => import('./docx').then((m) => m.extract),
	xlsx: () => import('./xlsx').then((m) => m.extract)
};
