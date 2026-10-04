import React, { useState, useEffect } from 'react';
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
  BookOpen,
  Volume2,
  ChevronRight,
  Check,
  X
} from 'lucide-react';
import { TopikTest, TopikQuestion } from '../types';
import { TOPIK_TESTS } from '../data/topikTests';
import { speakKorean, playClickSound, playSuccessSound, playFanfareSound, playIncorrectSound } from '../utils/audio';

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

  const activeTest = TOPIK_TESTS.find((t) => t.id === selectedTestId) || TOPIK_TESTS[0];

  const displayedTests = TOPIK_TESTS.filter((t) => {
    if (filterLevel === 'all') return true;
    if (filterLevel === 'topik-1') return t.level === 'topik-1' || t.level === 'topik-2';
    if (filterLevel === 'topik-intermediate') return t.level === 'topik-intermediate';
    if (filterLevel === 'topik-advanced') return t.level === 'topik-advanced';
    return true;
  });

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
    playClickSound();
    const test = TOPIK_TESTS.find((t) => t.id === testId) || TOPIK_TESTS[0];
    setSelectedTestId(testId);
    setTimeRemainingSeconds(test.durationMinutes * 60);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setIsSubmitted(false);
    setIsTestStarted(true);
  };

  const handleSelectOption = (optIndex: number) => {
    if (isSubmitted) return;
    playClickSound();
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optIndex,
    }));
  };

  const handleSubmitTest = () => {
    playClickSound();
    setIsSubmitted(true);

    // Calculate score
    let correctCount = 0;
    activeTest.questions.forEach((q, idx) => {
      const isCorrect = userAnswers[idx] === q.correctIndex;
      if (isCorrect) correctCount++;
      onRecordQuizResult(isCorrect);
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

  // If test has not started yet -> Show test list
  if (!isTestStarted) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-6 sm:p-8 text-white shadow-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5 text-yellow-200" />
            <span>Phòng Thi Thử TOPIK Chuẩn Quốc Tế</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            Luyện Thi TOPIK Từ Sơ Cấp Đến Trung Cấp
          </h2>
          <p className="text-xs sm:text-sm text-orange-100 mt-2 leading-relaxed max-w-2xl">
            Các bộ đề thi được biên soạn sát theo cấu trúc đề thi chính thức của Viện Giáo dục Quốc tế Quốc gia Hàn Quốc (NIIED), bao gồm từ vựng, ngữ pháp và đọc hiểu có tính giờ và chấm điểm chi tiết.
          </p>
        </div>

        {/* LEVEL FILTER TABS */}
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
              🌿 TOPIK II Trung cấp ({TOPIK_TESTS.filter((t) => t.level === 'topik-intermediate').length} đề)
            </span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setFilterLevel('topik-advanced');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
              filterLevel === 'topik-advanced'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>
              🌳 TOPIK II Cao cấp ({TOPIK_TESTS.filter((t) => t.level === 'topik-advanced').length} đề)
            </span>
          </button>
        </div>

        {/* TOPIK Test Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedTests.map((test) => {
            const isTopik1 = test.level === 'topik-1' || test.level === 'topik-2';
            const isIntermediate = test.level === 'topik-intermediate';
            const isAdvanced = test.level === 'topik-advanced';

            return (
              <div
                key={test.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 hover:border-amber-400 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase ${
                        isTopik1
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isIntermediate
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          : 'bg-purple-100 text-purple-800 border border-purple-200'
                      }`}
                    >
                      {test.levelLabel}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold shrink-0">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>{test.durationMinutes} phút</span>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-slate-800 leading-snug">
                    {test.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {test.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-bold">
                    <span>Số câu hỏi: {test.questions.length} câu</span>
                    <span>Mục tiêu: {test.targetScore}/100</span>
                  </div>
                </div>

                <button
                  onClick={() => handleStartTest(test.id)}
                  className="mt-5 w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm shadow-md shadow-amber-200 transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95"
                >
                  <span>Bắt đầu thi thử</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // TEST IN PROGRESS OR SUBMITTED
  const currentQ = activeTest.questions[currentQuestionIndex];
  const answeredCount = Object.keys(userAnswers).length;
  let correctCount = 0;
  if (isSubmitted) {
    activeTest.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) correctCount++;
    });
  }
  const scorePercent = Math.round((correctCount / activeTest.questions.length) * 100);

  return (
    <div className="space-y-6">
      {/* Test Top Sticky Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-black">
              {activeTest.levelLabel}
            </span>
            <span className="text-xs text-slate-500 font-bold">
              Đã làm {answeredCount} / {activeTest.questions.length} câu
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-800 mt-0.5">{activeTest.title}</h3>
        </div>

        <div className="flex items-center gap-3">
          {/* Countdown Clock */}
          <div
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border font-mono font-bold text-sm ${
              timeRemainingSeconds < 180
                ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeRemainingSeconds)}</span>
          </div>

          {!isSubmitted ? (
            <button
              onClick={handleSubmitTest}
              className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              Nộp bài thi
            </button>
          ) : (
            <button
              onClick={() => setIsTestStarted(false)}
              className="px-4 py-2 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Chọn đề khác
            </button>
          )}
        </div>
      </div>

      {/* RESULT SCORECARD BANNER (When submitted) */}
      {isSubmitted && (
        <div
          className={`rounded-3xl p-6 border-2 text-center animate-fade-in ${
            scorePercent >= 70
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-400'
              : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-400'
          }`}
        >
          <div className="text-4xl mb-2">{scorePercent >= 70 ? '🎉' : '📖'}</div>
          <h3 className="text-2xl font-black">
            {scorePercent >= 70 ? 'Chúc Mừng! Bạn Đã Đạt Chuẩn TOPIK!' : 'Kết Quả Cần Cố Gắng Thêm!'}
          </h3>
          <p className="text-sm opacity-90 mt-1 max-w-lg mx-auto">
            Điểm số: <strong className="text-xl">{scorePercent} / 100 điểm</strong> ({correctCount} / {activeTest.questions.length} câu đúng)
          </p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <button
              onClick={() => handleStartTest(activeTest.id)}
              className="px-4 py-2 rounded-xl bg-white text-slate-900 font-black text-xs shadow-xs hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Thi lại đề này</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN TEST QUESTION CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Details Column */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-black">
                Câu {currentQuestionIndex + 1}: {currentQ.category}
              </span>
              <button
                onClick={() => speakKorean(currentQ.questionKo)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-100 text-xs font-bold transition-colors cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Đọc đề bài</span>
              </button>
            </div>

            {/* Passage if any */}
            {currentQ.passageKo && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-sm font-sans font-medium text-slate-800 leading-relaxed whitespace-pre-line">
                {currentQ.passageKo}
              </div>
            )}

            {/* Question prompt */}
            <div className="text-base sm:text-lg font-bold text-slate-900 whitespace-pre-line leading-relaxed">
              {currentQ.questionKo}
            </div>
            {currentQ.questionVi && (
              <div className="text-xs text-slate-500 italic">
                Dịch: {currentQ.questionVi}
              </div>
            )}

            {/* 4 Multiple choices */}
            <div className="grid grid-cols-1 gap-3 pt-2">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = userAnswers[currentQuestionIndex] === optIdx;
                const isCorrect = optIdx === currentQ.correctIndex;

                let optStyle = 'border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50/20 text-slate-800';
                if (isSubmitted) {
                  if (isCorrect) {
                    optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                  } else if (isSelected && !isCorrect) {
                    optStyle = 'border-red-500 bg-red-50 text-red-900 font-bold';
                  } else {
                    optStyle = 'border-slate-200 opacity-60';
                  }
                } else if (isSelected) {
                  optStyle = 'border-amber-500 bg-amber-50/60 text-amber-900 font-bold ring-2 ring-amber-200';
                }

                return (
                  <button
                    key={optIdx}
                    disabled={isSubmitted}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${optStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                        {optIdx + 1}
                      </span>
                      <span className="text-sm font-medium">{opt}</span>
                    </div>

                    {isSubmitted && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {isSubmitted && isSelected && !isCorrect && (
                      <X className="w-5 h-5 text-red-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation when submitted */}
            {isSubmitted && (
              <div className="mt-4 p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 leading-relaxed animate-fade-in">
                <span className="font-black text-amber-900">💡 Giải thích chi tiết: </span>
                {currentQ.explanationVi}
              </div>
            )}

            {/* Pagination between questions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => {
                  playClickSound();
                  setCurrentQuestionIndex((prev) => prev - 1);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Câu trước
              </button>

              <span className="text-xs font-bold text-slate-500">
                Câu {currentQuestionIndex + 1} / {activeTest.questions.length}
              </span>

              <button
                disabled={currentQuestionIndex === activeTest.questions.length - 1}
                onClick={() => {
                  playClickSound();
                  setCurrentQuestionIndex((prev) => prev + 1);
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black transition-colors cursor-pointer"
              >
                Câu sau
              </button>
            </div>
          </div>
        </div>

        {/* Question Navigator Grid (Right Column) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3">
              Bảng câu hỏi ({activeTest.questions.length} câu)
            </h4>

            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-3 gap-2">
              {activeTest.questions.map((q, idx) => {
                const isAnswered = userAnswers[idx] !== undefined;
                const isCurrent = currentQuestionIndex === idx;
                const isCorrect = isSubmitted && userAnswers[idx] === q.correctIndex;
                const isWrong = isSubmitted && isAnswered && !isCorrect;

                let btnClass = 'bg-slate-100 text-slate-600 hover:bg-slate-200';
                if (isSubmitted) {
                  if (isCorrect) btnClass = 'bg-emerald-500 text-white font-bold';
                  else if (isWrong) btnClass = 'bg-red-500 text-white font-bold';
                  else btnClass = 'bg-slate-200 text-slate-400';
                } else if (isCurrent) {
                  btnClass = 'bg-amber-500 text-white font-black ring-2 ring-amber-300';
                } else if (isAnswered) {
                  btnClass = 'bg-amber-100 text-amber-800 font-bold';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      playClickSound();
                      setCurrentQuestionIndex(idx);
                    }}
                    className={`h-9 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${btnClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
