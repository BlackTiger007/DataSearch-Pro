<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<main class="flex grow flex-col space-y-6 p-6 text-base-content">
	<h1 class="text-3xl font-bold">Dashboard</h1>
	<p class="text-base-content/70">Indexierungsstatus + Warteschlange</p>
</main>
