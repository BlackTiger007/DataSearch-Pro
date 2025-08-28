<script lang="ts">
	import VirtualList from './VirtualList.svelte';
	import ListItem from './ListItem.svelte';

	export let items: any[] = [];
	export let start: number = 0;
	export let end: number = 0;
	export let scrollToIndex: ((index: number, opts?: ScrollToOptions) => Promise<void>) | undefined =
		undefined;
	export let selectFile: ((file: any) => void) | undefined;
</script>

<div class="h-full">
	<VirtualList {items} bind:start bind:end bind:scrollToIndex let:item>
		<ListItem {item} onClick={(file) => selectFile?.(file)} />
	</VirtualList>
</div>
