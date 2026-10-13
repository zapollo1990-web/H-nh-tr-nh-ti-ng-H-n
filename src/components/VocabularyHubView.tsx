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
      {/* 3-Part Sub Navigation: Từ vựng, Ngữ pháp & Ôn tập */}
      <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 max-w-md mx-auto border border-slate-200/80">
        <button
          onClick={() => {
            playClickSound();
            setSubTab('vocab');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'vocab'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          <span>Từ vựng</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setSubTab('grammar');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'grammar'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <FileText className="w-3.5 h-3.5 shrink-0" />
          <span>Ngữ pháp</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setSubTab('practice');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'practice'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Brain className="w-3.5 h-3.5 shrink-0" />
          <span>Ôn tập</span>
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
