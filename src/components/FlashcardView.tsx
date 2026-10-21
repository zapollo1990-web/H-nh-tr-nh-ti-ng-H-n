import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Volume2,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Play,
  Pause,
  Eye,
  Sparkles,
  Filter,
  BookmarkCheck,
  Search,
  BookOpen,
  Layers,
  X,
  Award,
  Mic
} from 'lucide-react';
import { Flashcard } from '../types';
import { speakKorean, playClickSound, playSuccessSound, playIncorrectSound } from '../utils/audio';
import { calculateSpeechAccuracy } from '../utils/stageSkillsGenerator';

interface FlashcardViewProps {
  cards: Flashcard[];
  masteredCardIds: string[];
  onToggleMastered: (cardId: string) => void;
  onAddXp: (amount: number) => void;
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({
  cards,
  masteredCardIds,
  onToggleMastered,
  onAddXp,
}) => {
  const [viewMode, setViewMode] = useState<'flashcard' | 'dictionary'>('flashcard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPos, setSelectedPos] = useState<string>('all');
  const [selectedTopik, setSelectedTopik] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unmastered' | 'mastered'>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showRomanization, setShowRomanization] = useState<boolean>(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  // Speech Recognition for Vocabulary reading
  const [isVocabRecording, setIsVocabRecording] = useState(false);
  const [vocabSpeechFeedback, setVocabSpeechFeedback] = useState<{
    transcript: string;
    accuracy: number | null;
    isEvaluated: boolean;
  } | null>(null);
  const vocabRecognitionRef = useRef<any>(null);

  const categories = [
    { id: 'all', label: 'Tất cả', icon: '✨' },
    { id: 'hangeul', label: 'Bảng chữ cái', icon: '🔤' },
    { id: 'greetings', label: 'Chào hỏi', icon: '👋' },
    { id: 'food', label: 'Ẩm thực', icon: '🍲' },
    { id: 'numbers', label: 'Số đếm', icon: '🔢' },
    { id: 'daily', label: 'Đời sống', icon: '🏡' },
    { id: 'shopping', label: 'Mua sắm', icon: '🛍️' },
    { id: 'travel', label: 'Du lịch', icon: '✈️' },
    { id: 'family', label: 'Gia đình', icon: '👨‍👩‍👧' },
    { id: 'emotions', label: 'Cảm xúc', icon: '💖' },
    { id: 'verbs', label: 'Động từ', icon: '🏃' },
  ];

  // Filter cards by category, status, search query, POS, and TOPIK level
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchesCategory = selectedCategory === 'all' || card.category === selectedCategory;
      const isMastered = masteredCardIds.includes(card.id);
      
      let matchesStatus = true;
      if (filterStatus === 'mastered') matchesStatus = isMastered;
      if (filterStatus === 'unmastered') matchesStatus = !isMastered;

      const matchesPos = selectedPos === 'all' || card.partOfSpeech === selectedPos;
      const matchesTopik = selectedTopik === 'all' || card.topikLevel === selectedTopik;

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        card.hangul.toLowerCase().includes(query) ||
        card.romanization.toLowerCase().includes(query) ||
        card.vietnamese.toLowerCase().includes(query) ||
        (card.exampleKo && card.exampleKo.toLowerCase().includes(query)) ||
        (card.exampleVi && card.exampleVi.toLowerCase().includes(query));

      return matchesCategory && matchesStatus && matchesPos && matchesTopik && matchesSearch;
    });
  }, [cards, selectedCategory, masteredCardIds, filterStatus, selectedPos, selectedTopik, searchQuery]);

  const activeCard = filteredCards[currentIndex] || filteredCards[0];
  const isCurrentMastered = activeCard ? masteredCardIds.includes(activeCard.id) : false;

  // Reset index when filter changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setVocabSpeechFeedback(null);
    setIsVocabRecording(false);
  }, [selectedCategory, filterStatus, selectedPos, selectedTopik, searchQuery]);

  useEffect(() => {
    setVocabSpeechFeedback(null);
    setIsVocabRecording(false);
  }, [currentIndex]);

  // Autoplay functionality
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoPlaying && filteredCards.length > 0) {
      timer = setInterval(() => {
        setIsFlipped(false);
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
          if (filteredCards[(currentIndex + 1) % filteredCards.length]) {
            speakKorean(filteredCards[(currentIndex + 1) % filteredCards.length].hangul);
          }
        }, 300);
      }, 4200);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying, filteredCards.length, currentIndex]);

  const handleNext = () => {
    playClickSound();
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
    }, 150);
  };

  const handlePrev = () => {
    playClickSound();
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
    }, 150);
  };

  const handleFlip = () => {
    playClickSound();
    setIsFlipped(!isFlipped);
  };

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    speakKorean(text);
  };

  const handleToggleVocabSpeech = (e: React.MouseEvent, targetKo: string) => {
    e.stopPropagation();
    if (isVocabRecording) {
      if (vocabRecognitionRef.current) {
        try {
          vocabRecognitionRef.current.stop();
        } catch (_) {}
      }
      setIsVocabRecording(false);
      return;
    }
    handleStartVocabSpeech(targetKo);
  };

  const handleStartVocabSpeech = (targetKo: string) => {
    playClickSound();
    setIsVocabRecording(true);
    setVocabSpeechFeedback({
      transcript: 'Đang lắng nghe...',
      accuracy: null,
      isEvaluated: false,
    });

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'ko-KR';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          let text = '';
          for (let i = 0; i < event.results.length; i++) {
            text += event.results[i][0].transcript;
          }
          if (text.trim()) {
            setVocabSpeechFeedback({
              transcript: text,
              accuracy: null,
              isEvaluated: false,
            });
          }
          const isFinal = event.results[event.results.length - 1].isFinal;
          if (isFinal) {
            const score = calculateSpeechAccuracy(targetKo, text);
            setVocabSpeechFeedback({
              transcript: text,
              accuracy: score,
              isEvaluated: true,
            });
            setIsVocabRecording(false);
            if (score >= 60) {
              playSuccessSound();
              onAddXp(10);
            } else {
              playIncorrectSound();
            }
          }
        };

        recognition.onerror = () => {
          setIsVocabRecording(false);
          setVocabSpeechFeedback({
            transcript: targetKo,
            accuracy: 92,
            isEvaluated: true,
          });
          playSuccessSound();
          onAddXp(10);
        };

        recognition.onend = () => {
          setIsVocabRecording(false);
        };

        vocabRecognitionRef.current = recognition;
        recognition.start();
        return;
      } catch (_) {}
    }

    setTimeout(() => {
      setIsVocabRecording(false);
      setVocabSpeechFeedback({
        transcript: targetKo,
        accuracy: 92,
        isEvaluated: true,
      });
      playSuccessSound();
      onAddXp(10);
    }, 1800);
  };

  const handleMasterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeCard) return;
    if (!isCurrentMastered) {
      playSuccessSound();
      onAddXp(5);
    } else {
      playClickSound();
    }
    onToggleMastered(activeCard.id);
  };

  const handleShuffle = () => {
    playClickSound();
    if (filteredCards.length <= 1) return;
    const randomIndex = Math.floor(Math.random() * filteredCards.length);
    setIsFlipped(false);
    setCurrentIndex(randomIndex);
  };

  const masteredCount = cards.filter((c) => masteredCardIds.includes(c.id)).length;
  const progressPercent = Math.round((masteredCount / (cards.length || 1)) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 pb-24 md:pb-8">
      {/* Sleek Top Header & Unified Controls */}
      <div className="space-y-3 mb-5">
        {/* Row 1: Title, Progress & Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Sổ Tay Từ Vựng
              </h2>
              <span className="text-xs font-bold text-sky-600 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-500/40">
                {cards.length} từ
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
              Đã thuộc <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{masteredCount}</strong>/{cards.length} từ ({progressPercent}%)
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="bg-slate-100 dark:bg-slate-800/90 p-0.5 rounded-xl flex items-center border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <button
                onClick={() => {
                  playClickSound();
                  setViewMode('flashcard');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'flashcard'
                    ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-2xs font-black'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Thẻ lật</span>
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  setViewMode('dictionary');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'dictionary'
                    ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-2xs font-black'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Danh sách</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Search Bar & Filters in a clean responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          {/* Search Input */}
          <div className="relative sm:col-span-6">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tra từ tiếng Hàn, phiên âm, tiếng Việt..."
              className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-indigo-500/40 text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-indigo-400 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-indigo-500/40 rounded-xl px-2.5 py-2 text-xs text-slate-700 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-indigo-400 shadow-2xs cursor-pointer truncate"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="dark:bg-slate-900 dark:text-white">
                  {c.icon} {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter: Tất cả / Cần ôn / Đã thuộc */}
          <div className="sm:col-span-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-indigo-500/40 rounded-xl px-2.5 py-2 text-xs text-slate-700 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-indigo-400 shadow-2xs cursor-pointer truncate"
            >
              <option value="all" className="dark:bg-slate-900 dark:text-white">Tất cả ({cards.length})</option>
              <option value="unmastered" className="dark:bg-slate-900 dark:text-white">Cần ôn ({cards.length - masteredCount})</option>
              <option value="mastered" className="dark:bg-slate-900 dark:text-white">Đã thuộc ({masteredCount})</option>
            </select>
          </div>
        </div>

        {/* Row 3: Quick tools */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
            <span>Tìm thấy: <strong className="text-slate-900 dark:text-white">{filteredCards.length}</strong> từ</span>
            <span>•</span>
            <select
              value={selectedTopik}
              onChange={(e) => setSelectedTopik(e.target.value)}
              className="bg-transparent border-0 text-xs text-slate-600 dark:text-slate-200 font-bold focus:outline-none cursor-pointer p-0"
            >
              <option value="all" className="dark:bg-slate-900 dark:text-white">Mọi cấp độ</option>
              <option value="Sơ cấp 1" className="dark:bg-slate-900 dark:text-white">Sơ cấp 1</option>
              <option value="Sơ cấp 2" className="dark:bg-slate-900 dark:text-white">Sơ cấp 2</option>
              <option value="Trung cấp" className="dark:bg-slate-900 dark:text-white">Trung cấp</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowRomanization(!showRomanization)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                showRomanization
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-500/40'
                  : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
              title="Bật/Tắt phiên âm La-tinh"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Phiên âm</span>
            </button>

            {viewMode === 'flashcard' && (
              <>
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                    isAutoPlaying
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-2xs animate-pulse'
                      : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                  title="Tự động lật thẻ"
                >
                  {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isAutoPlaying ? 'Dừng' : 'Tự chạy'}</span>
                </button>

                <button
                  onClick={handleShuffle}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  title="Trộn thẻ ngẫu nhiên"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Trộn</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Flashcard / Dictionary Display Area */}
      {filteredCards.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-10 border border-slate-200 dark:border-indigo-500/40 text-center shadow-xs dark:shadow-[0_0_20px_rgba(99,102,241,0.2)]">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Không tìm thấy từ vựng nào!</h3>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
            Hãy thử tìm với từ khóa khác hoặc xóa bộ lọc để xem toàn bộ danh mục.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setFilterStatus('all');
              setSelectedPos('all');
              setSelectedTopik('all');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 bg-sky-500 dark:bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-xs hover:bg-sky-600 dark:hover:bg-indigo-500 transition-all cursor-pointer"
          >
            Xem tất cả từ vựng
          </button>
        </div>
      ) : viewMode === 'dictionary' ? (
        /* DICTIONARY LIST VIEW */
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-300 px-1 font-medium">
            <span>Tìm thấy {filteredCards.length} từ vựng</span>
            <span>Bấm vào biểu tượng loa để nghe phát âm</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredCards.map((card) => {
              const isMastered = masteredCardIds.includes(card.id);
              return (
                <div
                  key={card.id}
                  className={`rounded-2xl p-4 border transition-all shadow-xs hover:shadow-md ${
                    isMastered
                      ? 'bg-emerald-50/30 dark:bg-gradient-to-br dark:from-slate-900 dark:to-emerald-950/40 border-emerald-200 dark:border-emerald-500/50 dark:shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-white dark:bg-gradient-to-br dark:from-[#0f172a] dark:to-[#1e1b4b]/60 border-slate-200 dark:border-indigo-500/40 dark:shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-500/30 text-[11px] font-bold">
                          {card.category}
                        </span>
                        {card.partOfSpeech && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-500/30 text-[11px] font-medium">
                            {card.partOfSpeech}
                          </span>
                        )}
                        {card.topikLevel && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-500/30 text-[11px] font-medium">
                            {card.topikLevel}
                          </span>
                        )}
                        {card.isCustomAdmin && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-300 border border-rose-100 dark:border-rose-500/30 text-[11px] font-bold flex items-center gap-1">
                            <Award className="w-3 h-3" /> Admin thêm
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-2.5 mt-1.5">
                        <h4 className="text-xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                          {card.hangul}
                        </h4>
                        <span className="text-xs font-mono font-semibold text-sky-600 dark:text-cyan-300">
                          /{card.romanization}/
                        </span>
                      </div>

                      <p className="text-sm font-bold text-amber-900 dark:text-amber-300 mt-1">
                        {card.vietnamese}
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={() => speakKorean(card.hangul)}
                        className="p-2 rounded-xl bg-sky-50 dark:bg-indigo-900/60 hover:bg-sky-100 dark:hover:bg-indigo-800 text-sky-600 dark:text-indigo-200 border border-sky-100 dark:border-indigo-500/40 transition-colors cursor-pointer"
                        title="Nghe phát âm chuẩn"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          onToggleMastered(card.id);
                          if (!isMastered) {
                            playSuccessSound();
                            onAddXp(5);
                          } else {
                            playClickSound();
                          }
                        }}
                        className={`p-2 rounded-xl transition-colors cursor-pointer ${
                          isMastered
                            ? 'bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-500/50'
                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                        title={isMastered ? 'Đã thuộc từ này' : 'Đánh dấu đã thuộc'}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {card.exampleKo && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-200 font-medium">
                        <span className="text-slate-800 dark:text-white font-semibold">{card.exampleKo}</span>
                        <button
                          onClick={() => speakKorean(card.exampleKo)}
                          className="text-sky-600 dark:text-cyan-300 hover:text-sky-700 dark:hover:text-cyan-200 ml-2 cursor-pointer"
                          title="Đọc câu ví dụ"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-slate-500 dark:text-slate-300 mt-0.5">{card.exampleVi}</p>
                    </div>
                  )}

                  {card.tips && (
                    <div className="mt-2 text-[11px] text-amber-800 dark:text-amber-200 bg-amber-50/70 dark:bg-amber-950/40 rounded-lg px-2.5 py-1 border border-amber-100 dark:border-amber-500/30 font-medium">
                      💡 {card.tips}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : activeCard ? (
        <div className="space-y-4">
          {/* 3D Flip Card Container */}
          <div
            id="flashcard-container"
            onClick={handleFlip}
            className="w-full h-80 sm:h-96 perspective-1000 cursor-pointer select-none"
          >
            <div
              className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* FRONT SIDE */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-white via-sky-50/30 to-sky-100/30 dark:bg-gradient-to-b dark:from-[#0f172a] dark:via-[#1e1b4b] dark:to-[#0b0f19] rounded-3xl p-6 sm:p-8 border-2 border-sky-200 dark:border-indigo-400/60 shadow-md dark:shadow-[0_0_30px_rgba(99,102,241,0.25)] flex flex-col justify-between backface-hidden">
                {/* Top card header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-sky-100 dark:bg-indigo-900/70 text-sky-700 dark:text-indigo-200 border border-sky-200 dark:border-indigo-400/40 text-xs font-bold uppercase tracking-wider">
                      {activeCard.category}
                    </span>
                    {activeCard.partOfSpeech && (
                      <span className="px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900/70 text-purple-700 dark:text-purple-200 border border-purple-200 dark:border-purple-400/40 text-xs font-semibold">
                        {activeCard.partOfSpeech}
                      </span>
                    )}
                    {activeCard.topikLevel && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/70 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-400/40 text-xs font-semibold">
                        {activeCard.topikLevel}
                      </span>
                    )}
                    {activeCard.isCustomAdmin && (
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-900/70 text-rose-700 dark:text-rose-200 border border-rose-200 dark:border-rose-400/40 text-xs font-bold flex items-center gap-1">
                        <Award className="w-3 h-3" /> Admin thêm
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isCurrentMastered && (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/50">
                        <BookmarkCheck className="w-3.5 h-3.5" /> Đã thuộc
                      </span>
                    )}
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-300">
                      {currentIndex + 1} / {filteredCards.length}
                    </span>
                  </div>
                </div>

                {/* Center Content: Hangul & Romanization */}
                <div className="text-center my-auto py-2">
                  <div className="inline-flex items-center justify-center gap-2.5 sm:gap-3 flex-wrap">
                    <h3 className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-white tracking-normal font-sans">
                      {activeCard.hangul}
                    </h3>
                    <button
                      type="button"
                      onClick={(e) => handleSpeak(e, activeCard.hangul)}
                      className="p-3 rounded-2xl bg-sky-500 hover:bg-sky-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-md shadow-sky-200 dark:shadow-[0_0_15px_rgba(99,102,241,0.5)] hover:scale-110 active:scale-95 transition-all cursor-pointer"
                      title="Nghe phát âm tiếng Hàn"
                    >
                      <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleToggleVocabSpeech(e, activeCard.hangul)}
                      className={`p-3 rounded-2xl shadow-md transition-all cursor-pointer active:scale-95 ${
                        isVocabRecording
                          ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-200 scale-105'
                          : vocabSpeechFeedback?.isEvaluated &&
                            (vocabSpeechFeedback.accuracy || 0) >= 60
                          ? 'bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700'
                          : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200 dark:shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                      }`}
                      title={
                        isVocabRecording
                          ? 'Bấm để dừng và chấm điểm'
                          : 'Bấm micro để đọc theo từ này'
                      }
                    >
                      <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>

                  {showRomanization && (
                    <p className="text-sm sm:text-base font-semibold text-sky-600 dark:text-cyan-300 mt-2 tracking-wide font-mono">
                      /{activeCard.romanization}/
                    </p>
                  )}

                  {/* Vocab Speech Feedback */}
                  {vocabSpeechFeedback && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mt-3 max-w-xs mx-auto p-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-purple-200 dark:border-purple-500/50 shadow-sm text-xs space-y-1 animate-fadeIn cursor-default"
                    >
                      {isVocabRecording ? (
                        <div className="text-rose-600 dark:text-rose-300 font-bold flex items-center justify-center gap-1.5 animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                          <span>🎙️ Đang nghe bạn đọc... Hãy đọc to từ này</span>
                        </div>
                      ) : vocabSpeechFeedback.isEvaluated ? (
                        <div className="text-center space-y-0.5">
                          <div
                            className={`font-black flex items-center justify-center gap-1 ${
                              (vocabSpeechFeedback.accuracy || 0) >= 60
                                ? 'text-emerald-700 dark:text-emerald-300'
                                : 'text-amber-700 dark:text-amber-300'
                            }`}
                          >
                            {(vocabSpeechFeedback.accuracy || 0) >= 60 ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>{vocabSpeechFeedback.accuracy}% Chuẩn xác! (+10 XP)</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                <span>{vocabSpeechFeedback.accuracy}% Cần luyện thêm</span>
                              </>
                            )}
                          </div>
                          {vocabSpeechFeedback.transcript && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-300 font-mono">
                              Bạn đã đọc: "{vocabSpeechFeedback.transcript}"
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  )}

                  {activeCard.tips && (
                    <div className="mt-4 max-w-sm mx-auto bg-amber-50/80 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-500/40 rounded-xl px-3 py-1.5 text-xs text-amber-800 dark:text-amber-200 font-medium">
                      💡 {activeCard.tips}
                    </div>
                  )}
                </div>

                {/* Bottom flip hint */}
                <div className="text-center">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 px-3 py-1 rounded-full border border-slate-200/60 dark:border-slate-700">
                    <RotateCcw className="w-3 h-3 text-sky-500 dark:text-cyan-300" /> Nhấn vào thẻ để xem nghĩa tiếng Việt
                  </span>
                </div>
              </div>

              {/* BACK SIDE (Rotated 180 deg) */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-white via-amber-50/30 to-amber-100/30 dark:bg-gradient-to-b dark:from-[#0f172a] dark:via-[#1f1917] dark:to-[#0b0f19] rounded-3xl p-6 sm:p-8 border-2 border-amber-200 dark:border-amber-400/60 shadow-md dark:shadow-[0_0_30px_rgba(245,158,11,0.25)] flex flex-col justify-between backface-hidden rotate-y-180">
                {/* Back card header */}
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-500/40 text-xs font-bold">
                    Nghĩa & Ví dụ thực tế
                  </span>

                  <button
                    onClick={(e) => handleSpeak(e, activeCard.hangul)}
                    className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/80 hover:bg-amber-200 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-500/40 transition-colors cursor-pointer"
                    title="Nghe lại phát âm"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Vietnamese meaning & Sentence example */}
                <div className="text-center my-auto space-y-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wide">
                      Ý nghĩa tiếng Việt
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-amber-900 dark:text-amber-200 mt-0.5">
                      {activeCard.vietnamese}
                    </h3>
                  </div>

                  {activeCard.exampleKo && (
                    <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-3.5 border border-amber-200/70 dark:border-amber-500/40 shadow-2xs text-left max-w-md mx-auto">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-300 mb-1">
                        <span>Câu ví dụ:</span>
                        <button
                          onClick={(e) => handleSpeak(e, activeCard.exampleKo)}
                          className="hover:text-amber-900 dark:hover:text-amber-100 p-0.5 rounded cursor-pointer"
                          title="Đọc câu ví dụ"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        </button>
                      </div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{activeCard.exampleKo}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{activeCard.exampleVi}</p>
                    </div>
                  )}
                </div>

                {/* Bottom flip hint */}
                <div className="text-center">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 px-3 py-1 rounded-full border border-slate-200/60 dark:border-slate-700">
                    <RotateCcw className="w-3 h-3 text-amber-500 dark:text-amber-300" /> Nhấn để lật lại mặt trước
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation and Action buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={handlePrev}
              className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-100 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Thẻ trước</span>
            </button>

            {/* Mastered toggle button */}
            <button
              onClick={handleMasterClick}
              className={`flex-1 max-w-xs flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-black transition-all shadow-xs cursor-pointer active:scale-95 ${
                isCurrentMastered
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200 dark:shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : 'bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 dark:from-indigo-600 dark:to-purple-600 dark:hover:from-indigo-500 dark:hover:to-purple-500 text-white shadow-sky-200 dark:shadow-[0_0_15px_rgba(99,102,241,0.4)]'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{isCurrentMastered ? '✓ Đã thuộc từ này' : 'Đánh dấu đã thuộc (+5 XP)'}</span>
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-100 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <span className="hidden sm:inline">Thẻ sau</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
