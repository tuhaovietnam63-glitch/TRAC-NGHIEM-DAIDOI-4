export interface Question {
  id: string;
  number: number;
  category: string;
  categoryId: string;
  question: string;
  options: string[];
  answer: number; // 0 for A, 1 for B, 2 for C, 3 for D
  answerLetter?: string;
  explanation?: string;
}

export interface Category {
  id: string;
  name: string;
  count: number;
  description: string;
}

export interface QuizDataset {
  title: string;
  subtitle: string;
  source: string;
  totalQuestions: number;
  categories: Category[];
  questions: Question[];
}

export type QuizMode = 'practice' | 'exam';

export type ScreenType = 'home' | 'quiz' | 'result' | 'admin';

export interface TestConfig {
  categoryId: string;
  mode: QuizMode;
  questionCount: number; // e.g. 20, 30, 50, or all
  timeLimitMinutes: number; // 0 means unlimited
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  onlyBookmarked?: boolean;
  onlyIncorrect?: boolean;
}

export interface TestResult {
  scoreOutOf10: number;
  total: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  percentage: number;
  timeSpentSeconds: number;
  userAnswers: Record<string, number>;
  questions: Question[];
  config: TestConfig;
  date: string;
}

export interface ActiveSession {
  config: TestConfig;
  questions: Question[];
  currentIndex: number;
  userAnswers: Record<string, number>;
  bookmarkedIds: string[];
  startTime: number;
  timeRemainingSeconds: number;
}
