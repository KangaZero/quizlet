<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { theme, userName, fontStyle, language } from '$lib/stores';
	import { initSampleQuestions } from '$lib/sampleData';
	import Toaster from '$lib/components/ui/toast/toaster.svelte';
	import { toast } from '$lib/components/ui/toast';
	import { getUserSettings, getQuestions } from '$lib/localStorage';
	import { initI18n, locale, _ } from '$lib/i18n';
	let { children } = $props();
	const existingQuestions = getQuestions();

	// Initialize theme from localStorage
	onMount(() => {
		// Initialize i18n
		initI18n();

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

	function handleQuizClick(e: MouseEvent) {
		if (!$userName || existingQuestions.length === 0) {
			e.preventDefault();
			// Optionally show a toast message explaining why it's disabled
			toast.error('Please set your username in Settings and/or add questions in Edit');
		}
	}
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
		<div class="container mx-auto flex h-16 flex-col items-center px-4 md:flex-row">
			<a href="/" class="text-lg font-bold">Quizlet</a>
			<nav class="mx-auto flex gap-6 md:mx-0 md:ml-auto">
				<a
					href="/"
					class="hover:text-primary transition-colors {$page.url.pathname === '/'
						? 'border-primary dark:border-primary-foreground border-b-2 font-bold'
						: ''}"
				>
					Home
				</a>

				{#if $userName && existingQuestions.length > 0}
					<a
						href="/quiz"
						class="hover:text-primary transition-colors {$page.url.pathname === '/quiz'
							? 'border-primary dark:border-primary-foreground border-b-2 font-bold'
							: ''}"
					>
						Quiz
					</a>
				{:else}
					<a
						href="/quiz"
						class="text-muted-foreground pointer-events-none cursor-not-allowed opacity-50"
						aria-disabled="true"
						on:click={handleQuizClick}
						title="Please set your username in Settings first"
					>
						Quiz
					</a>
				{/if}

				<a
					href="/edit"
					class="hover:text-primary transition-colors {$page.url.pathname === '/edit'
						? 'border-primary dark:border-primary-foreground border-b-2 font-bold'
						: ''}"
				>
					Edit
				</a>

				<a
					href="/scores"
					class="hover:text-primary transition-colors {$page.url.pathname === '/scores'
						? 'border-primary dark:border-primary-foreground border-b-2 font-bold'
						: ''}"
				>
					Scores
				</a>

				<a
					href="/settings"
					class="hover:text-primary transition-colors {$page.url.pathname === '/settings'
						? 'border-primary dark:border-primary-foreground border-b-2 font-bold'
						: ''}"
				>
					Settings
				</a>
			</nav>
		</div>
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
