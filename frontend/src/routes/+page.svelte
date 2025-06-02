<script lang="ts">
	import { userName } from '$lib/stores';
	import { getQuestions } from '$lib/localStorage';
	import { base } from '$app/paths';
</script>

<div class="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center text-center">
	<h1 class="mb-4 text-4xl font-bold">Welcome to Quizlet</h1>

	{#if $userName}
		<p class="mb-8 text-xl">Hello, {$userName}! Ready for a quiz challenge?</p>
	{:else}
		<p class="mb-8 text-xl">Go to settings to add your name, or edit to add questions</p>
	{/if}

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
		<div class="border-border bg-card flex flex-col items-center rounded-lg border p-6 shadow-sm">
			<h2 class="mb-2 text-xl font-bold">Regular Mode</h2>
			{#if getQuestions().length <= 10}
				<p class="text-muted-foreground mb-4 text-sm">
					{getQuestions().length} unique questions with a 5-minute time limit
				</p>
			{:else}
				<p class="text-muted-foreground mb-4 text-sm">
					10 unique questions with a 5-minute time limit
				</p>
			{/if}
			<a
				href="{base}/quiz?mode=regular"
				class="bg-primary text-primary-foreground hover:bg-primary/90 mt-auto rounded-md border px-4 py-2 transition-colors hover:scale-105 active:scale-95"
				>Start Quiz</a
			>
		</div>

		<div class="border-border bg-card flex flex-col items-center rounded-lg border p-6 shadow-sm">
			<h2 class="mb-2 text-xl font-bold">Endless Mode</h2>
			<p class="text-muted-foreground mb-2 text-sm">
				Start with 3 lives and answer as many questions as you can
			</p>
			<p class="mb-2 text-xs">* Actually 999 questions, but who’s counting?</p>
			<a
				href="{base}/quiz?mode=endless"
				class="bg-primary text-primary-foreground hover:bg-primary/90 mt-auto rounded-md border px-4 py-2 transition-colors hover:scale-105 active:scale-95"
				>Start Quiz</a
			>
		</div>

		<div class="border-border bg-card flex flex-col items-center rounded-lg border p-6 shadow-sm">
			<h2 class="mb-2 text-xl font-bold">Custom Mode</h2>
			<p class="text-muted-foreground mb-4 text-sm">
				Set your own number of questions and other options
			</p>
			<a
				href="{base}/quiz?mode=custom"
				class="bg-primary text-primary-foreground hover:bg-primary/90 mt-auto rounded-md border px-4 py-2 transition-colors hover:scale-105 active:scale-95"
				>Start Quiz</a
			>
		</div>

		<div class="border-border bg-card flex flex-col items-center rounded-lg border p-6 shadow-sm">
			<h2 class="mb-2 text-xl font-bold">Speedrun Mode</h2>
			<p class="text-muted-foreground mb-4 text-sm">50 unique questions, race against the clock!</p>
			<a
				href="{base}/quiz?mode=speedrun"
				class="bg-primary text-primary-foreground hover:bg-primary/90 mt-auto rounded-md border px-4 py-2 transition-colors hover:scale-105 active:scale-95"
				>Start Quiz</a
			>
		</div>
	</div>
</div>
