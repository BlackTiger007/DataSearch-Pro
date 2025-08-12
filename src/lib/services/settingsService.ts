import { db } from '$lib/db';
import { settings } from '$lib/db/schema/settings';
import { settingsSchema, type SettingsType } from '$lib/validation/settingsSchema';

export async function getAllSettings(): Promise<SettingsType> {
	const rows = await db.select().from(settings);
	const obj = Object.fromEntries(rows.map((s) => [s.key, JSON.parse(s.value)]));
	return settingsSchema.parse(obj); // Type-sicher zurückgeben
}

export async function setSetting<K extends keyof SettingsType>(key: K, value: SettingsType[K]) {
	// Validierung einzelner Werte
	settingsSchema.pick({ [key]: true }).parse({ [key]: value });
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
