import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  Sparkles,
  Volume2,
  Check,
  X,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  Heart,
  Smile,
  Zap,
  Bot,
  Loader2,
  Trophy,
  Flame,
  Shuffle,
  BookOpen,
  Layers,
  Award,
  CheckCircle2
} from 'lucide-react';
import { KoreanRiddle, EmojiPuzzle, WordGuessPuzzle, ScramblePuzzle } from '../types';
import { KOREAN_RIDDLES, EMOJI_PUZZLES, WORD_GUESS_PUZZLES } from '../data/puzzles';
import {
  getRandomizedScramblePuzzles,
  getAvailableCategories,
  CategoryInfo,
  MASTER_SCRAMBLE_PUZZLES,
} from '../data/scramblePuzzles';
import {
  speakKorean,
  playClickSound,
  playSuccessSound,
  playIncorrectSound,
  playFanfareSound
} from '../utils/audio';
import { VoiceGenderToggle } from './VoiceGenderToggle';

interface PuzzleGameViewProps {
  onAddXp: (amount: number) => void;
}

type PuzzleMode = 'scramble' | 'riddles' | 'emoji' | 'secret';

export const PuzzleGameView: React.FC<PuzzleGameViewProps> = ({ onAddXp }) => {
  const [activeMode, setActiveMode] = useState<PuzzleMode>('scramble');

  // ==========================================
  // MODE 0: 1000+ SCRAMBLE PUZZLES (ĐẢO TỪ ĐỂ CHỌN - THỨ TỰ NGẪU NHIÊN)
  // ==========================================
  const categoriesList = getAvailableCategories();
  const [scrambleCategory, setScrambleCategory] = useState<string>('all');
  const [scrambleType, setScrambleType] = useState<'all' | 'word' | 'sentence'>('all');
  const [scrambleQueue, setScrambleQueue] = useState<ScramblePuzzle[]>(() =>
    getRandomizedScramblePuzzles({ category: 'all', type: 'all' })
  );
  const [scrambleIndex, setScrambleIndex] = useState(0);
  const [selectedTokens, setSelectedTokens] = useState<Array<{ id: string; text: string }>>([]);
  const [isScrambleSolved, setIsScrambleSolved] = useState(false);
  const [isScrambleWrong, setIsScrambleWrong] = useState(false);
  const [showScrambleHint, setShowScrambleHint] = useState(false);
  const [scrambleStreak, setScrambleStreak] = useState(0);
  const [scrambleSolvedCount, setScrambleSolvedCount] = useState(0);

  const activeScramblePuzzle = scrambleQueue[scrambleIndex % (scrambleQueue.length || 1)];
  const targetTokenCount = activeScramblePuzzle?.correctTokens.length || 0;

  // Tile items in candidate pool
  const [tileItems, setTileItems] = useState<Array<{ id: string; text: string; isUsed: boolean }>>([]);

  // Sync candidate tiles whenever active puzzle changes
  useEffect(() => {
    if (!activeScramblePuzzle) return;
    const items = activeScramblePuzzle.scrambledTokens.map((text, idx) => ({
      id: `tile-${activeScramblePuzzle.id}-${idx}-${text}`,
      text,
      isUsed: false,
    }));
    setTileItems(items);
    setSelectedTokens([]);
    setIsScrambleSolved(false);
    setIsScrambleWrong(false);
    setShowScrambleHint(false);
  }, [scrambleIndex, scrambleQueue]);

  // Handle changing category or puzzle type (re-randomizes queue with Fisher-Yates)
  const handleCategoryChange = (catId: string) => {
    playClickSound();
    setScrambleCategory(catId);
    const newQueue = getRandomizedScramblePuzzles({ category: catId, type: scrambleType });
    setScrambleQueue(newQueue);
    setScrambleIndex(0);
  };

  const handleTypeChange = (type: 'all' | 'word' | 'sentence') => {
    playClickSound();
    setScrambleType(type);
    const newQueue = getRandomizedScramblePuzzles({ category: scrambleCategory, type });
    setScrambleQueue(newQueue);
    setScrambleIndex(0);
  };

  // Re-shuffle entire bank randomly (guarantees NO fixed order)
  const handleReshuffleAll = () => {
    playClickSound();
    const newQueue = getRandomizedScramblePuzzles({ category: scrambleCategory, type: scrambleType });
    setScrambleQueue(newQueue);
    setScrambleIndex(0);
  };

  // Advance to next random question
  const handleNextRandomQuestion = () => {
    playClickSound();
    if (scrambleQueue.length <= 1) return;
    // Jump to another random offset
    const randomOffset = 1 + Math.floor(Math.random() * Math.min(10, scrambleQueue.length - 1));
    setScrambleIndex((prev) => (prev + randomOffset) % scrambleQueue.length);
  };

  // User taps an available tile to pick it
  const handlePickTile = (tileId: string, text: string) => {
    if (isScrambleSolved || selectedTokens.length >= targetTokenCount) return;
    playClickSound();

    const nextSelected = [...selectedTokens, { id: tileId, text }];
    setSelectedTokens(nextSelected);

    setTileItems((prev) =>
      prev.map((t) => (t.id === tileId ? { ...t, isUsed: true } : t))
    );

    // If reached full token count, check answer immediately!
    if (nextSelected.length === targetTokenCount) {
      const userTokens = nextSelected.map((t) => t.text);
      const isCorrect =
        userTokens.join('') === activeScramblePuzzle.correctTokens.join('') ||
        userTokens.join(' ') === activeScramblePuzzle.correctTokens.join(' ');

      if (isCorrect) {
        playSuccessSound();
        setIsScrambleSolved(true);
        setIsScrambleWrong(false);
        setScrambleStreak((prev) => prev + 1);
        setScrambleSolvedCount((prev) => prev + 1);
        onAddXp(15);
        confetti({
          particleCount: 55,
          spread: 75,
          origin: { y: 0.6 },
        });
      } else {
        playIncorrectSound();
        setIsScrambleWrong(true);
        setScrambleStreak(0);
        setTimeout(() => {
          setIsScrambleWrong(false);
        }, 850);
      }
    }
  };

  // User taps a selected token to remove it
  const handleRemoveToken = (tokenObj: { id: string; text: string }) => {
    if (isScrambleSolved) return;
    playClickSound();
    setSelectedTokens((prev) => prev.filter((t) => t.id !== tokenObj.id));
    setTileItems((prev) =>
      prev.map((t) => (t.id === tokenObj.id ? { ...t, isUsed: false } : t))
    );
    setIsScrambleWrong(false);
  };

  // Clear all tokens
  const handleClearTokens = () => {
    playClickSound();
    setSelectedTokens([]);
    setTileItems((prev) => prev.map((t) => ({ ...t, isUsed: false })));
    setIsScrambleWrong(false);
  };

  // ==========================================
  // MODE 1: KOREAN RIDDLES (수수께끼) STATE
  // ==========================================
  const [riddlesList, setRiddlesList] = useState<KoreanRiddle[]>(KOREAN_RIDDLES);
  const [currentRiddleIndex, setCurrentRiddleIndex] = useState(0);
  const [riddleFilter, setRiddleFilter] = useState<'all' | 'wordplay' | 'daily' | 'culture' | 'funny'>('all');
  const [showRiddleHint, setShowRiddleHint] = useState(false);
  const [showRiddleAnswer, setShowRiddleAnswer] = useState(false);
  const [userRiddleInput, setUserRiddleInput] = useState('');
  const [riddleFeedback, setRiddleFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [solvedRiddles, setSolvedRiddles] = useState<string[]>([]);
  const [isLoadingAiRiddle, setIsLoadingAiRiddle] = useState(false);

  const filteredRiddles = riddlesList.filter((r) =>
    riddleFilter === 'all' ? true : r.category === riddleFilter
  );
  const activeRiddle = filteredRiddles[currentRiddleIndex] || filteredRiddles[0];

  useEffect(() => {
    setShowRiddleHint(false);
    setShowRiddleAnswer(false);
    setUserRiddleInput('');
    setRiddleFeedback(null);
  }, [currentRiddleIndex, riddleFilter]);

  const handleCheckRiddleAnswer = () => {
    if (!activeRiddle || !userRiddleInput.trim()) return;
    playClickSound();

    const cleanInput = userRiddleInput.trim().toLowerCase();
    const targetKo = activeRiddle.answerKo.toLowerCase();
    const targetVi = activeRiddle.answerVi.toLowerCase();

    const isKoMatch = cleanInput === targetKo || cleanInput.includes(targetKo);
    const isViMatch = targetVi.includes(cleanInput) && cleanInput.length >= 2;

    if (isKoMatch || isViMatch) {
      playSuccessSound();
      setShowRiddleAnswer(true);
      setRiddleFeedback({
        isCorrect: true,
        message: '🎉 Chính xác xuất sắc! Bạn đã giải được câu đố này!',
      });
      if (!solvedRiddles.includes(activeRiddle.id)) {
        setSolvedRiddles((prev) => [...prev, activeRiddle.id]);
        onAddXp(15);
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    } else {
      playIncorrectSound();
      setRiddleFeedback({
        isCorrect: false,
        message: 'Chưa đúng rồi! Hãy thử suy nghĩ thêm hoặc nhấn xem manh mối nhé!',
      });
    }
  };

  const handleFetchAiRiddle = async () => {
    playClickSound();
    setIsLoadingAiRiddle(true);
    try {
      const res = await fetch('/api/riddle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: 'chơi chữ và văn hóa hài hước tiếng Hàn' }),
      });
      if (!res.ok) throw new Error('Không thể tải câu đố AI');
      const data: KoreanRiddle = await res.json();
      setRiddlesList((prev) => [data, ...prev]);
      setCurrentRiddleIndex(0);
      setRiddleFilter('all');
      playSuccessSound();
    } catch (err) {
      console.error('Error fetching AI riddle:', err);
    } finally {
      setIsLoadingAiRiddle(false);
    }
  };

  // ==========================================
  // MODE 2: EMOJI PUZZLE (이모지 단어 퍼즐) STATE
  // ==========================================
  const [emojiIndex, setEmojiIndex] = useState(0);
  const activeEmojiPuzzle = EMOJI_PUZZLES[emojiIndex % EMOJI_PUZZLES.length];
  const targetWordLength = activeEmojiPuzzle.wordKo.length;
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [isEmojiSolved, setIsEmojiSolved] = useState(false);
  const [isEmojiWrong, setIsEmojiWrong] = useState(false);
  const [emojiStreak, setEmojiStreak] = useState(0);

  useEffect(() => {
    setSelectedLetters([]);
    setIsEmojiSolved(false);
    setIsEmojiWrong(false);
  }, [emojiIndex]);

  const handleSelectEmojiTile = (letter: string) => {
    if (isEmojiSolved || selectedLetters.length >= targetWordLength) return;
    playClickSound();
    const updated = [...selectedLetters, letter];
    setSelectedLetters(updated);

    if (updated.length === targetWordLength) {
      const userWord = updated.join('');
      if (userWord === activeEmojiPuzzle.wordKo) {
        playSuccessSound();
        setIsEmojiSolved(true);
        setIsEmojiWrong(false);
        setEmojiStreak((prev) => prev + 1);
        onAddXp(20);
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        playIncorrectSound();
        setIsEmojiWrong(true);
        setEmojiStreak(0);
        setTimeout(() => {
          setIsEmojiWrong(false);
        }, 800);
      }
    }
  };

  const handleRemoveEmojiLetter = (index: number) => {
    if (isEmojiSolved) return;
    playClickSound();
    setSelectedLetters((prev) => prev.filter((_, i) => i !== index));
    setIsEmojiWrong(false);
  };

  const handleClearEmojiLetters = () => {
    playClickSound();
    setSelectedLetters([]);
    setIsEmojiWrong(false);
  };

  // ==========================================
  // MODE 3: SECRET WORD GUESS (비밀 단어 맞히기) STATE
  // ==========================================
  const [secretIndex, setSecretIndex] = useState(0);
  const activeSecretPuzzle = WORD_GUESS_PUZZLES[secretIndex % WORD_GUESS_PUZZLES.length];
  const secretWord = activeSecretPuzzle.wordKo;
  const [guessedSyllables, setGuessedSyllables] = useState<string[]>([]);
  const [lives, setLives] = useState(5);
  const [isSecretWon, setIsSecretWon] = useState(false);
  const [isSecretLost, setIsSecretLost] = useState(false);

  useEffect(() => {
    setGuessedSyllables([]);
    setLives(5);
    setIsSecretWon(false);
    setIsSecretLost(false);
  }, [secretIndex]);

  const handleGuessSyllable = (syllable: string) => {
    if (isSecretWon || isSecretLost || guessedSyllables.includes(syllable)) return;

    playClickSound();
    const nextGuessed = [...guessedSyllables, syllable];
    setGuessedSyllables(nextGuessed);

    const isMatch = secretWord.includes(syllable);

    if (isMatch) {
      playSuccessSound();
      const allFound = secretWord.split('').every((char) => nextGuessed.includes(char));
      if (allFound) {
        setIsSecretWon(true);
        playFanfareSound();
        onAddXp(25);
        confetti({
          particleCount: 80,
          spread: 100,
          origin: { y: 0.5 },
        });
      }
    } else {
      playIncorrectSound();
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        setIsSecretLost(true);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24 md:pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-6 text-white shadow-md relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-black backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-yellow-200 animate-pulse" />
            <span>Khu Vui Chơi Trí Tuệ & Ngôn Ngữ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
            <span>🎮 Game Giải Đố Tiếng Hàn</span>
          </h2>
          <p className="text-xs sm:text-sm text-amber-100 max-w-xl">
            Thử tài ghép từ với kho <strong>1000+ câu đố đảo từ đa chủ đề</strong>, câu đố dân gian Hàn Quốc (수수께끼) và đoán chữ Emoji bí mật!
          </p>
        </div>

        {/* Decorative Watermark */}
        <div className="absolute right-4 -bottom-4 text-8xl opacity-10 select-none pointer-events-none font-black">
          놀이
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-slate-200/70 rounded-2xl">
        <button
          id="tab-scramble"
          onClick={() => {
            playClickSound();
            setActiveMode('scramble');
          }}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeMode === 'scramble'
              ? 'bg-white text-orange-600 shadow-sm ring-2 ring-orange-400/20'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shuffle className="w-4 h-4 text-orange-500 animate-spin-slow" />
          <span>Đảo từ 1000+ câu</span>
        </button>

        <button
          id="tab-riddles"
          onClick={() => {
            playClickSound();
            setActiveMode('riddles');
          }}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeMode === 'riddles'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span>수수께끼 Đố vui</span>
        </button>

        <button
          id="tab-emoji"
          onClick={() => {
            playClickSound();
            setActiveMode('emoji');
          }}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeMode === 'emoji'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Smile className="w-4 h-4 text-emerald-500" />
          <span>Đoán chữ Emoji</span>
        </button>

        <button
          id="tab-secret"
          onClick={() => {
            playClickSound();
            setActiveMode('secret');
          }}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeMode === 'secret'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Zap className="w-4 h-4 text-sky-500" />
          <span>Từ bí mật</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MODE 0: 1000+ SCRAMBLE PUZZLES (ĐẢO TỪ ĐỂ CHỌN - THỨ TỰ NGẪU NHIÊN)       */}
      {/* ========================================================================= */}
      {activeMode === 'scramble' && activeScramblePuzzle && (
        <div className="space-y-4">
          {/* Controls Bar: Randomizer, Stats & Gender Toggle */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black shadow-xs flex items-center gap-1.5">
                <Shuffle className="w-3.5 h-3.5 animate-spin-slow" />
                <span>🎲 Đố ngẫu nhiên không theo thứ tự</span>
              </span>

              <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <Flame className="w-4 h-4 text-rose-500" />
                <span>Chuỗi đúng: <strong className="text-slate-900">{scrambleStreak}</strong></span>
                <span className="mx-1">•</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Đã giải: <strong className="text-slate-900">{scrambleSolvedCount}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <VoiceGenderToggle compact showLabel={false} />

              <button
                id="btn-reshuffle-bank"
                onClick={handleReshuffleAll}
                title="Xáo trộn ngẫu nhiên toàn bộ kho 1000+ câu đố"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs border border-orange-200 transition-all cursor-pointer shadow-2xs"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Xáo trộn ngẫu nhiên 🎲</span>
              </button>
            </div>
          </div>

          {/* Topic Filters (13 Categories with Real Counts) */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
              <span>Chọn chủ đề ({categoriesList.length} chủ đề đa dạng):</span>
              <div className="flex items-center gap-1">
                {(['all', 'word', 'sentence'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => handleTypeChange(t)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      scrambleType === t
                        ? 'bg-slate-800 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t === 'all' ? 'Tất cả dạng' : t === 'word' ? '🔤 Từ vựng' : '💬 Ghép câu'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
              {categoriesList.map((cat) => {
                const isActive = scrambleCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    id={`filter-scramble-${cat.id}`}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-orange-500 text-white border-orange-600 shadow-xs scale-102'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-white/30 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Scramble Puzzle Card */}
          <div
            className={`bg-white rounded-3xl p-6 sm:p-8 border shadow-md space-y-6 transition-all duration-300 ${
              isScrambleWrong
                ? 'border-rose-400 bg-rose-50/20 ring-4 ring-rose-100 animate-shake'
                : isScrambleSolved
                ? 'border-emerald-400 bg-emerald-50/20 ring-4 ring-emerald-100'
                : 'border-slate-200'
            }`}
          >
            {/* Top Subhead */}
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-bold text-slate-400 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-extrabold flex items-center gap-1">
                  <span>{activeScramblePuzzle.categoryIcon}</span>
                  <span>{activeScramblePuzzle.categoryLabelVi}</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 text-[11px] font-bold">
                  {activeScramblePuzzle.type === 'word' ? 'Đảo âm tiết (Từ vựng)' : 'Đảo từ ngữ (Ghép câu)'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500">
                  Câu hỏi #{((scrambleIndex) % scrambleQueue.length) + 1} / {scrambleQueue.length}
                </span>
                <button
                  onClick={() => speakKorean(activeScramblePuzzle.koreanText)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-700 transition-colors cursor-pointer"
                  title="Nghe mẫu câu"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Prompt & Clue */}
            <div className="text-center space-y-1.5 max-w-lg mx-auto">
              <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200/60 inline-block">
                {activeScramblePuzzle.type === 'word' ? '🎯 ĐẢO CHỮ GHÉP TỪ VỰNG' : '🧩 ĐẢO TỪ GHÉP CÂU HOÀN CHỈNH'}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                "{activeScramblePuzzle.meaningVi}"
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Chọn các ô từ/âm tiết bên dưới theo đúng thứ tự tiếng Hàn để giải đố
              </p>
            </div>

            {/* Selected Slots Area (Vị trí các ô đã chọn) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
                <span>Ô ghép đáp án:</span>
                <span className="text-orange-600">
                  {selectedTokens.length} / {targetTokenCount} ô
                </span>
              </div>

              <div
                className={`min-h-20 p-4 rounded-2xl border-2 border-dashed flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 transition-colors ${
                  isScrambleSolved
                    ? 'border-emerald-400 bg-emerald-50/70'
                    : isScrambleWrong
                    ? 'border-rose-400 bg-rose-50/70'
                    : 'border-orange-300 bg-orange-50/40'
                }`}
              >
                {selectedTokens.length === 0 ? (
                  <span className="text-xs sm:text-sm text-slate-400 font-medium italic animate-pulse">
                    Nhấp vào các ô đảo từ bên dưới để xếp vào đây...
                  </span>
                ) : (
                  selectedTokens.map((t, idx) => (
                    <button
                      key={t.id}
                      onClick={() => handleRemoveToken(t)}
                      disabled={isScrambleSolved}
                      className={`px-4 py-2.5 rounded-2xl font-black text-base sm:text-lg shadow-sm transition-all transform hover:scale-105 active:scale-95 cursor-pointer ${
                        isScrambleSolved
                          ? 'bg-emerald-600 text-white shadow-emerald-200'
                          : isScrambleWrong
                          ? 'bg-rose-500 text-white'
                          : 'bg-gradient-to-b from-orange-500 to-amber-600 text-white hover:from-rose-500 hover:to-rose-600 shadow-orange-200'
                      }`}
                      title="Nhấn để gỡ bỏ khỏi ô"
                    >
                      <span>{t.text}</span>
                    </button>
                  ))
                )}

                {/* Show placeholder dashed boxes for remaining tokens */}
                {!isScrambleSolved &&
                  Array.from({ length: Math.max(0, targetTokenCount - selectedTokens.length) }).map((_, i) => (
                    <div
                      key={`placeholder-${i}`}
                      className="w-11 h-11 sm:w-14 sm:h-12 rounded-2xl border-2 border-dashed border-orange-200/90 bg-white/70 flex items-center justify-center text-xs font-bold text-orange-300 select-none"
                    >
                      {selectedTokens.length + i + 1}
                    </div>
                  ))}
              </div>
            </div>

            {/* Candidate Scrambled Tiles Pool (Ngân hàng từ đảo lộn để chọn) */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
                <span>Chọn từ/âm tiết bị đảo lộn:</span>
                {showScrambleHint && (
                  <span className="text-amber-600 font-extrabold flex items-center gap-1 animate-pulse">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Gợi ý: bắt đầu bằng "{activeScramblePuzzle.correctTokens[0]}" ({activeScramblePuzzle.romanization})</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/70 min-h-16">
                {tileItems.map((tile) => (
                  <button
                    key={tile.id}
                    id={`tile-${tile.id}`}
                    disabled={tile.isUsed || isScrambleSolved}
                    onClick={() => handlePickTile(tile.id, tile.text)}
                    className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-black text-base sm:text-xl transition-all cursor-pointer border-2 ${
                      tile.isUsed
                        ? 'opacity-20 bg-slate-200 text-slate-400 border-slate-200 scale-95 cursor-not-allowed'
                        : 'bg-white hover:bg-orange-50 border-slate-200 hover:border-orange-400 text-slate-800 shadow-xs hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95'
                    }`}
                  >
                    {tile.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Result / Victory Card */}
            {isScrambleSolved && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-white shadow-lg space-y-3 animate-fade-in">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-300 animate-bounce" />
                    <span className="text-lg font-black">Chính xác xuất sắc! (+15 XP)</span>
                  </div>
                  <button
                    onClick={() => speakKorean(activeScramblePuzzle.koreanText)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-black backdrop-blur-xs transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Phát âm chuẩn</span>
                  </button>
                </div>

                <div className="bg-black/15 rounded-xl p-3 space-y-1">
                  <div className="text-xl sm:text-2xl font-black text-yellow-200">
                    {activeScramblePuzzle.koreanText}
                  </div>
                  <div className="text-xs sm:text-sm text-emerald-100 font-medium">
                    /{activeScramblePuzzle.romanization}/ • {activeScramblePuzzle.meaningVi}
                  </div>
                  {activeScramblePuzzle.exampleSentence && (
                    <div className="text-xs text-white/90 pt-1 border-t border-white/10 italic">
                      Ví dụ: {activeScramblePuzzle.exampleSentence} ({activeScramblePuzzle.exampleSentenceVi})
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    id="btn-next-scramble-won"
                    onClick={handleNextRandomQuestion}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-black text-xs sm:text-sm shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <span>Câu đố ngẫu nhiên tiếp theo 🎲</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  id="btn-clear-scramble"
                  disabled={isScrambleSolved || selectedTokens.length === 0}
                  onClick={handleClearTokens}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Xóa chọn lại</span>
                </button>

                <button
                  id="btn-hint-scramble"
                  disabled={isScrambleSolved || showScrambleHint}
                  onClick={() => {
                    playClickSound();
                    setShowScrambleHint(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Gợi ý</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-skip-scramble-random"
                  onClick={handleNextRandomQuestion}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black shadow-xs transition-transform hover:scale-102 active:scale-98 cursor-pointer"
                >
                  <span>Đổi câu khác 🎲</span>
                  <Shuffle className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 1: KOREAN RIDDLES (수수께끼) */}
      {/* ========================================================================= */}
      {activeMode === 'riddles' && activeRiddle && (
        <div className="space-y-4">
          {/* Filter & AI Request Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'wordplay', label: 'Chơi chữ (말장난)' },
                { id: 'daily', label: 'Đời sống' },
                { id: 'culture', label: 'Văn hóa' },
                { id: 'funny', label: 'Hài hước' },
              ].map((f) => (
                <button
                  key={f.id}
                  id={`filter-${f.id}`}
                  onClick={() => {
                    playClickSound();
                    setRiddleFilter(f.id as any);
                    setCurrentRiddleIndex(0);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    riddleFilter === f.id
                      ? 'bg-orange-100 text-orange-700 border border-orange-200'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <button
              id="btn-ai-riddle"
              disabled={isLoadingAiRiddle}
              onClick={handleFetchAiRiddle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoadingAiRiddle ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang xin AI câu đố mới...</span>
                </>
              ) : (
                <>
                  <Bot className="w-3.5 h-3.5" />
                  <span>AI tạo câu đố độc lạ ✨</span>
                </>
              )}
            </button>
          </div>

          {/* Riddle Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-md space-y-6">
            {/* Header info */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 border border-orange-100">
                Câu đố {currentRiddleIndex + 1} / {filteredRiddles.length}
              </span>
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Đã giải: {solvedRiddles.length} câu</span>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="px-3 py-1 rounded-xl bg-orange-500 text-white font-black text-sm shrink-0">
                  Q
                </span>
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-800 leading-snug">
                    {activeRiddle.questionKo}
                  </h3>
                  <p className="text-sm font-medium text-slate-500 italic">
                    "{activeRiddle.questionVi}"
                  </p>
                </div>
              </div>

              {/* TTS Listen Button */}
              <div className="pl-11">
                <button
                  id="btn-listen-riddle"
                  onClick={() => speakKorean(activeRiddle.questionKo)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5 text-orange-500" />
                  <span>Nghe đọc câu đố 🔊</span>
                </button>
              </div>
            </div>

            {/* Hint Box (Collapsible) */}
            {showRiddleHint && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-medium flex items-start gap-2.5 animate-fadeIn">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-800">Manh mối mách nước: </span>
                  {activeRiddle.hint}
                </div>
              </div>
            )}

            {/* User Input & Answer Checking */}
            {!showRiddleAnswer ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    id="input-riddle-answer"
                    type="text"
                    value={userRiddleInput}
                    onChange={(e) => setUserRiddleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCheckRiddleAnswer();
                    }}
                    placeholder="Nhập câu trả lời bằng tiếng Hàn hoặc tiếng Việt..."
                    className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm font-medium"
                  />
                  <button
                    id="btn-check-riddle"
                    onClick={handleCheckRiddleAnswer}
                    className="px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm transition-colors shadow-sm cursor-pointer"
                  >
                    Trả lời
                  </button>
                </div>

                {/* Feedback message */}
                {riddleFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                      riddleFeedback.isCorrect
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {riddleFeedback.isCorrect ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <X className="w-4 h-4 text-rose-500" />
                    )}
                    <span>{riddleFeedback.message}</span>
                  </div>
                )}
              </div>
            ) : (
              /* Correct Answer & Pun Explanation Card */
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                      ĐÁP ÁN CHUẨN
                    </span>
                    <h4 className="text-xl font-black text-emerald-900">
                      {activeRiddle.answerKo}{' '}
                      <span className="text-xs text-emerald-700 font-semibold">
                        ({activeRiddle.romanization})
                      </span>
                    </h4>
                  </div>
                  <button
                    id="btn-listen-riddle-answer"
                    onClick={() => speakKorean(activeRiddle.answerKo)}
                    className="p-2 rounded-xl bg-white shadow-xs hover:bg-emerald-100 text-emerald-700 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-sm font-bold text-emerald-800">
                  {activeRiddle.answerVi}
                </p>

                <div className="text-xs font-medium text-emerald-900/90 bg-white/70 p-3 rounded-xl border border-emerald-100 leading-relaxed">
                  <span className="font-bold text-emerald-800">💡 Giải mã thú vị: </span>
                  {activeRiddle.punExplanation}
                </div>
              </div>
            )}

            {/* Riddle Action Toolbar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  id="btn-toggle-hint"
                  onClick={() => {
                    playClickSound();
                    setShowRiddleHint((prev) => !prev);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{showRiddleHint ? 'Ẩn gợi ý' : 'Xem gợi ý'}</span>
                </button>

                {!showRiddleAnswer && (
                  <button
                    id="btn-reveal-answer"
                    onClick={() => {
                      playClickSound();
                      setShowRiddleAnswer(true);
                    }}
                    className="px-3 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-bold cursor-pointer"
                  >
                    Xem luôn đáp án
                  </button>
                )}
              </div>

              {/* Next / Previous Riddle */}
              <div className="flex items-center gap-2">
                <button
                  id="btn-prev-riddle"
                  onClick={() => {
                    playClickSound();
                    setCurrentRiddleIndex((prev) => Math.max(0, prev - 1));
                  }}
                  disabled={currentRiddleIndex === 0}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 disabled:opacity-40 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  id="btn-next-riddle"
                  onClick={() => {
                    playClickSound();
                    setCurrentRiddleIndex((prev) => (prev + 1) % filteredRiddles.length);
                  }}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  <span>Câu tiếp theo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: EMOJI PUZZLE (이모지 단어 퍼즐) */}
      {/* ========================================================================= */}
      {activeMode === 'emoji' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-md space-y-6">
            {/* Header info */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                Câu {((emojiIndex) % EMOJI_PUZZLES.length) + 1} / {EMOJI_PUZZLES.length} • {activeEmojiPuzzle.category}
              </span>
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-emerald-500" />
                <span>Chuỗi đúng: {emojiStreak}</span>
              </div>
            </div>

            {/* Giant Emoji Display */}
            <div className="text-center space-y-3 py-4">
              <div className="text-6xl sm:text-7xl select-none animate-bounce-slow">
                {activeEmojiPuzzle.emojis}
              </div>
              <p className="text-sm sm:text-base font-bold text-slate-700 max-w-md mx-auto">
                {activeEmojiPuzzle.clueVi}
              </p>
            </div>

            {/* Target Hangul Slots */}
            <div className="flex items-center justify-center gap-3">
              {Array.from({ length: targetWordLength }).map((_, idx) => {
                const letter = selectedLetters[idx];
                return (
                  <button
                    key={idx}
                    id={`emoji-slot-${idx}`}
                    onClick={() => letter && handleRemoveEmojiLetter(idx)}
                    className={`w-14 h-16 sm:w-16 sm:h-20 rounded-2xl border-2 flex items-center justify-center text-2xl sm:text-3xl font-black transition-all select-none cursor-pointer ${
                      letter
                        ? isEmojiSolved
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-100 scale-105'
                          : isEmojiWrong
                          ? 'bg-rose-50 text-rose-700 border-rose-400 animate-shake'
                          : 'bg-white text-slate-800 border-emerald-400 shadow-xs'
                        : 'bg-slate-50 border-dashed border-slate-300 text-slate-300'
                    }`}
                  >
                    {letter || ''}
                  </button>
                );
              })}
            </div>

            {/* Solved Card Feedback */}
            {isEmojiSolved && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 max-w-md mx-auto animate-fadeIn">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl font-black text-emerald-900">
                    {activeEmojiPuzzle.wordKo}
                  </span>
                  <button
                    id="btn-speak-emoji-word"
                    onClick={() => speakKorean(activeEmojiPuzzle.wordKo)}
                    className="p-1 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-emerald-800 font-medium">
                  /{activeEmojiPuzzle.romanization}/ • {activeEmojiPuzzle.meaningVi}
                </p>
                <p className="text-xs font-bold text-emerald-600">
                  🎉 Chính xác! (+20 XP)
                </p>
                <button
                  id="btn-next-emoji-card"
                  onClick={() => {
                    playClickSound();
                    setEmojiIndex((prev) => prev + 1);
                  }}
                  className="mt-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-transform hover:scale-105 cursor-pointer"
                >
                  Câu tiếp theo ➔
                </button>
              </div>
            )}

            {/* Scrambled Syllable Tiles */}
            {!isEmojiSolved && (
              <div className="space-y-3 pt-2">
                <div className="text-center text-xs text-slate-500 font-medium">
                  Nhấn vào các chữ cái bên dưới theo đúng thứ tự:
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-sm mx-auto">
                  {activeEmojiPuzzle.scrambledLetters.map((letter, idx) => (
                    <button
                      key={idx}
                      id={`emoji-tile-${idx}`}
                      onClick={() => handleSelectEmojiTile(letter)}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-800 font-black text-lg sm:text-xl shadow-xs transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                id="btn-clear-emoji"
                onClick={handleClearEmojiLetters}
                disabled={selectedLetters.length === 0 || isEmojiSolved}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 disabled:opacity-40 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xóa chữ</span>
              </button>

              <button
                id="btn-skip-emoji"
                onClick={() => {
                  playClickSound();
                  setEmojiIndex((prev) => prev + 1);
                }}
                className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <span>Bỏ qua câu này</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: SECRET WORD GUESS (비밀 단어 맞히기) */}
      {/* ========================================================================= */}
      {activeMode === 'secret' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-md space-y-6">
            {/* Header info */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-100">
                Màn {((secretIndex) % WORD_GUESS_PUZZLES.length) + 1} / {WORD_GUESS_PUZZLES.length} • {activeSecretPuzzle.category}
              </span>
              {/* Hearts / Lives indicator */}
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Heart
                    key={idx}
                    className={`w-4 h-4 ${
                      idx < lives
                        ? 'text-rose-500 fill-rose-500 animate-pulse'
                        : 'text-slate-200 fill-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Secret Word Clue */}
            <div className="text-center space-y-2 py-2">
              <div className="inline-block px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-extrabold">
                💡 Manh mối gợi ý
              </div>
              <p className="text-base sm:text-lg font-bold text-slate-800 max-w-md mx-auto">
                "{activeSecretPuzzle.clueVi}"
              </p>
            </div>

            {/* Secret Hangul Slots */}
            <div className="flex items-center justify-center gap-3">
              {secretWord.split('').map((char, idx) => {
                const isRevealed = guessedSyllables.includes(char) || isSecretLost;
                return (
                  <div
                    key={idx}
                    id={`secret-slot-${idx}`}
                    className={`w-14 h-16 sm:w-16 sm:h-20 rounded-2xl border-2 flex items-center justify-center text-2xl sm:text-3xl font-black transition-all select-none ${
                      isRevealed
                        ? isSecretWon
                          ? 'bg-emerald-500 text-white border-emerald-600 scale-105 shadow-md shadow-emerald-100'
                          : isSecretLost
                          ? 'bg-rose-100 text-rose-800 border-rose-400'
                          : 'bg-sky-500 text-white border-sky-600 shadow-md shadow-sky-100'
                        : 'bg-slate-100 border-dashed border-slate-300 text-slate-400'
                    }`}
                  >
                    {isRevealed ? char : '?'}
                  </div>
                );
              })}
            </div>

            {/* Victory Card */}
            {isSecretWon && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-3 max-w-md mx-auto">
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span className="text-xl font-black text-emerald-900">
                    {activeSecretPuzzle.wordKo}
                  </span>
                  <button
                    id="btn-speak-won-word"
                    onClick={() => speakKorean(activeSecretPuzzle.wordKo)}
                    className="p-1.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-emerald-800 font-medium">
                  /{activeSecretPuzzle.romanization}/ • {activeSecretPuzzle.meaningVi}
                </p>
                <p className="text-xs font-bold text-emerald-700">
                  🎉 Bạn đã giải mã thành công từ bí mật! (+25 XP)
                </p>
                <button
                  id="btn-next-secret-won"
                  onClick={() => {
                    playClickSound();
                    setSecretIndex((prev) => prev + 1);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-transform hover:scale-105 cursor-pointer"
                >
                  Sang từ tiếp theo ➔
                </button>
              </div>
            )}

            {/* Defeat Card */}
            {isSecretLost && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center space-y-2 max-w-md mx-auto">
                <p className="text-sm font-bold text-rose-800">
                  Đã hết lượt thử! Từ bí mật là: "{activeSecretPuzzle.wordKo}" ({activeSecretPuzzle.meaningVi})
                </p>
                <div className="flex justify-center gap-2 pt-1">
                  <button
                    id="btn-retry-secret"
                    onClick={() => {
                      playClickSound();
                      setGuessedSyllables([]);
                      setLives(5);
                      setIsSecretLost(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-white border border-rose-300 text-rose-700 font-bold text-xs hover:bg-rose-100 cursor-pointer"
                  >
                    Thử lại màn này
                  </button>
                  <button
                    id="btn-next-secret-lost"
                    onClick={() => {
                      playClickSound();
                      setSecretIndex((prev) => prev + 1);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 cursor-pointer"
                  >
                    Từ tiếp theo ➔
                  </button>
                </div>
              </div>
            )}

            {/* Candidate Syllables Keyboard */}
            {!isSecretWon && !isSecretLost && (
              <div className="space-y-2 pt-2">
                <div className="text-center text-xs text-slate-500 font-medium">
                  Chọn một âm tiết tiếng Hàn để thử giải mã:
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 max-w-md mx-auto">
                  {activeSecretPuzzle.candidateSyllables.map((syl) => {
                    const isGuessed = guessedSyllables.includes(syl);
                    const isCorrect = isGuessed && secretWord.includes(syl);
                    const isWrong = isGuessed && !secretWord.includes(syl);

                    return (
                      <button
                        key={syl}
                        id={`btn-syllable-${syl}`}
                        disabled={isGuessed}
                        onClick={() => handleGuessSyllable(syl)}
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl text-lg sm:text-xl font-extrabold transition-all cursor-pointer border ${
                          isCorrect
                            ? 'bg-emerald-100 border-emerald-400 text-emerald-800 cursor-not-allowed'
                            : isWrong
                            ? 'bg-rose-50 border-rose-200 text-rose-300 opacity-40 cursor-not-allowed'
                            : 'bg-white hover:bg-sky-50 border-slate-200 text-slate-800 shadow-xs hover:border-sky-400 active:scale-95'
                        }`}
                      >
                        {syl}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                id="btn-prev-secret-nav"
                onClick={() => {
                  playClickSound();
                  setSecretIndex((prev) => Math.max(0, prev - 1));
                }}
                disabled={secretIndex === 0}
                className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-40 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Từ trước</span>
              </button>

              <button
                id="btn-skip-secret"
                onClick={() => {
                  playClickSound();
                  setSecretIndex((prev) => prev + 1);
                }}
                className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <span>Bỏ qua từ này</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
