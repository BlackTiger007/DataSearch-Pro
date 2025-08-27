<script lang="ts">
	import Sidebar from '$lib/components/main/Sidebar.svelte';
	import Content from '$lib/components/main/Content.svelte';
	import { type File } from '$lib/db/schema';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let search = $state('');
	let selectedFile: File | null = $state(null);
	let tags = $state([...data.tags]);
	let selectedTags: number[] = $state([]);

	function selectFile(file: File) {
		selectedFile = file;
	}
</script>

<main class="flex h-[calc(100vh-64px)]">
	<Sidebar files={data.files} {selectedFile} bind:search {selectFile} />
	<Content {selectedFile} {tags} {selectedTags} bind:overflow />
</main>
