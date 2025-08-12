import { z } from 'zod';

// Beispiel: Du kannst pro Setting eigene Validierung definieren
export const settingsSchema = z.object({
	theme: z.enum(['light', 'dark']).default('light'),
	watchFolders: z.array(z.string()).default([]), // Liste von Pfaden
	allowedFileTypes: z.array(z.string()).default(['pdf', 'doc', 'docx']), // Liste von Erlaubten Datie endungen
	indexFolders: z.array(z.string()).default([]),
	autoScan: z.boolean().default(true),
	locale: z.string().default('en')
});

export type SettingsType = z.infer<typeof settingsSchema>;
