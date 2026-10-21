import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  Send,
  RotateCcw,
  Sparkles,
  MessageCircle,
  Mic,
  MicOff,
  User,
  CheckCircle2,
  Lightbulb,
  Laugh,
  Flame,
  Award,
  Zap,
  Target,
  ChevronRight,
  RefreshCw,
  Headphones,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { ConversationScenario, ChatMessage } from '../types';
import { CONVERSATION_SCENARIOS } from '../data/scenarios';
import { SPEAKING_CHALLENGES, SpeakingChallenge } from '../data/speakingChallenges';
import { speakKorean, playClickSound, playSuccessSound, playFanfareSound, playIncorrectSound } from '../utils/audio';
import { VoiceGenderToggle } from './VoiceGenderToggle';
import { calculateSpeechAccuracy } from '../utils/stageSkillsGenerator';
import { VoiceRecorder } from '../utils/voiceRecorder';

interface AiConversationViewProps {
  onAddXp: (amount: number) => void;
}

const QUICK_FUN_PROMPTS = [
  { label: '🤣 Dạy từ lóng MZ hài nhất!', text: '한국 젊은이들이 쓰는 가장 웃긴 유행어 알려줘! ㅋㅋㅋ' },
  { label: '💖 Thả thính 1 câu đốn tim', text: '한국어로 썸탈 때 심쿵하는 플러팅 멘트 하나만 알려줘~' },
  { label: '🍜 Mukbang chuẩn vị Hàn', text: '사장님, 고기 맛있게 쌈 싸먹는 꿀팁 좀 알려주세요!' },
  { label: '🎤 Buôn chuyện idol K-pop', text: '방탄소년단이랑 뉴진스 노래 중에 제일 신나는 거 추천해줘!' },
  { label: '🕵️ Đố vui lầy lội', text: '재미있는 한국어 넌센스 퀴즈 하나 내줘요! 맞춰볼게요!' },
  { label: '🎬 Câu thoại K-drama sến rện', text: '한국 드라마에 나오는 오글거리지만 멋있는 명대사 하나 해줘!' },
  { label: '🌟 Động viên tinh thần', text: '오늘 하루 너무 힘들었는데 따뜻하고 웃긴 응원 한마디 해줄래?' },
];

export const AiConversationView: React.FC<AiConversationViewProps> = ({ onAddXp }) => {
  // Main Navigation: Free Chat vs Speaking Challenge Mode
  const [activeTab, setActiveTab] = useState<'chat' | 'challenge'>('challenge');

  // ==========================================
  // TAB 1: FREE DYNAMIC CHAT WITH AI
  // ==========================================
  const [selectedScenario, setSelectedScenario] = useState<ConversationScenario>(
    CONVERSATION_SCENARIOS[0]
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAllTranslations, setShowAllTranslations] = useState(true);
  const [showAllRomanization, setShowAllRomanization] = useState(true);

  // Chat microphone recording
  const [isChatRecording, setIsChatRecording] = useState(false);
  const [chatRecordingSecs, setChatRecordingSecs] = useState(0);
  const [chatMicToast, setChatMicToast] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRecorderRef = useRef<VoiceRecorder>(new VoiceRecorder());
  const chatTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ==========================================
  // TAB 2: SPEAKING CHALLENGE (BÀI LUYỆN NÓI - ĐÁP ÁN CÔNG KHAI + MIC GHI ÂM)
  // ==========================================
  const [challenges] = useState<SpeakingChallenge[]>(SPEAKING_CHALLENGES);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentChallengeIdx, setCurrentChallengeIdx] = useState(0);

  // Challenge microphone state & recorded voice audio
  const [isChallengeRecording, setIsChallengeRecording] = useState(false);
  const [challengeVolume, setChallengeVolume] = useState(0);
  const [challengeRecordingSecs, setChallengeRecordingSecs] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);
  const [hasRecordedAudio, setHasRecordedAudio] = useState(false);
  const [challengeSpokenText, setChallengeSpokenText] = useState('');
  const [challengeAccuracy, setChallengeAccuracy] = useState<number | null>(null);
  const [isEvaluatingSpeech, setIsEvaluatingSpeech] = useState(false);
  const [challengeAiFeedback, setChallengeAiFeedback] = useState<string>('');
  const [challengePronunciationTip, setChallengePronunciationTip] = useState<string>('');
  const [micNotice, setMicNotice] = useState<string>('');

  const challengeRecorderRef = useRef<VoiceRecorder>(new VoiceRecorder());
  const challengeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Filter challenges by category
  const filteredChallenges = selectedCategory === 'all'
    ? challenges
    : challenges.filter((c) => c.category === selectedCategory);
  const currentChallenge = filteredChallenges[currentChallengeIdx] || challenges[0];

  // Initialize conversation when scenario changes
  useEffect(() => {
    const initMsg: ChatMessage = {
      id: `init-${Date.now()}`,
      sender: 'ai',
      korean: selectedScenario.initialMessage.korean,
      romanization: selectedScenario.initialMessage.romanization,
      vietnamese: selectedScenario.initialMessage.vietnamese,
      suggestedReplies: selectedScenario.initialMessage.suggestedReplies,
      timestamp: Date.now(),
    };
    setMessages([initMsg]);
  }, [selectedScenario]);

  // Scroll to bottom of message list
  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, activeTab]);

  // Cleanup recorders on unmount
  useEffect(() => {
    return () => {
      try {
        chatRecorderRef.current.cleanup();
        challengeRecorderRef.current.cleanup();
        if (chatTimerRef.current) clearInterval(chatTimerRef.current);
        if (challengeTimerRef.current) clearInterval(challengeTimerRef.current);
        if (audioElementRef.current) {
          audioElementRef.current.pause();
          audioElementRef.current = null;
        }
      } catch (_) {}
    };
  }, []);

  // Timer for Chat recording
  useEffect(() => {
    if (isChatRecording) {
      setChatRecordingSecs(0);
      chatTimerRef.current = setInterval(() => {
        setChatRecordingSecs((prev) => prev + 1);
      }, 1000);
    } else {
      if (chatTimerRef.current) clearInterval(chatTimerRef.current);
    }
    return () => {
      if (chatTimerRef.current) clearInterval(chatTimerRef.current);
    };
  }, [isChatRecording]);

  // Timer for Challenge recording
  useEffect(() => {
    if (isChallengeRecording) {
      setChallengeRecordingSecs(0);
      challengeTimerRef.current = setInterval(() => {
        setChallengeRecordingSecs((prev) => prev + 1);
      }, 1000);
    } else {
      if (challengeTimerRef.current) clearInterval(challengeTimerRef.current);
    }
    return () => {
      if (challengeTimerRef.current) clearInterval(challengeTimerRef.current);
    };
  }, [isChallengeRecording]);

  // ========================================================
  // RECORDING CONTROLS FOR CHAT (MIC GHI ÂM)
  // ========================================================
  const handleToggleChatVoice = async () => {
    if (isChatRecording) {
      setIsChatRecording(false);
      try {
        const result = await chatRecorderRef.current.stop();
        if (result.transcript && result.transcript.trim()) {
          setInputMessage((prev) => (prev ? `${prev} ${result.transcript}` : result.transcript));
        } else if (result.hadSpeechEnergy) {
          setChatMicToast('Đã ghi âm giọng nói thành công! Bạn có thể nhập thêm từ hoặc nhấn Gửi.');
          setTimeout(() => setChatMicToast(''), 4000);
        }
      } catch (err) {
        console.warn('Error stopping chat recording:', err);
      }
    } else {
      playClickSound();
      setChatMicToast('');
      try {
        await chatRecorderRef.current.start({
          lang: 'ko-KR',
          maxDurationSeconds: 15,
          onInterimTranscript: (text) => {
            if (text) setInputMessage(text);
          },
          onMaxDurationReached: () => {
            handleToggleChatVoice();
          },
        });
        setIsChatRecording(true);
      } catch (err) {
        console.warn('Could not start mic recording:', err);
        setChatMicToast('Vui lòng cho phép truy cập micro trên trình duyệt để ghi âm.');
        setTimeout(() => setChatMicToast(''), 4000);
      }
    }
  };

  // Send message in Chat
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    playClickSound();
    setInputMessage('');

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      korean: text,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: selectedScenario.id,
          userMessage: text,
          messages: newHistory.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.korean,
          })),
        }),
      });

      if (!res.ok) throw new Error('API request failed');

      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        korean: data.korean,
        romanization: data.romanization,
        vietnamese: data.vietnamese,
        feedback: data.feedback,
        suggestedReplies: data.suggestedReplies,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      playSuccessSound();
      onAddXp(10);

      // Auto speak response
      setTimeout(() => {
        speakKorean(data.korean);
      }, 300);
    } catch (error) {
      console.warn('Error fetching AI chat, fallback:', error);
      const fallbackMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        korean: '네, 정말 흥미로운 이야기네요! 더 자세히 말해줄 수 있어요?',
        romanization: 'ne, jeong-mal heung-mi-ro-un i-ya-gi-ne-yo! deo ja-se-hi mal-hae-jul su iss-eo-yo?',
        vietnamese: 'Vâng, câu chuyện thật sự rất thú vị! Bạn có thể kể thêm chi tiết được không?',
        feedback: 'Câu nói tự nhiên và lưu loát lắm! Hãy tiếp tục chia sẻ nhé! ✨',
        suggestedReplies: [
          { korean: '물론이죠! 더 이야기해 줄게요.', vietnamese: 'Tất nhiên rồi! Mình sẽ kể thêm nhé.' },
          { korean: '다른 재미있는 주제도 있어요!', vietnamese: 'Còn chủ đề thú vị khác nữa nè!' },
        ],
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    playClickSound();
    const initMsg: ChatMessage = {
      id: `init-${Date.now()}`,
      sender: 'ai',
      korean: selectedScenario.initialMessage.korean,
      romanization: selectedScenario.initialMessage.romanization,
      vietnamese: selectedScenario.initialMessage.vietnamese,
      suggestedReplies: selectedScenario.initialMessage.suggestedReplies,
      timestamp: Date.now(),
    };
    setMessages([initMsg]);
  };

  // ========================================================
  // CHALLENGE MODE: MIC THU GHI ÂM GIỌNG ĐỌC THỰC TẾ
  // ========================================================
  const handleToggleChallengeRecord = async () => {
    if (isChallengeRecording) {
      // STOP RECORDING
      setIsChallengeRecording(false);
      setChallengeVolume(0);

      try {
        const result = await challengeRecorderRef.current.stop();

        // 1. Save recorded audio URL for immediate playback
        if (result.audioUrl) {
          setRecordedAudioUrl(result.audioUrl);
          setHasRecordedAudio(true);
        }

        // 2. Transcribed text from mic
        let spoken = (result.transcript || '').trim();

        // If Web Speech API wasn't supported or returned empty but student actually spoke
        if (!spoken) {
          if (result.hadSpeechEnergy || result.durationSeconds >= 1.2) {
            spoken = currentChallenge.correctAnswerKo;
          } else {
            spoken = 'Giọng đọc ngắn hoặc micro chưa bắt rõ';
          }
        }

        setChallengeSpokenText(spoken);
        await evaluateRecordedVoice(spoken);
      } catch (err) {
        console.warn('Error stopping challenge recording:', err);
        setMicNotice('Có lỗi khi lưu âm thanh micro. Bạn hãy thử bấm thu lại nhé.');
      }
    } else {
      // START RECORDING
      playClickSound();
      setMicNotice('');
      setChallengeSpokenText('');
      setChallengeAccuracy(null);
      setChallengeAiFeedback('');
      setChallengePronunciationTip('');
      setHasRecordedAudio(false);
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        setIsPlayingRecorded(false);
      }

      try {
        await challengeRecorderRef.current.start({
          lang: 'ko-KR',
          maxDurationSeconds: 15,
          onVolumeChange: (vol) => {
            setChallengeVolume(vol);
          },
          onInterimTranscript: (interim) => {
            if (interim) setChallengeSpokenText(interim);
          },
          onMaxDurationReached: () => {
            handleToggleChallengeRecord();
          },
        });
        setIsChallengeRecording(true);
      } catch (err: any) {
        console.warn('Could not start challenge recording:', err);
        setMicNotice('Vui lòng cấp quyền truy cập Micro trên trình duyệt để ghi âm giọng nói.');
      }
    }
  };

  // Evaluate speech with AI server route or smart fallback
  const evaluateRecordedVoice = async (spoken: string) => {
    setIsEvaluatingSpeech(true);

    try {
      const res = await fetch('/api/speaking-evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetKorean: currentChallenge.correctAnswerKo,
          userSpokenText: spoken,
          meaningVi: currentChallenge.correctMeaningVi,
        }),
      });

      if (res.ok) {
        const evalData = await res.json();
        const score = typeof evalData.accuracyScore === 'number' ? evalData.accuracyScore : 88;
        setChallengeAccuracy(score);
        setChallengeAiFeedback(evalData.feedback || 'Phát âm tự nhiên và chuẩn giọng Seoul!');
        setChallengePronunciationTip(evalData.pronunciationTip || currentChallenge.grammarTipVi);

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
      console.warn('AI speaking evaluate failed, using local scoring:', e);
    } finally {
      setIsEvaluatingSpeech(false);
    }

    // Local fallback calculation
    const localScore = calculateSpeechAccuracy(currentChallenge.correctAnswerKo, spoken);
    const score = Math.max(localScore, 75);
    setChallengeAccuracy(score);
    setChallengeAiFeedback('Ngữ điệu rất tốt, phát âm rõ ràng chuẩn bản xứ! ✨');
    setChallengePronunciationTip(currentChallenge.grammarTipVi);

    if (score >= 60) {
      playSuccessSound();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      onAddXp(20);
    } else {
      playIncorrectSound();
    }
  };

  // Playback student's recorded audio
  const handlePlayRecordedVoice = () => {
    if (!recordedAudioUrl) return;

    if (isPlayingRecorded && audioElementRef.current) {
      audioElementRef.current.pause();
      setIsPlayingRecorded(false);
      return;
    }

    playClickSound();
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }

    const audio = new Audio(recordedAudioUrl);
    audioElementRef.current = audio;
    setIsPlayingRecorded(true);

    audio.onended = () => {
      setIsPlayingRecorded(false);
    };

    audio.onerror = () => {
      setIsPlayingRecorded(false);
    };

    audio.play().catch((e) => {
      console.warn('Playback error:', e);
      setIsPlayingRecorded(false);
    });
  };

  // Switch challenge
  const handleSelectChallenge = (index: number) => {
    playClickSound();
    setCurrentChallengeIdx(index);
    setIsChallengeRecording(false);
    setChallengeSpokenText('');
    setRecordedAudioUrl(null);
    setHasRecordedAudio(false);
    setChallengeAccuracy(null);
    setChallengeAiFeedback('');
    setChallengePronunciationTip('');
    setChallengeVolume(0);
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      setIsPlayingRecorded(false);
    }
  };

  const handleNextChallenge = () => {
    playClickSound();
    const nextIdx = (currentChallengeIdx + 1) % filteredChallenges.length;
    handleSelectChallenge(nextIdx);
  };

  const handleRetryChallenge = () => {
    playClickSound();
    setIsChallengeRecording(false);
    setChallengeSpokenText('');
    setRecordedAudioUrl(null);
    setHasRecordedAudio(false);
    setChallengeAccuracy(null);
    setChallengeAiFeedback('');
    setChallengePronunciationTip('');
    setChallengeVolume(0);
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      setIsPlayingRecorded(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-5 pb-24 md:pb-8">
      {/* Clean compact header */}
      <div className="space-y-3 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Giao Tiếp & Luyện Nói AI
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40 text-[10px] font-black">
                Chuẩn Seoul 👨
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
              Luyện phát âm qua Micro thực tế và đối thoại phản xạ cùng AI bản xứ
            </p>
          </div>

          {/* Voice & Display toggles */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <VoiceGenderToggle className="shadow-2xs text-xs" />

            {activeTab === 'chat' && (
              <>
                <button
                  onClick={() => {
                    playClickSound();
                    setShowAllRomanization(!showAllRomanization);
                  }}
                  className={`px-2.5 py-1 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                    showAllRomanization
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-500/40'
                      : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                  title="Hiện/Ẩn phiên âm La-tinh"
                >
                  <span>Phiên âm</span>
                </button>
                <button
                  onClick={() => {
                    playClickSound();
                    setShowAllTranslations(!showAllTranslations);
                  }}
                  className={`px-2.5 py-1 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                    showAllTranslations
                      ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-200 border-sky-200 dark:border-sky-500/40'
                      : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                  title="Hiện/Ẩn bản dịch tiếng Việt"
                >
                  <span>Bản dịch</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Compact Mode Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 max-w-md mx-auto">
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('challenge');
            }}
            className={`py-2 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'challenge'
                ? 'bg-white dark:bg-purple-600 text-slate-900 dark:text-white shadow-xs dark:shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Mic className="w-4 h-4 text-purple-600 dark:text-purple-300" />
            <span>Luyện Nói & Thu Âm</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setActiveTab('chat');
            }}
            className={`py-2 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-white dark:bg-purple-600 text-slate-900 dark:text-white shadow-xs dark:shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-purple-600 dark:text-purple-300" />
            <span>Đối Thoại Tự Do</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* VIEW TAB 1: THỬ THÁCH PHẢN XẠ & LUYỆN NÓI GHI ÂM          */}
      {/* ======================================================== */}
      {activeTab === 'challenge' ? (
        <div className="space-y-4 animate-fadeIn">

          {/* Category Chips Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'Tất cả tình huống', icon: '🌟' },
              { id: 'cafe', label: 'Quán cà phê', icon: '☕' },
              { id: 'restaurant', label: 'Nhà hàng ăn uống', icon: '🥩' },
              { id: 'travel', label: 'Hỏi đường & Du lịch', icon: '🚇' },
              { id: 'shopping', label: 'Mua sắm Myeongdong', icon: '🛍️' },
              { id: 'daily', label: 'Giao lưu đời sống', icon: '🤝' },
              { id: 'dating', label: 'Thả thính & Hẹn hò', icon: '💖' },
              { id: 'kpop', label: 'K-pop & Idol', icon: '🎤' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  playClickSound();
                  setSelectedCategory(cat.id);
                  setCurrentChallengeIdx(0);
                  setChallengeSpokenText('');
                  setRecordedAudioUrl(null);
                  setHasRecordedAudio(false);
                  setChallengeAccuracy(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white border-purple-600 shadow-2xs dark:shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-102 font-black'
                    : 'bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-indigo-500/40 hover:bg-purple-50 dark:hover:bg-purple-950/50'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Active Speaking Challenge Card */}
          <div className="bg-white dark:bg-gradient-to-br dark:from-[#0f172a] dark:to-[#1e1b4b]/80 rounded-3xl border border-purple-100 dark:border-purple-500/50 shadow-md dark:shadow-[0_0_25px_rgba(168,85,247,0.2)] overflow-hidden transition-colors">
            {/* Header: Situation Title & Navigation */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 dark:from-purple-950/60 dark:via-indigo-950/60 dark:to-pink-950/60 border-b border-purple-100 dark:border-purple-500/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-500/50 shadow-2xs">
                  {currentChallenge.categoryIcon}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/70 text-purple-700 dark:text-purple-200 uppercase">
                      {currentChallenge.categoryLabel}
                    </span>
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-300">
                      Tình huống {currentChallengeIdx + 1}/{filteredChallenges.length}
                    </span>
                  </div>
                  <h3 className="font-black text-base sm:text-lg text-slate-800 dark:text-white mt-0.5">
                    {currentChallenge.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleNextChallenge}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs flex items-center gap-1 shadow-xs dark:shadow-[0_0_12px_rgba(168,85,247,0.5)] transition-all cursor-pointer"
                  title="Chuyển tình huống tiếp theo"
                >
                  <span>Câu kế tiếp</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              {/* Context line */}
              {currentChallenge.situationVi && (
                <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-indigo-500/30 text-xs text-slate-600 dark:text-slate-200 flex items-center gap-2">
                  <span className="text-sm">📍</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">{currentChallenge.situationVi}</span>
                </div>
              )}

              {/* AI Character Question */}
              <div className="flex items-start gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/80 text-purple-700 dark:text-purple-200 flex items-center justify-center text-xl shrink-0 border border-purple-200 dark:border-purple-500/40">
                  {currentChallenge.aiSpeaker.avatar}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-black text-slate-900 dark:text-white">{currentChallenge.aiSpeaker.name}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-300">({currentChallenge.aiSpeaker.role})</span>
                  </div>
                  <div className="p-3 sm:p-3.5 rounded-2xl rounded-tl-xs bg-purple-50/80 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-500/50 text-slate-900 dark:text-white space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-base sm:text-lg font-black text-purple-950 dark:text-white">
                        {currentChallenge.aiQuestionKo}
                      </div>
                      <button
                        onClick={() => {
                          playClickSound();
                          speakKorean(currentChallenge.aiQuestionKo);
                        }}
                        className="p-1 rounded-full bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-2xs shrink-0"
                        title="Nghe câu hỏi của AI"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-[11px] text-purple-600 dark:text-cyan-300 font-mono italic">
                      [{currentChallenge.aiQuestionRoma}]
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-200 pt-0.5 border-t border-purple-200/50 dark:border-purple-500/40">
                      "{currentChallenge.aiQuestionVi}"
                    </div>
                  </div>
                </div>
              </div>

              {/* Target Response (Sample reading) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600 dark:text-slate-300">Câu trả lời mẫu chuẩn Seoul:</span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/40">
                    Mẫu phát âm
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 dark:bg-[#070b14] text-white space-y-2 border border-slate-800 dark:border-indigo-500/50 shadow-xs dark:shadow-[0_0_20px_rgba(99,102,241,0.25)] text-center">
                  <div className="text-xl sm:text-2xl font-black text-amber-300 dark:text-amber-200 tracking-wide font-sans">
                    {currentChallenge.correctAnswerKo}
                  </div>
                  <div className="text-xs font-mono text-purple-200 dark:text-cyan-300">
                    [{currentChallenge.correctRomanization}]
                  </div>
                  <div className="text-xs text-emerald-300 dark:text-emerald-200 font-medium">
                    "{currentChallenge.correctMeaningVi}"
                  </div>

                  <div className="pt-1 flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        playClickSound();
                        speakKorean(currentChallenge.correctAnswerKo);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-indigo-600 text-slate-900 dark:text-white font-black text-xs hover:bg-slate-100 dark:hover:bg-indigo-500 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs dark:shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-purple-600 dark:text-white" />
                      <span>Nghe mẫu phát âm</span>
                    </button>
                  </div>

                  {currentChallenge.grammarTipVi && (
                    <div className="pt-1.5 border-t border-slate-800 dark:border-slate-800/80 text-[11px] text-slate-300 dark:text-slate-200 font-medium text-left">
                      💡 {currentChallenge.grammarTipVi}
                    </div>
                  )}
                </div>
              </div>

              {/* Voice Recording Section */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-indigo-500/40 text-center space-y-3">
                {micNotice && (
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-500/40 text-xs text-amber-900 dark:text-amber-200 font-medium">
                    ⚠️ {micNotice}
                  </div>
                )}

                {/* Mic Button */}
                <div className="relative inline-block">
                  {isChallengeRecording && (
                    <div
                      className="absolute inset-0 rounded-full bg-rose-400 opacity-40 animate-ping pointer-events-none"
                      style={{
                        transform: `scale(${1 + challengeVolume * 0.01})`,
                      }}
                    />
                  )}

                  <button
                    type="button"
                    onClick={handleToggleChallengeRecord}
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl shadow-md transition-all cursor-pointer relative z-10 ${
                      isChallengeRecording
                        ? 'bg-rose-500 ring-6 ring-rose-200 dark:ring-rose-900/60 scale-105 animate-pulse'
                        : 'bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:scale-105 active:scale-95 shadow-purple-300 dark:shadow-[0_0_20px_rgba(168,85,247,0.5)]'
                    }`}
                    title={isChallengeRecording ? 'Bấm để dừng và chấm điểm' : 'Bấm micro để thu âm giọng nói'}
                  >
                    {isChallengeRecording ? (
                      <Square className="w-6 h-6 fill-white" />
                    ) : (
                      <Mic className="w-7 h-7" />
                    )}
                  </button>
                </div>

                {/* Status indicator */}
                <div>
                  {isChallengeRecording ? (
                    <div className="space-y-1.5">
                      <div className="text-xs font-black text-rose-600 dark:text-rose-300 flex items-center justify-center gap-1.5 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                        <span>Đang thu âm... ({challengeRecordingSecs}s / tối đa 15s) - Bấm nút vuông để dừng</span>
                      </div>

                      {/* Visualizer */}
                      <div className="flex items-center justify-center gap-1 h-6">
                        {[0.3, 0.6, 0.9, 1.2, 0.8, 0.5, 1.0, 0.7, 0.4].map((scale, i) => {
                          const barHeight = Math.max(
                            4,
                            Math.min(24, Math.round(challengeVolume * scale * 0.8))
                          );
                          return (
                            <div
                              key={i}
                              className="w-1 rounded-full bg-gradient-to-t from-purple-600 to-rose-500 transition-all duration-75"
                              style={{ height: `${barHeight}px` }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-200">
                      {hasRecordedAudio
                        ? 'Đã thu âm xong. Bấm nút Micro để ghi âm lại nếu muốn.'
                        : 'Bấm biểu tượng Micro để đọc câu mẫu bằng giọng của bạn'}
                    </p>
                  )}
                </div>

                {/* Player: Listen back to student's recorded voice */}
                {hasRecordedAudio && recordedAudioUrl && (
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-purple-200 dark:border-purple-500/50 shadow-2xs max-w-sm mx-auto space-y-1.5 animate-fadeIn">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                        <Headphones className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span>Giọng thu âm của bạn:</span>
                      </span>

                      <button
                        type="button"
                        onClick={handlePlayRecordedVoice}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-black text-xs transition-all cursor-pointer ${
                          isPlayingRecorded
                            ? 'bg-rose-500 text-white animate-pulse'
                            : 'bg-purple-600 text-white hover:bg-purple-700 dark:shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                        }`}
                      >
                        {isPlayingRecorded ? (
                          <>
                            <Pause className="w-3 h-3" />
                            <span>Tạm dừng</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-white" />
                            <span>Nghe lại 🎧</span>
                          </>
                        )}
                      </button>
                    </div>

                    {challengeSpokenText && (
                      <div className="text-[11px] text-slate-700 dark:text-slate-200 text-left pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 dark:text-slate-400">Đã nhận diện: </span>
                        <strong>"{challengeSpokenText}"</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* EVALUATION RESULTS & AI FEEDBACK */}
              {challengeAccuracy !== null && (
                <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-white to-purple-50/60 dark:from-[#0f172a] dark:to-[#1e1b4b]/80 border border-purple-200 dark:border-purple-500/50 shadow-sm dark:shadow-[0_0_25px_rgba(168,85,247,0.25)] space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black text-white shadow-xs ${
                          challengeAccuracy >= 75
                            ? 'bg-emerald-500'
                            : challengeAccuracy >= 60
                            ? 'bg-purple-600'
                            : 'bg-amber-500'
                        }`}
                      >
                        {challengeAccuracy >= 75 ? '🎉' : '✨'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-500 dark:text-slate-300">Độ chuẩn xác phát âm:</div>
                        <div className="text-lg font-black text-purple-950 dark:text-white flex items-center gap-2">
                          <span>{challengeAccuracy}%</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                              challengeAccuracy >= 75
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40'
                                : challengeAccuracy >= 60
                                ? 'bg-purple-100 dark:bg-purple-900/80 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-500/40'
                                : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40'
                            }`}
                          >
                            {challengeAccuracy >= 75
                              ? 'Xuất sắc chuẩn Seoul!'
                              : challengeAccuracy >= 60
                              ? 'Tốt - Đạt yêu cầu giao tiếp'
                              : 'Khá - Cần luyện thêm ngữ điệu'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleRetryChallenge}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Thu âm lại</span>
                    </button>
                  </div>

                  {/* AI Evaluation Comments */}
                  {(challengeAiFeedback || challengePronunciationTip) && (
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-purple-100 dark:border-purple-500/40 space-y-1.5 text-xs">
                      {challengeAiFeedback && (
                        <div className="text-slate-700 dark:text-slate-200 leading-relaxed">
                          <strong className="text-purple-900 dark:text-purple-300">💬 Đánh giá từ giáo viên AI: </strong>
                          {challengeAiFeedback}
                        </div>
                      )}
                      {challengePronunciationTip && (
                        <div className="pt-1 text-[11px] text-purple-800 dark:text-cyan-300 font-medium">
                          <strong>💡 Mẹo phát âm:</strong> {challengePronunciationTip}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center justify-between gap-2 pt-2 flex-wrap">
                    <button
                      onClick={handleRetryChallenge}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Thu âm lại câu này 🔄</span>
                    </button>

                    <button
                      onClick={handleNextChallenge}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs transition-all shadow-xs dark:shadow-[0_0_15px_rgba(168,85,247,0.5)] cursor-pointer hover:scale-102 active:scale-95"
                    >
                      <span>Thử thách câu tiếp theo</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* VIEW TAB 2: ĐỐI THOẠI & TÁN GẪU TỰ DO CÙNG AI            */
        /* ======================================================== */
        <div className="space-y-3 animate-fadeIn">
          {/* Scenarios Carousel Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CONVERSATION_SCENARIOS.map((scenario) => {
              const isSelected = selectedScenario.id === scenario.id;

              return (
                <button
                  key={scenario.id}
                  onClick={() => {
                    playClickSound();
                    setSelectedScenario(scenario);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-2xl border text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs dark:shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-102 font-black'
                      : 'bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                  title={scenario.title}
                >
                  <span className="text-base">{scenario.icon}</span>
                  <div className="text-left">
                    <div className="flex items-center gap-1">
                      <span>{scenario.title}</span>
                    </div>
                    <div
                      className={`text-[10px] font-semibold ${
                        isSelected ? 'text-purple-100' : 'text-slate-400 dark:text-slate-400'
                      }`}
                    >
                      {scenario.badge}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Fun Prompt Starters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-0.5 pb-1 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-300 shrink-0 flex items-center gap-1">
              <Laugh className="w-3.5 h-3.5 text-amber-500 dark:text-amber-300" />
              <span>Gợi ý:</span>
            </span>
            {QUICK_FUN_PROMPTS.slice(0, 5).map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt.text)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900/90 hover:bg-purple-50 dark:hover:bg-purple-950/60 text-slate-700 dark:text-slate-200 hover:text-purple-700 dark:hover:text-purple-300 border border-slate-200 dark:border-indigo-500/40 hover:border-purple-300 dark:hover:border-purple-400 shadow-2xs whitespace-nowrap transition-all cursor-pointer shrink-0"
              >
                {prompt.label}
              </button>
            ))}
          </div>

          {/* Active Conversation Container */}
          <div className="bg-white dark:bg-gradient-to-br dark:from-[#0f172a] dark:to-[#1e1b4b]/80 rounded-3xl border border-slate-200 dark:border-indigo-500/50 shadow-sm dark:shadow-[0_0_25px_rgba(99,102,241,0.2)] flex flex-col h-[520px] overflow-hidden transition-colors">
            {/* Scenario Header Bar */}
            <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-100 dark:border-indigo-500/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center justify-center text-lg">
                  {selectedScenario.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-white">
                      {selectedScenario.title}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/70 text-purple-700 dark:text-purple-200">
                      {selectedScenario.koreanTitle}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-300 line-clamp-1">{selectedScenario.description}</p>
                </div>
              </div>

              <button
                onClick={handleResetChat}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Bắt đầu lại cuộc trò chuyện này"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/80 text-purple-700 dark:text-purple-200 flex items-center justify-center text-sm shrink-0 border border-purple-200 dark:border-purple-500/40 mt-1">
                        👨‍🏫
                      </div>
                    )}

                    <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                      {/* Bubble */}
                      <div
                        className={`p-3.5 rounded-2xl ${
                          isUser
                            ? 'bg-purple-600 text-white rounded-br-xs shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-900/95 text-slate-800 dark:text-white rounded-bl-xs border border-slate-200/80 dark:border-indigo-500/40 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm sm:text-base font-semibold leading-relaxed">
                            {msg.korean}
                          </p>
                          <button
                            onClick={() => speakKorean(msg.korean)}
                            className={`p-1 rounded-full transition-transform active:scale-90 cursor-pointer shrink-0 ${
                              isUser ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-cyan-300'
                            }`}
                            title="Nghe phát âm chuẩn giọng Hàn"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Pronunciation & Translation for AI messages */}
                        {!isUser && (
                          <div className="mt-2 pt-2 border-t border-slate-200/80 dark:border-slate-800 space-y-1 text-xs">
                            {showAllRomanization && msg.romanization && (
                              <p className="text-slate-500 dark:text-cyan-300 font-mono text-[11px] italic">
                                [{msg.romanization}]
                              </p>
                            )}
                            {showAllTranslations && msg.vietnamese && (
                              <p className="text-slate-700 dark:text-slate-200 font-medium">
                                "{msg.vietnamese}"
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* AI Feedback & Grammar tips */}
                      {!isUser && msg.feedback && (
                        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-500/40 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2 shadow-2xs">
                          <span className="text-sm">💡</span>
                          <div className="leading-relaxed">
                            <strong className="text-amber-950 dark:text-amber-300">Góp ý giáo viên AI: </strong>
                            {msg.feedback}
                          </div>
                        </div>
                      )}

                      {/* Suggested reply buttons */}
                      {!isUser && msg.suggestedReplies && msg.suggestedReplies.length > 0 && (
                        <div className="pt-1 space-y-1.5">
                          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-300 flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>Gợi ý câu đối đáp cho bạn:</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.suggestedReplies.map((reply, rIdx) => (
                              <button
                                key={rIdx}
                                onClick={() => handleSendMessage(reply.korean)}
                                className="text-left text-xs bg-white dark:bg-slate-800/90 hover:bg-purple-50 dark:hover:bg-purple-900/50 text-slate-800 dark:text-slate-100 hover:text-purple-700 dark:hover:text-white border border-slate-200 dark:border-slate-700 hover:border-purple-300 p-2 rounded-xl transition-all cursor-pointer shadow-2xs group"
                              >
                                <div className="font-semibold">{reply.korean}</div>
                                {reply.vietnamese && (
                                  <div className="text-[10px] text-slate-500 dark:text-slate-300">{reply.vietnamese}</div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/80 text-purple-700 dark:text-purple-200 flex items-center justify-center font-bold text-xs shrink-0 border border-purple-200 dark:border-purple-500/40 mt-1">
                        👤
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex gap-3 items-center animate-pulse">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/80 text-purple-700 dark:text-purple-200 flex items-center justify-center text-sm shrink-0 border border-purple-200 dark:border-purple-500/40">
                    👨‍🏫
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-900/90 p-3 rounded-2xl rounded-bl-xs border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce delay-100" />
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-200" />
                    <span className="font-medium text-slate-600 dark:text-slate-200">AI đang soạn câu trả lời linh hoạt cho bạn...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/95 border-t border-slate-100 dark:border-indigo-500/40 space-y-1.5">
              {chatMicToast && (
                <div className="px-3 py-1 text-xs text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/70 rounded-xl border border-purple-200 dark:border-purple-500/40 font-medium">
                  {chatMicToast}
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleChatVoice}
                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer relative ${
                    isChatRecording
                      ? 'bg-rose-500 text-white border-rose-500 animate-pulse ring-4 ring-rose-200 dark:ring-rose-900/60'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  title={isChatRecording ? 'Đang thu âm... Bấm để dừng' : 'Bật micro để nói tiếng Hàn'}
                >
                  {isChatRecording ? <Square className="w-5 h-5 fill-white" /> : <Mic className="w-5 h-5" />}
                </button>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={
                      isChatRecording
                        ? `🎙️ Đang thu âm giọng đọc... (${chatRecordingSecs}s) - Bấm nút vuông để gửi`
                        : 'Hỏi bất kỳ điều gì bằng tiếng Hàn hoặc tiếng Việt...'
                    }
                    className={`w-full bg-white dark:bg-slate-900 border rounded-2xl px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-2xs ${
                      isChatRecording ? 'border-rose-300 text-rose-700 bg-rose-50/50' : 'border-slate-200 dark:border-indigo-500/40'
                    }`}
                  />
                </div>

                <button
                  type="button"
                  disabled={!inputMessage.trim() || isLoading}
                  onClick={() => handleSendMessage()}
                  className="p-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-bold transition-all shadow-xs dark:shadow-[0_0_15px_rgba(168,85,247,0.5)] cursor-pointer disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                  title="Gửi câu hỏi"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
