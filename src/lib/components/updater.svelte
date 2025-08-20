<script lang="ts">
	import { onMount } from 'svelte';
	import { check, type DownloadEvent, type Update } from '@tauri-apps/plugin-updater';
	import { relaunch } from '@tauri-apps/plugin-process';
	import { marked } from 'marked';
	import '$lib/css/md.css';
	import { openUrl } from '@tauri-apps/plugin-opener';
	import { online } from 'svelte/reactivity/window';

	let update: Update | null = $state(null);
	let downloadProgress = $state(0);
	let downloadStarted = $state(false);
	let downloadFinished = $state(false);
	let modalOpen = $state(false);
	let contentLength: number | undefined = $state(0);
	let downloaded = $state(0);

	onMount(async () => {
		if (online.current) {
			const result = await check();
			if (result) {
				update = result;
				modalOpen = true;
				console.info(`Update available: version ${update.version}`);
			}
		}
	});

	$effect(() => {
		if (!update) return;
		const links = document.querySelectorAll('.body a');
		links.forEach((link) => link.addEventListener('click', handleLinkClick));
		return () => links.forEach((link) => link.removeEventListener('click', handleLinkClick));
	});

	function handleLinkClick(event: Event) {
		event.preventDefault();
		if (event.target instanceof HTMLAnchorElement) {
			const url = event.target.getAttribute('href');
			if (url) {
				console.log(`Opening URL: ${url}`);
				openUrl(url);
			}
		}
	}

	async function download() {
		if (!online.current) {
			console.error('Cannot download update: offline');
			return;
		}
		if (update && !downloadStarted) {
			await update.download(downloadLog);
		}
	}

	async function downloadAndInstall() {
		if (!online.current) {
			console.error('Cannot download & install update: offline');
			return;
		}
		if (update && !downloadStarted) {
			await update.downloadAndInstall(downloadLog);
			console.info(`Update downloaded and installed: version ${update.version}`);
			await relaunch();
		}
	}

	async function downloadLog(event: DownloadEvent) {
		switch (event.event) {
			case 'Started':
				downloadStarted = true;
				downloadFinished = false;
				contentLength = event.data.contentLength;
				downloaded = 0;
				console.info(
					`Download started for version ${update?.version}. Expected size: ${contentLength ?? 'unknown'} bytes.`
				);
				break;
			case 'Progress':
				downloaded += event.data.chunkLength;
				if (!contentLength) {
					console.warn('Cannot calculate progress: Content-Length unknown');
					return;
				}
				if (downloaded > contentLength) {
					console.warn(
						`Download progress: ${downloaded}/${contentLength} bytes (exceeds expected size!)`
					);
					return;
				}
				downloadProgress = Math.round((downloaded / contentLength) * 100);
				console.log(
					`Download progress: ${downloadProgress}% (${downloaded}/${contentLength} bytes)`
				);
				break;
			case 'Finished':
				downloadFinished = true;
				downloadProgress = 100;
				console.info(`Download finished for version ${update?.version}`);
				break;
		}
	}
</script>

<dialog class="modal backdrop-blur-sm" open={modalOpen}>
	<div class="modal-box flex w-full max-w-lg flex-col space-y-2 md:max-w-2xl">
		<button
			class="btn absolute top-2 right-2 btn-circle btn-sm"
			onclick={() => {
				modalOpen = false;
				update?.close();
			}}
		>
			✕
		</button>

		{#if update && update.body}
			<h2 class="text-xl font-semibold md:text-2xl">Update Available!</h2>
			<h3 class="text-lg font-semibold md:text-xl">Version: {update.version}</h3>
			<h4 class="text-lg">Changelog:</h4>

			<div class="body my-3 max-h-[70vh] flex-1 overflow-y-auto rounded-md bg-base-200 px-3">
				{#await marked.parse(update.body)}
					<p>Loading changelog...</p>
				{:then bodyHtml}
					{@html bodyHtml} <!-- eslint-disable-line -->
				{/await}
			</div>

			{#if downloadStarted && !downloadFinished}
				<p class="mb-2">Download Progress: {downloadProgress}%</p>
				<progress class="progress w-full progress-primary" value={downloadProgress} max="100"
				></progress>
			{:else if downloadFinished}
				<p class="mt-4 text-lg font-semibold text-success">Download Finished!</p>
			{/if}

			<div class="flex flex-col justify-end space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
				{#if update && !downloadStarted}
					<button class="btn btn-primary" disabled={!online.current} onclick={download}>
						Download
					</button>
					<button class="btn btn-primary" disabled={!online.current} onclick={downloadAndInstall}>
						Download & Install
					</button>
				{:else if update && downloadFinished}
					<button class="btn btn-secondary" onclick={update.install}> Install </button>
				{/if}
			</div>
		{/if}
	</div>
</dialog>
