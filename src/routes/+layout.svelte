<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/navbar.svelte';
	import { settings } from '$lib/stores/settings.svelte';
	import Updater from '$lib/components/updater.svelte';
	import { online } from 'svelte/reactivity/window';
	import { setLocale } from '$lib/paraglide/runtime';

	let { children } = $props();
	setLocale(settings.locale);
</script>

<div class="flex min-h-screen flex-col bg-base-300" data-theme={settings.theme}>
	<Navbar />
	{#if online.current && !import.meta.env.DEV}
		<Updater />
	{/if}
	{@render children?.()}
</div>
