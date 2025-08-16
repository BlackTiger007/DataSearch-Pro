import { readDir, type DirEntry, stat, readFile } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';
import { computeHash } from './hash';

export interface IndexedFile {
	path: string;
	hash: string;
	createdAt: Date;
	updatedAt: Date;
	mimeType: string;
	size: number;
	name: string;
	isDirectory: boolean;
}

export async function readDirectory(path: string): Promise<IndexedFile[]> {
	const allEntries: IndexedFile[] = [];
	const entries = await readDir(path);
	await processEntriesRecursively(path, entries, allEntries);
	return allEntries;
}

async function processEntriesRecursively(
	parent: string,
	entries: DirEntry[],
	result: IndexedFile[]
) {
	for (const entry of entries) {
		const fullPath = await join(parent, entry.name);
		const s = await stat(fullPath);

		let hash = '';
		if (!entry.isDirectory) {
			const data = await readFile(fullPath);
			hash = await computeHash(data);
		}

		const mimeType =
			!entry.isDirectory && entry.name.includes('.') ? entry.name.split('.').pop() || '' : '';

		const indexed: IndexedFile = {
			path: fullPath,
			hash,
			createdAt: s.birthtime ?? s.atime ?? new Date(),
			updatedAt: s.mtime ?? new Date(),
			mimeType,
			size: s.size,
			name: entry.name,
			isDirectory: entry.isDirectory
		};

		result.push(indexed);

		if (entry.isDirectory) {
			const childEntries = await readDir(fullPath);
			await processEntriesRecursively(fullPath, childEntries, result);
		}
	}
}
