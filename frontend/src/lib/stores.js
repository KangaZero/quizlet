import { writable } from 'svelte/store';

// Theme store (light/dark)
export const theme = writable('light');

// User name store
export const userName = writable('');
