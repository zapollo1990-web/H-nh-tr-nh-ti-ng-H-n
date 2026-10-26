import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Volume2,
  Sparkles,
  Trophy,
  RotateCcw,
  CheckCircle2,
  Star,
  Zap,
  Flame,
  ArrowRight,
  Timer,
  Eye,
  VolumeX,
} from 'lucide-react';
import { StageCandyCrushConfig, StageTourMiniGame } from '../data/stagesCandyCrushData';
import {
  StudyBackgroundTheme,
  BG_THEMES,
  getSavedStudyTheme,
  saveStudyTheme,
} from '../data/studyThemes';
import { StudyThemeBar } from './StudyThemeBar';
import {
  speakKorean,
  playClickSound,
  playSuccessSound,
  playFanfareSound,
  playIncorrectSound,
} from '../utils/audio';

export interface MemoryCardItem {
  id: string;
  pairId: string;
  type: 'ko' | 'vi';
  text: string;
  subtext?: string;
  hint?: string;
  audioText: string;
}

interface TourSightWordMiniGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  stageConfig?: StageCandyCrushConfig;
  stageNumber?: number;
  stageTitle?: string;
  gameConfig?: StageTourMiniGame;
  onAddXp: (amount: number) => void;
}

export const TourSightWordMiniGameModal: React.FC<TourSightWordMiniGameModalProps> = ({
  isOpen,
  onClose,
  stageConfig,
  stageNumber: propStageNumber,
  stageTitle: propStageTitle,
  gameConfig: propGameConfig,
  onAddXp,
}) => {
  const stageNum = stageConfig?.stageNumber ?? propStageNumber ?? 1;
  const stageTitleText = stageConfig?.title ?? propStageTitle ?? '';
  const tourGame = stageConfig?.tourMiniGame ?? propGameConfig;

  // Background Theme
  const [studyTheme, setStudyTheme] = useState<StudyBackgroundTheme>(() => getSavedStudyTheme());
  const currentBg = BG_THEMES[studyTheme] || BG_THEMES.classroom;

  // Game States
  const [cards, setCards] = useState<MemoryCardItem[]>([]);
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [matchedCardIds, setMatchedCardIds] = useState<string[]>([]);
  const [wrongCardIds, setWrongCardIds] = useState<string[]>([]);
  const [turnsCount, setTurnsCount] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const lockBoardRef = useRef(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Extract raw vocabulary pairs from stage
  const rawPairs = useMemo(() => {
    const list: Array<{ ko: string; vi: string; rom: string; hint?: string }> = [];

    if (tourGame?.targetWords && tourGame.targetWords.length > 0) {
      tourGame.targetWords.forEach((tw) => {
        list.push({
          ko: tw.wordKo,
          vi: tw.meaningVi,
          rom: tw.romanization,
          hint: tw.hint,
        });
      });
    }

    // Supplement from subSteps if needed to have at least 5-6 pairs
    if (stageConfig?.subSteps) {
      stageConfig.subSteps.forEach((st) => {
        if (list.length < 6 && st.contentKo && st.meaningVi && !list.some((item) => item.ko === st.contentKo)) {
          list.push({
            ko: st.contentKo.split('[')[0].trim().split('•')[0].trim(),
            vi: st.meaningVi.split('•')[0].trim(),
            rom: st.romanization || '',
            hint: st.summaryVi,
          });
        }
      });
    }

    // Default fallback if empty
    if (list.length === 0) {
      list.push(
        { ko: '안녕하세요', vi: 'Xin chào', rom: 'an-nyeong-ha-se-yo', hint: 'Lời chào trang trọng' },
        { ko: '감사합니다', vi: 'Cảm ơn', rom: 'gam-sa-ham-ni-da', hint: 'Biết ơn sâu sắc' },
        { ko: '사랑해요', vi: 'Yêu bạn', rom: 'sa-rang-hae-yo', hint: 'Bày tỏ tình cảm' },
        { ko: '친구', vi: 'Bạn bè', rom: 'chin-gu', hint: 'Người đồng hành' }
      );
    }

    // Take at most 6 pairs for optimal grid on mobile and desktop
    return list.slice(0, 6);
  }, [tourGame, stageConfig]);

  // Setup / Shuffle board
  const setupGame = () => {
    const newCards: MemoryCardItem[] = [];

    rawPairs.forEach((pair, idx) => {
      const pairId = `pair-${idx}`;
      // Korean Card
      newCards.push({
        id: `card-ko-${idx}`,
        pairId,
        type: 'ko',
        text: pair.ko,
        subtext: pair.rom ? `[${pair.rom}]` : undefined,
        audioText: pair.ko,
      });
      // Vietnamese Card
      newCards.push({
        id: `card-vi-${idx}`,
        pairId,
        type: 'vi',
        text: pair.vi,
        hint: pair.hint,
        audioText: pair.ko,
      });
    });

    // Random shuffle
    const shuffled = [...newCards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedIds([]);
    setMatchedCardIds([]);
    setWrongCardIds([]);
    setTurnsCount(0);
    setScore(0);
    setCombo(0);
    setIsCompleted(false);
    setElapsedSeconds(0);
    setIsTimerActive(true);
    lockBoardRef.current = false;
  };

  // Timer Effect
  useEffect(() => {
    if (isOpen && isTimerActive && !isCompleted) {
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isOpen, isTimerActive, isCompleted]);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setupGame();
    } else {
      setIsTimerActive(false);
    }
  }, [isOpen, rawPairs]);

  if (!isOpen) return null;

  const totalPairs = rawPairs.length;
  const matchedPairsCount = matchedCardIds.length / 2;

  // Handle Card Tap
  const handleCardClick = (card: MemoryCardItem) => {
    if (lockBoardRef.current) return;
    if (matchedCardIds.includes(card.id)) return;
    if (flippedIds.includes(card.id)) return;

    if (!isMuted) {
      playClickSound();
      if (card.type === 'ko') {
        speakKorean(card.text, 0.85);
      }
    }

    // Flip this card
    const nextFlipped = [...flippedIds, card.id];
    setFlippedIds(nextFlipped);

    // If 2 cards are flipped, check match
    if (nextFlipped.length === 2) {
      lockBoardRef.current = true;
      setTurnsCount((prev) => prev + 1);

      const firstCard = cards.find((c) => c.id === nextFlipped[0]);
      const secondCard = card;

      if (firstCard && firstCard.pairId === secondCard.pairId) {
        // MATCHED!
        if (!isMuted) {
          playSuccessSound();
          speakKorean(firstCard.audioText, 0.85);
        }

        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.6 },
        });

        const nextMatched = [...matchedCardIds, firstCard.id, secondCard.id];
        setMatchedCardIds(nextMatched);
        setFlippedIds([]);
        setCombo((prev) => prev + 1);
        setScore((prev) => prev + 20 + combo * 5);
        onAddXp(10);
        lockBoardRef.current = false;

        // Check victory
        if (nextMatched.length === cards.length) {
          setIsTimerActive(false);
          setTimeout(() => {
            setIsCompleted(true);
            if (!isMuted) playFanfareSound();
            onAddXp(40);
            confetti({
              particleCount: 100,
              spread: 80,
              origin: { y: 0.5 },
            });
          }, 600);
        }
      } else {
        // NOT A MATCH
        if (!isMuted) playIncorrectSound();
        setCombo(0);
        setWrongCardIds([firstCard?.id || '', secondCard.id]);

        setTimeout(() => {
          setFlippedIds([]);
          setWrongCardIds([]);
          lockBoardRef.current = false;
        }, 900);
      }
    }
  };

  // Format Timer mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  // Calculate Stars (1, 2, or 3)
  const calcStars = () => {
    if (turnsCount <= totalPairs + 2) return 3;
    if (turnsCount <= totalPairs * 2) return 2;
    return 1;
  };

  return (
    <div
      className={`fixed inset-0 z-50 w-screen h-screen min-h-screen flex flex-col overflow-hidden transition-colors duration-500 animate-fade-in ${currentBg.bgClass}`}
    >
      {/* Top Header Bar */}
      <header className={`sticky top-0 z-40 transition-colors duration-300 shrink-0 ${currentBg.headerClass}`}>
        <div className="max-w-4xl w-full mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 flex-wrap">
          {/* Left: Stage info */}
          <div className="flex items-center gap-2.5">
            <span className="text-2xl p-1.5 rounded-2xl bg-white/20 backdrop-blur-xs shrink-0 shadow-inner">
              {tourGame?.locationIcon || '🧠'}
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 shadow-2xs">
                  Chặng {stageNum} • Mini-Game
                </span>
                <span className="text-xs font-black text-amber-500 flex items-center gap-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{score} XP</span>
                </span>
              </div>
              <h3 className={`text-sm sm:text-base font-black truncate ${currentBg.headerTextClass}`}>
                {tourGame?.locationName || `Chặng ${stageNum}`}: Lật Thẻ Ghi Nhớ
              </h3>
            </div>
          </div>

          {/* Right: Controls & Flexible Theme Switcher */}
          <div className="flex items-center gap-1.5">
            {/* Sound Mute Toggle */}
            <button
              onClick={() => {
                playClickSound();
                setIsMuted(!isMuted);
              }}
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${currentBg.headerBtnClass}`}
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
            </button>

            {/* Restart Button */}
            <button
              onClick={() => {
                playClickSound();
                setupGame();
              }}
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${currentBg.headerBtnClass}`}
              title="Xáo bài và chơi lại từ đầu"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Flexible Theme Switcher (6 Tông màu Sáng/Tối) */}
            <StudyThemeBar
              currentTheme={studyTheme}
              onThemeChange={(newTheme) => setStudyTheme(newTheme)}
            />

            {/* Exit Button */}
            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-slate-200/80 dark:bg-slate-800 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-slate-700 dark:text-slate-200"
              title="Đóng trò chơi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Game Screen */}
      <main className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 max-w-4xl w-full mx-auto flex flex-col justify-between">
        {!isCompleted ? (
          <div className="space-y-4">
            {/* Status & Stats Bar */}
            <div className={`p-3.5 rounded-2xl flex items-center justify-between gap-2 flex-wrap ${currentBg.cardClass}`}>
              <div className="flex items-center gap-3 sm:gap-5">
                {/* Pairs Matched */}
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Đã ghép đúng</div>
                  <div className="text-base sm:text-lg font-black text-emerald-500 flex items-center gap-1">
                    <span>{matchedPairsCount}</span>
                    <span className="text-xs text-slate-400">/ {totalPairs} cặp</span>
                  </div>
                </div>

                {/* Turns Count */}
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Số lượt lật</div>
                  <div className="text-base sm:text-lg font-black text-sky-500">
                    {turnsCount}
                  </div>
                </div>

                {/* Timer */}
                <div className="text-left hidden sm:block">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Thời gian</div>
                  <div className="text-base sm:text-lg font-black text-purple-500 flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5" />
                    <span>{formatTime(elapsedSeconds)}</span>
                  </div>
                </div>
              </div>

              {/* Combo Streak & Instruction Hint */}
              <div className="flex items-center gap-2">
                {combo >= 2 && (
                  <div className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xs flex items-center gap-1 animate-bounce shadow-xs">
                    <Flame className="w-3.5 h-3.5 fill-white" />
                    <span>Combo x{combo}!</span>
                  </div>
                )}
                <span className="text-xs font-bold text-slate-500 dark:text-slate-300 hidden md:inline">
                  💡 Nhấn 1 thẻ Tiếng Hàn và 1 thẻ Tiếng Việt tương ứng
                </span>
              </div>
            </div>

            {/* Cards Grid (Lật Thẻ Trí Nhớ) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3.5">
              {cards.map((card) => {
                const isFlipped = flippedIds.includes(card.id) || matchedCardIds.includes(card.id);
                const isMatched = matchedCardIds.includes(card.id);
                const isWrong = wrongCardIds.includes(card.id);

                return (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(card)}
                    className="relative h-28 sm:h-36 rounded-2xl cursor-pointer select-none perspective-1000 group"
                  >
                    <div
                      className={`w-full h-full rounded-2xl transition-transform duration-500 transform-style-3d ${
                        isFlipped ? 'rotate-y-180' : ''
                      } ${isWrong ? 'animate-shake' : ''}`}
                    >
                      {/* 1. MẶT ÚP (FACE DOWN) */}
                      <div
                        className={`absolute inset-0 w-full h-full rounded-2xl backface-hidden p-3 flex flex-col items-center justify-center text-center border-2 transition-all shadow-md group-hover:scale-102 group-hover:shadow-lg ${
                          currentBg.isDark
                            ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border-indigo-500/40 text-sky-200 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                            : 'bg-gradient-to-br from-indigo-500 via-sky-500 to-purple-600 border-white/60 text-white shadow-indigo-200'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl mb-1 shadow-inner group-hover:rotate-12 transition-transform">
                          🇰🇷
                        </div>
                        <span className="text-[10px] font-black tracking-widest uppercase opacity-90">
                          LẬT THẺ
                        </span>
                        <div className="text-[10px] opacity-75 mt-0.5">Trí nhớ 🧠</div>
                      </div>

                      {/* 2. MẶT NGỬA (FACE UP) - NỀN PASTEL TOÀN BỘ, BẢNG TIẾNG VIỆT CHỮ ĐEN */}
                      <div
                        className={`absolute inset-0 w-full h-full rounded-2xl backface-hidden rotate-y-180 p-2.5 sm:p-3 flex flex-col items-center justify-between text-center border-2 transition-all shadow-md ${
                          isMatched
                            ? 'bg-[#E8F8F5] border-emerald-400 text-emerald-950 ring-2 ring-emerald-300'
                            : isWrong
                            ? 'bg-[#FFEAEB] border-rose-400 text-rose-950 ring-2 ring-rose-300'
                            : card.type === 'vi'
                            ? 'bg-[#FFFBEB] dark:bg-[#FFFDF0] border-amber-300 text-black shadow-xs ring-1 ring-amber-200'
                            : 'bg-[#F0F9FF] dark:bg-[#F3F9FF] border-sky-300 text-slate-900 shadow-xs ring-1 ring-sky-200'
                        }`}
                      >
                        {/* Top Badge: Ngôn ngữ */}
                        <div className="flex items-center justify-between w-full">
                          <span
                            className={`text-[9px] sm:text-[10px] uppercase font-black px-1.5 py-0.5 rounded-md ${
                              card.type === 'ko'
                                ? 'bg-sky-100 text-sky-900 border border-sky-200'
                                : 'bg-amber-200 text-black border border-amber-300 font-black'
                            }`}
                          >
                            {card.type === 'ko' ? '🇰🇷 Tiếng Hàn' : '🇻🇳 Tiếng Việt'}
                          </span>

                          {isMatched && (
                            <span className="text-emerald-600 flex items-center gap-0.5 text-[10px] font-black animate-scale-up">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>

                        {/* Card Main Content */}
                        <div className="my-auto w-full px-1">
                          <div
                            className={`tracking-tight leading-snug line-clamp-2 ${
                              card.type === 'ko'
                                ? 'text-sm sm:text-base text-slate-900 font-black'
                                : 'text-xs sm:text-sm text-black font-black'
                            }`}
                          >
                            {card.text}
                          </div>

                          {card.subtext && (
                            <div className="text-[10px] font-mono font-bold text-sky-700 truncate mt-0.5">
                              {card.subtext}
                            </div>
                          )}
                          {card.hint && (
                            <div className="text-[9px] text-black/80 font-bold truncate mt-0.5">
                              {card.hint}
                            </div>
                          )}
                        </div>

                        {/* Bottom action: Audio on Korean card */}
                        <div className="w-full flex items-center justify-center">
                          {card.type === 'ko' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                speakKorean(card.text);
                              }}
                              className="p-1 rounded-md hover:bg-sky-100 text-sky-700 transition-colors cursor-pointer"
                              title="Nghe phát âm"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-[9px] text-black font-bold">Nghĩa tiếng Việt</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* VICTORY COMPLETION SCREEN */
          <div className="py-8 sm:py-12 text-center space-y-6 max-w-md mx-auto animate-scale-up my-auto">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-400 text-slate-950 flex items-center justify-center text-4xl shadow-2xl shadow-amber-400/40">
              🏆
            </div>

            <div className="space-y-2">
              {/* Stars */}
              <div className="flex items-center justify-center gap-1.5 text-amber-400">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-8 h-8 ${
                      i < calcStars()
                        ? 'fill-amber-400 text-amber-400 animate-bounce'
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                ))}
              </div>

              <h3 className={`text-2xl sm:text-3xl font-black ${currentBg.completionTitleClass}`}>
                Trí Nhớ Đỉnh Cao!
              </h3>
              <p className={`text-xs sm:text-sm font-medium ${currentBg.completionSubtitleClass}`}>
                Bạn đã lật đúng toàn bộ {totalPairs} cặp từ vựng của chặng {stageNum}!
              </p>
            </div>

            {/* Score & Stats Card */}
            <div className={`p-4 rounded-2xl grid grid-cols-3 gap-2 text-center ${currentBg.cardClass}`}>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Lượt lật</div>
                <div className="text-xl font-black text-sky-500">{turnsCount}</div>
              </div>
              <div className="border-x border-slate-200 dark:border-slate-700">
                <div className="text-[10px] uppercase font-bold text-slate-400">Thời gian</div>
                <div className="text-xl font-black text-purple-500">{formatTime(elapsedSeconds)}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Thưởng XP</div>
                <div className="text-xl font-black text-amber-500">+{score + 40} XP</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  playClickSound();
                  setupGame();
                }}
                className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${currentBg.secondaryBtnClass}`}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Chơi lại ván mới</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  onClose();
                }}
                className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${currentBg.actionBtnClass}`}
              >
                <span>Tiếp tục học chặng</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export const StageMemoryFlipMiniGameModal = TourSightWordMiniGameModal;
