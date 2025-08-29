import { settings } from '$lib/stores/settings.svelte';
import { handleErrorWithSentry } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';

Sentry.init({
	dsn: 'https://4e23fc19f0b340f5bd761a87eb9892f1@glitchtip.webretter.com/2',
	environment: import.meta.env.MODE,
	tracesSampleRate: 1.0,

	enableLogs: import.meta.env.PROD && settings.sentryEnableLogs,

	replaysSessionSampleRate: import.meta.env.PROD && settings.sentryEnableSessionReplay ? 1.0 : 0.0,
	replaysOnErrorSampleRate: import.meta.env.PROD && settings.sentryEnableSessionReplay ? 1.0 : 0.0,

	integrations: [
		Sentry.replayIntegration({
			maskAllText: true,
			blockAllMedia: true
		})
	]
});

export const handleError = handleErrorWithSentry();
