import React, { useState, useMemo } from 'react';
import { QuizDataset, Question, Category } from '../types';
import { downloadJson } from '../utils/storage';
import {
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload,
  Search,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Eye,
  FileSpreadsheet,
  X,
  Filter
} from 'lucide-react';

interface AdminScreenProps {
  dataset: QuizDataset;
  onSaveDataset: (newDataset: QuizDataset) => void;
  onResetDataset: () => void;
  onBackToHome: () => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({
  dataset,
  onSaveDataset,
  onResetDataset,
  onBackToHome,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [showBulkImport, setShowBulkImport] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Form states for Add / Edit
  const [formCategory, setFormCategory] = useState<string>('tham-muu');
  const [formQuestion, setFormQuestion] = useState<string>('');
  const [formOptions, setFormOptions] = useState<string[]>(['', '', '', '']);
  const [formAnswer, setFormAnswer] = useState<number>(0);
  const [formExplanation, setFormExplanation] = useState<string>('');
  const [showFormPreview, setShowFormPreview] = useState<boolean>(false);

  // Bulk Import state
  const [bulkText, setBulkText] = useState<string>('');
  const [bulkMode, setBulkMode] = useState<'append' | 'replace'>('append');
  const [bulkCategory, setBulkCategory] = useState<string>('tham-muu');
  const [importStatus, setImportStatus] = useState<{ message: string; isError: boolean } | null>(null);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return dataset.questions.filter((q) => {
      const matchCat = selectedCategory === 'all' || q.categoryId === selectedCategory;
      const matchSearch =
        searchQuery.trim() === '' ||
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.options.some((opt) => opt.toLowerCase().includes(searchQuery.toLowerCase())) ||
        q.number.toString().includes(searchQuery.trim());
      return matchCat && matchSearch;
    });
  }, [dataset.questions, selectedCategory, searchQuery]);

  // Open modal for new question
  const handleOpenAdd = () => {
    setEditingQuestion(null);
    setFormCategory(selectedCategory === 'all' ? 'tham-muu' : selectedCategory);
    setFormQuestion('');
    setFormOptions(['', '', '', '']);
    setFormAnswer(0);
    setFormExplanation('');
    setShowFormPreview(false);
    setIsAddingNew(true);
  };

  // Open modal for editing
  const handleOpenEdit = (q: Question) => {
    setEditingQuestion(q);
    setFormCategory(q.categoryId);
    setFormQuestion(q.question);
    setFormOptions(q.options.length >= 4 ? [...q.options] : [...q.options, '', '', ''].slice(0, 4));
    setFormAnswer(q.answer);
    setFormExplanation(q.explanation || '');
    setShowFormPreview(false);
    setIsAddingNew(false);
  };

  // Save Add/Edit
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim() || formOptions.filter((o) => o.trim()).length < 2) {
      alert('Vui lòng nhập nội dung câu hỏi và ít nhất 2 đáp án!');
      return;
    }

    const catObj = dataset.categories.find((c) => c.id === formCategory);
    const catName = catObj ? catObj.name : 'Chuyên đề';

    const validOptions = formOptions.map((o) => o.trim()).filter(Boolean);

    let updatedQuestions = [...dataset.questions];

    if (editingQuestion) {
      // Edit existing
      updatedQuestions = updatedQuestions.map((q) => {
        if (q.id === editingQuestion.id) {
          return {
            ...q,
            categoryId: formCategory,
            category: catName,
            question: formQuestion.trim(),
            options: validOptions,
            answer: Math.min(formAnswer, validOptions.length - 1),
            answerLetter: String.fromCharCode(65 + formAnswer),
            explanation: formExplanation.trim() || `Đáp án đúng là ${String.fromCharCode(65 + formAnswer)}.`,
          };
        }
        return q;
      });
    } else {
      // Add new
      const newNum = updatedQuestions.length + 1;
      const newQ: Question = {
        id: `${formCategory}-${Date.now()}`,
        number: newNum,
        categoryId: formCategory,
        category: catName,
        question: formQuestion.trim(),
        options: validOptions,
        answer: Math.min(formAnswer, validOptions.length - 1),
        answerLetter: String.fromCharCode(65 + formAnswer),
        explanation: formExplanation.trim() || `Đáp án đúng là ${String.fromCharCode(65 + formAnswer)}.`,
      };
      updatedQuestions.push(newQ);
    }

    // Recalculate categories counts
    const updatedCategories = dataset.categories.map((c) => ({
      ...c,
      count: c.id === 'all' ? updatedQuestions.length : updatedQuestions.filter((q) => q.categoryId === c.id).length,
    }));

    const newDataset: QuizDataset = {
      ...dataset,
      totalQuestions: updatedQuestions.length,
      categories: updatedCategories,
      questions: updatedQuestions,
    };

    onSaveDataset(newDataset);
    setIsAddingNew(false);
    setEditingQuestion(null);
  };

  // Delete Question
  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
      const updatedQuestions = dataset.questions.filter((q) => q.id !== id);
      const updatedCategories = dataset.categories.map((c) => ({
        ...c,
        count: c.id === 'all' ? updatedQuestions.length : updatedQuestions.filter((q) => q.categoryId === c.id).length,
      }));
      onSaveDataset({
        ...dataset,
        totalQuestions: updatedQuestions.length,
        categories: updatedCategories,
        questions: updatedQuestions,
      });
    }
  };

  // Export JSON file
  const handleExportJson = () => {
    downloadJson(dataset, 'questions.json');
  };

  // Copy JSON to Clipboard
  const handleCopyJson = () => {
    const jsonStr = JSON.stringify(dataset, null, 2);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(jsonStr);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // Parse Bulk Import (CSV / TSV / Excel copy paste or formatted text)
  const handleProcessBulkImport = () => {
    if (!bulkText.trim()) {
      setImportStatus({ message: 'Vui lòng dán dữ liệu câu hỏi!', isError: true });
      return;
    }

    const lines = bulkText.split('\n').map((l) => l.trim()).filter(Boolean);
    const parsedList: Question[] = [];
    const catObj = dataset.categories.find((c) => c.id === bulkCategory);
    const catName = catObj ? catObj.name : 'Chuyên đề';

    // Check if table format: delimited by TAB or |
    const isDelimited = lines.some((l) => l.includes('\t') || l.includes('|'));

    if (isDelimited) {
      lines.forEach((line, idx) => {
        // Skip header line if contains 'Câu hỏi' or 'STT'
        if (line.toLowerCase().includes('câu hỏi') || line.toLowerCase().includes('đáp án') && idx === 0) {
          return;
        }

        const delimiter = line.includes('\t') ? '\t' : '|';
        const parts = line.split(delimiter).map((p) => p.trim());

        // Format: STT | Câu hỏi | A | B | C | D | Đáp án | Giải thích
        if (parts.length >= 6) {
          let qContent = parts[1];
          let optA = parts[2];
          let optB = parts[3];
          let optC = parts[4];
          let optD = parts[5];
          let ansStr = parts[6] || 'A';
          let expl = parts[7] || '';

          // If no STT column (starts directly with Question)
          if (!optD && parts.length === 6) {
            qContent = parts[0];
            optA = parts[1];
            optB = parts[2];
            optC = parts[3];
            optD = parts[4];
            ansStr = parts[5];
          }

          const ansLetter = ansStr.trim().toUpperCase().charAt(0);
          const letterMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
          const ansIndex = letterMap[ansLetter] ?? 0;

          const options = [optA, optB, optC, optD].filter(Boolean);

          if (qContent && options.length >= 2) {
            parsedList.push({
              id: `${bulkCategory}-bulk-${Date.now()}-${idx}`,
              number: dataset.questions.length + parsedList.length + 1,
              category: catName,
              categoryId: bulkCategory,
              question: qContent,
              options: options,
              answer: ansIndex,
              answerLetter: ansLetter,
              explanation: expl || `Đáp án đúng là ${ansLetter}.`,
            });
          }
        }
      });
    } else {
      // Fallback text format:
      // Câu X: ...
      // a) ...
      // b) ...
      // c) ...
      // d) ...
      // Đáp án: A
      setImportStatus({
        message: 'Dữ liệu không khớp định dạng bảng cột (STT | Câu hỏi | A | B | C | D | Đáp án | Giải thích). Vui lòng kiểm tra lại!',
        isError: true,
      });
      return;
    }

    if (parsedList.length === 0) {
      setImportStatus({
        message: 'Không phân tích được câu hỏi nào. Vui lòng kiểm tra lại cấu trúc các cột ngăn cách bởi dấu | hoặc phím Tab (Excel)!',
        isError: true,
      });
      return;
    }

    let finalQuestions: Question[];
    if (bulkMode === 'replace') {
      finalQuestions = parsedList;
    } else {
      finalQuestions = [...dataset.questions, ...parsedList];
    }

    // Update categories
    const updatedCategories = dataset.categories.map((c) => ({
      ...c,
      count: c.id === 'all' ? finalQuestions.length : finalQuestions.filter((q) => q.categoryId === c.id).length,
    }));

    onSaveDataset({
      ...dataset,
      totalQuestions: finalQuestions.length,
      categories: updatedCategories,
      questions: finalQuestions,
    });

    setImportStatus({
      message: `Đã nhập thành công ${parsedList.length} câu hỏi!`,
      isError: false,
    });
    setBulkText('');
    setTimeout(() => {
      setShowBulkImport(false);
      setImportStatus(null);
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10 space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              QUẢN TRỊ NGÂN HÀNG CÂU HỎI
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {dataset.totalQuestions} câu
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Chỉnh sửa, thêm bớt câu hỏi cục bộ và xuất file <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">questions.json</code> để đưa lên GitHub Pages.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportJson}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5 transition-all"
            title="Tải về file questions.json"
          >
            <Download className="w-4 h-4" />
            <span>XUẤT QUESTIONS.JSON</span>
          </button>

          <button
            onClick={handleCopyJson}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all"
            title="Sao chép toàn bộ JSON"
          >
            {copySuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copySuccess ? 'Đã sao chép!' : 'Sao chép JSON'}</span>
          </button>

          <button
            onClick={() => setShowBulkImport(true)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all"
            title="Nhập hàng loạt từ Excel / CSV"
          >
            <Upload className="w-4 h-4" />
            <span>Nhập Excel / CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm câu hỏi</span>
          </button>
        </div>
      </div>

      {/* Guide Card: How to update website on GitHub Pages */}
      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 text-xs text-slate-700 dark:text-slate-300 space-y-2">
        <h3 className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5 text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Hướng dẫn cập nhật câu hỏi lên GitHub Pages (Link giữ nguyên)
        </h3>
        <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400">
          <li>Chỉnh sửa hoặc thêm câu hỏi trực tiếp trên giao diện này.</li>
          <li>Bấm nút <strong>"XUẤT QUESTIONS.JSON"</strong> để tải file về máy.</li>
          <li>Chép đè file <code className="font-mono font-semibold text-slate-800 dark:text-slate-200">questions.json</code> vào thư mục <code className="font-mono font-semibold text-slate-800 dark:text-slate-200">src/data/questions.json</code> của project.</li>
          <li>Đẩy code lên GitHub (<code className="font-mono">git push</code>). GitHub Actions sẽ tự động cập nhật website trong vòng 1-2 phút, <strong>LINK HOÀN TOÀN GIỮ NGUYÊN</strong>!</li>
        </ol>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo số câu hoặc từ khóa nội dung câu hỏi..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 dark:text-slate-300"
          >
            {dataset.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.count})
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              if (window.confirm('Khôi phục lại 250 câu hỏi mặc định ban đầu của Binh chủng Công binh? Mọi chỉnh sửa chưa xuất sẽ bị hủy.')) {
                onResetDataset();
              }
            }}
            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
            title="Khôi phục ngân hàng câu hỏi gốc"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Questions Table / List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Hiển thị {filteredQuestions.length} câu hỏi</span>
          <span>Chuyên đề: {dataset.categories.find((c) => c.id === selectedCategory)?.name}</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-[600px] overflow-y-auto">
          {filteredQuestions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Không tìm thấy câu hỏi phù hợp.
            </div>
          ) : (
            filteredQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 sm:p-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      Câu {q.number || idx + 1}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate">
                      {q.category}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      Đáp án: {String.fromCharCode(65 + q.answer)}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                    {q.question}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-slate-500 pt-1">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`truncate ${
                          oIdx === q.answer ? 'font-bold text-emerald-600 dark:text-emerald-400' : ''
                        }`}
                      >
                        {String.fromCharCode(65 + oIdx)}. {opt}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleOpenEdit(q)}
                    className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                    title="Chỉnh sửa câu hỏi"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    title="Xóa câu hỏi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: Add / Edit Question */}
      {(isAddingNew || editingQuestion) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
              </h3>
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingQuestion(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Chuyên đề
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  {dataset.categories
                    .filter((c) => c.id !== 'all')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Nội dung câu hỏi
                </label>
                <textarea
                  rows={3}
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="Nhập nội dung câu hỏi..."
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Options A, B, C, D & Correct Answer Radio */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  Các phương án trả lời (chọn nút tròn để đánh dấu ĐÁP ÁN ĐÚNG):
                </label>
                <div className="space-y-2">
                  {formOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <label className="flex items-center gap-1 cursor-pointer shrink-0">
                        <input
                          type="radio"
                          name="correct_answer"
                          checked={formAnswer === idx}
                          onChange={() => setFormAnswer(idx)}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="font-bold text-xs text-slate-700 dark:text-slate-300 w-4">
                          {String.fromCharCode(65 + idx)}
                        </span>
                      </label>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...formOptions];
                          updated[idx] = e.target.value;
                          setFormOptions(updated);
                        }}
                        placeholder={`Nhập đáp án ${String.fromCharCode(65 + idx)}...`}
                        className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required={idx < 2}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Giải thích đáp án (tùy chọn)
                </label>
                <textarea
                  rows={2}
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  placeholder="Ghi chú căn cứ hoặc giải thích câu trả lời đúng..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl flex items-center justify-between text-xs text-slate-500">
                <span>Đáp án đúng được chọn: <strong>{String.fromCharCode(65 + formAnswer)}</strong></span>
                <button
                  type="button"
                  onClick={() => setShowFormPreview(!showFormPreview)}
                  className="text-emerald-600 font-semibold flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{showFormPreview ? 'Ẩn xem trước' : 'Xem trước'}</span>
                </button>
              </div>

              {/* Preview Box */}
              {showFormPreview && (
                <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white">
                    {formQuestion || '(Chưa nhập nội dung câu hỏi)'}
                  </div>
                  <div className="space-y-1">
                    {formOptions.map((opt, i) => (
                      <div
                        key={i}
                        className={`p-1.5 rounded-lg ${
                          formAnswer === i
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {String.fromCharCode(65 + i)}. {opt || `(Đáp án ${String.fromCharCode(65 + i)})`}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingQuestion(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Bulk Import */}
      {showBulkImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Nhập câu hỏi hàng loạt từ Excel / CSV
                </h3>
              </div>
              <button
                onClick={() => setShowBulkImport(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl text-xs text-slate-600 dark:text-slate-400 space-y-1 border border-slate-200 dark:border-slate-800">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Cấu trúc các cột chuẩn (Copy trực tiếp từ Excel hoặc dán dạng ngăn cách bởi dấu |):
                </p>
                <code className="block p-2 rounded bg-white dark:bg-slate-900 font-mono text-[11px] border border-slate-200 dark:border-slate-700">
                  STT | Câu hỏi | Đáp án A | Đáp án B | Đáp án C | Đáp án D | Đáp án đúng (A/B/C/D) | Giải thích
                </code>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Nhập vào chuyên đề
                  </label>
                  <select
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    {dataset.categories
                      .filter((c) => c.id !== 'all')
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Phương thức nhập
                  </label>
                  <select
                    value={bulkMode}
                    onChange={(e) => setBulkMode(e.target.value as 'append' | 'replace')}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="append">Thêm nối tiếp vào danh sách hiện có</option>
                    <option value="replace">Thay thế toàn bộ câu hỏi hiện có</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Dán nội dung từ bảng Excel hoặc file CSV vào đây:
                </label>
                <textarea
                  rows={8}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder="Ví dụ:&#10;1 | Lực lượng công binh gồm những thành phần nào? | Đáp án 1 | Đáp án 2 | Đáp án 3 | Đáp án 4 | A | Theo điều lệ 2020"
                  className="w-full p-3 rounded-xl font-mono text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {importStatus && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium ${
                    importStatus.isError
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  }`}
                >
                  {importStatus.message}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowBulkImport(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Đóng
                </button>
                <button
                  onClick={handleProcessBulkImport}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  Xác nhận nhập dữ liệu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
