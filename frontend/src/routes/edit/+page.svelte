<script lang="ts">
	import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { getQuestions, searchQuestions, saveQuestion, updateQuestion, deleteQuestion } from '$lib/localStorage';
  import type { QuizQuestion } from '$lib/types';
	import { toast } from '$lib/components/ui/toast';

  let questions: QuizQuestion[] = [];
  let isLoading = false;
  let searchTerm = '';
  let isAdding = false;
  let currentPage = 1;
  let questionsPerPage = 20;

   let sortBy = 'date';
  let sortDirection: 'asc' | 'desc' = 'desc';
  
  // New question form
  let editingQuestion: QuizQuestion | null = null;
  let questionText = '';
  let answers = [
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ];

  onMount(() => {
    loadQuestions();
  });

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

  function exportQuestionsAsJson() {
    // Get all questions, not just the filtered ones
    const allQuestions = getQuestions();
    
    // Create a JSON string with proper formatting
    const jsonString = JSON.stringify(allQuestions, null, 2);
    
    // Create a blob with the JSON data
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link element
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-questions-${new Date().toISOString().slice(0, 10)}.json`;
    
    // Append to the document, click to download, and remove
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up by revoking the URL
    URL.revokeObjectURL(url);
    
    if (browser) {
      toast.success('Questions exported successfully!');
    }
  }

  function loadQuestions() {
    isLoading = true;
    questions = searchTerm ? searchQuestions(searchTerm) : getQuestions();
    isLoading = false;
  }

  function handleSearch() {
    currentPage = 1;
    loadQuestions();
  }

  function startAdd() {
    isAdding = true;
    editingQuestion = null;
    questionText = '';
    answers = [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ];
  }

  function startEdit(question: QuizQuestion) {
    isAdding = true;
    editingQuestion = question;
    questionText = question.question;
    answers = [...question.answers];
    
    // Ensure we have at least 4 answer options
    while (answers.length < 4) {
      answers.push({ text: '', isCorrect: false });
    }
  }

  function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this question?')) {
      deleteQuestion(id);
      loadQuestions();
    }
  }

  function cancelAdd() {
    isAdding = false;
    editingQuestion = null;
  }

    function toggleCorrectAnswer(index: number) {
    // Toggle the isCorrect status for the clicked answer
    answers = answers.map((answer, i) => 
      i === index ? { ...answer, isCorrect: !answer.isCorrect } : answer
    );
  }

  function handleSaveQuestion() {
    // Validate form
    if (!questionText.trim()) {
      if (browser) {
        toast.error('Question text is required');
      }
      return;
    }

    // Filter out empty answer fields
    const validAnswers = answers.filter(answer => answer.text.trim());

    if (validAnswers.length < 2) {
      if (browser) {
        toast.error('At least two answer options are required');
      }
      return;
    }

    if (!validAnswers.some(answer => answer.isCorrect)) {
      if (browser) {
        toast.error('At least one answer must be marked as correct');
      }
      return;
    }    // Save or update the question
    if (editingQuestion) {
      updateQuestion({
        ...editingQuestion,
        question: questionText.trim(),
        answers: validAnswers,
        updatedAt: Date.now()
      });
    } else {
      saveQuestion({
        id: `q${Date.now()}`,
        question: questionText.trim(),
        answers: validAnswers,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        stats: {
          accuracy: 0,
          attempts: 0,
          correctCount: 0,
          incorrectCount: 0,
          lastUsed: 0
        }
      });
    }

    isAdding = false;
    loadQuestions();
  }

  function addAnswerOption() {
    if (answers.length < 6) { // Limit to 6 answers
      answers = [...answers, { text: '', isCorrect: false }];
    }
  }

  function removeAnswerOption(index: number) {
    if (answers.length > 2) { // Ensure we have at least 2 answers
      answers = answers.filter((_, i) => i !== index);
      
      // Make sure at least one answer remains correct
      if (!answers.some(answer => answer.isCorrect)) {
        answers[0] = { ...answers[0], isCorrect: true };
      }
    }
  }

  function changePage(page: number) {
    currentPage = page;
  }

  function handleChangePerPage(event: Event) {
    const target = event.target as HTMLSelectElement;
    questionsPerPage = parseInt(target.value, 10);
    currentPage = 1;
  }

  $: filteredQuestions = questions;
  $: totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
  $: sortedQuestions = [...filteredQuestions].sort((a, b) => {
    let valueA, valueB;
    
    // Extract the correct values based on sortBy
    switch (sortBy) {
      case 'id':
        valueA = a.id;
        valueB = b.id;
        break;
      case 'accuracy':
        valueA = a.stats?.accuracy || 0;
        valueB = b.stats?.accuracy || 0;
        break;
      case 'attempts':
        valueA = a.stats?.attempts || 0;
        valueB = b.stats?.attempts || 0;
        break;
      case 'lastUsed':
        valueA = a.stats?.lastUsed || 0;
        valueB = b.stats?.lastUsed || 0;
        break;
      case 'question':
        valueA = a.question.toLowerCase();
        valueB = b.question.toLowerCase();
        break;
      case 'date':
      default:
        valueA = a.updatedAt || a.createdAt;
        valueB = b.updatedAt || b.createdAt;
    }
    
    // Sort in the correct direction
    if (sortDirection === 'asc') {
      if (typeof valueA === 'string') return valueA.localeCompare(valueB);
      return valueA - valueB;
    } else {
      if (typeof valueA === 'string') return valueB.localeCompare(valueA);
      return valueB - valueA;
    }
  });
  $: paginatedQuestions = sortedQuestions.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage
  );
</script>
<div class="flex flex-row items-center justify-between mb-6">
<h1 class="mb-6 text-2xl font-bold">Quiz Question Manager</h1>
  <button
      class="cursor-pointer rounded-md border border-primary bg-blue-100 px-4 py-2 text-blue-700 transition-colors hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 hover:scale-105 active:scale-95"
      on:click={exportQuestionsAsJson}
      disabled={questions.length === 0}
      title={questions.length === 0 ? 'No questions to export' : 'Export all questions as JSON'}
    >
      Export JSON
    </button>
  </div>

<div class="mb-6 flex flex-wrap items-center gap-4">
  <div class="flex-1">
    <div class="relative flex items-center">
      <input
        type="text"
        placeholder="Search questions..."
        class="w-full rounded-md border border-input bg-background px-3 py-2 pr-10"
        bind:value={searchTerm}
        on:input={handleSearch}
      />
    </div>
  </div>
  {#if !isAdding}
  <button
    class="cursor-pointer rounded-md bg-primary border px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90 hover:scale-105 active:scale-95"
    on:click={startAdd}
  >
    Add Question
  </button>
  {/if}
</div>

{#if isAdding}
  <div class="mb-6 rounded-lg border border-border p-6">
    <h2 class="mb-4 text-xl font-semibold">{editingQuestion ? 'Edit Question' : 'Add New Question'}</h2>
    
    <div class="mb-4">
      <label class="mb-1 block text-sm font-medium" for="question">Question</label>
      <textarea
        id="question"
        class="w-full rounded-md border border-input bg-background px-3 py-2"
        rows="3"
        placeholder="Enter your question"
        bind:value={questionText}
      ></textarea>
    </div>
    
    <div class="mb-4">
      <label class="mb-1 block text-sm font-medium">Answer Options</label>
      <p class="mb-2 text-sm text-muted-foreground">Select the radio button for the correct answer(s).</p>
      
      {#each answers as answer, i}
        <div class="mb-2 flex items-center gap-2">
          <input
            type="checkbox"
            name="correctAnswer"
            checked={answer.isCorrect}
            on:change={() => toggleCorrectAnswer(i)}
          />
          <input
            type="text"
            class="flex-1 rounded-md border border-input bg-background px-3 py-2"
            placeholder={`Answer option ${i + 1}`}
            bind:value={answer.text}
          />
          <button
            class="cursor-pointer rounded-md border border-border p-2 text-muted-foreground hover:bg-muted hover:scale-105 active:scale-95"
            on:click={() => removeAnswerOption(i)}
            disabled={answers.length <= 2}
            title="Remove answer option"
          >
            ×
          </button>
        </div>
      {/each}
      
      {#if answers.length < 6}
        <button
          class="cursor-pointer hover:scale-105 active:scale-95 mt-2 inline-flex items-center text-sm text-primary hover:underline"
          on:click={addAnswerOption}
        >
          + Add answer option
        </button>
      {/if}
    </div>
    
    <div class="flex justify-end gap-2">
      <button
        class="cursor-pointer rounded-md border border-border px-4 py-2 hover:bg-muted hover:scale-105 active:scale-95"
        on:click={cancelAdd}
      >
        Cancel
      </button>
      <button
        class="cursor-pointer rounded-md bg-primary px-4 py-2 border bg-green-200 text-green-400 dark:text-green-600 text-primary-foreground transition-colors hover:bg-primary/90 hover:scale-105 active:scale-95"
        on:click={handleSaveQuestion}
      >
        {editingQuestion ? 'Update' : 'Save'} Question
      </button>
    </div>
  </div>
{/if}

{#if isLoading}
  <div class="py-8 text-center">
    <p>Loading questions...</p>
  </div>
{:else if paginatedQuestions.length === 0}
  <div class="rounded-lg border border-border p-8 text-center">
    <p class="mb-4">No questions found.</p>
    {#if searchTerm}
      <p>Try a different search term or clear your search.</p>
    {:else}
      <p>Start by adding your first question!</p>
    {/if}
  </div>
{:else}
  <div class="mb-4 flex items-center justify-between">
    <div class="text-sm text-muted-foreground">
      Showing {(currentPage - 1) * questionsPerPage + 1} to {Math.min(currentPage * questionsPerPage, filteredQuestions.length)} of {filteredQuestions.length} questions
    </div>
    
    <div>
      <label class="text-sm">
        Show 
        <select
          class="rounded-md border border-input dark:bg-slate-600 px-2 py-1"
          on:change={handleChangePerPage}
          value={questionsPerPage}
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
        per page
      </label>
    </div>
  </div>

  <div class="rounded-lg border border-border">
    <div class="overflow-x-auto">
      <table class="w-full">        
       <thead>
  <tr class="border-b border-border bg-muted/50">
    <th 
      class="px-4 py-3 text-left text-sm font-medium cursor-pointer select-none" 
      on:click={() => handleSort('id')}
    >
      ID {sortBy === 'id' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
    </th>
    <th 
      class="px-4 py-3 text-left text-sm font-medium cursor-pointer select-none" 
      on:click={() => handleSort('accuracy')}
    >
      Accuracy {sortBy === 'accuracy' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
    </th>
    <th 
      class="px-4 py-3 text-left text-sm font-medium cursor-pointer select-none" 
      on:click={() => handleSort('attempts')}
    >
      Attempts {sortBy === 'attempts' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
    </th>
    <th 
      class="px-4 py-3 text-left text-sm font-medium cursor-pointer select-none" 
      on:click={() => handleSort('lastUsed')}
    >
      Last Used {sortBy === 'lastUsed' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
    </th>
    <th 
      class="px-4 py-3 text-left text-sm font-medium cursor-pointer select-none" 
      on:click={() => handleSort('question')}
    >
      Question {sortBy === 'question' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
    </th>
    <th class="px-4 py-3 text-left text-sm font-medium">Answers</th>
    <th class="px-4 py-3 text-right text-sm font-medium">Actions</th>
  </tr>
</thead>
        <tbody>          {#each paginatedQuestions as question (question.id)}
            <tr class="border-b border-border hover:bg-muted/50">
              <td class="px-4 py-3 text-sm">{question.id}</td>
              <td class="px-4 py-3 text-sm">
                {#if question.stats?.accuracy !== undefined}
                  {(question.stats.accuracy * 100).toFixed(1)}%
                {:else}
                  -
                {/if}
              </td>
              <td class="px-4 py-3 text-sm">
                {question.stats?.attempts || 0}
              </td>
              <td class="px-4 py-3 text-sm">
                {#if question.stats?.lastUsed}
                  {new Date(question.stats.lastUsed).toLocaleDateString()}
                {:else}
                  Never
                {/if}
              </td>
              <td class="px-4 py-3">{question.question}</td>
              <td class="px-4 py-3">
                <ul class="list-inside list-disc space-y-1">
                  {#each question.answers as answer}
                    <li class={answer.isCorrect ? 'font-semibold' : ''}>{answer.text} {answer.isCorrect ? '✓' : ''}</li>
                  {/each}
                </ul>
              </td>
              <td class="px-4 py-4 text-right">
                <button
                  class="cursor-pointer hover:scale-95 active:scale-105 rounded-md min-w-[70px] border px-3 py-1 text-sm hover:bg-muted"
                  on:click={() => startEdit(question)}
                >
                  Edit
                </button>
                <button
                  class="cursor-pointer hover:scale-95 active:scale-105 rounded-md min-w-[70px] border bg-red-50 px-3 py-1 mt-2 text-sm text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                  on:click={() => handleDelete(question.id)}
                >
                  Delete
                </button>
              </td>
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
          class="cursor-pointer rounded-md border border-border px-3 py-1 text-sm disabled:opacity-50"
          disabled={currentPage === 1}
          on:click={() => changePage(currentPage - 1)}
        >
          Previous
        </button>
        
        {#each Array(totalPages) as _, i}
          {#if i + 1 === currentPage || i + 1 === 1 || i + 1 === totalPages || (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1)}
            <button
              class="cursor-pointer rounded-md border px-3 py-1 text-sm {currentPage === i + 1 ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted'}"
              on:click={() => changePage(i + 1)}
            >
              {i + 1}
            </button>
          {:else if i + 1 === currentPage - 2 || i + 1 === currentPage + 2}
            <span class="px-1">...</span>
          {/if}
        {/each}
        
        <button
          class="cursor-pointer 
          rounded-md border border-border px-3 py-1 text-sm disabled:opacity-50"
          disabled={currentPage === totalPages}
          on:click={() => changePage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  {/if}
{/if}
