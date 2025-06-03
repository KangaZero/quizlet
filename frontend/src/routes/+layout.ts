import { initI18n } from '$lib/i18n';
import { browser } from '$app/environment';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
  if (browser) {
    // Initialize i18n before anything else
    await initI18n();
  }
  
  return {};
};