import React, { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  Send,
  RotateCcw,
  Sparkles,
  MessageCircle,
  Mic,
  MicOff,
  Eye,
  EyeOff,
  Bot,
  User,
  CheckCircle2,
  Lightbulb,
  Laugh,
  Flame,
  Heart,
  Smile
} from 'lucide-react';
import { ConversationScenario, ChatMessage } from '../types';
import { CONVERSATION_SCENARIOS } from '../data/scenarios';
import { speakKorean, playClickSound, playSuccessSound } from '../utils/audio';

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
  const [selectedScenario, setSelectedScenario] = useState<ConversationScenario>(
    CONVERSATION_SCENARIOS[0]
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAllTranslations, setShowAllTranslations] = useState(true);
  const [showAllRomanization, setShowAllRomanization] = useState(true);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize conversation when scenario changes
  useEffect(() => {
    const initMsg: ChatMessage = {
      id: 'init-1',
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Web Speech Recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        const recognition = new SpeechRecognitionClass();
        recognition.lang = 'ko-KR';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const handleToggleVoice = () => {
    if (!recognitionRef.current) {
      alert('Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói tiếng Hàn.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      playClickSound();
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

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

      if (!res.ok) {
        throw new Error('API request failed');
      }

      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        korean: data.korean || '정말 재미있는 질문이에요! ㅋㅋㅋ',
        romanization: data.romanization,
        vietnamese: data.vietnamese,
        feedback: data.feedback,
        suggestedReplies: data.suggestedReplies || [],
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      playSuccessSound();
      onAddXp(15); // Reward 15 XP per interaction!

      // Automatically speak AI reply
      if (data.korean) {
        speakKorean(data.korean);
      }
    } catch (err) {
      console.error(err);
      // Friendly & humorous fallback message
      const fallbackAiMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        korean: '대박! 너무 재미있고 센스 넘치는 질문이에요! ㅋㅋㅋ 우리 계속 이야기 나눠봐요!',
        romanization: 'dae-bak! neo-mu jae-mi-iss-go sen-seu neom-chi-neun jil-mun-i-e-yo! ㅋㅋㅋ u-ri gye-sok i-ya-gi na-nwo-bwa-yo!',
        vietnamese: 'Đỉnh chóp luôn! Câu hỏi của bạn vừa hài hước vừa thông minh xỉu á! ㅋㅋㅋ Cứ tiếp tục buôn chuyện cùng mình nha!',
        feedback: 'Bạn đặt câu hỏi rất tự nhiên và đầy cảm hứng! Cứ thoải mái hỏi thêm nhé~ ✨',
        suggestedReplies: [
          { korean: '진짜요? 고마워요! ㅋㅋㅋ', vietnamese: 'Thật á? Cảm ơn bạn nha! ㅋㅋㅋ' },
          { korean: '더 재미있는 이야기 해줘요!', vietnamese: 'Kể thêm chuyện gì hài hước nữa đi!' }
        ],
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
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

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-5 pb-24 md:pb-8">
      {/* Header bar */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-500 to-pink-500 text-white flex items-center justify-center text-xl shadow-md shadow-violet-200">
              💬
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">
                  Giao Tiếp AI: Sinh Động & Hài Hước
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Miễn Phí 100% • Hỏi Mọi Điều</span>
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Hỏi bất kỳ điều gì: từ vựng, ngữ pháp, K-pop, phim ảnh K-drama, thả thính, đố vui lầy lội hay tâm sự cuộc sống!
              </p>
            </div>
          </div>

          {/* Toggle buttons for Romanization & Translation */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => {
                playClickSound();
                setShowAllRomanization(!showAllRomanization);
              }}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                showAllRomanization
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-white text-slate-500 border-slate-200'
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
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                showAllTranslations
                  ? 'bg-sky-50 text-sky-800 border-sky-200'
                  : 'bg-white text-slate-500 border-slate-200'
              }`}
              title="Hiện/Ẩn bản dịch tiếng Việt"
            >
              <span>Bản dịch</span>
            </button>
          </div>
        </div>

        {/* Humorous Banner */}
        <div className="p-3.5 sm:p-4 rounded-2xl mb-3 bg-gradient-to-r from-violet-50 via-purple-50 to-pink-50 border border-purple-200 shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center shrink-0 text-xl shadow-xs">
              🐰
            </div>
            <div>
              <div className="text-xs font-black text-purple-950 flex items-center gap-1.5">
                <span>Gia Sư AI Hana & Bạn Bè Hàn Quốc (Hỏi gì đáp nấy!)</span>
                <span className="text-[10px] bg-purple-200 text-purple-900 px-2 py-0.2 rounded-full font-bold">
                  Không giới hạn
                </span>
              </div>
              <p className="text-[11px] text-purple-700 mt-0.5">
                Bạn có thể gõ tiếng Hàn hoặc tiếng Việt để hỏi bất kỳ câu hỏi nào. Hana sẽ trả lời cực kỳ hóm hỉnh, sinh động kèm phiên âm và câu gợi ý vui nhộn!
              </p>
            </div>
          </div>
        </div>

        {/* Scenarios Carousel Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
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
                    ? 'bg-sky-500 text-white border-sky-500 shadow-xs scale-102 font-black'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
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
                      isSelected ? 'text-sky-100' : 'text-slate-400'
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
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-2 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-500 shrink-0 flex items-center gap-1">
            <Laugh className="w-3.5 h-3.5 text-amber-500" />
            <span>Gợi ý hỏi nhanh:</span>
          </span>
          {QUICK_FUN_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt.text)}
              className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 hover:border-purple-300 shadow-2xs whitespace-nowrap transition-all cursor-pointer hover:scale-102 active:scale-95 shrink-0"
            >
              {prompt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Conversation Container */}
      <div className="bg-white rounded-3xl border border-sky-100 shadow-md flex flex-col h-[540px] overflow-hidden">
        {/* Scenario Header Bar */}
        <div className="p-3 sm:p-4 bg-gradient-to-r from-sky-50 via-white to-purple-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-sky-200 shadow-2xs flex items-center justify-center text-xl">
              {selectedScenario.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-800">
                  {selectedScenario.title}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-100 text-sky-700">
                  {selectedScenario.koreanTitle}
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">{selectedScenario.description}</p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
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
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center text-base shrink-0 shadow-2xs mt-1">
                    🐰
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                  {/* Bubble */}
                  <div
                    className={`p-3.5 rounded-3xl ${
                      isUser
                        ? 'bg-sky-500 text-white rounded-br-xs shadow-xs'
                        : 'bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200/80 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm sm:text-base font-semibold leading-relaxed">
                        {msg.korean}
                      </p>
                      <button
                        onClick={() => speakKorean(msg.korean)}
                        className={`p-1 rounded-full transition-transform active:scale-90 cursor-pointer shrink-0 ${
                          isUser ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-200 text-slate-600'
                        }`}
                        title="Nghe phát âm chuẩn giọng Hàn"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Pronunciation & Translation for AI messages */}
                    {!isUser && (
                      <div className="mt-2 pt-2 border-t border-slate-200/80 space-y-1 text-xs">
                        {showAllRomanization && msg.romanization && (
                          <p className="text-slate-500 font-mono text-[11px] italic">
                            [{msg.romanization}]
                          </p>
                        )}
                        {showAllTranslations && msg.vietnamese && (
                          <p className="text-slate-700 font-medium">{msg.vietnamese}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Witty Feedback note from AI */}
                  {!isUser && msg.feedback && (
                    <div className="p-2.5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-start gap-2 shadow-2xs">
                      <Lightbulb className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-purple-800">Nhận xét & mẹo vui: </strong>
                        <span>{msg.feedback}</span>
                      </div>
                    </div>
                  )}

                  {/* Suggested quick replies */}
                  {!isUser && msg.suggestedReplies && msg.suggestedReplies.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Gợi ý câu đối đáp vui:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedReplies.map((reply, rIdx) => (
                          <button
                            key={rIdx}
                            onClick={() => handleSendMessage(reply.korean)}
                            className="text-left text-xs bg-white hover:bg-sky-50 text-sky-800 border border-sky-200 hover:border-sky-400 px-3 py-1.5 rounded-2xl transition-all shadow-2xs hover:scale-102 active:scale-95 cursor-pointer"
                          >
                            <div className="font-semibold">{reply.korean}</div>
                            {reply.vietnamese && (
                              <div className="text-[10px] text-slate-500">{reply.vietnamese}</div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-9 h-9 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm shrink-0 border border-sky-200 mt-1">
                    👤
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-center animate-pulse">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center text-base">
                🐰
              </div>
              <div className="bg-slate-100 p-3.5 rounded-3xl rounded-bl-xs border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce delay-100" />
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce delay-200" />
                <span className="font-medium text-slate-600">Hana đang suy nghĩ câu trả lời dí dỏm cho bạn...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-500 text-white border-rose-500 animate-pulse'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Bật/Tắt nói giọng tiếng Hàn"
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

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
            placeholder="Hỏi bất kỳ điều gì bằng tiếng Hàn hoặc tiếng Việt..."
            className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all shadow-2xs"
          />

          <button
            type="button"
            disabled={!inputMessage.trim() || isLoading}
            onClick={() => handleSendMessage()}
            className="p-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white font-bold transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            title="Gửi câu hỏi"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
