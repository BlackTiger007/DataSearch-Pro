<script lang="ts">
	import { type File, type Scan, type Tag, schema } from '$lib/db/schema';
	import { formatBytes } from '$lib/utils/formatBytes';
	import { openPath } from '@tauri-apps/plugin-opener';
	import { sep } from '@tauri-apps/api/path';
	import { db } from '$lib/db';
	import { eq } from 'drizzle-orm';

	let {
		selectedFile,
		tags,
		selectedTags,
		overflow = $bindable()
	}: {
		selectedFile: File | null;
		tags: Tag[];
		selectedTags: number[];
		overflow: boolean;
	} = $props();

	// Cache für File-Chunks
	const fileCache = new Map<number, Scan[]>();

	// Promise-Funktion mit Cache
	const filePromise = async (id: number) => {
		if (fileCache.has(id)) {
			return fileCache.get(id)!;
		}
		const chunks = await db.select().from(schema.scans).where(eq(schema.scans.fileId, id));
		fileCache.set(id, chunks);
		return chunks;
	};

	// Optional: Cache leeren, falls Datei aktualisiert wird
	function invalidateFileCache(fileId: number) {
		fileCache.delete(fileId);
	}
</script>

<div class="w-2/3 overflow-y-auto bg-base-300 p-6">
	{#if selectedFile}
		<h2 class="mb-2 text-2xl font-bold">{selectedFile.name}</h2>
		<p class="mb-4 text-sm text-base-content/70">{selectedFile.path}</p>

		<div class="mb-4 flex gap-2">
			<button
				class="btn btn-sm btn-primary"
				disabled={!selectedFile.path}
				onclick={() => openPath(selectedFile.path)}
			>
				Datei öffnen
			</button>
			<button
				class="btn btn-sm btn-secondary"
				disabled={!selectedFile.path}
				onclick={() => openPath(selectedFile.path.split(sep()).slice(0, -1).join(sep()) || '')}
			>
				Ordner öffnen
			</button>
		</div>

		<div class="stats mb-4 bg-base-100 shadow">
			<div class="stat">
				<div class="stat-title">Größe</div>
				<div class="stat-value text-lg">{formatBytes(selectedFile.size)}</div>
			</div>
			<div class="stat">
				<div class="stat-title">Typ</div>
				<div class="stat-value text-lg">{selectedFile.mimeType}</div>
			</div>
		</div>

		<!-- Tags -->
		<div class="mb-4">
			<h3 class="mb-2 font-semibold">Tags</h3>
			<div class="flex flex-wrap gap-2">
				{#each selectedTags
					.map((id) => tags.find((t) => t.id === id))
					.filter((t): t is Tag => !!t) as tag (tag.id)}
					<span class="badge" style="background-color: {tag.color}">{tag.name}</span>
				{/each}
			</div>
		</div>

		<!-- Indexierter Inhalt -->
		<div>
			<div class="mb-2 flex items-center justify-between">
				<h3 class="font-semibold">Indexierter Text</h3>
				<button class="btn btn-sm" onclick={() => (overflow = !overflow)}>
					{overflow ? 'Kein Scroll' : 'Scroll'}
				</button>
			</div>
			<div
				class="max-h-[60vh] w-full overflow-y-auto rounded-lg bg-base-200 p-3 text-sm"
				class:overflow-x-auto={overflow}
			>
				{#await filePromise(selectedFile.id)}
					<p>Wird geladen...</p>
				{:then fileChunks}
					{#if fileChunks.length > 0}
						{#each fileChunks as chunk (chunk.id)}
							<div class="flex gap-2">
								<span class="shrink-0 font-semibold">{chunk.lineNumber}</span>
								<pre
									class:whitespace-pre={overflow}
									class:whitespace-pre-wrap={!overflow}>{chunk.content}</pre>
							</div>
						{/each}
					{:else}
						<p>Keine Inhalte gefunden oder kein Parser für dieses Format verfügbar.</p>
					{/if}
				{/await}
			</div>
		</div>
	{:else}
		<p class="text-center text-base-content/70">Bitte eine Datei auswählen</p>
	{/if}
</div>
