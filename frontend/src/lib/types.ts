export interface QuizQuestion {
	id: string;
	question: string;
	answers: {
		text: string;
		isCorrect: boolean;
	}[];
	createdAt: number;
}

export interface QuizScore {
	id: string;
	playerName: string;
	mode: 'regular' | 'endless' | 'custom' | 'speedrun';
	score: number;
	totalQuestions: number;
	timeTaken?: number; // in milliseconds
	date: number;
	customSettings?: {
		questionCount?: number;
		allowRepeats?: boolean;
	};
}
