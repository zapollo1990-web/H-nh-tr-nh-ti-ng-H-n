import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, Check, X, RotateCcw, Award, Flame, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';
import { QuizQuestion, MatchPair } from '../types';
import { PRACTICE_QUIZZES, MATCH_PAIRS_SETS } from '../data/quizzes';
import { speakKorean, playClickSound, playSuccessSound, playIncorrectSound, playFanfareSound } from '../utils/audio';

interface PracticeViewProps {
  onAddXp: (amount: number) => void;
  onNavigateToPuzzles?: () => void;
  onRecordQuizResult?: (isCorrect: boolean) => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  onAddXp,
  onNavigateToPuzzles,
  onRecordQuizResult,
}) => {
  const [activeMode, setActiveMode] = useState<'quiz' | 'arrange' | 'match'>('quiz');

  // QUIZ MODE STATE
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(
    PRACTICE_QUIZZES.filter((q) => q.type === 'choice')
  );
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // ARRANGE MODE STATE
  const [arrangeQuestions, setArrangeQuestions] = useState<QuizQuestion[]>(
    PRACTICE_QUIZZES.filter((q) => q.type === 'arrange')
  );
  const [arrangeIndex, setArrangeIndex] = useState(0);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [arrangeSubmitted, setArrangeSubmitted] = useState(false);
  const [isArrangeCorrect, setIsArrangeCorrect] = useState<boolean | null>(null);

  // MATCHING PAIRS MODE STATE
  const [matchSetIndex, setMatchSetIndex] = useState(0);
  const [shuffledCards, setShuffledCards] = useState<
    Array<{ id: string; text: string; lang: 'ko' | 'vi'; pairId: string }>
  >([]);
  const [selectedMatchCard, setSelectedMatchCard] = useState<{
    id: string;
    text: string;
    lang: 'ko' | 'vi';
    pairId: string;
  } | null>(null);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [matchWrongId, setMatchWrongId] = useState<string | null>(null);

  // Initialize Arrange Words
  useEffect(() => {
    const q = arrangeQuestions[arrangeIndex];
    if (q && q.scrambleWords) {
      setAvailableWords([...q.scrambleWords]);
      setSelectedWords([]);
      setArrangeSubmitted(false);
      setIsArrangeCorrect(null);
    }
  }, [arrangeIndex, arrangeQuestions]);

  // Initialize Matching Cards
  useEffect(() => {
    const pairs = MATCH_PAIRS_SETS[matchSetIndex % MATCH_PAIRS_SETS.length];
    const cards: Array<{ id: string; text: string; lang: 'ko' | 'vi'; pairId: string }> = [];

    pairs.forEach((p, idx) => {
      cards.push({ id: `ko-${idx}`, text: p.hangul, lang: 'ko', pairId: p.id });
      cards.push({ id: `vi-${idx}`, text: p.vietnamese, lang: 'vi', pairId: p.id });
    });

    // Shuffle cards
    setShuffledCards(cards.sort(() => Math.random() - 0.5));
    setMatchedPairIds([]);
    setSelectedMatchCard(null);
  }, [matchSetIndex]);

  // --- QUIZ HANDLERS ---
  const handleSelectOption = (option: string) => {
    if (isAnswerSubmitted) return;
    playClickSound();
    setSelectedOption(option);
  };

  const handleSubmitQuizAnswer = () => {
    if (!selectedOption || isAnswerSubmitted) return;
    const currentQ = quizQuestions[currentQuizIndex];
    const isCorrect = selectedOption === currentQ.answer;

    setIsAnswerSubmitted(true);
    if (onRecordQuizResult) {
      onRecordQuizResult(isCorrect);
    }
    if (isCorrect) {
      playSuccessSound();
      setQuizScore((prev) => prev + 1);
      onAddXp(10);
    } else {
      playIncorrectSound();
    }
  };

  const handleNextQuizQuestion = () => {
    playClickSound();
    if (currentQuizIndex + 1 < quizQuestions.length) {
      setCurrentQuizIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizFinished(true);
      playFanfareSound();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleResetQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    setQuizFinished(false);
  };

  // --- ARRANGE HANDLERS ---
  const handlePickWord = (word: string, index: number) => {
    if (arrangeSubmitted) return;
    playClickSound();
    const newAvail = [...availableWords];
    newAvail.splice(index, 1);
    setAvailableWords(newAvail);
    setSelectedWords((prev) => [...prev, word]);
  };

  const handleRemoveWord = (word: string, index: number) => {
    if (arrangeSubmitted) return;
    playClickSound();
    const newSelected = [...selectedWords];
    newSelected.splice(index, 1);
    setSelectedWords(newSelected);
    setAvailableWords((prev) => [...prev, word]);
  };

  const handleCheckArrange = () => {
    if (arrangeSubmitted) return;
    const currentQ = arrangeQuestions[arrangeIndex];
    const expected = (currentQ.answer as string[]).join(' ');
    const userSentence = selectedWords.join(' ');

    setArrangeSubmitted(true);
    if (userSentence === expected) {
      setIsArrangeCorrect(true);
      playSuccessSound();
      onAddXp(15);
      confetti({ particleCount: 40, spread: 60 });
    } else {
      setIsArrangeCorrect(false);
      playIncorrectSound();
    }
  };

  const handleNextArrange = () => {
    playClickSound();
    if (arrangeIndex + 1 < arrangeQuestions.length) {
      setArrangeIndex((prev) => prev + 1);
    } else {
      setArrangeIndex(0);
      playFanfareSound();
    }
  };

  // --- MATCHING PAIRS HANDLERS ---
  const handleCardClick = (card: { id: string; text: string; lang: 'ko' | 'vi'; pairId: string }) => {
    if (matchedPairIds.includes(card.pairId)) return;
    if (selectedMatchCard?.id === card.id) {
      setSelectedMatchCard(null);
      return;
    }

    if (card.lang === 'ko') {
      speakKorean(card.text);
    } else {
      playClickSound();
    }

    if (!selectedMatchCard) {
      setSelectedMatchCard(card);
      return;
    }

    // Checking pair
    if (selectedMatchCard.pairId === card.pairId && selectedMatchCard.lang !== card.lang) {
      // MATCHED!
      playSuccessSound();
      const newMatched = [...matchedPairIds, card.pairId];
      setMatchedPairIds(newMatched);
      setSelectedMatchCard(null);
      onAddXp(5);

      if (newMatched.length === MATCH_PAIRS_SETS[matchSetIndex % MATCH_PAIRS_SETS.length].length) {
        // Round complete!
        playFanfareSound();
        onAddXp(15);
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      }
    } else {
      // WRONG PAIR
      playIncorrectSound();
      setMatchWrongId(card.id);
      setTimeout(() => {
        setMatchWrongId(null);
        setSelectedMatchCard(null);
      }, 700);
    }
  };

  const currentQ = quizQuestions[currentQuizIndex];
  const currentArrangeQ = arrangeQuestions[arrangeIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 pb-24 md:pb-8">
      {/* Game Mode Navigation Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex items-center justify-between gap-1 mb-6">
        <button
          onClick={() => {
            playClickSound();
            setActiveMode('quiz');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeMode === 'quiz'
              ? 'bg-sky-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>🎯</span>
          <span>Trắc nghiệm nhanh</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveMode('arrange');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeMode === 'arrange'
              ? 'bg-amber-400 text-slate-900 shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>🧩</span>
          <span>Ghép câu tiếng Hàn</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveMode('match');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeMode === 'match'
              ? 'bg-emerald-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>🃏</span>
          <span>Nối cặp từ vựng</span>
        </button>

        {onNavigateToPuzzles && (
          <button
            onClick={() => {
              playClickSound();
              onNavigateToPuzzles();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 hover:from-orange-100 hover:to-amber-100 border border-orange-200/80 shadow-xs"
          >
            <span>💡</span>
            <span>Game giải đố vui ➔</span>
          </button>
        )}
      </div>


      {/* 1. QUIZ MODE */}
      {activeMode === 'quiz' && (
        <div className="space-y-4">
          {!quizFinished && currentQ ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-md">
              {/* Progress and category */}
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold">
                  {currentQ.category}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  Câu hỏi {currentQuizIndex + 1} / {quizQuestions.length}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
                <div
                  className="h-full bg-sky-500 transition-all duration-300"
                  style={{ width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%` }}
                />
              </div>

              {/* Question prompt */}
              <div className="mb-6">
                <h3 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight leading-snug">
                  {currentQ.prompt}
                </h3>
                {currentQ.audioText && (
                  <button
                    onClick={() => speakKorean(currentQ.audioText!)}
                    className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4 text-sky-500" />
                    <span>Nghe câu tiếng Hàn</span>
                  </button>
                )}
              </div>

              {/* Multiple Choice Options */}
              <div className="grid grid-cols-1 gap-3 mb-6">
                {currentQ.options?.map((option, idx) => {
                  const isSelected = selectedOption === option;
                  const isCorrect = option === currentQ.answer;

                  let btnStyle =
                    'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300';
                  if (isSelected && !isAnswerSubmitted) {
                    btnStyle = 'bg-sky-50 border-sky-400 text-sky-800 shadow-xs';
                  } else if (isAnswerSubmitted) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold';
                    } else if (isSelected && !isCorrect) {
                      btnStyle = 'bg-rose-50 border-rose-400 text-rose-800 line-through';
                    } else {
                      btnStyle = 'opacity-60 bg-slate-50 border-slate-200 text-slate-400';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(option)}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 text-left font-semibold text-sm sm:text-base transition-all cursor-pointer ${btnStyle}`}
                    >
                      <span>{option}</span>
                      {isAnswerSubmitted && isCorrect && (
                        <Check className="w-5 h-5 text-emerald-600 shrink-0 ml-2" />
                      )}
                      {isAnswerSubmitted && isSelected && !isCorrect && (
                        <X className="w-5 h-5 text-rose-600 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation box after submit */}
              {isAnswerSubmitted && (
                <div
                  className={`p-4 rounded-2xl mb-6 border ${
                    selectedOption === currentQ.answer
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center gap-2 font-black text-sm mb-1">
                    {selectedOption === currentQ.answer ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Chính xác! (+10 XP)</span>
                      </>
                    ) : (
                      <>
                        <HelpCircle className="w-4 h-4 text-amber-600" />
                        <span>Chưa đúng rồi! Cùng xem giải thích nhé:</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-medium">{currentQ.explanation}</p>
                </div>
              )}

              {/* Action button */}
              <div className="flex justify-end">
                {!isAnswerSubmitted ? (
                  <button
                    onClick={handleSubmitQuizAnswer}
                    disabled={!selectedOption}
                    className="px-6 py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold rounded-2xl shadow-xs transition-all cursor-pointer"
                  >
                    Kiểm tra đáp án
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuizQuestion}
                    className="flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl shadow-xs transition-all cursor-pointer"
                  >
                    <span>
                      {currentQuizIndex + 1 < quizQuestions.length ? 'Câu tiếp theo' : 'Xem kết quả'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Quiz Completed View */
            <div className="bg-white rounded-3xl p-8 border border-sky-100 shadow-md text-center">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-100 border-2 border-amber-200 flex items-center justify-center text-4xl mb-4 shadow-xs">
                🏆
              </div>
              <h3 className="text-2xl font-black text-slate-800">Hoàn thành bài luyện tập!</h3>
              <p className="text-sm text-slate-500 mt-1">
                Bạn đã hoàn thành xuất sắc vòng trắc nghiệm hôm nay.
              </p>

              <div className="my-6 max-w-xs mx-auto p-4 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-around">
                <div>
                  <div className="text-xs font-bold text-slate-500">Đúng</div>
                  <div className="text-2xl font-black text-emerald-600">
                    {quizScore} / {quizQuestions.length}
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div>
                  <div className="text-xs font-bold text-slate-500">XP Nhận được</div>
                  <div className="text-2xl font-black text-amber-500">+{quizScore * 10} XP</div>
                </div>
              </div>

              <button
                onClick={handleResetQuiz}
                className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl shadow-xs transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Làm lại trắc nghiệm</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. ARRANGE MODE (Ghép từ thành câu) */}
      {activeMode === 'arrange' && currentArrangeQ && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-md space-y-6">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              Ghép câu tiếng Hàn
            </span>
            <span className="text-xs font-bold text-slate-400">
              Câu {arrangeIndex + 1} / {arrangeQuestions.length}
            </span>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Hãy dịch câu sau sang tiếng Hàn:
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 mt-1">
              "{currentArrangeQ.prompt.replace('Sắp xếp các từ sau thành câu: ', '')}"
            </h3>
          </div>

          {/* Construction area (Drop / Selected Words) */}
          <div className="min-h-24 p-4 rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/50 flex flex-wrap items-center gap-2.5">
            {selectedWords.length === 0 ? (
              <span className="text-sm font-medium text-sky-400 italic">
                Nhấn vào các từ bên dưới để ghép thành câu hoàn chỉnh...
              </span>
            ) : (
              selectedWords.map((word, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRemoveWord(word, idx)}
                  className="px-4 py-2 bg-sky-500 text-white font-bold rounded-xl shadow-xs hover:bg-rose-500 transition-all cursor-pointer transform hover:scale-95"
                  title="Nhấn để gỡ bỏ"
                >
                  {word}
                </button>
              ))
            )}
          </div>

          {/* Available Word Pool */}
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-2">
              Kho từ vựng:
            </span>
            <div className="flex flex-wrap gap-2.5">
              {availableWords.map((word, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePickWord(word, idx)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-200 shadow-2xs transition-all cursor-pointer transform hover:scale-105"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>

          {/* Result Feedback */}
          {arrangeSubmitted && (
            <div
              className={`p-4 rounded-2xl border ${
                isArrangeCorrect
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-center gap-2 font-black text-sm mb-1">
                {isArrangeCorrect ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Xuất sắc! Bạn đã ghép đúng câu (+15 XP)</span>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 text-rose-600" />
                    <span>
                      Chưa đúng thứ tự ngữ pháp rồi. Câu đúng là:{' '}
                      <span className="font-bold">{(currentArrangeQ.answer as string[]).join(' ')}</span>
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs font-medium">{currentArrangeQ.explanation}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                if (currentArrangeQ.audioText) speakKorean(currentArrangeQ.audioText);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-slate-500" />
              <span>Nghe mẫu phát âm</span>
            </button>

            {!arrangeSubmitted ? (
              <button
                onClick={handleCheckArrange}
                disabled={selectedWords.length === 0}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold rounded-2xl shadow-xs transition-all cursor-pointer"
              >
                Kiểm tra câu
              </button>
            ) : (
              <button
                onClick={handleNextArrange}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl shadow-xs transition-all cursor-pointer"
              >
                <span>Câu tiếp theo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. MATCHING PAIRS MODE */}
      {activeMode === 'match' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-md space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                Mini-game Lật thẻ nối từ
              </span>
              <p className="text-xs text-slate-500 mt-1">
                Nhấn chọn 1 thẻ tiếng Hàn và 1 thẻ tiếng Việt tương ứng để ghép cặp.
              </p>
            </div>

            <button
              onClick={() => setMatchSetIndex((prev) => prev + 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Đổi bộ thẻ khác
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {shuffledCards.map((card) => {
              const isMatched = matchedPairIds.includes(card.pairId);
              const isSelected = selectedMatchCard?.id === card.id;
              const isWrong = matchWrongId === card.id;

              let cardStyle =
                'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100';
              if (isMatched) {
                cardStyle = 'bg-emerald-100 border-emerald-300 text-emerald-800 opacity-40 scale-95 cursor-default';
              } else if (isWrong) {
                cardStyle = 'bg-rose-100 border-rose-400 text-rose-800 animate-shake';
              } else if (isSelected) {
                cardStyle = 'bg-sky-100 border-sky-500 text-sky-900 shadow-md scale-102';
              }

              return (
                <button
                  key={card.id}
                  disabled={isMatched}
                  onClick={() => handleCardClick(card)}
                  className={`h-24 sm:h-28 rounded-2xl border-2 p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer font-bold ${cardStyle}`}
                >
                  <span
                    className={`text-base sm:text-lg ${
                      card.lang === 'ko' ? 'font-black text-slate-900' : 'font-semibold text-slate-700'
                    }`}
                  >
                    {card.text}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                    {card.lang === 'ko' ? '🇰🇷 Tiếng Hàn' : '🇻🇳 Tiếng Việt'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom stats */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <span>
              Đã ghép: {matchedPairIds.length} /{' '}
              {MATCH_PAIRS_SETS[matchSetIndex % MATCH_PAIRS_SETS.length].length} cặp
            </span>
            <span className="flex items-center gap-1 text-amber-600">
              <Sparkles className="w-3.5 h-3.5" /> +5 XP mỗi cặp đúng
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
