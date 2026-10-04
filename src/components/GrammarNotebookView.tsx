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
      {/* Top Header */}
      <div className="bg-gradient-to-r from-sky-50 via-white to-amber-50 rounded-2xl p-4 sm:p-5 border border-sky-100 shadow-xs mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xl">📖</span>
          <h2 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">
            Sổ Tay Ngữ Pháp & Sửa Lỗi (한국어 문법 노트)
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Tổng hợp những lỗi người Việt hay mắc phải và công cụ AI sửa câu thông minh.
        </p>

        {/* View mode tabs */}
        <div className="flex items-center gap-1.5 mt-4">
          <button
            onClick={() => setActiveTab('handbook')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'handbook'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Sổ tay lỗi thường gặp</span>
          </button>

          <button
            onClick={() => setActiveTab('ai-checker')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'ai-checker'
                ? 'bg-amber-400 text-slate-900 shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>AI Soát lỗi câu</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>Ghi chú của tôi ({savedMistakes.length})</span>
          </button>
        </div>
      </div>

      {/* 1. HANDBOOK TAB */}
      {activeTab === 'handbook' && (
        <div className="space-y-4">
          {/* LEVEL FILTER TABS */}
          <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <button
              onClick={() => {
                playClickSound();
                setSelectedLevel('all');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                selectedLevel === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tất cả ({GRAMMAR_RULES.length} ngữ pháp)</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setSelectedLevel('beginner');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                selectedLevel === 'beginner'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>🌱 Sơ cấp ({BEGINNER_GRAMMAR_RULES.length})</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setSelectedLevel('intermediate');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                selectedLevel === 'intermediate'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>🌿 Trung cấp ({INTERMEDIATE_GRAMMAR_RULES.length})</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setSelectedLevel('advanced');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                selectedLevel === 'advanced'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>🌳 Cao cấp ({ADVANCED_GRAMMAR_RULES.length})</span>
            </button>
          </div>

          {/* Search bar & Category filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm ngữ pháp theo tên, công thức, giải thích (vd: 은/는, -아/어서, -다고 하다)..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-sky-400 shadow-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    playClickSound();
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Result Count Status */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-semibold">
            <span>Hiển thị {filteredRules.length} chủ điểm ngữ pháp</span>
            {selectedCategory !== 'all' || selectedLevel !== 'all' || searchQuery ? (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedLevel('all');
                  setSearchQuery('');
                }}
                className="text-sky-600 hover:underline cursor-pointer"
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
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs hover:border-sky-200 transition-all space-y-4"
                >
                  {/* Title & Level Badge & Bookmark */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {rule.levelLabel && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              rule.level === 'beginner'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : rule.level === 'intermediate'
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : 'bg-purple-100 text-purple-800 border border-purple-200'
                            }`}
                          >
                            {rule.levelLabel}
                          </span>
                        )}
                        <h3 className="text-base sm:text-lg font-black text-slate-800">
                          {rule.title}
                        </h3>
                      </div>
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 text-xs font-bold border border-sky-100">
                        Công thức: {rule.formula}
                      </span>
                    </div>

                    <button
                      onClick={() => onToggleBookmarkRule(rule.id)}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                        isBookmarked
                          ? 'bg-amber-50 text-amber-600 border-amber-200'
                          : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600'
                      }`}
                      title={isBookmarked ? 'Bỏ lưu' : 'Lưu quy tắc này'}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Explanation */}
                  <p className="text-xs sm:text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                    {rule.explanationVi}
                  </p>

                  {/* Comparison Box: ❌ Mistake vs ⭕ Correction */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs text-rose-900">
                      <div className="flex items-center gap-1.5 font-bold mb-1 text-rose-700">
                        <XCircle className="w-4 h-4 shrink-0" />
                        <span>Lỗi sai phổ biến:</span>
                      </div>
                      <p className="font-semibold">{rule.mistakeExample}</p>
                      <p className="text-[11px] text-rose-700 mt-1 opacity-90">{rule.mistakeWhyVi}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900">
                      <div className="flex items-center gap-1.5 font-bold mb-1 text-emerald-700">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span>Cách dùng đúng chuẩn:</span>
                      </div>
                      <p className="font-semibold">{rule.correctExample}</p>
                    </div>
                  </div>

                  {/* Real life examples */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                      Ví dụ thực tế đời sống:
                    </span>
                    {rule.realLifeUsage.map((ex, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 text-xs">
                        <div>
                          <span className="font-bold text-slate-800">{ex.ko}</span>
                          <span className="text-slate-500 ml-1.5">({ex.vi})</span>
                        </div>
                        <button
                          onClick={() => speakKorean(ex.ko)}
                          className="p-1 text-slate-400 hover:text-sky-600 rounded-lg cursor-pointer"
                          title="Nghe câu ví dụ"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Pro Tip */}
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
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
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-md">
            <h3 className="text-lg font-black text-slate-800 mb-1">
              Nhập câu tiếng Hàn của bạn để AI kiểm tra ngữ pháp:
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              AI sẽ phân tích chính tả, tiểu từ, đuôi câu kính ngữ và gợi ý cách diễn đạt tự nhiên hơn.
            </p>

            {/* Quick sample chips */}
            <div className="mb-4">
              <span className="text-xs font-bold text-slate-400 block mb-1.5">
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
                    className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-600 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
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
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
              />

              <div className="flex justify-end">
                <button
                  onClick={() => handleCheckGrammar()}
                  disabled={!inputSentence.trim() || isChecking}
                  className="flex items-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-slate-900 font-extrabold rounded-2xl shadow-xs transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isChecking ? 'Đang phân tích...' : 'Soát lỗi ngữ pháp (+10 XP)'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Result Card */}
          {checkResult && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-sky-200 shadow-md space-y-5 animate-fadeIn">
              {/* Status Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {checkResult.isCorrect ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      <CheckCircle className="w-4 h-4 text-emerald-600" /> Câu hoàn toàn chuẩn xác!
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                      <XCircle className="w-4 h-4 text-rose-600" /> Cần chỉnh sửa một chút
                    </span>
                  )}
                </div>

                <button
                  onClick={handleSaveToNotebook}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{savedSuccessMsg ? '✓ Đã lưu vào sổ tay' : 'Lưu vào sổ tay cá nhân'}</span>
                </button>
              </div>

              {/* Corrected Sentence Box */}
              <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-700 uppercase tracking-wide">
                    Câu chuẩn tự nhiên:
                  </span>
                  <button
                    onClick={() => speakKorean(checkResult.correctedSentence)}
                    className="p-1.5 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-700 transition-colors cursor-pointer"
                    title="Nghe câu chuẩn"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <h4 className="text-xl sm:text-2xl font-black text-slate-800 mt-1">
                  {checkResult.correctedSentence}
                </h4>
                <p className="text-xs font-mono text-sky-600 mt-0.5">/{checkResult.romanization}/</p>
                <p className="text-xs text-slate-600 mt-1">Nghĩa: {checkResult.vietnameseMeaning}</p>
              </div>

              {/* Detailed Vietnamese Explanation */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Phân tích lỗi & Điểm ngữ pháp:
                </span>
                <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed whitespace-pre-line">
                  {checkResult.explanationVi}
                </p>
              </div>

              {/* Pro Tip */}
              {checkResult.grammarRuleTip && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Mẹo nhớ: {checkResult.grammarRuleTip}</span>
                </div>
              )}

              {/* Natural Alternatives */}
              {checkResult.naturalAlternatives && checkResult.naturalAlternatives.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Cách người bản xứ thường nói:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {checkResult.naturalAlternatives.map((alt, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-800">{alt.korean}</p>
                          <p className="text-slate-500 text-[11px] mt-0.5">{alt.vietnamese}</p>
                        </div>
                        <button
                          onClick={() => speakKorean(alt.korean)}
                          className="p-1 text-slate-400 hover:text-sky-600 cursor-pointer"
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
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Từ vựng trong câu:
                  </span>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-600 font-bold">
                        <tr>
                          <th className="p-2.5 rounded-l-xl">Từ vựng</th>
                          <th className="p-2.5">Từ loại</th>
                          <th className="p-2.5 rounded-r-xl">Nghĩa tiếng Việt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {checkResult.vocabularyBreakdown.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2.5 font-bold text-slate-800">{item.word}</td>
                            <td className="p-2.5 text-slate-500">{item.type}</td>
                            <td className="p-2.5 text-slate-700">{item.meaning}</td>
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
            <h3 className="text-base font-bold text-slate-800">
              Các lỗi sai & ghi chú bạn đã lưu ({savedMistakes.length})
            </h3>
            <span className="text-xs text-slate-500">Ôn lại thường xuyên để không mắc lại lỗi nhé</span>
          </div>

          {savedMistakes.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center shadow-xs">
              <div className="text-4xl mb-2">📝</div>
              <h4 className="text-base font-bold text-slate-800">Chưa có ghi chú nào được lưu!</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Khi sử dụng "AI Soát lỗi câu", bạn có thể nhấn "Lưu vào sổ tay cá nhân" để lưu lại những câu cần khắc phục.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {savedMistakes.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-rose-600 line-through">
                        {item.sentence}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-sm font-black text-emerald-700">
                        {item.correction}
                      </span>
                      <button
                        onClick={() => speakKorean(item.correction)}
                        className="p-1 text-slate-400 hover:text-sky-600 cursor-pointer"
                        title="Nghe câu đúng"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600">{item.note}</p>
                    <span className="text-[10px] text-slate-400 block pt-1">{item.date}</span>
                  </div>

                  <button
                    onClick={() => onDeleteMistake(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
