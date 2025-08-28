<script lang="ts">
	import type { FilesWithTags } from '$lib/types/fileWihtTags';
	import List from './list/List.svelte';

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
		<List items={filteredFiles} {selectFile} />
	</div>
</div>
