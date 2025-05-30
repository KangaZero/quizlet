<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { userName } from '$lib/stores';
  import { getRandomQuestions, saveScore } from '$lib/localStorage';
  import type { QuizQuestion } from '$lib/types';
  
  let mode = $page.url.searchParams.get('mode') || 'regular';
  let questions: QuizQuestion[] = [];
  let currentQuestionIndex = 0;
  let score = 0;
  let lives = 3;
  let startTime: number;
  let endTime: number;
  let timeRemaining = 300; // 5 minutes in seconds
  let customQuestionCount = 10;
  let customAllowRepeats = false;
  let timer: ReturnType<typeof setInterval>;
  let isCustomSetup = mode === 'custom';
  let isQuizStarted = false;
  let isQuizFinished = false;
  let lastAnswerCorrect: boolean | null = null;
  let selectedAnswerIndex: number | null = null;
  
  onMount(() => {
    if (!$userName) {
      // Redirect to settings if username is not set
      goto('/settings');
    }
    
    // If not custom mode, start the quiz automatically
    if (mode !== 'custom') {
      startQuiz();
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  });
    function startQuiz() {
    // Initialize questions based on mode
    let count = 10; // Default for regular mode
    let allowRepeats = false;
    
    if (mode === 'endless') {
      count = 100; // Large number for endless mode
      allowRepeats = true;
    } else if (mode === 'speedrun') {
      count = 50;
      allowRepeats = false;
    } else if (mode === 'custom') {
      count = customQuestionCount;
      allowRepeats = customAllowRepeats;
    }
    
    // Get all available questions and check if we have enough
    const allQuestions = getRandomQuestions(count, allowRepeats);
    
    if (allQuestions.length === 0) {
      alert('No questions available. Please add some questions first!');
      goto('/edit');
      return;
    }
    
    // If we don't have enough questions for the selected mode, show a warning
    if (allQuestions.length < count && !allowRepeats) {
      const confirmContinue = confirm(
        `There are only ${allQuestions.length} questions available, which is fewer than the ${count} requested. Continue anyway?`
      );
      
      if (!confirmContinue) {
        goto('/');
        return;
      }
    }
    
    questions = allQuestions;
    
    // Reset quiz state
    currentQuestionIndex = 0;
    score = 0;
    lives = 3;
    lastAnswerCorrect = null;
    selectedAnswerIndex = null;
    isQuizStarted = true;
    isQuizFinished = false;
    startTime = Date.now();
    
    // Start timer for regular or speedrun mode
    if (mode === 'regular') {
      timeRemaining = 300; // 5 minutes
      startTimer();
    } else if (mode === 'speedrun') {
      // For speedrun, we don't have a time limit, just track elapsed time
      startTime = Date.now();
    }
  }
  
  function startTimer() {
    if (timer) clearInterval(timer);
    
    timer = setInterval(() => {
      timeRemaining--;
      
      if (timeRemaining <= 0) {
        clearInterval(timer);
        finishQuiz();
      }
    }, 1000);
  }
  
  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  
  function formatElapsedTime(ms: number) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }
  
  function selectAnswer(answerIndex: number) {
    if (selectedAnswerIndex !== null) return; // Already answered
    
    selectedAnswerIndex = answerIndex;
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = currentQuestion.answers[answerIndex].isCorrect;
    
    if (isCorrect) {
      score++;
      lastAnswerCorrect = true;
    } else {
      if (mode === 'endless') {
        lives--;
        
        if (lives <= 0) {
          // In endless mode, run out of lives ends the quiz
          setTimeout(finishQuiz, 1500);
        }
      }
      
      lastAnswerCorrect = false;
    }
    
    // Move to next question after a short delay
    setTimeout(() => {
      selectedAnswerIndex = null;
      lastAnswerCorrect = null;
      
      // Don't increment in endless mode if out of lives
      if (!(mode === 'endless' && lives <= 0)) {
        if (currentQuestionIndex < questions.length - 1) {
          currentQuestionIndex++;
        } else {
          finishQuiz();
        }
      }
    }, 1500);
  }
  
  function finishQuiz() {
    isQuizFinished = true;
    if (timer) clearInterval(timer);
    endTime = Date.now();
    
    // Save score to localStorage
    const timeTaken = endTime - startTime;
    const quizId = `quiz_${Date.now()}`;
    
    let totalQuestions = currentQuestionIndex + 1;
    if (mode === 'regular') totalQuestions = 10;
    if (mode === 'speedrun') totalQuestions = 50;
    
    saveScore({
      id: quizId,
      playerName: $userName,
      mode: mode as "regular" | "custom" | "endless" | "speedrun",
      score,
      totalQuestions,
      timeTaken,
      date: Date.now(),
      customSettings: mode === 'custom' ? {
        questionCount: customQuestionCount,
        allowRepeats: customAllowRepeats
      } : undefined
    });
  }
  
  function getCurrentQuestion() {
    return questions[currentQuestionIndex];
  }
</script>

{#if !isQuizStarted && mode === 'custom'}
  <div class="mx-auto max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
    <h2 class="mb-6 text-2xl font-bold">Custom Quiz Settings</h2>
    
    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium" for="questionCount">Number of Questions</label>
      <input
        type="number"
        id="questionCount"
        min="1"
        max="100"
        class="w-full rounded-md border border-input bg-background px-3 py-2"
        bind:value={customQuestionCount}
      />
    </div>
    
    <div class="mb-6">
      <label class="flex items-center">
        <input type="checkbox" class="mr-2" bind:checked={customAllowRepeats} />
        <span>Allow repeating questions</span>
      </label>
    </div>
    
    <button
      on:click={startQuiz}
      class="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
    >
      Start Custom Quiz
    </button>
  </div>
{:else if isQuizStarted && !isQuizFinished && questions.length > 0}
  <div class="mx-auto max-w-3xl">
    <div class="flex items-center justify-between">
      <div>
        <span class="text-lg font-bold">Score: {score}</span>
        
        {#if mode === 'endless'}
          <span class="ml-4 text-lg font-bold">Lives: {lives}</span>
        {/if}
      </div>
      
      <div>
        {#if mode === 'regular'}
          <span class="text-lg font-bold">Time: {formatTime(timeRemaining)}</span>
        {:else if mode === 'speedrun'}
          <span class="text-lg font-bold">Time: {formatElapsedTime(Date.now() - startTime)}</span>
        {/if}
      </div>
    </div>
    
    <div class="my-8 rounded-lg border border-border bg-card p-6 shadow-md">
      <div class="mb-2 text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {mode === 'endless' ? 'Endless' : questions.length}</div>
      <h3 class="mb-4 text-xl font-bold">{getCurrentQuestion().question}</h3>
      
      <div class="mt-6 space-y-3">
        {#each getCurrentQuestion().answers as answer, i}
          <button
            class="w-full rounded-md border px-4 py-2 text-left transition-colors {selectedAnswerIndex === i 
              ? (answer.isCorrect ? 'bg-green-100 border-green-500 dark:bg-green-900 dark:border-green-600' : 'bg-red-100 border-red-500 dark:bg-red-900 dark:border-red-600') 
              : 'border-border hover:bg-muted'}"
            on:click={() => selectAnswer(i)}
            disabled={selectedAnswerIndex !== null}
          >
            {answer.text}
          </button>
        {/each}
      </div>
      
      {#if lastAnswerCorrect !== null}
        <div class="mt-4 text-center font-semibold {lastAnswerCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
          {lastAnswerCorrect ? 'Correct!' : 'Incorrect!'}
        </div>
      {/if}
    </div>
  </div>
{:else if isQuizFinished}
  <div class="mx-auto max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-sm">
    <h2 class="mb-6 text-3xl font-bold">Quiz Finished!</h2>
    
    <div class="mb-6 text-xl">
      Your score: <span class="font-bold">{score}</span> / {mode === 'endless' ? currentQuestionIndex + 1 : questions.length}
    </div>
    
    {#if mode === 'speedrun'}
      <div class="mb-6">
        Time taken: <span class="font-bold">{formatElapsedTime(endTime - startTime)}</span>
      </div>
    {/if}
    
    <div class="mt-8 flex justify-center space-x-4">
      <a href="/" class="rounded-md border border-border bg-card px-4 py-2 transition-colors hover:bg-muted">
        Home
      </a>
      <a href="/scores" class="rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90">
        View Scores
      </a>
    </div>
  </div>
{:else}
  <div class="flex min-h-[50vh] items-center justify-center">
    <p class="text-lg">Loading quiz questions...</p>
  </div>
{/if}
