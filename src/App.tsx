import React, { useState, useEffect, useCallback } from 'react';
import {
  QuizDataset,
  Question,
  TestConfig,
  TestResult,
  ActiveSession,
  ScreenType,
  QuizMode,
} from './types';
import {
  getStoredTheme,
  setStoredTheme,
  getQuestionsDataset,
  saveQuestionsDataset,
  resetQuestionsDataset,
  getBookmarkedIds,
  toggleBookmarkId,
  getWrongQuestionIds,
  recordWrongQuestions,
  getTestHistory,
  saveTestResult,
  getActiveSession,
  saveActiveSession,
  shuffleArray,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { HomeScreen } from './components/HomeScreen';
import { QuizScreen } from './components/QuizScreen';
import { ResultScreen } from './components/ResultScreen';
import { AdminScreen } from './components/AdminScreen';

export const App: React.FC = () => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(getStoredTheme);

  // Dataset state
  const [dataset, setDataset] = useState<QuizDataset>(getQuestionsDataset);

  // Screen state
  const [screen, setScreen] = useState<ScreenType>('home');

  // Bookmarks & Wrong Questions state
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(getBookmarkedIds);
  const [wrongQuestionIds, setWrongQuestionIds] = useState<string[]>(getWrongQuestionIds);

  // Active quiz session state
  const [currentConfig, setCurrentConfig] = useState<TestConfig | null>(null);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(getActiveSession);

  // Result state
  const [lastResult, setLastResult] = useState<TestResult | null>(null);

  // Apply theme class on mount and change
  useEffect(() => {
    setStoredTheme(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Toggle Bookmark
  const handleToggleBookmark = (id: string) => {
    const updated = toggleBookmarkId(id);
    setBookmarkedIds(updated);
  };

  // Start Quiz helper
  const startQuiz = useCallback(
    (config: TestConfig, customQuestionsList?: Question[]) => {
      let pool: Question[] = [];

      if (customQuestionsList && customQuestionsList.length > 0) {
        pool = [...customQuestionsList];
      } else if (config.categoryId === 'all') {
        pool = [...dataset.questions];
      } else {
        pool = dataset.questions.filter((q) => q.categoryId === config.categoryId);
      }

      // Shuffle questions if requested
      if (config.shuffleQuestions) {
        pool = shuffleArray(pool);
      }

      // Limit count
      const finalCount =
        config.questionCount > 0 && config.questionCount < pool.length
          ? config.questionCount
          : pool.length;
      let selected = pool.slice(0, finalCount);

      // Shuffle options if requested (and recalculate correct answer index)
      if (config.shuffleOptions) {
        selected = selected.map((q) => {
          const originalAnswerText = q.options[q.answer];
          const shuffledOpts = shuffleArray(q.options);
          const newAnswerIndex = shuffledOpts.indexOf(originalAnswerText);
          return {
            ...q,
            options: shuffledOpts,
            answer: newAnswerIndex,
            answerLetter: String.fromCharCode(65 + newAnswerIndex),
          };
        });
      }

      setCurrentConfig(config);
      setCurrentQuestions(selected);
      setScreen('quiz');

      const newSession: ActiveSession = {
        config,
        questions: selected,
        currentIndex: 0,
        userAnswers: {},
        bookmarkedIds,
        startTime: Date.now(),
        timeRemainingSeconds: config.timeLimitMinutes > 0 ? config.timeLimitMinutes * 60 : 0,
      };
      setActiveSession(newSession);
      saveActiveSession(newSession);
    },
    [dataset.questions, bookmarkedIds]
  );

  // Resume active session
  const handleResumeSession = () => {
    if (activeSession && activeSession.questions.length > 0) {
      setCurrentConfig(activeSession.config);
      setCurrentQuestions(activeSession.questions);
      setScreen('quiz');
    }
  };

  // Practice wrong questions
  const handleStartWrongPractice = () => {
    const wrongQs = dataset.questions.filter((q) => wrongQuestionIds.includes(q.id));
    if (wrongQs.length === 0) return;
    startQuiz(
      {
        categoryId: 'all',
        mode: 'practice',
        questionCount: wrongQs.length,
        timeLimitMinutes: 0,
        shuffleQuestions: false,
        shuffleOptions: false,
        onlyIncorrect: true,
      },
      wrongQs
    );
  };

  // Practice bookmarked questions
  const handleStartBookmarkPractice = () => {
    const bmkQs = dataset.questions.filter((q) => bookmarkedIds.includes(q.id));
    if (bmkQs.length === 0) return;
    startQuiz(
      {
        categoryId: 'all',
        mode: 'practice',
        questionCount: bmkQs.length,
        timeLimitMinutes: 0,
        shuffleQuestions: false,
        shuffleOptions: false,
        onlyBookmarked: true,
      },
      bmkQs
    );
  };

  // Finish test
  const handleFinishTest = (userAnswers: Record<string, number>, timeSpentSeconds: number) => {
    if (!currentConfig || currentQuestions.length === 0) return;

    let correctCount = 0;
    const answeredIds = Object.keys(userAnswers);
    const total = currentQuestions.length;
    const wrongIdsThisSession: string[] = [];
    const correctIdsThisSession: string[] = [];

    currentQuestions.forEach((q) => {
      const userPick = userAnswers[q.id];
      if (userPick === q.answer) {
        correctCount++;
        correctIdsThisSession.push(q.id);
      } else {
        wrongIdsThisSession.push(q.id);
      }
    });

    const wrongCount = total - correctCount;
    const unansweredCount = total - answeredIds.length;
    const scoreOutOf10 = Number(((correctCount / total) * 10).toFixed(1));
    const percentage = Math.round((correctCount / total) * 100);

    const result: TestResult = {
      scoreOutOf10,
      total,
      correctCount,
      wrongCount,
      unansweredCount,
      percentage,
      timeSpentSeconds,
      userAnswers,
      questions: currentQuestions,
      config: currentConfig,
      date: new Date().toLocaleString('vi-VN'),
    };

    // Save result & update wrong questions list
    saveTestResult(result);
    recordWrongQuestions(wrongIdsThisSession, correctIdsThisSession);
    setWrongQuestionIds(getWrongQuestionIds());

    // Clear active session
    setActiveSession(null);
    saveActiveSession(null);

    setLastResult(result);
    setScreen('result');
  };

  // Save progress during quiz
  const handleSaveProgress = useCallback(
    (currentIndex: number, answers: Record<string, number>, timeRemaining: number) => {
      if (currentConfig && currentQuestions.length > 0) {
        const session: ActiveSession = {
          config: currentConfig,
          questions: currentQuestions,
          currentIndex,
          userAnswers: answers,
          bookmarkedIds,
          startTime: Date.now(),
          timeRemainingSeconds: timeRemaining,
        };
        setActiveSession(session);
        saveActiveSession(session);
      }
    },
    [currentConfig, currentQuestions, bookmarkedIds]
  );

  // Retake entire quiz
  const handleRetakeAll = () => {
    if (lastResult) {
      startQuiz(lastResult.config, lastResult.questions);
    }
  };

  // Retake only wrong questions from last test
  const handleRetakeWrong = () => {
    if (lastResult) {
      const wrongQs = lastResult.questions.filter(
        (q) => lastResult.userAnswers[q.id] !== q.answer
      );
      if (wrongQs.length > 0) {
        startQuiz(
          {
            ...lastResult.config,
            questionCount: wrongQs.length,
          },
          wrongQs
        );
      }
    }
  };

  // Save new dataset in Admin
  const handleSaveDataset = (newDataset: QuizDataset) => {
    setDataset(newDataset);
    saveQuestionsDataset(newDataset);
  };

  // Reset dataset to default
  const handleResetDataset = () => {
    const defaultData = resetQuestionsDataset();
    setDataset(defaultData);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <Navbar
        currentScreen={screen}
        quizMode={currentConfig?.mode}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onNavigateHome={() => setScreen('home')}
        onOpenAdmin={() => setScreen('admin')}
        onOpenBookmarks={handleStartBookmarkPractice}
        bookmarkCount={bookmarkedIds.length}
      />

      <div className="flex-1">
        {screen === 'home' && (
          <HomeScreen
            categories={dataset.categories}
            totalQuestions={dataset.totalQuestions}
            onStartQuiz={startQuiz}
            onResumeSession={handleResumeSession}
            hasActiveSession={activeSession !== null && activeSession.questions?.length > 0}
            bookmarkedCount={bookmarkedIds.length}
            wrongCount={wrongQuestionIds.length}
            onStartWrongPractice={handleStartWrongPractice}
            onStartBookmarkPractice={handleStartBookmarkPractice}
          />
        )}

        {screen === 'quiz' && currentQuestions.length > 0 && currentConfig && (
          <QuizScreen
            questions={currentQuestions}
            config={currentConfig}
            initialAnswers={activeSession?.userAnswers || {}}
            initialIndex={activeSession?.currentIndex || 0}
            initialTimeRemaining={activeSession?.timeRemainingSeconds}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onFinishTest={handleFinishTest}
            onExitTest={() => {
              if (
                currentConfig.mode === 'practice' ||
                window.confirm('Bạn có chắc muốn tạm dừng bài thi và quay về trang chủ? Tiến độ của bạn đã được lưu.')
              ) {
                setScreen('home');
              }
            }}
            onSaveProgress={handleSaveProgress}
          />
        )}

        {screen === 'result' && lastResult && (
          <ResultScreen
            result={lastResult}
            onRetakeAll={handleRetakeAll}
            onRetakeWrong={handleRetakeWrong}
            onNavigateHome={() => setScreen('home')}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
          />
        )}

        {screen === 'admin' && (
          <AdminScreen
            dataset={dataset}
            onSaveDataset={handleSaveDataset}
            onResetDataset={handleResetDataset}
            onBackToHome={() => setScreen('home')}
          />
        )}
      </div>
    </div>
  );
};
