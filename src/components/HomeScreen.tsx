import React, { useState } from 'react';
import { Category, QuizMode, TestConfig } from '../types';
import {
  BookOpen,
  Award,
  Play,
  Clock,
  Shuffle,
  CheckCircle2,
  AlertCircle,
  Bookmark,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Layers
} from 'lucide-react';

interface HomeScreenProps {
  categories: Category[];
  totalQuestions: number;
  onStartQuiz: (config: TestConfig) => void;
  onResumeSession?: () => void;
  hasActiveSession: boolean;
  bookmarkedCount: number;
  wrongCount: number;
  onStartWrongPractice: () => void;
  onStartBookmarkPractice: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  categories,
  totalQuestions,
  onStartQuiz,
  onResumeSession,
  hasActiveSession,
  bookmarkedCount,
  wrongCount,
  onStartWrongPractice,
  onStartBookmarkPractice,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [mode, setMode] = useState<QuizMode>('practice');
  const [questionCount, setQuestionCount] = useState<number>(0); // 0 = all
  const [timeLimit, setTimeLimit] = useState<number>(30); // in minutes, 0 = no limit
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(true);
  const [shuffleOptions, setShuffleOptions] = useState<boolean>(false);

  // Get current category item
  const currentCat = categories.find((c) => c.id === selectedCategory) || categories[0];
  const maxAvailable = currentCat ? currentCat.count : totalQuestions;

  const handleStart = () => {
    onStartQuiz({
      categoryId: selectedCategory,
      mode,
      questionCount: questionCount === 0 || questionCount > maxAvailable ? maxAvailable : questionCount,
      timeLimitMinutes: mode === 'exam' ? timeLimit : 0,
      shuffleQuestions: mode === 'exam' ? shuffleQuestions : false,
      shuffleOptions: mode === 'exam' ? shuffleOptions : false,
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* Resume Banner if any */}
      {hasActiveSession && onResumeSession && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                Bạn có một bài làm chưa hoàn thành
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Tiếp tục từ vị trí câu hỏi bạn vừa dừng lại.
              </p>
            </div>
          </div>
          <button
            onClick={onResumeSession}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all whitespace-nowrap"
          >
            Tiếp tục làm bài →
          </button>
        </div>
      )}

      {/* Main Hero Card - Clean & Minimal as requested */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
          <Sparkles className="w-3.5 h-3.5" />
          <span>TRẮC NGHIỆM ÔN TẬP KIẾN THỨC</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          ÔN TẬP CÔNG BINH 2026
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Bộ ngân hàng câu hỏi trắc nghiệm ôn luyện phục vụ kiểm tra toàn diện của Binh chủng Công binh.
        </p>
      </div>

      {/* Central Interactive Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none p-5 sm:p-8 space-y-6">
        {/* Step 1: Chọn Chuyên đề */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
            1. Chọn chuyên đề ôn tập
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    if (questionCount > cat.count) setQuestionCount(0);
                  }}
                  className={`text-left p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 dark:ring-emerald-500/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-bold truncate ${isSelected ? 'text-emerald-900 dark:text-emerald-200' : 'text-slate-800 dark:text-slate-200'}`}>
                        {cat.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {cat.description}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {cat.count} câu
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Chọn Chế độ */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
            2. Chọn chế độ học tập
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Luyện tập */}
            <button
              onClick={() => setMode('practice')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                mode === 'practice'
                  ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    mode === 'practice'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    CHẾ ĐỘ LUYỆN TẬP
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Hiện đáp án & giải thích ngay khi chọn. Tự do chuyển câu, không giới hạn thời gian.
                  </p>
                </div>
              </div>
            </button>

            {/* Thi thử */}
            <button
              onClick={() => setMode('exam')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                mode === 'exam'
                  ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    mode === 'exam'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    CHẾ ĐỘ THI THỬ
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Tính giờ, trộn đề, không hiện kết quả ngay. Nộp bài tính điểm thang 10 & xem câu sai.
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Step 3: Tùy chọn nâng cao khi Thi thử */}
        {mode === 'exam' && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              Thiết lập bài thi
            </h4>

            {/* Số câu hỏi */}
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1.5 font-medium">
                Số lượng câu hỏi:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '20 câu', value: 20 },
                  { label: '30 câu', value: 30 },
                  { label: '40 câu', value: 40 },
                  { label: '50 câu', value: 50 },
                  { label: `Tất cả (${maxAvailable} câu)`, value: 0 },
                ].map((opt) => {
                  if (opt.value > maxAvailable && opt.value !== 0) return null;
                  const isSelected = questionCount === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setQuestionCount(opt.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Thời gian làm bài */}
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1.5 font-medium">
                Thời gian làm bài:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '15 phút', value: 15 },
                  { label: '30 phút', value: 30 },
                  { label: '45 phút', value: 45 },
                  { label: '60 phút', value: 60 },
                  { label: 'Không giới hạn', value: 0 },
                ].map((t) => {
                  const isSelected = timeLimit === t.value;
                  return (
                    <button
                      key={t.value}
                      onClick={() => setTimeLimit(t.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trộn đề */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 dark:text-slate-300 font-medium">
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <Shuffle className="w-3.5 h-3.5 text-slate-500" />
                <span>Trộn ngẫu nhiên câu hỏi</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 dark:text-slate-300 font-medium">
                <input
                  type="checkbox"
                  checked={shuffleOptions}
                  onChange={(e) => setShuffleOptions(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <Shuffle className="w-3.5 h-3.5 text-slate-500" />
                <span>Trộn thứ tự đáp án (A, B, C, D)</span>
              </label>
            </div>
          </div>
        )}

        {/* Big BẮT ĐẦU Button */}
        <div>
          <button
            onClick={handleStart}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-base sm:text-lg tracking-wide shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 transform active:scale-[0.99] transition-all flex items-center justify-center gap-2.5"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>BẮT ĐẦU {mode === 'practice' ? 'LUYỆN TẬP' : 'LÀM BÀI THI'}</span>
          </button>
        </div>
      </div>

      {/* Quick Access to Mistakes & Bookmarks */}
      {(wrongCount > 0 || bookmarkedCount > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {wrongCount > 0 && (
            <button
              onClick={onStartWrongPractice}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-950/60 hover:border-rose-300 dark:hover:border-rose-800 text-left transition-all shadow-xs flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">
                    Ôn lại câu từng làm sai ({wrongCount} câu)
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Luyện tập lại các câu hỏi trả lời chưa đúng
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          {bookmarkedCount > 0 && (
            <button
              onClick={onStartBookmarkPractice}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-950/60 hover:border-amber-300 dark:hover:border-amber-800 text-left transition-all shadow-xs flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Bookmark className="w-5 h-5 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                    Ôn các câu đã đánh dấu ({bookmarkedCount} câu)
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Xem lại các câu hỏi bạn đã gắn dấu sao
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      )}

      {/* Keyboard Shortcuts Hint */}
      <div className="text-center text-xs text-slate-400 dark:text-slate-500">
        <p>Hỗ trợ phím tắt trên máy tính: <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px]">1</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px]">2</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px]">3</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px]">4</kbd> để chọn đáp án • <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px]">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px]">→</kbd> để chuyển câu</p>
      </div>
    </div>
  );
};
