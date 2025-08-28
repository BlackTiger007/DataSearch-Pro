<script lang="ts">
	import type { File } from '$lib/db/schema';
	import { formatBytes } from '$lib/utils/formatBytes';
	import { getIconComponent } from '$lib/utils/icons';

	export let item: File;
	export let onClick: ((item: any) => void) | undefined;
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="flex cursor-pointer rounded-lg p-2 hover:bg-base-100" onclick={() => onClick?.(item)}>
	<!-- Icon Slot oder Default -->
	{#if $$slots.icon}
		<slot name="icon" {item}></slot>
	{:else}
		{#await getIconComponent(item.mimeType) then Icon}
			<Icon class="size-12 text-base-content/70" />
		{/await}
	{/if}

	<div class="mx-2 flex min-w-0 flex-1 flex-col overflow-hidden">
		<!-- Main Content Slot oder Default -->
		{#if $$slots.default}
			<slot {item}></slot>
		{:else}
			<div class="truncate font-semibold" title={item.name}>{item.name}</div>
			<div class="truncate text-xs text-base-content/70" title={item.path}>{item.path}</div>
		{/if}
	</div>

	<!-- Extra Info Slot oder Default -->
	{#if $$slots.extra}
		<slot name="extra" {item}></slot>
	{:else}
		<div class="ml-2 shrink-0 text-sm">{formatBytes(item.size)}</div>
	{/if}
</div>
