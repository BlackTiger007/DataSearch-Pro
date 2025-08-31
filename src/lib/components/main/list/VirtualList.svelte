<script lang="ts" generics="T">
	import { onMount, tick, type Snippet } from 'svelte';

	let {
		items = [],
		itemHeight = undefined,
		start = 0,
		end = 0,
		row
	}: {
		items: T[];
		itemHeight?: number;
		start?: number;
		end?: number;
		row: Snippet<[T]>;
	} = $props();

	let height_map: number[] = $state([]);
	let rows: HTMLCollectionOf<HTMLElement>;
	let viewport: HTMLElement;
	let contents: HTMLElement;
	let viewport_height = $state(0);
	let mounted = $state(false);
	let top = $state(0);
	let bottom = $state(0);
	let average_height = $state(0);

	let visible = $derived(items.slice(start, end).map((data, i) => ({ index: i + start, data })));

	$effect(() => {
		if (mounted && viewport_height > 0 && items.length > 0) {
			refresh(items, viewport_height, itemHeight);
		}
	});

	async function refresh(items: T[], viewportHeight: number, itemHeight?: number) {
		if (!viewport || !contents) return;

		let i = start;
		let content_height = top - viewport.scrollTop;

		while (content_height < viewportHeight && i < items.length) {
			let row = rows[i - start] as HTMLElement | undefined;

			if (!row) {
				end = i + 1;
				await tick();
				row = rows[i - start] as HTMLElement;
			}

			const row_height = (height_map[i] = itemHeight || row?.offsetHeight || 50);
			content_height += row_height;
			i++;
		}

		end = i;
		const remaining = items.length - end;
		average_height = (top + content_height) / end;
		bottom = remaining * average_height;
		height_map.length = items.length;
	}

	async function handle_scroll() {
		if (!viewport || !rows) return;

		let scrollTop = viewport.scrollTop;
		let i = 0;
		let y = 0;

		while (i < items.length) {
			const row_height = height_map[i] || average_height || 50;
			if (y + row_height > scrollTop) {
				start = i;
				top = y;
				break;
			}
			y += row_height;
			i++;
		}

		while (i < items.length) {
			y += height_map[i] || average_height || 50;
			i++;
			if (y > scrollTop + viewport_height) break;
		}

		end = i;
		const remaining = items.length - end;
		average_height = y / (end || 1);

		while (i < items.length) height_map[i++] = average_height;
		bottom = remaining * average_height;
	}

	export async function scrollToIndex(index: number, opts?: ScrollToOptions) {
		if (!viewport) return;
		const _itemHeight = itemHeight || average_height || 50;
		viewport.scrollTo({
			left: 0,
			top: viewport.scrollTop + (index - start) * _itemHeight,
			behavior: 'smooth',
			...opts
		});
	}

	onMount(async () => {
		await tick();
		viewport_height = viewport.offsetHeight;
		rows = contents.getElementsByTagName(
			'svelte-virtual-list-row'
		) as HTMLCollectionOf<HTMLElement>;
		mounted = true;

		if (viewport_height > 0 && items.length > 0) {
			await refresh(items, viewport_height, itemHeight);
		} else {
			setTimeout(async () => {
				viewport_height = viewport.offsetHeight;
				rows = contents.getElementsByTagName(
					'svelte-virtual-list-row'
				) as HTMLCollectionOf<HTMLElement>;
				if (viewport_height > 0) await refresh(items, viewport_height, itemHeight);
			}, 50);
		}
	});
</script>

<svelte-virtual-list-viewport
	bind:this={viewport}
	bind:offsetHeight={viewport_height}
	onscroll={handle_scroll}
	class="relative block h-full overflow-y-auto"
>
	<svelte-virtual-list-contents
		bind:this={contents}
		class="block"
		style="padding-top: {top}px; padding-bottom: {bottom}px;"
	>
		{#each visible as content (content.index)}
			<svelte-virtual-list-row class="block overflow-hidden">
				{@render row(content.data)}
			</svelte-virtual-list-row>
		{/each}
	</svelte-virtual-list-contents>
</svelte-virtual-list-viewport>
