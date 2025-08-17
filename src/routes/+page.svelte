<script lang="ts">
	import { db } from '$lib/db';
	import { schema, type File } from '$lib/db/schema';
	import { formatBytes } from '$lib/utils/formatBytes';
	import { eq } from 'drizzle-orm';

	const filesPromise = db.select().from(schema.files);
	const filePromise = (id: number) =>
		db.select().from(schema.scans).where(eq(schema.scans.fileId, id));

	let selectedFile: File | null = $state(null);
	let search = $state('');
	let overflow = $state(true);
</script>

<main class="flex h-screen">
	<!-- Linke Spalte: Dateiliste -->
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

			{#await filesPromise then files}
				{#each files.filter((f) => f.name
						.toLowerCase()
						.includes(search.toLowerCase())) as file (file.id)}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
					<li
						class="list-row cursor-pointer rounded-lg"
						class:bg-base-100={selectedFile?.id === file.id}
						onclick={() => (selectedFile = file)}
					>
						<!-- Icon -->
						<div class="shrink-0 text-xl">
							{file.mimeType === 'txt' ? '📝' : file.mimeType === 'pdf' ? '📄' : '📁'}
						</div>

						<!-- Name + Pfad -->
						<div class="flex min-w-0 flex-1 flex-col overflow-hidden">
							<div class="truncate font-semibold">{file.name}</div>
							<div class="truncate text-xs text-base-content/70" title={file.path}>
								{file.path}
							</div>
						</div>

						<!-- Größe -->
						<div class="ml-2 shrink-0 text-sm">{formatBytes(file.size)}</div>
					</li>
				{/each}
			{/await}

			<li class="list-row">
				<p>Keine weitere Dateien</p>
			</li>
		</ul>
	</div>

	<!-- Rechte Spalte: Detailansicht -->
	<div class="w-2/3 overflow-y-auto bg-base-300 p-6">
		{#if selectedFile}
			<h2 class="mb-2 text-2xl font-bold">{selectedFile.name}</h2>
			<p class="mb-4 text-sm text-base-content/70">{selectedFile.path}</p>

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

			<!-- Bereich für Tags -->
			<div class="mb-4">
				<h3 class="mb-2 font-semibold">Tags</h3>
				<div class="flex flex-wrap gap-2">
					<span class="badge badge-primary">Rechnung</span>
					<span class="badge badge-secondary">Wichtig</span>
					<button class="btn btn-outline btn-xs">+ Tag</button>
				</div>
			</div>

			<!-- Bereich für Notizen / Beschreibung -->
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
				<div class="mb-2 flex justify-between">
					<h3 class="font-semibold">Indexierter Text</h3>
					<button class="btn" onclick={() => (overflow = !overflow)}>
						{overflow ? 'Kein Scroll' : 'Scroll'}
					</button>
				</div>

				<div
					class="max-h-[60vh] w-full overflow-y-auto rounded-lg bg-base-200 p-3 text-sm"
					class:overflow-x-auto={overflow}
					class:whitespace-nowrap={overflow}
					class:break-words={!overflow}
				>
					{#await filePromise(selectedFile.id)}
						<p>Wird geladen...</p>
					{:then fileChunks}
						{#if fileChunks.length > 0}
							{#each fileChunks as chunk (chunk.id)}
								<span class="flex gap-1">
									<p class="font-semibold">{chunk.lineNumber}</p>
									<p>{chunk.content}</p>
								</span>
							{/each}
						{:else}
							<p>Keine Inhalte gefunden</p>
						{/if}
					{/await}
				</div>
			</div>
		{:else}
			<p class="text-center text-base-content/70">Bitte eine Datei auswählen</p>
		{/if}
	</div>
</main>
