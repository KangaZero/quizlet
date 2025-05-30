<script lang="ts">
  import { userName } from '$lib/stores';
</script>

<div class="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center text-center">
  <h1 class="mb-4 text-4xl font-bold">Welcome to QuizMaster</h1>
  
  {#if $userName}
    <p class="mb-8 text-xl">Hello, {$userName}! Ready for a quiz challenge?</p>
  {:else}
    <p class="mb-8 text-xl">Test your knowledge with our quiz challenges!</p>
  {/if}
  
  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
    <div class="flex flex-col items-center rounded-lg border border-border bg-card p-6 shadow-sm">
      <h2 class="mb-2 text-xl font-bold">Regular Mode</h2>
      <p class="mb-4 text-sm text-muted-foreground">10 unique questions with a 5-minute time limit</p>
      <a href="/quiz?mode=regular" class="mt-auto rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90 hover:scale-105 active:scale-95 border">Start Quiz</a>
    </div>
    
    <div class="flex flex-col items-center rounded-lg border border-border bg-card p-6 shadow-sm">
      <h2 class="mb-2 text-xl font-bold">Endless Mode</h2>
      <p class="mb-4 text-sm text-muted-foreground">Start with 3 lives and answer as many questions as you can</p>
      <a href="/quiz?mode=endless" class="mt-auto rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90 hover:scale-105 active:scale-95 border">Start Quiz</a>
    </div>
    
    <div class="flex flex-col items-center rounded-lg border border-border bg-card p-6 shadow-sm">
      <h2 class="mb-2 text-xl font-bold">Custom Mode</h2>
      <p class="mb-4 text-sm text-muted-foreground">Set your own number of questions and other options</p>
      <a href="/quiz?mode=custom" class="mt-auto rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90 hover:scale-105 active:scale-95 border">Start Quiz</a>
    </div>
    
    <div class="flex flex-col items-center rounded-lg border border-border bg-card p-6 shadow-sm">
      <h2 class="mb-2 text-xl font-bold">Speedrun Mode</h2>
      <p class="mb-4 text-sm text-muted-foreground">50 unique questions, race against the clock!</p>
      <a href="/quiz?mode=speedrun" class="mt-auto rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90 hover:scale-105 active:scale-95 border">Start Quiz</a>
    </div>
  </div>
</div>
