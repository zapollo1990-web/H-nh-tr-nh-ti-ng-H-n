import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, Check, X, RotateCcw, Award, Flame, HelpCircle, ArrowRight, Sparkles, Zap, CheckCircle2, Shuffle } from 'lucide-react';
import { QuizQuestion, MatchPair, ScramblePuzzle } from '../types';
import { PRACTICE_QUIZZES, MATCH_PAIRS_SETS } from '../data/quizzes';
import { getRandomizedScramblePuzzles, getAvailableCategories, MASTER_SCRAMBLE_PUZZLES } from '../data/scramblePuzzles';
import { speakKorean, playClickSound, playSuccessSound, playIncorrectSound, playFanfareSound } from '../utils/audio';
import { VoiceGenderToggle } from './VoiceGenderToggle';

interface PracticeViewProps {
  onAddXp: (amount: number) => void;
  onNavigateToPuzzles?: () => void;
  onRecordQuizResult?: (isCorrect: boolean) => void;
}

function convertScrambleToQuizQuestions(scrambles: ScramblePuzzle[]): QuizQuestion[] {
  return scrambles.map((p) => ({
    id: p.id,
    type: 'arrange',
    category: p.categoryLabelVi,
    prompt: `Sắp xếp các từ sau thành câu: "${p.meaningVi}"`,
    audioText: p.koreanText,
    scrambleWords: p.scrambledTokens,
    answer: p.correctTokens,
    explanation: p.exampleSentence
      ? `Mẫu câu: ${p.exampleSentence} (${p.exampleSentenceVi})`
      : `Thứ tự ngữ pháp tiếng Hàn: ${p.koreanText}`,
  }));
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  onAddXp,
  onNavigateToPuzzles,
  onRecordQuizResult,
}) => {
  const [activeMode, setActiveMode] = useState<'quiz' | 'arrange' | 'match'>('quiz');

  // QUIZ MODE STATE (Instant auto-check & auto-advance)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(
    PRACTICE_QUIZZES.filter((q) => q.type === 'choice')
  );
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isQuizAutoAdvancing, setIsQuizAutoAdvancing] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const quizAutoTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ARRANGE MODE STATE (1000+ questions randomized across multiple categories)
  const arrangeCategories = getAvailableCategories();
  const [arrangeCategory, setArrangeCategory] = useState<string>('all');
  const [arrangeQuestions, setArrangeQuestions] = useState<QuizQuestion[]>(() => {
    const list = getRandomizedScramblePuzzles({ category: 'all', type: 'sentence' });
    return convertScrambleToQuizQuestions(list);
  });
  const [arrangeIndex, setArrangeIndex] = useState(0);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [arrangeSubmitted, setArrangeSubmitted] = useState(false);
  const [isArrangeCorrect, setIsArrangeCorrect] = useState<boolean | null>(null);

  // MATCHING PAIRS MODE STATE
  const [matchSetIndex, setMatchSetIndex] = useState(0);
  const [shuffledCards, setShuffledCards] = useState<
    Array<{ id: string; text: string; lang: 'ko' | 'vi'; pairId: string }>
  >([]);
  const [selectedMatchCard, setSelectedMatchCard] = useState<{
    id: string;
    text: string;
    lang: 'ko' | 'vi';
    pairId: string;
  } | null>(null);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [matchWrongId, setMatchWrongId] = useState<string | null>(null);

  // Initialize Arrange Words
  useEffect(() => {
    const q = arrangeQuestions[arrangeIndex];
    if (q && q.scrambleWords) {
      setAvailableWords([...q.scrambleWords]);
      setSelectedWords([]);
      setArrangeSubmitted(false);
      setIsArrangeCorrect(null);
    }
  }, [arrangeIndex, arrangeQuestions]);

  // Initialize Matching Cards
  useEffect(() => {
    const pairs = MATCH_PAIRS_SETS[matchSetIndex % MATCH_PAIRS_SETS.length];
    const cards: Array<{ id: string; text: string; lang: 'ko' | 'vi'; pairId: string }> = [];

    pairs.forEach((p, idx) => {
      cards.push({ id: `ko-${idx}`, text: p.hangul, lang: 'ko', pairId: p.id });
      cards.push({ id: `vi-${idx}`, text: p.vietnamese, lang: 'vi', pairId: p.id });
    });

    // Shuffle cards
    setShuffledCards(cards.sort(() => Math.random() - 0.5));
    setMatchedPairIds([]);
    setSelectedMatchCard(null);
  }, [matchSetIndex]);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (quizAutoTimerRef.current) clearTimeout(quizAutoTimerRef.current);
    };
  }, []);

  // --- QUIZ HANDLERS (Instant check & Auto-advance) ---
  const handleSelectOption = (option: string) => {
    if (isAnswerSubmitted || isQuizAutoAdvancing) return;

    const currentQ = quizQuestions[currentQuizIndex];
    const isCorrect = option === currentQ.answer;

    playClickSound();
    setSelectedOption(option);
    setIsAnswerSubmitted(true);

    if (onRecordQuizResult) {
      onRecordQuizResult(isCorrect);
    }

    if (isCorrect) {
      playSuccessSound();
      setQuizScore((prev) => prev + 1);
      onAddXp(10);
    } else {
      playIncorrectSound();
    }

    setIsQuizAutoAdvancing(true);

    if (quizAutoTimerRef.current) clearTimeout(quizAutoTimerRef.current);
    quizAutoTimerRef.current = setTimeout(() => {
      handleNextQuizQuestion();
    }, 1250);
  };

  const handleNextQuizQuestion = () => {
    if (quizAutoTimerRef.current) clearTimeout(quizAutoTimerRef.current);
    setIsQuizAutoAdvancing(false);
    playClickSound();
    if (currentQuizIndex + 1 < quizQuestions.length) {
      setCurrentQuizIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizFinished(true);
      playFanfareSound();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleResetQuiz = () => {
    if (quizAutoTimerRef.current) clearTimeout(quizAutoTimerRef.current);
    setIsQuizAutoAdvancing(false);
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    setQuizFinished(false);
  };

  // --- ARRANGE HANDLERS ---
  const handlePickWord = (word: string, index: number) => {
    if (arrangeSubmitted) return;
    playClickSound();
    const newAvail = [...availableWords];
    newAvail.splice(index, 1);
    setAvailableWords(newAvail);
    setSelectedWords((prev) => [...prev, word]);
  };

  const handleRemoveWord = (word: string, index: number) => {
    if (arrangeSubmitted) return;
    playClickSound();
    const newSelected = [...selectedWords];
    newSelected.splice(index, 1);
    setSelectedWords(newSelected);
    setAvailableWords((prev) => [...prev, word]);
  };

  const handleCheckArrange = () => {
    if (arrangeSubmitted) return;
    const currentQ = arrangeQuestions[arrangeIndex];
    const expected = (currentQ.answer as string[]).join(' ');
    const userSentence = selectedWords.join(' ');

    setArrangeSubmitted(true);
    if (userSentence === expected) {
      setIsArrangeCorrect(true);
      playSuccessSound();
      onAddXp(15);
      confetti({ particleCount: 40, spread: 60 });
    } else {
      setIsArrangeCorrect(false);
      playIncorrectSound();
    }
  };

  const handleNextArrange = () => {
    playClickSound();
    if (arrangeIndex + 1 < arrangeQuestions.length) {
      setArrangeIndex((prev) => prev + 1);
    } else {
      setArrangeIndex(0);
      playFanfareSound();
    }
  };

  const handleArrangeCategoryChange = (catId: string) => {
    playClickSound();
    setArrangeCategory(catId);
    const list = getRandomizedScramblePuzzles({ category: catId, type: 'sentence' });
    setArrangeQuestions(convertScrambleToQuizQuestions(list));
    setArrangeIndex(0);
  };

  const handleReshuffleArrange = () => {
    playClickSound();
    const list = getRandomizedScramblePuzzles({ category: arrangeCategory, type: 'sentence' });
    setArrangeQuestions(convertScrambleToQuizQuestions(list));
    setArrangeIndex(0);
  };

  const handleNextRandomArrange = () => {
    playClickSound();
    if (arrangeQuestions.length <= 1) return;
    const randomOffset = 1 + Math.floor(Math.random() * Math.min(10, arrangeQuestions.length - 1));
    setArrangeIndex((prev) => (prev + randomOffset) % arrangeQuestions.length);
  };

  // --- MATCHING PAIRS HANDLERS ---
  const handleCardClick = (card: { id: string; text: string; lang: 'ko' | 'vi'; pairId: string }) => {
    if (matchedPairIds.includes(card.pairId)) return;
    if (selectedMatchCard?.id === card.id) {
      setSelectedMatchCard(null);
      return;
    }

    if (card.lang === 'ko') {
      speakKorean(card.text);
    } else {
      playClickSound();
    }

    if (!selectedMatchCard) {
      setSelectedMatchCard(card);
      return;
    }

    // Checking pair
    if (selectedMatchCard.pairId === card.pairId && selectedMatchCard.lang !== card.lang) {
      // MATCHED!
      playSuccessSound();
      const newMatched = [...matchedPairIds, card.pairId];
      setMatchedPairIds(newMatched);
      setSelectedMatchCard(null);
      onAddXp(5);

      if (newMatched.length === MATCH_PAIRS_SETS[matchSetIndex % MATCH_PAIRS_SETS.length].length) {
        // Round complete!
        playFanfareSound();
        onAddXp(15);
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      }
    } else {
      // WRONG PAIR
      playIncorrectSound();
      setMatchWrongId(card.id);
      setTimeout(() => {
        setMatchWrongId(null);
        setSelectedMatchCard(null);
      }, 700);
    }
  };

  const currentQ = quizQuestions[currentQuizIndex];
  const currentArrangeQ = arrangeQuestions[arrangeIndex];

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-5 pb-24 md:pb-8">
      {/* Game Mode Navigation Tabs */}
      <div className="p-1.5 rounded-2xl flex items-center justify-between gap-1.5 mb-6 bg-gradient-to-r from-sky-500/10 via-amber-500/10 to-emerald-500/10 dark:bg-gradient-to-r dark:from-sky-950/40 dark:via-purple-950/30 dark:to-emerald-950/40 border border-slate-200/80 dark:border-indigo-500/30 backdrop-blur-md shadow-xs dark:shadow-[0_0_20px_rgba(99,102,241,0.15)]">
        <button
          onClick={() => {
            playClickSound();
            setActiveMode('quiz');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeMode === 'quiz'
              ? 'bg-sky-500 text-white shadow-md dark:shadow-[0_0_15px_rgba(14,165,233,0.5)]'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/60'
          }`}
        >
          <span>🎯</span>
          <span>Trắc nghiệm nhanh</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveMode('arrange');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeMode === 'arrange'
              ? 'bg-amber-400 text-slate-900 shadow-md dark:shadow-[0_0_15px_rgba(251,191,36,0.4)]'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/60'
          }`}
        >
          <span>🧩</span>
          <span>Ghép câu tiếng Hàn</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveMode('match');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeMode === 'match'
              ? 'bg-emerald-500 text-white shadow-md dark:shadow-[0_0_15px_rgba(16,185,129,0.5)]'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/60'
          }`}
        >
          <span>🃏</span>
          <span>Nối cặp từ vựng</span>
        </button>

        {onNavigateToPuzzles && (
          <button
            onClick={() => {
              playClickSound();
              onNavigateToPuzzles();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40 text-orange-700 dark:text-amber-300 hover:from-orange-100 hover:to-amber-100 dark:hover:from-orange-900/60 dark:hover:to-amber-900/60 border border-orange-200/80 dark:border-orange-500/30 shadow-xs"
          >
            <span>💡</span>
            <span>Game giải đố vui ➔</span>
          </button>
        )}
      </div>

      {/* 1. QUIZ MODE */}
      {activeMode === 'quiz' && (
        <div className="space-y-4">
          {!quizFinished && currentQ ? (
            <div className="bg-white dark:bg-gradient-to-br dark:from-[#0f172a] dark:to-[#1e1b4b]/70 rounded-3xl p-5 sm:p-7 border border-sky-100 dark:border-sky-500/30 shadow-md dark:shadow-[0_0_25px_rgba(14,165,233,0.15)]">
              {/* Header: Progress, Category & Voice Gender Switcher */}
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950/70 border dark:border-sky-500/40 text-sky-700 dark:text-sky-300 text-xs font-black">
                    {currentQ.category}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Câu {currentQuizIndex + 1} / {quizQuestions.length} • Đúng: <strong className="text-emerald-600 dark:text-emerald-400">{quizScore}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isQuizAutoAdvancing && (
                    <span className="text-xs font-black text-sky-600 dark:text-sky-400 flex items-center gap-1 animate-pulse">
                      <Zap className="w-3.5 h-3.5 text-amber-500" /> Tự chuyển câu...
                    </span>
                  )}
                  <VoiceGenderToggle variant="compact" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-5 overflow-hidden">
                <div
                  className="h-full bg-sky-500 dark:bg-sky-400 transition-all duration-300"
                  style={{ width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%` }}
                />
              </div>

              {/* Question prompt */}
              <div className="mb-5">
                <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white tracking-tight leading-snug">
                  {currentQ.prompt}
                </h3>
                {currentQ.audioText && (
                  <button
                    onClick={() => speakKorean(currentQ.audioText!)}
                    className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-500/30 text-xs font-bold transition-colors cursor-pointer"
                    title="Nghe phát âm bằng giọng đang chọn"
                  >
                    <Volume2 className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                    <span>Nghe câu tiếng Hàn 🔊</span>
                  </button>
                )}
              </div>

              {/* Multiple Choice Options (Instant check on click & auto-advance) */}
              <div className="grid grid-cols-1 gap-2.5 mb-4">
                {currentQ.options?.map((option, idx) => {
                  const isSelected = selectedOption === option;
                  const isCorrect = option === currentQ.answer;

                  let btnStyle =
                    'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 hover:border-sky-400 dark:hover:border-sky-500 hover:bg-sky-50/20 dark:hover:bg-slate-800/80';
                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 dark:border-emerald-400 text-emerald-950 dark:text-emerald-200 font-black shadow-sm ring-2 ring-emerald-200 dark:ring-emerald-700/50';
                    } else if (isSelected && !isCorrect) {
                      btnStyle = 'bg-rose-50 dark:bg-rose-950/70 border-rose-400 dark:border-rose-500 text-rose-900 dark:text-rose-200 font-bold';
                    } else {
                      btnStyle = 'opacity-50 bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswerSubmitted}
                      onClick={() => handleSelectOption(option)}
                      className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border-2 text-left text-sm sm:text-base transition-all cursor-pointer ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center shrink-0 ${
                            isAnswerSubmitted && isCorrect
                              ? 'bg-emerald-500 text-white'
                              : isAnswerSubmitted && isSelected && !isCorrect
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="font-medium">{option}</span>
                      </div>

                      {/* Visual indicator badges */}
                      {isAnswerSubmitted && isCorrect && (
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center gap-1 shadow-xs shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Đáp án đúng</span>
                        </span>
                      )}
                      {isAnswerSubmitted && isSelected && !isCorrect && (
                        <span className="px-2.5 py-1 rounded-xl bg-rose-600 text-white text-xs font-black flex items-center gap-1 shadow-xs shrink-0">
                          <X className="w-4 h-4" />
                          <span>Bạn đã chọn</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation box after answer */}
              {isAnswerSubmitted && (
                <div
                  className={`p-4 rounded-2xl mb-4 border ${
                    selectedOption === currentQ.answer
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-500/40 text-emerald-950 dark:text-emerald-200'
                      : 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-500/40 text-amber-950 dark:text-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
                    <div className="flex items-center gap-2 font-black text-sm">
                      {selectedOption === currentQ.answer ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Chính xác! (+10 XP)</span>
                        </>
                      ) : (
                        <>
                          <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <span>Chưa đúng rồi! Đáp án chuẩn: {currentQ.answer}</span>
                        </>
                      )}
                    </div>
                    {isQuizAutoAdvancing && (
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-300 animate-pulse flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Đang tự chuyển câu tiếp theo...</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-medium leading-relaxed">{currentQ.explanation}</p>
                </div>
              )}

              {/* Minimal Skip / Next immediately button */}
              <div className="flex justify-end pt-1">
                <button
                  onClick={handleNextQuizQuestion}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xs transition-all cursor-pointer"
                >
                  <span>
                    {currentQuizIndex + 1 < quizQuestions.length ? 'Câu tiếp theo' : 'Xem kết quả'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Quiz Completed View */
            <div className="bg-white dark:bg-gradient-to-br dark:from-[#0f172a] dark:to-[#1e1b4b]/70 rounded-3xl p-8 border border-sky-100 dark:border-sky-500/30 shadow-md dark:shadow-[0_0_25px_rgba(14,165,233,0.15)] text-center">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-100 dark:bg-amber-950/70 border-2 border-amber-200 dark:border-amber-500/40 flex items-center justify-center text-4xl mb-4 shadow-xs">
                🏆
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">Hoàn thành bài luyện tập!</h3>
              <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
                Bạn đã hoàn thành xuất sắc vòng trắc nghiệm hôm nay.
              </p>

              <div className="my-6 max-w-xs mx-auto p-4 rounded-2xl bg-sky-50 dark:bg-slate-900/80 border border-sky-100 dark:border-indigo-500/30 flex items-center justify-around">
                <div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Đúng</div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {quizScore} / {quizQuestions.length}
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
                <div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400">XP Nhận được</div>
                  <div className="text-2xl font-black text-amber-500 dark:text-amber-400">+{quizScore * 10} XP</div>
                </div>
              </div>

              <button
                onClick={handleResetQuiz}
                className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl shadow-xs transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Làm lại trắc nghiệm</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. ARRANGE MODE (Ghép từ thành câu - 1000+ câu đảo từ ngẫu nhiên) */}
      {activeMode === 'arrange' && currentArrangeQ && (
        <div className="bg-white dark:bg-gradient-to-br dark:from-[#0f172a] dark:to-[#1e1b4b]/70 rounded-3xl p-6 sm:p-8 border border-amber-100 dark:border-amber-500/30 shadow-md dark:shadow-[0_0_25px_rgba(251,191,36,0.15)] space-y-6">
          {/* Top Bar with Category, Randomizer and Counter */}
          <div className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black shadow-xs flex items-center gap-1">
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Kho 1000+ câu đảo từ • Thứ tự ngẫu nhiên</span>
                </span>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-400">
                  Câu #{arrangeIndex + 1} / {arrangeQuestions.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReshuffleArrange}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/60 hover:bg-orange-100 dark:hover:bg-orange-900/60 text-orange-700 dark:text-orange-300 text-xs font-bold border border-orange-200 dark:border-orange-500/30 transition-colors cursor-pointer"
                  title="Xáo trộn ngẫu nhiên toàn bộ thứ tự câu hỏi"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Xáo trộn 🎲</span>
                </button>
                <button
                  onClick={handleNextRandomArrange}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-transparent dark:border-slate-700"
                >
                  Đổi câu khác 🎲
                </button>
              </div>
            </div>

            {/* Topic Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
              {arrangeCategories.map((cat) => {
                const isActive = arrangeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleArrangeCategoryChange(cat.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wide">
              Hãy dịch câu sau sang tiếng Hàn:
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mt-1">
              "{currentArrangeQ.prompt.replace('Sắp xếp các từ sau thành câu: ', '')}"
            </h3>
          </div>

          {/* Construction area (Drop / Selected Words) */}
          <div className="min-h-24 p-4 rounded-2xl border-2 border-dashed border-sky-300 dark:border-sky-500/50 bg-sky-50/50 dark:bg-slate-900/60 flex flex-wrap items-center gap-2.5">
            {selectedWords.length === 0 ? (
              <span className="text-sm font-medium text-sky-400 dark:text-sky-300/80 italic">
                Nhấn vào các từ bên dưới để ghép thành câu hoàn chỉnh...
              </span>
            ) : (
              selectedWords.map((word, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRemoveWord(word, idx)}
                  className="px-4 py-2 bg-sky-500 dark:bg-sky-600 text-white font-bold rounded-xl shadow-xs hover:bg-rose-500 dark:hover:bg-rose-600 transition-all cursor-pointer transform hover:scale-95"
                  title="Nhấn để gỡ bỏ"
                >
                  {word}
                </button>
              ))
            )}
          </div>

          {/* Available Word Pool */}
          <div>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wide block mb-2">
              Kho từ vựng:
            </span>
            <div className="flex flex-wrap gap-2.5">
              {availableWords.map((word, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePickWord(word, idx)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs transition-all cursor-pointer transform hover:scale-105"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>

          {/* Result Feedback */}
          {arrangeSubmitted && (
            <div
              className={`p-4 rounded-2xl border ${
                isArrangeCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-500/40 text-rose-900 dark:text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 font-black text-sm mb-1">
                {isArrangeCorrect ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Xuất sắc! Bạn đã ghép đúng câu (+15 XP)</span>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span>
                      Chưa đúng thứ tự ngữ pháp rồi. Câu đúng là:{' '}
                      <span className="font-bold">{(currentArrangeQ.answer as string[]).join(' ')}</span>
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs font-medium">{currentArrangeQ.explanation}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                if (currentArrangeQ.audioText) speakKorean(currentArrangeQ.audioText);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer border border-transparent dark:border-slate-700"
            >
              <Volume2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Nghe mẫu phát âm</span>
            </button>

            {!arrangeSubmitted ? (
              <button
                onClick={handleCheckArrange}
                disabled={selectedWords.length === 0}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold rounded-2xl shadow-xs transition-all cursor-pointer"
              >
                Kiểm tra câu
              </button>
            ) : (
              <button
                onClick={handleNextArrange}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl shadow-xs transition-all cursor-pointer"
              >
                <span>Câu tiếp theo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. MATCHING PAIRS MODE */}
      {activeMode === 'match' && (
        <div className="bg-white dark:bg-gradient-to-br dark:from-[#0f172a] dark:to-[#1e1b4b]/70 rounded-3xl p-6 sm:p-8 border border-emerald-100 dark:border-emerald-500/30 shadow-md dark:shadow-[0_0_25px_rgba(16,185,129,0.15)] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                Mini-game Lật thẻ nối từ
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Nhấn chọn 1 thẻ tiếng Hàn và 1 thẻ tiếng Việt tương ứng để ghép cặp.
              </p>
            </div>

            <button
              onClick={() => setMatchSetIndex((prev) => prev + 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Đổi bộ thẻ khác
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {shuffledCards.map((card) => {
              const isMatched = matchedPairIds.includes(card.pairId);
              const isSelected = selectedMatchCard?.id === card.id;
              const isWrong = matchWrongId === card.id;

              let cardStyle =
                card.lang === 'vi'
                  ? 'bg-[#FFFBEB] dark:bg-[#FFFDF0] border-amber-300 text-black shadow-xs hover:border-amber-400 hover:bg-[#FEF3C7]'
                  : 'bg-[#F0F9FF] dark:bg-[#F3F9FF] border-sky-300 text-slate-900 shadow-xs hover:border-sky-400 hover:bg-[#E0F2FE]';

              if (isMatched) {
                cardStyle = 'bg-[#E8F8F5] border-emerald-300 text-emerald-950 opacity-50 scale-95 cursor-default ring-1 ring-emerald-300';
              } else if (isWrong) {
                cardStyle = 'bg-[#FFEAEB] border-rose-400 text-rose-950 ring-2 ring-rose-400 animate-shake';
              } else if (isSelected) {
                cardStyle = 'bg-[#FEF3C7] border-amber-500 text-black ring-2 ring-amber-400 shadow-md scale-105';
              }

              return (
                <button
                  key={card.id}
                  disabled={isMatched}
                  onClick={() => handleCardClick(card)}
                  className={`h-24 sm:h-28 rounded-2xl border-2 p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer font-bold ${cardStyle}`}
                >
                  <span
                    className={`text-base sm:text-lg ${
                      card.lang === 'ko' ? 'font-black text-slate-900' : 'font-black text-black'
                    }`}
                  >
                    {card.text}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded-md mt-1 ${
                      card.lang === 'ko'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-amber-200 text-black font-black'
                    }`}
                  >
                    {card.lang === 'ko' ? '🇰🇷 Tiếng Hàn' : '🇻🇳 Tiếng Việt'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom stats */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
            <span>
              Đã ghép: {matchedPairIds.length} /{' '}
              {MATCH_PAIRS_SETS[matchSetIndex % MATCH_PAIRS_SETS.length].length} cặp
            </span>
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-3.5 h-3.5" /> +5 XP mỗi cặp đúng
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
