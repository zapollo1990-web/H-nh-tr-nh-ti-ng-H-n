import React, { useState } from 'react';
import { X, Flame, Calendar, Check, Shield, Sparkles, Volume2, Award, Gift } from 'lucide-react';
import { MOTIVATIONAL_QUOTES } from '../data/leaderboard';
import { speakKorean, playClickSound, playSuccessSound } from '../utils/audio';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  streak: number;
  activeDates: string[]; // YYYY-MM-DD
  dailyXp: number;
  dailyGoalXp: number;
  onAddXp: (amount: number) => void;
}

export const StreakModal: React.FC<StreakModalProps> = ({
  isOpen,
  onClose,
  streak,
  activeDates,
  dailyXp,
  dailyGoalXp,
  onAddXp,
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [claimedDailyBonus, setClaimedDailyBonus] = useState(false);

  if (!isOpen) return null;

  const currentQuote = MOTIVATIONAL_QUOTES[quoteIndex % MOTIVATIONAL_QUOTES.length];

  // Days of week for current week view
  const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday

  // Generate 7 days of the current week
  const weekDays = daysOfWeek.map((day, idx) => {
    // Convert JS Sunday (0) to European style (6)
    const adjustedCurrent = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    const isPastOrToday = idx <= adjustedCurrent;
    const isToday = idx === adjustedCurrent;
    return {
      name: day,
      isActive: isPastOrToday,
      isToday,
    };
  });

  const isGoalReached = dailyXp >= dailyGoalXp;

  const handleClaimBonus = () => {
    if (claimedDailyBonus || !isGoalReached) return;
    playSuccessSound();
    setClaimedDailyBonus(true);
    onAddXp(25);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-100 relative space-y-5 animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Streak Flame */}
        <div className="text-center pt-2">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-orange-400 to-amber-300 flex items-center justify-center text-4xl shadow-lg shadow-orange-200 border-4 border-white mb-3">
            🔥
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            {streak} Ngày Học Liên Tiếp!
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Duy trì ngọn lửa đam mê tiếng Hàn mỗi ngày để tạo thói quen bền vững.
          </p>
        </div>

        {/* Week Streak Tracker */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Tiến trình tuần này
            </span>
            <span className="text-orange-500 font-extrabold">{streak}/7 ngày</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center">
            {weekDays.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400">{day.name}</span>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                    day.isActive
                      ? 'bg-gradient-to-br from-orange-400 to-amber-400 text-white shadow-xs'
                      : 'bg-slate-200/80 text-slate-400'
                  } ${day.isToday ? 'ring-2 ring-orange-500 ring-offset-2' : ''}`}
                >
                  {day.isActive ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Goal XP Card */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-900 block">
              Mục tiêu hôm nay: {dailyXp} / {dailyGoalXp} XP
            </span>
            <div className="w-36 h-2 bg-amber-200/80 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${Math.min(100, (dailyXp / dailyGoalXp) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-amber-700 mt-1 block">
              {isGoalReached ? 'Đã hoàn thành mục tiêu!' : `Còn thiếu ${dailyGoalXp - dailyXp} XP`}
            </span>
          </div>

          <button
            onClick={handleClaimBonus}
            disabled={!isGoalReached || claimedDailyBonus}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              claimedDailyBonus
                ? 'bg-emerald-100 text-emerald-800'
                : isGoalReached
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs scale-105 animate-pulse'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>{claimedDailyBonus ? 'Đã nhận' : 'Nhận +25 XP'}</span>
          </button>
        </div>

        {/* Motivational Proverb Quote */}
        <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-100 text-left">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-sky-500" /> Câu nói truyền cảm hứng
            </span>
            <button
              onClick={() => speakKorean(currentQuote.korean)}
              className="p-1 rounded text-sky-600 hover:bg-sky-100 cursor-pointer"
              title="Nghe câu tiếng Hàn"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="font-extrabold text-sm text-slate-800">{currentQuote.korean}</p>
          <p className="text-xs text-sky-600 font-mono mt-0.5">/{currentQuote.romanization}/</p>
          <p className="text-xs text-slate-600 mt-1 italic">"{currentQuote.vietnamese}"</p>
        </div>

        {/* Streak Shield / Milestone */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-sky-500" />
            <span>Bảo vệ chuỗi: <strong>Kích hoạt</strong></span>
          </div>
          <div className="flex items-center gap-1 text-amber-600 font-bold">
            <Award className="w-4 h-4" />
            <span>Mốc tiếp theo: 7 ngày</span>
          </div>
        </div>

        {/* Bottom dismiss button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all shadow-xs cursor-pointer"
        >
          Tiếp tục học ngay!
        </button>
      </div>
    </div>
  );
};
