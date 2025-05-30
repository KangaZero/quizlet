<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { theme, userName } from '$lib/stores.js';
	import { initSampleQuestions} from '$lib/sampleData';

	let { children } = $props();
	
	// Initialize theme from localStorage
	onMount(() => {
		const savedTheme = localStorage.getItem('quizTheme') || 'light';
		const savedName = localStorage.getItem('userName') || '';
		theme.set(savedTheme);
		userName.set(savedName);
		
		// Apply theme to document
		document.documentElement.classList.toggle('dark', savedTheme === 'dark');
		
		// Initialize sample questions if none exist
		initSampleQuestions();
	});

	// Update theme when it changes
	$effect(() => {
		if (typeof document !== 'undefined') {
			document.documentElement.classList.toggle('dark', $theme === 'dark');
			localStorage.setItem('quizTheme', $theme);
		}
	});
</script>

<div class="min-h-screen bg-white dark:bg-slate-700 text-black dark:text-slate-300 transition-colors" data-theme={$theme}>
	<header class="border-b border-border">
		<div class="container mx-auto flex h-16 items-center px-4">
			<a href="/" class="text-lg font-bold">QuizMaster</a>
			<nav class="ml-auto flex gap-6">
				<a href="/" class="hover:text-primary">Home</a>
				<a href="/quiz" class="hover:text-primary">Quiz</a>
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
</div>
