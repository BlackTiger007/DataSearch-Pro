<script lang="ts">
	import { goto } from '$app/navigation';
	import { cleanupMissingFiles } from '$lib/maintenance/cleanupMissingFiles';
	import { saveSettings } from '$lib/services/settingsService';
	import { settings } from '$lib/stores/settings.svelte';
	import type { SettingsType } from '$lib/validation/settingsSchema';
	import { open } from '@tauri-apps/plugin-dialog';

	let localSettings: SettingsType = $state({ ...settings });

	async function save() {
		await saveSettings($state.snapshot(localSettings));
		goto('/');
	}

	async function pickFolder(i: number) {
		const folder = await open({
			directory: true,
			multiple: false
		});

		if (folder && typeof folder === 'string') {
			localSettings.folders[i] = folder;
		}
	}
</script>

<div class="mx-auto w-full max-w-4xl space-y-6 p-6">
	<h1 class="mb-6 text-3xl font-bold">Settings</h1>

	<!-- Theme -->
	<div class="card bg-base-200 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Theme</h2>
			<div class="mt-2 flex gap-4">
				<label class="label cursor-pointer">
					<span class="label-text mr-2">System</span>
					<input
						type="radio"
						name="theme"
						class="radio"
						value="system"
						bind:group={localSettings.theme}
					/>
				</label>
				<label class="label cursor-pointer">
					<span class="label-text mr-2">Light</span>
					<input
						type="radio"
						name="theme"
						class="radio"
						value="light"
						bind:group={localSettings.theme}
					/>
				</label>
				<label class="label cursor-pointer">
					<span class="label-text mr-2">Dark</span>
					<input
						type="radio"
						name="theme"
						class="radio"
						value="dark"
						bind:group={localSettings.theme}
					/>
				</label>
			</div>
		</div>
	</div>

	<!-- Folders -->
	<div class="card bg-base-200 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Folders</h2>
			<div class="space-y-2">
				{#each localSettings.folders, i}
					<div class="flex gap-2">
						<input
							type="text"
							class="input-bordered input w-full"
							bind:value={localSettings.folders[i]}
						/>
						<button class="btn" onclick={() => pickFolder(i)}>Folder</button>
						<button class="btn btn-error" onclick={() => localSettings.folders.splice(i, 1)}>
							✕
						</button>
					</div>
				{/each}
				<button class="btn btn-primary" onclick={() => localSettings.folders.push('')}>
					Add Folder
				</button>
			</div>
		</div>
	</div>

	<!-- Allowed File Types -->
	<div class="card bg-base-200 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Allowed File Types</h2>
			<div class="space-y-2">
				{#each localSettings.allowedFileTypes, i}
					<div class="flex gap-2">
						<input
							type="text"
							class="input-bordered input w-full"
							bind:value={localSettings.allowedFileTypes[i]}
						/>
						<button
							class="btn btn-error"
							onclick={() => localSettings.allowedFileTypes.splice(i, 1)}
						>
							✕
						</button>
					</div>
				{/each}
				<button class="btn btn-primary" onclick={() => localSettings.allowedFileTypes.push('')}>
					Add Type
				</button>
			</div>
		</div>
	</div>

	<!-- Automatic -->
	<div class="card bg-base-200 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Automation</h2>
			<label class="label cursor-pointer">
				<span class="label-text">Watching Folders</span>
				<input
					type="checkbox"
					class="toggle toggle-primary"
					bind:checked={localSettings.autoWatch}
				/>
			</label>

			<label class="label cursor-pointer">
				<span class="label-text">Auto Start Indexierung</span>
				<input
					type="checkbox"
					class="toggle toggle-primary"
					bind:checked={localSettings.autoStart}
				/>
			</label>
		</div>
	</div>

	<!-- Image Text Extraction -->
	<div class="card bg-base-200 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Texterkennung (OCR)</h2>
			<p class="text-sm opacity-70">
				Wenn aktiviert, werden Texte aus eingebetteten Bildern (z. B. in Word, PDF oder Bilddateien)
				automatisch extrahiert.
			</p>
			<label class="label mt-2 cursor-pointer">
				<span class="label-text">Texte aus Bildern extrahieren</span>
				<input
					type="checkbox"
					class="toggle toggle-primary"
					bind:checked={localSettings.enableImageTextExtraction}
				/>
			</label>
		</div>
	</div>

	<!-- Parallel Jobs -->
	<div class="card bg-base-200 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Parallel Jobs</h2>
			<p class="text-sm opacity-70">
				Anzahl der Dateien, die gleichzeitig verarbeitet werden. Höhere Werte können die Performance
				verbessern, belasten aber CPU und RAM.
			</p>
			<p>Parallele Jobs: {localSettings.parallelJobs}</p>
			<input type="range" min="1" max="8" bind:value={localSettings.parallelJobs} class="range" />
		</div>
	</div>

	<!-- Locale -->
	<div class="card bg-base-200 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Language</h2>
			<select class="select-bordered select w-full max-w-xs" bind:value={localSettings.locale}>
				<option value="en">English</option>
				<option value="de">Deutsch</option>
				<option value="fr">Français</option>
			</select>
		</div>
	</div>

	<!-- Cleanup -->
	<div class="card bg-base-200 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Datenbank-Bereinigung</h2>
			<p>Entfernt Einträge, deren Dateien nicht mehr vorhanden sind.</p>
			<button class="btn btn-error" onclick={cleanupMissingFiles}>
				Fehlende Dateien bereinigen
			</button>
		</div>
	</div>

	<!-- Save Button -->
	<div class="flex justify-end">
		<button class="btn btn-success" onclick={save}>Save Settings</button>
	</div>
</div>
