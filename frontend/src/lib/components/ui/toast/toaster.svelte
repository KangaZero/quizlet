<script>
	import { Toaster } from 'svelte-sonner';
	import { browser } from '$app/environment';
	import { theme } from '$lib/stores';
</script>

{#if browser}
	<Toaster
		theme={$theme === 'dark' ? 'dark' : 'light'}
		richColors
		expand={true}
		closeButton={true}
		class="toaster"
		toastOptions={{
			classes: {
				toast:
					'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 shadow-lg',
				description: 'text-gray-500 dark:text-gray-400',
				actionButton: 'bg-primary text-primary-foreground',
				cancelButton: 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200'
			}
		}}
	/>
{/if}
