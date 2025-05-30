<script lang="ts">	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { userName } from '$lib/stores';
	import { getRandomQuestions, saveScore, updateQuestionStats } from '$lib/localStorage';
	import type { QuizQuestion } from '$lib/types';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';

	let showNoQuestionsDialog = false;
	let showNotEnoughQuestionsDialog = false;
	let availableQuestionCount = 0;
	let requestedQuestionCount = 0;
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
	let elapsedTimeTimer: ReturnType<typeof setInterval>;
	let isCustomSetup = mode === 'custom';
	let isQuizStarted = false;
	let isQuizFinished = false;
	let lastAnswerCorrect: boolean | null = null;
	let selectedAnswerIndex: number | null = null;
	let selectedAnswers: number[] = [];
	let elapsedTime = 0;

	function startElapsedTimeTracking() {
		if (elapsedTimeTimer) clearInterval(elapsedTimeTimer);

		elapsedTimeTimer = setInterval(() => {
			elapsedTime = Date.now() - startTime;
		}, 1000);
	}

	function stopElapsedTimeTracking() {
		if (elapsedTimeTimer) {
			clearInterval(elapsedTimeTimer);
		}
	}

	// Watch for quiz state changes and start/stop time tracking
	$: if (isQuizStarted && !isQuizFinished && startTime) {
		startElapsedTimeTracking();
	} else {
		stopElapsedTimeTracking();
	}

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
			if (elapsedTimeTimer) clearInterval(elapsedTimeTimer);
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
			// Show the dialog instead of using alert()
			showNoQuestionsDialog = true;
			return;
		}

		// If we don't have enough questions for the selected mode, show a warning
		if (allQuestions.length < count && !allowRepeats) {
			availableQuestionCount = allQuestions.length;
			requestedQuestionCount = count;
			showNotEnoughQuestionsDialog = true;
			return; // Don't start quiz yet
		}

		// We have enough questions or repeats are allowed
		questions = allQuestions;
		initQuiz();
	}

	function handleGoToEdit() {
		showNoQuestionsDialog = false;
		goto('/edit');
	}

	function handleCancelNoQuestions() {
		showNoQuestionsDialog = false;
		goto('/');
	}
	function initQuiz() {
		// Reset quiz state
		currentQuestionIndex = 0;
		score = 0;
		lives = 3;
		lastAnswerCorrect = null;
		selectedAnswerIndex = null;
		selectedAnswers = [];
		isQuizStarted = true;
		isQuizFinished = false;
		startTime = Date.now();
		
		// Randomize the order of answers for all questions
		questions = randomizeAnswerOrder(questions);

		// Start timer for regular or speedrun mode
		if (mode === 'regular') {
			timeRemaining = 300; // 5 minutes
			startTimer();
		}

		// Start elapsed time tracker for all modes
		if (elapsedTimeTimer) clearInterval(elapsedTimeTimer);
		elapsedTime = 0;
		elapsedTimeTimer = setInterval(() => {
			elapsedTime = Date.now() - startTime;
		}, 1000);
	}

	function handleContinueWithFewerQuestions() {
		const allQuestions = getRandomQuestions(availableQuestionCount, false);
		questions = allQuestions;
		showNotEnoughQuestionsDialog = false;
		initQuiz();
	}

	// Handle dialog cancellation
	function handleCancelQuiz() {
		showNotEnoughQuestionsDialog = false;
		goto('/');
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
  // Get the current question and check how many correct answers it has
  const currentQuestion = questions[currentQuestionIndex];
  const correctAnswersCount = currentQuestion.answers.filter((a) => a.isCorrect).length;

  // For speedrun mode, handle multiple answers immediately
  if (mode === 'speedrun') {
    if (correctAnswersCount === 1) {
      // For single correct answer questions
      selectedAnswerIndex = answerIndex;
      const isCorrect = currentQuestion.answers[answerIndex].isCorrect;

      // Update question statistics
      updateQuestionStats(currentQuestion.id, isCorrect);

      if (isCorrect) {
        score++;
      }

      // Immediately move to next question in speedrun mode
      moveToNextQuestion();
      return;
    } else {
      // For multiple correct answers in speedrun mode
      // Toggle the selection
      if (selectedAnswers.includes(answerIndex)) {
        selectedAnswers = selectedAnswers.filter((i) => i !== answerIndex);
      } else {
        selectedAnswers = [...selectedAnswers, answerIndex];
      }

      // If all correct answers are selected (and only correct ones), move to next question
      const correctAnswerIndices = currentQuestion.answers
        .map((answer, index) => (answer.isCorrect ? index : -1))
        .filter((index) => index !== -1);
        
      const allCorrectSelected = correctAnswerIndices.every(index => selectedAnswers.includes(index));
      const noIncorrectSelected = selectedAnswers.every(index => correctAnswerIndices.includes(index));
      
      if (allCorrectSelected && noIncorrectSelected) {
        // All correct answers are selected and no incorrect ones
        updateQuestionStats(currentQuestion.id, true);
        score++;
        moveToNextQuestion();
      } else if (selectedAnswers.length >= correctAnswersCount) {
        // User has selected enough answers, but they're wrong
        updateQuestionStats(currentQuestion.id, false);
        moveToNextQuestion();
      }
      return;
    }
  }

  // Regular behavior for other modes
  
  // If we already have an answer selected and this is a single-answer question, return
  if (correctAnswersCount === 1 && selectedAnswerIndex !== null) return;

  // For multiple correct answers, toggle selection
  if (correctAnswersCount > 1) {
    // If answer is already selected, deselect it
    if (selectedAnswers.includes(answerIndex)) {
      selectedAnswers = selectedAnswers.filter((i) => i !== answerIndex);
    } else {
      // Otherwise, add it to the selected answers
      selectedAnswers = [...selectedAnswers, answerIndex];
    }

    // Don't proceed to automatic next question yet for multiple answer questions
    return;
  }
  
  // For single correct answer questions, continue with original behavior
  selectedAnswerIndex = answerIndex;
  const isCorrect = currentQuestion.answers[answerIndex].isCorrect;

  // Update question statistics
  updateQuestionStats(currentQuestion.id, isCorrect);

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

  const delayBeforeNextQuestion = mode === 'speedrun' ? 0 : 1500;

  // Move to next question after a short delay
  setTimeout(() => {
    selectedAnswerIndex = null;
    lastAnswerCorrect = null;
    selectedAnswers = [];

    // Don't increment in endless mode if out of lives
    if (!(mode === 'endless' && lives <= 0)) {
      moveToNextQuestion();
    }
  }, delayBeforeNextQuestion);
}

	// Handle submission for multiple correct answer questions
	function submitMultipleAnswers() {
		const currentQuestion = questions[currentQuestionIndex];
		const correctAnswerIndices = currentQuestion.answers
			.map((answer, index) => (answer.isCorrect ? index : -1))
			.filter((index) => index !== -1);
		// Check if selected answers match exactly with correct answers
		const isCorrect =
			selectedAnswers.length === correctAnswerIndices.length &&
			correctAnswerIndices.every((index) => selectedAnswers.includes(index));
			
		// Update question statistics
		updateQuestionStats(currentQuestion.id, isCorrect);

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
			selectedAnswers = [];

			// Don't increment in endless mode if out of lives
			if (!(mode === 'endless' && lives <= 0)) {
				moveToNextQuestion();
			}
		}, 1500);
	}

	function moveToNextQuestion() {
		if (currentQuestionIndex < questions.length - 1) {
			currentQuestionIndex++;
			// Reset selections when moving between questions
			selectedAnswerIndex = null;
			selectedAnswers = [];
			lastAnswerCorrect = null;
		} else {
			finishQuiz();
		}
	}

	function moveToPreviousQuestion() {
		if (currentQuestionIndex > 0) {
			currentQuestionIndex--;
			// Reset selections when moving between questions
			selectedAnswerIndex = null;
			selectedAnswers = [];
			lastAnswerCorrect = null;
		}
	}

	function moveToQuestion(index: number) {
		if (index >= 0 && index < questions.length) {
			currentQuestionIndex = index;
			// Reset selections when moving between questions
			selectedAnswerIndex = null;
			selectedAnswers = [];
			lastAnswerCorrect = null;
		}
	}
	function finishQuiz() {
		isQuizFinished = true;
		if (timer) clearInterval(timer);
		if (elapsedTimeTimer) clearInterval(elapsedTimeTimer);
		endTime = Date.now();

		// Save score to localStorage
		const timeTaken = endTime - startTime;
		const quizId = `quiz_${Date.now()}`;

		let totalQuestions = currentQuestionIndex + 1;
		if (mode === 'regular') totalQuestions = 10;
		if (mode === 'speedrun') totalQuestions = 20;

		saveScore({
			id: quizId,
			playerName: $userName,
			mode: mode as 'regular' | 'custom' | 'endless' | 'speedrun',
			score,
			totalQuestions,
			timeTaken,
			date: Date.now(),
			customSettings:
				mode === 'custom'
					? {
							questionCount: customQuestionCount,
							allowRepeats: customAllowRepeats
						}
					: undefined
		});
	}

	function getCurrentQuestion() {
		return questions[currentQuestionIndex];
	}

	// Function to randomize the order of answers for all questions
	function randomizeAnswerOrder(questionList: QuizQuestion[]): QuizQuestion[] {
		return questionList.map(question => {
			// Create a deep copy of the question to avoid modifying the original
			const questionCopy = JSON.parse(JSON.stringify(question));
			
			// Shuffle the answers array
			const shuffledAnswers = [...questionCopy.answers].sort(() => Math.random() - 0.5);
			questionCopy.answers = shuffledAnswers;
			
			return questionCopy;
		});
	}
</script>

{#if !isQuizStarted && mode === 'custom'}
	<div class="border-border bg-card mx-auto max-w-md rounded-lg border p-6 shadow-sm">
		<h2 class="mb-6 text-2xl font-bold">Custom Quiz Settings</h2>

		<div class="mb-4">
			<label class="mb-2 block text-sm font-medium" for="questionCount">Number of Questions</label>
			<input
				type="number"
				id="questionCount"
				min="1"
				max="100"
				class="border-input bg-background w-full rounded-md border px-3 py-2"
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
			class="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md border px-4 py-2 transition-colors hover:scale-105 active:scale-95"
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
					<span class="flex items-center text-lg font-bold">
						Lives:
						{#each Array(3) as _, i}
							<span
								class="ml-1 inline-block {i < lives
									? 'animate-pulse text-red-600 dark:text-red-500'
									: 'text-gray-300 dark:text-gray-600'}"
							>
								❤️
							</span>
						{/each}
					</span>
				{/if}
			</div>

			<div class="flex items-center gap-4">
				<!-- Show elapsed time for all modes -->
				<span class="text-sm font-medium">
					Elapsed time: {formatElapsedTime(elapsedTime)}
				</span>

				<!-- Show countdown timer for regular mode -->
				{#if mode === 'regular'}
					<span class="text-lg font-bold">Remaining: {formatTime(timeRemaining)}</span>
				{/if}
			</div>
		</div>
		<div class="border-border bg-card my-8 rounded-lg border p-6 shadow-md">
			<div class="mb-2 flex flex-wrap items-center justify-between">
				<div class="text-muted-foreground text-sm">
					Question {currentQuestionIndex + 1} of {mode === 'endless' ? 'Endless' : questions.length}
				</div>
			</div>

			<h3 class="mb-4 text-xl font-bold">{getCurrentQuestion().question}</h3>

			<!-- Display the number of correct answers required -->
			<div class="text-muted-foreground mb-2 text-sm">
				Correct answers required: {getCurrentQuestion().answers.filter((a) => a.isCorrect).length}
			</div>
			<div class="mt-6 space-y-3">
				{#each getCurrentQuestion().answers as answer, i}
					<button
						class="w-full rounded-md border px-4 py-2 text-left transition-colors
              {getCurrentQuestion().answers.filter((a) => a.isCorrect).length > 1
							? selectedAnswers.includes(i)
								? 'border-blue-500 bg-blue-100 dark:border-blue-600 dark:bg-blue-900/40'
								: 'border-border hover:bg-muted'
							: selectedAnswerIndex === i
								? answer.isCorrect
									? 'border-green-500 bg-green-100 dark:border-green-600 dark:bg-green-900'
									: 'border-red-500 bg-red-100 dark:border-red-600 dark:bg-red-900'
								: 'border-border hover:bg-muted'}"
						on:click={() => selectAnswer(i)}
						disabled={getCurrentQuestion().answers.filter((a) => a.isCorrect).length === 1 &&
							selectedAnswerIndex !== null}
					>
						{answer.text}
						{#if getCurrentQuestion().answers.filter((a) => a.isCorrect).length > 1 && selectedAnswers.includes(i)}
							<span class="float-right">✓</span>
						{/if}
					</button>
				{/each}
			</div>

			{#if getCurrentQuestion().answers.filter((a) => a.isCorrect).length > 1 && selectedAnswers.length > 0 && mode !== 'speedrun'}
				<div class="mt-4 text-center">
					<button
						class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md border px-4 py-2 transition-colors hover:scale-105 active:scale-95"
						on:click={submitMultipleAnswers}
					>
						Submit Answers
					</button>
				</div>
			{/if}

			{#if lastAnswerCorrect !== null}
				<div
					class="mt-4 text-center font-semibold {lastAnswerCorrect
						? 'text-green-600 dark:text-green-400'
						: 'text-red-600 dark:text-red-400'}"
				>
					{lastAnswerCorrect ? 'Correct!' : 'Incorrect!'}
				</div>
			{/if}

			<!-- Question Navigation -->
			<div class="border-border mt-6 border-t pt-4">
				<div class="flex justify-between gap-2">
					<button
						class="rounded-md border px-3 py-1 text-sm disabled:opacity-50 {currentQuestionIndex !==
							0 &&
						!selectedAnswerIndex &&
						!selectedAnswers.length &&
						lastAnswerCorrect === null
							? 'hover:scale-105 active:scale-95'
							: ''}"
						on:click={moveToPreviousQuestion}
						disabled={currentQuestionIndex === 0 ||
							selectedAnswerIndex !== null ||
							selectedAnswers.length > 0 ||
							lastAnswerCorrect !== null}
					>
						Previous
					</button>

					<div class="flex flex-wrap justify-center gap-2">
						{#if questions.length <= 10}
							<!-- Show all buttons if 10 or fewer questions -->
							{#each questions as _, i}
								<button
									class="h-8 w-8 rounded-full text-sm
                    {currentQuestionIndex === i
										? 'bg-primary text-primary-foreground'
										: 'bg-muted hover:bg-muted/80'}"
									on:click={() => moveToQuestion(i)}
									disabled={selectedAnswerIndex !== null ||
										selectedAnswers.length > 0 ||
										lastAnswerCorrect !== null}
								>
									{i + 1}
								</button>
							{/each}
						{:else}
							<!-- Show pagination for larger quizzes -->
							<!-- Always show first question -->
							<button
								class="h-8 w-8 rounded-full text-sm
                  {currentQuestionIndex === 0
									? 'bg-primary text-primary-foreground'
									: 'bg-muted hover:bg-muted/80'}"
								on:click={() => moveToQuestion(0)}
								disabled={selectedAnswerIndex !== null ||
									selectedAnswers.length > 0 ||
									lastAnswerCorrect !== null}
							>
								1
							</button>

							<!-- Show ellipsis if not near the start -->
							{#if currentQuestionIndex > 3}
								<span class="self-center">...</span>
							{/if}

							<!-- Show a window of questions around the current question -->
							{#each questions as _, i}
								{#if i !== 0 && i !== questions.length - 1 && i >= currentQuestionIndex - 2 && i <= currentQuestionIndex + 2}
									<button
										class="h-8 w-8 rounded-full text-sm
                      {currentQuestionIndex === i
											? 'font-bold text-green-400 dark:text-green-600 underline'
											: 'bg-muted hover:bg-muted/80'}"
										on:click={() => moveToQuestion(i)}
										disabled={selectedAnswerIndex !== null ||
											selectedAnswers.length > 0 ||
											lastAnswerCorrect !== null}
									>
										{i + 1}
									</button>
								{/if}
							{/each}

							<!-- Show ellipsis if not near the end -->
							{#if currentQuestionIndex < questions.length - 4}
								<span class="self-center">...</span>
							{/if}

							<!-- Always show last question -->
							<button
								class="h-8 w-8 rounded-full text-sm
                  {currentQuestionIndex === questions.length - 1
									? 'bg-primary text-primary-foreground'
									: 'bg-muted hover:bg-muted/80'}"
								on:click={() => moveToQuestion(questions.length - 1)}
								disabled={selectedAnswerIndex !== null ||
									selectedAnswers.length > 0 ||
									lastAnswerCorrect !== null}
							>
								{questions.length}
							</button>
						{/if}
					</div>

					<button
						class="rounded-md border px-3 py-1 text-sm disabled:opacity-50 {!(
							currentQuestionIndex === questions.length - 1 ||
							selectedAnswerIndex !== null ||
							selectedAnswers.length > 0 ||
						 lastAnswerCorrect !== null
						)
							? 'hover:scale-105 active:scale-95'
							: ''}"
						on:click={moveToNextQuestion}
						disabled={currentQuestionIndex === questions.length - 1 ||
							selectedAnswerIndex !== null ||
							selectedAnswers.length > 0 ||
							lastAnswerCorrect !== null}
					>
						Next
					</button>
				</div>
			</div>
		</div>
	</div>
{:else if isQuizFinished}
	<div class="border-border bg-card mx-auto max-w-md rounded-lg border p-8 text-center shadow-sm">
		<h2 class="mb-6 text-3xl font-bold">Quiz Finished!</h2>

		<div class="mb-6 text-xl">
			Your score: <span class="font-bold">{score}</span> / {mode === 'endless'
				? currentQuestionIndex + 1
				: questions.length}
		</div>

		{#if mode === 'speedrun'}
			<div class="mb-6">
				Time taken: <span class="font-bold">{formatElapsedTime(endTime - startTime)}</span>
			</div>
		{/if}

		<div class="mt-8 flex justify-center space-x-4">
			<a
				href="/"
				class="border-border bg-card hover:bg-muted rounded-md border px-4 py-2 transition-colors"
			>
				Home
			</a>
			<a
				href="/scores"
				class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 transition-colors"
			>
				View Scores
			</a>
		</div>
	</div>
{:else}
	<div class="flex min-h-[50vh] items-center justify-center">
		<p class="text-lg">Loading quiz questions...</p>
	</div>
{/if}
<AlertDialog.Root bind:open={showNotEnoughQuestionsDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Not Enough Questions</AlertDialog.Title>
			<AlertDialog.Description>
				There are only {availableQuestionCount} questions available, which is fewer than the {requestedQuestionCount}
				requested. Would you like to continue anyway?
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel on:click={handleCancelQuiz} class="hover:scale-105 active:scale-95"
				>Cancel</AlertDialog.Cancel
			>
			<AlertDialog.Action
				on:click={handleContinueWithFewerQuestions}
				class="text-sm text-red-600 hover:underline dark:text-red-400">Continue</AlertDialog.Action
			>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<AlertDialog.Root bind:open={showNoQuestionsDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>No Questions Available</AlertDialog.Title>
			<AlertDialog.Description>
				There are no quiz questions available. You need to add some questions before you can take a
				quiz.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel on:click={handleCancelNoQuestions} class="hover:scale-105 active:scale-95">Cancel</AlertDialog.Cancel>
			<AlertDialog.Action on:click={handleGoToEdit} class="text-sm text-green-400 hover:underline dark:text-green-600">Add Questions</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
