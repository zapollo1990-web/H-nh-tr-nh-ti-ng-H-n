import React, { useState } from 'react';
import { BookOpen, Sparkles, Brain, Award, Layers, BookmarkCheck, FileText } from 'lucide-react';
import { FlashcardView } from './FlashcardView';
import { PracticeView } from './PracticeView';
import { GrammarNotebookView } from './GrammarNotebookView';
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

  return (
    <div className="space-y-6">
      {/* 3-Part Sub Navigation: Từ vựng, Toàn bộ Ngữ pháp & Ôn tập */}
      <div className="bg-white rounded-3xl p-1.5 border border-slate-200 shadow-xs flex items-center gap-1.5 max-w-xl mx-auto overflow-x-auto scrollbar-none">
        <button
          onClick={() => {
            playClickSound();
            setSubTab('vocab');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'vocab'
              ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          <span>Sổ tay Từ vựng (1000+)</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setSubTab('grammar');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'grammar'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span>Ngữ pháp toàn diện</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setSubTab('practice');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'practice'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Brain className="w-4 h-4 shrink-0" />
          <span>Ôn tập & Luyện thi</span>
        </button>
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
