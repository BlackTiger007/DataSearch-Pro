<script lang="ts">
	import { goto } from '$app/navigation';
	import { cleanupMissingFiles } from '$lib/maintenance/cleanupMissingFiles';
	import { saveSettings } from '$lib/services/settingsService';
	import { settings } from '$lib/stores/settings.svelte';
	import { availableEncodings } from '$lib/types/encodings';
	import type { SettingsType } from '$lib/validation/settingsSchema';
	import { app } from '@tauri-apps/api';
	import { open } from '@tauri-apps/plugin-dialog';
	import Folder from 'bootstrap-icons/icons/folder.svg?component';
	import FolderAdd from 'bootstrap-icons/icons/folder-plus.svg?component';
	import FolderRemove from 'bootstrap-icons/icons/folder-minus.svg?component';
	import Recycle from 'bootstrap-icons/icons/recycle.svg?component';

	let localSettings: SettingsType = $state({ ...settings });
	let showSnackbar = $state(false);

	async function save() {
		await saveSettings($state.snapshot(localSettings));
		showSnackbar = true;
		setTimeout(() => (showSnackbar = false), 3000);
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
	<div class="flex justify-between">
		<h1 class="text-3xl font-bold">Settings</h1>
		<div class="flex gap-2">
			<button class="btn" onclick={() => goto('/')}>Cancel</button>
			<button class="btn btn-success" onclick={save}>Save Settings</button>
		</div>
	</div>

	<!-- Snackbar -->
	{#if showSnackbar}
		<div class="toast z-10">
			<div class="alert alert-success">Settings saved successfully</div>
		</div>
	{/if}

	<!-- Theme -->
	<div class="card bg-base-200 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Theme</h2>
			<div class="mt-2 flex gap-4">
				{#each ['system', 'light', 'dark'] as theme}
					<label class="label cursor-pointer" for={`theme-${theme}`}>
						<span class="label-text mr-2 capitalize">{theme}</span>
						<input
							id={`theme-${theme}`}
							type="radio"
							name="theme"
							class="radio"
							value={theme}
							bind:group={localSettings.theme}
						/>
					</label>
				{/each}
			</div>
		</div>
	</div>

	<!-- Folders -->
	<div class="card bg-base-200 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Folders</h2>
			<div class="space-y-2">
				{#each localSettings.folders, i}
					<div class="flex items-center gap-2">
						<input
							id={`folder-${i}`}
							name={`folder-${i}`}
							type="text"
							class="input-bordered input w-full"
							placeholder="Enter folder path..."
							bind:value={localSettings.folders[i]}
						/>
						<button class="btn btn-outline" onclick={() => pickFolder(i)} title="Pick folder">
							<Folder></Folder>
						</button>
						<button
							class="btn btn-error"
							onclick={() => localSettings.folders.splice(i, 1)}
							title="Remove folder"
						>
							<FolderRemove></FolderRemove>
						</button>
					</div>
				{/each}
				<button class="btn btn-primary" onclick={() => localSettings.folders.push('')}>
					<FolderAdd></FolderAdd> Add Folder
				</button>
			</div>
		</div>
	</div>

	<!-- Allowed File Types -->
	<div class="card bg-base-200 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Allowed File Types</h2>
			<div class="space-y-2">
				{#each localSettings.allowedFileTypes as type, i}
					<div class="flex items-center gap-2">
						<input
							id={`filetype-${i}`}
							name={`filetype-${i}`}
							type="text"
							class="input-bordered input w-full"
							placeholder=".pdf, .docx, .txt..."
							bind:value={localSettings.allowedFileTypes[i]}
						/>
						<button
							class="btn btn-error"
							onclick={() => localSettings.allowedFileTypes.splice(i, 1)}
							title="Remove file type"
						>
							<FolderRemove></FolderRemove>
						</button>
					</div>
				{/each}
				<button class="btn btn-primary" onclick={() => localSettings.allowedFileTypes.push('')}>
					<FolderAdd></FolderAdd> Add Type
				</button>
			</div>
		</div>
	</div>

	<!-- Automation -->
	<div class="card bg-base-200 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Automation</h2>
			<label class="label cursor-pointer" for="autoWatch">
				<span class="label-text">Watching Folders</span>
				<input
					id="autoWatch"
					type="checkbox"
					class="toggle toggle-primary"
					aria-label="Enable watching folders"
					bind:checked={localSettings.autoWatch}
				/>
			</label>

			<label class="label cursor-pointer" for="autoStart">
				<span class="label-text">Auto Start Indexing</span>
				<input
					id="autoStart"
					type="checkbox"
					class="toggle toggle-primary"
					aria-label="Enable auto start indexing"
					bind:checked={localSettings.autoStart}
				/>
			</label>
		</div>
	</div>

	<!-- OCR -->
	<div class="card bg-base-200 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Texterkennung (OCR)</h2>
			<p class="text-sm opacity-70">
				Wenn aktiviert, werden Texte aus eingebetteten Bildern automatisch extrahiert.
			</p>
			<label class="label mt-2 cursor-pointer" for="ocr">
				<span class="label-text">Texte aus Bildern extrahieren</span>
				<input
					id="ocr"
					type="checkbox"
					class="toggle toggle-primary"
					aria-label="Enable OCR"
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
				Number of files to process simultaneously. Higher values may improve performance but
				increase CPU and RAM usage.
			</p>
			<p>Parallele Jobs: {localSettings.parallelJobs}</p>
			<input
				id="parallelJobs"
				name="parallelJobs"
				type="range"
				min="1"
				max="8"
				bind:value={localSettings.parallelJobs}
				class="range"
				aria-label="Set number of parallel jobs"
			/>
		</div>
	</div>

	<!-- Language -->
	<div class="card bg-base-200 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Language</h2>
			<select
				id="locale"
				name="locale"
				class="select-bordered select w-full max-w-xs"
				bind:value={localSettings.locale}
			>
				<option value="en">English</option>
				<option value="de">Deutsch</option>
				<option value="fr">Français</option>
			</select>
		</div>
	</div>

	<!-- Encoding -->
	<div class="card bg-base-200 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Text Encoding</h2>
			<select
				id="encoding"
				name="encoding"
				class="select-bordered select w-full max-w-xs"
				bind:value={localSettings.textEncoding}
			>
				{#each availableEncodings as encoding}
					<option value={encoding}>{encoding.toUpperCase()}</option>
				{/each}
			</select>
		</div>
	</div>

	<!-- Extraction Options -->
	<div class="card bg-base-200 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Textextraktion</h2>

			<label class="label cursor-pointer">
				<span class="label-text">Whitespace normalisieren</span>
				<input
					id="normalizeWhitespace"
					type="checkbox"
					class="toggle toggle-primary"
					bind:checked={localSettings.normalizeWhitespace}
					aria-label="Whitespace normalisieren"
				/>
			</label>

			<label class="label cursor-pointer">
				<span class="label-text">Kopf- und Fußzeilen extrahieren</span>
				<input
					id="includeHeadersFooters"
					type="checkbox"
					class="toggle toggle-primary"
					bind:checked={localSettings.includeHeadersFooters}
					aria-label="Kopf- und Fußzeilen extrahieren"
				/>
			</label>

			<label class="label cursor-pointer">
				<span class="label-text">Kommentare extrahieren</span>
				<input
					id="includeComments"
					type="checkbox"
					class="toggle toggle-primary"
					bind:checked={localSettings.includeComments}
					aria-label="Kommentare extrahieren"
				/>
			</label>

			<label class="label cursor-pointer">
				<span class="label-text">Texte aus eingebetteten Bildern (ODF)</span>
				<input
					id="includeImageText"
					type="checkbox"
					class="toggle toggle-primary"
					bind:checked={localSettings.includeImageText}
					aria-label="Texte aus eingebetteten Bildern (ODF)"
				/>
			</label>
		</div>
	</div>

	<!-- Sentry -->
	<div class="card bg-base-200 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Sentry</h2>
			<label class="label cursor-pointer" for="sentryLogs">
				<span class="label-text">Fehler-Logs senden</span>
				<input
					id="sentryLogs"
					type="checkbox"
					class="toggle toggle-primary"
					aria-label="Enable error log sending"
					bind:checked={localSettings.sentryEnableLogs}
				/>
			</label>

			<label class="label cursor-pointer" for="sentryReplay">
				<span class="label-text">Session Replay aktivieren</span>
				<input
					id="sentryReplay"
					type="checkbox"
					class="toggle toggle-primary"
					aria-label="Enable session replay"
					bind:checked={localSettings.sentryEnableSessionReplay}
				/>
			</label>
		</div>
	</div>

	<!-- Cleanup -->
	<div class="card bg-base-200 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Datenbank-Bereinigung</h2>
			<p>Entfernt Einträge, deren Dateien nicht mehr vorhanden sind.</p>
			<button class="btn btn-error" onclick={cleanupMissingFiles}>
				<Recycle></Recycle> Fehlende Dateien bereinigen
			</button>
		</div>
	</div>

	{#await app.getVersion() then version}
		<footer class="footer-center footer bg-base-300 p-4 text-base-content sm:footer-horizontal">
			<aside>
				<p>
					<a
						class="link link-primary"
						href="https://github.com/BlackTiger007/DataSearch-Pro"
						target="_blank"
					>
						GitHub
					</a>
				</p>
				<p>Version {version}</p>
			</aside>
		</footer>
	{/await}
</div>
