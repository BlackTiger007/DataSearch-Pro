import { paraglideVitePlugin } from '@inlang/paraglide-js';
import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import svg from '@poppanator/sveltekit-svg';

const host = process.env.TAURI_DEV_HOST;

import { sentrySvelteKit } from '@sentry/sveltekit';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig(async () => ({
	plugins: [
		sentrySvelteKit({
			sourceMapsUploadOptions: {
				org: 'authhub',
				project: 'datasearch-pro',
				url: 'https://glitchtip.webretter.com/'
			}
		}),
		tailwindcss(),
		sveltekit(),
		svg({
			svgoOptions: {
				plugins: [
					{
						name: 'preset-default',
						// by default svgo removes the viewBox which prevents svg icons from scaling
						// not a good idea! https://github.com/svg/svgo/pull/1461
						params: { overrides: { removeViewBox: false } }
					}
				]
			}
		}),
		devtoolsJson(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			strategy: ['globalVariable', 'localStorage', 'preferredLanguage']
		})
	],

	// Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
	//
	// 1. prevent Vite from obscuring rust errors
	clearScreen: false,
	// 2. tauri expects a fixed port, fail if that port is not available
	server: {
		port: 1420,
		strictPort: true,
		host: host || false,
		hmr: host
			? {
					protocol: 'ws',
					host,
					port: 1421
				}
			: undefined,
		watch: {
			// 3. tell Vite to ignore watching `src-tauri`
			ignored: ['**/src-tauri/**']
		}
	}
}));
