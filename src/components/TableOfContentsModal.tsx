import React, { useState } from 'react';
import { X, Layers, CheckCircle2, Lock, ChevronRight, Compass, Star, Trophy } from 'lucide-react';
import { STAGES_CANDY_CRUSH_DATA, StageCandyCrushConfig } from '../data/stagesCandyCrushData';
import { playClickSound } from '../utils/audio';

interface TableOfContentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLevel: 'foundation_lv1' | 'basic_lv2' | 'advanced_lv3';
  onSelectLevel: (level: 'foundation_lv1' | 'basic_lv2' | 'advanced_lv3') => void;
  onSelectStage: (stageNumber: number) => void;
  completedStageNumbers: number[];
}

export const TableOfContentsModal: React.FC<TableOfContentsModalProps> = ({
  isOpen,
  onClose,
  activeLevel,
  onSelectLevel,
  onSelectStage,
  completedStageNumbers,
}) => {
  const [filterLevel, setFilterLevel] = useState<'all' | 'foundation_lv1' | 'basic_lv2' | 'advanced_lv3'>(activeLevel);

  if (!isOpen) return null;

  const levels = [
    { id: 'foundation_lv1' as const, label: 'Nền tảng - LV1', range: 'Chặng 1 - 8', icon: '🌱', color: 'text-sky-600 bg-sky-50 border-sky-200' },
    { id: 'basic_lv2' as const, label: 'Căn bản - LV2', range: 'Chặng 9 - 16', icon: '🚀', color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { id: 'advanced_lv3' as const, label: 'Nâng cao - LV3', range: 'Chặng 17 - 20', icon: '👑', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  ];

  const filteredStages = filterLevel === 'all'
    ? STAGES_CANDY_CRUSH_DATA
    : STAGES_CANDY_CRUSH_DATA.filter((s) => s.levelCategory === filterLevel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full flex flex-col shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-white/10 text-xl">
              📑
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Mục Lục Chủ Đề Học
              </h3>
              <p className="text-xs text-slate-300">
                Toàn bộ 20 chặng lộ trình chia theo 3 cấp độ
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Level Filters */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => {
              playClickSound();
              setFilterLevel('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              filterLevel === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Tất cả (20 chặng)
          </button>

          {levels.map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => {
                playClickSound();
                setFilterLevel(lvl.id);
                onSelectLevel(lvl.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                filterLevel === lvl.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{lvl.icon}</span>
              <span>{lvl.label}</span>
            </button>
          ))}
        </div>

        {/* Stage List */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-2 flex-1">
          {filteredStages.map((stage) => {
            const isCompleted = completedStageNumbers.includes(stage.stageNumber);
            const isUnlocked = stage.stageNumber === 1 || completedStageNumbers.includes(stage.stageNumber - 1);

            return (
              <div
                key={stage.stageNumber}
                onClick={() => {
                  playClickSound();
                  onSelectLevel(stage.levelCategory);
                  onSelectStage(stage.stageNumber);
                  onClose();
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                  isCompleted
                    ? 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/70'
                    : isUnlocked
                    ? 'bg-white border-slate-200 hover:border-purple-300 hover:shadow-xs'
                    : 'bg-slate-50 border-slate-200 opacity-70'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-2xs border border-slate-200 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                    {stage.icon}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-100 px-2 py-0.2 rounded-md">
                        Chặng {stage.stageNumber}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {stage.levelLabel}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-black text-slate-800 truncate mt-0.5">
                      {stage.title}
                    </h4>
                    <p className="text-[11px] font-mono text-purple-600 font-bold truncate">
                      {stage.koreanTitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isCompleted ? (
                    <span className="flex items-center gap-1 text-[11px] font-black text-emerald-600 bg-white px-2 py-1 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Hoàn thành</span>
                    </span>
                  ) : isUnlocked ? (
                    <span className="flex items-center gap-1 text-[11px] font-black text-purple-600 group-hover:translate-x-0.5 transition-transform">
                      <span>Vào học</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                      <Lock className="w-3 h-3" />
                      <span>Khóa</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
