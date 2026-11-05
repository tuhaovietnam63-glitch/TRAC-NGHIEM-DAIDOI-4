import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Question, TestConfig, QuizMode } from '../types';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Clock,
  Grid,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Send,
  X,
  AlertTriangle,
  Flame,
  Volume2,
  VolumeX
} from 'lucide-react';

interface QuizScreenProps {
  questions: Question[];
  config: TestConfig;
  initialAnswers?: Record<string, number>;
  initialIndex?: number;
  initialTimeRemaining?: number;
  bookmarkedIds: string[];
  onToggleBookmark: (questionId: string) => void;
  onFinishTest: (userAnswers: Record<string, number>, timeSpentSeconds: number) => void;
  onExitTest: () => void;
  onSaveProgress: (currentIndex: number, answers: Record<string, number>, timeRemaining: number) => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
  questions,
  config,
  initialAnswers = {},
  initialIndex = 0,
  initialTimeRemaining,
  bookmarkedIds,
  onToggleBookmark,
  onFinishTest,
  onExitTest,
  onSaveProgress,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>(initialAnswers);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false);

  // Timer states for Exam Mode
  const isExam = config.mode === 'exam';
  const totalSeconds = config.timeLimitMinutes > 0 ? config.timeLimitMinutes * 60 : 0;
  const [timeRemaining, setTimeRemaining] = useState<number>(
    initialTimeRemaining !== undefined ? initialTimeRemaining : totalSeconds
  );
  const [timeSpent, setTimeSpent] = useState<number>(0);

  const totalQuestions = questions.length;
  const currentQ = questions[currentIndex];
  const isBookmarked = currentQ ? bookmarkedIds.includes(currentQ.id) : false;
  const selectedAnswer = currentQ ? userAnswers[currentQ.id] : undefined;
  const isAnswered = selectedAnswer !== undefined;

  // Auto-save progress
  useEffect(() => {
    onSaveProgress(currentIndex, userAnswers, timeRemaining);
  }, [currentIndex, userAnswers, timeRemaining, onSaveProgress]);

  // Timer countdown
  useEffect(() => {
    if (!isExam || totalSeconds === 0) {
      // Just track elapsed time in practice mode or unlimited exam
      const interval = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }

    if (timeRemaining <= 0) {
      // Time is up! Auto submit
      handleDirectSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleDirectSubmit();
          return 0;
        }
        return prev - 1;
      });
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isExam, totalSeconds, timeRemaining]);

  const handleSelectAnswer = (optionIndex: number) => {
    // In practice mode, if already answered, don't change or allow retry
    // In exam mode, always allow changing
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionIndex,
    }));
  };

  const handleNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, totalQuestions]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleDirectSubmit = useCallback(() => {
    onFinishTest(userAnswers, timeSpent);
  }, [onFinishTest, userAnswers, timeSpent]);

  // Keyboard Shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If modal is open, don't trigger shortcuts
      if (showMap || showSubmitConfirm) return;

      // Number keys 1, 2, 3, 4
      if (['1', '2', '3', '4'].includes(e.key)) {
        const optIndex = parseInt(e.key, 10) - 1;
        if (currentQ && optIndex < currentQ.options.length) {
          handleSelectAnswer(optIndex);
        }
      }
      // Arrow keys
      else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Enter') {
        if (currentIndex < totalQuestions - 1) {
          handleNext();
        } else if (isExam) {
          setShowSubmitConfirm(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQ, currentIndex, totalQuestions, showMap, showSubmitConfirm, handleNext, handlePrev]);

  // Format time (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Stats calculation
  const answeredCount = Object.keys(userAnswers).length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Sticky Top Status & Progress Bar */}
      <div className="sticky top-14 sm:top-16 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Progress Line */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1">
          <div
            className="bg-emerald-600 dark:bg-emerald-500 h-1 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>

        <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
          {/* Back & Title */}
          <div className="flex items-center gap-2">
            <button
              onClick={onExitTest}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Dừng bài thi"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                Câu {currentIndex + 1}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ {totalQuestions}</span>
            </div>
          </div>

          {/* Center: Timer if in Exam mode */}
          {isExam && totalSeconds > 0 && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                timeRemaining < 180
                  ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-900 animate-pulse'
                  : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          )}

          {/* Right Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Bookmark Button */}
            <button
              onClick={() => currentQ && onToggleBookmark(currentQ.id)}
              className={`p-2 rounded-xl transition-colors ${
                isBookmarked
                  ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                  : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isBookmarked ? 'Bỏ đánh dấu câu này' : 'Đánh dấu câu này để xem lại'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
            </button>

            {/* Question Map / Matrix Button */}
            <button
              onClick={() => setShowMap(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Xem danh sách câu hỏi"
            >
              <Grid className="w-4 h-4 text-slate-500" />
              <span className="hidden xs:inline">
                {answeredCount}/{totalQuestions}
              </span>
            </button>

            {/* Submit Button (Exam Mode) */}
            {isExam && (
              <button
                onClick={() => setShowSubmitConfirm(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Nộp bài</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Question Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Category & Status Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {currentQ.category}
          </span>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {config.mode === 'practice' ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Chế độ Luyện tập
              </span>
            ) : (
              <span>Chế độ Thi tính điểm</span>
            )}
          </div>
        </div>

        {/* Question Text Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
            {currentQ.question}
          </h2>

          {/* Options List */}
          <div className="space-y-3 pt-2">
            {currentQ.options.map((optText, optIndex) => {
              const letter = String.fromCharCode(65 + optIndex); // 'A', 'B', 'C', 'D'
              const isSelected = selectedAnswer === optIndex;
              const isCorrectAnswer = optIndex === currentQ.answer;

              // Styles in Practice Mode
              let optionStyle =
                'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200';
              let badgeStyle =
                'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';

              if (config.mode === 'practice' && isAnswered) {
                if (isCorrectAnswer) {
                  optionStyle =
                    'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/20';
                  badgeStyle = 'bg-emerald-600 text-white border-emerald-600';
                } else if (isSelected && !isCorrectAnswer) {
                  optionStyle =
                    'border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100 ring-2 ring-rose-500/20';
                  badgeStyle = 'bg-rose-600 text-white border-rose-600';
                } else {
                  optionStyle = 'opacity-60 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900';
                }
              } else if (isSelected) {
                // Exam Mode: Selected
                optionStyle =
                  'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-600/30';
                badgeStyle = 'bg-emerald-600 text-white border-emerald-600';
              }

              return (
                <button
                  key={optIndex}
                  onClick={() => handleSelectAnswer(optIndex)}
                  className={`w-full text-left p-4 sm:p-4.5 rounded-2xl border transition-all flex items-start gap-3.5 group cursor-pointer active:scale-[0.99] ${optionStyle}`}
                >
                  {/* Letter badge: A, B, C, D */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs border transition-colors ${badgeStyle}`}
                  >
                    {letter}
                  </div>

                  {/* Option Text */}
                  <div className="flex-1 text-sm sm:text-base leading-relaxed pt-0.5 font-medium">
                    {optText}
                  </div>

                  {/* Shortcut Hint on Desktop */}
                  <span className="hidden sm:inline-block text-[10px] font-mono font-medium text-slate-300 dark:text-slate-600 opacity-60 group-hover:opacity-100">
                    Phím [{optIndex + 1}]
                  </span>

                  {/* Practice Icon Indicator */}
                  {config.mode === 'practice' && isAnswered && (
                    <div className="shrink-0 pt-0.5">
                      {isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                      {isSelected && !isCorrectAnswer && (
                        <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Practice Mode: Instant Explanation Box */}
          {config.mode === 'practice' && isAnswered && (
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-all animate-fade-in ${
                selectedAnswer === currentQ.answer
                  ? 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800'
                  : 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <HelpCircle
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    selectedAnswer === currentQ.answer ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        selectedAnswer === currentQ.answer
                          ? 'text-emerald-800 dark:text-emerald-300'
                          : 'text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {selectedAnswer === currentQ.answer ? '✓ Bạn trả lời đúng!' : '✕ Chưa chính xác!'}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                      Đáp án đúng: {String.fromCharCode(65 + currentQ.answer)}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {currentQ.explanation ||
                      `Đáp án đúng là ${String.fromCharCode(65 + currentQ.answer)} theo tài liệu hướng dẫn kiểm tra năm 2026.`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating Bottom Navigation Bar */}
      <footer className="sticky bottom-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-3 px-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          {/* Previous Button */}
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
              currentIndex === 0
                ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Câu trước</span>
          </button>

          {/* Middle: Map Trigger */}
          <button
            onClick={() => setShowMap(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          >
            <Grid className="w-4 h-4" />
            <span>Lưới câu hỏi</span>
          </button>

          {/* Next / Submit Button */}
          {currentIndex < totalQuestions - 1 ? (
            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-all active:scale-[0.98]"
            >
              <span>Câu tiếp</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : isExam ? (
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all active:scale-[0.98]"
            >
              <Send className="w-4 h-4" />
              <span>NỘP BÀI THI</span>
            </button>
          ) : (
            <button
              onClick={handleDirectSubmit}
              className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-all active:scale-[0.98]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Hoàn thành ôn tập</span>
            </button>
          )}
        </div>
      </footer>

      {/* Question Map / Matrix Modal */}
      {showMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Danh sách câu hỏi
                </h3>
                <p className="text-xs text-slate-500">
                  Đã làm {answeredCount} / {totalQuestions} câu
                </p>
              </div>
              <button
                onClick={() => setShowMap(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Legend */}
            <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" /> Đã làm
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700 inline-block" /> Chưa làm
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full ring-2 ring-emerald-500 bg-white dark:bg-slate-800 inline-block" /> Đang xem
              </span>
              <span className="flex items-center gap-1">
                <Bookmark className="w-3 h-3 fill-amber-500 text-amber-500 inline-block" /> Đã đánh dấu
              </span>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isAns = userAnswers[q.id] !== undefined;
                  const isBmk = bookmarkedIds.includes(q.id);

                  let btnStyle =
                    'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700';

                  if (isAns) {
                    btnStyle =
                      'bg-emerald-600 text-white font-bold border-emerald-600 hover:bg-emerald-700';
                  }

                  if (isCurrent) {
                    btnStyle += ' ring-2 ring-emerald-400 ring-offset-2 dark:ring-offset-slate-900';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setShowMap(false);
                      }}
                      className={`relative h-11 rounded-xl text-xs font-semibold flex items-center justify-center border transition-all ${btnStyle}`}
                    >
                      <span>{idx + 1}</span>
                      {isBmk && (
                        <Bookmark className="w-3 h-3 fill-amber-400 text-amber-400 absolute top-1 right-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowMap(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Dialog */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Xác nhận nộp bài?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bạn đã trả lời <strong className="text-emerald-600">{answeredCount}</strong> /{' '}
                <strong>{totalQuestions}</strong> câu hỏi.
                {totalQuestions - answeredCount > 0 && (
                  <span className="block text-rose-500 font-semibold mt-1">
                    Còn {totalQuestions - answeredCount} câu chưa chọn đáp án!
                  </span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Tiếp tục làm
              </button>
              <button
                onClick={() => {
                  setShowSubmitConfirm(false);
                  handleDirectSubmit();
                }}
                className="py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
              >
                Đồng ý nộp bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
