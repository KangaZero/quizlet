<script lang="ts">
	import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { getQuestions, searchQuestions, saveQuestion, updateQuestion, deleteQuestion, importQuestions } from '$lib/localStorage';
  import type { QuizQuestion } from '$lib/types';
	import { toast } from '$lib/components/ui/toast';
  import * as AlertDialog from '$lib/components/ui/alert-dialog';

  let questions: QuizQuestion[] = [];
  let isLoading = false;
  let searchTerm = '';
  let isAdding = false;
  let currentPage = 1;
  let questionsPerPage = 20;
  let parsedQuestions: QuizQuestion[] = [];
  let showImportDialog = false;
  let showDeleteDialog = false;

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

  function importQuestionsFromJson(event: Event) {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Check if it's a JSON file
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        toast.error('Please select a valid JSON file.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          
          // Handle both array and object formats
          parsedQuestions = Array.isArray(parsed) ? parsed : [parsed];
          
          // Validate the structure of the imported questions
          const isValid = parsedQuestions.every(q => 
            q.question && 
            Array.isArray(q.answers) && 
            q.answers.length > 0 &&
            q.answers.every(a => 'text' in a && 'isCorrect' in a)
          );
          
          if (!isValid) {
            toast.error('The JSON file has an invalid format. Questions must have a question text and at least one answer with text and isCorrect properties.');
            parsedQuestions = [];
            return;
          }
          
          console.log("Valid questions parsed:", parsedQuestions.length);
          console.log("Sample question:", parsedQuestions);
          // Show the import dialog for confirmation
          showImportDialog = true;
          
        } catch (error) {
          toast.error('Error parsing JSON file.');
          console.error('Import error:', error);
          parsedQuestions = [];
        }
      };
      
      reader.readAsText(file);
      
      // Reset the input value to allow importing the same file again
      input.value = '';
    }
  }
    function importQuestionsWithMode(mode: 'replace' | 'add') {
    try {   
      // Process questions to ensure they have all required fields
      const processedQuestions = parsedQuestions.map((q, index) => {
        // If question already has an ID, keep it (for 'add' mode) unless we're replacing
        const questionId = mode === 'replace' || !q.id ? `q${index}` : q.id;
        
        return {
          id: questionId,
          question: q.question,
          answers: q.answers,
          createdAt: q.createdAt || Date.now(),
          updatedAt: q.updatedAt || Date.now(),
          stats: q.stats || {
            accuracy: 0,
            attempts: 0,
            correctCount: 0,
            incorrectCount: 0,
            lastUsed: 0
          }
        };
      });

      
      importQuestions(processedQuestions, mode);
      
      // Update UI
      loadQuestions();
      showImportDialog = false;
      
      // Show success message
      if (mode === 'replace') {
        toast.success(`Replaced all questions with ${processedQuestions.length} imported questions.`);
      } else {
        toast.success(`Added ${processedQuestions.length} questions to your collection.`);
      }
      
      // Reset parsedQuestions after successful import
      parsedQuestions = [];
    } catch (error) {
      toast.error('Error importing questions: ' + (error instanceof Error ? error.message : 'Unknown error'));
      console.error('Import error:', error);
    }
  }
  
  function closeImportDialog() {
    showImportDialog = false;
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
      deleteQuestion(id);
      loadQuestions();
      if (browser) {
        toast.success(`Questions ${id} deleted successfully!`);
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

    const currentLength = questions.length;

    if (editingQuestion) {
      updateQuestion({
        ...editingQuestion,
        question: questionText.trim(),
        answers: validAnswers,
        updatedAt: Date.now()
      });
    } else {
      saveQuestion({
        id: `q${currentLength}`,
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
  // We're now using importQuestionsWithMode instead of this function
  // This function is kept for reference but is no longer used
  /*
  function handleImportQuestions() {
    // Functionality moved to importQuestionsWithMode
  }
  */

  function handleFileUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        try {
          // Parse the JSON content
          const json = JSON.parse(content);
          parsedQuestions = Array.isArray(json) ? json : [json];
          
          toast.success('File parsed successfully!');
        } catch (error) {
          toast.error('Failed to parse JSON file');
        }
      }
    };
    reader.readAsText(file);
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
      if (typeof valueA === 'string') return valueA.localeCompare(String(valueB));
      return Number(valueA) - Number(valueB);
    } else {
      if (typeof valueA === 'string') return String(valueB).localeCompare(String(valueA));
      return Number(valueB) - Number(valueA);
    }
  });
  $: paginatedQuestions = sortedQuestions.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage
  );
</script>
<div class="flex flex-row items-center justify-between mb-6">
<h1 class="mb-6 text-2xl font-bold">Quiz Question Manager</h1>
<div>
  <button
      class="cursor-pointer rounded-md bg-primary border px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90 hover:scale-105 active:scale-95 mr-2"
      onclick={exportQuestionsAsJson}
      disabled={questions.length === 0}
      title={questions.length === 0 ? 'No questions to export' : 'Export all questions as JSON'}
    >
      Export JSON
    </button>

    <!-- Import button that triggers file input click -->
    <button
      class="cursor-pointer rounded-md bg-primary border px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90 hover:scale-105 active:scale-95"
      onclick={() => document.getElementById('fileInput')?.click()}
      title="Import questions from a JSON file"
    >
      Import JSON
    </button>
  </div>
    <!-- Hidden file input for importing JSON files -->
    <input 
      type="file" 
      id="fileInput" 
      accept=".json,application/json" 
      onchange={importQuestionsFromJson} 
      class="hidden" 
    />
  </div>

  <!-- Import Dialog -->
  <AlertDialog.Root bind:open={showImportDialog}>
    <AlertDialog.Content>
      <AlertDialog.Header>
        <AlertDialog.Title>Import Questions</AlertDialog.Title>
        <AlertDialog.Description>
          You're about to import {parsedQuestions.length} questions. How would you like to proceed?
        </AlertDialog.Description>
      </AlertDialog.Header>

      <AlertDialog.Footer>
        <AlertDialog.Cancel onclick={closeImportDialog}>Cancel</AlertDialog.Cancel>
        <AlertDialog.Action class="bg-amber-600 hover:bg-amber-700" onclick={importQuestionsWithMode('add')}>
          Add to Existing
        </AlertDialog.Action>
        <AlertDialog.Action class="bg-red-600 hover:bg-red-700" onclick={importQuestionsWithMode('replace')}>
          Replace All
        </AlertDialog.Action>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>

<div class="mb-6 flex flex-wrap items-center gap-4">
  <div class="flex-1">
    <div class="relative flex items-center">
      <input
        type="text"
        placeholder="Search questions..."
        class="w-full rounded-md border border-input bg-background px-3 py-2 pr-10"
        bind:value={searchTerm}
        oninput={handleSearch}
      />
    </div>
  </div>
  {#if !isAdding}
  <button
    class="cursor-pointer rounded-md bg-primary border px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90 hover:scale-105 active:scale-95"
    onclick={startAdd}
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
            onchange={() => toggleCorrectAnswer(i)}
          />
          <input
            type="text"
            class="flex-1 rounded-md border border-input bg-background px-3 py-2"
            placeholder={`Answer option ${i + 1}`}
            bind:value={answer.text}
          />
          <button
            class="cursor-pointer rounded-md border border-border p-2 text-muted-foreground hover:bg-muted hover:scale-105 active:scale-95"
            onclick={() => removeAnswerOption(i)}
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
          onclick={addAnswerOption}
        >
          + Add answer option
        </button>
      {/if}
    </div>
    
    <div class="flex justify-end gap-2">
      <button
        class="cursor-pointer rounded-md border border-border px-4 py-2 hover:bg-muted hover:scale-105 active:scale-95"
        onclick={cancelAdd}
      >
        Cancel
      </button>
      <button
        class="cursor-pointer rounded-md bg-primary px-4 py-2 border bg-green-200 text-green-400 dark:text-green-600 text-primary-foreground transition-colors hover:bg-primary/90 hover:scale-105 active:scale-95"
        onclick={handleSaveQuestion}
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
          onchange={handleChangePerPage}
          value={questionsPerPage}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        per page
      </label>
    </div>
  </div>

  <div class="rounded-lg border border-border">
    <div class="overflow-auto">
      <table class="w-full">        
       <thead>
  <tr class="border-b border-border bg-muted/50">
    <th 
      class="px-4 py-3 text-left text-sm font-medium cursor-pointer select-none" 
      onclick={() => handleSort('id')}
    >
      ID {sortBy === 'id' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
    </th>
    <th 
      class="px-4 py-3 text-left text-sm font-medium cursor-pointer select-none" 
      onclick={() => handleSort('accuracy')}
    >
      Accuracy {sortBy === 'accuracy' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
    </th>
    <th 
      class="px-4 py-3 text-left text-sm font-medium cursor-pointer select-none" 
      onclick={() => handleSort('attempts')}
    >
      Attempts {sortBy === 'attempts' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
    </th>
    <th 
      class="px-4 py-3 text-left text-sm font-medium cursor-pointer select-none" 
      onclick={() => handleSort('lastUsed')}
    >
      Last Used {sortBy === 'lastUsed' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
    </th>
    <th 
      class="px-4 py-3 text-left text-sm font-medium cursor-pointer select-none" 
      onclick={() => handleSort('question')}
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
                  onclick={() => startEdit(question)}
                >
                  Edit
                </button>
                <button
                  class="cursor-pointer hover:scale-95 active:scale-105 rounded-md min-w-[70px] border bg-red-50 px-3 py-1 mt-2 text-sm text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                  onclick={() => showDeleteDialog = true}
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
          onclick={() => changePage(currentPage - 1)}
        >
          Previous
        </button>
        
        {#each Array(totalPages) as _, i}
          {#if i + 1 === currentPage || i + 1 === 1 || i + 1 === totalPages || (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1)}
            <button
              class="cursor-pointer rounded-md border px-3 py-1 text-sm {currentPage === i + 1 ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted'}"
              onclick={() => changePage(i + 1)}
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
          onclick={() => changePage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  {/if}
{/if}

{#if showDeleteDialog}
  <AlertDialog.Root bind:open={showDeleteDialog}>
    <AlertDialog.Content>
      <AlertDialog.Header>
        <AlertDialog.Title>Delete Question</AlertDialog.Title>
        <AlertDialog.Description>
          Are you sure you want to delete this question? This action cannot be undone.
        </AlertDialog.Description>
      </AlertDialog.Header>

      <AlertDialog.Footer>
        <AlertDialog.Cancel onclick={() => showDeleteDialog = false}>Cancel</AlertDialog.Cancel>
        <AlertDialog.Action class="bg-red-600 hover:bg-red-700" onclick={() => handleDelete(editingQuestion?.id || '')}>
          Delete
        </AlertDialog.Action>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>
{/if}