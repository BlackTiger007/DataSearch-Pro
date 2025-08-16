import { db } from '$lib/db';
import { schema } from '$lib/db/schema';
import { readDirectory, type IndexedFile } from '$lib/utils/fileUtils';
import { eq } from 'drizzle-orm';
import { settings } from './settings.svelte';
import type { UnwatchFn } from '@tauri-apps/plugin-fs';
import { exists, readFile, stat, watch as watchWithDelay } from '@tauri-apps/plugin-fs';
import { saveSettings } from '$lib/services/settingsService';
import { ask, message } from '@tauri-apps/plugin-dialog';
import { computeHash } from '$lib/utils/hash';
import { sep } from '@tauri-apps/api/path';
import type { IndexingState, QueueItem } from '$lib/types/indexing';
import type { NewScan } from '$lib/db/schema/scans';
import { extractTxt } from '$lib/extractors/txtExtractor';

function createIndexingStore() {
	const store = $state<IndexingState>({
		isRunning: false,
		isPaused: false,
		queue: [],
		currentFile: null,
		activeWatches: new Map<string, UnwatchFn>()
	});

	async function start() {
		if (store.isRunning) return; // Schon am Laufen
		store.isRunning = true;
		store.isPaused = false;

		while (store.isRunning) {
			if (store.isPaused || store.queue.length === 0) {
				await new Promise((res) => setTimeout(res, 1000));
				if (store.queue.length === 0 && !store.isPaused) break;
				continue;
			}

			const item = store.queue.shift() || null;
			store.currentFile = item?.file || null;

			if (!item) continue;
			await processFile(item);
			store.currentFile = null;
		}

		store.isRunning = false;
		store.currentFile = null;
	}

	function stop() {
		store.isRunning = false;
		store.isPaused = false;
	}

	function pause() {
		store.isPaused = true;
	}

	function resume() {
		store.isPaused = false;
	}

	/**
	 * Dateien oder Ordner zur Warteschlange hinzufügen
	 * @param paths Array von Dateien oder Ordnern
	 */
	async function addToQueue(paths: string[]) {
		const allFiles: IndexedFile[] = [];

		for (const p of paths) {
			const s = await stat(p);

			if (s.isDirectory) {
				// Falls Ordner → alle enthaltenen Dateien holen
				const entries = await readDirectory(p);
				allFiles.push(...entries.filter((e) => !e.isDirectory));
			} else {
				// Falls Datei → direkt aufnehmen

				const data = await readFile(p);
				const hash = await computeHash(data);
				const name = p.split(sep()).pop() || '';
				const mimeType = !s.isDirectory && name.includes('.') ? name.split('.').pop() || '' : '';

				const indexed: IndexedFile = {
					path: p,
					hash,
					createdAt: s.birthtime ?? s.atime ?? new Date(),
					updatedAt: s.mtime ?? new Date(),
					mimeType,
					size: s.size,
					name,
					isDirectory: s.isDirectory
				};
				allFiles.push(indexed);
			}
		}

		// Nur neue oder geänderte Dateien zur Queue hinzufügen
		const toQueue: QueueItem[] = [];
		for (const file of allFiles) {
			if (!settings.allowedFileTypes.includes(file.mimeType)) continue;
			const existing = await db.query.files.findFirst({
				where: eq(schema.files.path, file.path)
			});
			if (!existing || existing.hash !== file.hash) {
				toQueue.push({ file: file.path, priority: 0, data: file });
			}
		}

		// Doppelte Einträge vermeiden
		const existingFiles = new Set(store.queue.map((q) => q.file));
		const newItems = toQueue.filter((item) => !existingFiles.has(item.file));

		if (newItems.length === 0) {
			// message('Keine neuen Dateien gefunden.', { kind: 'info' });
			return;
		}

		store.queue = [...store.queue, ...newItems];

		// Sortiere Queue nach Priorität (höchste zuerst)
		sortPriority();

		if (!store.isRunning && store.queue.length > 0 && settings.autoStart) {
			start();
		}
	}

	async function processFile(file: QueueItem) {
		try {
			console.log('Verarbeitung', $state.snapshot(file));

			await db
				.insert(schema.files)
				.values({ ...file.data, indexedAt: new Date() })
				.onConflictDoUpdate({
					target: schema.files.path,
					set: {
						hash: file.data.hash,
						size: file.data.size,
						updatedAt: file.data.updatedAt,
						indexedAt: new Date()
					}
				});

			// ID zuverlässig holen:
			const dbFile = await db.query.files.findFirst({
				where: eq(schema.files.path, file.data.path),
				columns: { id: true }
			});

			const id = dbFile?.id;
			console.log('ID der Datei:', id);
			if (!id) {
				console.warn(`Keine ID zurückgegeben für Datei ${file.file}, überspringe Textchunks`);
				return;
			}

			const textChunks: NewScan[] = [];
			if (file.data.mimeType === 'txt') {
				textChunks.push(...(await extractTxt(file, id)));
			}
			// else if (file.data.mimeType === 'pdf') {textChunks.push(...(await extractPdf(file, id)));}

			for (const chunk of textChunks) {
				await db
					.insert(schema.scans)
					.values(chunk)
					.onConflictDoUpdate({
						target: [schema.scans.fileId, schema.scans.lineNumber, schema.scans.chunkNumber],
						set: {
							content: chunk.content,
							lineNumber: chunk.lineNumber,
							chunkNumber: chunk.chunkNumber
						}
					});
			}
		} catch (err) {
			console.error(`Fehler bei Datei ${file.file}:`, err);
			// Wieder einreihen mit niedrigerer Priorität
			file.priority -= 100;
			store.queue.push(file);
			sortPriority();
		}
	}

	function setPriority(file: string, delta: number) {
		const item = store.queue.find((q) => q.file === file);
		if (item) {
			item.priority += delta;
		}
		sortPriority();
	}

	function sortPriority() {
		store.queue.sort((a, b) => b.priority - a.priority);
	}

	/** Watcht einen Ordner und fügt Änderungen der Queue hinzu */
	async function watch(path: string) {
		// Bereits aktiv → abbrechen
		if (indexing.store.activeWatches.has(path)) return;

		try {
			if (!(await exists(path))) {
				if (settings.folders.includes(path)) {
					if (await ask(`Pfad ${path} wurde gelöscht. Löschen?`, { kind: 'warning' })) {
						settings.folders = settings.folders.filter((p) => p !== path);
						saveSettings($state.snapshot(settings));
					}
				} else {
					message(`Pfad ${path} existiert nicht. Watchvorgang abgebrochen.`, { kind: 'error' });
				}
				return;
			}

			// Watch starten
			const handle = await watchWithDelay(
				path,
				async (e) => {
					if (!e.paths?.length) return;

					for (const p of e.paths) {
						const existsFile = await exists(p);
						if (existsFile) {
							indexing.addToQueue([p]);
						} else {
							// Entfernen aus Queue
							indexing.store.queue = indexing.store.queue.filter((q) => q.file !== p);
						}
					}
				},
				{ delayMs: 1000, recursive: true }
			);

			// Handle speichern und Map neu zuweisen für Reaktivität
			indexing.store.activeWatches.set(path, handle);
			indexing.store.activeWatches = new Map(indexing.store.activeWatches);
		} catch (err) {
			console.error(`Fehler beim Watchen von ${path}:`, err);
		}
	}

	function removeWatch(path: string) {
		const handle = store.activeWatches.get(path);
		if (handle) {
			handle();
			store.activeWatches.delete(path);
			// neue Map erzeugen → trigger für Svelte
			store.activeWatches = new Map(store.activeWatches);
		}
	}

	return {
		store,
		start,
		stop,
		pause,
		resume,
		addToQueue,
		setPriority,
		watch,
		removeWatch
	};
}

export const indexing = createIndexingStore();
