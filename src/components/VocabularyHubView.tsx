import React, { useState } from 'react';
import { BookOpen, Sparkles, Brain, Award, Layers, BookmarkCheck, FileText } from 'lucide-react';
import { FlashcardView } from './FlashcardView';
import { PracticeView } from './PracticeView';
import { GrammarNotebookView } from './GrammarNotebookView';
import { StudyThemeBar } from './StudyThemeBar';
import {
  StudyBackgroundTheme,
  BG_THEMES,
  getSavedStudyTheme,
} from '../data/studyThemes';
import { Flashcard } from '../types';
import { playClickSound } from '../utils/audio';

interface VocabularyHubViewProps {
  cards: Flashcard[];
  masteredCardIds: string[];
  onToggleMastered: (cardId: string) => void;
  onAddXp: (amount: number) => void;
  onRecordQuizResult: (isCorrect: boolean) => void;
  onOpenSettings?: () => void;
  bookmarkedRuleIds?: string[];
  onToggleBookmarkRule?: (ruleId: string) => void;
  savedMistakes?: Array<{
    id: string;
    sentence: string;
    correction: string;
    note: string;
    date: string;
  }>;
  onSaveMistake?: (mistake: { sentence: string; correction: string; note: string }) => void;
  onDeleteMistake?: (id: string) => void;
}

export const VocabularyHubView: React.FC<VocabularyHubViewProps> = ({
  cards,
  masteredCardIds,
  onToggleMastered,
  onAddXp,
  onRecordQuizResult,
  onOpenSettings,
  bookmarkedRuleIds = [],
  onToggleBookmarkRule = () => {},
  savedMistakes = [],
  onSaveMistake = () => {},
  onDeleteMistake = () => {},
}) => {
  const [subTab, setSubTab] = useState<'vocab' | 'grammar' | 'practice'>('vocab');
  const [studyTheme, setStudyTheme] = useState<StudyBackgroundTheme>(() => getSavedStudyTheme());

  const currentBg = BG_THEMES[studyTheme] || BG_THEMES.classroom;

  return (
    <div className={`rounded-3xl p-3 sm:p-5 transition-colors duration-500 space-y-6 ${currentBg.bgClass}`}>
      {/* Top Controls Row: Sub Navigation & 5-Companion Flexible Theme Switcher */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* 3-Part Sub Navigation: Từ vựng, Ngữ pháp & Ôn tập */}
        <div className="p-1.5 rounded-2xl flex items-center gap-1.5 w-full md:w-auto bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-indigo-400/50 shadow-xs dark:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all">
          <button
            onClick={() => {
              playClickSound();
              setSubTab('vocab');
            }}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
              subTab === 'vocab'
                ? 'bg-sky-500 text-white shadow-md dark:shadow-[0_0_12px_rgba(14,165,233,0.6)]'
                : 'text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>Từ vựng</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setSubTab('grammar');
            }}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
              subTab === 'grammar'
                ? 'bg-purple-600 text-white shadow-md dark:shadow-[0_0_12px_rgba(147,51,234,0.6)]'
                : 'text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>Ngữ pháp</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setSubTab('practice');
            }}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
              subTab === 'practice'
                ? 'bg-amber-500 text-white shadow-md dark:shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                : 'text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Brain className="w-4 h-4 shrink-0" />
            <span>Ôn tập</span>
          </button>
        </div>

        {/* Flexible Theme Bar (Giống 5 Bạn Đồng Hành: 6 tông màu Sáng/Tối + Nút nhanh ☀️/🌙) */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-300 hidden sm:inline">
            Nền linh hoạt:
          </span>
          <StudyThemeBar
            currentTheme={studyTheme}
            onThemeChange={(newTheme) => setStudyTheme(newTheme)}
          />
        </div>
      </div>


      {/* Content Rendering */}
      {subTab === 'vocab' ? (
        <FlashcardView
          cards={cards}
          masteredCardIds={masteredCardIds}
          onToggleMastered={onToggleMastered}
          onAddXp={onAddXp}
        />
      ) : subTab === 'grammar' ? (
        <GrammarNotebookView
          bookmarkedRuleIds={bookmarkedRuleIds}
          onToggleBookmarkRule={onToggleBookmarkRule}
          savedMistakes={savedMistakes}
          onSaveMistake={onSaveMistake}
          onDeleteMistake={onDeleteMistake}
          onAddXp={onAddXp}
        />
      ) : (
        <PracticeView
          onAddXp={onAddXp}
          onRecordQuizResult={onRecordQuizResult}
        />
      )}
    </div>
  );
};
