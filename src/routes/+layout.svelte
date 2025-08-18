<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/navbar.svelte';
	import { settings } from '$lib/stores/settings.svelte';

	let { children } = $props();
</script>

<div class="flex min-h-screen flex-col bg-base-300" data-theme={settings.theme}>
	<Navbar />
	{@render children?.()}
</div>
