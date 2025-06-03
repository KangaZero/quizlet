<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { theme, userName, fontStyle, language } from '$lib/stores';
	import { initSampleQuestions } from '$lib/sampleData';
	import Toaster from '$lib/components/ui/toast/toaster.svelte';
	import { getUserSettings, getQuestions } from '$lib/localStorage';
	import { locale, _ } from '$lib/i18n';
	import Header from '$lib/components/Header.svelte';
	
	let { children } = $props();
	const existingQuestions = getQuestions();

	// Initialize theme from localStorage
	onMount(() => {
		const {
			theme: savedTheme,
			userName: savedName,
			fontStyle: savedFont,
			language: savedLanguage
		} = getUserSettings();
		theme.set(savedTheme);
		userName.set(savedName);
		fontStyle.set(savedFont);
		language.set(savedLanguage);
		if (!savedFont) {
			// Set default font style if not set
			fontStyle.set('normal');
		}
		if (!savedName) {
			// Set default username if not set
			userName.set('Guest');
		}
		if (!savedLanguage) {
			// Set default language if not set
			language.set('en');
		}
		// Update locale when language changes
		language.subscribe((value) => {
			if (browser) {
				locale.set(value);
			}
		});
		// Apply theme to document
		document.documentElement.classList.toggle('dark', savedTheme === 'dark');
		document.body.classList.toggle('comic-font', savedFont === 'comic');

		// Initialize sample questions if none exist
		initSampleQuestions();
	});

	// Header component handles quiz click events now
	// Update theme when it changes
	$effect(() => {
		if (typeof document !== 'undefined') {
			document.documentElement.classList.toggle('dark', $theme === 'dark');
			document.body.classList.toggle('dark', $theme === 'dark');
			localStorage.setItem('quizTheme', $theme);
		}
	});
</script>

<div
	class="bg-white text-black transition-colors dark:bg-slate-700 dark:text-slate-300"
	data-theme={$theme}
>
	<header class="border-border border-b">
		{#if browser && locale}
		<Header {existingQuestions} />
		{/if}
	</header>

	<main class="container mx-auto flex-grow p-4">
		{@render children()}
	</main>

	<footer class="mt-auto border-t py-6 md:mt-8">
		<div class="text-muted-foreground container mx-auto px-4 text-center text-sm">
			<p>Quizlet by KangaZero &copy; {new Date().getFullYear()}</p>
			<!-- <div class="flex justify-center mt-3">
				<GitHubIcon repo="KangaZero/quizlet.io" stars={11} />
			</div> -->
		</div>
	</footer>
	<Toaster />
</div>
