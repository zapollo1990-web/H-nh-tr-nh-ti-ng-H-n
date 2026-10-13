import React from 'react';
import {
  Flame,
  Sparkles,
  BookOpen,
  User,
  Settings,
  Compass,
  MessageSquareText,
  Sun,
  Moon,
} from 'lucide-react';
import { playClickSound } from '../utils/audio';
import {
  CompanionAvatar,
  CompanionId,
  getActiveCompanionId,
  COMPANION_CHARACTERS,
} from '../data/companionCharacters';

export type MainAppTab = 'learning' | 'vocabulary' | 'conversation' | 'profile';

interface NavbarProps {
  activeTab: MainAppTab;
  setActiveTab: (tab: MainAppTab) => void;
  streak: number;
  totalXp: number;
  onOpenStreakModal: () => void;
  onOpenSettingsModal: () => void;
  currentUser?: any;
  onOpenAuthModal?: () => void;
  onOpenPlayerManagement?: () => void;
  isAdminLoggedIn?: boolean;
  accuracyPercent?: number;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onOpenCompanionSquad?: () => void;
  activeCompanionId?: CompanionId;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  streak,
  totalXp,
  onOpenStreakModal,
  onOpenSettingsModal,
  theme = 'light',
  onToggleTheme,
  onOpenCompanionSquad,
  activeCompanionId,
}) => {
  const currentCompanion = COMPANION_CHARACTERS[activeCompanionId || getActiveCompanionId()] || COMPANION_CHARACTERS.na;

  const navTabs = [
    {
      id: 'learning' as const,
      label: 'Học tập',
      icon: Compass,
    },
    {
      id: 'vocabulary' as const,
      label: 'Từ vựng & Ngữ pháp',
      icon: BookOpen,
    },
    {
      id: 'conversation' as const,
      label: 'Giao tiếp',
      icon: MessageSquareText,
    },
    {
      id: 'profile' as const,
      label: 'Tôi',
      icon: User,
    },
  ];

  return (
    <>
      {/* Sleek Top Utility Bar: No app name, No account username, Only Companion Avatar, Streak, XP, Theme Toggle and Settings */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-neutral-800 shadow-xs transition-colors">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between">
          {/* Left stats: Companion mascot character button + Streak & XP */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Companion Character Button (Replaces logo inside app) */}
            <button
              onClick={() => {
                playClickSound();
                if (onOpenCompanionSquad) onOpenCompanionSquad();
              }}
              className="flex items-center gap-1.5 p-1 rounded-2xl hover:bg-slate-100 dark:hover:bg-neutral-800 transition-all cursor-pointer group"
              title={`Bạn đồng hành: ${currentCompanion.name} (${currentCompanion.role}) - Bấm để chọn`}
            >
              <div className="relative">
                <CompanionAvatar characterId={currentCompanion.id} size={36} />
                <span
                  className="absolute -bottom-0.5 -right-0.5 text-[8px] font-black px-1 rounded-full text-white shadow-xs"
                  style={{ backgroundColor: currentCompanion.primaryColor }}
                >
                  {currentCompanion.name}
                </span>
              </div>
            </button>

            <button
              id="streak-button"
              onClick={() => {
                playClickSound();
                onOpenStreakModal();
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 shadow-2xs hover:bg-amber-100/80 transition-all cursor-pointer font-black text-xs sm:text-sm"
              title="Chuỗi ngày học liên tiếp"
            >
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
              <span>{streak} ngày</span>
            </button>

            <div
              id="xp-pill"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 shadow-2xs font-black text-xs sm:text-sm"
              title="Tổng điểm kinh nghiệm"
            >
              <Sparkles className="w-4 h-4 text-sky-500" />
              <span>{totalXp} XP</span>
            </div>
          </div>

          {/* Right: Theme Toggle (Trắng / Đen) & Settings button */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Theme Switch: White / Black background */}
            {onToggleTheme && (
              <button
                onClick={() => {
                  playClickSound();
                  onToggleTheme();
                }}
                className="flex items-center justify-center p-2 rounded-2xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-700 dark:text-amber-300 hover:bg-slate-100 dark:hover:bg-neutral-700 transition-all cursor-pointer shadow-2xs"
                title={theme === 'dark' ? 'Đổi sang nền Trắng (Light Mode)' : 'Đổi sang nền Đen (Dark Mode)'}
                aria-label="Đổi màu nền sáng/tối"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 animate-spin-slow" />
                ) : (
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                )}
              </button>
            )}

            <button
              id="settings-button"
              onClick={() => {
                playClickSound();
                onOpenSettingsModal();
              }}
              className="flex items-center justify-center p-2 rounded-2xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-700 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-2xs"
              title="Cài đặt ứng dụng"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 dark:text-neutral-300" />
            </button>
          </div>
        </div>
      </header>

      {/* Main App Navigation Bar Fixed At The Bottom For All Screens */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-slate-200 dark:border-neutral-800 shadow-xl safe-area-pb transition-colors">
        <div className="max-w-md mx-auto flex items-center justify-around py-1.5 px-2">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`bottom-nav-${tab.id}`}
                onClick={() => {
                  playClickSound();
                  setActiveTab(tab.id);
                }}
                className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all cursor-pointer ${
                  isActive
                    ? 'text-purple-700 dark:text-purple-300 font-black'
                    : 'text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-neutral-200 font-bold'
                }`}
              >
                <div
                  className={`p-1 rounded-xl transition-transform ${
                    isActive
                      ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 scale-110 shadow-2xs'
                      : 'text-slate-500 dark:text-neutral-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight truncate max-w-[80px]">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
