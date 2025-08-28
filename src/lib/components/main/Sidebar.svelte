<script lang="ts">
	import type { File } from '$lib/db/schema';
	import List from './list/List.svelte';

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
		<List
			items={files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))}
			{selectFile}
		/>
	</div>
</div>
