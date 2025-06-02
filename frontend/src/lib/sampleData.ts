import { getQuestions } from './localStorage';
// import type { QuizQuestion } from './types';

/**
 * Initializes the quiz with sample questions if no questions exist yet
 */
export function initSampleQuestions(): void {
	const existingQuestions = getQuestions();
	console.log(existingQuestions);
	// if (existingQuestions.length === 0) {
	//   const sampleQuestions: Omit<QuizQuestion, 'id' | 'createdAt'>[] = [
	//     {
	//       question: 'What is the capital of France?',
	//       answers: [
	//         { text: 'Paris', isCorrect: true },
	//         { text: 'London', isCorrect: false },
	//         { text: 'Berlin', isCorrect: false },
	//         { text: 'Madrid', isCorrect: false }
	//       ]
	//     },
	//     {
	//       question: 'Which planet is known as the Red Planet?',
	//       answers: [
	//         { text: 'Earth', isCorrect: false },
	//         { text: 'Mars', isCorrect: true },
	//         { text: 'Jupiter', isCorrect: false },
	//         { text: 'Venus', isCorrect: false }
	//       ]
	//     },
	//     {
	//       question: 'What is the largest ocean on Earth?',
	//       answers: [
	//         { text: 'Atlantic Ocean', isCorrect: false },
	//         { text: 'Indian Ocean', isCorrect: false },
	//         { text: 'Arctic Ocean', isCorrect: false },
	//         { text: 'Pacific Ocean', isCorrect: true }
	//       ]
	//     },
	//     {
	//       question: 'Who wrote "Romeo and Juliet"?',
	//       answers: [
	//         { text: 'Charles Dickens', isCorrect: false },
	//         { text: 'William Shakespeare', isCorrect: true },
	//         { text: 'Jane Austen', isCorrect: false },
	//         { text: 'Mark Twain', isCorrect: false }
	//       ]
	//     },
	//     {
	//       question: 'Which element has the chemical symbol "O"?',
	//       answers: [
	//         { text: 'Gold', isCorrect: false },
	//         { text: 'Oxygen', isCorrect: true },
	//         { text: 'Iron', isCorrect: false },
	//         { text: 'Osmium', isCorrect: false }
	//       ]
	//     },
	//     {
	//       question: 'What year did World War II end?',
	//       answers: [
	//         { text: '1943', isCorrect: false },
	//         { text: '1944', isCorrect: false },
	//         { text: '1945', isCorrect: true },
	//         { text: '1946', isCorrect: false }
	//       ]
	//     },
	//     {
	//       question: 'Which country is home to the kangaroo?',
	//       answers: [
	//         { text: 'New Zealand', isCorrect: false },
	//         { text: 'South Africa', isCorrect: false },
	//         { text: 'Australia', isCorrect: true },
	//         { text: 'Brazil', isCorrect: false }
	//       ]
	//     },
	//     {
	//       question: 'What is the largest organ in the human body?',
	//       answers: [
	//         { text: 'Brain', isCorrect: false },
	//         { text: 'Liver', isCorrect: false },
	//         { text: 'Skin', isCorrect: true },
	//         { text: 'Heart', isCorrect: false }
	//       ]
	//     },
	//     {
	//       question: 'Who painted the Mona Lisa?',
	//       answers: [
	//         { text: 'Pablo Picasso', isCorrect: false },
	//         { text: 'Vincent van Gogh', isCorrect: false },
	//         { text: 'Leonardo da Vinci', isCorrect: true },
	//         { text: 'Michelangelo', isCorrect: false }
	//       ]
	//     },
	//     {
	//       question: 'What is the hardest natural substance on Earth?',
	//       answers: [
	//         { text: 'Ruby', isCorrect: false },
	//         { text: 'Diamond', isCorrect: true },
	//         { text: 'Platinum', isCorrect: false },
	//         { text: 'Titanium', isCorrect: false }
	//       ]
	//     }
	//   ];

	//   // Add the sample questions to localStorage
	//   sampleQuestions.forEach((question, index) => {
	//     saveQuestion({
	//       ...question,
	//       id: `sample_${index + 1}`,
	//       createdAt: Date.now() - (index * 100000) // Stagger creation times
	//     });
	//   });

	//   console.log('Sample quiz questions initialized');
	// }
}
