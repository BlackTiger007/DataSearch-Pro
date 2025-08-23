<script lang="ts">
	import { indexing } from '$lib/stores/indexing.svelte';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { onMount } from 'svelte';
	import { formatBytes } from '$lib/utils/formatBytes';
	import { SvelteMap } from 'svelte/reactivity';
	import { open } from '@tauri-apps/plugin-dialog';
	import { handleUnscannedFiles } from '$lib/utils/fileService';

	// Map für animierte Prioritäten
	let animatedPriorities = new SvelteMap<string, Tween<number>>();

	// Funktion, um Priority-Werte smooth zu animieren
	function getAnimatedPriority(file: string, value: number): Tween<number> {
		let tween = animatedPriorities.get(file);
		if (!tween) {
			tween = new Tween(value, { duration: 300, easing: cubicOut });
			animatedPriorities.set(file, tween);
		} else {
			tween.set(value);
		}
		return tween;
	}

	/** Fügt Dateien aus ausgewählten Ordnern der Queue hinzu */
	async function addTempFolders() {
		const paths = await open({ multiple: true, directory: true });
		if (!paths) return;

		indexing.addToQueue(paths);
	}

	/** Fügt Watch-Funktion für ausgewählte Ordner hinzu */
	async function addTempWatchFolders() {
		const paths = await open({ multiple: true, directory: true });
		if (!paths) return;
		indexing.addToQueue(paths);
		await Promise.all(paths.map((p) => indexing.watch(p)));
	}

	onMount(() => {
		// initiale Queue Werte setzen
		indexing.store.queue.forEach((item) => {
			getAnimatedPriority(item.file, item.priority);
		});
	});
</script>

<main class="flex grow flex-col space-y-6 p-6 text-base-content">
	<div>
		{#if import.meta.env.DEV}
			<button class="btn" onclick={handleUnscannedFiles}>Ungescannte Dokumente</button>
		{/if}
		<button class="btn" onclick={addTempFolders}>Add Temp Folder</button>
		<button class="btn" onclick={addTempWatchFolders}>Add Temp Watch Folder</button>
	</div>

	<h1 class="text-3xl font-bold">📊 Dashboard</h1>
	<p class="text-base-content/70">Live-Indexierungsstatus & Warteschlange</p>

	<!-- Watch-Pfade -->
	<section>
		<h2 class="mb-2 text-2xl font-semibold">👀 Aktive Watch-Pfade</h2>
		{#if indexing.store.activeWatches.size > 0}
			<ul class="list divide-y divide-base-200 overflow-hidden rounded-box bg-base-100 shadow-md">
				{#each Array.from(indexing.store.activeWatches) as [path] (path)}
					<li class="list-row transition-colors duration-200 hover:bg-base-200">
						<div class="list-col-grow truncate">{path}</div>
						<button class="btn" onclick={() => indexing.removeWatch(path)}>✕</button>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-base-content/70 italic">Keine aktiven Pfade</p>
		{/if}
	</section>

	<!-- Warteschlange -->
	<section>
		<h2 class="mb-2 text-2xl font-semibold">📦 Aktive Warteschlange</h2>
		<ul class="list overflow-hidden rounded-box bg-base-100 shadow-md">
			<li
				class="list-row transition-all duration-200"
				in:fade={{ duration: 300 }}
				out:fade={{ duration: 200 }}
			>
				{#if indexing.store.currentFile}
					<div class="list-col-grow">
						<div class="font-semibold">🔄 Wird verarbeitet:</div>
						<div class="truncate text-primary">{indexing.store.currentFile}</div>
					</div>
				{:else}
					<div class="list-col-grow text-base-content/70">
						✅ <span class="italic">Es wird aktuell nichts verarbeitet</span>
					</div>
				{/if}
			</li>

			{#each indexing.store.queue as item (item.file)}
				{@const priority = getAnimatedPriority(item.file, item.priority)}
				<li
					class="list-row transition-colors duration-200 hover:bg-base-200"
					animate:flip={{ duration: 300 }}
				>
					<!-- Priority animiert -->
					<div
						class="px-3 text-4xl font-thin tabular-nums opacity-50 transition-all duration-200 ease-in-out"
						style="transform-origin: center;"
					>
						{priority.current.toFixed(0)}
					</div>

					<div class="list-col-grow truncate">
						<div class="truncate" title={item.file}>{item.file}</div>
					</div>

					<span>Dateigröße: {formatBytes(item.data.size)} bytes</span>

					<!-- Buttons: Priority erhöhen -->
					<div class="flex space-x-1">
						{#each [1, 10, 100] as val (val)}
							<button
								class="btn transition-transform btn-outline btn-sm hover:scale-110"
								onclick={() => indexing.setPriority(item.file, val)}
							>
								+{val}
							</button>
						{/each}
					</div>

					<!-- Buttons: Priority verringern -->
					<div class="flex space-x-1">
						{#each [100, 10, 1] as val (val)}
							<button
								class="btn transition-transform btn-outline btn-sm hover:scale-110"
								onclick={() => indexing.setPriority(item.file, -val)}
							>
								-{val}
							</button>
						{/each}
					</div>
				</li>
			{/each}
		</ul>
	</section>
</main>
