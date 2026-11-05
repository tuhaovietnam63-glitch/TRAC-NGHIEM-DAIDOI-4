import { QuizDataset, Question, TestResult, ActiveSession } from '../types';
import defaultData from '../data/questions.json';

const STORAGE_KEYS = {
  THEME: 'trac_nghiem_theme',
  CUSTOM_DATA: 'trac_nghiem_custom_questions_v1',
  BOOKMARKS: 'trac_nghiem_bookmarks',
  WRONG_QUESTIONS: 'trac_nghiem_wrong_questions',
  HISTORY: 'trac_nghiem_history',
  ACTIVE_SESSION: 'trac_nghiem_active_session',
};

// Theme Management
export const getStoredTheme = (): 'light' | 'dark' => {
  const stored = localStorage.getItem(STORAGE_KEYS.THEME);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const setStoredTheme = (theme: 'light' | 'dark') => {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// Questions Dataset Management
export const getQuestionsDataset = (): QuizDataset => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_DATA);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading custom questions dataset:', e);
  }
  return defaultData as QuizDataset;
};

export const saveQuestionsDataset = (data: QuizDataset): void => {
  localStorage.setItem(STORAGE_KEYS.CUSTOM_DATA, JSON.stringify(data));
};

export const resetQuestionsDataset = (): QuizDataset => {
  localStorage.removeItem(STORAGE_KEYS.CUSTOM_DATA);
  return defaultData as QuizDataset;
};

// Bookmarks Management
export const getBookmarkedIds = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const toggleBookmarkId = (id: string): string[] => {
  const bookmarks = getBookmarkedIds();
  const index = bookmarks.indexOf(id);
  let updated: string[];
  if (index >= 0) {
    updated = bookmarks.filter((item) => item !== id);
  } else {
    updated = [...bookmarks, id];
  }
  localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
  return updated;
};

// Wrong Questions Management
export const getWrongQuestionIds = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WRONG_QUESTIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const recordWrongQuestions = (wrongIds: string[], correctIds: string[]) => {
  const current = new Set(getWrongQuestionIds());
  wrongIds.forEach((id) => current.add(id));
  correctIds.forEach((id) => current.delete(id)); // Remove if answered correctly now
  localStorage.setItem(STORAGE_KEYS.WRONG_QUESTIONS, JSON.stringify(Array.from(current)));
};

// History Management
export const getTestHistory = (): TestResult[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveTestResult = (result: TestResult): void => {
  const history = getTestHistory();
  const updated = [result, ...history].slice(0, 50); // Keep last 50 tests
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
};

// Active Session (resume on reload)
export const getActiveSession = (): ActiveSession | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveActiveSession = (session: ActiveSession | null): void => {
  if (!session) {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
  } else {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
  }
};

// Helper: Shuffle array
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Download file utility
export const downloadJson = (data: unknown, filename: string) => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
