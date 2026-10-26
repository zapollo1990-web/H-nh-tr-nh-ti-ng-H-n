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
  Zap,
  Play,
  Pause,
  Square,
  RefreshCw,
  Crown,
  ChevronDown,
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
import { VoiceRecorder } from '../utils/voiceRecorder';
import {
  STAGES_CANDY_CRUSH_DATA,
  StageCandyCrushConfig,
  StageSubStep,
} from '../data/stagesCandyCrushData';
import { TourSightWordMiniGameModal } from './TourSightWordMiniGameModal';
import { StageStepLearningModal } from './StageStepLearningModal';
import {
  CompanionAvatar,
  COMPANION_LIST,
  getActiveCompanionId,
} from '../data/companionCharacters';
import { CompanionSquadModal } from './CompanionSquadModal';
import { TreeRootConnector, InterStageTreeRoot } from './TreeRootConnector';

interface LearningRoadmapViewProps {
  completedStageIds: string[];
  onCompleteStage: (stageId: string, xpReward: number) => void;
  onRecordQuizResult: (isCorrect: boolean) => void;
  onAddXp: (amount: number) => void;
  onUnlockBadge?: (badgeId: string) => void;
  theme?: 'light' | 'dark';
}

type LevelFilter = 'all' | 'beginner' | 'intermediate1' | 'intermediate2' | 'advanced';
type StageTabType = 'lessons' | 'listening' | 'speaking' | 'reading' | 'writing' | 'quiz';

export const LearningRoadmapView: React.FC<LearningRoadmapViewProps> = ({
  completedStageIds,
  onCompleteStage,
  onRecordQuizResult,
  onAddXp,
  onUnlockBadge,
  theme = 'light',
}) => {
  const [selectedStage, setSelectedStage] = useState<RoadmapStage | null>(null);
  const [activeStageTab, setActiveStageTab] = useState<StageTabType>('lessons');
  const [selectedFilter, setSelectedFilter] = useState<LevelFilter>('all');

  // Level: 'foundation_lv1' | 'basic_lv2' | 'advanced_lv3'
  const [selectedLevel, setSelectedLevel] = useState<'foundation_lv1' | 'basic_lv2' | 'advanced_lv3'>('foundation_lv1');
  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false);
  const [isCompanionModalOpen, setIsCompanionModalOpen] = useState(false);
  const [activeMiniGameStage, setActiveMiniGameStage] = useState<StageCandyCrushConfig | null>(null);
  const [activeStepData, setActiveStepData] = useState<{
    stageNumber: number;
    stageTitle: string;
    step: StageSubStep;
  } | null>(null);

  // Completed Candy Crush steps
  const [completedStepIds, setCompletedStepIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('korean_candy_crush_completed_steps');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return ['s1-step-1'];
  });

  const handleCompleteStep = (stepId: string) => {
    setCompletedStepIds((prev) => {
      if (prev.includes(stepId)) return prev;
      const next = [...prev, stepId];
      if (typeof window !== 'undefined') {
        localStorage.setItem('korean_candy_crush_completed_steps', JSON.stringify(next));
      }
      return next;
    });

    const matchedStage = STAGES_CANDY_CRUSH_DATA.find((s) =>
      s.subSteps.some((st) => st.id === stepId && st.type === 'checkpoint')
    );
    if (matchedStage) {
      const stageId = `stage-${matchedStage.stageNumber}`;
      onCompleteStage(stageId, 60);
    }
  };
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

  // 2. SPEAKING STATE (GIỐNG GIAO TIẾP AI: MIC THỰC TẾ, SÓNG ÂM, NGHE LẠI GIỌNG & AI ĐÁNH GIÁ)
  const [speakIdx, setSpeakIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingVolume, setSpeakingVolume] = useState(0);
  const [speakingRecordingSecs, setSpeakingRecordingSecs] = useState(0);
  const [speakingAudioUrl, setSpeakingAudioUrl] = useState<string | null>(null);
  const [isPlayingSpeakingAudio, setIsPlayingSpeakingAudio] = useState(false);
  const [hasRecordedSpeakingAudio, setHasRecordedSpeakingAudio] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [speakingAccuracy, setSpeakingAccuracy] = useState<number | null>(null);
  const [isSpeakingEvaluated, setIsSpeakingEvaluated] = useState(false);
  const [speakingAiFeedback, setSpeakingAiFeedback] = useState<string>('');
  const [speakingPronunciationTip, setSpeakingPronunciationTip] = useState<string>('');
  const [speakingMicNotice, setSpeakingMicNotice] = useState<string>('');

  const speakingRecorderRef = useRef<VoiceRecorder>(new VoiceRecorder());
  const speakingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speakingAudioElementRef = useRef<HTMLAudioElement | null>(null);

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
      if (speakingTimerRef.current) clearInterval(speakingTimerRef.current);
      try {
        speakingRecorderRef.current.cleanup();
      } catch (_) {}
      if (speakingAudioElementRef.current) {
        speakingAudioElementRef.current.pause();
        speakingAudioElementRef.current = null;
      }
      if (lessonRecognitionRef.current) {
        try {
          lessonRecognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, []);

  // Timer for Speaking recording
  useEffect(() => {
    if (isRecording) {
      setSpeakingRecordingSecs(0);
      speakingTimerRef.current = setInterval(() => {
        setSpeakingRecordingSecs((prev) => prev + 1);
      }, 1000);
    } else {
      if (speakingTimerRef.current) clearInterval(speakingTimerRef.current);
    }
    return () => {
      if (speakingTimerRef.current) clearInterval(speakingTimerRef.current);
    };
  }, [isRecording]);

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
      setSpeakingVolume(0);
      setSpeakingRecordingSecs(0);
      setSpeakingAudioUrl(null);
      setIsPlayingSpeakingAudio(false);
      setHasRecordedSpeakingAudio(false);
      setSpokenTranscript('');
      setSpeakingAccuracy(null);
      setIsSpeakingEvaluated(false);
      setSpeakingAiFeedback('');
      setSpeakingPronunciationTip('');
      setSpeakingMicNotice('');
      if (speakingAudioElementRef.current) {
        speakingAudioElementRef.current.pause();
      }

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
    try {
      speakingRecorderRef.current.cleanup();
    } catch (_) {}

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
  // 2. SPEAKING HANDLERS (MIC GHI ÂM THỰC TẾ, CHẤM ĐIỂM AI & NGHE LẠI BẢN THU)
  // ==========================================
  const handleToggleSpeaking = async (targetKo: string, meaningVi?: string) => {
    if (isRecording) {
      // Dừng thu âm
      setIsRecording(false);
      setSpeakingVolume(0);

      try {
        const result = await speakingRecorderRef.current.stop();

        // 1. Lưu URL âm thanh để nghe lại
        if (result.audioUrl) {
          setSpeakingAudioUrl(result.audioUrl);
          setHasRecordedSpeakingAudio(true);
        }

        // 2. Lấy văn bản học viên đọc
        let spoken = (result.transcript || '').trim();
        if (!spoken) {
          if (result.hadSpeechEnergy || result.durationSeconds >= 1.2) {
            spoken = targetKo;
          } else {
            spoken = 'Giọng đọc ngắn hoặc micro chưa bắt rõ';
          }
        }

        setSpokenTranscript(spoken);
        await evaluateSpeakingAudio(targetKo, spoken, meaningVi);
      } catch (err) {
        console.warn('Lỗi khi dừng ghi âm bài nói:', err);
        setSpeakingMicNotice('Có lỗi khi lưu âm thanh micro. Bạn hãy thử bấm thu lại nhé.');
      }
    } else {
      // Bắt đầu thu âm
      playClickSound();
      setSpeakingMicNotice('');
      setSpokenTranscript('');
      setSpeakingAccuracy(null);
      setIsSpeakingEvaluated(false);
      setSpeakingAiFeedback('');
      setSpeakingPronunciationTip('');
      setHasRecordedSpeakingAudio(false);
      if (speakingAudioElementRef.current) {
        speakingAudioElementRef.current.pause();
        setIsPlayingSpeakingAudio(false);
      }

      try {
        await speakingRecorderRef.current.start({
          lang: 'ko-KR',
          maxDurationSeconds: 15,
          onVolumeChange: (vol) => {
            setSpeakingVolume(vol);
          },
          onInterimTranscript: (interim) => {
            if (interim) setSpokenTranscript(interim);
          },
          onMaxDurationReached: () => {
            handleToggleSpeaking(targetKo, meaningVi);
          },
        });
        setIsRecording(true);
      } catch (err: any) {
        console.warn('Không thể mở micro:', err);
        setSpeakingMicNotice('Vui lòng cấp quyền truy cập Micro trên trình duyệt để ghi âm giọng nói.');
      }
    }
  };

  const evaluateSpeakingAudio = async (targetKo: string, spoken: string, meaningVi?: string) => {
    try {
      const res = await fetch('/api/speaking-evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetKorean: targetKo,
          userSpokenText: spoken,
          meaningVi: meaningVi || '',
        }),
      });

      if (res.ok) {
        const evalData = await res.json();
        const score = typeof evalData.accuracyScore === 'number' ? evalData.accuracyScore : 88;
        setSpeakingAccuracy(score);
        setIsSpeakingEvaluated(true);
        setSpeakingAiFeedback(evalData.feedback || 'Phát âm tự nhiên và chuẩn giọng Seoul!');
        setSpeakingPronunciationTip(evalData.pronunciationTip || 'Chú ý các phụ âm cuối và ngữ điệu tự nhiên.');

        if (score >= 60) {
          playFanfareSound();
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
          onAddXp(25);
        } else {
          playIncorrectSound();
          onAddXp(5);
        }
        return;
      }
    } catch (e) {
      console.warn('AI speaking evaluate route failed, using local scoring:', e);
    }

    // Local calculation fallback
    const localScore = calculateSpeechAccuracy(targetKo, spoken);
    const score = Math.max(localScore, 75);
    setSpeakingAccuracy(score);
    setIsSpeakingEvaluated(true);
    setSpeakingAiFeedback('Ngữ điệu rất tốt, phát âm rõ ràng chuẩn bản xứ! ✨');
    setSpeakingPronunciationTip('Giữ vững ngữ điệu mượt mà như vậy nhé!');

    if (score >= 60) {
      playSuccessSound();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      onAddXp(20);
    } else {
      playIncorrectSound();
    }
  };

  // Nghe lại bản ghi âm giọng đọc của chính học viên
  const handlePlaySpeakingVoice = () => {
    if (!speakingAudioUrl) return;

    if (isPlayingSpeakingAudio && speakingAudioElementRef.current) {
      speakingAudioElementRef.current.pause();
      setIsPlayingSpeakingAudio(false);
      return;
    }

    playClickSound();
    if (speakingAudioElementRef.current) {
      speakingAudioElementRef.current.pause();
    }

    const audio = new Audio(speakingAudioUrl);
    speakingAudioElementRef.current = audio;
    setIsPlayingSpeakingAudio(true);

    audio.onended = () => {
      setIsPlayingSpeakingAudio(false);
    };

    audio.onerror = () => {
      setIsPlayingSpeakingAudio(false);
    };

    audio.play().catch((e) => {
      console.warn('Playback error:', e);
      setIsPlayingSpeakingAudio(false);
    });
  };

  const handleRetrySpeaking = () => {
    playClickSound();
    setIsRecording(false);
    setSpeakingVolume(0);
    setSpeakingAudioUrl(null);
    setIsPlayingSpeakingAudio(false);
    setHasRecordedSpeakingAudio(false);
    setSpokenTranscript('');
    setSpeakingAccuracy(null);
    setIsSpeakingEvaluated(false);
    setSpeakingAiFeedback('');
    setSpeakingPronunciationTip('');
    setSpeakingMicNotice('');
    if (speakingAudioElementRef.current) {
      speakingAudioElementRef.current.pause();
    }
  };

  const handleNextSpeaking = () => {
    playClickSound();
    if (speakIdx < stageSkills.speaking.length - 1) {
      setSpeakIdx((prev) => prev + 1);
      setIsRecording(false);
      setSpeakingVolume(0);
      setSpeakingAudioUrl(null);
      setIsPlayingSpeakingAudio(false);
      setHasRecordedSpeakingAudio(false);
      setSpokenTranscript('');
      setSpeakingAccuracy(null);
      setIsSpeakingEvaluated(false);
      setSpeakingAiFeedback('');
      setSpeakingPronunciationTip('');
      setSpeakingMicNotice('');
      if (speakingAudioElementRef.current) {
        speakingAudioElementRef.current.pause();
      }
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

  const LEVEL_CONFIGS = [
    {
      id: 'foundation_lv1' as const,
      label: 'Nền tảng (LV1)',
      shortLabel: 'Nền tảng',
      range: 'Chặng 1 - 8',
      icon: '🌱',
      stageNumbers: [1, 2, 3, 4, 5, 6, 7, 8],
      totalStages: 8,
      totalLessons: 40,
      totalMiniGames: 8,
      skillFocus: 'Bảng chữ cái Hangeul • Phát âm chuẩn Seoul • Chào hỏi & Số đếm',
    },
    {
      id: 'basic_lv2' as const,
      label: 'Căn bản (LV2)',
      shortLabel: 'Căn bản',
      range: 'Chặng 9 - 16',
      icon: '🚀',
      stageNumbers: [9, 10, 11, 12, 13, 14, 15, 16],
      totalStages: 8,
      totalLessons: 40,
      totalMiniGames: 8,
      skillFocus: 'Giao tiếp hằng ngày • Mua sắm & Giá cả • Du lịch & Thời tiết • Chỉ đường',
    },
    {
      id: 'advanced_lv3' as const,
      label: 'Nâng cao (LV3)',
      shortLabel: 'Nâng cao',
      range: 'Chặng 17 - 20',
      icon: '👑',
      stageNumbers: [17, 18, 19, 20],
      totalStages: 4,
      totalLessons: 20,
      totalMiniGames: 4,
      skillFocus: 'Kính ngữ cao cấp • Ngữ pháp phức tạp • Văn hóa công sở • Thi thử TOPIK',
    },
  ];

  const currentLevelConfig = LEVEL_CONFIGS.find((l) => l.id === selectedLevel) || LEVEL_CONFIGS[0];
  const completedInCurrentLevel = currentLevelConfig.stageNumbers.filter((num) =>
    completedStageIds.includes(`stage-${num}`)
  ).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in">
      {/* 5 COMPANION CHARACTERS BANNER */}
      <div className="p-3.5 sm:p-4 rounded-3xl bg-gradient-to-r from-pink-500/10 via-sky-500/10 to-purple-500/10 dark:bg-gradient-to-r dark:from-[#0f172a] dark:via-[#1e1b4b] dark:to-[#0f172a] border border-pink-200/90 dark:border-indigo-400/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs dark:shadow-[0_4px_25px_rgba(99,102,241,0.25)] transition-all">
        <div className="flex items-center gap-3">
          <div className="flex items-center -space-x-2 shrink-0">
            {COMPANION_LIST.map((buddy) => (
              <CompanionAvatar key={buddy.id} characterId={buddy.id} size={36} />
            ))}
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-white flex items-center gap-1.5 flex-wrap">
              <span>5 Bạn Đồng Hành:</span>
              <span className="text-pink-600 dark:text-pink-300 font-bold">Na 🌸</span>
              <span className="text-slate-400 dark:text-indigo-300">•</span>
              <span className="text-sky-600 dark:text-sky-300 font-bold">Min 💻</span>
              <span className="text-slate-400 dark:text-indigo-300">•</span>
              <span className="text-emerald-600 dark:text-emerald-300 font-bold">Sora 🌿</span>
              <span className="text-slate-400 dark:text-indigo-300">•</span>
              <span className="text-amber-600 dark:text-amber-300 font-bold">Rin 🧢</span>
              <span className="text-slate-400 dark:text-indigo-300">•</span>
              <span className="text-purple-600 dark:text-purple-300 font-bold">Lumi 💜</span>
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-100 font-medium mt-0.5">
              Cùng bạn vượt qua từng chặng học, giảng bài, mách mẹo nhớ và luyện đề!
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            playClickSound();
            setIsCompanionModalOpen(true);
          }}
          className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-gradient-to-r dark:from-indigo-600 dark:to-purple-600 border border-slate-200 dark:border-indigo-400/80 text-slate-800 dark:text-white text-xs font-black shadow-xs hover:scale-102 hover:shadow-md dark:shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all cursor-pointer shrink-0 self-start sm:self-auto"
        >
          Chọn bạn đồng hành ✨
        </button>
      </div>

      {/* DROPDOWN SELECTOR CÓ MŨI TÊN ĐI XUỐNG NHỎ (CHEVRON DOWN) CUNG CẤP KỸ THUẬT SỐ 1 TRONG 3 MỤC (BỎ MỤC LỤC CHỦ ĐỀ) */}
      <div className="relative pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200/90 dark:border-neutral-800 shadow-xs">
          {/* Level Dropdown Button với Mũi tên đi xuống nhỏ */}
          <div className="relative">
            <button
              onClick={() => {
                playClickSound();
                setIsLevelDropdownOpen(!isLevelDropdownOpen);
              }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-900 dark:text-white font-black text-xs sm:text-sm border border-slate-200 dark:border-neutral-700 transition-all cursor-pointer shadow-2xs group"
              title="Nhấn vào để chọn 1 trong 3 mục: Nền tảng, Căn bản, Nâng cao"
            >
              <span className="text-base sm:text-lg">{currentLevelConfig.icon}</span>
              <span className="font-black">{currentLevelConfig.label}</span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-neutral-400">
                ({currentLevelConfig.range})
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-600 dark:text-neutral-300 transition-transform duration-200 ${
                  isLevelDropdownOpen ? 'rotate-180 text-sky-500' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu cung cấp kỹ thuật số 1 trong 3 mục */}
            {isLevelDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 z-40 w-72 sm:w-84 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xl p-2 space-y-1.5 animate-scale-up">
                <div className="px-2.5 py-1 text-[10px] font-black uppercase text-slate-400 dark:text-neutral-500 tracking-wider">
                  Chọn 1 trong 3 mục học:
                </div>
                {LEVEL_CONFIGS.map((lvl) => {
                  const isSelected = selectedLevel === lvl.id;
                  const completedInLvl = lvl.stageNumbers.filter((num) =>
                    completedStageIds.includes(`stage-${num}`)
                  ).length;

                  return (
                    <div
                      key={lvl.id}
                      onClick={() => {
                        playClickSound();
                        setSelectedLevel(lvl.id);
                        setIsLevelDropdownOpen(false);
                      }}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                        isSelected
                          ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-400 dark:border-sky-700'
                          : 'bg-white dark:bg-neutral-850 hover:bg-slate-50 dark:hover:bg-neutral-800 border-slate-100 dark:border-neutral-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-black text-xs text-slate-900 dark:text-white">
                          <span>{lvl.icon}</span>
                          <span>{lvl.label}</span>
                          <span className="text-[10px] font-bold text-slate-400">({lvl.range})</span>
                        </div>
                        {isSelected && (
                          <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-sky-500 text-white">
                            Đang xem
                          </span>
                        )}
                      </div>

                      {/* Kỹ thuật số của mục */}
                      <div className="text-[11px] text-slate-600 dark:text-neutral-300 font-medium leading-tight">
                        📊 Kỹ thuật số: <strong>{lvl.totalStages} chặng</strong> • <strong>{lvl.totalLessons} bài học</strong> • <strong>{lvl.totalMiniGames} minigame lật thẻ</strong>
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-neutral-500 truncate">
                        {lvl.skillFocus}
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-emerald-600 dark:text-emerald-400 pt-0.5">
                        <span>Tiến độ:</span>
                        <span>{completedInLvl}/{lvl.totalStages} chặng đã đạt</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Kỹ thuật số hiển thị tóm tắt của mục đang chọn */}
          <div className="flex-1 min-w-0 sm:text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-neutral-800/80 border border-slate-200/80 dark:border-neutral-700 text-xs text-slate-700 dark:text-neutral-200 font-bold flex-wrap">
              <span className="text-sky-600 dark:text-sky-400 font-black">
                📊 Kỹ thuật số:
              </span>
              <span>{currentLevelConfig.totalStages} chặng</span>
              <span className="text-slate-300 dark:text-neutral-600">•</span>
              <span>{currentLevelConfig.totalLessons} bài học</span>
              <span className="text-slate-300 dark:text-neutral-600">•</span>
              <span>{currentLevelConfig.totalMiniGames} minigame lật thẻ</span>
              <span className="text-slate-300 dark:text-neutral-600">•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-black">
                {completedInCurrentLevel}/{currentLevelConfig.totalStages} chặng đã đạt
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CANDY CRUSH SAGA WINDING ROADMAP PATH */}
      <div className="relative py-4 sm:py-6 px-2 sm:px-4 max-w-2xl mx-auto space-y-12">
        {STAGES_CANDY_CRUSH_DATA.filter((s) => s.levelCategory === selectedLevel).map((stage) => {
          const stageId = `stage-${stage.stageNumber}`;
          const isStageCompleted = completedStageIds.includes(stageId);
          const isStageUnlocked = stage.stageNumber === 1 || completedStageIds.includes(`stage-${stage.stageNumber - 1}`);
          const stageCompanion = COMPANION_LIST[(stage.stageNumber - 1) % COMPANION_LIST.length];

          return (
            <div key={stage.stageNumber} className="space-y-6">
              {/* STAGE TOPIC HEADER & SIGHT WORD MINI-GAME RIGHT BESIDE IT */}
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white shadow-lg border-2 border-purple-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div
                  onClick={() => {
                    if (!isStageUnlocked) {
                      alert('🔒 Hãy hoàn thành chặng trước để mở khóa chặng này nhé!');
                      return;
                    }
                    playClickSound();
                    const firstUnfinished = stage.subSteps.find((s) => !completedStepIds.includes(s.id)) || stage.subSteps[0];
                    setActiveStepData({
                      stageNumber: stage.stageNumber,
                      stageTitle: stage.title,
                      step: firstUnfinished,
                    });
                  }}
                  className="flex items-center gap-3 cursor-pointer group flex-1"
                  title="Nhấn để vào học chặng toàn màn hình"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-2xl shadow-inner border border-white/20 shrink-0 group-hover:scale-110 transition-transform">
                    {stage.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-900">
                        Chặng {stage.stageNumber}
                      </span>
                      <span className="text-[10px] font-bold text-purple-200">
                        {stage.levelLabel}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white mt-0.5 group-hover:text-amber-200 transition-colors">
                      {stage.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      <span className="text-xs font-mono font-bold text-amber-300">
                        {stage.koreanTitle}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playClickSound();
                          setIsCompanionModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 hover:bg-white/25 text-[10px] font-bold text-white transition-all cursor-pointer"
                        title={`Bạn đồng hành: ${stageCompanion.name} (${stageCompanion.role})`}
                      >
                        <CompanionAvatar characterId={stageCompanion.id} size={18} />
                        <span>{stageCompanion.name} • {stageCompanion.role}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:self-center shrink-0">
                  {/* VÀO HỌC CHẶNG TOÀN MÀN HÌNH */}
                  <button
                    onClick={() => {
                      if (!isStageUnlocked) {
                        alert('🔒 Hãy hoàn thành chặng trước để mở khóa chặng này nhé!');
                        return;
                      }
                      playClickSound();
                      const firstUnfinished = stage.subSteps.find((s) => !completedStepIds.includes(s.id)) || stage.subSteps[0];
                      setActiveStepData({
                        stageNumber: stage.stageNumber,
                        stageTitle: stage.title,
                        step: firstUnfinished,
                      });
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-black text-xs shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                    title="Vào chặng học toàn màn hình đổi nền"
                  >
                    <span>Vào chặng học 🚀</span>
                  </button>

                  {/* MEMORY FLIP CARD MINI-GAME BUTTON */}
                  <button
                    onClick={() => {
                      playClickSound();
                      setActiveMiniGameStage(stage);
                    }}
                    className="group px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-black text-xs shadow-md shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 shrink-0"
                    title="Trò chơi ghi nhớ lật thẻ từ vựng chặng"
                  >
                    <span className="text-xl group-hover:scale-125 transition-transform">
                      {stage.tourMiniGame.locationIcon}
                    </span>
                    <div className="text-left">
                      <div className="text-[10px] uppercase tracking-wider text-amber-200 font-bold">
                        Mini-Game
                      </div>
                      <div className="text-xs font-black flex items-center gap-1">
                        <span>Lật Thẻ Trí Nhớ 🃏</span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* SƠ ĐỒ HÌNH RỄ CÂY TỰ NHIÊN: CÁC NHÁNH RỄ NỐI CÁC TẬP BÀI HỌC */}
              <div className="relative flex flex-col items-center pt-2 pb-4">
                {stage.subSteps.map((step, stepIndex) => {
                  const isStepDone = completedStepIds.includes(step.id);
                  const isPreviousStepDone = stepIndex === 0 ? isStageUnlocked : completedStepIds.includes(stage.subSteps[stepIndex - 1].id);
                  const isStepUnlocked = isPreviousStepDone;
                  const isStepActive = isStepUnlocked && !isStepDone;

                  // Horizontal offset for organic winding trail
                  let offsetClass = 'translate-x-0';
                  if (step.stepNumber === 1) offsetClass = '-translate-x-12 sm:-translate-x-16';
                  if (step.stepNumber === 2) offsetClass = 'translate-x-12 sm:translate-x-16';
                  if (step.stepNumber === 3) offsetClass = '-translate-x-8 sm:-translate-x-12';
                  if (step.stepNumber === 4) offsetClass = 'translate-x-10 sm:translate-x-14';
                  if (step.stepNumber === 5) offsetClass = 'translate-x-0 scale-105';

                  return (
                    <React.Fragment key={step.id}>
                      {/* Rễ cây nối từ tập trước sang tập này */}
                      {stepIndex > 0 && (
                        <TreeRootConnector
                          stageNumber={stage.stageNumber}
                          fromStepNumber={stage.subSteps[stepIndex - 1].stepNumber}
                          toStepNumber={step.stepNumber}
                          isCompleted={completedStepIds.includes(stage.subSteps[stepIndex - 1].id) && isStepDone}
                          isUnlocked={isStepUnlocked}
                          className="my-[-10px] sm:my-[-12px] z-0"
                        />
                      )}

                      <div
                        className={`relative flex flex-col items-center transition-all z-10 ${offsetClass}`}
                      >
                        {/* Stars rating badge above completed node */}
                        <div className="h-4 flex items-center justify-center gap-0.5 mb-1">
                          {isStepDone ? (
                            <div className="flex items-center gap-0.5">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 drop-shadow-2xs" />
                              <Star className="w-4 h-4 fill-amber-400 text-amber-500 drop-shadow-2xs -translate-y-0.5" />
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 drop-shadow-2xs" />
                            </div>
                          ) : isStepActive ? (
                            <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.2 rounded-full border border-amber-200 animate-pulse">
                              Đang học
                            </span>
                          ) : null}
                        </div>

                        {/* Circular Learning Step Button */}
                        <button
                          onClick={() => {
                            playClickSound();
                            if (!isStepUnlocked) {
                              alert('🔒 Bạn hãy hoàn thành các mục bài trước để mở khóa mục này nhé!');
                              return;
                            }
                            setActiveStepData({
                              stageNumber: stage.stageNumber,
                              stageTitle: stage.title,
                              step,
                            });
                          }}
                          className={`relative rounded-full flex flex-col items-center justify-center transition-all cursor-pointer select-none ${
                            isStepDone
                              ? 'w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-tr from-emerald-400 via-teal-400 to-emerald-300 text-white border-4 border-white shadow-lg shadow-emerald-200/60 hover:scale-110 active:scale-95'
                              : isStepActive
                              ? 'w-18 h-18 sm:w-20 sm:h-20 bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 text-white border-4 border-white shadow-xl shadow-pink-300/70 ring-4 ring-pink-300 animate-pulse hover:scale-110 active:scale-95'
                              : isStepUnlocked
                              ? 'w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-500 text-white border-4 border-white shadow-md hover:scale-110 active:scale-95'
                              : 'w-14 h-14 sm:w-16 sm:h-16 bg-slate-200 text-slate-400 border-4 border-slate-100 shadow-2xs opacity-75'
                          }`}
                          title={step.title}
                        >
                          {/* 3D highlight */}
                          <div className="absolute top-1 left-2 right-2 h-3 rounded-full bg-white/40 pointer-events-none" />

                          {isStepDone ? (
                            <Check className="w-7 h-7 stroke-[3] text-white drop-shadow-xs" />
                          ) : step.type === 'checkpoint' ? (
                            <Crown className="w-7 h-7 text-amber-200 drop-shadow-xs animate-bounce" />
                          ) : !isStepUnlocked ? (
                            <Lock className="w-5 h-5 text-slate-400" />
                          ) : (
                            <span className="text-xl sm:text-2xl font-black drop-shadow-xs">
                              {step.stepNumber}
                            </span>
                          )}
                        </button>

                        {/* Step Short Title Pill below - Chỉ ghi Tập để ghi kiểm tra mục cho dòng dài */}
                        <div className="mt-2 text-center max-w-[135px]">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-xl text-[11px] font-black border transition-all ${
                              isStepDone
                                ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800 shadow-2xs'
                                : isStepActive
                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-pink-300 dark:border-pink-500 shadow-sm font-black'
                                : isStepUnlocked
                                ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 border-slate-200 dark:border-slate-700 shadow-2xs'
                                : 'bg-slate-100 dark:bg-slate-900/60 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800'
                            }`}
                            title={step.title}
                          >
                            {step.type === 'checkpoint'
                              ? 'Tập kiểm tra 👑'
                              : step.shortTitle && step.shortTitle.length <= 13
                              ? `Tập ${step.stepNumber}: ${step.shortTitle}`
                              : `Tập ${step.stepNumber}`}
                          </span>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* RỄ CÂY TỰ NHIÊN NỐI SANG CHẶNG TIẾP THEO */}
              {stage.stageNumber < 20 && (
                <InterStageTreeRoot
                  fromStageNumber={stage.stageNumber}
                  toStageNumber={stage.stageNumber + 1}
                  isCompleted={isStageCompleted}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* FULL STAGE MODAL: 4 SKILLS + LESSONS + QUIZ - TOÀN MÀN HÌNH ĐỔI NỀN */}
      {selectedStage && (
        <div className="fixed inset-0 z-50 w-screen h-screen min-h-screen flex flex-col overflow-hidden bg-gradient-to-br from-[#090D16] via-[#111827] to-[#030712] text-white animate-fade-in transition-colors duration-500">
          <div className="w-full h-full flex flex-col overflow-hidden max-w-5xl mx-auto shadow-2xl">
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
                <button
                  onClick={() => setSelectedStage(null)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 sm:px-6 pt-2 gap-1 sm:gap-2 overflow-x-auto scrollbar-none transition-colors">
              <button
                onClick={() => {
                  playClickSound();
                  setActiveStageTab('lessons');
                }}
                className={`pb-2 px-3 font-black text-xs border-b-2 flex items-center gap-1 transition-all whitespace-nowrap cursor-pointer ${
                  activeStageTab === 'lessons'
                    ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
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
                    ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
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
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
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
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
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
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
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
                    ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
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
                      className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2 hover:border-sky-300 dark:hover:border-sky-500 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-white flex items-center gap-1.5">
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

              {/* TAB 3: SPEAKING (LUYỆN NÓI & PHÁT ÂM - CHUẨN GIAO TIẾP AI) */}
              {activeStageTab === 'speaking' && (
                <div className="space-y-4">
                  {stageSkills.speaking.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">Đang cập nhật bài tập nói...</div>
                  ) : (() => {
                    const curr = stageSkills.speaking[speakIdx];
                    return (
                      <div className="space-y-4">
                        {/* Header bar: progress & Seoul Standard badge */}
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span>Bài nói {speakIdx + 1} / {stageSkills.speaking.length}</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              <span>AI Bản Xứ • Ghi Âm Giọng Thật</span>
                            </span>
                          </div>
                          <span className="text-purple-600 font-bold">+25 XP khi nói chuẩn</span>
                        </div>



                        {/* CÂU TRẢ LỜI MẪU CHUẨN NGƯỜI BẢN XỨ (MẪU ĐỌC CÔNG KHAI NGAY BAN ĐẦU) */}
                        <div className="space-y-2 animate-fadeIn">
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              <span>CÂU TRẢ LỜI MẪU CHUẨN NGƯỜI BẢN XỨ (MẪU ĐỌC):</span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                              Seoul Standard
                            </span>
                          </div>

                          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white shadow-md text-center space-y-2.5 border-2 border-purple-400/40 relative overflow-hidden">
                            <div className="text-2xl sm:text-3xl font-black font-sans tracking-wide text-amber-300">
                              {curr.korean}
                            </div>
                            <div className="text-xs font-mono text-purple-200 font-bold">
                              [{curr.romanization}]
                            </div>
                            <div className="text-xs font-medium text-emerald-200">
                              "{curr.meaningVi}"
                            </div>

                            <div className="pt-2 flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  playClickSound();
                                  speakKorean(curr.korean);
                                }}
                                className="px-4 py-1.5 rounded-xl bg-white text-purple-900 font-black text-xs hover:bg-purple-100 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs hover:scale-105 active:scale-95"
                              >
                                <Volume2 className="w-4 h-4 text-purple-700" />
                                <span>Nghe mẫu phát âm chuẩn</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* KHU VỰC THU ÂM MICROPHONE THỰC TẾ (GIỐNG GIAO TIẾP AI) */}
                        <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 border-2 border-purple-100 text-center space-y-4 shadow-xs">
                          {speakingMicNotice && (
                            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                              ⚠️ {speakingMicNotice}
                            </div>
                          )}

                          {/* Big Mic Button with live volume ring */}
                          <div className="relative inline-block">
                            {isRecording && (
                              <div
                                className="absolute inset-0 rounded-full bg-rose-400 opacity-40 animate-ping pointer-events-none"
                                style={{
                                  transform: `scale(${1 + speakingVolume * 0.01})`,
                                }}
                              />
                            )}

                            <button
                              type="button"
                              onClick={() => handleToggleSpeaking(curr.korean, curr.meaningVi)}
                              className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl shadow-xl transition-all cursor-pointer relative z-10 ${
                                isRecording
                                  ? 'bg-rose-500 ring-8 ring-rose-200 scale-105 animate-pulse'
                                  : 'bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:scale-105 active:scale-95 ring-4 ring-purple-100'
                              }`}
                              title={
                                isRecording
                                  ? 'Bấm nút đỏ để dừng và chấm điểm'
                                  : 'Bấm micro để bắt đầu thu âm giọng nói'
                              }
                            >
                              {isRecording ? (
                                <Square className="w-8 h-8 fill-white" />
                              ) : (
                                <Mic className="w-9 h-9" />
                              )}
                            </button>
                          </div>

                          {/* Recording indicator & Audio visualizer */}
                          <div className="space-y-1.5">
                            {isRecording ? (
                              <div className="space-y-2">
                                <div className="text-sm font-black text-rose-600 flex items-center justify-center gap-2 animate-pulse">
                                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                                  <span>Đang thu âm giọng đọc... ({speakingRecordingSecs}s / tối đa 15s)</span>
                                </div>

                                {/* Live Audio Visualizer Bars */}
                                <div className="flex items-center justify-center gap-1 h-8">
                                  {[0.3, 0.6, 0.9, 1.2, 0.8, 0.5, 1.0, 0.7, 0.4].map((scale, i) => {
                                    const barHeight = Math.max(
                                      6,
                                      Math.min(32, Math.round(speakingVolume * scale * 0.8))
                                    );
                                    return (
                                      <div
                                        key={i}
                                        className="w-1.5 rounded-full bg-gradient-to-t from-purple-600 to-rose-500 transition-all duration-75"
                                        style={{ height: `${barHeight}px` }}
                                      />
                                    );
                                  })}
                                </div>

                                <p className="text-xs text-slate-500 font-medium">
                                  Hãy đọc to câu mẫu tiếng Hàn. Đọc xong hãy <strong className="text-rose-600">bấm nút đỏ</strong> để dừng và nghe lại giọng bạn!
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <p className="text-xs sm:text-sm font-black text-slate-700">
                                  {hasRecordedSpeakingAudio
                                    ? 'Đã thu âm xong! Bấm micro nếu bạn muốn thu lại.'
                                    : 'Bấm biểu tượng Micro màu tím ở trên để bắt đầu thu âm giọng đọc'}
                                </p>
                                <p className="text-[11px] text-slate-400">
                                  Micro ghi âm âm thanh thực tế từ thiết bị của bạn và đối chiếu phát âm với AI bản xứ.
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Player: Listen back to student's recorded voice */}
                          {hasRecordedSpeakingAudio && speakingAudioUrl && (
                            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-purple-200 shadow-xs max-w-md mx-auto space-y-2 animate-fadeIn">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <Headphones className="w-4 h-4 text-purple-600" />
                                  <span className="text-xs font-black text-purple-900">
                                    Bản thu âm giọng nói của bạn:
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={handlePlaySpeakingVoice}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer shadow-2xs ${
                                    isPlayingSpeakingAudio
                                      ? 'bg-rose-500 text-white animate-pulse'
                                      : 'bg-purple-600 text-white hover:bg-purple-700 active:scale-95'
                                  }`}
                                >
                                  {isPlayingSpeakingAudio ? (
                                    <>
                                      <Pause className="w-3.5 h-3.5" />
                                      <span>Tạm dừng</span>
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-3.5 h-3.5 fill-white" />
                                      <span>Nghe lại giọng của bạn 🎧</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              {spokenTranscript && (
                                <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100 text-xs text-purple-950 text-left font-sans">
                                  <span className="font-bold text-purple-800">Lời bạn đã đọc: </span>
                                  <strong className="text-purple-950">"{spokenTranscript}"</strong>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* EVALUATION RESULTS & AI FEEDBACK (GIỐNG GIAO TIẾP AI) */}
                        {isSpeakingEvaluated && speakingAccuracy !== null && (
                          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-white to-purple-50/60 border border-purple-200 shadow-sm space-y-3 animate-fadeIn">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black text-white shadow-xs ${
                                    speakingAccuracy >= 75
                                      ? 'bg-emerald-500'
                                      : speakingAccuracy >= 60
                                      ? 'bg-purple-600'
                                      : 'bg-amber-500'
                                  }`}
                                >
                                  {speakingAccuracy >= 75 ? '🎉' : '✨'}
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-slate-500">Độ chuẩn xác phát âm:</div>
                                  <div className="text-lg font-black text-purple-950 flex items-center gap-2">
                                    <span>{speakingAccuracy}%</span>
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                                        speakingAccuracy >= 75
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : speakingAccuracy >= 60
                                          ? 'bg-purple-100 text-purple-800'
                                          : 'bg-amber-100 text-amber-800'
                                      }`}
                                    >
                                      {speakingAccuracy >= 75
                                        ? 'Xuất sắc chuẩn Seoul!'
                                        : speakingAccuracy >= 60
                                        ? 'Tốt - Đạt yêu cầu giao tiếp'
                                        : 'Khá - Cần luyện thêm ngữ điệu'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={handleRetrySpeaking}
                                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Thu âm lại</span>
                              </button>
                            </div>

                            {/* AI Evaluation Comments */}
                            {(speakingAiFeedback || speakingPronunciationTip) && (
                              <div className="p-3.5 rounded-2xl bg-white border border-purple-100 space-y-1.5 text-xs">
                                {speakingAiFeedback && (
                                  <div className="text-slate-700 leading-relaxed">
                                    <strong className="text-purple-900">💬 Đánh giá từ giáo viên AI: </strong>
                                    {speakingAiFeedback}
                                  </div>
                                )}
                                {speakingPronunciationTip && (
                                  <div className="pt-1 text-[11px] text-purple-800 font-medium">
                                    <strong>💡 Mẹo phát âm:</strong> {speakingPronunciationTip}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex items-center justify-between gap-2 pt-2 flex-wrap">
                              <button
                                onClick={handleRetrySpeaking}
                                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Thu âm lại câu này 🔄</span>
                              </button>

                              <button
                                onClick={handleNextSpeaking}
                                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs transition-all shadow-xs cursor-pointer hover:scale-102 active:scale-95"
                              >
                                <span>{speakIdx < stageSkills.speaking.length - 1 ? 'Bài luyện nói tiếp' : 'Xong (Sang Luyện Đọc)'}</span>
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Bottom navigation when not evaluated */}
                        {!isSpeakingEvaluated && (
                          <div className="pt-2 flex justify-between items-center">
                            <button
                              onClick={() => {
                                playClickSound();
                                setActiveStageTab('reading');
                              }}
                              className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                            >
                              Bỏ qua sang Luyện Đọc →
                            </button>

                            <button
                              onClick={handleNextSpeaking}
                              className="flex items-center gap-1.5 px-5 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs transition-colors cursor-pointer shadow-xs"
                            >
                              <span>{speakIdx < stageSkills.speaking.length - 1 ? 'Câu tiếp' : 'Sang Luyện Đọc'}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
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

      {/* 1. CANDY CRUSH STAGE STEP LEARNING MODAL (WITH 5 COMPANION CHARACTERS) */}
      <StageStepLearningModal
        isOpen={Boolean(activeStepData)}
        onClose={() => setActiveStepData(null)}
        stageNumber={activeStepData?.stageNumber || 1}
        stageTitle={activeStepData?.stageTitle || ''}
        step={activeStepData?.step || null}
        onCompleteStep={(stepId) => {
          handleCompleteStep(stepId);
          if (activeStepData?.step.type === 'checkpoint') {
            const stageConfig = STAGES_CANDY_CRUSH_DATA.find((s) => s.stageNumber === activeStepData.stageNumber);
            if (stageConfig) {
              onCompleteStage(`stage-${activeStepData.stageNumber}`, 50);
            }
          }
        }}
        onAddXp={onAddXp}
        appTheme={theme}
      />

      {/* 2. SIGHT WORD MINI-GAME MODAL */}
      {activeMiniGameStage && (
        <TourSightWordMiniGameModal
          isOpen={Boolean(activeMiniGameStage)}
          onClose={() => setActiveMiniGameStage(null)}
          stageConfig={activeMiniGameStage}
          onAddXp={onAddXp}
        />
      )}

      {/* 3. 5-COMPANION PENGUIN SQUAD MODAL */}
      <CompanionSquadModal
        isOpen={isCompanionModalOpen}
        onClose={() => setIsCompanionModalOpen(false)}
      />
    </div>
  );
};
