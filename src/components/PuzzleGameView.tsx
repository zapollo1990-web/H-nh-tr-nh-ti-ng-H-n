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
  Shuffle
} from 'lucide-react';
import { KoreanRiddle, EmojiPuzzle, WordGuessPuzzle } from '../types';
import { KOREAN_RIDDLES, EMOJI_PUZZLES, WORD_GUESS_PUZZLES } from '../data/puzzles';
import {
  speakKorean,
  playClickSound,
  playSuccessSound,
  playIncorrectSound,
  playFanfareSound
} from '../utils/audio';

interface PuzzleGameViewProps {
  onAddXp: (amount: number) => void;
}

type PuzzleMode = 'riddles' | 'emoji' | 'secret';

export const PuzzleGameView: React.FC<PuzzleGameViewProps> = ({ onAddXp }) => {
  const [activeMode, setActiveMode] = useState<PuzzleMode>('riddles');

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

  // Reset answer states when riddle changes
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

    // Check if input matches Korean answer or keyword in Vietnamese answer
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

  // Reset letters when emoji puzzle changes
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

    // If filled all slots, evaluate immediately
    if (updated.length === targetWordLength) {
      const userWord = updated.join('');
      if (userWord === activeEmojiPuzzle.wordKo) {
        // Correct!
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
        // Wrong
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
      // Check if all syllables in secretWord are guessed
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
            Vừa chơi vừa nhớ từ vựng với câu đố dân gian Hàn Quốc (수수께끼), trò chơi ghép hình Emoji và đoán chữ bí mật!
          </p>
        </div>

        {/* Decorative Watermark */}
        <div className="absolute right-4 -bottom-4 text-8xl opacity-10 select-none pointer-events-none font-black">
          놀이
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/70 rounded-2xl">
        <button
          id="tab-riddles"
          onClick={() => {
            playClickSound();
            setActiveMode('riddles');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
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
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
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
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
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
              onClick={handleFetchAiRiddle}
              disabled={isLoadingAiRiddle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
              title="Nhờ AI Gemini tạo thêm câu đố vui mới"
            >
              {isLoadingAiRiddle ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Bot className="w-3.5 h-3.5" />
              )}
              <span>{isLoadingAiRiddle ? 'Đang tạo câu đố...' : '✨ Tạo câu đố AI mới'}</span>
            </button>
          </div>

          {/* Main Riddle Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6 relative">
            {/* Top metadata */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold">
                  Câu {currentRiddleIndex + 1} / {filteredRiddles.length}
                </span>
                <span className="text-slate-400">
                  {activeRiddle.category === 'wordplay'
                    ? 'Chơi chữ'
                    : activeRiddle.category === 'daily'
                    ? 'Đời sống'
                    : activeRiddle.category === 'culture'
                    ? 'Văn hóa'
                    : 'Hài hước'}
                </span>
              </div>

              {solvedRiddles.includes(activeRiddle.id) && (
                <div className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <Check className="w-3.5 h-3.5" />
                  <span>Đã giải (+15 XP)</span>
                </div>
              )}
            </div>

            {/* Riddle Question Section */}
            <div className="text-center py-4 space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 mb-1">
                <HelpCircle className="w-7 h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 font-serif leading-relaxed px-4">
                "{activeRiddle.questionKo}"
              </h3>
              <p className="text-sm sm:text-base text-slate-600 font-medium max-w-lg mx-auto">
                {activeRiddle.questionVi}
              </p>

              {/* Audio Listen */}
              <button
                id="btn-speak-riddle"
                onClick={() => speakKorean(activeRiddle.questionKo)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 text-sky-700 hover:bg-sky-100 font-semibold text-xs transition-colors cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Nghe câu đố tiếng Hàn</span>
              </button>
            </div>

            {/* Clue / Hint Button & Box */}
            <div className="text-center">
              {!showRiddleHint ? (
                <button
                  id="btn-show-hint"
                  onClick={() => {
                    playClickSound();
                    setShowRiddleHint(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 hover:bg-amber-100 text-xs font-bold transition-all cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Xem gợi ý manh mối</span>
                </button>
              ) : (
                <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs sm:text-sm text-amber-900 text-left max-w-md mx-auto space-y-1">
                  <div className="font-bold flex items-center gap-1 text-amber-800">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <span>Manh mối gợi ý:</span>
                  </div>
                  <p className="pl-5 text-amber-800 font-medium">{activeRiddle.hint}</p>
                </div>
              )}
            </div>

            {/* Answer Input & Submission Form */}
            {!showRiddleAnswer ? (
              <div className="max-w-md mx-auto space-y-3 pt-2">
                <div className="flex gap-2">
                  <input
                    id="input-riddle-guess"
                    type="text"
                    value={userRiddleInput}
                    onChange={(e) => setUserRiddleInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCheckRiddleAnswer()}
                    placeholder="Gõ đáp án (tiếng Hàn hoặc tiếng Việt)..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-hidden text-sm"
                  />
                  <button
                    id="btn-submit-guess"
                    onClick={handleCheckRiddleAnswer}
                    className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-colors shadow-xs cursor-pointer"
                  >
                    Kiểm tra
                  </button>
                </div>

                {riddleFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                      riddleFeedback.isCorrect
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {riddleFeedback.isCorrect ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <X className="w-4 h-4 text-rose-600" />
                    )}
                    <span>{riddleFeedback.message}</span>
                  </div>
                )}

                <div className="text-center pt-2">
                  <button
                    id="btn-reveal-answer"
                    onClick={() => {
                      playClickSound();
                      setShowRiddleAnswer(true);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Chưa nghĩ ra? Bấm để lật mở đáp án & giải nghĩa
                  </button>
                </div>
              </div>
            ) : (
              /* Revealed Answer and Cultural/Pun Explanation */
              <div className="bg-gradient-to-b from-orange-50/70 to-amber-50/40 rounded-2xl p-5 sm:p-6 border border-orange-200 space-y-4 max-w-lg mx-auto">
                <div className="text-center space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 bg-orange-100 px-2.5 py-0.5 rounded-md">
                    Đáp án câu đố
                  </span>
                  <div className="flex items-center justify-center gap-3">
                    <h4 className="text-3xl font-black text-slate-900">{activeRiddle.answerKo}</h4>
                    <button
                      id="btn-speak-answer"
                      onClick={() => speakKorean(activeRiddle.answerKo)}
                      className="p-2 rounded-full bg-white hover:bg-orange-100 text-orange-600 shadow-xs transition-colors cursor-pointer"
                      title="Nghe phát âm đáp án"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    /{activeRiddle.romanization}/ • {activeRiddle.answerVi}
                  </p>
                </div>

                <div className="bg-white/90 rounded-xl p-4 border border-orange-100 space-y-1.5 text-xs text-slate-700 leading-relaxed">
                  <div className="font-bold text-orange-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                    <span>Giải thích mẹo chơi chữ & văn hóa:</span>
                  </div>
                  <p>{activeRiddle.punExplanation}</p>
                </div>
              </div>
            )}

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                id="btn-prev-riddle"
                disabled={currentRiddleIndex === 0}
                onClick={() => {
                  playClickSound();
                  setCurrentRiddleIndex((prev) => Math.max(0, prev - 1));
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Câu trước</span>
              </button>

              <button
                id="btn-next-riddle"
                disabled={currentRiddleIndex >= filteredRiddles.length - 1}
                onClick={() => {
                  playClickSound();
                  setCurrentRiddleIndex((prev) => Math.min(filteredRiddles.length - 1, prev + 1));
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 cursor-pointer shadow-xs"
              >
                <span>Câu tiếp theo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: EMOJI WORD PUZZLE (이모지 단어 맞히기) */}
      {/* ========================================================================= */}
      {activeMode === 'emoji' && activeEmojiPuzzle && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            {/* Header / Stats */}
            <div className="flex items-center justify-between text-xs">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                Câu {((emojiIndex) % EMOJI_PUZZLES.length) + 1} / {EMOJI_PUZZLES.length} • {activeEmojiPuzzle.category}
              </span>
              <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-3 py-1 rounded-full font-bold border border-amber-200">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                <span>Combo: {emojiStreak}</span>
              </div>
            </div>

            {/* Emoji display */}
            <div className="text-center py-3 space-y-3">
              <div className="text-5xl sm:text-6xl tracking-widest select-none p-4 rounded-3xl bg-slate-50 inline-block border border-slate-100 shadow-inner">
                {activeEmojiPuzzle.emojis}
              </div>
              <p className="text-sm sm:text-base text-slate-700 font-semibold max-w-md mx-auto">
                {activeEmojiPuzzle.clueVi}
              </p>
            </div>

            {/* Target Slots (where clicked letters go) */}
            <div className="flex items-center justify-center gap-3">
              {Array.from({ length: targetWordLength }).map((_, idx) => {
                const filledLetter = selectedLetters[idx];
                return (
                  <button
                    key={idx}
                    id={`target-slot-${idx}`}
                    onClick={() => handleRemoveEmojiLetter(idx)}
                    className={`w-14 h-16 sm:w-16 sm:h-20 rounded-2xl border-2 flex items-center justify-center text-2xl sm:text-3xl font-black transition-all cursor-pointer select-none ${
                      isEmojiSolved
                        ? 'bg-emerald-500 text-white border-emerald-600 scale-105 shadow-md shadow-emerald-100'
                        : isEmojiWrong
                        ? 'bg-rose-100 text-rose-700 border-rose-400 animate-shake'
                        : filledLetter
                        ? 'bg-sky-50 text-sky-800 border-sky-400 shadow-sm'
                        : 'bg-slate-100/70 border-dashed border-slate-300 text-slate-300'
                    }`}
                  >
                    {filledLetter || '_'}
                  </button>
                );
              })}
            </div>

            {/* Solved state card with audio & details */}
            {isEmojiSolved && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-2 animate-fadeIn max-w-md mx-auto">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-black text-emerald-900">{activeEmojiPuzzle.wordKo}</span>
                  <button
                    id="btn-speak-emoji-word"
                    onClick={() => speakKorean(activeEmojiPuzzle.wordKo)}
                    className="p-1.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer transition-colors"
                    title="Phát âm tiếng Hàn"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-emerald-800 font-semibold">
                  /{activeEmojiPuzzle.romanization}/ • {activeEmojiPuzzle.meaningVi}
                </p>
                <div className="pt-1">
                  <button
                    id="btn-next-emoji"
                    onClick={() => {
                      playClickSound();
                      setEmojiIndex((prev) => prev + 1);
                    }}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-transform hover:scale-105 cursor-pointer"
                  >
                    Câu tiếp theo (+20 XP) ➔
                  </button>
                </div>
              </div>
            )}

            {/* Candidate Letter Tiles */}
            {!isEmojiSolved && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-center gap-2 max-w-sm mx-auto">
                  {activeEmojiPuzzle.scrambledLetters.map((letter, idx) => {
                    const timesUsedInSelection = selectedLetters.filter((l) => l === letter).length;
                    const timesAvailable = activeEmojiPuzzle.scrambledLetters.filter((l) => l === letter).length;
                    const isAllUsed = timesUsedInSelection >= timesAvailable;

                    return (
                      <button
                        key={`${letter}-${idx}`}
                        id={`tile-${letter}-${idx}`}
                        disabled={isAllUsed}
                        onClick={() => handleSelectEmojiTile(letter)}
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl text-xl sm:text-2xl font-extrabold transition-all cursor-pointer border ${
                          isAllUsed
                            ? 'opacity-25 bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'
                            : 'bg-white hover:bg-orange-50 border-slate-300 text-slate-800 shadow-xs hover:border-orange-400 active:scale-95'
                        }`}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>

                {/* Backspace / Clear button */}
                <div className="flex justify-center gap-2">
                  <button
                    id="btn-clear-emoji"
                    onClick={handleClearEmojiLetters}
                    disabled={selectedLetters.length === 0}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Làm lại</span>
                  </button>
                </div>
              </div>
            )}

            {/* Footer Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                id="btn-prev-emoji-nav"
                onClick={() => {
                  playClickSound();
                  setEmojiIndex((prev) => Math.max(0, prev - 1));
                }}
                disabled={emojiIndex === 0}
                className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-40 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Câu trước</span>
              </button>

              <button
                id="btn-skip-emoji"
                onClick={() => {
                  playClickSound();
                  setEmojiIndex((prev) => prev + 1);
                }}
                className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <span>Bỏ qua / Câu khác</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: SECRET WORD GUESS (비밀 단어 맞히기) */}
      {/* ========================================================================= */}
      {activeMode === 'secret' && activeSecretPuzzle && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            {/* Header: Level & Lives */}
            <div className="flex items-center justify-between text-xs">
              <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 font-bold">
                Màn {((secretIndex) % WORD_GUESS_PUZZLES.length) + 1} / {WORD_GUESS_PUZZLES.length} • {activeSecretPuzzle.category}
              </span>

              {/* Lives counter */}
              <div className="flex items-center gap-1 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                <span className="font-bold text-rose-700 mr-1 text-[11px]">Lượt thử:</span>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-4 h-4 ${
                      i < lives
                        ? 'text-rose-500 fill-rose-500'
                        : 'text-slate-300 fill-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Clue Prompt */}
            <div className="text-center py-2 space-y-2">
              <span className="text-[11px] font-bold text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                Manh mối từ vựng
              </span>
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
