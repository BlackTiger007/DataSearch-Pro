<script lang="ts">
	import { type FileVersion, type NewTag, type Scan, type Tag, schema } from '$lib/db/schema';
	import { formatBytes } from '$lib/utils/formatBytes';
	import { openPath } from '@tauri-apps/plugin-opener';
	import { sep } from '@tauri-apps/api/path';
	import { db } from '$lib/db';
	import { and, eq } from 'drizzle-orm';
	import { isDarkColor } from '$lib/utils/brightness';
	import type { FilesWithTags } from '$lib/types/fileWihtTags';

	let {
		selectedFile,
		tags = $bindable([])
	}: {
		selectedFile: FilesWithTags | null;
		tags: Tag[];
	} = $props();

	let overflow = $state(true);

	let newTagName = $state('');
	let newTagColor = $state('#34d399'); // Standardfarbe grün

	// States
	let versions: number[] = $state([]);
	let selectedVersion: number | null = $state(null);

	// Effekt: wenn sich die Datei ändert, lade die Versionen
	$effect(() => {
		if (!selectedFile) return;

		filePromise(selectedFile.id).then((chunks) => {
			const uniqueVersions = Array.from(new Set(chunks.map((c) => c.versionNumber))).sort(
				(a, b) => b - a
			);

			versions = uniqueVersions;
			if (selectedVersion === null && uniqueVersions.length > 0) {
				selectedVersion = uniqueVersions[0]; // Standard: höchste Version
			}
		});
	});

	// Cache für File-Chunks
	const fileCache = new Map<number, Promise<(Scan & FileVersion)[]>>();

	// Promise-Funktion mit Cache
	const filePromise = async (id: number): Promise<(Scan & FileVersion)[]> => {
		if (fileCache.has(id)) {
			return fileCache.get(id)!;
		}

		// Join zwischen scans und file_versions
		const scans = await db.select().from(schema.scans).where(eq(schema.scans.fileId, id));

		const chunks: (Scan & FileVersion)[] = [];
		for (const scan of scans) {
			const [version] = await db
				.select()
				.from(schema.fileVersions)
				.where(eq(schema.fileVersions.id, scan.fileVersionId));

			// falls `version` nicht gefunden wurde → skip
			if (!version) continue;

			chunks.push({ ...scan, ...version });
		}

		fileCache.set(id, Promise.resolve(chunks));
		return chunks;
	};

	// Optional: Cache leeren, falls Datei aktualisiert wird
	function invalidateFileCache(fileId: number) {
		fileCache.delete(fileId);
	}

	async function addNewTag() {
		if (!newTagName.trim()) return;

		const newTag: NewTag = { name: newTagName, color: newTagColor };
		await db.insert(schema.tags).values(newTag);

		const createdTag = await db.query.tags.findFirst({ where: eq(schema.tags.name, newTagName) });
		if (!createdTag) return;

		tags.push(createdTag);
		newTagName = '';

		// Direkt auch für die aktuelle Datei zuordnen, falls eine ausgewählt
		if (selectedFile) {
			await addTagToFile(createdTag.id!, selectedFile.id);
			selectedFile.tags.push(createdTag);
		}
	}

	async function addTagToFile(tagId: number, fileId: number) {
		const exists = await db
			.select()
			.from(schema.fileTags)
			.where(and(eq(schema.fileTags.fileId, fileId), eq(schema.fileTags.tagId, tagId)));
		if (exists.length === 0) {
			await db.insert(schema.fileTags).values({ fileId, tagId });
		}
	}

	async function removeTagFromFile(tagId: number, fileId: number) {
		await db
			.delete(schema.fileTags)
			.where(and(eq(schema.fileTags.fileId, fileId), eq(schema.fileTags.tagId, tagId)));
	}

	async function toggleTag(tag: Tag) {
		if (!selectedFile) return;
		if (selectedFile.tags.some((t) => t.id === tag.id)) {
			selectedFile.tags = selectedFile.tags.filter((t) => t.id !== tag.id);
			await removeTagFromFile(tag.id, selectedFile.id);
		} else {
			selectedFile.tags.push(tag);
			await addTagToFile(tag.id, selectedFile.id);
		}
	}

	async function deleteTag(id: number) {
		await db.delete(schema.tags).where(eq(schema.tags.id, id));
		tags.splice(
			tags.findIndex((t) => t.id === id),
			1
		);
	}

	async function updateTag(tag: Tag) {
		await db
			.update(schema.tags)
			.set({ name: tag.name, color: tag.color })
			.where(eq(schema.tags.id, tag.id));
		const index = tags.findIndex((t) => t.id === tag.id);
		if (index !== -1) tags[index] = tag;
	}

	// Hilfsfunktion: gruppiert die Chunks nach versionNumber
	function groupByVersion(chunks: (Scan & FileVersion)[]) {
		const grouped: Record<number, (Scan & FileVersion)[]> = {};
		for (const c of chunks) {
			if (!grouped[c.versionNumber]) grouped[c.versionNumber] = [];
			grouped[c.versionNumber].push(c);
		}
		return grouped;
	}
</script>

<div class="w-2/3 overflow-y-auto bg-base-300 p-6">
	{#if selectedFile}
		<h2 class="mb-2 max-w-full text-2xl font-bold break-words">{selectedFile.name}</h2>
		<p class="mb-4 max-w-full text-sm break-all text-base-content/70">{selectedFile.path}</p>

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

		{#if selectedFile && versions.length > 0}
			<fieldset class="fieldset">
				<legend class="fieldset-legend">Version</legend>
				<select class="select" bind:value={selectedVersion}>
					{#each versions as v}
						<option value={v}>Version {v}</option>
					{/each}
				</select>
			</fieldset>
		{/if}

		<!-- Tags -->
		<div class="mb-4">
			<h3 class="mb-2 font-semibold">Tags</h3>
			<div class="flex flex-wrap gap-2">
				{#each selectedFile.tags as tag (tag.id)}
					<span
						class="badge"
						style="background-color: {tag.color}; 
						color: {isDarkColor(tag.color) ? '#fff' : '#000'};"
					>
						{tag.name}
					</span>
				{/each}
				<label for="modal_tag" class="btn btn-outline btn-xs">+ Tag</label>
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
						{#each Object.entries(groupByVersion(fileChunks)) as [version, chunks]}
							{#if +version === selectedVersion}
								{#each chunks as chunk (`${chunk.id}-${chunk.versionNumber}-${chunk.lineNumber}`)}
									<div class="flex gap-2">
										<span class="shrink-0 font-semibold">{chunk.lineNumber}</span>
										<pre
											class:whitespace-pre={overflow}
											class:whitespace-pre-wrap={!overflow}>{chunk.content}</pre>
									</div>
								{/each}
							{/if}
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

<!-- MODAL -->
<input type="checkbox" id="modal_tag" class="modal-toggle" />
<div class="modal modal-bottom sm:modal-middle">
	<div class="modal-box w-11/12 max-w-2xl">
		<h3 class="mb-4 text-xl font-bold">Tags verwalten</h3>

		<!-- Neue Tags erstellen -->
		<div class="mb-4 flex flex-col items-center gap-2 sm:flex-row">
			<input
				type="text"
				placeholder="Neuen Tag erstellen"
				bind:value={newTagName}
				class="input-bordered input flex-1"
			/>
			<input
				type="color"
				bind:value={newTagColor}
				class="h-10 w-12 cursor-pointer rounded border-none"
			/>
			<button class="btn flex-none btn-primary" onclick={addNewTag}>Erstellen</button>
		</div>

		<!-- Bestehende Tags auswählen und bearbeiten -->
		<div class="max-h-64 overflow-y-auto border-t border-b border-gray-200 py-2">
			<fieldset class="fieldset">
				<legend class="fieldset-legend">Tags zuweisen / bearbeiten</legend>
				{#each tags as tag (tag.id)}
					<div class="flex items-center gap-2 rounded px-1 py-1">
						<input
							type="checkbox"
							checked={selectedFile?.tags.some((t) => t.id === tag.id)}
							onchange={() => toggleTag(tag)}
							class="checkbox checkbox-primary"
						/>

						<!-- Farbkreis klickbar machen -->
						<label class="relative cursor-pointer">
							<div
								class="h-5 w-5 rounded-full border border-gray-300"
								style="background-color: {tag.color}"
								title={tag.color}
							></div>
							<input
								type="color"
								class="absolute inset-0 cursor-pointer opacity-0"
								bind:value={tag.color}
								onblur={() => updateTag(tag)}
							/>
						</label>

						<input
							type="text"
							class="input-bordered input flex-1"
							bind:value={tag.name}
							onblur={() => updateTag(tag)}
						/>
						<button
							class="btn btn-sm btn-error"
							title="Tag löschen (Doppelklick)"
							ondblclick={() => deleteTag(tag.id)}
						>
							✕
						</button>
					</div>
				{/each}
			</fieldset>
		</div>

		<div class="modal-action mt-4">
			<label for="modal_tag" class="btn btn-outline">Schließen</label>
		</div>
	</div>
</div>
