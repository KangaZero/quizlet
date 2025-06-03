<script lang="ts">
	import I18nExamples from '$lib/components/i18n-examples.svelte';
	import { _ } from '$lib/i18n';
	import { locale } from 'svelte-i18n';

	let currentLocale = $locale;

	function toggleLocale() {
		locale.set(currentLocale === 'en' ? 'ja' : 'en');
	}
</script>

<div class="container mx-auto py-8">
	<h1 class="mb-6 text-2xl font-bold">I18n Pluralization Test Page</h1>

	<div class="mb-4">
		<p>Current language: <strong>{currentLocale}</strong></p>
		<button
			class="bg-primary text-primary-foreground hover:bg-primary/90 mt-2 rounded-md px-4 py-2"
			on:click={toggleLocale}
		>
			Switch to {currentLocale === 'en' ? 'Japanese' : 'English'}
		</button>
	</div>

	<I18nExamples />
</div>
