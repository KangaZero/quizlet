# Quizlet

Quizlet is a simple web-based quiz application built with SvelteKit. It allows users to take quizzes in various modes, create and manage their own quiz questions, and track their scores.

## Features

- **Multiple Quiz Modes**

  - **Regular Mode**: 10 unique questions with a 5-minute time limit
  - **Endless Mode**: Answer as many questions as possible with 3 lives
  - **Custom Mode**: Set your own number of questions and whether they can repeat
  - **Speedrun Mode**: 50 unique questions with time tracking

- **Question Management**

  - Create, edit, and delete quiz questions
  - Search and filter questions
  - Pagination to handle large collections of questions

- **Score Tracking**

  - View your quiz history
  - Sort scores by date, score, accuracy, or time
  - Filter scores by quiz mode

- **Settings**
  - Set your player name
  - Toggle between light and dark mode
  - Reset all quiz data if needed

## Data Storage

All quiz data (questions and scores) is stored in the browser's localStorage. This means:

- Your data remains private and stays on your device
- No server is required to run the application
- Your data persists between sessions on the same device
- Clearing your browser data will also clear your quiz data

## Getting Started

1. Set your name in the Settings
2. Create some quiz questions in the Edit section (or use the sample questions provided)
3. Go to the Home page and select a quiz mode
4. Start answering questions!

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
