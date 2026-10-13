import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Volume2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Star,
  Check,
  Award,
  Crown,
  Heart,
  Palette,
  Compass,
} from 'lucide-react';
import { StageSubStep } from '../data/stagesCandyCrushData';
import {
  speakKorean,
  playClickSound,
  playSuccessSound,
  playFanfareSound,
  playIncorrectSound,
} from '../utils/audio';
import {
  CompanionAvatar,
  COMPANION_CHARACTERS,
  COMPANION_LIST,
} from '../data/companionCharacters';

interface StageStepLearningModalProps {
  isOpen: boolean;
  onClose: () => void;
  stageNumber: number;
  stageTitle: string;
  step: StageSubStep | null;
  onCompleteStep: (stepId: string) => void;
  onAddXp: (amount: number) => void;
}

export type StudyBackgroundTheme = 'midnight' | 'classroom' | 'sunset' | 'jeju';

interface BgThemeOption {
  id: StudyBackgroundTheme;
  name: string;
  icon: string;
  bgClass: string;
  cardClass: string;
  textClass: string;
}

const BG_THEMES: Record<StudyBackgroundTheme, BgThemeOption> = {
  midnight: {
    id: 'midnight',
    name: 'Đêm sao Seoul',
    icon: '🌌',
    bgClass: 'bg-gradient-to-br from-[#090D16] via-[#111827] to-[#030712]',
    cardClass: 'bg-slate-900/90 border-slate-700/80 text-white shadow-2xl',
    textClass: 'text-white',
  },
  classroom: {
    id: 'classroom',
    name: 'Giảng đường sáng',
    icon: '🏫',
    bgClass: 'bg-gradient-to-br from-[#F8FAFC] via-[#EEF2F6] to-[#E2E8F0]',
    cardClass: 'bg-white/95 border-slate-200/90 text-slate-800 shadow-xl',
    textClass: 'text-slate-900',
  },
  sunset: {
    id: 'sunset',
    name: 'Hoàng hôn ấm',
    icon: '🌇',
    bgClass: 'bg-gradient-to-br from-[#FFF7ED] via-[#FFEDD5] to-[#FDE047]',
    cardClass: 'bg-white/90 border-amber-200 text-slate-900 shadow-xl',
    textClass: 'text-slate-900',
  },
  jeju: {
    id: 'jeju',
    name: 'Đồi xanh Jeju',
    icon: '🌿',
    bgClass: 'bg-gradient-to-br from-[#ECFDF5] via-[#D1FAE5] to-[#A7F3D0]',
    cardClass: 'bg-white/95 border-emerald-200 text-slate-900 shadow-xl',
    textClass: 'text-slate-900',
  },
};

export const StageStepLearningModal: React.FC<StageStepLearningModalProps> = ({
  isOpen,
  onClose,
  stageNumber,
  stageTitle,
  step,
  onCompleteStep,
  onAddXp,
}) => {
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [scoreCount, setScoreCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Dedicated Learning Background Theme (Đổi nền toàn màn hình khi vào chặng học)
  const [studyTheme, setStudyTheme] = useState<StudyBackgroundTheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('korean_study_bg_theme') as StudyBackgroundTheme;
      if (saved && BG_THEMES[saved]) return saved;
    }
    return 'midnight';
  });

  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);

  // Save selected background theme
  const handleChangeBgTheme = (themeId: StudyBackgroundTheme) => {
    playClickSound();
    setStudyTheme(themeId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('korean_study_bg_theme', themeId);
    }
    setIsThemePickerOpen(false);
  };

  // Reset quiz state when step changes
  useEffect(() => {
    if (step) {
      setCurrentQuizIdx(0);
      setSelectedOpt(null);
      setIsAnswered(false);
      setScoreCount(0);
      setIsCompleted(false);
    }
  }, [step?.id]);

  if (!isOpen || !step) return null;

  const currentBg = BG_THEMES[studyTheme];
  const isCheckpoint = step.type === 'checkpoint';
  const questions = step.practiceQuestions || [];
  const currQ = questions[currentQuizIdx];
  const progressPercent = Math.round((step.stepNumber / 5) * 100);

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    playClickSound();
    setSelectedOpt(idx);
    setIsAnswered(true);

    const isCorrect = idx === currQ.correctIndex;
    if (isCorrect) {
      playSuccessSound();
      setScoreCount((prev) => prev + 1);
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.6 },
      });
    } else {
      playIncorrectSound();
    }
  };

  const handleNextQuestion = () => {
    playClickSound();
    if (currentQuizIdx + 1 < questions.length) {
      setCurrentQuizIdx((prev) => prev + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
    } else {
      // Completed all questions in this step!
      setIsCompleted(true);
      playFanfareSound();
      onCompleteStep(step.id);
      onAddXp(isCheckpoint ? 50 : 25);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    }
  };

  const handleFinishStepWithoutQuiz = () => {
    playFanfareSound();
    onCompleteStep(step.id);
    onAddXp(20);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 w-screen h-screen min-h-screen flex flex-col overflow-hidden transition-colors duration-500 animate-fade-in ${currentBg.bgClass}`}
    >
      {/* FULLSCREEN TOP APP BAR: Breadcrumb, Step Progress, Background Changer & Exit */}
      <header className="sticky top-0 z-40 bg-black/40 backdrop-blur-md border-b border-white/10 text-white shrink-0">
        <div className="max-w-6xl w-full mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Left: Back / Exit button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 text-white font-black text-xs transition-all cursor-pointer shadow-xs"
              title="Quay lại lộ trình học"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Thoát chặng</span>
            </button>

            {/* Stage & Step Info */}
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-900">
                  Chặng {stageNumber}
                </span>
                <span className="text-xs text-white/80 font-bold truncate max-w-xs">
                  {stageTitle}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Progress indicator */}
          <div className="flex-1 max-w-xs mx-auto text-center px-2">
            <div className="flex items-center justify-between text-[11px] font-black mb-1">
              <span className="text-white/90">
                {isCheckpoint ? 'Tập kiểm tra 👑' : `Mục ${step.stepNumber}/5`}
              </span>
              <span className="text-amber-300 font-mono">{progressPercent}%</span>
            </div>
            {/* Horizontal progress bar */}
            <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-rose-400 to-sky-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Right: Background Theme Picker & XP indicator */}
          <div className="flex items-center gap-2">
            {/* Background Theme Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  playClickSound();
                  setIsThemePickerOpen(!isThemePickerOpen);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-black transition-all cursor-pointer shadow-xs"
                title="Đổi màu nền không gian học"
              >
                <Palette className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden md:inline">Đổi nền:</span>
                <span>{currentBg.icon}</span>
              </button>

              {/* Theme Picker Popover */}
              {isThemePickerOpen && (
                <div className="absolute right-0 top-full mt-2 z-50 w-52 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-white/20 shadow-2xl p-2 space-y-1 text-white animate-scale-up">
                  <div className="px-2 py-1 text-[10px] uppercase font-black tracking-wider text-slate-400">
                    Chọn màu nền học tập:
                  </div>
                  {Object.values(BG_THEMES).map((thm) => (
                    <button
                      key={thm.id}
                      onClick={() => handleChangeBgTheme(thm.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        studyTheme === thm.id
                          ? 'bg-sky-500/30 text-sky-300 border border-sky-400/50'
                          : 'hover:bg-white/10 text-slate-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{thm.icon}</span>
                        <span>{thm.name}</span>
                      </span>
                      {studyTheme === thm.id && <Check className="w-3.5 h-3.5 text-sky-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-amber-400 text-slate-950 font-black text-xs shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>+{isCheckpoint ? 50 : 25} XP</span>
            </div>
          </div>
        </div>
      </header>

      {/* FULLSCREEN MAIN SCROLLABLE LEARNING ARENA */}
      <main className="flex-1 w-full overflow-y-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="max-w-3xl w-full mx-auto space-y-5">
          {!isCompleted ? (
            <>
              {/* Step Title Header Banner */}
              <div className="text-center space-y-1">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-xs">
                  {isCheckpoint ? '👑 MỐC KIỂM TRA CHẶNG' : `Mục ${step.stepNumber}/5 • Chặng ${stageNumber}`}
                </span>
                <h2 className="text-xl sm:text-3xl font-black text-white drop-shadow-md">
                  {step.title}
                </h2>
              </div>

              {/* 1. NA (Gia sư tiếng Hàn 🌸): Lời giảng dẫn đầu bài */}
              <div className="p-4 sm:p-5 rounded-3xl bg-rose-500/15 backdrop-blur-md border border-rose-300/30 text-white flex items-start gap-4 shadow-lg">
                <CompanionAvatar characterId="na" size={54} mood="explaining" showBadge />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-rose-300">
                      Na • Gia sư tiếng Hàn
                    </span>
                    <span className="text-[10px] bg-rose-500/30 text-rose-200 px-2 py-0.5 rounded-full font-bold">
                      Giảng bài
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-white/95 mt-1.5 leading-relaxed font-medium">
                    {step.summaryVi}
                  </p>
                </div>
              </div>

              {/* 2. CORE KNOWLEDGE CARD (Khối kiến thức trọng tâm phát âm chuẩn Seoul) */}
              <div className="p-6 sm:p-10 rounded-3xl bg-black/40 backdrop-blur-md border-2 border-white/20 text-white text-center space-y-4 shadow-2xl relative overflow-hidden">
                <div className="text-4xl sm:text-6xl font-black text-amber-300 font-sans tracking-wider drop-shadow-md">
                  {step.contentKo}
                </div>

                {step.romanization && (
                  <div className="text-sm sm:text-base font-mono text-purple-200 font-semibold tracking-wide">
                    [{step.romanization}]
                  </div>
                )}

                {step.meaningVi && (
                  <div className="text-base sm:text-xl text-emerald-300 font-bold">
                    "{step.meaningVi}"
                  </div>
                )}

                {/* Big Seoul Audio Button */}
                <div className="pt-2 flex justify-center">
                  <button
                    onClick={() => {
                      playClickSound();
                      speakKorean(step.contentKo, 0.85);
                    }}
                    className="px-6 py-3 rounded-2xl bg-white text-slate-900 font-black text-sm sm:text-base hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer shadow-lg"
                  >
                    <Volume2 className="w-5 h-5 text-purple-600 animate-pulse" />
                    <span>Nghe phát âm chuẩn Seoul (Giọng nam)</span>
                  </button>
                </div>
              </div>

              {/* 3. RIN (Trợ lý bài tập 🧢): Mẹo ghi nhớ & Hướng dẫn chi tiết */}
              <div className="p-4 sm:p-5 rounded-3xl bg-amber-500/15 backdrop-blur-md border border-amber-300/30 text-white flex items-start gap-4 shadow-lg">
                <CompanionAvatar characterId="rin" size={50} mood="happy" showBadge />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-amber-300">
                      Rin • Trợ lý bài tập
                    </span>
                    <span className="text-[10px] bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded-full font-bold">
                      Mẹo nhớ
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-white/95 mt-1.5 leading-relaxed font-medium">
                    💡 {step.detailExplanation}
                  </p>
                </div>
              </div>

              {/* 4. MIN (Luyện đề 💻) & LUMI (Động lực 💜): Luyện tập trắc nghiệm toàn màn hình */}
              {questions.length > 0 && currQ && (
                <div className="p-5 sm:p-7 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 text-white space-y-4 shadow-2xl">
                  {/* Min Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-3">
                      <CompanionAvatar characterId="min" size={40} mood="thinking" />
                      <div>
                        <span className="text-xs font-black text-sky-300 block">
                          Min • Chuyên gia luyện đề
                        </span>
                        <span className="text-[11px] text-white/70">
                          Câu {currentQuizIdx + 1} / {questions.length}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-400 text-emerald-300">
                      Đúng {scoreCount}/{questions.length}
                    </span>
                  </div>

                  {/* Question Prompt */}
                  <p className="text-base sm:text-lg font-black text-white leading-relaxed">
                    {currQ.question}
                  </p>

                  {/* 4 Choices */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {currQ.options.map((opt, oIdx) => {
                      const isChosen = selectedOpt === oIdx;
                      const isCorrectOpt = oIdx === currQ.correctIndex;

                      let btnStyle = 'bg-white/10 hover:bg-white/20 text-white border-white/20';
                      if (isAnswered) {
                        if (isCorrectOpt) {
                          btnStyle = 'bg-emerald-500 text-white border-emerald-400 font-black shadow-lg scale-101';
                        } else if (isChosen) {
                          btnStyle = 'bg-rose-500 text-white border-rose-400 line-through opacity-90';
                        } else {
                          btnStyle = 'bg-black/20 text-white/40 border-white/10 opacity-50';
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={isAnswered}
                          onClick={() => handleSelectOption(oIdx)}
                          className={`p-3.5 sm:p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {isAnswered && isCorrectOpt && <Check className="w-5 h-5 text-white" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* LUMI feedback & Next question button */}
                  {isAnswered && (
                    <div className="pt-3 border-t border-white/10 space-y-3 animate-fade-in">
                      <div className="flex items-center gap-3 p-3 rounded-2xl bg-purple-500/20 border border-purple-400/40">
                        <CompanionAvatar characterId="lumi" size={40} mood={selectedOpt === currQ.correctIndex ? 'cheering' : 'happy'} />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] uppercase font-black text-purple-300">
                            Lumi truyền cảm hứng 💕
                          </span>
                          <p className="text-xs sm:text-sm font-bold text-white">
                            {selectedOpt === currQ.correctIndex
                              ? 'Tuyệt vời! Bạn nắm bài rất nhanh và chuẩn xác! 🌟'
                              : 'Không sao đâu, Lumi cùng bạn ghi nhớ câu này để làm tốt hơn nhé!'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                        <p className="text-xs text-white/80 font-medium">
                          💡 {currQ.explanation}
                        </p>

                        <button
                          onClick={handleNextQuestion}
                          className="px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                        >
                          <span>{currentQuizIdx + 1 < questions.length ? 'Câu tiếp theo →' : 'Hoàn thành mục'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action if no questions */}
              {questions.length === 0 && (
                <div className="pt-4 text-center">
                  <button
                    onClick={handleFinishStepWithoutQuiz}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    Hoàn thành mục này & Nhận XP
                  </button>
                </div>
              )}
            </>
          ) : (
            /* 5. FULLSCREEN COMPLETION SCREEN: Biệt đội 5 người bạn ăn mừng */
            <div className="py-8 sm:py-12 text-center space-y-6 max-w-xl mx-auto animate-scale-up">
              {/* 5 Friends Squad celebrating */}
              <div className="flex items-center justify-center -space-x-3 py-3">
                {COMPANION_LIST.map((buddy) => (
                  <div key={buddy.id} className="relative transition-transform hover:scale-125 hover:z-20">
                    <CompanionAvatar characterId={buddy.id} size={64} mood="cheering" />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center gap-1.5 text-amber-400">
                  <Star className="w-8 h-8 fill-amber-400 animate-bounce" />
                  <Star className="w-10 h-10 fill-amber-400 animate-bounce delay-100" />
                  <Star className="w-8 h-8 fill-amber-400 animate-bounce delay-200" />
                </div>
                <h3 className="text-2xl sm:text-4xl font-black text-white">
                  {isCheckpoint ? 'Vượt Qua Mốc Kiểm Tra Chặng!' : 'Hoàn Thành Xuất Sắc!'}
                </h3>
                <p className="text-sm text-white/90 font-medium">
                  "Học không chỉ là cố gắng, mà còn là niềm vui! Cùng nhau, chúng ta làm được! 💕"
                </p>
              </div>

              <div className="p-4 rounded-3xl bg-amber-400 text-slate-950 max-w-xs mx-auto text-sm font-black shadow-xl">
                +{isCheckpoint ? 50 : 25} XP đã được cộng vào tài khoản của bạn!
              </div>

              <div className="pt-4">
                <button
                  onClick={() => {
                    playClickSound();
                    onClose();
                  }}
                  className="px-8 py-3.5 rounded-2xl bg-white text-slate-900 font-black text-sm shadow-2xl hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  Tiếp tục hành trình học →
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
