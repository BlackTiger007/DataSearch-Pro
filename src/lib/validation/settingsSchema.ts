import { z } from 'zod';

// Beispiel: Du kannst pro Setting eigene Validierung definieren
export const settingsSchema = z.object({
	theme: z.enum(['light', 'dark']).default('light'),
	folders: z.array(z.string()).default([]), // Liste von Pfaden
	allowedFileTypes: z.array(z.string()).default(['pdf', 'doc', 'docx']), // Liste von Erlaubten Datie endungen
	autoWatch: z.boolean().default(true), // Automatisches Beobachten von Ordnern
	autoStart: z.boolean().default(false), // Automatisches Starten des Indexers
	locale: z.string().default('en'),
	fileUsageCount: z.array(z.object({ extension: z.string(), count: z.number() })).default([]) // Liste von Dateitypen und deren Nutzung
});

export type SettingsType = z.infer<typeof settingsSchema>;
