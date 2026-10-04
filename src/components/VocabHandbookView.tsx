import React, { useState, useMemo } from 'react';
import { IllustratedVocab } from '../types';
import { INITIAL_ILLUSTRATED_VOCAB } from '../data/illustratedVocab';
import {
  Search,
  Volume2,
  Heart,
  Sparkles,
  LayoutGrid,
  BookOpen,
  Eye,
  EyeOff,
  PlusCircle,
  Loader2,
  CheckCircle2,
  BookmarkCheck,
  RefreshCw,
  Share2,
} from 'lucide-react';

interface VocabHandbookViewProps {
  onAddXp: (amount: number) => void;
  bookmarkedIds?: string[];
  onToggleBookmark?: (id: string) => void;
}

export const VocabHandbookView: React.FC<VocabHandbookViewProps> = ({
  onAddXp,
  bookmarkedIds: initialBookmarkedIds = [],
  onToggleBookmark,
}) => {
  // Local state for items (including custom/AI generated items)
  const [vocabList, setVocabList] = useState<IllustratedVocab[]>(() => {
    const saved = localStorage.getItem('korean_journey_custom_vocab');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return [...INITIAL_ILLUSTRATED_VOCAB, ...parsed];
      } catch (e) {
        console.error('Failed to parse saved vocab', e);
      }
    }
    return INITIAL_ILLUSTRATED_VOCAB;
  });

  // Local bookmarks state if not provided from parent
  const [localBookmarks, setLocalBookmarks] = useState<string[]>(initialBookmarkedIds);
  const [learnedIds, setLearnedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('korean_journey_learned_vocab');
    return saved ? JSON.parse(saved) : [];
  });

  // Filter & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'cards' | 'notebook' | 'quiz'>('cards');
  const [revealedQuizCards, setRevealedQuizCards] = useState<Record<string, boolean>>({});

  // AI Generator Modal state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiTopicInput, setAiTopicInput] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiErrorMessage, setAiErrorMessage] = useState('');
  const [activeAudioWord, setActiveAudioWord] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Audio pronunciation helper
  const handlePronounce = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.85; // Slightly slower for clarity
      setActiveAudioWord(text);
      utterance.onend = () => setActiveAudioWord(null);
      utterance.onerror = () => setActiveAudioWord(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = (id: string) => {
    if (onToggleBookmark) {
      onToggleBookmark(id);
    }
    setLocalBookmarks((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      return next;
    });
  };

  // Toggle Learned
  const handleToggleLearned = (id: string) => {
    setLearnedIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem('korean_journey_learned_vocab', JSON.stringify(next));
      if (!exists) {
        onAddXp(10);
      }
      return next;
    });
  };

  // Filtered list
  const filteredVocabs = useMemo(() => {
    return vocabList.filter((item) => {
      // Category filter
      if (selectedCategory === 'bookmarked') {
        if (!localBookmarks.includes(item.id)) return false;
      } else if (selectedCategory === 'learned') {
        if (!learnedIds.includes(item.id)) return false;
      } else if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchKo = item.wordKo.toLowerCase().includes(q);
        const matchRom = item.romanization.toLowerCase().includes(q);
        const matchVi = item.meaningVi.toLowerCase().includes(q);
        const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchKo && !matchRom && !matchVi && !matchTags) {
          return false;
        }
      }

      return true;
    });
  }, [vocabList, selectedCategory, searchQuery, localBookmarks, learnedIds]);

  // AI Vocab generator handler
  const handleGenerateAiVocab = async (customTopic?: string) => {
    const topicToUse = customTopic || aiTopicInput.trim() || 'đời sống thường ngày dễ thương';
    setIsGeneratingAi(true);
    setAiErrorMessage('');

    try {
      const res = await fetch('/api/vocab-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicToUse }),
      });

      if (!res.ok) {
        throw new Error('Lỗi máy chủ khi tạo từ vựng.');
      }

      const newItems: IllustratedVocab[] = await res.json();
      if (Array.isArray(newItems) && newItems.length > 0) {
        setVocabList((prev) => {
          const updated = [...newItems, ...prev];
          // Save only user generated ones
          const customOnly = updated.filter((v) => v.id.startsWith('ai-vocab-'));
          localStorage.setItem('korean_journey_custom_vocab', JSON.stringify(customOnly));
          return updated;
        });
        onAddXp(15);
        setIsAiModalOpen(false);
        setAiTopicInput('');
      } else {
        throw new Error('Không nhận được danh sách từ vựng hợp lệ.');
      }
    } catch (err: any) {
      console.error(err);
      setAiErrorMessage(err.message || 'Có lỗi xảy ra khi tạo từ vựng.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const categories = [
    { id: 'all', label: 'Tất cả từ vựng', emoji: '🌈' },
    { id: 'bookmarked', label: 'Sổ tay yêu thích', emoji: '❤️', count: localBookmarks.length },
    { id: 'learned', label: 'Đã thuộc làu', emoji: '✨', count: learnedIds.length },
    { id: 'food', label: 'Ăn vặt & K-Food', emoji: '🍢' },
    { id: 'animals', label: 'Thú cưng đáng yêu', emoji: '🐾' },
    { id: 'cafe', label: 'Cà phê & Bánh ngọt', emoji: '🍰' },
    { id: 'school', label: 'Học tập & Đồ dùng', emoji: '🎒' },
    { id: 'feelings', label: 'Cảm xúc ngọt ngào', emoji: '🥰' },
    { id: 'seasons', label: 'Bốn mùa & Cảnh đẹp', emoji: '🌸' },
  ];

  // Quick topics for AI modal
  const quickAiTopics = [
    'Thời trang & Phụ kiện K-Pop',
    'Đi picnic tại công viên sông Hàn',
    'Cửa hàng tiện lợi Hàn Quốc (GS25, CU)',
    'Các loại trái cây ngọt mát mùa hè',
    'Đồ dùng trang trí phòng ngủ xinh xắn',
  ];

  const handleShareOrCopy = (item: IllustratedVocab) => {
    const textToCopy = `${item.wordKo} (${item.romanization}): ${item.meaningVi}\nVí dụ: ${item.exampleKo} - ${item.exampleVi}`;
    navigator.clipboard?.writeText(textToCopy);
    setCopiedNotification(item.wordKo);
    setTimeout(() => setCopiedNotification(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12" id="vocab-handbook-container">
      {/* 1. CUTE HERO MASCOT BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-50 via-amber-50 to-pink-50 border border-rose-200/80 p-5 sm:p-7 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5 text-left w-full md:w-auto">
            <div className="relative flex-shrink-0">
              <img
                src="/src/assets/images/cute_korean_mascot_1789549018066.jpg"
                alt="Cute Korean Mascot"
                referrerPolicy="no-referrer"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-3 border-white shadow-md shadow-rose-200/50"
              />
              <span className="absolute -bottom-1 -right-1 bg-white text-xs px-1.5 py-0.5 rounded-full border border-rose-200 shadow-xs">
                💖
              </span>
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                  그림 단어장 • Illustrated Notebook
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {vocabList.length} từ vựng minh họa
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                Sổ tay từ vựng minh họa đáng yêu
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                Học từ vựng tiếng Hàn trực quan qua hình ảnh dễ thương, câu ví dụ đời sống, mẹo văn hóa K-Culture và phát âm chuẩn bản xứ.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-200 animate-spin" />
              <span>✨ AI tạo từ mới</span>
            </button>
          </div>
        </div>

        {/* Floating background decorations */}
        <div className="absolute top-2 right-10 text-3xl opacity-20 pointer-events-none select-none animate-bounce">
          🌸
        </div>
        <div className="absolute bottom-2 left-1/3 text-2xl opacity-20 pointer-events-none select-none">
          🍓
        </div>
      </div>

      {/* 2. SEARCH BAR & VIEW MODE CONTROLS */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm từ vựng tiếng Hàn, phiên âm, nghĩa tiếng Việt..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* View mode switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto justify-center">
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Thẻ tranh</span>
          </button>

          <button
            onClick={() => setViewMode('notebook')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'notebook'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Sổ tay chép</span>
          </button>

          <button
            onClick={() => {
              setViewMode('quiz');
              setRevealedQuizCards({});
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'quiz'
                ? 'bg-white text-amber-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Lật đố vui</span>
          </button>
        </div>
      </div>

      {/* 3. CATEGORY FILTER PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-rose-500 text-white border-rose-500 shadow-xs scale-105'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-rose-200 hover:bg-rose-50/50'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
              {cat.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {cat.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Copied notification toast */}
      {copiedNotification && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Đã sao chép từ vựng "{copiedNotification}"!</span>
        </div>
      )}

      {/* 4. MAIN CONTENT BY VIEW MODE */}
      {filteredVocabs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
          <div className="text-5xl">🐰🔍</div>
          <h3 className="text-lg font-bold text-slate-700">Chưa tìm thấy từ vựng phù hợp</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {selectedCategory === 'bookmarked'
              ? 'Bạn chưa lưu từ vựng nào vào sổ tay yêu thích. Hãy bấm biểu tượng trái tim ❤️ trên các thẻ từ để gom lại nhé!'
              : 'Hãy thử tìm bằng từ khóa khác hoặc bấm nút "AI tạo từ mới" để mở rộng vốn từ!'}
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
          >
            Quay lại tất cả từ vựng
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* MODE A: CUTE CARDS GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVocabs.map((item) => {
            const isBookmarked = localBookmarks.includes(item.id);
            const isLearned = learnedIds.includes(item.id);
            const isSpeaking = activeAudioWord === item.wordKo;

            return (
              <div
                key={item.id}
                className="group relative bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col hover:-translate-y-1"
              >
                {/* Illustration Image Header */}
                <div className="relative h-44 sm:h-48 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={item.illustrationUrl}
                    alt={item.wordKo}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[11px] font-bold text-slate-700 shadow-xs">
                    <span>{item.cuteEmoji}</span>
                    <span>{item.categoryLabel}</span>
                  </div>

                  {/* Bookmark Heart Button */}
                  <button
                    onClick={() => handleToggleBookmark(item.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs transition-all hover:scale-110 active:scale-90 cursor-pointer"
                    title={isBookmarked ? 'Bỏ lưu' : 'Lưu vào sổ tay của tôi'}
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${
                        isBookmarked
                          ? 'fill-rose-500 text-rose-500'
                          : 'text-slate-400 group-hover:text-rose-400'
                      }`}
                    />
                  </button>

                  {/* Audio Speaker Quick Button */}
                  <button
                    onClick={() => handlePronounce(item.wordKo)}
                    className={`absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-xs shadow-md transition-all hover:scale-110 active:scale-95 cursor-pointer ${
                      isSpeaking
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-white/95 text-slate-700 hover:text-rose-600'
                    }`}
                    title="Nghe phát âm tiếng Hàn"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Card Content Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <h3
                        onClick={() => handlePronounce(item.wordKo)}
                        className="text-2xl font-black text-slate-800 tracking-tight cursor-pointer hover:text-rose-600 transition-colors flex items-center gap-1.5"
                      >
                        <span>{item.wordKo}</span>
                      </h3>
                      <span className="text-xs font-semibold text-rose-500 font-mono">
                        [{item.romanization}]
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-700 mt-1">{item.meaningVi}</p>
                  </div>

                  {/* Cute Example Sentence Box */}
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                      <span>Ví dụ giao tiếp</span>
                      <button
                        onClick={() => handlePronounce(item.exampleKo)}
                        className="text-slate-400 hover:text-rose-500 flex items-center gap-0.5 cursor-pointer"
                        title="Nghe câu ví dụ"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Nghe</span>
                      </button>
                    </div>
                    <p className="font-semibold text-slate-800 leading-snug">{item.exampleKo}</p>
                    <p className="text-slate-500 text-[11px]">{item.exampleVi}</p>
                  </div>

                  {/* Cute Note & Cultural Tip */}
                  <div className="bg-amber-50/70 rounded-2xl p-2.5 border border-amber-200/60 text-[11px] text-amber-900 leading-relaxed flex items-start gap-1.5">
                    <span className="text-amber-600 text-xs mt-0.5">💡</span>
                    <p className="flex-1">{item.cuteNote}</p>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                    <button
                      onClick={() => handleToggleLearned(item.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                        isLearned
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${isLearned ? 'text-emerald-500' : 'text-slate-400'}`}
                      />
                      <span>{isLearned ? 'Đã thuộc (+10 XP)' : 'Đánh dấu đã thuộc'}</span>
                    </button>

                    <button
                      onClick={() => handleShareOrCopy(item)}
                      className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Sao chép từ vựng"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'notebook' ? (
        /* MODE B: NOTEBOOK / DIARY LINED PAPER VIEW */
        <div className="space-y-4">
          <div className="bg-amber-50/60 rounded-3xl p-6 border-2 border-dashed border-amber-300 relative overflow-hidden shadow-xs">
            <div className="absolute top-2 right-4 text-xs font-bold text-amber-700 font-mono">
              ★ HÀNH TRÌNH TỪ VỰNG TIẾNG HÀN ★
            </div>

            <div className="divide-y divide-amber-200/70">
              {filteredVocabs.map((item, idx) => {
                const isBookmarked = localBookmarks.includes(item.id);
                const isLearned = learnedIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-2 last:pb-2"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="relative flex-shrink-0">
                        <img
                          src={item.illustrationUrl}
                          alt={item.wordKo}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-xs"
                        />
                        <span className="absolute -top-1.5 -left-1.5 text-sm">{item.cuteEmoji}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-baseline gap-2.5">
                          <span className="text-xs font-bold text-amber-800/70 font-mono">
                            #{idx + 1}
                          </span>
                          <span
                            onClick={() => handlePronounce(item.wordKo)}
                            className="text-xl font-black text-slate-800 hover:text-rose-600 cursor-pointer"
                          >
                            {item.wordKo}
                          </span>
                          <span className="text-xs font-bold text-rose-600 font-mono">
                            [{item.romanization}]
                          </span>
                        </div>
                        <p className="text-sm font-extrabold text-slate-700">{item.meaningVi}</p>
                        <p className="text-xs text-slate-600 italic">
                          "{item.exampleKo}" — <span className="text-slate-500">{item.exampleVi}</span>
                        </p>
                        <p className="text-[11px] text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded-md inline-block">
                          💡 {item.cuteNote}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handlePronounce(item.wordKo)}
                        className="p-2 rounded-xl bg-white border border-amber-200 hover:bg-amber-100/50 text-slate-700 cursor-pointer"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleBookmark(item.id)}
                        className={`p-2 rounded-xl bg-white border transition-colors cursor-pointer ${
                          isBookmarked
                            ? 'border-rose-300 text-rose-500 bg-rose-50/50'
                            : 'border-amber-200 text-slate-400 hover:text-rose-400'
                        }`}
                        title="Yêu thích"
                      >
                        <Heart
                          className={`w-4 h-4 ${isBookmarked ? 'fill-rose-500' : ''}`}
                        />
                      </button>
                      <button
                        onClick={() => handleToggleLearned(item.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isLearned
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border border-amber-200 text-slate-600 hover:bg-amber-100/50'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isLearned ? 'Đã thuộc' : 'Thuộc'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* MODE C: CUTE QUIZ / REVEAL MEMORY CARDS */
        <div className="space-y-4">
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
            <span>
              💡 <strong>Chế độ Luyện nhớ nhanh:</strong> Nhìn chữ tiếng Hàn và ảnh minh họa, hãy đoán nghĩa trước khi bấm nút "Lật mở nghĩa"!
            </span>
            <button
              onClick={() => {
                const allRevealed = Object.keys(revealedQuizCards).length === filteredVocabs.length;
                if (allRevealed) {
                  setRevealedQuizCards({});
                } else {
                  const state: Record<string, boolean> = {};
                  filteredVocabs.forEach((v) => (state[v.id] = true));
                  setRevealedQuizCards(state);
                }
              }}
              className="px-3 py-1 bg-white border border-amber-300 rounded-xl font-bold text-amber-800 hover:bg-amber-100 cursor-pointer"
            >
              {Object.keys(revealedQuizCards).length === filteredVocabs.length
                ? 'Ẩn tất cả'
                : 'Hiện tất cả'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVocabs.map((item) => {
              const isRevealed = !!revealedQuizCards[item.id];
              const isLearned = learnedIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-300 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.illustrationUrl}
                      alt={item.wordKo}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-xs flex-shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl">{item.cuteEmoji}</span>
                        <h4 className="text-2xl font-black text-slate-800">{item.wordKo}</h4>
                      </div>
                      <p className="text-xs font-mono text-slate-400">[{item.romanization}]</p>
                    </div>
                  </div>

                  {/* Secret Card Box */}
                  <div
                    onClick={() =>
                      setRevealedQuizCards((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                    }
                    className={`rounded-2xl p-4 transition-all cursor-pointer text-center min-h-[90px] flex flex-col items-center justify-center ${
                      isRevealed
                        ? 'bg-rose-50 border border-rose-200 text-slate-800'
                        : 'bg-slate-100 border border-dashed border-slate-300 hover:bg-slate-200/70 text-slate-500'
                    }`}
                  >
                    {isRevealed ? (
                      <div className="space-y-1 animate-fade-in">
                        <p className="text-base font-extrabold text-rose-600">{item.meaningVi}</p>
                        <p className="text-[11px] text-slate-500 italic">"{item.exampleKo}"</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                        <Eye className="w-4 h-4 text-slate-400" />
                        <span>Chạm để lật mở nghĩa</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handlePronounce(item.wordKo)}
                      className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-rose-600 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Phát âm</span>
                    </button>

                    <button
                      onClick={() => handleToggleLearned(item.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isLearned
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isLearned ? 'Đã thuộc (+10 XP)' : 'Đã thuộc'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. AI CUTE VOCAB GENERATOR MODAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-rose-100 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-xl shadow-xs">
                  ✨
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-800">
                    AI vẽ & sinh từ vựng mới
                  </h3>
                  <p className="text-xs text-slate-500">Nhập bất kỳ chủ đề yêu thích nào của bạn</p>
                </div>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Input field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Chủ đề mong muốn:</label>
              <input
                type="text"
                value={aiTopicInput}
                onChange={(e) => setAiTopicInput(e.target.value)}
                placeholder="Ví dụ: Đi du lịch đảo Jeju, Phụ kiện thời trang, Món tráng miệng ngọt..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all"
                disabled={isGeneratingAi}
              />
            </div>

            {/* Quick Topic Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400">Gợi ý chủ đề nhanh:</span>
              <div className="flex flex-wrap gap-1.5">
                {quickAiTopics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => {
                      setAiTopicInput(topic);
                      handleGenerateAiVocab(topic);
                    }}
                    disabled={isGeneratingAi}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 border border-slate-200/60 transition-colors cursor-pointer"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {aiErrorMessage && (
              <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {aiErrorMessage}
              </p>
            )}

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setIsAiModalOpen(false)}
                disabled={isGeneratingAi}
                className="flex-1 py-2.5 rounded-2xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => handleGenerateAiVocab()}
                disabled={isGeneratingAi}
                className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold shadow-md shadow-rose-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isGeneratingAi ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang tạo từ vựng...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>Tạo 3 từ minh họa (+15 XP)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
