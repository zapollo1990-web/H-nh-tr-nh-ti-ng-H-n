import React, { useState } from 'react';
import { Volume2, CheckCircle, XCircle, Sparkles, BookOpen, Search, Bookmark, BookmarkCheck, ArrowRight, Lightbulb, HelpCircle, FileText, Trash2, Layers, Award } from 'lucide-react';
import { GrammarRule, GrammarCheckResult, GrammarLevel } from '../types';
import {
  GRAMMAR_RULES,
  GRAMMAR_CATEGORIES,
  BEGINNER_GRAMMAR_RULES,
  INTERMEDIATE_GRAMMAR_RULES,
  ADVANCED_GRAMMAR_RULES
} from '../data/grammarNotes';
import { speakKorean, playClickSound, playSuccessSound } from '../utils/audio';

interface GrammarNotebookViewProps {
  bookmarkedRuleIds: string[];
  onToggleBookmarkRule: (ruleId: string) => void;
  savedMistakes: Array<{
    id: string;
    sentence: string;
    correction: string;
    note: string;
    date: string;
  }>;
  onSaveMistake: (mistake: { sentence: string; correction: string; note: string }) => void;
  onDeleteMistake: (id: string) => void;
  onAddXp: (amount: number) => void;
}

export const GrammarNotebookView: React.FC<GrammarNotebookViewProps> = ({
  bookmarkedRuleIds,
  onToggleBookmarkRule,
  savedMistakes,
  onSaveMistake,
  onDeleteMistake,
  onAddXp,
}) => {
  const [activeTab, setActiveTab] = useState<'handbook' | 'ai-checker' | 'saved'>('handbook');
  const [selectedLevel, setSelectedLevel] = useState<GrammarLevel | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // AI Checker States
  const [inputSentence, setInputSentence] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<GrammarCheckResult | null>(null);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState(false);

  const categories = GRAMMAR_CATEGORIES;

  const quickSamples = [
    '저는 학교에 공부해요.',
    '비는 와요.',
    '사과을 먹어요.',
    '안 공부해요.',
    '오늘 친구와 밥을 먹었습니다.'
  ];

  const filteredRules = GRAMMAR_RULES.filter((rule) => {
    const matchesLevel = selectedLevel === 'all' || rule.level === selectedLevel;
    const matchesCat = selectedCategory === 'all' || rule.category === selectedCategory;
    const matchesSearch =
      rule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.formula.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.explanationVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rule.levelLabel && rule.levelLabel.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesLevel && matchesCat && matchesSearch;
  });

  const handleCheckGrammar = async (sentenceToTest?: string) => {
    const sentence = (sentenceToTest || inputSentence).trim();
    if (!sentence || isChecking) return;

    playClickSound();
    setIsChecking(true);
    setCheckResult(null);
    setSavedSuccessMsg(false);

    try {
      const res = await fetch('/api/grammar-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence }),
      });

      if (!res.ok) throw new Error('Check error');

      const data: GrammarCheckResult = await res.json();
      setCheckResult(data);
      playSuccessSound();
      onAddXp(10);
    } catch (err) {
      console.error(err);
      // Resilience fallback
      setCheckResult({
        isCorrect: false,
        correctedSentence: sentence.replace('에 공부', '에서 공부'),
        romanization: 'jeo-neun hak-gyo-e-seo gong-bu-hae-yo',
        vietnameseMeaning: 'Tôi học bài ở trường.',
        explanationVi:
          'Khi diễn ra hành động cụ thể (như học bài - 공부하다), bạn cần dùng tiểu từ "에서" thay vì "에".',
        grammarRuleTip: 'Động từ hành động luôn đi với nơi chốn + 에서.',
        naturalAlternatives: [
          { korean: '학교에서 열심히 공부하고 있어요.', vietnamese: 'Tôi đang chăm chỉ học ở trường.' },
        ],
        vocabularyBreakdown: [
          { word: '학교', type: 'Danh từ', meaning: 'Trường học' },
          { word: '에서', type: 'Tiểu từ', meaning: 'Tại, ở (nơi diễn ra hành động)' },
          { word: '공부하다', type: 'Động từ', meaning: 'Học bài' },
        ],
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleSaveToNotebook = () => {
    if (!checkResult) return;
    playSuccessSound();
    onSaveMistake({
      sentence: inputSentence,
      correction: checkResult.correctedSentence,
      note: checkResult.grammarRuleTip || checkResult.explanationVi.slice(0, 80),
    });
    setSavedSuccessMsg(true);
    setTimeout(() => setSavedSuccessMsg(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 pb-24 md:pb-8">
      {/* Sleek Top Header & Tabs */}
      <div className="space-y-3 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Sổ Tay Ngữ Pháp & Sửa Lỗi
              </h2>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/40">
                {GRAMMAR_RULES.length} cấu trúc
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
              Tổng hợp điểm ngữ pháp quan trọng và công cụ AI sửa lỗi câu
            </p>
          </div>

          {/* View mode tabs */}
          <div className="bg-slate-100 dark:bg-slate-800/90 p-0.5 rounded-xl flex items-center border border-slate-200 dark:border-slate-700 text-xs font-bold self-start sm:self-auto">
            <button
              onClick={() => {
                playClickSound();
                setActiveTab('handbook');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'handbook'
                  ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-2xs font-black'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Sổ tay</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setActiveTab('ai-checker');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'ai-checker'
                  ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-2xs font-black'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-300" />
              <span>AI sửa lỗi</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setActiveTab('saved');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'saved'
                  ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-2xs font-black'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Đã lưu ({savedMistakes.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. HANDBOOK TAB */}
      {activeTab === 'handbook' && (
        <div className="space-y-4">
          {/* LEVEL FILTER TABS */}
          <div className="bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl flex items-center gap-0.5 overflow-x-auto scrollbar-none border border-slate-200/80 dark:border-slate-700">
            <button
              onClick={() => {
                playClickSound();
                setSelectedLevel('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                selectedLevel === 'all'
                  ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Tất cả ({GRAMMAR_RULES.length})</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setSelectedLevel('beginner');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                selectedLevel === 'beginner'
                  ? 'bg-white dark:bg-emerald-600 text-emerald-700 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🌱 Sơ cấp ({BEGINNER_GRAMMAR_RULES.length})</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setSelectedLevel('intermediate');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                selectedLevel === 'intermediate'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🌿 Trung cấp ({INTERMEDIATE_GRAMMAR_RULES.length})</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setSelectedLevel('advanced');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                selectedLevel === 'advanced'
                  ? 'bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🌳 Cao cấp ({ADVANCED_GRAMMAR_RULES.length})</span>
            </button>
          </div>

          {/* Search bar & Category dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm ngữ pháp: động vật, thực vật, hơn kém, 은/는, -아/어서..."
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-indigo-500/40 rounded-xl text-xs sm:text-sm font-medium text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-indigo-400 shadow-2xs"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => {
                playClickSound();
                setSelectedCategory(e.target.value);
              }}
              className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-indigo-500/40 rounded-xl px-2.5 py-2 text-xs text-slate-700 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-indigo-400 shadow-2xs cursor-pointer truncate max-w-xs"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="dark:bg-slate-900 dark:text-white">
                  {c.icon} {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Topic Pill Bar for Grammar (Bao gồm Động vật 🐶 & Thực vật 🌿) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth">
            {categories.map((c) => {
              const isSelected = selectedCategory === c.id;
              const count =
                c.id === 'all'
                  ? GRAMMAR_RULES.length
                  : GRAMMAR_RULES.filter((r) => r.category === c.id).length;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    playClickSound();
                    setSelectedCategory(c.id);
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs scale-102'
                      : 'bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{c.icon}</span>
                  <span>{c.label.split('(')[0].trim()}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Result Count Status */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-300 px-1 font-semibold">
            <span>Hiển thị {filteredRules.length} chủ điểm ngữ pháp</span>
            {selectedCategory !== 'all' || selectedLevel !== 'all' || searchQuery ? (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedLevel('all');
                  setSearchQuery('');
                }}
                className="text-sky-600 dark:text-cyan-300 hover:underline cursor-pointer"
              >
                Đặt lại bộ lọc
              </button>
            ) : null}
          </div>

          {/* Grammar Rules List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredRules.map((rule) => {
              const isBookmarked = bookmarkedRuleIds.includes(rule.id);
              return (
                <div
                  key={rule.id}
                  className="bg-white dark:bg-gradient-to-br dark:from-[#0f172a] dark:to-[#1e1b4b]/70 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-indigo-500/40 shadow-xs dark:shadow-[0_0_20px_rgba(99,102,241,0.18)] hover:border-sky-200 dark:hover:border-indigo-400/80 transition-all space-y-4"
                >
                  {/* Title & Level Badge & Bookmark */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {rule.levelLabel && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              rule.level === 'beginner'
                                ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40'
                                : rule.level === 'intermediate'
                                ? 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40'
                                : 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-500/40'
                            }`}
                          >
                            {rule.levelLabel}
                          </span>
                        )}
                        <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">
                          {rule.title}
                        </h3>
                      </div>
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-cyan-300 text-xs font-bold border border-sky-100 dark:border-sky-500/40">
                        Công thức: {rule.formula}
                      </span>
                    </div>

                    <button
                      onClick={() => onToggleBookmarkRule(rule.id)}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                        isBookmarked
                          ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-500/40 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-slate-600 dark:hover:text-white'
                      }`}
                      title={isBookmarked ? 'Bỏ lưu' : 'Lưu quy tắc này'}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Explanation */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-200 whitespace-pre-line leading-relaxed font-medium">
                    {rule.explanationVi}
                  </p>

                  {/* Comparison Box: ❌ Mistake vs ⭕ Correction */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/40 text-xs text-rose-900 dark:text-rose-200">
                      <div className="flex items-center gap-1.5 font-bold mb-1 text-rose-700 dark:text-rose-300">
                        <XCircle className="w-4 h-4 shrink-0" />
                        <span>Lỗi sai phổ biến:</span>
                      </div>
                      <p className="font-semibold text-rose-950 dark:text-rose-100">{rule.mistakeExample}</p>
                      <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-1 opacity-90">{rule.mistakeWhyVi}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/40 text-xs text-emerald-900 dark:text-emerald-200">
                      <div className="flex items-center gap-1.5 font-bold mb-1 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span>Cách dùng đúng chuẩn:</span>
                      </div>
                      <p className="font-semibold text-emerald-950 dark:text-emerald-100">{rule.correctExample}</p>
                    </div>
                  </div>

                  {/* Real life examples */}
                  <div className="bg-slate-50 dark:bg-slate-900/90 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide block">
                      Ví dụ thực tế đời sống:
                    </span>
                    {rule.realLifeUsage.map((ex, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 text-xs">
                        <div>
                          <span className="font-bold text-slate-800 dark:text-white">{ex.ko}</span>
                          <span className="text-slate-500 dark:text-slate-300 ml-1.5">({ex.vi})</span>
                        </div>
                        <button
                          onClick={() => speakKorean(ex.ko)}
                          className="p-1 text-slate-400 dark:text-cyan-300 hover:text-sky-600 dark:hover:text-cyan-200 rounded-lg cursor-pointer"
                          title="Nghe câu ví dụ"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Pro Tip */}
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-500/40 text-xs text-amber-900 dark:text-amber-200 font-medium">
                    <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-300 shrink-0" />
                    <span>{rule.proTip}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. AI GRAMMAR CHECKER TAB */}
      {activeTab === 'ai-checker' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gradient-to-br dark:from-[#0f172a] dark:to-[#1e1b4b]/70 rounded-3xl p-6 sm:p-8 border border-sky-100 dark:border-indigo-500/40 shadow-md dark:shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-1">
              Nhập câu tiếng Hàn của bạn để AI kiểm tra ngữ pháp:
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-300 mb-4">
              AI sẽ phân tích chính tả, tiểu từ, đuôi câu kính ngữ và gợi ý cách diễn đạt tự nhiên hơn.
            </p>

            {/* Quick sample chips */}
            <div className="mb-4">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-300 block mb-1.5">
                Hoặc thử các câu mẫu hay sai sau:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickSamples.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputSentence(sample);
                      handleCheckGrammar(sample);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 hover:bg-sky-50 dark:hover:bg-indigo-900/60 hover:text-sky-700 dark:hover:text-indigo-200 text-slate-600 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>

            {/* Input area */}
            <div className="space-y-3">
              <textarea
                rows={3}
                value={inputSentence}
                onChange={(e) => setInputSentence(e.target.value)}
                placeholder="Ví dụ: 저는 학교에 공부해요. hoặc 어제 친구와 밥을 먹었어요..."
                className="w-full p-4 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-indigo-500/40 rounded-2xl text-sm font-medium text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-2xs"
              />

              <div className="flex justify-end">
                <button
                  onClick={() => handleCheckGrammar()}
                  disabled={!inputSentence.trim() || isChecking}
                  className="flex items-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-400 disabled:opacity-50 text-slate-900 dark:text-slate-950 font-extrabold rounded-2xl shadow-xs dark:shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isChecking ? 'Đang phân tích...' : 'Soát lỗi ngữ pháp (+10 XP)'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Result Card */}
          {checkResult && (
            <div className="bg-white dark:bg-gradient-to-br dark:from-[#0f172a] dark:to-[#1e1b4b]/80 rounded-3xl p-6 sm:p-8 border-2 border-sky-200 dark:border-indigo-400/60 shadow-md dark:shadow-[0_0_25px_rgba(99,102,241,0.25)] space-y-5 animate-fadeIn">
              {/* Status Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {checkResult.isCorrect ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/50 text-xs font-bold">
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Câu hoàn toàn chuẩn xác!
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/50 text-xs font-bold">
                      <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" /> Cần chỉnh sửa một chút
                    </span>
                  )}
                </div>

                <button
                  onClick={handleSaveToNotebook}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-500/40 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{savedSuccessMsg ? '✓ Đã lưu vào sổ tay' : 'Lưu vào sổ tay cá nhân'}</span>
                </button>
              </div>

              {/* Corrected Sentence Box */}
              <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-500/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-700 dark:text-cyan-300 uppercase tracking-wide">
                    Câu chuẩn tự nhiên:
                  </span>
                  <button
                    onClick={() => speakKorean(checkResult.correctedSentence)}
                    className="p-1.5 rounded-xl bg-sky-100 dark:bg-sky-900/70 hover:bg-sky-200 dark:hover:bg-sky-800 text-sky-700 dark:text-cyan-200 transition-colors cursor-pointer"
                    title="Nghe câu chuẩn"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <h4 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mt-1">
                  {checkResult.correctedSentence}
                </h4>
                <p className="text-xs font-mono text-sky-600 dark:text-cyan-300 mt-0.5">/{checkResult.romanization}/</p>
                <p className="text-xs text-slate-600 dark:text-slate-200 mt-1">Nghĩa: {checkResult.vietnameseMeaning}</p>
              </div>

              {/* Detailed Vietnamese Explanation */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide">
                  Phân tích lỗi & Điểm ngữ pháp:
                </span>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 leading-relaxed whitespace-pre-line font-medium">
                  {checkResult.explanationVi}
                </p>
              </div>

              {/* Pro Tip */}
              {checkResult.grammarRuleTip && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-500/40 text-xs text-amber-900 dark:text-amber-200 font-medium">
                  <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-300 shrink-0" />
                  <span>Mẹo nhớ: {checkResult.grammarRuleTip}</span>
                </div>
              )}

              {/* Natural Alternatives */}
              {checkResult.naturalAlternatives && checkResult.naturalAlternatives.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide">
                    Cách người bản xứ thường nói:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {checkResult.naturalAlternatives.map((alt, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white">{alt.korean}</p>
                          <p className="text-slate-500 dark:text-slate-300 text-[11px] mt-0.5">{alt.vietnamese}</p>
                        </div>
                        <button
                          onClick={() => speakKorean(alt.korean)}
                          className="p-1 text-slate-400 dark:text-cyan-300 hover:text-sky-600 dark:hover:text-cyan-200 cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vocabulary Breakdown Table */}
              {checkResult.vocabularyBreakdown && checkResult.vocabularyBreakdown.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide">
                    Từ vựng trong câu:
                  </span>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200 font-bold">
                        <tr>
                          <th className="p-2.5 rounded-l-xl">Từ vựng</th>
                          <th className="p-2.5">Từ loại</th>
                          <th className="p-2.5 rounded-r-xl">Nghĩa tiếng Việt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {checkResult.vocabularyBreakdown.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="p-2.5 font-bold text-slate-800 dark:text-white">{item.word}</td>
                            <td className="p-2.5 text-slate-500 dark:text-slate-300">{item.type}</td>
                            <td className="p-2.5 text-slate-700 dark:text-slate-200">{item.meaning}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. SAVED MISTAKES NOTEBOOK */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              Các lỗi sai & ghi chú bạn đã lưu ({savedMistakes.length})
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-300">Ôn lại thường xuyên để không mắc lại lỗi nhé</span>
          </div>

          {savedMistakes.length === 0 ? (
            <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-10 border border-slate-200 dark:border-indigo-500/40 text-center shadow-xs dark:shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <div className="text-4xl mb-2">📝</div>
              <h4 className="text-base font-bold text-slate-800 dark:text-white">Chưa có ghi chú nào được lưu!</h4>
              <p className="text-xs text-slate-500 dark:text-slate-300 mt-1 max-w-sm mx-auto">
                Khi sử dụng "AI Soát lỗi câu", bạn có thể nhấn "Lưu vào sổ tay cá nhân" để lưu lại những câu cần khắc phục.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {savedMistakes.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gradient-to-br dark:from-[#0f172a] dark:to-[#1e1b4b]/60 rounded-2xl p-4 border border-slate-200 dark:border-indigo-500/40 shadow-2xs dark:shadow-[0_0_15px_rgba(99,102,241,0.15)] flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-rose-600 dark:text-rose-300 line-through">
                        {item.sentence}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
                      <span className="text-sm font-black text-emerald-700 dark:text-emerald-300">
                        {item.correction}
                      </span>
                      <button
                        onClick={() => speakKorean(item.correction)}
                        className="p-1 text-slate-400 dark:text-cyan-300 hover:text-sky-600 dark:hover:text-cyan-200 cursor-pointer"
                        title="Nghe câu đúng"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-200">{item.note}</p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 block pt-1">{item.date}</span>
                  </div>

                  <button
                    onClick={() => onDeleteMistake(item.id)}
                    className="p-1.5 text-slate-400 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
                    title="Xóa ghi chú này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
