import React, { useState, useEffect } from 'react';
import { Sun, Moon, Palette, Check } from 'lucide-react';
import {
  StudyBackgroundTheme,
  BG_THEMES,
  getSavedStudyTheme,
  saveStudyTheme,
} from '../data/studyThemes';
import { playClickSound } from '../utils/audio';

interface StudyThemeBarProps {
  currentTheme: StudyBackgroundTheme;
  onThemeChange: (theme: StudyBackgroundTheme) => void;
  className?: string;
  variant?: 'compact' | 'full';
}

export const StudyThemeBar: React.FC<StudyThemeBarProps> = ({
  currentTheme,
  onThemeChange,
  className = '',
  variant = 'compact',
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const activeBg = BG_THEMES[currentTheme] || BG_THEMES.classroom;

  // Toggle between light & dark
  const handleQuickToggle = () => {
    playClickSound();
    const nextTheme: StudyBackgroundTheme = activeBg.isDark ? 'classroom' : 'midnight';
    saveStudyTheme(nextTheme);
    onThemeChange(nextTheme);
  };

  const handleSelectTheme = (themeId: StudyBackgroundTheme) => {
    playClickSound();
    saveStudyTheme(themeId);
    onThemeChange(themeId);
    setIsPickerOpen(false);
  };

  return (
    <div className={`relative flex items-center gap-1.5 ${className}`}>
      {/* 1-Click Quick Sáng / Tối Toggle */}
      <button
        onClick={handleQuickToggle}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95 ${activeBg.themeToggleBtnClass}`}
        title={
          activeBg.isDark
            ? 'Đang bật nền tối • Bấm để đổi sang Nền Sáng (Chữ đen rõ nét ☀️)'
            : 'Đang bật nền sáng • Bấm để đổi sang Nền Tối (Dịu mắt ban đêm 🌙)'
        }
      >
        {activeBg.isDark ? (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
            <span className="hidden sm:inline">Nền Sáng</span>
          </>
        ) : (
          <>
            <Moon className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">Nền Tối</span>
          </>
        )}
      </button>

      {/* Palette Picker Dropdown */}
      <div className="relative">
        <button
          onClick={() => {
            playClickSound();
            setIsPickerOpen(!isPickerOpen);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95 ${activeBg.headerBtnClass}`}
          title="Chọn bảng màu nền chi tiết (6 tông màu)"
        >
          <Palette className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-xs">{activeBg.icon}</span>
          <span className="hidden md:inline">{activeBg.name}</span>
        </button>

        {/* Dropdown Menu */}
        {isPickerOpen && (
          <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl bg-slate-900/98 backdrop-blur-xl border border-white/20 shadow-2xl p-2.5 space-y-2 text-white animate-scale-up">
            {/* Category: Nền Sáng */}
            <div>
              <div className="px-2 py-1 text-[10px] uppercase font-black tracking-wider text-amber-400 flex items-center gap-1">
                <Sun className="w-3 h-3 text-amber-400" />
                <span>Nền Sáng • Chữ đen rõ nét</span>
              </div>
              <div className="space-y-1 mt-1">
                {Object.values(BG_THEMES)
                  .filter((t) => !t.isDark)
                  .map((thm) => (
                    <button
                      key={thm.id}
                      onClick={() => handleSelectTheme(thm.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        currentTheme === thm.id
                          ? 'bg-amber-500/30 text-amber-200 border border-amber-400/60'
                          : 'hover:bg-white/10 text-slate-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-sm">{thm.icon}</span>
                        <span className="leading-tight">{thm.name}</span>
                      </span>
                      {currentTheme === thm.id && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 my-1" />

            {/* Category: Nền Tối */}
            <div>
              <div className="px-2 py-1 text-[10px] uppercase font-black tracking-wider text-sky-400 flex items-center gap-1">
                <Moon className="w-3 h-3 text-sky-400" />
                <span>Nền Tối • Chữ sáng dịu mắt</span>
              </div>
              <div className="space-y-1 mt-1">
                {Object.values(BG_THEMES)
                  .filter((t) => t.isDark)
                  .map((thm) => (
                    <button
                      key={thm.id}
                      onClick={() => handleSelectTheme(thm.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        currentTheme === thm.id
                          ? 'bg-sky-500/30 text-sky-200 border border-sky-400/60'
                          : 'hover:bg-white/10 text-slate-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-sm">{thm.icon}</span>
                        <span className="leading-tight">{thm.name}</span>
                      </span>
                      {currentTheme === thm.id && <Check className="w-3.5 h-3.5 text-sky-400" />}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
