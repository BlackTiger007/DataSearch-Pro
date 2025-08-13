import { db } from '$lib/db';
import { settings } from '$lib/db/schema/settings';
import { settingsSchema, type SettingsType } from '$lib/validation/settingsSchema';
import { settings as settingsStore } from '$lib/stores/settings.svelte';

export async function getAllSettings(): Promise<SettingsType> {
	const rows = await db.select().from(settings);
	const obj = Object.fromEntries(rows.map((s) => [s.key, JSON.parse(s.value)]));
	return settingsSchema.parse(obj); // Type-sicher zurückgeben
}

export async function saveSettings(newSettings: Partial<SettingsType>) {
	if (Object.keys(newSettings).length === 0) return;

	try {
		for (const [key, value] of Object.entries(newSettings) as [
			keyof SettingsType,
			SettingsType[keyof SettingsType]
		][]) {
			await db
				.insert(settings)
				.values({
					key,
					value: JSON.stringify(value)
				})
				.onConflictDoUpdate({
					target: settings.key,
					set: { value: JSON.stringify(value) }
				});
		}
	} catch (error) {
		console.error('Fehler beim Speichern der Settings:', error);
	}

	Object.assign(settingsStore, newSettings); // Eigenschaften von settingsTemp in settings kopieren
}
