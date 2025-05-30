<script lang="ts">
  import { onMount } from 'svelte';
  import { getQuestions, searchQuestions, saveQuestion, updateQuestion, deleteQuestion } from '$lib/localStorage';
  import type { QuizQuestion } from '$lib/types';

  let questions: QuizQuestion[] = [];
  let isLoading = false;
  let searchTerm = '';
  let isAdding = false;
  let currentPage = 1;
  let questionsPerPage = 20;
  
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

  function handleSaveQuestion() {
    // Validate form
    if (!questionText.trim()) {
      alert('Question text is required');
      return;
    }

    // Filter out empty answer fields
    const validAnswers = answers.filter(answer => answer.text.trim());

    if (validAnswers.length < 2) {
      alert('At least two answer options are required');
      return;
    }

    if (!validAnswers.some(answer => answer.isCorrect)) {
      alert('At least one answer must be marked as correct');
      return;
    }

    // Save or update the question
    if (editingQuestion) {
      updateQuestion({
        ...editingQuestion,
        question: questionText.trim(),
        answers: validAnswers
      });
    } else {
      saveQuestion({
        id: `q${Date.now()}`,
        question: questionText.trim(),
        answers: validAnswers,
        createdAt: Date.now()
      });
    }

    isAdding = false;
    loadQuestions();
  }

  function setCorrectAnswer(index: number) {
    // Update the isCorrect status
    answers = answers.map((answer, i) => ({
      ...answer,
      isCorrect: i === index
    }));
  }

  function addAnswerOption() {
    if (answers.length < 6) { // Limit to 6 answers
      answers = [...answers, { text: '', isCorrect: false }];
    }
  }

  function removeAnswerOption(index: number) {
    if (answers.length > 2) { // Ensure we have at least 2 answers
      // If removing the correct answer, set the first remaining answer as correct
      const wasCorrect = answers[index].isCorrect;
      answers = answers.filter((_, i) => i !== index);
      
      if (wasCorrect && answers.length > 0) {
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
  $: paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage
  );
</script>

<h1 class="mb-6 text-2xl font-bold">Quiz Question Manager</h1>

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
  
  <button
    class="rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
    on:click={startAdd}
  >
    Add Question
  </button>
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
      <p class="mb-2 text-sm text-muted-foreground">Select the radio button for the correct answer.</p>
      
      {#each answers as answer, i}
        <div class="mb-2 flex items-center gap-2">
          <input
            type="radio"
            name="correctAnswer"
            checked={answer.isCorrect}
            on:change={() => setCorrectAnswer(i)}
          />
          <input
            type="text"
            class="flex-1 rounded-md border border-input bg-background px-3 py-2"
            placeholder={`Answer option ${i + 1}`}
            bind:value={answer.text}
          />
          <button
            class="rounded-md border border-border p-2 text-muted-foreground hover:bg-muted"
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
          class="mt-2 inline-flex items-center text-sm text-primary hover:underline"
          on:click={addAnswerOption}
        >
          + Add answer option
        </button>
      {/if}
    </div>
    
    <div class="flex justify-end gap-2">
      <button
        class="rounded-md border border-border px-4 py-2 hover:bg-muted"
        on:click={cancelAdd}
      >
        Cancel
      </button>
      <button
        class="rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
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
          class="rounded-md border border-input bg-background px-2 py-1"
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
            <th class="px-4 py-3 text-left text-sm font-medium">ID</th>
            <th class="px-4 py-3 text-left text-sm font-medium">Question</th>
            <th class="px-4 py-3 text-left text-sm font-medium">Answers</th>
            <th class="px-4 py-3 text-right text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each paginatedQuestions as question (question.id)}
            <tr class="border-b border-border hover:bg-muted/50">
              <td class="px-4 py-3 text-sm">{question.id}</td>
              <td class="px-4 py-3">{question.question}</td>
              <td class="px-4 py-3">
                <ul class="list-inside list-disc space-y-1">
                  {#each question.answers as answer}
                    <li class={answer.isCorrect ? 'font-semibold' : ''}>{answer.text} {answer.isCorrect ? '✓' : ''}</li>
                  {/each}
                </ul>
              </td>
              <td class="px-4 py-3 text-right">
                <button
                  class="mr-2 rounded-md border border-border px-3 py-1 text-sm hover:bg-muted"
                  on:click={() => startEdit(question)}
                >
                  Edit
                </button>
                <button
                  class="rounded-md border border-border bg-red-50 px-3 py-1 text-sm text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
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
