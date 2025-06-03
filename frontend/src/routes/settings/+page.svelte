<script lang="ts">
	import { browser } from '$app/environment';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { toast } from '$lib/components/ui/toast';
	import { theme, userName, fontStyle, language } from '$lib/stores';
	import { getQuestions, getScores, saveUserSettings } from '$lib/localStorage';
	import { _ } from '$lib/i18n';

	let nameInput = $userName;
	let selectedLanguage = $language;
	const availableLanguages = [
		{ value: 'en', label: 'English' },
		{ value: 'ja', label: '日本語' }
	];

	function handleSaveSettings() {
		userName.set(nameInput);
		language.set(selectedLanguage);
		saveUserSettings({
			userName: nameInput,
			theme: $theme,
			fontStyle: $fontStyle,
			language: selectedLanguage
		});
		if (browser) {
			toast.success($_('settings.saveSuccess'));
		}
	}

	function toggleTheme() {
		theme.update((currentTheme) => {
			const newTheme = currentTheme === 'light' ? 'dark' : 'light';
			saveUserSettings({ userName: $userName, theme: newTheme });
			if (browser) {
				toast.success($_('settings.themeSuccess', { values: { theme: newTheme } }));
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
				toast.success(
					$_('settings.fontSuccess', {
						values: { font: newFont === 'comic' ? 'Comic Sans' : 'Normal' }
					})
				);
			}

			return newFont;
		});
	}

	function resetQuizData() {
		localStorage.removeItem('quizQuestions');
		localStorage.removeItem('quizScores');
		if (browser) {
			toast.success($_('settings.dataResetSuccess'));
		}
	}

	$: questionCount = getQuestions().length;
	$: scoreCount = getScores().length;
</script>

<AlertDialog.Root>
	<h1 class="mb-6 text-2xl font-bold">{$_('settings.title')}</h1>
	<div class="grid gap-6 sm:grid-cols-2">
		<div class="border-border bg-card rounded-lg border p-6 shadow-sm">
			<h2 class="mb-4 text-xl font-semibold">{$_('settings.userSettings')}</h2>

			<div class="mb-4">
				<label class="mb-2 block text-sm font-medium" for="userName"
					>{$_('settings.username')}</label
				>
				<input
					type="text"
					id="userName"
					class="border-input bg-background w-full rounded-md border px-3 py-2"
					placeholder={$_('settings.usernamePlaceholder')}
					bind:value={nameInput}
				/>
				<p class="text-muted-foreground mt-1 text-sm">{$_('settings.usernameDescription')}</p>
			</div>
			<label class="my-4 flex flex-col">
				<span>{$_('settings.language')}</span>
				<select
					class="border-input mt-2 rounded-md border px-3 py-2 dark:bg-slate-600"
					bind:value={selectedLanguage}
				>
					{#each availableLanguages as lang}
						<option value={lang.value}>{lang.label}</option>
					{/each}
				</select>
			</label>

			<button
				class="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md border px-4 py-2 transition-colors hover:scale-105 active:scale-95"
				onclick={handleSaveSettings}
			>
				{$_('settings.saveButton')}
			</button>
		</div>

		<div class="border-border bg-card rounded-lg border p-6 shadow-sm">
			<h2 class="mb-4 text-xl font-semibold">{$_('settings.appearance')}</h2>

			<div class="mb-4">
				<label class="flex items-center justify-between">
					<span>{$_('settings.darkMode')}</span>
					<button
						class="relative inline-flex h-6 w-11 items-center rounded-full border bg-slate-400 transition-colors dark:bg-slate-800 {$theme ===
						'dark'
							? 'bg-primary'
							: ''}"
						onclick={toggleTheme}
					>
						<span class="sr-only">{$_('settings.toggleDarkMode')}</span>
						<span
							class="inline-block h-5 w-5 transform rounded-full bg-white transition-transform {$theme ===
							'dark'
								? 'translate-x-6'
								: 'translate-x-1'}"
						></span>
					</button>
				</label>
				<label class="mt-6 flex items-center justify-between">
					<span>{$_('settings.fontStyle')}</span>
					<button
						class="relative inline-flex h-6 w-11 items-center rounded-full border bg-slate-400 transition-colors dark:bg-slate-800 {$fontStyle ===
						'comic'
							? 'bg-primary'
							: ''}"
						onclick={toggleFont}
					>
						<span class="sr-only">{$_('settings.toggleFontStyle')}</span>
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
		<h2 class="mb-4 text-xl font-semibold">{$_('settings.quizData')}</h2>

		<div class="grid gap-4 sm:grid-cols-2">
			<div>
				<h3 class="text-lg font-medium">{$_('common.question', { values: { count: 2 } })}</h3>
				<p class="text-muted-foreground">
					{$_('settings.questionCountSaved', { values: { count: questionCount } })}
				</p>
			</div>

			<div>
				<h3 class="text-lg font-medium">{$_('common.score', { values: { count: 2 } })}</h3>
				<p class="text-muted-foreground">
					{$_('settings.scoreCountSaved', { values: { count: scoreCount } })}
				</p>
			</div>
		</div>

		<div class="border-border mt-6 border-t pt-4">
			<AlertDialog.Trigger>{$_('settings.resetAllTitle')}</AlertDialog.Trigger>
		</div>

		<AlertDialog.Trigger class="text-sm font-bold text-red-600 hover:underline dark:text-red-400"
			>{$_('alertDialog.reset')}</AlertDialog.Trigger
		>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>{$_('alertDialog.title')}</AlertDialog.Title>
				<AlertDialog.Description>
					{$_('alertDialog.message')}
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel class="hover:scale-105 active:scale-95"
					>{$_('alertDialog.cancel')}</AlertDialog.Cancel
				>
				<AlertDialog.Action
					onclick={resetQuizData}
					class="text-sm text-red-600 hover:underline dark:text-red-400"
					>{$_('alertDialog.confirm')}</AlertDialog.Action
				>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</div>
</AlertDialog.Root>
