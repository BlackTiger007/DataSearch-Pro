import type { Component } from 'svelte';

export const icons: Record<string, () => Promise<{ default: Component }>> = {
	// Text & Daten
	txt: () => import('bootstrap-icons/icons/filetype-txt.svg?component'),
	csv: () => import('bootstrap-icons/icons/filetype-csv.svg?component'),
	md: () => import('bootstrap-icons/icons/filetype-md.svg?component'),
	yaml: () => import('bootstrap-icons/icons/filetype-yml.svg?component'),
	yml: () => import('bootstrap-icons/icons/filetype-yml.svg?component'),
	json: () => import('bootstrap-icons/icons/filetype-json.svg?component'),
	xml: () => import('bootstrap-icons/icons/filetype-xml.svg?component'),
	htm: () => import('bootstrap-icons/icons/filetype-html.svg?component'),
	html: () => import('bootstrap-icons/icons/filetype-html.svg?component'),
	xhtml: () => import('bootstrap-icons/icons/filetype-xml.svg?component'),
	exe: () => import('bootstrap-icons/icons/filetype-exe.svg?component'),

	// Dokumente
	pdf: () => import('bootstrap-icons/icons/filetype-pdf.svg?component'),
	doc: () => import('bootstrap-icons/icons/filetype-doc.svg?component'),
	docx: () => import('bootstrap-icons/icons/filetype-docx.svg?component'),
	docm: () => import('bootstrap-icons/icons/filetype-doc.svg?component'),
	odt: () => import('bootstrap-icons/icons/filetype-doc.svg?component'),
	rtf: () => import('bootstrap-icons/icons/file-richtext.svg?component'),

	// Tabellen
	xls: () => import('bootstrap-icons/icons/filetype-xls.svg?component'),
	xlsx: () => import('bootstrap-icons/icons/filetype-xlsx.svg?component'),
	ods: () => import('bootstrap-icons/icons/filetype-xls.svg?component'),

	// Präsentationen
	ppt: () => import('bootstrap-icons/icons/filetype-ppt.svg?component'),
	pptx: () => import('bootstrap-icons/icons/filetype-pptx.svg?component'),
	odp: () => import('bootstrap-icons/icons/filetype-ppt.svg?component'),

	// Bilder
	png: () => import('bootstrap-icons/icons/filetype-png.svg?component'),
	jpg: () => import('bootstrap-icons/icons/filetype-jpg.svg?component'),
	jpeg: () => import('bootstrap-icons/icons/filetype-jpg.svg?component'),
	gif: () => import('bootstrap-icons/icons/filetype-gif.svg?component'),
	webp: () => import('bootstrap-icons/icons/filetype-png.svg?component'),
	avif: () => import('bootstrap-icons/icons/filetype-png.svg?component'),
	svg: () => import('bootstrap-icons/icons/filetype-svg.svg?component'),

	// Audio
	mp3: () => import('bootstrap-icons/icons/filetype-mp3.svg?component'),
	wav: () => import('bootstrap-icons/icons/filetype-mp3.svg?component'),
	flac: () => import('bootstrap-icons/icons/filetype-mp3.svg?component'),
	ogg: () => import('bootstrap-icons/icons/filetype-mp3.svg?component'),

	// Video
	mp4: () => import('bootstrap-icons/icons/filetype-mp4.svg?component'),
	webm: () => import('bootstrap-icons/icons/filetype-mp4.svg?component'),
	mkv: () => import('bootstrap-icons/icons/filetype-mp4.svg?component'),
	avi: () => import('bootstrap-icons/icons/filetype-mp4.svg?component'),

	// Archive
	zip: () => import('bootstrap-icons/icons/file-zip.svg?component'),
	rar: () => import('bootstrap-icons/icons/file-zip.svg?component'),
	'7z': () => import('bootstrap-icons/icons/file-zip.svg?component'),
	tar: () => import('bootstrap-icons/icons/file-zip.svg?component'),
	gz: () => import('bootstrap-icons/icons/file-zip.svg?component'),
	db: () => import('bootstrap-icons/icons/database.svg?component'),

	// Code / Entwickler
	js: () => import('bootstrap-icons/icons/filetype-js.svg?component'),
	ts: () => import('bootstrap-icons/icons/typescript.svg?component'),
	tsx: () => import('bootstrap-icons/icons/filetype-tsx.svg?component'),
	jsx: () => import('bootstrap-icons/icons/filetype-jsx.svg?component'),
	java: () => import('bootstrap-icons/icons/filetype-java.svg?component'),
	py: () => import('bootstrap-icons/icons/filetype-py.svg?component'),
	cs: () => import('bootstrap-icons/icons/filetype-cs.svg?component'),
	php: () => import('bootstrap-icons/icons/filetype-php.svg?component'),
	sh: () => import('bootstrap-icons/icons/filetype-sh.svg?component'),

	lnk: () => import('bootstrap-icons/icons/folder-symlink.svg?component'),
	url: () => import('bootstrap-icons/icons/link-45deg.svg?component'),

	// Fallback
	default: () => import('bootstrap-icons/icons/file-earmark.svg?component')
};

// const statt let, ESLint Hinweis behoben
const loadedIcons: Record<string, Component> = {};

export async function getIconComponent(mimeType: string): Promise<Component> {
	const key = mimeType.toLowerCase();

	if (!loadedIcons[key]) {
		try {
			const module = await (icons[key] ?? icons.default)();
			loadedIcons[key] = module.default;
		} catch {
			const module = await icons.default();
			loadedIcons[key] = module.default;
		}
	}

	return loadedIcons[key];
}
