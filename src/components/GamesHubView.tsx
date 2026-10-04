import React, { useState } from 'react';
import { Gamepad2, Sprout, Fish, HelpCircle, Sparkles } from 'lucide-react';
import { FarmAndFishingView } from './FarmAndFishingView';
import { PuzzleGameView } from './PuzzleGameView';
import { playClickSound } from '../utils/audio';

interface GamesHubViewProps {
  onAddXp: (amount: number) => void;
  onShareToFeed?: (contentKo: string, contentVi: string, type: string) => void;
}

export const GamesHubView: React.FC<GamesHubViewProps> = ({ onAddXp, onShareToFeed }) => {
  const [gameTab, setGameTab] = useState<'farm_fishing' | 'puzzles'>('farm_fishing');

  return (
    <div className="space-y-6">
      {/* Game Sub-navigation Tabs */}
      <div className="bg-white rounded-3xl p-2 border border-slate-200 shadow-xs flex items-center gap-2 max-w-md mx-auto">
        <button
          onClick={() => {
            playClickSound();
            setGameTab('farm_fishing');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
            gameTab === 'farm_fishing'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sprout className="w-4 h-4" />
          <span>Nông trại & Câu cá</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setGameTab('puzzles');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
            gameTab === 'puzzles'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Game giải đố</span>
        </button>
      </div>

      {/* Render active game */}
      {gameTab === 'farm_fishing' ? (
        <FarmAndFishingView onAddXp={onAddXp} onShareToFeed={onShareToFeed} />
      ) : (
        <PuzzleGameView onAddXp={onAddXp} />
      )}
    </div>
  );
};
