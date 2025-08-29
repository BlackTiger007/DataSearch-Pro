import { availableEncodings } from '$lib/types/encodings';
import { z } from 'zod';

export const settingsSchema = z.object({
	theme: z.enum(['system', 'light', 'dark']).default('system'),
	folders: z.array(z.string()).default([]), // Liste von Pfaden
	allowedFileTypes: z.array(z.string()).default([]), // Liste von erlaubten Dateiendungen
	autoWatch: z.boolean().default(true), // Automatisches Beobachten von Ordnern
	autoStart: z.boolean().default(false), // Automatisches Starten des Indexers
	locale: z.string().default('en'),
	fileUsageCount: z.array(z.object({ extension: z.string(), count: z.number() })).default([]), // Liste von Dateitypen und deren Nutzung
	enableImageTextExtraction: z.boolean().default(true),
	parallelJobs: z.number().min(1).max(8).default(2),
	textEncoding: z.enum(availableEncodings as [string, ...string[]]).default('utf-8'),
	normalizeWhitespace: z.boolean().default(true), // Mehrfaches Whitespace normalisieren
	includeHeadersFooters: z.boolean().default(false), // Kopf- und Fußzeilen extrahieren
	includeComments: z.boolean().default(false), // Kommentare extrahieren
	includeImageText: z.boolean().default(false), // Texte aus eingebetteten Bildern in ODF-Formaten
	sentryEnableLogs: z.boolean().default(true), // Aktiviert das Senden von Logs an GlitchTip/Sentry
	sentryEnableSessionReplay: z.boolean().default(true) // Aktiviert Session Replay
});

export type SettingsType = z.infer<typeof settingsSchema>;
