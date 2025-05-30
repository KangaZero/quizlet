import type { QuizQuestion, QuizScore } from './types';

// Quiz Questions Storage
export const QUESTIONS_KEY = 'quizQuestions';

export function getQuestions(): QuizQuestion[] {
	if (typeof localStorage === 'undefined') return [];

	const items = localStorage.getItem(QUESTIONS_KEY);
	return items ? JSON.parse(items) : [];
}

export function saveQuestion(question: QuizQuestion): void {
	if (typeof localStorage === 'undefined') return;

	const questions = getQuestions();
	questions.push(question);
	localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
}

export function updateQuestion(question: QuizQuestion): void {
	if (typeof localStorage === 'undefined') return;

	const questions = getQuestions();
	const index = questions.findIndex((q) => q.id === question.id);

	if (index !== -1) {
		questions[index] = question;
		localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
	}
}

export function deleteQuestion(id: string): void {
	if (typeof localStorage === 'undefined') return;

	const questions = getQuestions();
	const filteredQuestions = questions.filter((q) => q.id !== id);
	localStorage.setItem(QUESTIONS_KEY, JSON.stringify(filteredQuestions));
}

export function searchQuestions(term: string): QuizQuestion[] {
	const questions = getQuestions();
	if (!term) return questions;

	const lowerTerm = term.toLowerCase();
	return questions.filter(
		(q) =>
			q.id.toLowerCase().includes(lowerTerm) ||
			q.question.toLowerCase().includes(lowerTerm) ||
			q.answers.some((a) => a.text.toLowerCase().includes(lowerTerm))
	);
}

// Quiz Scores Storage
export const SCORES_KEY = 'quizScores';

export function getScores(): QuizScore[] {
	if (typeof localStorage === 'undefined') return [];

	const items = localStorage.getItem(SCORES_KEY);
	return items ? JSON.parse(items) : [];
}

export function saveScore(score: QuizScore): void {
	if (typeof localStorage === 'undefined') return;

	const scores = getScores();
	scores.push(score);
	localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
}

// Get random questions
export function getRandomQuestions(count: number, allowRepeats = false): QuizQuestion[] {
	const allQuestions = getQuestions();

	if (allQuestions.length === 0) {
		return [];
	}

	if (!allowRepeats && count > allQuestions.length) {
		// If we don't allow repeats and count is greater than available questions,
		// return all questions in random order
		return [...allQuestions].sort(() => Math.random() - 0.5);
	}

	const selectedQuestions: QuizQuestion[] = [];

	if (allowRepeats) {
		// With repeats, we can just pick random questions
		for (let i = 0; i < count; i++) {
			const randomIndex = Math.floor(Math.random() * allQuestions.length);
			selectedQuestions.push(allQuestions[randomIndex]);
		}
	} else {
		// Without repeats, we need to keep track of used questions
		const availableQuestions = [...allQuestions];

		for (let i = 0; i < count && availableQuestions.length > 0; i++) {
			const randomIndex = Math.floor(Math.random() * availableQuestions.length);
			selectedQuestions.push(availableQuestions[randomIndex]);
			availableQuestions.splice(randomIndex, 1);
		}
	}

	return selectedQuestions;
}
