import { handleErrorWithSentry } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';

Sentry.init({
	dsn: 'https://4e23fc19f0b340f5bd761a87eb9892f1@glitchtip.webretter.com/2',

	environment: import.meta.env.MODE,

	tracesSampleRate: 1.0,

	// Enable logs to be sent to Sentry
	enableLogs: !import.meta.env.DEV
});

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();
