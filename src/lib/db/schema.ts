import { files, type File } from './schema/files';
import { tags, type Tag } from './schema/tags';
import { scans, type Scan } from './schema/scans';
import { settings, type Setting } from './schema/settings';

export const schema = {
	files,
	tags,
	scans,
	settings
};

export { files, tags, scans, settings };

export interface Schema {
	File: File;
	Tag: Tag;
	Scan: Scan;
	Setting: Setting;
}

export type { File, Tag, Scan, Setting };
