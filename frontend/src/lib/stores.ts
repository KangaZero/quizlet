import { writable } from 'svelte/store';

// Theme store (light/dark) with default value
export const theme = writable<'light' | 'dark'>('light');

// User name store with default value
export const userName = writable('Guest');

// Boring or gigachad mode font (Comic Sans)
export const fontStyle = writable('normal');

// Language preference
export const language = writable('en');
