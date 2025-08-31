import { files, type File, type NewFile } from './schema/files';
import { fileTags, type FileTag, type NewFileTag } from './schema/fileTags';
import { scans, type Scan, type NewScan } from './schema/scans';
import { settings, type Setting, type NewSetting } from './schema/settings';
import { tags, type Tag, type NewTag } from './schema/tags';
import { fileVersions, type FileVersion, type NewFileVersion } from './schema/fileVersions';

export const schema = {
	files,
	fileTags,
	scans,
	settings,
	tags,
	fileVersions
};

export { files, tags, scans, settings, fileTags, fileVersions };

export interface Schema {
	File: File;
	NewFile: NewFile;
	FileTag: FileTag;
	NewFileTag: NewFileTag;
	Scan: Scan;
	NewScan: NewScan;
	Setting: Setting;
	NewSetting: NewSetting;
	Tag: Tag;
	NewTag: NewTag;
	FileVersion: FileVersion;
	NewFileVersion: NewFileVersion;
}

export type {
	File,
	NewFile,
	FileTag,
	NewFileTag,
	Scan,
	NewScan,
	Setting,
	NewSetting,
	Tag,
	NewTag,
	FileVersion,
	NewFileVersion
};
