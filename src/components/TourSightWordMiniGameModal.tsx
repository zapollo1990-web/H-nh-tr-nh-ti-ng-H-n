import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Volume2,
  Sparkles,
  Trophy,
  RotateCcw,
  CheckCircle2,
  Compass,
  Star,
  Zap,
  Flame,
  ArrowRight
} from 'lucide-react';
import { StageTourMiniGame } from '../data/stagesCandyCrushData';
import {
  speakKorean,
  playClickSound,
  playSuccessSound,
  playFanfareSound,
  playIncorrectSound
} from '../utils/audio';

interface TourSightWordMiniGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  stageNumber: number;
  stageTitle: string;
  gameConfig: StageTourMiniGame;
  onAddXp: (amount: number) => void;
}

export const TourSightWordMiniGameModal: React.FC<TourSightWordMiniGameModalProps> = ({
  isOpen,
  onClose,
  stageNumber,
  stageTitle,
  gameConfig,
  onAddXp,
}) => {
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [selectedSyllables, setSelectedSyllables] = useState<string[]>([]);
  const [completedWordsCount, setCompletedWordsCount] = useState(0);
  const [isGameCompleted, setIsGameCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [comboStreak, setComboStreak] = useState(0);
  const [wrongShake, setWrongShake] = useState(false);
  const [foundWordsList, setFoundWordsList] = useState<string[]>([]);

  const targetWords = gameConfig.targetWords;
  const currentTarget = targetWords[currentWordIdx] || targetWords[0];

  // Generate shuffled board tiles with correct syllables + distractors
  const boardTiles = useMemo(() => {
    if (!currentTarget) return [];

    const correctSyllables = currentTarget.syllables;

    // Distractor pool
    const otherSyllables = targetWords
      .flatMap((w) => w.syllables)
      .filter((s) => !correctSyllables.includes(s));

    const commonDistractors = ['가', '나', '다', '라', '마', '바', '사', '아', '자', '차', '카', '타', '파', '하', '오', '우', '이', '에', '기', '국', '산', '물'];
    const extraNeeded = Math.max(0, 8 - correctSyllables.length);
    const pool = [...otherSyllables, ...commonDistractors];
    const pickedDistractors = pool.slice(0, extraNeeded);

    const allTiles = [...correctSyllables, ...pickedDistractors];
    // Deterministic shuffle based on current word
    return allTiles
      .map((val) => ({ val, sortKey: Math.random() }))
      .sort((a, b) => a.sortKey - b.sortKey)
      .map((item, idx) => ({ id: `${idx}-${item.val}`, syllable: item.val }));
  }, [currentWordIdx, currentTarget, targetWords]);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentWordIdx(0);
      setSelectedSyllables([]);
      setCompletedWordsCount(0);
      setIsGameCompleted(false);
      setScore(0);
      setComboStreak(0);
      setFoundWordsList([]);
      // Speak the prompt
      speakKorean(targetWords[0]?.wordKo || '', 0.85);
    }
  }, [isOpen, targetWords]);

  if (!isOpen) return null;

  const handleTileClick = (syllable: string) => {
    playClickSound();

    const expectedNextIndex = selectedSyllables.length;
    const expectedSyllable = currentTarget.syllables[expectedNextIndex];

    if (syllable === expectedSyllable) {
      // Correct syllable!
      const newSelected = [...selectedSyllables, syllable];
      setSelectedSyllables(newSelected);
      setScore((prev) => prev + 20 + comboStreak * 5);
      setComboStreak((prev) => prev + 1);

      // Check if full word formed
      if (newSelected.length === currentTarget.syllables.length) {
        playSuccessSound();
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.6 },
        });

        speakKorean(currentTarget.wordKo, 0.85);
        setFoundWordsList((prev) => [...prev, currentTarget.wordKo]);
        const nextCompleted = completedWordsCount + 1;
        setCompletedWordsCount(nextCompleted);

        if (currentWordIdx + 1 < targetWords.length) {
          // Next word after small delay
          setTimeout(() => {
            setCurrentWordIdx((prev) => prev + 1);
            setSelectedSyllables([]);
          }, 800);
        } else {
          // Finished all words!
          setTimeout(() => {
            setIsGameCompleted(true);
            playFanfareSound();
            onAddXp(60);
            confetti({
              particleCount: 100,
              spread: 80,
              origin: { y: 0.5 },
            });
          }, 700);
        }
      }
    } else {
      // Incorrect syllable chosen
      playIncorrectSound();
      setComboStreak(0);
      setWrongShake(true);
      setTimeout(() => setWrongShake(false), 500);
    }
  };

  const handleResetSelected = () => {
    playClickSound();
    setSelectedSyllables([]);
  };

  const handleRestartGame = () => {
    playClickSound();
    setCurrentWordIdx(0);
    setSelectedSyllables([]);
    setCompletedWordsCount(0);
    setIsGameCompleted(false);
    setScore(0);
    setComboStreak(0);
    setFoundWordsList([]);
  };

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen min-h-screen flex flex-col overflow-hidden bg-gradient-to-br from-[#1E1B4B] via-[#0F172A] to-[#020617] text-white animate-fade-in transition-colors duration-500">
      <div className="w-full h-full max-w-2xl mx-auto flex flex-col overflow-hidden bg-white/95 text-slate-800 shadow-2xl">
        {/* Header Bar */}
        <div className="p-4 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 rounded-2xl bg-white/20 backdrop-blur-xs shrink-0 shadow-inner">
              {gameConfig.locationIcon}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-wider text-pink-100 px-2 py-0.5 rounded-full bg-white/20">
                  Chặng {stageNumber} • Mini-Game
                </span>
                <span className="text-xs font-black text-amber-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Điểm: {score}</span>
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black truncate text-white drop-shadow-xs">
                {gameConfig.locationName}
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {!isGameCompleted ? (
            <>
              {/* Tour Prompt */}
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-xs text-rose-900 font-medium flex items-center gap-2">
                <Compass className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="line-clamp-2">{gameConfig.themePrompt}</span>
              </div>

              {/* Progress & Target Word Goal Card */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Từ mục tiêu: {currentWordIdx + 1} / {targetWords.length}</span>
                  {comboStreak >= 2 && (
                    <span className="text-rose-600 flex items-center gap-1 font-black animate-bounce">
                      <Flame className="w-3.5 h-3.5 fill-rose-500" />
                      <span>Combo x{comboStreak}!</span>
                    </span>
                  )}
                </div>

                {/* Big Target Word Card */}
                <div
                  className={`p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white text-center space-y-2 border-2 border-pink-400/40 shadow-md transition-all ${
                    wrongShake ? 'animate-shake ring-4 ring-rose-500' : ''
                  }`}
                >
                  <span className="text-[10px] font-black uppercase text-pink-300 tracking-wider">
                    Nhiệm vụ: Tinh mắt chọn chữ cái ghép từ này
                  </span>

                  <div className="text-lg sm:text-xl font-bold text-amber-300">
                    "{currentTarget.meaningVi}"
                  </div>

                  {currentTarget.hint && (
                    <div className="text-xs text-slate-300">
                      💡 Gợi ý: {currentTarget.hint}
                    </div>
                  )}

                  {/* Syllable Slots to fill */}
                  <div className="pt-2 flex items-center justify-center gap-2">
                    {currentTarget.syllables.map((syl, sIdx) => {
                      const isFilled = selectedSyllables[sIdx] !== undefined;
                      const filledChar = selectedSyllables[sIdx] || '';

                      return (
                        <div
                          key={sIdx}
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black transition-all shadow-inner border-2 ${
                            isFilled
                              ? 'bg-gradient-to-tr from-pink-500 to-rose-400 text-white border-white scale-105'
                              : 'bg-white/10 text-white/40 border-dashed border-white/30'
                          }`}
                        >
                          {isFilled ? filledChar : '?'}
                        </div>
                      );
                    })}
                  </div>

                  {/* Audio helper button */}
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        playClickSound();
                        speakKorean(currentTarget.wordKo, 0.85);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                      <span>Nghe phát âm chuẩn</span>
                    </button>

                    {selectedSyllables.length > 0 && (
                      <button
                        onClick={handleResetSelected}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/30 hover:bg-rose-500/50 text-rose-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Chọn lại</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Candy-style Letter Tiles Grid */}
              <div className="space-y-2">
                <div className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                  <span>Bấm vào các chữ cái đúng theo thứ tự:</span>
                </div>

                <div className="grid grid-cols-4 gap-2.5">
                  {boardTiles.map((tile) => (
                    <button
                      key={tile.id}
                      onClick={() => handleTileClick(tile.syllable)}
                      className="h-14 rounded-2xl bg-gradient-to-b from-white to-pink-50 hover:to-pink-100 text-slate-800 text-2xl font-black border-2 border-pink-200 hover:border-pink-400 shadow-sm hover:shadow-md transition-all active:scale-90 cursor-pointer flex items-center justify-center group"
                    >
                      <span className="group-hover:scale-110 transition-transform text-pink-950">
                        {tile.syllable}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Words Found List */}
              {foundWordsList.length > 0 && (
                <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-800">Từ đã tìm:</span>
                  {foundWordsList.map((w, wIdx) => (
                    <span
                      key={wIdx}
                      className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-black text-xs border border-emerald-200 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {w}
                    </span>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Celebration Screen when completed all words */
            <div className="text-center py-6 space-y-4 animate-scale-up">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-rose-500 mx-auto flex items-center justify-center text-4xl shadow-xl text-white">
                🏆
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1 text-amber-400">
                  <Star className="w-7 h-7 fill-amber-400 drop-shadow-md animate-bounce" />
                  <Star className="w-8 h-8 fill-amber-400 drop-shadow-md animate-bounce delay-100" />
                  <Star className="w-7 h-7 fill-amber-400 drop-shadow-md animate-bounce delay-200" />
                </div>
                <h4 className="text-xl font-black text-slate-900 mt-2">
                  Xuất Sắc! Hoàn Thành Tham Quan
                </h4>
                <p className="text-xs text-slate-500">
                  Bạn đã tinh mắt tìm đúng toàn bộ từ vựng tại {gameConfig.locationName}!
                </p>
              </div>

              {/* Rewards */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-around max-w-xs mx-auto">
                <div className="text-center">
                  <span className="text-xs text-slate-500 font-bold">Điểm đạt</span>
                  <div className="text-lg font-black text-slate-900">{score}</div>
                </div>
                <div className="h-8 w-px bg-amber-200" />
                <div className="text-center">
                  <span className="text-xs text-slate-500 font-bold">Phần thưởng</span>
                  <div className="text-lg font-black text-amber-600">+60 XP</div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleRestartGame}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Chơi lại</span>
                </button>

                <button
                  onClick={() => {
                    playClickSound();
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black text-xs shadow-md hover:scale-105 active:scale-95 cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <span>Tiếp tục hành trình học</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
