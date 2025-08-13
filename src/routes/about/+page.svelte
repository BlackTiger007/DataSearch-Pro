<script lang="ts">
	import { onMount } from 'svelte';
	import { app } from '@tauri-apps/api';

	const appName = 'DataSearch-Pro';
	let version = '0.0.0';
	const author = 'BlackTiger007';
	const license = 'MIT';
	const contactEmail = 'info@webretter.com';
	const website = 'https://github.com/BlackTiger007/DataSearch-Pro';
	const releaseDate = '2025-08-13';

	onMount(async () => {
		version = await app.getVersion();
	});
</script>

<div class="container mx-auto p-6">
	<div class="card space-y-6 rounded-lg bg-base-200 p-6 shadow-lg">
		<h1 class="text-center text-3xl font-bold">{appName}</h1>
		<p class="text-center text-sm text-gray-500">Version {version} • Released on {releaseDate}</p>

		<section class="space-y-2">
			<h2 class="text-xl font-semibold">Über die App</h2>
			<p>
				{appName} ist eine leistungsstarke Desktop-Anwendung, die das schnelle Durchsuchen, Indexieren
				und Verwalten von Dateien ermöglicht. Sie bietet eine intuitive Benutzeroberfläche, eine flexible
				Indexierungslogik und eine übersichtliche Warteschlange zur Priorisierung von Aufgaben.
			</p>
		</section>

		<section class="space-y-2">
			<h2 class="text-xl font-semibold">Funktionen</h2>
			<ul class="list-inside list-disc space-y-1">
				<li>Schnelle Volltextsuche in großen Datenmengen</li>
				<li>Warteschlange für Indexierungsaufgaben mit Priorisierung</li>
				<li>Individuelle Dateiansicht mit passenden Icons</li>
				<li>Benutzerfreundliche Navigation zwischen Home, Dashboard und Einstellungen</li>
				<li>Erweiterbare Konfiguration und Settings</li>
			</ul>
		</section>

		<section class="space-y-2">
			<h2 class="text-xl font-semibold">Entwickler & Kontakt</h2>
			<p>Autor: {author}</p>
			<p>Lizenz: {license}</p>
			<p>E-Mail: <a class="link link-primary" href="mailto:{contactEmail}">{contactEmail}</a></p>
			<p>Webseite: <a class="link link-primary" href={website} target="_blank">{website}</a></p>
		</section>

		<section class="pt-4 text-center">
			<p class="text-sm text-gray-400">
				© {new Date().getFullYear()}
				{author}. Alle Rechte vorbehalten.
			</p>
		</section>
	</div>
</div>
