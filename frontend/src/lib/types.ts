export interface QuizQuestion {
	id: string;
	question: string;
	answers: {
		text: string;
		isCorrect: boolean;
	}[];
	createdAt: number;
	updatedAt: number;
	stats: {
		accuracy: number; // percentage
		attempts: number; // total attempts
		correctCount: number;
		incorrectCount: number;
		lastUsed: number; // timestamp of last use
	};
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

export interface UserSettings {
	theme: 'light' | 'dark';
	userName: string;
	fontStyle: 'normal' | 'comic'; // Optional font style for gigachad mode
	language: 'en' | 'ja';
}
