<script lang="ts">
	import type { File } from '$lib/db/schema';
	import { getIconComponent } from '$lib/utils/icons';
	import { formatBytes } from '$lib/utils/formatBytes';

	let {
		files,
		selectFile,
		selectedFile,
		search = $bindable()
	}: {
		files: File[];
		selectFile: (file: File) => void;
		selectedFile: File | null;
		search: string;
	} = $props();
</script>

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

		{#each files.filter((f) => f.name
				.toLowerCase()
				.includes(search.toLowerCase())) as file (file.id)}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<li
				class="list-row cursor-pointer rounded-lg"
				class:bg-base-100={selectedFile?.id === file.id}
				onclick={() => selectFile(file)}
			>
				{#await getIconComponent(file.mimeType) then Icon}
					<Icon class="size-12 text-base-content/70" />
				{/await}

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
