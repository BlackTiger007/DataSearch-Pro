import { browser } from '$app/environment';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { schema } from '$lib/db/schema';

export const load = (async () => {
	if (!browser) {
		error(500, 'This operation is only supported in the browser');
	}

	const { db } = await import('$lib/db/index');

	const files = await db.select().from(schema.files);
	const tags = await db.select().from(schema.tags);

	return { files, tags };
}) satisfies PageLoad;
