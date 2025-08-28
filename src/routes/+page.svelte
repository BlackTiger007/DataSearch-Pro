<script lang="ts">
	import Sidebar from '$lib/components/main/Sidebar.svelte';
	import Content from '$lib/components/main/Content.svelte';
	import { type File, schema } from '$lib/db/schema';
	import type { PageProps } from './$types';
	import { eq } from 'drizzle-orm';
	import { db } from '$lib/db';

	let { data }: PageProps = $props();

	let search = $state('');
	let selectedFile: File | null = $state(null);
	let tags = $state([...data.tags]);
	let selectedTags: number[] = $state([]);

	async function loadFileTags(fileId: number) {
		const fileTagRows = await db
			.select({ tagId: schema.fileTags.tagId })
			.from(schema.fileTags)
			.where(eq(schema.fileTags.fileId, fileId));
		selectedTags = fileTagRows.map((r) => r.tagId);
	}

	function selectFile(file: File) {
		selectedFile = file;
		if (file) loadFileTags(file.id);
	}
</script>

<main class="flex h-[calc(100vh-64px)]">
	<Sidebar files={data.files} {selectedFile} bind:search {selectFile} />
	<Content {selectedFile} bind:tags {selectedTags} />
</main>
