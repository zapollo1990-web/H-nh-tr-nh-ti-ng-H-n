import React, { useState } from 'react';
import { Trophy, Flame, Sparkles, TrendingUp, TrendingDown, Minus, Medal, Target, CheckCircle } from 'lucide-react';
import { LeaderboardEntry } from '../types';
import { INITIAL_LEADERBOARD } from '../data/leaderboard';

interface LeaderboardViewProps {
  userXp: number;
  userStreak: number;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ userXp, userStreak }) => {
  const [selectedLeague, setSelectedLeague] = useState<'Đồng' | 'Bạc' | 'Vàng' | 'Kim Cương'>('Vàng');

  // Dynamically update user's entry with live XP and Streak
  const leaderboardList = INITIAL_LEADERBOARD.map((item) => {
    if (item.isUser) {
      return {
        ...item,
        xp: userXp,
        streak: userStreak,
      };
    }
    return item;
  }).sort((a, b) => b.xp - a.xp).map((item, index) => ({
    ...item,
    rank: index + 1,
  }));

  const topThree = leaderboardList.slice(0, 3);
  const restList = leaderboardList.slice(3);

  const leagues: Array<'Đồng' | 'Bạc' | 'Vàng' | 'Kim Cương'> = ['Đồng', 'Bạc', 'Vàng', 'Kim Cương'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 pb-24 md:pb-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 rounded-3xl p-6 sm:p-8 text-slate-900 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🏆</span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Bảng Xếp Hạng Tuần (주간 랭킹)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 font-medium max-w-md">
              Học tập chăm chỉ mỗi ngày để leo top giải đấu, duy trì thói quen và nhận huy hiệu danh giá!
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/60 text-center sm:text-right shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Mùa giải kết thúc trong
            </span>
            <span className="text-base sm:text-lg font-black text-amber-900 font-mono">
              3 ngày 14 giờ
            </span>
          </div>
        </div>

        {/* League Selector */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 no-scrollbar">
          {leagues.map((league) => (
            <button
              key={league}
              onClick={() => setSelectedLeague(league)}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                selectedLeague === league
                  ? 'bg-slate-900 text-white shadow-md scale-105'
                  : 'bg-white/60 hover:bg-white text-slate-800'
              }`}
            >
              {league === 'Kim Cương' && '💎 '}
              {league === 'Vàng' && '🥇 '}
              {league === 'Bạc' && '🥈 '}
              {league === 'Đồng' && '🥉 '}
              Giải {league}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-4 pb-2">
        {/* 2nd Place */}
        {topThree[1] && (
          <div className="bg-white rounded-3xl p-3 sm:p-5 border border-slate-200 shadow-xs text-center flex flex-col items-center order-1">
            <div className="text-2xl sm:text-3xl mb-1">{topThree[1].avatar}</div>
            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center -mt-2 mb-1 shadow-2xs">
              2
            </div>
            <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 line-clamp-1">
              {topThree[1].name}
            </h4>
            <span className="text-xs sm:text-sm font-black text-sky-600 mt-1">
              {topThree[1].xp} XP
            </span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-orange-500 mt-0.5">
              <Flame className="w-3 h-3 fill-orange-500" /> {topThree[1].streak}
            </div>
          </div>
        )}

        {/* 1st Place (Taller) */}
        {topThree[0] && (
          <div className="bg-gradient-to-b from-amber-50 to-white rounded-3xl p-4 sm:p-6 border-2 border-amber-300 shadow-md text-center flex flex-col items-center order-2 -translate-y-2">
            <div className="text-xs font-black text-amber-800 bg-amber-200 px-2 py-0.5 rounded-full mb-1">
              👑 Quán Quân
            </div>
            <div className="text-3xl sm:text-4xl mb-1">{topThree[0].avatar}</div>
            <div className="w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center -mt-2 mb-1 shadow-2xs">
              1
            </div>
            <h4 className="font-extrabold text-xs sm:text-base text-slate-900 line-clamp-1">
              {topThree[0].name}
            </h4>
            <span className="text-sm sm:text-base font-black text-amber-600 mt-1">
              {topThree[0].xp} XP
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-orange-500 mt-0.5">
              <Flame className="w-3.5 h-3.5 fill-orange-500" /> {topThree[0].streak} ngày
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <div className="bg-white rounded-3xl p-3 sm:p-5 border border-slate-200 shadow-xs text-center flex flex-col items-center order-3">
            <div className="text-2xl sm:text-3xl mb-1">{topThree[2].avatar}</div>
            <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center -mt-2 mb-1 shadow-2xs">
              3
            </div>
            <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 line-clamp-1">
              {topThree[2].name}
            </h4>
            <span className="text-xs sm:text-sm font-black text-sky-600 mt-1">
              {topThree[2].xp} XP
            </span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-orange-500 mt-0.5">
              <Flame className="w-3 h-3 fill-orange-500" /> {topThree[2].streak}
            </div>
          </div>
        )}
      </div>

      {/* Complete Rankings List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>Hạng & Học viên</span>
          <span>Điểm kinh nghiệm</span>
        </div>

        <div className="divide-y divide-slate-100">
          {leaderboardList.map((entry) => {
            return (
              <div
                key={entry.id}
                className={`p-4 flex items-center justify-between transition-colors ${
                  entry.isUser
                    ? 'bg-sky-50/90 border-l-4 border-sky-500 font-bold'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank number */}
                  <span
                    className={`w-7 text-center font-black text-sm ${
                      entry.rank === 1
                        ? 'text-amber-500'
                        : entry.rank === 2
                        ? 'text-slate-500'
                        : entry.rank === 3
                        ? 'text-amber-700'
                        : 'text-slate-400'
                    }`}
                  >
                    #{entry.rank}
                  </span>

                  {/* Avatar */}
                  <span className="text-2xl">{entry.avatar}</span>

                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm sm:text-base ${
                          entry.isUser ? 'font-black text-sky-950' : 'font-extrabold text-slate-800'
                        }`}
                      >
                        {entry.name}
                      </span>
                      {entry.isUser && (
                        <span className="text-[10px] font-extrabold bg-sky-500 text-white px-2 py-0.5 rounded-full">
                          BẠN
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-0.5 text-orange-500 font-bold">
                        <Flame className="w-3 h-3 fill-orange-500" /> {entry.streak} ngày
                      </span>
                      <span>•</span>
                      <span>Giải {entry.league}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm sm:text-base font-black text-slate-800">
                    {entry.xp.toLocaleString()} XP
                  </span>
                  <div className="flex items-center justify-end gap-1 text-[11px] font-semibold text-slate-400">
                    {entry.change === 'up' && (
                      <span className="text-emerald-600 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-0.5" /> Tăng hạng
                      </span>
                    )}
                    {entry.change === 'down' && (
                      <span className="text-rose-500 flex items-center">
                        <TrendingDown className="w-3 h-3 mr-0.5" /> Giảm
                      </span>
                    )}
                    {entry.change === 'same' && (
                      <span className="flex items-center text-slate-400">
                        <Minus className="w-3 h-3" /> Giữ nguyên
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Missions for XP */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-sky-500" />
          <h3 className="font-extrabold text-base text-slate-800">
            Nhiệm vụ tuần nhận thêm điểm XP
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800">Học 15 thẻ từ vựng mới</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Tiến độ: 10/15</p>
            </div>
            <span className="text-xs font-black text-sky-600 bg-sky-100 px-2.5 py-1 rounded-xl">
              +50 XP
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800">Hội thoại 3 lượt với AI</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Tiến độ: 3/3</p>
            </div>
            <span className="text-xs font-black text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-xl flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Đã nhận
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
