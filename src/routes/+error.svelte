<script lang="ts">
	import * as Sentry from '@sentry/sveltekit';
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages';

	function openFeedback() {
		Sentry.showReportDialog({
			eventId: Sentry.lastEventId()
		});
	}
</script>

<main class="flex grow content-center items-center p-4">
	<div class="mx-auto text-center">
		<h1 class="text-8xl font-extrabold text-error opacity-20 select-none lg:text-[10rem]">
			{m.error_title()}
		</h1>
		<h2 class="text-6xl font-bold text-error opacity-20 select-none lg:text-8xl">
			{m.error_status()}
			{page.status}
		</h2>
		<p class="mt-6 mb-8 text-lg text-base-content lg:text-xl">
			{page.error?.message ?? m.error_unexpected()}
		</p>

		<a href="/" class="btn btn-primary">{m.error_goHome()}</a>

		<div class="mt-8">
			<button onclick={openFeedback} class="btn btn-secondary">
				{m.error_sendFeedback()}
			</button>
		</div>
	</div>
</main>
