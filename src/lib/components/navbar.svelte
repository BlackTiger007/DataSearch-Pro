<script lang="ts">
	import { indexing } from '$lib/stores/indexing';
</script>

<div class="navbar flex justify-between bg-base-100 shadow-sm">
	<div>
		<a href="/" class="btn text-xl btn-ghost">DataSearch-Pro</a>
		<a href="/dashboard" class="btn text-xl btn-ghost">Dashboard</a>
		<a href="/settings" class="btn text-xl btn-ghost">Einstellungen</a>
		<a href="/about" class="btn text-xl btn-ghost">About</a>
	</div>
	<div>
		<button class="btn flex items-center gap-2" onclick={() => indexing.update((v) => !v)}>
			{#if $indexing}
				<div aria-label="success" class="status status-success"></div>
			{:else}
				<div aria-label="status" class="status status-neutral"></div>
			{/if}
			Status: {$indexing ? 'Indexing' : 'Idle'}
		</button>
	</div>
</div>
