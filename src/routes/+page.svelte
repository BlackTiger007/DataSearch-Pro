<script lang="ts">
	import { db } from '$lib/db';
	import { schema } from '$lib/db/schema';
	import { formatBytes } from '$lib/utils/formatBytes';

	const myFiles = db.select().from(schema.files);

	// Dynamisches Icon pro Dateityp
	function getIcon(type: string) {
		switch (type) {
			case 'pdf':
				return '📄';
			case 'psd':
				return '🖌️';
			case 'image':
				return '🖼️';
			case 'txt':
				return '📝';
			default:
				return '📁';
		}
	}

	const higlichtFiles: number[] = [];
</script>

<div class="grow bg-base-100">
	<!-- Suchleiste -->
	<div class="container mx-auto mb-4 px-4">
		<input type="text" placeholder="Suche Dateien..." class="input-bordered input w-full" />
	</div>

	<div class="container mx-auto grid gap-4 px-4">
		<!-- Dateiliste -->
		{#await myFiles then files}
			<div class="col-span-2">
				<div class="w-full overflow-x-auto">
					<table class="table w-full">
						<thead>
							<tr>
								<th>Icon</th>
								<th>Name</th>
								<th>Pfad</th>
								<th>Größe</th>
							</tr>
						</thead>
						<tbody>
							{#each files as file (file.id)}
								<tr class:bg-info={higlichtFiles.includes(file.id)}>
									<td>{getIcon(file.mimeType)}</td>
									<td>{file.name}</td>
									<td class="truncate" title={file.path}>{file.path}</td>
									<td>{formatBytes(file.size)}</td>
									<td>{file.id}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/await}
	</div>
</div>
