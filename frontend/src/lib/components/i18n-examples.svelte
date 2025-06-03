<script lang="ts">
	import { _ } from '$lib/i18n';

	// Examples of count values
	let counts = [0, 1, 2, 5, 10];
</script>

<div class="border-border bg-card rounded-lg border p-6 shadow-sm">
	<h2 class="mb-4 text-xl font-bold">I18n Pluralization Examples</h2>

	<div class="mb-4">
		<h3 class="mb-2 font-medium">Common count pluralization</h3>
		<ul class="list-disc pl-5">
			{#each counts as count}
				<li>{$_('common.count', { values: { count } })}</li>
			{/each}
		</ul>
	</div>

	<div class="mb-4">
		<h3 class="mb-2 font-medium">Question pluralization</h3>
		<ul class="list-disc pl-5">
			{#each counts as count}
				<li>{$_('common.question', { values: { count } })}</li>
			{/each}
		</ul>
	</div>

	<div class="mb-4">
		<h3 class="mb-2 font-medium">Option pluralization</h3>
		<ul class="list-disc pl-5">
			{#each counts as count}
				<li>{$_('common.option', { values: { count } })}</li>
			{/each}
		</ul>
	</div>

	<div>
		<h3 class="mb-2 font-medium">Score examples</h3>
		<ul class="list-disc pl-5">
			<li>{$_('quiz.score', { values: { score: 3, total: 5 } })}</li>
			<li>{$_('quiz.score', { values: { score: 0, total: 10 } })}</li>
			<li>{$_('quiz.score', { values: { score: 10, total: 10 } })}</li>
		</ul>
	</div>
</div>
