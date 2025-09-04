<script lang="ts">
	import { indexing } from '$lib/stores/indexing.svelte';
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { onMount } from 'svelte';
	import { formatBytes } from '$lib/utils/formatBytes';
	import { SvelteMap } from 'svelte/reactivity';
	import { open } from '@tauri-apps/plugin-dialog';
	import { handleUnscannedFiles } from '$lib/utils/fileService';
	import List from '$lib/components/VirtualList.svelte';
	import { m } from '$lib/paraglide/messages';

	// Icons
	import AddFolder from 'bootstrap-icons/icons/folder-plus.svg?component';
	import WatchIcon from 'bootstrap-icons/icons/eye.svg?component';
	import RemoveIcon from 'bootstrap-icons/icons/x-lg.svg?component';
	import Spinner from 'bootstrap-icons/icons/arrow-repeat.svg?component';
	import IdleIcon from 'bootstrap-icons/icons/pause-circle.svg?component';
	import QueueIcon from 'bootstrap-icons/icons/box-seam.svg?component';
	import PlusIcon from 'bootstrap-icons/icons/plus.svg?component';
	import MinusIcon from 'bootstrap-icons/icons/dash.svg?component';

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
				<QueueIcon class="size-4" />
				{m.dashboard_unscanned()}
			</button>
		{/if}
		<button class="btn btn-sm" onclick={addTempFolders}>
			<AddFolder class="size-4" />
			{m.dashboard_add_folder()}
		</button>
		<button class="btn btn-sm" onclick={addTempWatchFolders}>
			<WatchIcon class="size-4" />
			{m.dashboard_watch_folder()}
		</button>
	</div>

	<h1 class="flex items-center gap-2 text-2xl font-bold md:text-3xl">
		<QueueIcon class="size-6" />
		{m.dashboard_title()}
	</h1>
	<p class="text-base-content/70">{m.dashboard_subtitle()}</p>

	<!-- Watch-Pfade -->
	<section>
		<h2 class="mb-2 flex items-center gap-2 text-xl font-semibold md:text-2xl">
			<WatchIcon class="size-5" />
			{m.dashboard_active_watches_title()}
		</h2>
		{#if indexing.store.activeWatches.size > 0}
			<ul class="divide-y divide-base-200 overflow-hidden rounded-box bg-base-100 shadow-md">
				{#each Array.from(indexing.store.activeWatches) as [path] (path)}
					<li class="flex items-center justify-between px-3 py-2 hover:bg-base-200">
						<span class="truncate text-sm md:text-base">{path}</span>
						<button
							class="btn flex items-center gap-1 btn-outline btn-xs btn-error"
							title={m.dashboard_remove()}
							onclick={() => indexing.removeWatch(path)}
						>
							<RemoveIcon class="size-3" />
						</button>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-base-content/70 italic">{m.dashboard_active_watches_none()}</p>
		{/if}
	</section>

	<!-- Warteschlange -->
	<section>
		<h2 class="mb-2 flex items-center gap-2 text-xl font-semibold md:text-2xl">
			<QueueIcon class="size-5" />
			{m.dashboard_queue_title()}
		</h2>

		<div class="rounded-box border-b border-base-200 bg-base-100 shadow-md">
			<ul class="overflow-hidden">
				<li class="px-3 py-2">
					{#if indexing.store.currentFiles.length > 0}
						<div class="flex flex-col gap-1">
							{#each indexing.store.currentFiles as file (file)}
								<div class="flex items-center gap-2">
									<Spinner class="size-4 animate-spin text-primary" />
									<div class="truncate" title={file}>
										<strong>{m.dashboard_processing_label()}</strong>
										<span class="text-primary">{file}</span>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="flex items-center gap-2 text-base-content/70">
							<IdleIcon class="size-4" />
							<span class="italic">{m.dashboard_idle()}</span>
						</div>
					{/if}
				</li>
			</ul>

			<div class="h-[calc(100vh-470px)]">
				<List items={indexing.store.queue}>
					{#snippet row(item)}
						<div
							class="grid grid-cols-1 items-center gap-3 px-3 py-2 hover:bg-base-200 md:grid-cols-[60px_1fr_auto]"
						>
							<!-- Priority animiert -->
							<div class="text-center text-2xl font-thin opacity-70">
								{item.priority.toFixed(0)}
							</div>

							<!-- File info -->
							<div class="truncate">
								<div class="truncate text-sm md:text-base" title={item.file}>
									{item.file}
								</div>
								<div class="flex items-center gap-1 text-xs opacity-70">
									{formatBytes(item.data.size)}
								</div>
							</div>

							<!-- Controls -->
							<div class="flex items-center gap-2">
								<!-- Erhöhen -->
								<div class="flex gap-1">
									{#each [1, 10, 100] as val (val)}
										<button
											class="btn flex items-center gap-1 btn-outline btn-xs btn-success"
											title={m.dashboard_priority_increase_title({ val })}
											onclick={() => indexing.setPriority(item.file, val)}
										>
											<PlusIcon class="size-3" />
											{val}
										</button>
									{/each}
								</div>
								<!-- Verringern -->
								<div class="flex gap-1">
									{#each [100, 10, 1] as val (val)}
										<button
											class="btn flex items-center gap-1 btn-outline btn-xs btn-error"
											title={m.dashboard_priority_decrease_title({ val })}
											onclick={() => indexing.setPriority(item.file, -val)}
										>
											<MinusIcon class="size-3" />
											{val}
										</button>
									{/each}
								</div>
							</div>
						</div>
					{/snippet}
				</List>
			</div>
		</div>
	</section>
</main>
