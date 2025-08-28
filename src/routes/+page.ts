import { browser } from '$app/environment';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { schema } from '$lib/db/schema';
import type { FilesWithTags } from '$lib/types/fileWihtTags';

export const load = (async () => {
	if (!browser) {
		throw error(500, 'This operation is only supported in the browser');
	}

	const { db } = await import('$lib/db/index');

	// Alle Files laden
	const files = await db.select().from(schema.files);

	// Alle Tags laden
	const tags = await db.select().from(schema.tags);

	// Alle FileTags laden
	const fileTags = await db.select().from(schema.fileTags);

	// Jedem File seine Tags zuordnen
	const filesWithTags: FilesWithTags[] = files.map((file) => {
		const tagIds = fileTags.filter((ft) => ft.fileId === file.id).map((ft) => ft.tagId);

		const fileTagsData = tagIds
			.map((id) => tags.find((t) => t.id === id))
			.filter((t): t is (typeof tags)[0] => !!t);

		return {
			...file,
			tags: fileTagsData
		};
	});

	return { files: filesWithTags, tags };
}) satisfies PageLoad;
