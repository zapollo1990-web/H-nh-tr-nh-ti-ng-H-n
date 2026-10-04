import React from 'react';
import {
  Flame,
  Sparkles,
  BookOpen,
  User,
  Settings,
  ShieldCheck,
  Compass,
  Award,
  Crown,
  Users,
  LogIn,
  MessageSquareText,
  Bot
} from 'lucide-react';
import { playClickSound } from '../utils/audio';
import { AppUser } from '../types';
import { isDesignatedAdminEmail } from '../services/authService';

export type MainAppTab = 'learning' | 'vocabulary' | 'conversation' | 'profile';

interface NavbarProps {
  activeTab: MainAppTab;
  setActiveTab: (tab: MainAppTab) => void;
  streak: number;
  totalXp: number;
  onOpenStreakModal: () => void;
  onOpenSettingsModal: () => void;
  currentUser: AppUser | null;
  onOpenAuthModal: () => void;
  onOpenPlayerManagement?: () => void;
  isAdminLoggedIn?: boolean;
  accuracyPercent?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  streak,
  totalXp,
  onOpenStreakModal,
  onOpenSettingsModal,
  currentUser,
  onOpenAuthModal,
  onOpenPlayerManagement,
  isAdminLoggedIn = false,
  accuracyPercent = 100,
}) => {
  const isUserAdmin = Boolean(
    currentUser &&
      (currentUser.role === 'admin' ||
        currentUser.isServerAdmin ||
        isDesignatedAdminEmail(currentUser.email))
  );

  const navTabs = [
    {
      id: 'learning' as const,
      label: 'Học tập',
      sublabel: 'Lộ trình chặng đường',
      icon: Compass,
      activeColor: 'from-sky-500 to-indigo-600',
    },
    {
      id: 'vocabulary' as const,
      label: 'Từ vựng & ngữ pháp',
      sublabel: 'Từ vựng & Ôn tập',
      icon: BookOpen,
      activeColor: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'conversation' as const,
      label: 'Giao tiếp',
      sublabel: 'Hội thoại AI không giới hạn',
      icon: MessageSquareText,
      activeColor: 'from-violet-500 to-purple-600',
    },
    {
      id: 'profile' as const,
      label: 'Tôi',
      sublabel: 'Trò chơi, Thi thử & Tiến độ',
      icon: User,
      activeColor: 'from-amber-500 to-orange-600',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand logo */}
          <div
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none"
            onClick={() => {
              playClickSound();
              setActiveTab('learning');
            }}
            id="brand-logo"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-400 to-sky-300 flex items-center justify-center shadow-md shadow-sky-100 border-2 border-white text-xl sm:text-2xl transition-transform hover:scale-105 active:scale-95">
              🐰
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base sm:text-lg text-slate-800 tracking-tight">
                  한국어 여정
                </span>
                <span className="text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  1000+ từ
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-semibold hidden xs:block">
                Lộ trình học tiếng Hàn chặng đường
              </p>
            </div>
          </div>

          {/* Desktop/Tablet Middle Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => {
                    playClickSound();
                    setActiveTab(tab.id);
                  }}
                  className={`flex items-center gap-2 px-4 lg:px-5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-sky-600' : 'text-slate-500'
                    }`}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status Badges: Streak, XP & User/Admin Portal */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Streak Counter */}
            <button
              id="streak-button"
              onClick={onOpenStreakModal}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-amber-200 hover:border-amber-300 text-amber-700 shadow-xs transition-all hover:scale-102 active:scale-95 cursor-pointer"
              title="Xem chuỗi ngày học liên tiếp"
            >
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
              <span className="text-xs sm:text-sm font-black">{streak}</span>
              <span className="text-[10px] sm:text-xs font-semibold text-amber-600 hidden sm:inline">
                ngày
              </span>
            </button>

            {/* XP Pill */}
            <div
              id="xp-pill"
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-sky-50 border border-sky-200 text-sky-700 shadow-xs"
              title="Tổng điểm kinh nghiệm"
            >
              <Sparkles className="w-4 h-4 text-sky-500" />
              <span className="text-xs sm:text-sm font-black">{totalXp}</span>
              <span className="text-[10px] sm:text-xs font-bold text-sky-600 hidden sm:inline">XP</span>
            </div>


            {/* User Account Button / Login Prompt */}
            {currentUser ? (
              <button
                onClick={() => {
                  playClickSound();
                  setActiveTab('profile');
                }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl border transition-all hover:scale-102 active:scale-95 cursor-pointer shadow-xs bg-slate-50 border-slate-200 text-slate-800"
                title={`Đang đăng nhập: ${currentUser.name}`}
              >
                <span className="text-sm">{currentUser.avatar || '🎓'}</span>
                <span className="text-xs font-bold truncate max-w-[85px] hidden sm:inline">
                  {currentUser.name.split(' ').slice(-1)[0]}
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  playClickSound();
                  onOpenAuthModal();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-xs hover:scale-102 active:scale-95 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Đăng Nhập</span>
              </button>
            )}

            {/* Settings button */}
            <button
              id="settings-button"
              onClick={onOpenSettingsModal}
              className="flex items-center justify-center p-2 sm:px-2.5 sm:py-1.5 rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all hover:scale-102 active:scale-95 cursor-pointer shadow-xs"
              title="Cài đặt từ vựng & âm thanh"
            >
              <Settings className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 shadow-lg flex items-center justify-around safe-area-pb">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playClickSound();
                setActiveTab(tab.id);
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? 'text-sky-600 font-black'
                  : 'text-slate-500 hover:text-slate-800 font-bold'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-sky-50 scale-110' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
