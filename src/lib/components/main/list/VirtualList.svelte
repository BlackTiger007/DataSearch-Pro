<script lang="ts">
	import { onMount, tick } from 'svelte';

	// Props
	export let items: any[] = [];
	export let itemHeight: number | undefined = undefined;
	export let start: number = 0; // bind:start
	export let end: number = 0;

	// Local state
	let height_map: number[] = [];
	let rows: HTMLCollectionOf<HTMLElement>;
	let viewport: HTMLElement;
	let contents: HTMLElement;
	let viewport_height = 0;
	let mounted = false;
	let top = 0;
	let bottom = 0;
	let average_height = 0;

	// Derived state
	$: visible = items.slice(start, end).map((data, i) => ({ index: i + start, data }));

	// Whenever `items` changes, invalidate the current height map
	$: if (mounted && viewport_height > 0 && items.length > 0) {
		refresh(items, viewport_height, itemHeight);
	}

	async function refresh(items: any[], viewportHeight: number, itemHeight?: number) {
		if (!viewport || !contents) return;

		const isStartOverflow = items.length < start;
		if (isStartOverflow) {
			await scrollToIndex(items.length - 1, { behavior: 'auto' });
		}

		const { scrollTop } = viewport;
		await tick();

		let content_height = top - scrollTop;
		let i = start;

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

		const { scrollTop } = viewport;

		for (let v = 0; v < rows.length; v++) {
			height_map[start + v] = itemHeight || rows[v].offsetHeight;
		}

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
		const itemsDelta = index - start;
		const _itemHeight = itemHeight || average_height || 50;
		const distance = itemsDelta * _itemHeight;

		opts = {
			left: 0,
			top: viewport.scrollTop + distance,
			behavior: 'smooth',
			...opts
		};

		viewport.scrollTo(opts);
	}

	onMount(async () => {
		await tick();

		// Höhe prüfen
		viewport_height = viewport.offsetHeight;

		if (viewport_height === 0) {
			console.warn('viewport height is 0 – vielleicht braucht dein Container eine feste Höhe!');
		}

		// Rows referenzieren
		rows = contents.getElementsByTagName(
			'svelte-virtual-list-row'
		) as HTMLCollectionOf<HTMLElement>;

		mounted = true;

		// Falls noch keine Höhe/Rows → nächsten Tick probieren
		if (viewport_height > 0 && items.length > 0) {
			await refresh(items, viewport_height, itemHeight);
		} else {
			setTimeout(async () => {
				viewport_height = viewport.offsetHeight;
				rows = contents.getElementsByTagName(
					'svelte-virtual-list-row'
				) as HTMLCollectionOf<HTMLElement>;
				if (viewport_height > 0) {
					await refresh(items, viewport_height, itemHeight);
				}
			}, 50);
		}
	});
</script>

<svelte-virtual-list-viewport
	bind:this={viewport}
	bind:offsetHeight={viewport_height}
	on:scroll={handle_scroll}
	class="relative block h-full overflow-y-auto"
>
	<svelte-virtual-list-contents
		bind:this={contents}
		class="block"
		style="padding-top: {top}px; padding-bottom: {bottom}px;"
	>
		{#each visible as row (row.index)}
			<svelte-virtual-list-row class="block overflow-hidden">
				<slot item={row.data}>Missing template</slot>
			</svelte-virtual-list-row>
		{/each}
	</svelte-virtual-list-contents>
</svelte-virtual-list-viewport>
