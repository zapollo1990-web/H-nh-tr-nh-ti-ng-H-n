import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Volume2,
  ChevronRight,
  Check,
  X,
  Zap,
  CheckCheck
} from 'lucide-react';
import { TopikTest, TopikQuestion } from '../types';
import { TOPIK_TESTS } from '../data/topikTests';
import {
  speakKorean,
  playClickSound,
  playSuccessSound,
  playFanfareSound,
  playIncorrectSound,
  getVoiceGender
} from '../utils/audio';
import { VoiceGenderToggle } from './VoiceGenderToggle';

interface TopikMockTestViewProps {
  onAddXp: (amount: number) => void;
  onRecordQuizResult: (isCorrect: boolean) => void;
  onUnlockBadge?: (badgeId: string) => void;
}

export const TopikMockTestView: React.FC<TopikMockTestViewProps> = ({
  onAddXp,
  onRecordQuizResult,
  onUnlockBadge,
}) => {
  const [selectedTestId, setSelectedTestId] = useState<string>('topik-test-1');
  const [filterLevel, setFilterLevel] = useState<'all' | 'topik-1' | 'topik-intermediate' | 'topik-advanced'>('all');
  const [isTestStarted, setIsTestStarted] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(15 * 60);

  // Auto-advance State
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeTest = TOPIK_TESTS.find((t) => t.id === selectedTestId) || TOPIK_TESTS[0];

  const displayedTests = TOPIK_TESTS.filter((t) => {
    if (filterLevel === 'all') return true;
    if (filterLevel === 'topik-1') return t.level === 'topik-1' || t.level === 'topik-2';
    if (filterLevel === 'topik-intermediate') return t.level === 'topik-intermediate';
    if (filterLevel === 'topik-advanced') return t.level === 'topik-advanced';
    return true;
  });

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTestStarted && !isSubmitted && timeRemainingSeconds > 0) {
      interval = setInterval(() => {
        setTimeRemainingSeconds((prev) => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTestStarted, isSubmitted, timeRemainingSeconds]);

  const handleStartTest = (testId: string) => {
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    playClickSound();
    const test = TOPIK_TESTS.find((t) => t.id === testId) || TOPIK_TESTS[0];
    setSelectedTestId(testId);
    setTimeRemainingSeconds(test.durationMinutes * 60);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setIsSubmitted(false);
    setIsAutoAdvancing(false);
    setIsTestStarted(true);
  };

  // Instant answer selection with auto-check & smooth auto-advance
  const handleSelectOption = (optIndex: number) => {
    if (isSubmitted || isAutoAdvancing || userAnswers[currentQuestionIndex] !== undefined) return;

    const currentQ = activeTest.questions[currentQuestionIndex];
    const isCorrect = optIndex === currentQ.correctIndex;

    // Save user answer
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optIndex,
    }));

    onRecordQuizResult(isCorrect);

    // Instant sound
    if (isCorrect) {
      playSuccessSound();
      onAddXp(10);
    } else {
      playIncorrectSound();
    }

    setIsAutoAdvancing(true);

    // Auto-advance to next question after 1.25s
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    autoAdvanceTimerRef.current = setTimeout(() => {
      goToNextQuestion();
    }, 1250);
  };

  const goToNextQuestion = () => {
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    setIsAutoAdvancing(false);
    if (currentQuestionIndex < activeTest.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Completed all questions -> finalize test
      handleSubmitTest();
    }
  };

  const handleSubmitTest = () => {
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    setIsAutoAdvancing(false);
    playClickSound();
    setIsSubmitted(true);

    let correctCount = 0;
    activeTest.questions.forEach((q, idx) => {
      const isCorrect = userAnswers[idx] === q.correctIndex;
      if (isCorrect) correctCount++;
    });

    const scorePercent = Math.round((correctCount / activeTest.questions.length) * 100);
    if (scorePercent >= 70) {
      playFanfareSound();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      onAddXp(80);
      if (onUnlockBadge) {
        onUnlockBadge('badge-topik-fighter');
      }
    } else {
      playSuccessSound();
      onAddXp(30);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 1. IF TEST NOT STARTED -> SHOW STREAMLINED TEST LIST
  if (!isTestStarted) {
    return (
      <div className="space-y-6">
        {/* Banner with Voice Gender Picker */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-yellow-200" />
              <span>Thi Thử TOPIK Tự Chấm Điểm & Tự Chuyển Câu</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">
              Luyện Thi TOPIK Sơ Cấp & Trung Cấp
            </h2>
            <p className="text-xs sm:text-sm text-orange-100 leading-relaxed font-medium">
              Chọn đáp án sẽ <strong>tự động hiện kết quả đúng/sai</strong> và <strong>tự chuyển câu mới</strong> mượt mà. Hỗ trợ tùy chỉnh giọng đọc chuẩn Nam/Nữ!
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
            <span className="text-[11px] font-bold text-amber-100">Tùy chọn giọng đọc:</span>
            <div className="flex items-center gap-2">
              <VoiceGenderToggle className="bg-white/95 text-slate-800 shadow-xs" />
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  speakKorean(
                    getVoiceGender() === 'female'
                      ? '안녕하세요! 토픽 시험을 준비해 볼까요?'
                      : '반갑습니다! 토픽 모의고사입니다.'
                  );
                }}
                className="px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all flex items-center gap-1 border border-white/30 cursor-pointer shadow-xs active:scale-95"
                title="Nghe thử giọng đọc đã chọn"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Nghe thử</span>
              </button>
            </div>
          </div>
        </div>

        {/* Level Filters */}
        <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => {
              playClickSound();
              setFilterLevel('all');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
              filterLevel === 'all'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Tất cả ({TOPIK_TESTS.length} đề thi)</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setFilterLevel('topik-1');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
              filterLevel === 'topik-1'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>
              🌱 TOPIK I Sơ cấp ({TOPIK_TESTS.filter((t) => t.level === 'topik-1' || t.level === 'topik-2').length} đề)
            </span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setFilterLevel('topik-intermediate');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
              filterLevel === 'topik-intermediate'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>
              💼 TOPIK II Trung cấp ({TOPIK_TESTS.filter((t) => t.level === 'topik-intermediate').length} đề)
            </span>
          </button>
        </div>

        {/* Test Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedTests.map((test) => (
            <div
              key={test.id}
              onClick={() => handleStartTest(test.id)}
              className="bg-white rounded-3xl p-5 border-2 border-slate-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black">
                    {test.levelLabel}
                  </span>
                  <div className="flex items-center gap-1 text-slate-500 text-xs font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{test.durationMinutes} phút</span>
                    <span>•</span>
                    <span>{test.questions.length} câu</span>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-black text-slate-800 group-hover:text-amber-600 transition-colors">
                  {test.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {test.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> Tự hiện đáp án & tự chuyển câu
                </span>
                <span className="px-4 py-1.5 rounded-xl bg-amber-500 group-hover:bg-amber-600 text-white text-xs font-black transition-colors flex items-center gap-1 shadow-xs">
                  <span>Vào thi</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. TEST IN PROGRESS OR SUBMITTED
  const currentQ = activeTest.questions[currentQuestionIndex];
  const isCurrentAnswered = userAnswers[currentQuestionIndex] !== undefined;
  const userChosenOpt = userAnswers[currentQuestionIndex];
  const answeredCount = Object.keys(userAnswers).length;

  let correctCount = 0;
  activeTest.questions.forEach((q, idx) => {
    if (userAnswers[idx] === q.correctIndex) correctCount++;
  });
  const scorePercent = Math.round((correctCount / activeTest.questions.length) * 100);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Test Sticky Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-black">
              {activeTest.levelLabel}
            </span>
            <span className="text-xs text-slate-500 font-bold">
              Câu {currentQuestionIndex + 1} / {activeTest.questions.length} • Đúng: <strong className="text-emerald-600">{correctCount}</strong>
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-800 mt-0.5 truncate max-w-xs sm:max-w-md">
            {activeTest.title}
          </h3>
        </div>

        {/* Right tools: Voice Gender Switcher & Timer & Exit */}
        <div className="flex items-center gap-2 flex-wrap">
          <VoiceGenderToggle variant="compact" />

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono font-bold text-xs ${
              timeRemainingSeconds < 180
                ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(timeRemainingSeconds)}</span>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Bạn có muốn dừng bài thi và quay lại danh sách đề thi không?')) {
                setIsTestStarted(false);
              }
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Thoát bài thi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / activeTest.questions.length) * 100}%` }}
        />
      </div>

      {/* RESULT SCORECARD (If submitted or all completed) */}
      {isSubmitted && (
        <div
          className={`rounded-3xl p-6 border-2 text-center animate-fadeIn ${
            scorePercent >= 70
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-400'
              : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-400'
          }`}
        >
          <div className="text-4xl mb-2">{scorePercent >= 70 ? '🎉' : '📖'}</div>
          <h3 className="text-xl sm:text-2xl font-black">
            {scorePercent >= 70 ? 'Chúc Mừng! Bạn Đã Đạt Chuẩn TOPIK!' : 'Kết Quả Cần Cố Gắng Thêm!'}
          </h3>
          <p className="text-sm opacity-95 mt-1 max-w-lg mx-auto">
            Điểm số: <strong className="text-xl">{scorePercent} / 100 điểm</strong> ({correctCount} / {activeTest.questions.length} câu đúng)
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => handleStartTest(activeTest.id)}
              className="px-4 py-2 rounded-xl bg-white text-slate-900 font-black text-xs shadow-xs hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Thi lại đề này</span>
            </button>
            <button
              onClick={() => setIsTestStarted(false)}
              className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-black text-xs transition-colors cursor-pointer"
            >
              Chọn đề thi khác
            </button>
          </div>
        </div>
      )}

      {/* MAIN QUESTION CARD */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        {/* Header Question info & Audio reader */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-xs font-black">
            Câu {currentQuestionIndex + 1}: {currentQ.category}
          </span>

          <button
            onClick={() => {
              playClickSound();
              speakKorean(currentQ.questionKo);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold transition-colors cursor-pointer"
            title="Nghe đọc đề bài bằng giọng đang chọn"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Nghe đọc đề 🔊</span>
          </button>
        </div>

        {/* Reading Passage if any */}
        {currentQ.passageKo && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-sm font-sans font-medium text-slate-800 leading-relaxed whitespace-pre-line shadow-2xs space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wide">
                Đoạn văn đọc hiểu:
              </span>
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  speakKorean(currentQ.passageKo!);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-sky-50 hover:text-sky-700 text-xs font-bold text-slate-700 transition-colors cursor-pointer shadow-2xs"
                title="Nghe đọc đoạn văn bằng giọng đang chọn"
              >
                <Volume2 className="w-3.5 h-3.5 text-sky-500" />
                <span>Nghe đoạn văn 🔊</span>
              </button>
            </div>
            <div className="leading-relaxed">{currentQ.passageKo}</div>
          </div>
        )}

        {/* Question Prompt */}
        <h4 className="text-base sm:text-lg font-bold text-slate-900 whitespace-pre-line leading-relaxed">
          {currentQ.questionKo}
        </h4>

        {/* 4 Answer Options (Instant check on click & auto-advance) */}
        <div className="grid grid-cols-1 gap-2.5 pt-1">
          {currentQ.options.map((opt, optIdx) => {
            const isThisChosen = userChosenOpt === optIdx;
            const isThisCorrect = optIdx === currentQ.correctIndex;

            let btnStyle =
              'border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50/20 text-slate-800';

            // Instant auto-check styles:
            if (isCurrentAnswered) {
              if (isThisCorrect) {
                btnStyle =
                  'border-emerald-500 bg-emerald-50 text-emerald-950 font-black shadow-sm ring-2 ring-emerald-200';
              } else if (isThisChosen && !isThisCorrect) {
                btnStyle = 'border-rose-500 bg-rose-50 text-rose-950 font-bold';
              } else {
                btnStyle = 'border-slate-100 bg-slate-50 text-slate-400 opacity-60';
              }
            }

            return (
              <button
                key={optIdx}
                disabled={isCurrentAnswered || isSubmitted}
                onClick={() => handleSelectOption(optIdx)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center shrink-0 ${
                      isCurrentAnswered && isThisCorrect
                        ? 'bg-emerald-500 text-white'
                        : isCurrentAnswered && isThisChosen && !isThisCorrect
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="text-xs sm:text-sm font-medium">{opt}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Option Audio button */}
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      playClickSound();
                      speakKorean(opt);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    title="Nghe phát âm đáp án này"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </span>

                  {/* Instant visual indicators with text badges */}
                  {isCurrentAnswered && isThisCorrect && (
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center gap-1 shadow-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Đáp án đúng</span>
                    </span>
                  )}
                  {isCurrentAnswered && isThisChosen && !isThisCorrect && (
                    <span className="px-2.5 py-1 rounded-xl bg-rose-600 text-white text-xs font-black flex items-center gap-1 shadow-xs">
                      <X className="w-4 h-4" />
                      <span>Bạn đã chọn</span>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Instant Explanation & Auto-advance Bar */}
        {isCurrentAnswered && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="font-black text-amber-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Giải thích:</span>
              </span>
              {isAutoAdvancing && (
                <span className="text-[11px] font-bold text-amber-700 animate-pulse">
                  ⚡ Đang tự chuyển sang câu tiếp theo...
                </span>
              )}
            </div>
            <p className="leading-relaxed">{currentQ.explanationVi}</p>
          </div>
        )}

        {/* Footer controls: Next / Skip button */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            disabled={currentQuestionIndex === 0}
            onClick={() => {
              if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
              setIsAutoAdvancing(false);
              playClickSound();
              setCurrentQuestionIndex((prev) => prev - 1);
            }}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer"
          >
            ← Câu trước
          </button>

          <button
            onClick={() => {
              playClickSound();
              goToNextQuestion();
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>{currentQuestionIndex < activeTest.questions.length - 1 ? 'Câu tiếp theo' : 'Nộp bài thi'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
