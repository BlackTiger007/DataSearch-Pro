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
	import { m } from '$lib/paraglide/messages';
	import { locales, setLocale } from '$lib/paraglide/runtime';

	let localSettings: SettingsType = $state({ ...settings });
	let showSnackbar = $state(false);

	async function save() {
		await saveSettings($state.snapshot(localSettings));
		setLocale(localSettings.locale);
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
		<h1 class="text-3xl font-bold">{m.settings_title()}</h1>
		<div class="flex gap-2">
			<button class="btn" onclick={() => goto('/')}>{m.settings_cancel()}</button>
			<button class="btn btn-success" onclick={save}>{m.settings_save()}</button>
		</div>
	</div>

	<!-- Snackbar -->
	{#if showSnackbar}
		<div class="toast z-10">
			<div class="alert alert-success">{m.settings_saved_success()}</div>
		</div>
	{/if}

	<!-- Theme -->
	<div class="card bg-base-200 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">{m.settings_theme()}</h2>
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
			<h2 class="card-title">{m.settings_folders()}</h2>
			<div class="space-y-2">
				{#each localSettings.folders, i}
					<div class="flex items-center gap-2">
						<input
							id={`folder-${i}`}
							name={`folder-${i}`}
							type="text"
							class="input-bordered input w-full"
							placeholder={m.settings_folder_placeholder()}
							bind:value={localSettings.folders[i]}
						/>
						<button
							class="btn btn-outline"
							onclick={() => pickFolder(i)}
							title={m.settings_folders()}
						>
							<Folder></Folder>
						</button>
						<button
							class="btn btn-error"
							onclick={() => localSettings.folders.splice(i, 1)}
							title={m.settings_cancel()}
						>
							<FolderRemove></FolderRemove>
						</button>
					</div>
				{/each}
				<button class="btn btn-primary" onclick={() => localSettings.folders.push('')}>
					<FolderAdd></FolderAdd>
					{m.settings_folder_add()}
				</button>
			</div>
		</div>
	</div>

	<!-- Allowed File Types -->
	<div class="card bg-base-200 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">{m.settings_filetypes()}</h2>
			<div class="space-y-2">
				{#each localSettings.allowedFileTypes as type, i}
					<div class="flex items-center gap-2">
						<input
							id={`filetype-${i}`}
							name={`filetype-${i}`}
							type="text"
							class="input-bordered input w-full"
							placeholder={m.settings_filetypes_placeholder()}
							bind:value={localSettings.allowedFileTypes[i]}
						/>
						<button
							class="btn btn-error"
							onclick={() => localSettings.allowedFileTypes.splice(i, 1)}
							title={m.settings_cancel()}
						>
							<FolderRemove></FolderRemove>
						</button>
					</div>
				{/each}
				<button class="btn btn-primary" onclick={() => localSettings.allowedFileTypes.push('')}>
					<FolderAdd></FolderAdd>
					{m.settings_filetypes_add()}
				</button>
			</div>
		</div>
	</div>

	<!-- Automation -->
	<div class="card bg-base-200 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">{m.settings_automation()}</h2>
			<label class="label cursor-pointer" for="autoWatch">
				<span class="label-text">{m.settings_auto_watch()}</span>
				<input
					id="autoWatch"
					type="checkbox"
					class="toggle toggle-primary"
					aria-label={m.settings_auto_watch()}
					bind:checked={localSettings.autoWatch}
				/>
			</label>

			<label class="label cursor-pointer" for="autoStart">
				<span class="label-text">{m.settings_auto_start()}</span>
				<input
					id="autoStart"
					type="checkbox"
					class="toggle toggle-primary"
					aria-label={m.settings_auto_start()}
					bind:checked={localSettings.autoStart}
				/>
			</label>
		</div>
	</div>

	<!-- OCR -->
	<div class="card bg-base-200 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">{m.settings_ocr_title()}</h2>
			<p class="text-sm opacity-70">{m.settings_ocr_description()}</p>
			<label class="label mt-2 cursor-pointer" for="ocr">
				<span class="label-text">{m.settings_ocr_label()}</span>
				<input
					id="ocr"
					type="checkbox"
					class="toggle toggle-primary"
					aria-label={m.settings_ocr_label()}
					bind:checked={localSettings.enableImageTextExtraction}
				/>
			</label>
		</div>
	</div>

	<!-- Parallel Jobs -->
	<div class="card bg-base-200 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">{m.settings_parallel_jobs()}</h2>
			<p class="text-sm opacity-70">{m.settings_parallel_jobs_description()}</p>
			<p>{m.settings_parallel_jobs_label({ count: localSettings.parallelJobs })}</p>
			<input
				id="parallelJobs"
				name="parallelJobs"
				type="range"
				min="1"
				max="8"
				bind:value={localSettings.parallelJobs}
				class="range"
				aria-label={m.settings_parallel_jobs()}
			/>
		</div>
	</div>

	<!-- Language -->
	<div class="card bg-base-200 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">{m.settings_language()}</h2>
			<select
				id="locale"
				name="locale"
				class="select-bordered select w-full max-w-xs"
				bind:value={localSettings.locale}
			>
				{#each locales as locale}
					<option value={locale}>{locale}</option>
				{/each}
			</select>
		</div>
	</div>

	<!-- Encoding -->
	<div class="card bg-base-200 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">{m.settings_encoding()}</h2>
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
			<h2 class="card-title">{m.settings_extraction()}</h2>

			<label class="label cursor-pointer">
				<span class="label-text">{m.settings_extraction_whitespace()}</span>
				<input
					id="normalizeWhitespace"
					type="checkbox"
					class="toggle toggle-primary"
					bind:checked={localSettings.normalizeWhitespace}
					aria-label={m.settings_extraction_whitespace()}
				/>
			</label>

			<label class="label cursor-pointer">
				<span class="label-text">{m.settings_extraction_headers()}</span>
				<input
					id="includeHeadersFooters"
					type="checkbox"
					class="toggle toggle-primary"
					bind:checked={localSettings.includeHeadersFooters}
					aria-label={m.settings_extraction_headers()}
				/>
			</label>

			<label class="label cursor-pointer">
				<span class="label-text">{m.settings_extraction_comments()}</span>
				<input
					id="includeComments"
					type="checkbox"
					class="toggle toggle-primary"
					bind:checked={localSettings.includeComments}
					aria-label={m.settings_extraction_comments()}
				/>
			</label>

			<label class="label cursor-pointer">
				<span class="label-text">{m.settings_extraction_images()}</span>
				<input
					id="includeImageText"
					type="checkbox"
					class="toggle toggle-primary"
					bind:checked={localSettings.includeImageText}
					aria-label={m.settings_extraction_images()}
				/>
			</label>
		</div>
	</div>

	<!-- Sentry -->
	<div class="card bg-base-200 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">{m.settings_sentry()}</h2>
			<label class="label cursor-pointer" for="sentryLogs">
				<span class="label-text">{m.settings_sentry_logs()}</span>
				<input
					id="sentryLogs"
					type="checkbox"
					class="toggle toggle-primary"
					aria-label={m.settings_sentry_logs()}
					bind:checked={localSettings.sentryEnableLogs}
				/>
			</label>

			<label class="label cursor-pointer" for="sentryReplay">
				<span class="label-text">{m.settings_sentry_replay()}</span>
				<input
					id="sentryReplay"
					type="checkbox"
					class="toggle toggle-primary"
					aria-label={m.settings_sentry_replay()}
					bind:checked={localSettings.sentryEnableSessionReplay}
				/>
			</label>
		</div>
	</div>

	<!-- Cleanup -->
	<div class="card bg-base-200 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">{m.settings_cleanup()}</h2>
			<p>{m.settings_cleanup_description()}</p>
			<button class="btn btn-error" onclick={cleanupMissingFiles}>
				<Recycle></Recycle>
				{m.settings_cleanup_button()}
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
						{m.settings_footer_github()}
					</a>
				</p>
				<p>{m.settings_footer_version({ version })}</p>
			</aside>
		</footer>
	{/await}
</div>
