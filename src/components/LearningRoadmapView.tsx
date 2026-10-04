import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  MapPin,
  Lock,
  CheckCircle2,
  Sparkles,
  Volume2,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award,
  ChevronRight,
  Flame,
  Check,
  X,
  Play,
  Filter,
  Layers,
  GraduationCap
} from 'lucide-react';
import { RoadmapStage } from '../types';
import { ROADMAP_STAGES } from '../data/learningRoadmap';
import { speakKorean, playClickSound, playSuccessSound, playFanfareSound, playIncorrectSound } from '../utils/audio';

interface LearningRoadmapViewProps {
  completedStageIds: string[];
  onCompleteStage: (stageId: string, xpReward: number) => void;
  onRecordQuizResult: (isCorrect: boolean) => void;
  onAddXp: (amount: number) => void;
  onUnlockBadge?: (badgeId: string) => void;
}

type LevelFilter = 'all' | 'beginner' | 'intermediate1' | 'intermediate2' | 'advanced';

export const LearningRoadmapView: React.FC<LearningRoadmapViewProps> = ({
  completedStageIds,
  onCompleteStage,
  onRecordQuizResult,
  onAddXp,
  onUnlockBadge,
}) => {
  const [selectedStage, setSelectedStage] = useState<RoadmapStage | null>(null);
  const [activeStageTab, setActiveStageTab] = useState<'lessons' | 'quiz'>('lessons');
  const [selectedFilter, setSelectedFilter] = useState<LevelFilter>('all');

  // Quiz State inside modal
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Check if a stage is unlocked
  const isStageUnlocked = (stage: RoadmapStage) => {
    if (!stage.requiredStageId) return true; // First stage
    return completedStageIds.includes(stage.requiredStageId);
  };

  const handleOpenStage = (stage: RoadmapStage) => {
    playClickSound();
    if (!isStageUnlocked(stage)) {
      alert(`🔒 Chặng này đang bị khóa! Bạn cần hoàn thành các chặng trước đó để mở khóa nhé.`);
      return;
    }
    setSelectedStage(stage);
    setActiveStageTab('lessons');
    // Reset quiz
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setCorrectAnswersCount(0);
    setQuizFinished(false);
  };

  const handleSelectAnswer = (index: number) => {
    if (isAnswerSubmitted) return;
    playClickSound();
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !selectedStage) return;
    setIsAnswerSubmitted(true);

    const question = selectedStage.checkpointQuiz[currentQuizIndex];
    const isCorrect = selectedAnswer === question.correctIndex;

    onRecordQuizResult(isCorrect);

    if (isCorrect) {
      playSuccessSound();
      setCorrectAnswersCount((prev) => prev + 1);
    } else {
      playIncorrectSound();
    }
  };

  const handleNextQuizQuestion = () => {
    if (!selectedStage) return;
    playClickSound();
    if (currentQuizIndex < selectedStage.checkpointQuiz.length - 1) {
      setCurrentQuizIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      // Quiz finished
      setQuizFinished(true);
      const totalQuestions = selectedStage.checkpointQuiz.length;
      const finalCorrect = correctAnswersCount + (selectedAnswer === selectedStage.checkpointQuiz[currentQuizIndex].correctIndex ? 1 : 0);
      const passed = finalCorrect >= Math.ceil(totalQuestions * 0.65);

      if (passed) {
        playFanfareSound();
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });

        if (!completedStageIds.includes(selectedStage.id)) {
          onCompleteStage(selectedStage.id, selectedStage.xpReward);
        }

        // Trigger badges
        if (finalCorrect === 15) {
          onUnlockBadge?.('badge-perfect-15');
        }
        if (selectedStage.id === 'stage-1') onUnlockBadge?.('badge-newbie');
        if (selectedStage.id === 'stage-4') onUnlockBadge?.('badge-patchim-zen');
        if (selectedStage.id === 'stage-5') onUnlockBadge?.('badge-hangang-ramyeon');
        if (selectedStage.id === 'stage-8') onUnlockBadge?.('badge-topik-fighter');
        if (selectedStage.id === 'stage-10') onUnlockBadge?.('badge-ktx-express');
        if (selectedStage.id === 'stage-12') onUnlockBadge?.('badge-topik-intermediate');
        if (selectedStage.id === 'stage-13') onUnlockBadge?.('badge-office-pro');
        if (selectedStage.id === 'stage-14') onUnlockBadge?.('badge-chimaek');
        if (selectedStage.id === 'stage-15') onUnlockBadge?.('badge-kpop-idol');
        if (selectedStage.id === 'stage-16') onUnlockBadge?.('badge-slang-pro');
        if (selectedStage.id === 'stage-19') onUnlockBadge?.('badge-traditional-scholar');
        if (selectedStage.id === 'stage-20') onUnlockBadge?.('badge-topik-master');
      }
    }
  };

  // Filter stages based on level tab
  const filteredStages = ROADMAP_STAGES.filter((stage) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'beginner') {
      return stage.levelCategory === 'beginner' || stage.stageNumber <= 8;
    }
    if (selectedFilter === 'intermediate1') {
      return stage.stageNumber >= 9 && stage.stageNumber <= 12;
    }
    if (selectedFilter === 'intermediate2') {
      return stage.stageNumber >= 13 && stage.stageNumber <= 16;
    }
    if (selectedFilter === 'advanced') {
      return stage.stageNumber >= 17;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Lộ trình học theo đường đi - 20 Chặng Chuẩn TOPIK</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Chinh Phục Tiếng Hàn Từ Sơ Cấp Đến Cao Cấp
          </h2>
          <p className="text-xs sm:text-sm text-sky-100 mt-2 leading-relaxed">
            Học tập theo lộ trình chuẩn quốc tế 20 chặng toàn diện. Mỗi chặng trang bị kiến thức cô đọng và 15 câu trắc nghiệm thực chiến giúp bạn nắm chắc kiến thức 100%!
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-bold">
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Đã hoàn thành: {completedStageIds.length} / {ROADMAP_STAGES.length} chặng</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Tiến độ: {Math.round((completedStageIds.length / ROADMAP_STAGES.length) * 100)}%</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-xl text-amber-200">
              <GraduationCap className="w-4 h-4" />
              <span>15 câu hỏi / chặng</span>
            </div>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute right-0 top-0 -bottom-10 w-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* LEVEL FILTER TABS */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => {
            playClickSound();
            setSelectedFilter('all');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
            selectedFilter === 'all'
              ? 'bg-sky-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Tất cả (20 chặng)</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setSelectedFilter('beginner');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
            selectedFilter === 'beginner'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🌱 Sơ cấp (Chặng 1 - 8)</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setSelectedFilter('intermediate1');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
            selectedFilter === 'intermediate1'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🚇 Trung cấp 1 (Chặng 9 - 12)</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setSelectedFilter('intermediate2');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
            selectedFilter === 'intermediate2'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>💼 Trung cấp 2 (Chặng 13 - 16)</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setSelectedFilter('advanced');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
            selectedFilter === 'advanced'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>👑 Cao cấp (Chặng 17 - 20)</span>
        </button>
      </div>

      {/* ROADMAP PATH VIEW */}
      <div className="relative py-6 sm:py-8 px-2 sm:px-6">
        {/* Curving path line background */}
        <div className="absolute left-1/2 top-12 bottom-12 w-2.5 -translate-x-1/2 bg-gradient-to-b from-sky-300 via-indigo-300 to-purple-300 rounded-full hidden sm:block opacity-60 pointer-events-none" />

        <div className="space-y-8 sm:space-y-12 relative">
          {filteredStages.map((stage, index) => {
            const isCompleted = completedStageIds.includes(stage.id);
            const isUnlocked = isStageUnlocked(stage);
            const isCurrent = isUnlocked && !isCompleted;
            const isEven = index % 2 === 0;

            return (
              <div
                key={stage.id}
                className={`flex items-center justify-center sm:justify-start ${
                  isEven ? 'sm:flex-row' : 'sm:flex-row-reverse'
                } relative`}
              >
                {/* Stage Item Card */}
                <div className="w-full sm:w-1/2 px-2 sm:px-4">
                  <div
                    onClick={() => handleOpenStage(stage)}
                    className={`group relative overflow-hidden rounded-3xl p-5 border-2 transition-all cursor-pointer ${
                      isCompleted
                        ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300 hover:border-emerald-400 shadow-sm hover:shadow-md'
                        : isCurrent
                        ? 'bg-white border-sky-400 shadow-lg shadow-sky-100 ring-4 ring-sky-100 hover:scale-102'
                        : 'bg-slate-50/80 border-slate-200 opacity-75 hover:opacity-90'
                    }`}
                  >
                    {/* Stage status indicator badge */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                            isCompleted
                              ? 'bg-emerald-500 text-white'
                              : isCurrent
                              ? 'bg-sky-500 text-white animate-pulse'
                              : 'bg-slate-300 text-slate-600'
                          }`}
                        >
                          {isCompleted ? <Check className="w-4 h-4" /> : stage.stageNumber}
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Chặng {stage.stageNumber}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          +{stage.xpReward} XP
                        </span>
                        {isCompleted && (
                          <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Đã qua
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-[11px] font-black text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5 text-amber-500" /> Đang học
                          </span>
                        )}
                        {!isUnlocked && (
                          <span className="text-[11px] font-black text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Đang khóa
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Level Label Badge */}
                    {stage.levelLabel && (
                      <div className="mb-2">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {stage.levelLabel}
                        </span>
                      </div>
                    )}

                    {/* Title & Korean Title */}
                    <div className="flex items-start gap-3">
                      <div className="text-3xl shrink-0 p-2 rounded-2xl bg-white shadow-xs border border-slate-100">
                        {stage.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-black text-slate-800 tracking-tight group-hover:text-sky-600 transition-colors">
                          {stage.title}
                        </h3>
                        <p className="text-xs font-mono font-bold text-sky-700 mt-0.5">
                          {stage.koreanTitle}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                      {stage.description}
                    </p>

                    {/* Bottom CTA info */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-sky-500" />
                        <span>15 câu kiểm tra chặng</span>
                      </span>
                      <span className="font-bold text-sky-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        <span>Chi tiết chặng</span>
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Center Node on Timeline (Desktop) */}
                <div className="absolute left-1/2 -translate-x-1/2 hidden sm:flex items-center justify-center">
                  <div
                    className={`w-10 h-10 rounded-full border-4 flex items-center justify-center text-sm font-black transition-transform shadow-md ${
                      isCompleted
                        ? 'bg-emerald-500 border-white text-white shadow-emerald-200'
                        : isCurrent
                        ? 'bg-sky-500 border-white text-white ring-4 ring-sky-200 animate-bounce'
                        : 'bg-slate-200 border-white text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : stage.stageNumber}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STAGE MODAL: LESSONS & CHECKPOINT QUIZ */}
      {selectedStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-sky-500 to-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-2xl bg-white/20 backdrop-blur-xs">
                  {selectedStage.icon}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-black tracking-wider text-sky-200">
                      Chặng {selectedStage.stageNumber} • 15 Câu Hỏi
                    </span>
                    {selectedStage.levelLabel && (
                      <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold text-white">
                        {selectedStage.levelLabel}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-black">
                    {selectedStage.title}
                  </h3>
                  <p className="text-xs text-sky-100 font-mono font-bold">
                    {selectedStage.koreanTitle}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStage(null)}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
              <button
                onClick={() => {
                  playClickSound();
                  setActiveStageTab('lessons');
                }}
                className={`pb-3 px-4 font-black text-xs sm:text-sm border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeStageTab === 'lessons'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Nội Dung Trọng Tâm ({selectedStage.lessons.length})</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setActiveStageTab('quiz');
                }}
                className={`pb-3 px-4 font-black text-xs sm:text-sm border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeStageTab === 'quiz'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Kiểm Tra Chặng (15 câu)</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {activeStageTab === 'lessons' ? (
                /* LESSONS VIEW */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 text-xs text-sky-900 leading-relaxed">
                    💡 Hãy đọc kỹ các bài học cốt lõi bên dưới, bấm biểu tượng loa để luyện phát âm chuẩn, sau đó tiến hành làm bài kiểm tra 15 câu để hoàn thành chặng nhé!
                  </div>

                  {selectedStage.lessons.map((lesson, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2 hover:border-sky-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-[10px] font-bold">
                            {idx + 1}
                          </span>
                          <span>{lesson.title}</span>
                        </h4>

                        <button
                          onClick={() => {
                            playClickSound();
                            speakKorean(lesson.contentKo);
                          }}
                          className="flex items-center gap-1 text-xs text-sky-600 font-bold bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Nghe đọc</span>
                        </button>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div className="text-base font-black text-slate-900 font-sans tracking-wide">
                          {lesson.contentKo}
                        </div>
                        <div className="text-xs font-mono font-medium text-sky-600 mt-0.5">
                          {lesson.romanization}
                        </div>
                        <div className="text-xs font-bold text-amber-900 mt-1">
                          {lesson.meaningVi}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {lesson.explanation}
                      </p>
                    </div>
                  ))}

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        playClickSound();
                        setActiveStageTab('quiz');
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs sm:text-sm shadow-md shadow-sky-200 transition-all cursor-pointer"
                    >
                      <span>Bắt đầu bài kiểm tra 15 câu</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* CHECKPOINT QUIZ VIEW */
                <div>
                  {quizFinished ? (
                    <div className="text-center py-6 space-y-4">
                      <div className="text-5xl">
                        {correctAnswersCount >= Math.ceil(selectedStage.checkpointQuiz.length * 0.65)
                          ? '🎉'
                          : '💪'}
                      </div>
                      <h4 className="text-xl font-black text-slate-800">
                        {correctAnswersCount >= Math.ceil(selectedStage.checkpointQuiz.length * 0.65)
                          ? 'Xuất Sắc! Bạn Đã Vượt Qua Chặng Học!'
                          : 'Cố Gắng Lên! Hãy Ôn Lại Và Thử Lại Nhé!'}
                      </h4>
                      <p className="text-sm text-slate-600 max-w-md mx-auto">
                        Bạn đã trả lời đúng {correctAnswersCount} / {selectedStage.checkpointQuiz.length} câu hỏi.
                        {correctAnswersCount >= Math.ceil(selectedStage.checkpointQuiz.length * 0.65)
                          ? ` Chúc mừng bạn đã mở khóa chặng tiếp theo và nhận được +${selectedStage.xpReward} XP!`
                          : ' Cần đạt tối thiểu 10/15 câu đúng (≥65%) để mở khóa chặng tiếp theo.'}
                      </p>

                      {correctAnswersCount === selectedStage.checkpointQuiz.length && (
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black border border-amber-300">
                          <span>💯 Điểm Tuyệt Đối 15/15! Nhận danh hiệu Thánh Trắc Nghiệm!</span>
                        </div>
                      )}

                      <div className="flex items-center justify-center gap-3 pt-3">
                        <button
                          onClick={() => {
                            setCurrentQuizIndex(0);
                            setSelectedAnswer(null);
                            setIsAnswerSubmitted(false);
                            setCorrectAnswersCount(0);
                            setQuizFinished(false);
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Làm lại bài kiểm tra</span>
                        </button>
                        <button
                          onClick={() => setSelectedStage(null)}
                          className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-black shadow-xs transition-colors cursor-pointer"
                        >
                          Quay lại lộ trình
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Quiz Progress header */}
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>Câu hỏi {currentQuizIndex + 1} / {selectedStage.checkpointQuiz.length}</span>
                        <span className="text-emerald-600">Đúng: {correctAnswersCount} câu</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-300"
                          style={{
                            width: `${((currentQuizIndex + 1) / selectedStage.checkpointQuiz.length) * 100}%`,
                          }}
                        />
                      </div>

                      {/* Current Question */}
                      {(() => {
                        const q = selectedStage.checkpointQuiz[currentQuizIndex];
                        return (
                          <div className="space-y-4 pt-2">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                              <div className="flex items-start justify-between gap-3">
                                <h4 className="text-sm sm:text-base font-bold text-slate-800 leading-snug">
                                  {q.question}
                                </h4>
                                {q.audioKo && (
                                  <button
                                    onClick={() => {
                                      playClickSound();
                                      speakKorean(q.audioKo!);
                                    }}
                                    className="p-2 rounded-xl bg-sky-100 text-sky-700 hover:bg-sky-200 transition-colors shrink-0 cursor-pointer"
                                    title="Phát âm"
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Options */}
                            <div className="grid grid-cols-1 gap-2.5">
                              {q.options.map((opt, optIdx) => {
                                let btnStyle = 'border-slate-200 bg-white hover:border-sky-300 text-slate-800';
                                if (selectedAnswer === optIdx) {
                                  btnStyle = 'border-sky-500 bg-sky-50 text-sky-900 font-bold';
                                }
                                if (isAnswerSubmitted) {
                                  if (optIdx === q.correctIndex) {
                                    btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                                  } else if (selectedAnswer === optIdx) {
                                    btnStyle = 'border-rose-500 bg-rose-50 text-rose-900 font-bold';
                                  } else {
                                    btnStyle = 'border-slate-100 bg-slate-50 text-slate-400 opacity-60';
                                  }
                                }

                                return (
                                  <button
                                    key={optIdx}
                                    onClick={() => handleSelectAnswer(optIdx)}
                                    className={`p-3.5 rounded-2xl border-2 text-left text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold shrink-0">
                                        {String.fromCharCode(65 + optIdx)}
                                      </span>
                                      <span>{opt}</span>
                                    </div>
                                    {isAnswerSubmitted && optIdx === q.correctIndex && (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Explanation when submitted */}
                            {isAnswerSubmitted && (
                              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1 animate-fade-in">
                                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                                  <span>💡 Giải thích chi tiết:</span>
                                </div>
                                <p className="leading-relaxed">{q.explanation}</p>
                              </div>
                            )}

                            {/* Submit & Next Button */}
                            <div className="pt-2 flex justify-end">
                              {!isAnswerSubmitted ? (
                                <button
                                  onClick={handleSubmitAnswer}
                                  disabled={selectedAnswer === null}
                                  className="px-6 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs sm:text-sm shadow-md shadow-sky-200 transition-all cursor-pointer"
                                >
                                  Kiểm tra đáp án
                                </button>
                              ) : (
                                <button
                                  onClick={handleNextQuizQuestion}
                                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-200 transition-all cursor-pointer"
                                >
                                  <span>{currentQuizIndex < selectedStage.checkpointQuiz.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả'}</span>
                                  <ArrowRight className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
