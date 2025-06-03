<script lang="ts">
    import { page } from '$app/stores';
    import { userName } from '$lib/stores';
    import { _ } from '$lib/i18n';
    import { toast } from '$lib/components/ui/toast';

    // Props
    export let existingQuestions: any[] = [];

    function handleQuizClick(e: MouseEvent) {
        if (!$userName || existingQuestions.length === 0) {
            e.preventDefault();
            // Show a toast message explaining why it's disabled
            toast.error($_('app.nav.quizDisabledMessage'));
        }
    }
</script>

<div class="container mx-auto flex h-16 flex-col items-center px-4 md:flex-row">
    <a href="/" class="text-lg font-bold">{$_('title')}</a>
    <nav class="mx-auto flex gap-6 md:mx-0 md:ml-auto">
        <a
            href="/"
            class="hover:text-primary transition-colors {$page.url.pathname === '/'
                ? 'border-primary dark:border-primary-foreground border-b-2 font-bold'
                : ''}"
        >
            {$_('app.nav.home')}
        </a>

        {#if $userName && existingQuestions.length > 0}
            <a
                href="/quiz"
                class="hover:text-primary transition-colors {$page.url.pathname === '/quiz'
                    ? 'border-primary dark:border-primary-foreground border-b-2 font-bold'
                    : ''}"
            >
                {$_('app.nav.quiz')}
            </a>
        {:else}
            <a
                href="/quiz"
                class="text-muted-foreground pointer-events-none cursor-not-allowed opacity-50"
                aria-disabled="true"
                on:click={handleQuizClick}
                title={$_('app.nav.quizDisabledTooltip')}
            >
                {$_('app.nav.quiz')}
            </a>
        {/if}

        <a
            href="/edit"
            class="hover:text-primary transition-colors {$page.url.pathname === '/edit'
                ? 'border-primary dark:border-primary-foreground border-b-2 font-bold'
                : ''}"
        >
            {$_('app.nav.edit')}
        </a>

        <a
            href="/scores"
            class="hover:text-primary transition-colors {$page.url.pathname === '/scores'
                ? 'border-primary dark:border-primary-foreground border-b-2 font-bold'
                : ''}"
        >
            {$_('app.nav.scores')}
        </a>

        <a
            href="/settings"
            class="hover:text-primary transition-colors {$page.url.pathname === '/settings'
                ? 'border-primary dark:border-primary-foreground border-b-2 font-bold'
                : ''}"
        >
            {$_('app.nav.settings')}
        </a>
    </nav>
</div>
