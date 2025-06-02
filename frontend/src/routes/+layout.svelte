<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { theme, userName } from '$lib/stores';
	import { initSampleQuestions} from '$lib/sampleData';
	import Toaster from '$lib/components/ui/toast/toaster.svelte';
	import { toast } from '$lib/components/ui/toast';
	import { getUserSettings, getQuestions } from '$lib/localStorage';
	export const prerender = true;
	let { children } = $props();
   const existingQuestions = getQuestions();
	
	// Initialize theme from localStorage
	onMount(() => {
		const { theme: savedTheme, userName: savedName } = getUserSettings();
		theme.set(savedTheme);
		userName.set(savedName);

		// Apply theme to document
		document.documentElement.classList.toggle('dark', savedTheme === 'dark');
		
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

<div class="min-h-screen bg-white dark:bg-slate-700 text-black dark:text-slate-300 transition-colors" data-theme={$theme}>
	<header class="border-b border-border">
		<div class="container mx-auto flex h-16 items-center px-4">
			<a href="/" class="text-lg font-bold">Quizlet</a>
			<nav class="ml-auto flex gap-6">
				<a href="/" class="hover:text-primary">Home</a>
				  {#if $userName && existingQuestions.length > 0}
    <a href="/quiz" class="hover:text-primary">Quiz</a>
  {:else}
    <a 
      href="/quiz" 
      class="opacity-50 pointer-events-none cursor-not-allowed text-muted-foreground" 
      aria-disabled="true"
      onclick={handleQuizClick}
      title="Please set your username in Settings first"
    >
      Quiz
    </a>
  {/if}
				<a href="/edit" class="hover:text-primary">Edit</a>
				<a href="/scores" class="hover:text-primary">Scores</a>
				<a href="/settings" class="hover:text-primary">Settings</a>
			</nav>
		</div>
	</header>
	
	<main class="container mx-auto p-4">
		{@render children()}
	</main>
	
	<footer class="border-t border-border mt-8 py-6">
		<div class="container mx-auto px-4 text-center text-sm text-muted-foreground">
			<p>Quiz Application &copy; {new Date().getFullYear()}</p>
		</div>
	</footer>
	<Toaster />
</div>
