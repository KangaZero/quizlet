import { writable } from 'svelte/store';

// Theme store (light/dark) with default value
export const theme = writable<'light' | 'dark'>('light');

// User name store with default value
export const userName = writable('');