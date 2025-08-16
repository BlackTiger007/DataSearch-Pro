<script lang="ts">
	import { goto } from '$app/navigation';
	import { saveSettings } from '$lib/services/settingsService';
	import { settings } from '$lib/stores/settings.svelte';
	import type { SettingsType } from '$lib/validation/settingsSchema';

	let localSettings: SettingsType = $state({ ...settings });

	async function save() {
		await saveSettings($state.snapshot(localSettings));
		goto('/');
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
				<span class="label-text">Enable Watching Folders</span>
				<input
					type="checkbox"
					class="toggle toggle-primary"
					bind:checked={localSettings.autoWatch}
				/>
			</label>

			<label class="label cursor-pointer">
				<span class="label-text">Enable Auto Start</span>
				<input
					type="checkbox"
					class="toggle toggle-primary"
					bind:checked={localSettings.autoStart}
				/>
			</label>
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

	<!-- Save Button -->
	<div class="flex justify-end">
		<button class="btn btn-success" onclick={save}>Save Settings</button>
	</div>
</div>
