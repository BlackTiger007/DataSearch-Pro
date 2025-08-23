import type { QueueItem } from '$lib/types/indexing';
import type { NewScan } from '$lib/db/schema';

type ExtractFn = (file: QueueItem, fileId: number) => Promise<NewScan[]>;

export const extractors: Record<string, () => Promise<ExtractFn>> = {
	// Textbasierte Formate
	txt: () => import('./txt').then((m) => m.extract),
	csv: () => import('./txt').then((m) => m.extract),
	tsv: () => import('./txt').then((m) => m.extract),
	log: () => import('./txt').then((m) => m.extract),
	md: () => import('./txt').then((m) => m.extract),
	ini: () => import('./txt').then((m) => m.extract),
	yaml: () => import('./txt').then((m) => m.extract),
	yml: () => import('./txt').then((m) => m.extract),
	json: () => import('./txt').then((m) => m.extract),

	// PDF
	pdf: () => import('./pdf').then((m) => m.extract),

	// Bilder
	png: () => import('./img').then((m) => m.extract),
	jpg: () => import('./img').then((m) => m.extract),
	jpeg: () => import('./img').then((m) => m.extract),

	// Office-Formate (alle landen in ./office)
	docx: () => import('./office').then((m) => m.extract),
	xlsx: () => import('./office').then((m) => m.extract),
	pptx: () => import('./office').then((m) => m.extract),
	odt: () => import('./office').then((m) => m.extract),
	ods: () => import('./office').then((m) => m.extract),
	odp: () => import('./office').then((m) => m.extract)
};
