<script lang="ts">
	import { indexing } from '$lib/stores/indexing.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { settings } from '$lib/stores/settings.svelte';
	import { m } from '$lib/paraglide/messages';

	onMount(() => {
		indexing.addToQueue(settings.folders);
		if (settings.autoWatch) {
			Promise.all(settings.folders.map((p) => indexing.watch(p)));
		}
	});

	onDestroy(() => {
		for (const handle of indexing.store.activeWatches.values()) handle();
		indexing.store.activeWatches.clear();
	});
</script>

<div class="navbar flex justify-between bg-base-100 shadow-sm">
	<div class="flex gap-1">
		<a href="/" class="btn">{m.navbar_home()}</a>
		<a href="/dashboard" class="btn">{m.navbar_dashboard()}</a>
		<a href="/settings" class="btn">{m.navbar_settings()}</a>
	</div>

	<div class="flex gap-1">
		<button
			class="btn flex gap-2"
			disabled={indexing.store.queue.length === 0}
			onclick={() => {
				if (indexing.store.isRunning && !indexing.store.isPaused) {
					indexing.pause();
				} else if (indexing.store.isRunning && indexing.store.isPaused) {
					indexing.resume();
				} else {
					indexing.start();
				}
			}}
		>
			{#if indexing.store.isRunning && !indexing.store.isPaused}
				<div aria-label="running" class="status status-success"></div>
				{m.navbar_status_running()}
			{:else if indexing.store.isRunning && indexing.store.isPaused}
				<div aria-label="paused" class="status status-warning"></div>
				{m.navbar_status_paused()}
			{:else}
				<div aria-label="idle" class="status status-neutral"></div>
				{m.navbar_status_idle()}
			{/if}
		</button>
	</div>
</div>
