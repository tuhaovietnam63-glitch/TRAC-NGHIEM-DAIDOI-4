import React, { useState, useEffect } from 'react';
import { TestResult, Question } from '../types';
import confetti from 'canvas-confetti';
import {
  Trophy,
  RotateCcw,
  Home,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Bookmark,
  Share2,
  Check
} from 'lucide-react';

interface ResultScreenProps {
  result: TestResult;
  onRetakeAll: () => void;
  onRetakeWrong: () => void;
  onNavigateHome: () => void;
  bookmarkedIds: string[];
  onToggleBookmark: (id: string) => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  result,
  onRetakeAll,
  onRetakeWrong,
  onNavigateHome,
  bookmarkedIds,
  onToggleBookmark,
}) => {
  const [filter, setFilter] = useState<'all' | 'wrong' | 'correct' | 'bookmarked'>('all');
  const [copied, setCopied] = useState<boolean>(false);

  // Trigger confetti if score is >= 8.0
  useEffect(() => {
    if (result.scoreOutOf10 >= 8.0) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Ignore if confetti fails
      }
    }
  }, [result.scoreOutOf10]);

  const { scoreOutOf10, total, correctCount, wrongCount, unansweredCount, percentage, timeSpentSeconds, questions, userAnswers } = result;

  // Format time
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    if (mins === 0) return `${rem} giây`;
    return `${mins} phút ${rem} giây`;
  };

  // Filtered questions for review
  const filteredQuestions = questions.filter((q) => {
    const userChoice = userAnswers[q.id];
    const isCorrect = userChoice === q.answer;
    const isBookmarked = bookmarkedIds.includes(q.id);

    if (filter === 'wrong') return !isCorrect;
    if (filter === 'correct') return isCorrect;
    if (filter === 'bookmarked') return isBookmarked;
    return true;
  });

  // Share score
  const handleShare = () => {
    const shareText = `Tôi vừa hoàn thành bài thi trắc nghiệm Công binh 2026 với kết quả: ${scoreOutOf10}/10 điểm (${percentage}% - ${correctCount}/${total} câu đúng). Hãy cùng ôn luyện nhé!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Evaluation text
  let rankText = 'Cần cố gắng thêm';
  let rankColor = 'text-amber-600 dark:text-amber-400';
  if (scoreOutOf10 >= 9.0) {
    rankText = 'Xuất sắc';
    rankColor = 'text-emerald-600 dark:text-emerald-400';
  } else if (scoreOutOf10 >= 8.0) {
    rankText = 'Giỏi - Đạt yêu cầu cao';
    rankColor = 'text-emerald-600 dark:text-emerald-400';
  } else if (scoreOutOf10 >= 6.5) {
    rankText = 'Khá - Đạt yêu cầu';
    rankColor = 'text-teal-600 dark:text-teal-400';
  } else if (scoreOutOf10 >= 5.0) {
    rankText = 'Trung bình - Cần ôn thêm';
    rankColor = 'text-amber-600 dark:text-amber-400';
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* Score Summary Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 text-center space-y-6">
        <div className="space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
            <Trophy className="w-7 h-7" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            KẾT QUẢ BÀI THI
          </p>
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
              {scoreOutOf10}
            </span>
            <span className="text-lg sm:text-2xl font-bold text-slate-400">/ 10</span>
          </div>
          <div className={`text-sm sm:text-base font-bold ${rankColor}`}>
            {rankText} • Tỷ lệ chính xác: {percentage}%
          </div>
        </div>

        {/* Stats Pill Breakdown */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-md mx-auto pt-2">
          <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-center">
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              Đúng
            </div>
            <div className="text-lg sm:text-2xl font-black text-emerald-800 dark:text-emerald-300">
              {correctCount}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-center">
            <div className="text-xs text-rose-700 dark:text-rose-400 font-medium">
              Sai
            </div>
            <div className="text-lg sm:text-2xl font-black text-rose-800 dark:text-rose-300">
              {wrongCount}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center">
            <div className="text-xs text-slate-500 font-medium">
              Thời gian
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 pt-1">
              {formatTime(timeSpentSeconds)}
            </div>
          </div>
        </div>

        {/* Action Buttons as requested */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          <button
            onClick={onRetakeAll}
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>LÀM LẠI TOÀN BỘ</span>
          </button>

          {wrongCount > 0 && (
            <button
              onClick={() => {
                setFilter('wrong');
                const el = document.getElementById('review-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all"
            >
              <AlertCircle className="w-4 h-4" />
              <span>XEM {wrongCount} CÂU SAI</span>
            </button>
          )}

          {wrongCount > 0 && (
            <button
              onClick={onRetakeWrong}
              className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all"
              title="Thi lại chỉ những câu vừa làm sai"
            >
              <RotateCcw className="w-4 h-4 text-rose-500" />
              <span>Thi lại các câu sai</span>
            </button>
          )}

          <button
            onClick={handleShare}
            className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? 'Đã sao chép!' : 'Chia sẻ điểm'}</span>
          </button>

          <button
            onClick={onNavigateHome}
            className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Về trang chủ</span>
          </button>
        </div>
      </div>

      {/* Detailed Review Section */}
      <div id="review-section" className="space-y-4 pt-4">
        {/* Filter Tabs */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Chi tiết câu trả lời ({filteredQuestions.length})
          </h3>

          <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Tất cả ({questions.length})
            </button>
            <button
              onClick={() => setFilter('wrong')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filter === 'wrong'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Câu sai ({wrongCount})
            </button>
            <button
              onClick={() => setFilter('correct')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filter === 'correct'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Câu đúng ({correctCount})
            </button>
          </div>
        </div>

        {/* Questions Review List */}
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const userChoice = userAnswers[q.id];
            const isCorrect = userChoice === q.answer;
            const isBmk = bookmarkedIds.includes(q.id);

            return (
              <div
                key={q.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isCorrect
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    : 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-950/60 ring-1 ring-rose-500/10'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-2 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {isCorrect ? '✓ Câu ' + (idx + 1) + ' Đúng' : '✕ Câu ' + (idx + 1) + ' Sai'}
                    </span>
                    <span className="text-xs text-slate-400">{q.category}</span>
                  </div>

                  <button
                    onClick={() => onToggleBookmark(q.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-amber-500"
                    title="Gắn dấu sao"
                  >
                    <Bookmark className={`w-4 h-4 ${isBmk ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </button>
                </div>

                {/* Question Body */}
                <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-relaxed">
                  {q.question}
                </h4>

                {/* Options Review */}
                <div className="space-y-2 pt-3">
                  {q.options.map((optText, optIdx) => {
                    const letter = String.fromCharCode(65 + optIdx);
                    const isUserPick = userChoice === optIdx;
                    const isRightAnswer = optIdx === q.answer;

                    let rowStyle = 'border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30 text-slate-600 dark:text-slate-400';
                    let badge = 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400';

                    if (isRightAnswer) {
                      rowStyle = 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 font-medium';
                      badge = 'bg-emerald-600 text-white font-bold';
                    } else if (isUserPick && !isRightAnswer) {
                      rowStyle = 'border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30 text-rose-950 dark:text-rose-200';
                      badge = 'bg-rose-600 text-white font-bold';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-2.5 ${rowStyle}`}
                      >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${badge}`}>
                          {letter}
                        </div>
                        <div className="flex-1 leading-relaxed pt-0.5">
                          {optText}
                        </div>
                        {isRightAnswer && (
                          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 self-center">
                            (Đáp án đúng)
                          </span>
                        )}
                        {isUserPick && !isRightAnswer && (
                          <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 shrink-0 self-center">
                            (Bạn đã chọn)
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Giải thích: Đáp án đúng {String.fromCharCode(65 + q.answer)}.
                    </span>{' '}
                    <span>{q.explanation}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
