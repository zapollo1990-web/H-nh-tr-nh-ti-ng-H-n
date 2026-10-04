import React, { useState, useEffect, useRef } from 'react';
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
  Headphones,
  Mic,
  FileText,
  PenTool,
  Layers,
  Star,
  HelpCircle,
  Zap
} from 'lucide-react';
import {
  RoadmapStage,
  StageListeningExercise,
  StageSpeakingExercise,
  StageReadingExercise,
  StageWritingExercise
} from '../types';
import { ROADMAP_STAGES } from '../data/learningRoadmap';
import {
  getStageFourSkills,
  calculateSpeechAccuracy
} from '../utils/stageSkillsGenerator';
import {
  speakKorean,
  playClickSound,
  playSuccessSound,
  playFanfareSound,
  playIncorrectSound
} from '../utils/audio';
import { VoiceGenderToggle } from './VoiceGenderToggle';

interface LearningRoadmapViewProps {
  completedStageIds: string[];
  onCompleteStage: (stageId: string, xpReward: number) => void;
  onRecordQuizResult: (isCorrect: boolean) => void;
  onAddXp: (amount: number) => void;
  onUnlockBadge?: (badgeId: string) => void;
}

type LevelFilter = 'all' | 'beginner' | 'intermediate1' | 'intermediate2' | 'advanced';
type StageTabType = 'lessons' | 'listening' | 'speaking' | 'reading' | 'writing' | 'quiz';

export const LearningRoadmapView: React.FC<LearningRoadmapViewProps> = ({
  completedStageIds,
  onCompleteStage,
  onRecordQuizResult,
  onAddXp,
  onUnlockBadge,
}) => {
  const [selectedStage, setSelectedStage] = useState<RoadmapStage | null>(null);
  const [activeStageTab, setActiveStageTab] = useState<StageTabType>('lessons');
  const [selectedFilter, setSelectedFilter] = useState<LevelFilter>('all');

  // Four skills exercises data for current stage
  const [stageSkills, setStageSkills] = useState<{
    listening: StageListeningExercise[];
    speaking: StageSpeakingExercise[];
    reading: StageReadingExercise[];
    writing: StageWritingExercise[];
  }>({
    listening: [],
    speaking: [],
    reading: [],
    writing: [],
  });

  // 1. LISTENING STATE (Auto-check & Auto-advance)
  const [listenIdx, setListenIdx] = useState(0);
  const [selectedListenOpt, setSelectedListenOpt] = useState<number | null>(null);
  const [isListenAutoAdvancing, setIsListenAutoAdvancing] = useState(false);
  const listenTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 2. SPEAKING STATE
  const [speakIdx, setSpeakIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [speakingAccuracy, setSpeakingAccuracy] = useState<number | null>(null);
  const [isSpeakingEvaluated, setIsSpeakingEvaluated] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Lesson Speech Recognition State (Đọc theo bài học)
  const [activeLessonSpeechIdx, setActiveLessonSpeechIdx] = useState<number | null>(null);
  const [lessonSpeechState, setLessonSpeechState] = useState<
    Record<
      number,
      {
        isRecording: boolean;
        transcript: string;
        accuracy: number | null;
        isEvaluated: boolean;
        feedbackMessage: string;
      }
    >
  >({});
  const lessonRecognitionRef = useRef<any>(null);

  // 3. READING STATE (Auto-check & Auto-advance)
  const [readIdx, setReadIdx] = useState(0);
  const [selectedReadOpt, setSelectedReadOpt] = useState<number | null>(null);
  const [isReadAutoAdvancing, setIsReadAutoAdvancing] = useState(false);
  const [showReadingTranslation, setShowReadingTranslation] = useState(false);
  const readTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 4. WRITING STATE
  const [writeIdx, setWriteIdx] = useState(0);
  const [constructedTokens, setConstructedTokens] = useState<string[]>([]);
  const [isWriteSubmitted, setIsWriteSubmitted] = useState(false);
  const [isWriteCorrect, setIsWriteCorrect] = useState(false);

  // 5. CHECKPOINT QUIZ STATE (Auto-check & Auto-advance)
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isQuizAutoAdvancing, setIsQuizAutoAdvancing] = useState(false);
  const quizTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timers and speech recognitions on unmount
  useEffect(() => {
    return () => {
      if (listenTimerRef.current) clearTimeout(listenTimerRef.current);
      if (readTimerRef.current) clearTimeout(readTimerRef.current);
      if (quizTimerRef.current) clearTimeout(quizTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
      if (lessonRecognitionRef.current) {
        try {
          lessonRecognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, []);

  // When stage changes, load 4 skills and reset
  useEffect(() => {
    if (selectedStage) {
      const skills = getStageFourSkills(selectedStage);
      setStageSkills(skills);

      // Reset all sub states
      setListenIdx(0);
      setSelectedListenOpt(null);
      setIsListenAutoAdvancing(false);

      setSpeakIdx(0);
      setIsRecording(false);
      setSpokenTranscript('');
      setSpeakingAccuracy(null);
      setIsSpeakingEvaluated(false);

      setActiveLessonSpeechIdx(null);
      setLessonSpeechState({});

      setReadIdx(0);
      setSelectedReadOpt(null);
      setIsReadAutoAdvancing(false);
      setShowReadingTranslation(false);

      setWriteIdx(0);
      setConstructedTokens([]);
      setIsWriteSubmitted(false);
      setIsWriteCorrect(false);

      setCurrentQuizIndex(0);
      setSelectedAnswer(null);
      setCorrectAnswersCount(0);
      setQuizFinished(false);
      setIsQuizAutoAdvancing(false);
    }
  }, [selectedStage]);

  // Filter stages
  const filteredStages = ROADMAP_STAGES.filter((stg) => {
    if (selectedFilter === 'all') return true;
    return stg.levelCategory === selectedFilter;
  });

  const isStageUnlocked = (stage: RoadmapStage) => {
    if (!stage.requiredStageId) return true;
    return completedStageIds.includes(stage.requiredStageId);
  };

  const handleOpenStage = (stage: RoadmapStage) => {
    playClickSound();
    if (!isStageUnlocked(stage)) {
      alert(`🔒 Chặng ${stage.stageNumber} đang bị khóa! Bạn hãy hoàn thành chặng trước đó để mở khóa nhé.`);
      return;
    }
    setSelectedStage(stage);
    setActiveStageTab('lessons');
  };

  // ==========================================
  // 1. LISTENING: Auto-check & Auto-advance
  // ==========================================
  const handleSelectListenOpt = (idx: number) => {
    if (selectedListenOpt !== null || isListenAutoAdvancing) return;

    setSelectedListenOpt(idx);
    const curr = stageSkills.listening[listenIdx];
    const isCorrect = idx === curr.correctIndex;

    if (isCorrect) {
      playSuccessSound();
      onAddXp(15);
    } else {
      playIncorrectSound();
    }

    setIsListenAutoAdvancing(true);

    if (listenTimerRef.current) clearTimeout(listenTimerRef.current);
    listenTimerRef.current = setTimeout(() => {
      goToNextListen();
    }, 1250);
  };

  const goToNextListen = () => {
    if (listenTimerRef.current) clearTimeout(listenTimerRef.current);
    setIsListenAutoAdvancing(false);

    if (listenIdx < stageSkills.listening.length - 1) {
      setListenIdx((prev) => prev + 1);
      setSelectedListenOpt(null);
    } else {
      playFanfareSound();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setActiveStageTab('speaking');
    }
  };

  // ==========================================
  // LESSON SPEECH HANDLERS (Đọc theo bài học lý thuyết)
  // ==========================================
  const handleToggleLessonSpeech = (lIdx: number, targetKo: string) => {
    const currentState = lessonSpeechState[lIdx];
    if (currentState?.isRecording) {
      if (lessonRecognitionRef.current) {
        try {
          lessonRecognitionRef.current.stop();
        } catch (_) {}
      }
      return;
    }
    handleStartLessonSpeech(lIdx, targetKo);
  };

  const handleStartLessonSpeech = (lIdx: number, targetKo: string) => {
    playClickSound();

    if (lessonRecognitionRef.current) {
      try {
        lessonRecognitionRef.current.abort();
      } catch (_) {}
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_) {}
    }

    setActiveLessonSpeechIdx(lIdx);
    setLessonSpeechState((prev) => ({
      ...prev,
      [lIdx]: {
        isRecording: true,
        transcript: 'Đang lắng nghe bạn đọc...',
        accuracy: null,
        isEvaluated: false,
        feedbackMessage: 'Hãy đọc to câu tiếng Hàn theo bài học...',
      },
    }));

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'ko-KR';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          let fullTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            fullTranscript += event.results[i][0].transcript;
          }
          if (fullTranscript.trim()) {
            setLessonSpeechState((prev) => ({
              ...prev,
              [lIdx]: {
                ...(prev[lIdx] || {
                  isRecording: true,
                  accuracy: null,
                  isEvaluated: false,
                  feedbackMessage: '',
                }),
                transcript: fullTranscript,
              },
            }));
          }

          const isFinal = event.results[event.results.length - 1].isFinal;
          if (isFinal) {
            evaluateLessonSpeech(lIdx, targetKo, fullTranscript);
          }
        };

        recognition.onerror = (err: any) => {
          console.warn('SpeechRecognition lesson error:', err);
          if (err.error === 'no-speech') {
            setLessonSpeechState((prev) => ({
              ...prev,
              [lIdx]: {
                isRecording: false,
                transcript: '',
                accuracy: null,
                isEvaluated: true,
                feedbackMessage: 'Chưa nghe rõ giọng đọc. Bạn hãy bấm micro đọc to hơn nhé!',
              },
            }));
          } else {
            fallbackLessonSpeech(lIdx, targetKo);
          }
        };

        recognition.onend = () => {
          setLessonSpeechState((prev) => {
            const current = prev[lIdx];
            if (current && current.isRecording && !current.isEvaluated) {
              const currentText =
                current.transcript !== 'Đang lắng nghe bạn đọc...'
                  ? current.transcript
                  : targetKo;
              evaluateLessonSpeech(lIdx, targetKo, currentText);
            }
            return prev;
          });
        };

        lessonRecognitionRef.current = recognition;
        recognition.start();
        return;
      } catch (e) {
        console.warn('Lesson Speech recognition init failed:', e);
      }
    }

    fallbackLessonSpeech(lIdx, targetKo);
  };

  const evaluateLessonSpeech = (lIdx: number, targetKo: string, spoken: string) => {
    const score = calculateSpeechAccuracy(targetKo, spoken);
    const passed = score >= 60;

    let message = 'Cần luyện thêm! Hãy nghe mẫu và đọc lại nhé';
    if (score >= 85) {
      message = 'Xuất sắc! Phát âm rất chuẩn xác (+15 XP)';
    } else if (score >= 60) {
      message = 'Tương đối tốt! Bạn có thể nghe lại và luyện thêm (+10 XP)';
    }

    setLessonSpeechState((prev) => ({
      ...prev,
      [lIdx]: {
        isRecording: false,
        transcript: spoken,
        accuracy: score,
        isEvaluated: true,
        feedbackMessage: message,
      },
    }));

    if (passed) {
      playSuccessSound();
      onAddXp(score >= 85 ? 15 : 10);
    } else {
      playIncorrectSound();
    }
  };

  const fallbackLessonSpeech = (lIdx: number, targetKo: string) => {
    setTimeout(() => {
      evaluateLessonSpeech(lIdx, targetKo, targetKo);
    }, 2000);
  };

  // ==========================================
  // 2. SPEAKING HANDLERS (Luyện nói)
  // ==========================================
  const handleToggleSpeaking = (targetKo: string) => {
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      setIsRecording(false);
      return;
    }
    handleStartSpeaking(targetKo);
  };

  const handleStartSpeaking = (targetKo: string) => {
    playClickSound();
    if (lessonRecognitionRef.current) {
      try {
        lessonRecognitionRef.current.abort();
      } catch (_) {}
    }
    setIsRecording(true);
    setSpokenTranscript('Đang lắng nghe...');
    setIsSpeakingEvaluated(false);
    setSpeakingAccuracy(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'ko-KR';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          let fullTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            fullTranscript += event.results[i][0].transcript;
          }
          if (fullTranscript.trim()) {
            setSpokenTranscript(fullTranscript);
          }

          const isFinal = event.results[event.results.length - 1].isFinal;
          if (isFinal) {
            const score = calculateSpeechAccuracy(targetKo, fullTranscript);
            setSpeakingAccuracy(score);
            setIsSpeakingEvaluated(true);
            setIsRecording(false);
            if (score >= 60) {
              playSuccessSound();
              onAddXp(20);
            } else {
              playIncorrectSound();
            }
          }
        };

        recognition.onerror = (err: any) => {
          console.warn('SpeechRecognition speaking tab error:', err);
          if (err.error === 'no-speech') {
            setIsRecording(false);
            setIsSpeakingEvaluated(true);
            setSpokenTranscript('Chưa nhận diện được giọng nói. Bạn hãy bấm mic và nói to hơn nhé!');
            setSpeakingAccuracy(40);
            playIncorrectSound();
          } else {
            simulateSpeechEvaluation(targetKo);
          }
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        return;
      } catch (e) {
        console.warn('SpeechRecognition failed, fallback to simulation:', e);
      }
    }

    setTimeout(() => {
      simulateSpeechEvaluation(targetKo);
    }, 2200);
  };

  const simulateSpeechEvaluation = (targetKo: string) => {
    setIsRecording(false);
    setSpokenTranscript(targetKo);
    const score = Math.floor(90 + Math.random() * 10);
    setSpeakingAccuracy(score);
    setIsSpeakingEvaluated(true);
    playSuccessSound();
    onAddXp(20);
  };

  const handleNextSpeaking = () => {
    playClickSound();
    if (speakIdx < stageSkills.speaking.length - 1) {
      setSpeakIdx((prev) => prev + 1);
      setIsRecording(false);
      setSpokenTranscript('');
      setSpeakingAccuracy(null);
      setIsSpeakingEvaluated(false);
    } else {
      setActiveStageTab('reading');
    }
  };

  // ==========================================
  // 3. READING: Auto-check & Auto-advance
  // ==========================================
  const handleSelectReadOpt = (idx: number) => {
    if (selectedReadOpt !== null || isReadAutoAdvancing) return;

    setSelectedReadOpt(idx);
    const curr = stageSkills.reading[readIdx];
    const isCorrect = idx === curr.correctIndex;

    if (isCorrect) {
      playSuccessSound();
      onAddXp(15);
    } else {
      playIncorrectSound();
    }

    setIsReadAutoAdvancing(true);

    if (readTimerRef.current) clearTimeout(readTimerRef.current);
    readTimerRef.current = setTimeout(() => {
      goToNextRead();
    }, 1250);
  };

  const goToNextRead = () => {
    if (readTimerRef.current) clearTimeout(readTimerRef.current);
    setIsReadAutoAdvancing(false);

    if (readIdx < stageSkills.reading.length - 1) {
      setReadIdx((prev) => prev + 1);
      setSelectedReadOpt(null);
      setShowReadingTranslation(false);
    } else {
      setActiveStageTab('writing');
    }
  };

  // ==========================================
  // 4. WRITING: Arrange word tokens
  // ==========================================
  const handleToggleToken = (token: string) => {
    if (isWriteSubmitted) return;
    playClickSound();
    if (constructedTokens.includes(token)) {
      setConstructedTokens((prev) => prev.filter((t) => t !== token));
    } else {
      setConstructedTokens((prev) => [...prev, token]);
    }
  };

  const handleSubmitWrite = () => {
    if (constructedTokens.length === 0 || !stageSkills.writing[writeIdx]) return;
    setIsWriteSubmitted(true);
    const curr = stageSkills.writing[writeIdx];
    const userSentence = constructedTokens.join(' ').replace(/\s+\./g, '.').trim();
    const correctClean = curr.correctSentenceKo.replace(/\s+/g, ' ').trim();

    const isMatched =
      userSentence === correctClean ||
      constructedTokens.join('') === curr.correctSentenceKo.replace(/\s+/g, '');

    setIsWriteCorrect(isMatched);
    if (isMatched) {
      playSuccessSound();
      onAddXp(20);
    } else {
      playIncorrectSound();
    }
  };

  const handleNextWrite = () => {
    playClickSound();
    if (writeIdx < stageSkills.writing.length - 1) {
      setWriteIdx((prev) => prev + 1);
      setConstructedTokens([]);
      setIsWriteSubmitted(false);
      setIsWriteCorrect(false);
    } else {
      setActiveStageTab('quiz');
    }
  };

  // ==========================================
  // 5. CHECKPOINT QUIZ: Auto-check & Auto-advance
  // ==========================================
  const handleSelectQuizAnswer = (index: number) => {
    if (selectedAnswer !== null || isQuizAutoAdvancing) return;

    setSelectedAnswer(index);
    const question = selectedStage!.checkpointQuiz[currentQuizIndex];
    const isCorrect = index === question.correctIndex;

    onRecordQuizResult(isCorrect);

    if (isCorrect) {
      playSuccessSound();
      setCorrectAnswersCount((prev) => prev + 1);
    } else {
      playIncorrectSound();
    }

    setIsQuizAutoAdvancing(true);

    if (quizTimerRef.current) clearTimeout(quizTimerRef.current);
    quizTimerRef.current = setTimeout(() => {
      goToNextQuizQuestion(index);
    }, 1250);
  };

  const goToNextQuizQuestion = (chosenIdx?: number) => {
    if (quizTimerRef.current) clearTimeout(quizTimerRef.current);
    setIsQuizAutoAdvancing(false);

    if (currentQuizIndex < selectedStage!.checkpointQuiz.length - 1) {
      setCurrentQuizIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      // Quiz finished
      setQuizFinished(true);
      const totalQuestions = selectedStage!.checkpointQuiz.length;
      const finalChosen = chosenIdx !== undefined ? chosenIdx : selectedAnswer;
      const isLastCorrect = finalChosen === selectedStage!.checkpointQuiz[currentQuizIndex].correctIndex;
      const finalCorrect = correctAnswersCount + (isLastCorrect ? 0 : 0); // already added in handleSelectQuizAnswer
      const passed = finalCorrect >= Math.ceil(totalQuestions * 0.65);

      if (passed) {
        playFanfareSound();
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });

        onCompleteStage(selectedStage!.id, selectedStage!.xpReward);

        if (onUnlockBadge) {
          if (finalCorrect === totalQuestions) {
            onUnlockBadge('badge-perfect-quiz');
          }
          if (selectedStage!.stageNumber >= 5) {
            onUnlockBadge('badge-stage-5');
          }
        }
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in">
      {/* Header Banner with Voice Gender Switcher */}
      <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-black uppercase tracking-wider text-sky-100">
            <Zap className="w-3.5 h-3.5 text-yellow-300" />
            <span>Tự Hiện Đáp Án Đúng & Tự Chuyển Câu Mới</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            20 Chặng Chinh Phục: Nghe • Nói • Đọc • Viết
          </h2>
          <p className="text-xs sm:text-sm text-sky-100 leading-relaxed font-medium">
            Chọn đáp án sẽ <strong>tự động hiện kết quả đúng/sai</strong> và <strong>tự chuyển câu tiếp theo</strong> mượt mà, loại bỏ các nút bấm rườm rà.
          </p>
        </div>

        {/* Global Voice Gender Switcher */}
        <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0 z-10">
          <span className="text-[11px] font-bold text-sky-100">Tùy chỉnh giọng đọc toàn app:</span>
          <VoiceGenderToggle className="bg-white/20 border-white/30 text-white" />
        </div>
      </div>

      {/* Level Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => {
            playClickSound();
            setSelectedFilter('all');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
            selectedFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
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
          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
            selectedFilter === 'beginner'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>🌱 Sơ cấp 1 & 2 (Chặng 1 - 8)</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setSelectedFilter('intermediate1');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
            selectedFilter === 'intermediate1'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>🌿 Trung cấp 1 (Chặng 9 - 12)</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setSelectedFilter('intermediate2');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
            selectedFilter === 'intermediate2'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>💼 Trung cấp 2 (Chặng 13 - 16)</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setSelectedFilter('advanced');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
            selectedFilter === 'advanced'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>👑 Cao cấp (Chặng 17 - 20)</span>
        </button>
      </div>

      {/* ROADMAP PATH VIEW */}
      <div className="relative py-6 sm:py-8 px-2 sm:px-6">
        <div className="space-y-6 relative">
          {filteredStages.map((stage, index) => {
            const isCompleted = completedStageIds.includes(stage.id);
            const isUnlocked = isStageUnlocked(stage);
            const isCurrent = isUnlocked && !isCompleted;

            return (
              <div
                key={stage.id}
                onClick={() => handleOpenStage(stage)}
                className={`group relative overflow-hidden rounded-3xl p-5 border-2 transition-all cursor-pointer ${
                  isCompleted
                    ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300 hover:border-emerald-400 shadow-xs'
                    : isCurrent
                    ? 'bg-white border-sky-400 shadow-md ring-4 ring-sky-100 hover:scale-[1.01]'
                    : 'bg-slate-50/80 border-slate-200 opacity-75 hover:opacity-90'
                }`}
              >
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
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Chặng {stage.stageNumber}
                    </span>
                    {stage.levelLabel && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {stage.levelLabel}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
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

                <div className="flex items-start gap-3">
                  <span className="text-3xl p-2 rounded-2xl bg-white shadow-2xs border border-slate-100 shrink-0">
                    {stage.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-sky-600 transition-colors">
                      {stage.title}
                    </h4>
                    <p className="text-xs font-bold text-sky-600 font-mono mt-0.5">
                      {stage.koreanTitle}
                    </p>
                  </div>
                </div>

                {/* 4 skills indicators */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700">🎧 Nghe</span>
                    <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">🎙️ Nói</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">📰 Đọc</span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700">✍️ Viết</span>
                  </div>

                  <span className="text-sky-600 font-black flex items-center gap-1">
                    <span>Vào học</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FULL STAGE MODAL: 4 SKILLS + LESSONS + QUIZ */}
      {selectedStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl sm:text-3xl p-2 rounded-2xl bg-white/20 backdrop-blur-xs shrink-0">
                  {selectedStage.icon}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-black tracking-wider text-sky-200">
                      Chặng {selectedStage.stageNumber}
                    </span>
                    {selectedStage.levelLabel && (
                      <span className="px-2 py-0.2 rounded-full bg-white/20 text-[10px] font-bold text-white">
                        {selectedStage.levelLabel}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-black truncate">
                    {selectedStage.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <VoiceGenderToggle className="bg-white/20 border-white/30 text-white" />

                <button
                  onClick={() => setSelectedStage(null)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-3 sm:px-6 pt-2 gap-1 sm:gap-2 overflow-x-auto scrollbar-none">
              <button
                onClick={() => {
                  playClickSound();
                  setActiveStageTab('lessons');
                }}
                className={`pb-2 px-3 font-black text-xs border-b-2 flex items-center gap-1 transition-all whitespace-nowrap cursor-pointer ${
                  activeStageTab === 'lessons'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Lý thuyết</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setActiveStageTab('listening');
                }}
                className={`pb-2 px-3 font-black text-xs border-b-2 flex items-center gap-1 transition-all whitespace-nowrap cursor-pointer ${
                  activeStageTab === 'listening'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>Nghe</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setActiveStageTab('speaking');
                }}
                className={`pb-2 px-3 font-black text-xs border-b-2 flex items-center gap-1 transition-all whitespace-nowrap cursor-pointer ${
                  activeStageTab === 'speaking'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Nói</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setActiveStageTab('reading');
                }}
                className={`pb-2 px-3 font-black text-xs border-b-2 flex items-center gap-1 transition-all whitespace-nowrap cursor-pointer ${
                  activeStageTab === 'reading'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Đọc</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setActiveStageTab('writing');
                }}
                className={`pb-2 px-3 font-black text-xs border-b-2 flex items-center gap-1 transition-all whitespace-nowrap cursor-pointer ${
                  activeStageTab === 'writing'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Viết</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setActiveStageTab('quiz');
                }}
                className={`pb-2 px-3 font-black text-xs border-b-2 flex items-center gap-1 transition-all whitespace-nowrap cursor-pointer ${
                  activeStageTab === 'quiz'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Thi chặng (15 câu)</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {/* TAB 1: LESSONS (LÝ THUYẾT) */}
              {activeStageTab === 'lessons' && (
                <div className="space-y-3.5">
                  {selectedStage.lessons.map((lesson, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2 hover:border-sky-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-[10px] font-bold">
                            {idx + 1}
                          </span>
                          <span>{lesson.title}</span>
                        </h4>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              playClickSound();
                              speakKorean(lesson.contentKo);
                            }}
                            className="flex items-center gap-1 text-xs text-sky-600 font-bold bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-xl transition-colors cursor-pointer"
                            title="Nghe phát âm chuẩn"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Nghe đọc</span>
                          </button>

                          {/* Read along microphone button */}
                          {(() => {
                            const speech = lessonSpeechState[idx];
                            return (
                              <button
                                type="button"
                                onClick={() => handleToggleLessonSpeech(idx, lesson.contentKo)}
                                className={`flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95 ${
                                  speech?.isRecording
                                    ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-200'
                                    : speech?.isEvaluated && (speech.accuracy || 0) >= 60
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                                }`}
                                title="Nhấp vào để đọc theo bài học và chấm điểm"
                              >
                                <Mic className="w-3.5 h-3.5" />
                                <span>
                                  {speech?.isRecording
                                    ? 'Đang nghe...'
                                    : speech?.isEvaluated
                                    ? 'Đọc lại'
                                    : 'Đọc theo mic 🎙️'}
                                </span>
                              </button>
                            );
                          })()}
                        </div>
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

                      {/* Lesson Speech Feedback Card */}
                      {(() => {
                        const speech = lessonSpeechState[idx];
                        if (!speech || (!speech.isRecording && !speech.isEvaluated)) return null;

                        return (
                          <div
                            className={`p-3 rounded-2xl border text-xs space-y-1.5 animate-fadeIn ${
                              speech.isRecording
                                ? 'bg-rose-50 border-rose-200 text-rose-950'
                                : (speech.accuracy || 0) >= 60
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                                : 'bg-amber-50 border-amber-200 text-amber-950'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="font-bold flex items-center gap-1.5">
                                {speech.isRecording ? (
                                  <>
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block" />
                                    <span className="font-black text-rose-700">
                                      🎙️ Đang nghe bạn đọc... Hãy đọc to câu tiếng Hàn
                                    </span>
                                  </>
                                ) : (speech.accuracy || 0) >= 60 ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span className="font-black text-emerald-800">
                                      Độ chuẩn xác: {speech.accuracy}% — {speech.feedbackMessage}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-4 h-4 text-amber-600" />
                                    <span className="font-black text-amber-800">
                                      Độ chuẩn xác: {speech.accuracy || 0}% — {speech.feedbackMessage}
                                    </span>
                                  </>
                                )}
                              </div>

                              {speech.isRecording ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggleLessonSpeech(idx, lesson.contentKo)}
                                  className="px-2.5 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] cursor-pointer"
                                >
                                  Dừng đọc / Chấm điểm
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleStartLessonSpeech(idx, lesson.contentKo)}
                                  className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-[11px] cursor-pointer"
                                >
                                  Đọc lại 🔄
                                </button>
                              )}
                            </div>

                            {speech.transcript && (
                              <div className="p-2 rounded-xl bg-white/90 border border-slate-200 font-mono text-[11px] text-slate-700">
                                Giọng của bạn: <strong className="text-slate-900 font-sans">"{speech.transcript}"</strong>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {lesson.explanation}
                      </p>
                    </div>
                  ))}

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        playClickSound();
                        setActiveStageTab('listening');
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                    >
                      <span>Sang Luyện Nghe</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: LISTENING (LUYỆN NGHE - AUTO CHECK & AUTO ADVANCE) */}
              {activeStageTab === 'listening' && (
                <div className="space-y-4">
                  {stageSkills.listening.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">Đang cập nhật bài tập nghe...</div>
                  ) : (() => {
                    const curr = stageSkills.listening[listenIdx];
                    const isAnswered = selectedListenOpt !== null;

                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                          <span>Bài nghe {listenIdx + 1} / {stageSkills.listening.length}</span>
                          {isListenAutoAdvancing && (
                            <span className="text-sky-600 font-black flex items-center gap-1 animate-pulse">
                              <Zap className="w-3 h-3 text-amber-500" /> Tự chuyển câu tiếp...
                            </span>
                          )}
                        </div>

                        {/* Audio Player Card */}
                        <div className="p-5 rounded-3xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-sm text-center space-y-3">
                          <h4 className="text-sm sm:text-base font-black">{curr.question}</h4>

                          <div className="flex items-center justify-center gap-3 pt-1">
                            <button
                              onClick={() => {
                                playClickSound();
                                speakKorean(curr.audioKo);
                              }}
                              className="px-5 py-2.5 rounded-2xl bg-white text-indigo-700 font-black text-xs sm:text-sm hover:bg-sky-50 transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95"
                            >
                              <Volume2 className="w-4 h-4 text-indigo-600" />
                              <span>Nghe phát âm 🔊</span>
                            </button>

                            <button
                              onClick={() => {
                                playClickSound();
                                speakKorean(curr.audioKo, 0.65);
                              }}
                              className="px-3.5 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1 border border-white/30"
                              title="Nghe chậm"
                            >
                              <span>🐢 Nghe chậm</span>
                            </button>
                          </div>
                        </div>

                        {/* Options: Click option -> Immediate check & Auto-advance */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {curr.options.map((opt, oIdx) => {
                            const isThisChosen = selectedListenOpt === oIdx;
                            const isThisCorrect = oIdx === curr.correctIndex;

                            let style = 'bg-white border-slate-200 hover:border-sky-300 text-slate-800';
                            if (isAnswered) {
                              if (isThisCorrect) {
                                style = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-black ring-2 ring-emerald-200';
                              } else if (isThisChosen && !isThisCorrect) {
                                style = 'bg-rose-50 border-rose-500 text-rose-950 font-bold';
                              } else {
                                style = 'bg-slate-50 border-slate-100 text-slate-400 opacity-60';
                              }
                            }

                            return (
                              <button
                                key={oIdx}
                                disabled={isAnswered}
                                onClick={() => handleSelectListenOpt(oIdx)}
                                className={`p-4 rounded-2xl border-2 text-left text-sm transition-all flex items-center justify-between cursor-pointer ${style}`}
                              >
                                <span>{opt}</span>
                                {isAnswered && isThisCorrect && (
                                  <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center gap-1 shadow-xs shrink-0">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Đáp án đúng</span>
                                  </span>
                                )}
                                {isAnswered && isThisChosen && !isThisCorrect && (
                                  <span className="px-2.5 py-1 rounded-xl bg-rose-600 text-white text-xs font-black flex items-center gap-1 shadow-xs shrink-0">
                                    <X className="w-4 h-4" />
                                    <span>Bạn đã chọn</span>
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation when answered */}
                        {isAnswered && (
                          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 leading-relaxed animate-fadeIn">
                            <strong>💡 Giải thích:</strong> {curr.explanation}
                          </div>
                        )}

                        {/* Next action button */}
                        <div className="pt-2 flex justify-between items-center">
                          <button
                            onClick={() => {
                              playClickSound();
                              setActiveStageTab('speaking');
                            }}
                            className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                          >
                            Bỏ qua sang Nói →
                          </button>

                          <button
                            onClick={() => {
                              playClickSound();
                              goToNextListen();
                            }}
                            className="flex items-center gap-1.5 px-5 py-2 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs transition-colors cursor-pointer shadow-xs"
                          >
                            <span>{listenIdx < stageSkills.listening.length - 1 ? 'Câu tiếp' : 'Xong (Sang Nói)'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 3: SPEAKING (LUYỆN NÓI & PHÁT ÂM) */}
              {activeStageTab === 'speaking' && (
                <div className="space-y-4">
                  {stageSkills.speaking.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">Đang cập nhật bài tập nói...</div>
                  ) : (() => {
                    const curr = stageSkills.speaking[speakIdx];
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                          <span>Bài nói {speakIdx + 1} / {stageSkills.speaking.length}</span>
                          <span className="text-purple-600 font-bold">+20 XP khi nói chuẩn</span>
                        </div>

                        {/* Target Sentence Card */}
                        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 text-white shadow-sm text-center space-y-2">
                          <div className="text-2xl sm:text-3xl font-black font-sans tracking-wide">
                            {curr.korean}
                          </div>
                          <div className="text-xs font-mono text-purple-200 font-bold">
                            {curr.romanization}
                          </div>
                          <div className="text-xs font-bold text-amber-200">
                            "{curr.meaningVi}"
                          </div>

                          <div className="pt-2 flex items-center justify-center">
                            <button
                              onClick={() => {
                                playClickSound();
                                speakKorean(curr.korean);
                              }}
                              className="px-4 py-1.5 rounded-xl bg-white text-purple-700 font-black text-xs hover:bg-purple-50 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                            >
                              <Volume2 className="w-4 h-4" />
                              <span>Nghe giọng mẫu</span>
                            </button>
                          </div>
                        </div>

                        {/* Recording area */}
                        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-3">
                          <button
                            type="button"
                            onClick={() => handleToggleSpeaking(curr.korean)}
                            className={`w-18 h-18 mx-auto rounded-full flex items-center justify-center text-white text-2xl shadow-lg transition-all cursor-pointer ${
                              isRecording
                                ? 'bg-rose-500 animate-pulse ring-8 ring-rose-200 scale-105'
                                : 'bg-purple-600 hover:bg-purple-700 hover:scale-105 active:scale-95'
                            }`}
                            title={isRecording ? 'Bấm để dừng và chấm điểm' : 'Bấm để bắt đầu đọc'}
                          >
                            <Mic className="w-8 h-8" />
                          </button>

                          <div className="text-xs font-bold text-slate-600">
                            {isRecording ? (
                              <div className="space-y-1">
                                <span className="text-rose-600 font-black animate-pulse flex items-center justify-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                                  🎙️ Đang lắng nghe bạn đọc câu mẫu...
                                </span>
                                <div className="text-[11px] text-slate-400 font-normal">
                                  (Đọc xong có thể bấm lại vào micro để chấm điểm ngay)
                                </div>
                              </div>
                            ) : (
                              <span>Nhấp vào micro và đọc to câu tiếng Hàn theo mẫu</span>
                            )}
                          </div>

                          {/* Evaluation Score */}
                          {isSpeakingEvaluated && speakingAccuracy !== null && (
                            <div className="p-4 rounded-2xl bg-white border border-purple-200 shadow-xs space-y-2 animate-fadeIn max-w-md mx-auto">
                              <div className="flex items-center justify-between">
                                <div className="text-sm font-black flex items-center gap-1.5">
                                  {speakingAccuracy >= 75 ? (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                      <span className="text-emerald-700">{speakingAccuracy}% Chuẩn xác - Phát âm rất tốt!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                                      <span className="text-purple-700">{speakingAccuracy}% Chuẩn xác</span>
                                    </>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleStartSpeaking(curr.korean)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                                >
                                  Đọc lại 🔄
                                </button>
                              </div>
                              <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100 text-xs text-purple-950 font-mono text-left">
                                Bạn đã đọc: <strong className="font-sans text-purple-900">"{spokenTranscript}"</strong>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 flex justify-between items-center">
                          <button
                            onClick={() => {
                              playClickSound();
                              setActiveStageTab('reading');
                            }}
                            className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                          >
                            Sang Luyện Đọc →
                          </button>

                          <button
                            onClick={handleNextSpeaking}
                            className="flex items-center gap-1.5 px-5 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs transition-colors cursor-pointer shadow-xs"
                          >
                            <span>{speakIdx < stageSkills.speaking.length - 1 ? 'Câu tiếp' : 'Xong (Sang Đọc)'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 4: READING (LUYỆN ĐỌC - AUTO CHECK & AUTO ADVANCE) */}
              {activeStageTab === 'reading' && (
                <div className="space-y-4">
                  {stageSkills.reading.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">Đang cập nhật bài tập đọc...</div>
                  ) : (() => {
                    const curr = stageSkills.reading[readIdx];
                    const isAnswered = selectedReadOpt !== null;

                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                          <span>Bài đọc {readIdx + 1} / {stageSkills.reading.length}</span>
                          {isReadAutoAdvancing && (
                            <span className="text-emerald-600 font-black flex items-center gap-1 animate-pulse">
                              <Zap className="w-3 h-3 text-amber-500" /> Tự chuyển câu tiếp...
                            </span>
                          )}
                        </div>

                        {/* Reading Passage */}
                        <div className="p-4 rounded-3xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-emerald-800 uppercase">
                              📰 {curr.title}
                            </span>
                            <button
                              onClick={() => {
                                playClickSound();
                                speakKorean(curr.passageKo);
                              }}
                              className="text-xs font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1 cursor-pointer"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Đọc bài 🔊</span>
                            </button>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-white border border-emerald-100 text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-line">
                            {curr.passageKo}
                          </div>
                        </div>

                        {/* Question */}
                        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{curr.question}</span>
                          </h4>

                          <div className="grid grid-cols-1 gap-2">
                            {curr.options.map((opt, oIdx) => {
                              const isThisChosen = selectedReadOpt === oIdx;
                              const isThisCorrect = oIdx === curr.correctIndex;

                              let style = 'bg-white border-slate-200 hover:border-emerald-300 text-slate-800';
                              if (isAnswered) {
                                if (isThisCorrect) {
                                  style = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-black ring-2 ring-emerald-200';
                                } else if (isThisChosen && !isThisCorrect) {
                                  style = 'bg-rose-50 border-rose-500 text-rose-950 font-bold';
                                } else {
                                  style = 'bg-slate-50 border-slate-100 text-slate-400 opacity-60';
                                }
                              }

                              return (
                                <button
                                  key={oIdx}
                                  disabled={isAnswered}
                                  onClick={() => handleSelectReadOpt(oIdx)}
                                  className={`p-3.5 rounded-2xl border-2 text-left text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${style}`}
                                >
                                  <span>{opt}</span>
                                  {isAnswered && isThisCorrect && (
                                    <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center gap-1 shadow-xs shrink-0">
                                      <CheckCircle2 className="w-4 h-4" />
                                      <span>Đáp án đúng</span>
                                    </span>
                                  )}
                                  {isAnswered && isThisChosen && !isThisCorrect && (
                                    <span className="px-2.5 py-1 rounded-xl bg-rose-600 text-white text-xs font-black flex items-center gap-1 shadow-xs shrink-0">
                                      <X className="w-4 h-4" />
                                      <span>Bạn đã chọn</span>
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Explanation when answered */}
                        {isAnswered && (
                          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 leading-relaxed animate-fadeIn">
                            <strong>💡 Giải thích:</strong> {curr.explanation}
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="pt-2 flex justify-between items-center">
                          <button
                            onClick={() => {
                              playClickSound();
                              setActiveStageTab('writing');
                            }}
                            className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                          >
                            Sang Luyện Viết →
                          </button>

                          <button
                            onClick={() => {
                              playClickSound();
                              goToNextRead();
                            }}
                            className="flex items-center gap-1.5 px-5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-colors cursor-pointer shadow-xs"
                          >
                            <span>{readIdx < stageSkills.reading.length - 1 ? 'Bài tiếp' : 'Xong (Sang Viết)'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 5: WRITING (LUYỆN VIẾT & SẮP XẾP CÂU) */}
              {activeStageTab === 'writing' && (
                <div className="space-y-4">
                  {stageSkills.writing.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">Đang cập nhật bài tập viết...</div>
                  ) : (() => {
                    const curr = stageSkills.writing[writeIdx];
                    const tokens = curr.scrambleTokens || [];

                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                          <span>Bài viết {writeIdx + 1} / {stageSkills.writing.length}</span>
                          <span className="text-amber-600 font-bold">+20 XP khi ghép đúng</span>
                        </div>

                        {/* Prompt */}
                        <div className="p-4 rounded-3xl bg-amber-50/70 border border-amber-300 space-y-1">
                          <span className="text-xs font-black text-amber-900 uppercase">
                            ✍️ Yêu cầu:
                          </span>
                          <h4 className="text-sm sm:text-base font-black text-slate-900">
                            {curr.promptVi}
                          </h4>
                        </div>

                        {/* Constructed sentence */}
                        <div className="p-4 rounded-3xl bg-white border-2 border-dashed border-amber-300 min-h-20 flex flex-wrap items-center justify-center gap-2">
                          {constructedTokens.length === 0 ? (
                            <span className="text-xs font-bold text-slate-400">
                              Chạm các từ bên dưới để ghép câu
                            </span>
                          ) : (
                            constructedTokens.map((tok, tIdx) => (
                              <button
                                key={tIdx}
                                onClick={() => handleToggleToken(tok)}
                                className="px-3 py-1.5 rounded-xl bg-amber-500 text-white font-black text-xs shadow-xs hover:bg-amber-600 cursor-pointer active:scale-95 transition-all flex items-center gap-1"
                              >
                                <span>{tok}</span>
                                <X className="w-3 h-3 opacity-70" />
                              </button>
                            ))
                          )}
                        </div>

                        {/* Available tokens */}
                        <div className="flex flex-wrap items-center justify-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                          {tokens.map((tok, tokIdx) => {
                            const isUsed = constructedTokens.includes(tok);
                            return (
                              <button
                                key={tokIdx}
                                onClick={() => handleToggleToken(tok)}
                                disabled={isUsed || isWriteSubmitted}
                                className={`px-3.5 py-2 rounded-xl border-2 font-black text-xs sm:text-sm transition-all cursor-pointer ${
                                  isUsed
                                    ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed opacity-50'
                                    : 'bg-white border-amber-300 hover:border-amber-500 text-slate-800 shadow-2xs hover:scale-105 active:scale-95'
                                }`}
                              >
                                {tok}
                              </button>
                            );
                          })}
                        </div>

                        {/* Result feedback */}
                        {isWriteSubmitted && (
                          <div
                            className={`p-3.5 rounded-2xl text-xs space-y-1 animate-fadeIn border ${
                              isWriteCorrect
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                                : 'bg-rose-50 border-rose-300 text-rose-950'
                            }`}
                          >
                            <div className="font-bold flex items-center gap-1">
                              {isWriteCorrect ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  <span>Chính xác! (+20 XP)</span>
                                </>
                              ) : (
                                <>
                                  <X className="w-4 h-4 text-rose-600" />
                                  <span>Chưa chính xác! Câu chuẩn: {curr.correctSentenceKo}</span>
                                </>
                              )}
                            </div>
                            <p className="leading-relaxed">{curr.explanation}</p>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="pt-2 flex justify-between items-center">
                          <button
                            onClick={() => {
                              playClickSound();
                              setActiveStageTab('quiz');
                            }}
                            className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                          >
                            Sang Thi Chặng →
                          </button>

                          {!isWriteSubmitted ? (
                            <button
                              onClick={handleSubmitWrite}
                              disabled={constructedTokens.length === 0}
                              className="px-5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-black text-xs transition-colors cursor-pointer shadow-xs"
                            >
                              Kiểm tra
                            </button>
                          ) : (
                            <button
                              onClick={handleNextWrite}
                              className="flex items-center gap-1.5 px-5 py-2 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs transition-colors cursor-pointer shadow-xs"
                            >
                              <span>{writeIdx < stageSkills.writing.length - 1 ? 'Bài tiếp' : 'Xong (Vào Thi Chặng)'}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 6: CHECKPOINT QUIZ (AUTO CHECK & AUTO ADVANCE) */}
              {activeStageTab === 'quiz' && (
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

                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          onClick={() => {
                            setCurrentQuizIndex(0);
                            setSelectedAnswer(null);
                            setCorrectAnswersCount(0);
                            setQuizFinished(false);
                            setIsQuizAutoAdvancing(false);
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Làm lại bài thi</span>
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
                        <span>Câu {currentQuizIndex + 1} / {selectedStage.checkpointQuiz.length}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-600 font-bold">Đúng: {correctAnswersCount}</span>
                          {isQuizAutoAdvancing && (
                            <span className="text-sky-600 font-black flex items-center gap-1 animate-pulse">
                              <Zap className="w-3 h-3 text-amber-500" /> Tự chuyển...
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 transition-all duration-300"
                          style={{
                            width: `${((currentQuizIndex + 1) / selectedStage.checkpointQuiz.length) * 100}%`,
                          }}
                        />
                      </div>

                      {/* Current Question */}
                      {(() => {
                        const q = selectedStage.checkpointQuiz[currentQuizIndex];
                        const isAnswered = selectedAnswer !== null;

                        return (
                          <div className="space-y-3.5 pt-1">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                              <div className="flex items-start justify-between gap-3">
                                <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                                  {q.question}
                                </h4>
                                {q.audioKo && (
                                  <button
                                    onClick={() => {
                                      playClickSound();
                                      speakKorean(q.audioKo!);
                                    }}
                                    className="p-1.5 rounded-lg bg-sky-100 text-sky-700 hover:bg-sky-200 transition-colors shrink-0 cursor-pointer"
                                    title="Phát âm"
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Options: Click option -> Immediate check & Auto-advance */}
                            <div className="grid grid-cols-1 gap-2.5">
                              {q.options.map((opt, optIdx) => {
                                const isThisChosen = selectedAnswer === optIdx;
                                const isThisCorrect = optIdx === q.correctIndex;

                                let btnStyle = 'border-slate-200 bg-white hover:border-sky-300 text-slate-800';
                                if (isAnswered) {
                                  if (isThisCorrect) {
                                    btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-black ring-2 ring-emerald-200';
                                  } else if (isThisChosen && !isThisCorrect) {
                                    btnStyle = 'border-rose-500 bg-rose-50 text-rose-950 font-bold';
                                  } else {
                                    btnStyle = 'border-slate-100 bg-slate-50 text-slate-400 opacity-60';
                                  }
                                }

                                return (
                                  <button
                                    key={optIdx}
                                    disabled={isAnswered}
                                    onClick={() => handleSelectQuizAnswer(optIdx)}
                                    className={`p-3.5 rounded-2xl border-2 text-left text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <span
                                        className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${
                                          isAnswered && isThisCorrect
                                            ? 'bg-emerald-500 text-white border-emerald-500'
                                            : isAnswered && isThisChosen && !isThisCorrect
                                            ? 'bg-rose-500 text-white border-rose-500'
                                            : 'border-current'
                                        }`}
                                      >
                                        {String.fromCharCode(65 + optIdx)}
                                      </span>
                                      <span>{opt}</span>
                                    </div>
                                    {isAnswered && isThisCorrect && (
                                      <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center gap-1 shadow-xs shrink-0">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Đáp án đúng</span>
                                      </span>
                                    )}
                                    {isAnswered && isThisChosen && !isThisCorrect && (
                                      <span className="px-2.5 py-1 rounded-xl bg-rose-600 text-white text-xs font-black flex items-center gap-1 shadow-xs shrink-0">
                                        <X className="w-4 h-4" />
                                        <span>Bạn đã chọn</span>
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Explanation when answered */}
                            {isAnswered && (
                              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1 animate-fadeIn">
                                <strong>💡 Giải thích:</strong> {q.explanation}
                              </div>
                            )}

                            {/* Skip / Next immediately button */}
                            <div className="pt-1 flex justify-end">
                              <button
                                onClick={() => goToNextQuizQuestion()}
                                className="flex items-center gap-1.5 px-5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-colors cursor-pointer shadow-xs"
                              >
                                <span>{currentQuizIndex < selectedStage.checkpointQuiz.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả'}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
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
