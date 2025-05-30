<script lang="ts">
  import { onMount } from 'svelte';
  import { getScores } from '$lib/localStorage';
  import type { QuizScore } from '$lib/types';
  
  let scores: QuizScore[] = [];
  let filterMode = 'all';
  let sortBy = 'date';
  let sortDirection: 'asc' | 'desc' = 'desc';
  let currentPage = 1;
  let itemsPerPage = 10;
  
  onMount(() => {
    loadScores();
  });
  
  function loadScores() {
    scores = getScores();
  }
  
  function formatDate(timestamp: number) {
    return new Date(timestamp).toLocaleString();
  }
  
  function formatTime(ms: number) {
    if (!ms) return 'N/A';
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }
  
  function changePage(page: number) {
    currentPage = page;
  }
  
  function handleSort(field: string) {
    if (sortBy === field) {
      // Toggle direction if clicking the same field
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy = field;
      // Default to descending for date, ascending for others
      sortDirection = field === 'date' ? 'desc' : 'asc';
    }
  }
  
  // Apply filters and sorting
  $: filteredScores = scores.filter(score => 
    filterMode === 'all' || score.mode === filterMode
  );
  
  $: sortedScores = [...filteredScores].sort((a, b) => {
    let comparison = 0;
    
    switch(sortBy) {
      case 'score':
        comparison = a.score - b.score;
        break;
      case 'accuracy':
        comparison = (a.score / a.totalQuestions) - (b.score / b.totalQuestions);
        break;
      case 'time':
        // For time, lower is better
        if (a.timeTaken && b.timeTaken) {
          comparison = a.timeTaken - b.timeTaken;
        } else if (a.timeTaken) {
          comparison = -1;
        } else if (b.timeTaken) {
          comparison = 1;
        }
        break;
      case 'date':
      default:
        comparison = a.date - b.date;
        break;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  $: paginatedScores = sortedScores.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  $: totalPages = Math.ceil(sortedScores.length / itemsPerPage);
</script>

<h1 class="mb-6 text-2xl font-bold">Quiz Scores</h1>

<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
  <div>
    <label class="mr-2 text-sm font-medium">Filter by Mode:</label>
    <select
      class="rounded-md border border-input bg-background px-3 py-1 dark:bg-slate-600"
      bind:value={filterMode}
    >
      <option value="all">All Modes</option>
      <option value="regular">Regular</option>
      <option value="endless">Endless</option>
      <option value="custom">Custom</option>
      <option value="speedrun">Speedrun</option>
    </select>
  </div>
  
  <div>
    <label class="mr-2 text-sm font-medium">Sort by:</label>
    <select
      class="rounded-md border border-input bg-background px-3 py-1 dark:bg-slate-600"
      bind:value={sortBy}
      on:change={() => {
        // Default sort direction for each sort type
        if (sortBy === 'date') sortDirection = 'desc';
        else if (sortBy === 'time') sortDirection = 'asc';
        else sortDirection = 'desc';
      }}
    >
      <option value="date">Date</option>
      <option value="score">Score</option>
      <option value="accuracy">Accuracy</option>
      <option value="time">Time (fastest first)</option>
    </select>
    
    <button
      class="ml-2 rounded-md border border-border p-2 hover:bg-muted hover:scale-105 active:scale-95 transition-transform"
      on:click={() => sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'}
      title={`Currently sorting ${sortDirection === 'asc' ? 'ascending' : 'descending'}`}
    >
      {sortDirection === 'asc' ? '↑' : '↓'}
    </button>
  </div>
</div>

{#if sortedScores.length === 0}
  <div class="rounded-lg border border-border p-8 text-center">
    <p>No quiz scores found.</p>
    <p class="mt-2">
      <a href="/" class="text-primary hover:underline">Go take a quiz!</a>
    </p>
  </div>
{:else}
  <div class="rounded-lg border border-border">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-border bg-muted/50">
            <th class="px-4 py-3 text-left text-sm font-medium">Player</th>
            <th class="px-4 py-3 text-left text-sm font-medium">
              <button class="inline-flex items-center font-medium" on:click={() => handleSort('date')}>
                Date
                {#if sortBy === 'date'}
                  <span class="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </button>
            </th>
            <th class="px-4 py-3 text-left text-sm font-medium">Mode</th>
            <th class="px-4 py-3 text-right text-sm font-medium">
              <button class="inline-flex items-center font-medium" on:click={() => handleSort('score')}>
                Score
                {#if sortBy === 'score'}
                  <span class="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </button>
            </th>
            <th class="px-4 py-3 text-right text-sm font-medium">
              <button class="inline-flex items-center font-medium" on:click={() => handleSort('accuracy')}>
                Accuracy
                {#if sortBy === 'accuracy'}
                  <span class="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </button>
            </th>
            <th class="px-4 py-3 text-right text-sm font-medium">
              <button class="inline-flex items-center font-medium" on:click={() => handleSort('time')}>
                Time
                {#if sortBy === 'time'}
                  <span class="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {#each paginatedScores as score (score.id)}
            <tr class="border-b border-border hover:bg-muted/50">
              <td class="px-4 py-3">{score.playerName}</td>
              <td class="px-4 py-3 text-sm">{formatDate(score.date)}</td>
              <td class="px-4 py-3 capitalize">{score.mode}</td>
              <td class="px-4 py-3 text-right">{score.score} / {score.totalQuestions}</td>
              <td class="px-4 py-3 text-right">{Math.round((score.score / score.totalQuestions) * 100)}%</td>
              <td class="px-4 py-3 text-right">{formatTime(score.timeTaken || 0)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  {#if totalPages > 1}
    <div class="mt-4 flex justify-center">
      <div class="flex items-center space-x-2">
        <button
          class="rounded-md border border-border px-3 py-1 text-sm disabled:opacity-50"
          disabled={currentPage === 1}
          on:click={() => changePage(currentPage - 1)}
        >
          Previous
        </button>
        
        {#each Array(totalPages) as _, i}
          {#if i + 1 === currentPage || i + 1 === 1 || i + 1 === totalPages || (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1)}
            <button
              class="rounded-md border px-3 py-1 text-sm {currentPage === i + 1 ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted'}"
              on:click={() => changePage(i + 1)}
            >
              {i + 1}
            </button>
          {:else if i + 1 === currentPage - 2 || i + 1 === currentPage + 2}
            <span class="px-1">...</span>
          {/if}
        {/each}
        
        <button
          class="rounded-md border border-border px-3 py-1 text-sm disabled:opacity-50"
          disabled={currentPage === totalPages}
          on:click={() => changePage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  {/if}
{/if}
