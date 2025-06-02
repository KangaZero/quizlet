<script lang="ts">
	import { browser } from '$app/environment';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { toast } from '$lib/components/ui/toast';
	import { theme, userName, fontStyle } from '$lib/stores';
	import { getQuestions, getScores, saveUserSettings } from '$lib/localStorage';

	let nameInput = $userName;
	function handleSaveSettings() {
		userName.set(nameInput);
		saveUserSettings({ userName: nameInput, theme: $theme });
		if (browser) {
			toast.success('Settings saved successfully!');
		}
	}

	function toggleTheme() {
		theme.update((currentTheme) => {
			const newTheme = currentTheme === 'light' ? 'dark' : 'light';
			saveUserSettings({ userName: $userName, theme: newTheme });
			if (browser) {
				toast.success(`Theme changed to ${newTheme}!`);
			}
			return newTheme;
		});
	}

	function toggleFont() {
		fontStyle.update((currentFont) => {
			const newFont = currentFont === 'normal' ? 'comic' : 'normal';

			// Save to localStorage - you'll need to update your saveUserSettings function
			saveUserSettings({
				userName: $userName,
				theme: $theme,
				fontStyle: newFont
			});

			// Apply the font change
			if (browser && document.body) {
				if (newFont === 'comic') {
					document.body.classList.add('comic-font');
				} else {
					document.body.classList.remove('comic-font');
				}
			}

			if (browser) {
				toast.success(`Font changed to ${newFont === 'comic' ? 'Comic Sans' : 'Normal'}!`);
			}

			return newFont;
		});
	}

	function resetQuizData() {
		localStorage.removeItem('quizQuestions');
		localStorage.removeItem('quizScores');
		if (browser) {
			toast.success('All quiz data has been reset!');
		}
	}

	$: questionCount = getQuestions().length;
	$: scoreCount = getScores().length;
</script>

<AlertDialog.Root>
	<h1 class="mb-6 text-2xl font-bold">Settings</h1>
	<div class="grid gap-6 sm:grid-cols-2">
		<div class="border-border bg-card rounded-lg border p-6 shadow-sm">
			<h2 class="mb-4 text-xl font-semibold">User Settings</h2>

			<div class="mb-4">
				<label class="mb-2 block text-sm font-medium" for="userName">Your Name</label>
				<input
					type="text"
					id="userName"
					class="border-input bg-background w-full rounded-md border px-3 py-2"
					placeholder="Enter your name"
					bind:value={nameInput}
				/>
				<p class="text-muted-foreground mt-1 text-sm">This will appear on your quiz scores</p>
			</div>

			<button
				class="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md border px-4 py-2 transition-colors hover:scale-105 active:scale-95"
				onclick={handleSaveSettings}
			>
				Save Settings
			</button>
		</div>

		<div class="border-border bg-card rounded-lg border p-6 shadow-sm">
			<h2 class="mb-4 text-xl font-semibold">Appearance</h2>

			<div class="mb-4">
				<label class="flex items-center justify-between">
					<span>Dark Mode</span>
					<button
						class="relative inline-flex h-6 w-11 items-center rounded-full border bg-slate-400 transition-colors dark:bg-slate-800 {$theme ===
						'dark'
							? 'bg-primary'
							: ''}"
						onclick={toggleTheme}
					>
						<span class="sr-only">Toggle Dark Mode</span>
						<span
							class="inline-block h-5 w-5 transform rounded-full bg-white transition-transform {$theme ===
							'dark'
								? 'translate-x-6'
								: 'translate-x-1'}"
						></span>
					</button>
				</label>
				<label class="mt-6 flex items-center justify-between">
					<span>Spice it up</span>
					<button
						class="relative inline-flex h-6 w-11 items-center rounded-full border bg-slate-400 transition-colors dark:bg-slate-800 {$fontStyle ===
						'comic'
							? 'bg-primary'
							: ''}"
						onclick={toggleFont}
					>
						<span class="sr-only">Toggle Font Style</span>
						<span
							class="inline-block h-5 w-5 transform rounded-full bg-white transition-transform {$fontStyle ===
							'comic'
								? 'translate-x-6'
								: 'translate-x-1'}"
						></span>
					</button>
				</label>
			</div>
		</div>
	</div>

	<div class="border-border bg-card mt-6 rounded-lg border p-6 shadow-sm">
		<h2 class="mb-4 text-xl font-semibold">Quiz Data</h2>

		<div class="grid gap-4 sm:grid-cols-2">
			<div>
				<h3 class="text-lg font-medium">Questions</h3>
				<p class="text-muted-foreground">
					You have {questionCount} question{questionCount === 1 ? '' : 's'} saved
				</p>
			</div>

			<div>
				<h3 class="text-lg font-medium">Scores</h3>
				<p class="text-muted-foreground">
					You have {scoreCount} score record{scoreCount === 1 ? '' : 's'} saved
				</p>
			</div>
		</div>

		<div class="border-border mt-6 border-t pt-4">
			<AlertDialog.Trigger>Reset All Quiz Data</AlertDialog.Trigger>
		</div>

		<AlertDialog.Trigger class="text-sm font-bold text-red-600 hover:underline dark:text-red-400"
			>Reset</AlertDialog.Trigger
		>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
				<AlertDialog.Description>
					This action cannot be undone. This will permanently delete all your questions and scores.
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel class="hover:scale-105 active:scale-95">Cancel</AlertDialog.Cancel>
				<AlertDialog.Action
					onclick={resetQuizData}
					class="text-sm text-red-600 hover:underline dark:text-red-400"
					>Continue</AlertDialog.Action
				>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</div>
</AlertDialog.Root>
