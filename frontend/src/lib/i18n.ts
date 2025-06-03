import { browser } from '$app/environment';
import { init, register, locale, _, dictionary, format } from 'svelte-i18n';
import { derived } from 'svelte/store';

// Register locales
register('en', () => import('./locales/en.json'));
register('ja', () => import('./locales/ja.json'));
// Add more languages as needed
// Create an initialized store
export const i18nInitialized = derived(locale, () => true);
// Initialize the i18n library
export function initI18n() {
	  const initPromise = init({
		fallbackLocale: 'en',
		initialLocale: browser ? window.navigator.language.split('-')[0] : 'en',
		formats: {
            time: {
                default: { timeStyle: 'medium' }
            },
			number: {
				default: { style: 'decimal' }
			},
			date: {
				default: { dateStyle: 'medium' }
			}
		},
		warnOnMissingMessages: true,
		handleMissingMessage: ({ locale, id, defaultValue }) => {
			// Return the key if message is missing
			console.warn(`Missing translation: ${id} for locale: ${locale}`);
			return defaultValue || id;
		}
	});

    return initPromise;
}

// Export i18n helpers to use throughout the app
export { _, locale, dictionary, format };
