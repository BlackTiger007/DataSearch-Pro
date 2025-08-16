import type { IndexedFile } from '$lib/utils/fileUtils';
import type { UnwatchFn } from '@tauri-apps/plugin-fs';

export interface QueueItem {
	file: string;
	priority: number; // höherer Wert = höhere Priorität
	data: IndexedFile;
}

export interface IndexingState {
	isRunning: boolean;
	isPaused: boolean;
	queue: QueueItem[];
	currentFile: string | null;
	activeWatches: Map<string, UnwatchFn>;
}
