<script lang="ts">
	import type { FilesWithTags } from '$lib/types/fileWihtTags';
	import { formatBytes } from '$lib/utils/formatBytes';
	import { getIconComponent } from '$lib/utils/icons';
	import List from '../VirtualList.svelte';

	let {
		files,
		selectFile,
		selectedFile,
		search = $bindable('')
	}: {
		files: FilesWithTags[];
		selectFile: (file: FilesWithTags) => void;
		selectedFile: FilesWithTags | null;
		search: string;
	} = $props();

	let filteredFiles = $state<FilesWithTags[]>([]);

	$effect(() => {
		if (!search.trim()) {
			filteredFiles = files;
			return;
		}

		const term = search.toLowerCase();

		const result = files
			.map((file) => {
				const nameMatch = file.name.toLowerCase().includes(term);
				const pathMatch = file.path.toLowerCase().includes(term);
				const tagsMatch = file.tags.some((t) => t.name.toLowerCase().includes(term));

				let priority = 0;
				if (nameMatch) priority = 3;
				else if (pathMatch) priority = 2;
				else if (tagsMatch) priority = 1;

				return { file, priority };
			})
			.filter(({ priority }) => priority > 0)
			.sort((a, b) => b.priority - a.priority)
			.map(({ file }) => file);

		filteredFiles = result;
	});
</script>

<div class="flex w-1/3 flex-col border-r border-base-300 bg-base-200">
	<!-- Sticky Input -->
	<div class="sticky top-0 z-10 bg-base-200 p-4">
		<input
			type="text"
			placeholder="🔍 Dateien suchen..."
			bind:value={search}
			class="input-bordered input w-full"
		/>
	</div>

	<!-- Scrollable List -->
	<div class="flex-1 overflow-y-auto">
		<List items={filteredFiles}>
			{#snippet row(item)}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="flex cursor-pointer rounded-lg p-2 hover:bg-base-100"
					class:bg-base-100={selectedFile?.id === item.id}
					onclick={() => selectFile(item)}
				>
					{#await getIconComponent(item.mimeType) then Icon}
						<Icon class="size-12 text-base-content/70" />
					{/await}

					<div class="mx-2 flex min-w-0 flex-1 flex-col overflow-hidden">
						<div class="truncate font-semibold" title={item.name}>{item.name}</div>
						<div class="truncate text-xs text-base-content/70" title={item.path}>{item.path}</div>
					</div>

					<div class="ml-2 shrink-0 text-sm">{formatBytes(item.size)}</div>
				</div>
			{/snippet}
		</List>
	</div>
</div>
