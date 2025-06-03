<script lang="ts">
	import { userName } from '$lib/stores';
	import { getQuestions } from '$lib/localStorage';
	import { base } from '$app/paths';
	import { _ } from '$lib/i18n';
</script>

<div class="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center text-center">
	<h1 class="mb-4 text-4xl font-bold">{$_('home.title')}</h1>

	{#if $userName}
		<p class="mb-8 text-xl">{$_('home.description1', {values: { username: $userName }})}</p>
	{:else}
		<p class="mb-8 text-xl">{$_('home.description2')}</p>
	{/if}

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
		<div class="border-border bg-card flex flex-col items-center rounded-lg border p-6 shadow-sm">
			<h2 class="mb-2 text-xl font-bold">{$_('quiz.mode.regular')}</h2>
			{#if getQuestions().length <= 10}
				<p class="text-muted-foreground mb-4 text-sm">
					{$_('quiz.mode.regularDescription1', {values: { questionsLength: getQuestions().length }})}
				</p>
			{:else}
				<p class="text-muted-foreground mb-4 text-sm">
					{$_('quiz.mode.regularDescription2')}
				</p>
			{/if}
			<a
				href="{base}/quiz?mode=regular"
				class="bg-primary text-primary-foreground hover:bg-primary/90 mt-auto rounded-md border px-4 py-2 transition-colors hover:scale-105 active:scale-95"
				>{$_('quiz.start')}</a
			>
		</div>

		<div class="border-border bg-card flex flex-col items-center rounded-lg border p-6 shadow-sm">
			<h2 class="mb-2 text-xl font-bold">{$_('quiz.mode.endless')}</h2>
			<p class="text-muted-foreground mb-2 text-sm">
				{$_('quiz.mode.endlessDescription1')}
			</p>
			<p class="mb-2 text-xs">{$_('quiz.mode.endlessDescription2')}</p>
			<a
				href="{base}/quiz?mode=endless"
				class="bg-primary text-primary-foreground hover:bg-primary/90 mt-auto rounded-md border px-4 py-2 transition-colors hover:scale-105 active:scale-95"
				>{$_('quiz.start')}</a
			>
		</div>

		<div class="border-border bg-card flex flex-col items-center rounded-lg border p-6 shadow-sm">
			<h2 class="mb-2 text-xl font-bold">{$_('quiz.mode.custom')}</h2>
			<p class="text-muted-foreground mb-4 text-sm">
				{$_('quiz.mode.customDescription1')}
			</p>
			<a
				href="{base}/quiz?mode=custom"
				class="bg-primary text-primary-foreground hover:bg-primary/90 mt-auto rounded-md border px-4 py-2 transition-colors hover:scale-105 active:scale-95"
				>{$_('quiz.start')}</a
			>
		</div>

		<div class="border-border bg-card flex flex-col items-center rounded-lg border p-6 shadow-sm">
			<h2 class="mb-2 text-xl font-bold">{$_('quiz.mode.speedrun')}</h2>
			<p class="text-muted-foreground mb-4 text-sm">{$_('quiz.mode.speedrunDescription1')}</p>
			<a
				href="{base}/quiz?mode=speedrun"
				class="bg-primary text-primary-foreground hover:bg-primary/90 mt-auto rounded-md border px-4 py-2 transition-colors hover:scale-105 active:scale-95"
				>{$_('quiz.start')}</a
			>
		</div>
	</div>
</div>
