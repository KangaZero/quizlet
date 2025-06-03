import { browser } from '$app/environment';
import { init, register, locale, _ } from 'svelte-i18n';

// Register locales
register('en', () => import('./locales/en.json'));
register('ja', () => import('./locales/ja.json'));
// Add more languages as needed

// Initialize the i18n library
export function initI18n() {
	init({
		fallbackLocale: 'en',
		initialLocale: browser ? window.navigator.language.split('-')[0] : 'en'
	});
}

// Export i18n helpers to use throughout the app
export { _, locale };
