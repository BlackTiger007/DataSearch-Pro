import type { Component } from 'svelte';

export const icons: Record<string, () => Promise<{ default: Component }>> = {
	txt: () => import('bootstrap-icons/icons/filetype-txt.svg?component'),
	csv: () => import('bootstrap-icons/icons/filetype-csv.svg?component'),
	md: () => import('bootstrap-icons/icons/filetype-md.svg?component'),
	yaml: () => import('bootstrap-icons/icons/filetype-yml.svg?component'),
	yml: () => import('bootstrap-icons/icons/filetype-yml.svg?component'),
	json: () => import('bootstrap-icons/icons/filetype-json.svg?component'),
	pdf: () => import('bootstrap-icons/icons/filetype-pdf.svg?component'),
	png: () => import('bootstrap-icons/icons/filetype-png.svg?component'),
	jpg: () => import('bootstrap-icons/icons/filetype-jpg.svg?component'),
	jpeg: () => import('bootstrap-icons/icons/filetype-jpg.svg?component'),
	docx: () => import('bootstrap-icons/icons/filetype-docx.svg?component'),
	docm: () => import('bootstrap-icons/icons/filetype-doc.svg?component'),
	xlsx: () => import('bootstrap-icons/icons/filetype-xlsx.svg?component'),
	pptx: () => import('bootstrap-icons/icons/filetype-pptx.svg?component'),
	odt: () => import('bootstrap-icons/icons/filetype-doc.svg?component'),
	ods: () => import('bootstrap-icons/icons/filetype-doc.svg?component'),
	odp: () => import('bootstrap-icons/icons/filetype-doc.svg?component'),
	xml: () => import('bootstrap-icons/icons/filetype-xml.svg?component'),
	htm: () => import('bootstrap-icons/icons/filetype-html.svg?component'),
	html: () => import('bootstrap-icons/icons/filetype-html.svg?component'),
	xhtml: () => import('bootstrap-icons/icons/filetype-xml.svg?component'),
	svg: () => import('bootstrap-icons/icons/filetype-svg.svg?component'),

	// Fallback-Icon
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
