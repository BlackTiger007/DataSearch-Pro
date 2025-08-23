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

<main class="flex grow flex-col space-y-6 p-4 text-base-content md:p-6">
	<!-- Actions -->
	<div class="flex flex-wrap gap-2">
		{#if import.meta.env.DEV}
			<button class="btn btn-outline btn-sm" onclick={handleUnscannedFiles}>
				🧩 Ungescannte
			</button>
		{/if}
		<button class="btn btn-sm" onclick={addTempFolders}>📂 Add Folder</button>
		<button class="btn btn-sm" onclick={addTempWatchFolders}>👀 Watch Folder</button>
	</div>

	<h1 class="text-2xl font-bold md:text-3xl">📊 Dashboard</h1>
	<p class="text-base-content/70">Live-Indexierungsstatus & Warteschlange</p>

	<!-- Watch-Pfade -->
	<section>
		<h2 class="mb-2 text-xl font-semibold md:text-2xl">👀 Aktive Watch-Pfade</h2>
		{#if indexing.store.activeWatches.size > 0}
			<ul class="divide-y divide-base-200 overflow-hidden rounded-box bg-base-100 shadow-md">
				{#each Array.from(indexing.store.activeWatches) as [path] (path)}
					<li class="flex items-center justify-between px-3 py-2 hover:bg-base-200">
						<span class="truncate text-sm md:text-base">{path}</span>
						<button
							class="btn btn-outline btn-xs btn-error"
							title="Entfernen"
							onclick={() => indexing.removeWatch(path)}
						>
							✕
						</button>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-base-content/70 italic">Keine aktiven Pfade</p>
		{/if}
	</section>

	<!-- Warteschlange -->
	<section>
		<h2 class="mb-2 text-xl font-semibold md:text-2xl">📦 Aktive Warteschlange</h2>
		<ul class="overflow-hidden rounded-box bg-base-100 shadow-md">
			<li class="border-b border-base-200 px-3 py-2">
				{#if indexing.store.currentFile}
					<div class="flex items-center gap-2">
						<span class="loading loading-sm loading-spinner text-primary"></span>
						<div class="truncate" title={indexing.store.currentFile}>
							<strong>Wird verarbeitet:</strong>
							<span class="text-primary">{indexing.store.currentFile}</span>
						</div>
					</div>
				{:else}
					<div class="flex items-center gap-2 text-base-content/70">
						<span class="badge badge-outline">Idle</span>
						<span class="italic">Es wird aktuell nichts verarbeitet</span>
					</div>
				{/if}
			</li>

			{#each indexing.store.queue as item (item.file)}
				{@const priority = getAnimatedPriority(item.file, item.priority)}
				<li
					class="grid grid-cols-1 items-center gap-3 px-3 py-2 hover:bg-base-200 md:grid-cols-[60px_1fr_auto]"
					animate:flip={{ duration: 300 }}
				>
					<!-- Priority animiert -->
					<div class="text-center text-2xl font-thin opacity-70">
						{priority.current.toFixed(0)}
					</div>

					<!-- File info -->
					<div class="truncate">
						<div class="truncate text-sm md:text-base" title={item.file}>
							{item.file}
						</div>
						<div class="text-xs opacity-70">📏 {formatBytes(item.data.size)}</div>
					</div>

					<!-- Controls -->
					<div class="flex items-center gap-2">
						<!-- Erhöhen -->
						<div class="flex gap-1">
							{#each [1, 10, 100] as val (val)}
								<button
									class="btn btn-outline btn-xs btn-success"
									title={`Priorität +${val}`}
									onclick={() => indexing.setPriority(item.file, val)}
								>
									+{val}
								</button>
							{/each}
						</div>
						<!-- Verringern -->
						<div class="flex gap-1">
							{#each [100, 10, 1] as val (val)}
								<button
									class="btn btn-outline btn-xs btn-error"
									title={`Priorität -${val}`}
									onclick={() => indexing.setPriority(item.file, -val)}
								>
									-{val}
								</button>
							{/each}
						</div>
					</div>
				</li>
			{/each}
		</ul>
	</section>
</main>
