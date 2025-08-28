import type { File, Tag } from '$lib/db/schema';

export type FilesWithTags = File & { tags: Tag[] };
