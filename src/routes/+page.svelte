<script lang="ts">
	import Sidebar from '$lib/components/main/Sidebar.svelte';
	import Content from '$lib/components/main/Content.svelte';
	import type { PageProps } from './$types';
	import type { FilesWithTags } from '$lib/types/fileWihtTags';

	let { data }: PageProps = $props();

	let search = $state('');
	let selectedFile: FilesWithTags | null = $state(null);
	let tags = $derived(data.tags);

	function selectFile(file: FilesWithTags) {
		selectedFile = file;
	}
</script>

<main class="flex h-[calc(100vh-64px)]">
	<Sidebar files={data.files} {selectedFile} bind:search {selectFile} />
	<Content {selectedFile} bind:tags />
</main>
