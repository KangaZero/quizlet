<script lang="ts">
  import { theme, userName } from '$lib/stores.js';
  import { getQuestions, getScores } from '$lib/localStorage';
  
  let nameInput = $userName;
  
  function handleSaveSettings() {
    userName.set(nameInput);
    localStorage.setItem('userName', nameInput);
  }
  
  function toggleTheme() {
    theme.update(currentTheme => {
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('quizTheme', newTheme);
      return newTheme;
    });
  }
  
  function resetQuizData() {
    if (confirm('This will delete all questions and scores. Are you sure?')) {
      localStorage.removeItem('quizQuestions');
      localStorage.removeItem('quizScores');
      alert('All quiz data has been reset!');
    }
  }
  
  $: questionCount = getQuestions().length;
  $: scoreCount = getScores().length;
</script>

<h1 class="mb-6 text-2xl font-bold">Settings</h1>

<div class="grid gap-6 sm:grid-cols-2">
  <div class="rounded-lg border border-border bg-card p-6 shadow-sm">
    <h2 class="mb-4 text-xl font-semibold">User Settings</h2>
    
    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium" for="userName">Your Name</label>
      <input
        type="text"
        id="userName"
        class="w-full rounded-md border border-input bg-background px-3 py-2"
        placeholder="Enter your name"
        bind:value={nameInput}
      />
      <p class="mt-1 text-sm text-muted-foreground">This will appear on your quiz scores</p>
    </div>
    
    <button
      class="w-full rounded-md bg-primary px-4 py-2 border text-primary-foreground transition-colors hover:bg-primary/90 hover:scale-105 active:scale-95"
      on:click={handleSaveSettings}
    >
      Save Settings
    </button>
  </div>
  
  <div class="rounded-lg border border-border bg-card p-6 shadow-sm">
    <h2 class="mb-4 text-xl font-semibold">Appearance</h2>
    
    <div class="mb-4">
      <label class="flex items-center justify-between">
        <span>Dark Mode</span>
        <button 
          class="relative inline-flex h-6 w-11 items-center border rounded-full bg-muted transition-colors {$theme === 'dark' ? 'bg-primary' : ''}"
          on:click={toggleTheme}
        >
          <span class="sr-only">Toggle Dark Mode</span>
          <span 
            class="inline-block h-5 w-5 transform rounded-full bg-white transition-transform {$theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}"
          ></span>
        </button>
      </label>
    </div>
  </div>
</div>

<div class="mt-6 rounded-lg border border-border bg-card p-6 shadow-sm">
  <h2 class="mb-4 text-xl font-semibold">Quiz Data</h2>
  
  <div class="grid gap-4 sm:grid-cols-2">
    <div>
      <h3 class="text-lg font-medium">Questions</h3>
      <p class="text-muted-foreground">You have {questionCount} question{questionCount === 1 ? '' : 's'} saved</p>
    </div>
    
    <div>
      <h3 class="text-lg font-medium">Scores</h3>
      <p class="text-muted-foreground">You have {scoreCount} score record{scoreCount === 1 ? '' : 's'} saved</p>
    </div>
  </div>
  
  <div class="mt-6 border-t border-border pt-4">
    <button
      class="text-sm text-red-600 hover:underline dark:text-red-400"
      on:click={resetQuizData}
    >
      Reset All Quiz Data
    </button>
  </div>
</div>
