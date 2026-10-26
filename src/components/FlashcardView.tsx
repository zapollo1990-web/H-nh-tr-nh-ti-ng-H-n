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
  Mic,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  Check,
  AlertCircle
} from 'lucide-react';
import { Flashcard, AppUser } from '../types';
import { speakKorean, playClickSound, playSuccessSound, playIncorrectSound } from '../utils/audio';
import { calculateSpeechAccuracy } from '../utils/stageSkillsGenerator';
import { DESIGNATED_ADMINS, isDesignatedAdminEmail } from '../services/authService';

interface FlashcardViewProps {
  cards: Flashcard[];
  masteredCardIds: string[];
  onToggleMastered: (cardId: string) => void;
  onAddXp: (amount: number) => void;
  currentUser?: AppUser | null;
  isAuthorizedAdmin?: boolean;
  onAddCard?: (newCardData: Omit<Flashcard, 'id'>) => void;
  onUpdateCard?: (updatedCard: Flashcard) => void;
  onDeleteCard?: (cardId: string) => void;
  onResetCards?: () => void;
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({
  cards,
  masteredCardIds,
  onToggleMastered,
  onAddXp,
  currentUser,
  isAuthorizedAdmin = false,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onResetCards,
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

  // Admin Studio States
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [adminSuccessToast, setAdminSuccessToast] = useState<string | null>(null);
  const [activeAdminOverride, setActiveAdminOverride] = useState<boolean>(isAuthorizedAdmin);

  // Form states for adding / editing card
  const [formHangul, setFormHangul] = useState('');
  const [formRomanization, setFormRomanization] = useState('');
  const [formVietnamese, setFormVietnamese] = useState('');
  const [formCategory, setFormCategory] = useState('animals');
  const [formCustomCategory, setFormCustomCategory] = useState('');
  const [formPartOfSpeech, setFormPartOfSpeech] = useState<string>('Danh từ');
  const [formTopikLevel, setFormTopikLevel] = useState<string>('Sơ cấp 1');
  const [formExampleKo, setFormExampleKo] = useState('');
  const [formExampleVi, setFormExampleVi] = useState('');
  const [formTips, setFormTips] = useState('');

  // Speech Recognition for Vocabulary reading
  const [isVocabRecording, setIsVocabRecording] = useState(false);
  const [vocabSpeechFeedback, setVocabSpeechFeedback] = useState<{
    transcript: string;
    accuracy: number | null;
    isEvaluated: boolean;
  } | null>(null);
  const vocabRecognitionRef = useRef<any>(null);

  const effectiveIsAdmin = isAuthorizedAdmin || activeAdminOverride || Boolean(
    currentUser && (currentUser.role === 'admin' || isDesignatedAdminEmail(currentUser.email))
  );

  const categories = [
    { id: 'all', label: 'Tất cả', icon: '✨' },
    { id: 'animals', label: 'Động vật', icon: '🐶' },
    { id: 'plants', label: 'Thực vật', icon: '🌿' },
    { id: 'food', label: 'Ẩm thực', icon: '🍲' },
    { id: 'daily', label: 'Đời sống', icon: '🏡' },
    { id: 'travel', label: 'Du lịch', icon: '✈️' },
    { id: 'shopping', label: 'Mua sắm', icon: '🛍️' },
    { id: 'family', label: 'Gia đình', icon: '👨‍👩‍👧' },
    { id: 'emotions', label: 'Cảm xúc', icon: '💖' },
    { id: 'work', label: 'Công sở', icon: '💼' },
    { id: 'hangeul', label: 'Bảng chữ cái', icon: '🔤' },
    { id: 'greetings', label: 'Chào hỏi', icon: '👋' },
    { id: 'numbers', label: 'Số đếm', icon: '🔢' },
    { id: 'verbs', label: 'Động từ', icon: '🏃' },
    { id: 'adjectives', label: 'Tính từ', icon: '🎨' },
  ];

  // Filter cards by category, status, search query, POS, and TOPIK level
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        card.category === selectedCategory ||
        (selectedCategory === 'animals' && (card.category === 'animals' || card.category === 'Động vật')) ||
        (selectedCategory === 'plants' && (card.category === 'plants' || card.category === 'Thực vật'));

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

  // Open modal to add new word
  const handleOpenAddModal = () => {
    playClickSound();
    setEditingCard(null);
    setFormHangul('');
    setFormRomanization('');
    setFormVietnamese('');
    setFormCategory(selectedCategory === 'all' ? 'animals' : selectedCategory);
    setFormCustomCategory('');
    setFormPartOfSpeech('Danh từ');
    setFormTopikLevel('Sơ cấp 1');
    setFormExampleKo('');
    setFormExampleVi('');
    setFormTips('');
    setIsAdminModalOpen(true);
  };

  // Open modal to edit existing word
  const handleOpenEditModal = (card: Flashcard) => {
    playClickSound();
    setEditingCard(card);
    setFormHangul(card.hangul);
    setFormRomanization(card.romanization);
    setFormVietnamese(card.vietnamese);
    setFormCategory(card.category);
    setFormCustomCategory('');
    setFormPartOfSpeech(card.partOfSpeech || 'Danh từ');
    setFormTopikLevel(card.topikLevel || 'Sơ cấp 1');
    setFormExampleKo(card.exampleKo || '');
    setFormExampleVi(card.exampleVi || '');
    setFormTips(card.tips || '');
    setIsAdminModalOpen(true);
  };

  // Save new or updated word
  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formHangul.trim() || !formVietnamese.trim()) {
      alert('Vui lòng nhập Từ tiếng Hàn và Nghĩa tiếng Việt!');
      return;
    }

    const finalCategory = formCategory === 'custom' ? (formCustomCategory.trim() || 'daily') : formCategory;
    const cardData = {
      hangul: formHangul.trim(),
      romanization: formRomanization.trim() || formHangul.trim(),
      vietnamese: formVietnamese.trim(),
      category: finalCategory,
      partOfSpeech: formPartOfSpeech as any,
      topikLevel: formTopikLevel as any,
      exampleKo: formExampleKo.trim(),
      exampleVi: formExampleVi.trim(),
      tips: formTips.trim(),
      isCustomAdmin: true,
    };

    if (editingCard) {
      if (onUpdateCard) {
        onUpdateCard({ ...editingCard, ...cardData });
      }
      setAdminSuccessToast(`Đã cập nhật từ "${cardData.hangul}" thành công!`);
    } else {
      if (onAddCard) {
        onAddCard(cardData);
      }
      setAdminSuccessToast(`Đã thêm từ vựng mới "${cardData.hangul}" vào hệ thống!`);
      // Select the category of the new card
      setSelectedCategory(finalCategory);
    }

    playSuccessSound();
    setIsAdminModalOpen(false);
    setTimeout(() => setAdminSuccessToast(null), 3500);
  };

  const handleDeleteCardItem = (card: Flashcard) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa từ vựng "${card.hangul} - ${card.vietnamese}" khỏi từ điển hệ thống?`)) {
      if (onDeleteCard) {
        onDeleteCard(card.id);
      }
      playClickSound();
      setAdminSuccessToast(`Đã xóa từ "${card.hangul}" khỏi hệ thống!`);
      setTimeout(() => setAdminSuccessToast(null), 3000);
    }
  };

  const masteredCount = cards.filter((c) => masteredCardIds.includes(c.id)).length;
  const progressPercent = Math.round((masteredCount / (cards.length || 1)) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 pb-24 md:pb-8">
      {/* Toast Alert khi Admin thêm/sửa từ vựng */}
      {adminSuccessToast && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-500 text-white font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <Check className="w-5 h-5" />
          <span className="text-sm">{adminSuccessToast}</span>
        </div>
      )}

      {/* Top Header & Unified Controls */}
      <div className="space-y-3 mb-5">
        {/* Row 1: Title, Progress & Mode Switcher & Admin Studio Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Sổ Tay Từ Vựng
              </h2>
              <span className="text-xs font-bold text-sky-700 bg-sky-100 dark:bg-sky-950/80 dark:text-sky-300 px-2.5 py-0.5 rounded-full border border-sky-300 dark:border-sky-500/40">
                {cards.length} từ
              </span>
              {effectiveIsAdmin && (
                <span className="text-xs font-black text-rose-700 bg-rose-100 dark:bg-rose-950/80 dark:text-rose-300 px-2.5 py-0.5 rounded-full border border-rose-300 dark:border-rose-500/40 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Quyền Admin Từ Điển
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
              Đã thuộc <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{masteredCount}</strong>/{cards.length} từ ({progressPercent}%)
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {/* Nút thêm từ vựng dành cho Admin */}
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black shadow-xs transition-all cursor-pointer active:scale-95"
              title="Thêm từ vựng mới vào từ điển hệ thống"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm từ vựng ➕</span>
            </button>

            {/* Quyền quản trị viên */}
            {!effectiveIsAdmin && (
              <button
                onClick={() => {
                  playClickSound();
                  setActiveAdminOverride(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-black transition-all cursor-pointer"
                title="Bật quyền Admin chỉnh sửa từ vựng"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Bật Admin</span>
              </button>
            )}

            {/* View Mode Switcher */}
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

        {/* Quick Category Pill Bar (Cuộn ngang - Bao gồm Động vật 🐶 & Thực vật 🌿) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scroll-smooth">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count =
              cat.id === 'all'
                ? cards.length
                : cards.filter(
                    (c) =>
                      c.category === cat.id ||
                      (cat.id === 'animals' && (c.category === 'animals' || c.category === 'Động vật')) ||
                      (cat.id === 'plants' && (c.category === 'plants' || c.category === 'Thực vật'))
                  ).length;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  playClickSound();
                  setSelectedCategory(cat.id);
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs scale-102'
                    : 'bg-[#FFFDF7] dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
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

        {/* Row 2: Search Bar & Filters in a clean responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          {/* Search Input */}
          <div className="relative sm:col-span-6">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tra từ tiếng Hàn, phiên âm, tiếng Việt, động vật, thực vật..."
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
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
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
        <div className="bg-[#FFFDF7] rounded-3xl p-10 border-2 border-amber-200 text-center shadow-xs">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-lg font-black text-slate-900">Không tìm thấy từ vựng nào!</h3>
          <p className="text-sm text-slate-600 mt-1">
            Hãy thử tìm với từ khóa khác hoặc bấm nút "Thêm từ vựng ➕" để bổ sung ngay từ mới vào từ điển.
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setFilterStatus('all');
                setSelectedPos('all');
                setSelectedTopik('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-sky-500 text-white rounded-xl text-sm font-bold shadow-xs hover:bg-sky-600 transition-all cursor-pointer"
            >
              Xem tất cả từ vựng
            </button>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-xs hover:bg-emerald-600 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm từ vựng mới</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'dictionary' ? (
        /* DICTIONARY LIST VIEW (NỀN PASTEL TOÀN BỘ, BẢNG TIẾNG VIỆT CHỮ ĐEN) */
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
                  className={`rounded-2xl p-4 border-2 transition-all shadow-xs hover:shadow-md ${
                    card.category === 'animals'
                      ? 'bg-[#E8F8F5] border-emerald-200 hover:border-emerald-300'
                      : card.category === 'plants'
                      ? 'bg-[#F0FDF4] border-green-200 hover:border-green-300'
                      : card.category === 'food'
                      ? 'bg-[#FFF7ED] border-orange-200 hover:border-orange-300'
                      : card.category === 'travel'
                      ? 'bg-[#EFF6FF] border-blue-200 hover:border-blue-300'
                      : 'bg-[#FFFDF7] border-amber-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-white/90 text-slate-800 border border-slate-300 text-[11px] font-bold">
                          {card.category === 'animals' ? '🐶 Động vật' : card.category === 'plants' ? '🌿 Thực vật' : card.category}
                        </span>
                        {card.partOfSpeech && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200 text-[11px] font-bold">
                            {card.partOfSpeech}
                          </span>
                        )}
                        {card.topikLevel && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold">
                            {card.topikLevel}
                          </span>
                        )}
                        {card.isCustomAdmin && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200 text-[11px] font-black flex items-center gap-1">
                            <Award className="w-3 h-3" /> Admin thêm
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-2.5 mt-1.5">
                        <h4 className="text-xl font-black text-slate-900 font-sans tracking-tight">
                          {card.hangul}
                        </h4>
                        <span className="text-xs font-mono font-bold text-sky-700">
                          /{card.romanization}/
                        </span>
                      </div>

                      {/* NGHĨA TIẾNG VIỆT CHỮ ĐEN ĐẬM */}
                      <p className="text-base font-black text-black mt-1 leading-snug">
                        {card.vietnamese}
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={() => speakKorean(card.hangul)}
                        className="p-2 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 border border-sky-200 transition-colors cursor-pointer"
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
                            ? 'bg-emerald-200 text-emerald-900 border border-emerald-400'
                            : 'bg-white hover:bg-slate-100 text-slate-500 border border-slate-300'
                        }`}
                        title={isMastered ? 'Đã thuộc từ này' : 'Đánh dấu đã thuộc'}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      {/* Admin Quick Action Buttons */}
                      {effectiveIsAdmin && (
                        <div className="flex items-center gap-1 mt-1">
                          <button
                            onClick={() => handleOpenEditModal(card)}
                            className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 transition-colors cursor-pointer"
                            title="Chỉnh sửa từ này"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCardItem(card)}
                            className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 transition-colors cursor-pointer"
                            title="Xóa từ này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {card.exampleKo && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/80 text-xs">
                      <div className="flex items-center justify-between text-slate-900 font-bold">
                        <span>{card.exampleKo}</span>
                        <button
                          onClick={() => speakKorean(card.exampleKo)}
                          className="text-sky-700 hover:text-sky-900 ml-2 cursor-pointer"
                          title="Đọc câu ví dụ"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {/* BẢNG TIẾNG VIỆT CHỮ ĐEN */}
                      <p className="text-black font-black mt-0.5 text-xs">
                        {card.exampleVi}
                      </p>
                    </div>
                  )}

                  {card.tips && (
                    <div className="mt-2 text-[11px] text-black font-semibold bg-white/80 rounded-lg px-2.5 py-1 border border-amber-200">
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
          {/* 3D Flip Card Container (NỀN PASTEL TOÀN BỘ, BẢNG TIẾNG VIỆT CHỮ ĐEN) */}
          <div
            id="flashcard-container"
            onClick={handleFlip}
            className="w-full h-84 sm:h-96 perspective-1000 cursor-pointer select-none"
          >
            <div
              className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* 1. FRONT SIDE - NỀN PASTEL SKY */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-[#F0F9FF] via-[#E0F2FE]/50 to-[#BAE6FD]/40 rounded-3xl p-6 sm:p-8 border-2 border-sky-300 shadow-md flex flex-col justify-between backface-hidden">
                {/* Top card header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-900 border border-sky-200 text-xs font-bold uppercase tracking-wider">
                      {activeCard.category === 'animals' ? '🐶 Động vật' : activeCard.category === 'plants' ? '🌿 Thực vật' : activeCard.category}
                    </span>
                    {activeCard.partOfSpeech && (
                      <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200 text-xs font-semibold">
                        {activeCard.partOfSpeech}
                      </span>
                    )}
                    {activeCard.topikLevel && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold">
                        {activeCard.topikLevel}
                      </span>
                    )}
                    {activeCard.isCustomAdmin && (
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold flex items-center gap-1">
                        <Award className="w-3 h-3" /> Admin thêm
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {effectiveIsAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(activeCard);
                        }}
                        className="px-2.5 py-1 rounded-full bg-amber-200 hover:bg-amber-300 text-amber-900 border border-amber-300 text-xs font-black flex items-center gap-1 cursor-pointer transition-colors"
                        title="Chỉnh sửa từ này"
                      >
                        <Edit2 className="w-3 h-3" /> Sửa
                      </button>
                    )}
                    {isCurrentMastered && (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                        <BookmarkCheck className="w-3.5 h-3.5" /> Đã thuộc
                      </span>
                    )}
                    <span className="text-xs font-bold text-slate-500">
                      {currentIndex + 1} / {filteredCards.length}
                    </span>
                  </div>
                </div>

                {/* Center Content: Hangul & Romanization */}
                <div className="text-center my-auto py-2">
                  <div className="inline-flex items-center justify-center gap-2.5 sm:gap-3 flex-wrap">
                    <h3 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-normal font-sans">
                      {activeCard.hangul}
                    </h3>
                    <button
                      type="button"
                      onClick={(e) => handleSpeak(e, activeCard.hangul)}
                      className="p-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-200 hover:scale-110 active:scale-95 transition-all cursor-pointer"
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
                          : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200'
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
                    <p className="text-sm sm:text-base font-bold text-sky-700 mt-2 tracking-wide font-mono">
                      /{activeCard.romanization}/
                    </p>
                  )}

                  {/* Vocab Speech Feedback */}
                  {vocabSpeechFeedback && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mt-3 max-w-xs mx-auto p-2.5 rounded-2xl bg-white border border-purple-200 shadow-sm text-xs space-y-1 animate-fadeIn cursor-default"
                    >
                      {isVocabRecording ? (
                        <div className="text-rose-600 font-bold flex items-center justify-center gap-1.5 animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                          <span>🎙️ Đang nghe bạn đọc... Hãy đọc to từ này</span>
                        </div>
                      ) : vocabSpeechFeedback.isEvaluated ? (
                        <div className="text-center space-y-0.5">
                          <div
                            className={`font-black flex items-center justify-center gap-1 ${
                              (vocabSpeechFeedback.accuracy || 0) >= 60
                                ? 'text-emerald-700'
                                : 'text-amber-800'
                            }`}
                          >
                            {(vocabSpeechFeedback.accuracy || 0) >= 60 ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{vocabSpeechFeedback.accuracy}% Chuẩn xác! (+10 XP)</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                <span>{vocabSpeechFeedback.accuracy}% Cần luyện thêm</span>
                              </>
                            )}
                          </div>
                          {vocabSpeechFeedback.transcript && (
                            <div className="text-[11px] text-slate-600 font-mono">
                              Bạn đã đọc: "{vocabSpeechFeedback.transcript}"
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  )}

                  {activeCard.tips && (
                    <div className="mt-4 max-w-sm mx-auto bg-amber-100 border border-amber-300 rounded-xl px-3 py-1.5 text-xs text-black font-semibold">
                      💡 {activeCard.tips}
                    </div>
                  )}
                </div>

                {/* Bottom flip hint */}
                <div className="text-center">
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-800 bg-white/80 px-3 py-1 rounded-full border border-sky-300">
                    <RotateCcw className="w-3 h-3 text-sky-600" /> Nhấn vào thẻ để xem bảng tiếng Việt
                  </span>
                </div>
              </div>

              {/* 2. BACK SIDE (BẢNG TIẾNG VIỆT CHO CHỮ ĐEN VÀ NỀN PASTEL) */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-[#FFFDF7] via-[#FFFBEB] to-[#FEF3C7] rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-md flex flex-col justify-between backface-hidden rotate-y-180">
                {/* Back card header */}
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-amber-200 text-black border border-amber-300 text-xs font-black uppercase tracking-wider">
                    🇻🇳 BẢNG TIẾNG VIỆT
                  </span>

                  <button
                    onClick={(e) => handleSpeak(e, activeCard.hangul)}
                    className="p-2 rounded-xl bg-amber-200 hover:bg-amber-300 text-black border border-amber-300 transition-colors cursor-pointer"
                    title="Nghe lại phát âm"
                  >
                    <Volume2 className="w-4 h-4 text-black" />
                  </button>
                </div>

                {/* Vietnamese meaning & Sentence example - BẢNG TIẾNG VIỆT CHỮ ĐEN ĐẬM */}
                <div className="text-center my-auto space-y-4">
                  <div>
                    <span className="text-xs font-black text-slate-600 uppercase tracking-widest block mb-1">
                      Ý NGHĨA CHUẨN XÁC
                    </span>
                    <h3 className="text-3xl sm:text-4xl font-black text-black tracking-tight leading-tight">
                      {activeCard.vietnamese}
                    </h3>
                  </div>

                  {activeCard.exampleKo && (
                    <div className="bg-white/95 rounded-2xl p-4 border border-amber-300 shadow-xs text-left max-w-md mx-auto">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
                        <span>Câu ví dụ thực tế:</span>
                        <button
                          onClick={(e) => handleSpeak(e, activeCard.exampleKo)}
                          className="hover:text-black p-0.5 rounded cursor-pointer"
                          title="Đọc câu ví dụ"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-black" />
                        </button>
                      </div>
                      <p className="text-sm font-black text-slate-900">{activeCard.exampleKo}</p>
                      {/* BẢNG TIẾNG VIỆT CHỮ ĐEN */}
                      <p className="text-sm font-black text-black mt-1">
                        ↳ {activeCard.exampleVi}
                      </p>
                    </div>
                  )}

                  {activeCard.tips && (
                    <div className="text-xs text-black font-semibold bg-amber-100/90 rounded-xl px-3 py-1.5 border border-amber-300 max-w-md mx-auto">
                      💡 {activeCard.tips}
                    </div>
                  )}
                </div>

                {/* Bottom flip hint */}
                <div className="text-center">
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-black bg-amber-200 px-3 py-1 rounded-full border border-amber-300">
                    <RotateCcw className="w-3 h-3 text-black" /> Nhấn để lật lại mặt trước tiếng Hàn
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation and Action buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={handlePrev}
              className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-[#FFFDF7] border-2 border-amber-200 text-slate-900 font-bold hover:bg-amber-100 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Thẻ trước</span>
            </button>

            {/* Mastered toggle button */}
            <button
              onClick={handleMasterClick}
              className={`flex-1 max-w-xs flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-black transition-all shadow-xs cursor-pointer active:scale-95 ${
                isCurrentMastered
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200'
                  : 'bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white shadow-sky-200'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{isCurrentMastered ? '✓ Đã thuộc từ này' : 'Đánh dấu đã thuộc (+5 XP)'}</span>
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-[#FFFDF7] border-2 border-amber-200 text-slate-900 font-bold hover:bg-amber-100 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <span className="hidden sm:inline">Thẻ sau</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : null}

      {/* ADMIN STUDIO MODAL (CHỈNH SỬA & THÊM TỪ VỰNG MỚI VÀO TỪ ĐIỂN) */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-[#FFFDF7] rounded-3xl max-w-xl w-full border-2 border-amber-300 shadow-2xl p-5 sm:p-6 my-8 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center font-black">
                  {editingCard ? '✏️' : '➕'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {editingCard ? 'Chỉnh Sửa Từ Vựng' : 'Thêm Từ Vựng Mới Vào Từ Điển'}
                  </h3>
                  <p className="text-xs text-slate-600">
                    Cập nhật tự động toàn bộ ứng dụng (Flashcard, Tra từ, Luyện tập, Minigame)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAdminModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Admin Designation Notice */}
            <div className="p-3 rounded-xl bg-amber-100 border border-amber-300 text-xs text-amber-950 font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-800 shrink-0" />
              <span>
                Quyền Admin: Khi bạn thêm/sửa, từ vựng sẽ được lưu vào hệ thống và kích hoạt ngay lập tức mà không cần gõ câu lệnh.
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCard} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Hangul */}
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    Từ vựng tiếng Hàn (Hangul) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formHangul}
                    onChange={(e) => setFormHangul(e.target.value)}
                    placeholder="VD: 강아지, 벚꽃, 사과..."
                    className="w-full px-3 py-2 bg-white rounded-xl border border-amber-300 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Romanization */}
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    Phiên âm La-tinh (Romanization)
                  </label>
                  <input
                    type="text"
                    value={formRomanization}
                    onChange={(e) => setFormRomanization(e.target.value)}
                    placeholder="VD: gang-a-ji, beot-kkot..."
                    className="w-full px-3 py-2 bg-white rounded-xl border border-amber-300 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Vietnamese Meaning - BẢNG TIẾNG VIỆT CHỮ ĐEN */}
              <div>
                <label className="block text-xs font-black text-black mb-1">
                  Nghĩa tiếng Việt * (Chữ đen chuẩn rõ nét)
                </label>
                <input
                  type="text"
                  required
                  value={formVietnamese}
                  onChange={(e) => setFormVietnamese(e.target.value)}
                  placeholder="VD: Chó con, cún cưng / Hoa anh đào..."
                  className="w-full px-3 py-2 bg-white rounded-xl border-2 border-amber-300 text-sm font-black text-black focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Category & Part of Speech & TOPIK */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Chủ đề */}
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    Chủ đề từ vựng
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white rounded-xl border border-amber-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="animals">🐶 Động vật</option>
                    <option value="plants">🌿 Thực vật</option>
                    <option value="food">🍲 Ẩm thực</option>
                    <option value="daily">🏡 Đời sống</option>
                    <option value="travel">✈️ Du lịch</option>
                    <option value="shopping">🛍️ Mua sắm</option>
                    <option value="family">👨‍👩‍👧 Gia đình</option>
                    <option value="emotions">💖 Cảm xúc</option>
                    <option value="work">💼 Công sở</option>
                    <option value="verbs">🏃 Động từ</option>
                    <option value="adjectives">🎨 Tính từ</option>
                    <option value="hangeul">🔤 Chữ cái</option>
                    <option value="greetings">👋 Chào hỏi</option>
                    <option value="numbers">🔢 Số đếm</option>
                    <option value="custom">✍️ Tự nhập chủ đề...</option>
                  </select>
                </div>

                {/* Từ loại */}
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    Từ loại
                  </label>
                  <select
                    value={formPartOfSpeech}
                    onChange={(e) => setFormPartOfSpeech(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white rounded-xl border border-amber-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Danh từ">Danh từ</option>
                    <option value="Động từ">Động từ</option>
                    <option value="Tính từ">Tính từ</option>
                    <option value="Phó từ">Phó từ</option>
                    <option value="Đại từ">Đại từ</option>
                    <option value="Cụm từ">Cụm từ</option>
                  </select>
                </div>

                {/* TOPIK Level */}
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    Cấp độ TOPIK
                  </label>
                  <select
                    value={formTopikLevel}
                    onChange={(e) => setFormTopikLevel(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white rounded-xl border border-amber-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Sơ cấp 1">Sơ cấp 1</option>
                    <option value="Sơ cấp 2">Sơ cấp 2</option>
                    <option value="Trung cấp">Trung cấp</option>
                  </select>
                </div>
              </div>

              {formCategory === 'custom' && (
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    Tên chủ đề mới
                  </label>
                  <input
                    type="text"
                    value={formCustomCategory}
                    onChange={(e) => setFormCustomCategory(e.target.value)}
                    placeholder="VD: Thể thao, Y tế, Thời tiết..."
                    className="w-full px-3 py-2 bg-white rounded-xl border border-amber-300 text-xs font-bold text-slate-900"
                  />
                </div>
              )}

              {/* Example Sentences */}
              <div className="space-y-2 pt-1 border-t border-amber-200">
                <label className="block text-xs font-black text-slate-800">
                  Câu ví dụ thực tế & Dịch nghĩa tiếng Việt
                </label>
                <input
                  type="text"
                  value={formExampleKo}
                  onChange={(e) => setFormExampleKo(e.target.value)}
                  placeholder="Ví dụ tiếng Hàn: 강아지가 꼬리를 흔들어요."
                  className="w-full px-3 py-2 bg-white rounded-xl border border-amber-300 text-xs font-bold text-slate-900"
                />
                <input
                  type="text"
                  value={formExampleVi}
                  onChange={(e) => setFormExampleVi(e.target.value)}
                  placeholder="Dịch nghĩa tiếng Việt: Chó con vẫy đuôi."
                  className="w-full px-3 py-2 bg-white rounded-xl border border-amber-300 text-xs font-black text-black"
                />
              </div>

              {/* Tips */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  Mẹo ghi nhớ (Tips)
                </label>
                <input
                  type="text"
                  value={formTips}
                  onChange={(e) => setFormTips(e.target.value)}
                  placeholder="Mẹo nhớ, văn hóa hoặc điểm ngữ pháp đi kèm..."
                  className="w-full px-3 py-2 bg-white rounded-xl border border-amber-300 text-xs text-slate-900"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-amber-200">
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingCard ? 'Lưu thay đổi' : 'Lưu từ vựng vào hệ thống ✨'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
