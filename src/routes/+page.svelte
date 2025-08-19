<script lang="ts">
	import { db } from '$lib/db';
	import { schema, type File, type Tag, type NewTag } from '$lib/db/schema';
	import { formatBytes } from '$lib/utils/formatBytes';
	import { and, eq } from 'drizzle-orm';
	import type { PageProps } from './$types';
	import { openPath } from '@tauri-apps/plugin-opener';
	import { sep } from '@tauri-apps/api/path';

	let { data }: PageProps = $props();

	const filePromise = (id: number) =>
		db.select().from(schema.scans).where(eq(schema.scans.fileId, id));

	let selectedFile: File | null = $state(null);
	let search = $state('');
	let overflow = $state(true);

	const tags: Tag[] = $state([...data.tags]);
	let selectedTags: number[] = $state([]);
	let newTagName = $state('');
	let newTagColor = $state('#34d399'); // Standardfarbe grün

	async function loadFileTags(fileId: number) {
		selectedTags.splice(0, selectedTags.length);
		const fileTags = await db
			.select()
			.from(schema.fileTags)
			.where(eq(schema.fileTags.fileId, fileId));
		selectedTags.push(...fileTags.map((ft) => ft.tagId));
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
			selectedTags.push(createdTag.id!);
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

	async function updateTag(tag: Tag) {
		await db
			.update(schema.tags)
			.set({ name: tag.name, color: tag.color })
			.where(eq(schema.tags.id, tag.id));
		const index = tags.findIndex((t) => t.id === tag.id);
		if (index !== -1) tags[index] = tag;
	}

	async function selectFile(file: File) {
		selectedFile = file;
		await loadFileTags(file.id);
	}

	async function toggleTag(tagId: number) {
		if (!selectedFile) return;
		if (selectedTags.includes(tagId)) {
			selectedTags = selectedTags.filter((id) => id !== tagId);
			await removeTagFromFile(tagId, selectedFile.id);
		} else {
			selectedTags.push(tagId);
			await addTagToFile(tagId, selectedFile.id);
		}
	}

	async function deleteTag(id: number) {
		await db.delete(schema.tags).where(eq(schema.tags.id, id));
		tags.splice(
			tags.findIndex((t) => t.id === id),
			1
		);
	}
</script>

<main class="flex h-screen">
	<div class="w-1/3 overflow-y-auto border-r border-base-300 bg-base-200">
		<div class="p-4">
			<input
				type="text"
				placeholder="🔍 Dateien suchen..."
				bind:value={search}
				class="input-bordered input w-full"
			/>
		</div>

		<ul class="list overflow-y-auto shadow-md">
			<li class="px-4 pb-2 text-xs tracking-wide opacity-60">Dateien auf diesem PC</li>

			{#each data.files.filter((f) => f.name
					.toLowerCase()
					.includes(search.toLowerCase())) as file (file.id)}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<li
					class="list-row cursor-pointer rounded-lg"
					class:bg-base-100={selectedFile?.id === file.id}
					onclick={() => selectFile(file)}
				>
					<div class="shrink-0 text-xl">
						{file.mimeType === 'txt' ? '📝' : file.mimeType === 'pdf' ? '📄' : '📁'}
					</div>

					<div class="flex min-w-0 flex-1 flex-col overflow-hidden">
						<div class="truncate font-semibold" title={file.name}>{file.name}</div>
						<div class="truncate text-xs text-base-content/70" title={file.path}>{file.path}</div>
					</div>

					<div class="ml-2 shrink-0 text-sm">{formatBytes(file.size)}</div>
				</li>
			{/each}

			<li class="list-row">
				<p>Keine weiteren Dateien</p>
			</li>
		</ul>
	</div>

	<div class="w-2/3 overflow-y-auto bg-base-300 p-6">
		{#if selectedFile}
			<h2 class="mb-2 text-2xl font-bold">{selectedFile.name}</h2>
			<p class="mb-4 text-sm text-base-content/70">{selectedFile.path}</p>

			<div class="mb-4 flex gap-2">
				<button
					class="btn btn-sm btn-primary"
					disabled={!selectedFile.path}
					onclick={() => openPath(selectedFile!.path)}
				>
					Datei öffnen
				</button>
				<button
					class="btn btn-sm btn-secondary"
					disabled={!selectedFile.path}
					onclick={() => openPath(selectedFile!.path.split(sep()).slice(0, -1).join(sep()) || '')}
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

			<!-- Tags anzeigen -->
			<div class="mb-4">
				<h3 class="mb-2 font-semibold">Tags</h3>
				<div class="flex flex-wrap gap-2">
					{#each selectedTags
						.map((id) => tags.find((t) => t.id === id))
						.filter((t): t is Tag => !!t) as tag}
						<span class="badge" style="background-color: {tag.color}">{tag.name}</span>
					{/each}
					<label for="modal_tag" class="btn btn-outline btn-xs">+ Tag</label>
				</div>
			</div>

			<!-- Beschreibung -->
			<div class="mb-4">
				<h3 class="mb-2 font-semibold">Beschreibung</h3>
				<textarea
					class="textarea-bordered textarea w-full"
					rows="3"
					placeholder="Beschreibung hinzufügen..."
				></textarea>
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
</main>

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
			<button class="btn flex-none btn-primary" onclick={addNewTag}> Erstellen </button>
		</div>

		<!-- Bestehende Tags auswählen und bearbeiten -->
		<div class="max-h-64 overflow-y-auto border-t border-b border-gray-200 py-2">
			<fieldset class="fieldset">
				<legend class="fieldset-legend">Tags zuweisen / bearbeiten</legend>
				{#each tags as tag (tag.id)}
					<div class="flex items-center gap-2 rounded px-1 py-1 transition hover:bg-gray-100">
						<input
							type="checkbox"
							checked={selectedTags.includes(tag.id)}
							onchange={() => toggleTag(tag.id)}
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
