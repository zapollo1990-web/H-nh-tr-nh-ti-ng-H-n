import React from 'react';
import { X, Check, Star, Sparkles } from 'lucide-react';
import {
  COMPANION_LIST,
  CompanionId,
  CompanionAvatar,
  getActiveCompanionId,
  setActiveCompanionId,
} from '../data/companionCharacters';
import { playClickSound, playSuccessSound } from '../utils/audio';

interface CompanionSquadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCompanion?: (id: CompanionId) => void;
}

const getBrightRoleColor = (id: CompanionId) => {
  switch (id) {
    case 'na':
      return 'text-rose-600 dark:text-rose-300';
    case 'rin':
      return 'text-amber-600 dark:text-amber-300';
    case 'min':
      return 'text-sky-600 dark:text-sky-300';
    case 'lumi':
      return 'text-purple-600 dark:text-purple-300';
    case 'sora':
      return 'text-emerald-600 dark:text-emerald-300';
    default:
      return 'text-slate-600 dark:text-slate-300';
  }
};

export const CompanionSquadModal: React.FC<CompanionSquadModalProps> = ({
  isOpen,
  onClose,
  onSelectCompanion,
}) => {
  const [selectedId, setSelectedId] = React.useState<CompanionId>(() => getActiveCompanionId());

  if (!isOpen) return null;

  const handleChoose = (id: CompanionId) => {
    playSuccessSound();
    setSelectedId(id);
    setActiveCompanionId(id);
    if (onSelectCompanion) {
      onSelectCompanion(id);
    }
  };

  const currentBuddy = COMPANION_LIST.find((c) => c.id === selectedId) || COMPANION_LIST[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh]">
        {/* Header banner */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-pink-500 via-sky-500 to-purple-600 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-white/20 backdrop-blur-xs text-xl">🐧</span>
              <div>
                <span className="text-[10px] font-black tracking-wider uppercase bg-white/20 px-2 py-0.5 rounded-full">
                  StudyBuddy Squad
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  5 Người bạn đồng hành tiếng Hàn
                </h3>
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
          <p className="text-xs text-white/90 mt-2 font-medium">
            "Học không chỉ là cố gắng, mà còn là niềm vui! Cùng nhau, chúng ta làm được! 💕"
          </p>
        </div>

        {/* Body content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Active Companion Feature Banner - Khung nền đổi màu ấn tượng trong nền tối */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-gradient-to-r dark:from-slate-800/95 dark:to-indigo-950/80 border border-slate-200/80 dark:border-indigo-500/50 dark:shadow-[0_0_20px_rgba(99,102,241,0.2)] flex items-center gap-4 transition-all">
            <CompanionAvatar characterId={currentBuddy.id} size={64} showBadge />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {currentBuddy.name}
                </span>
                <span
                  className="text-[10px] font-black px-2 py-0.5 rounded-full text-white shadow-xs"
                  style={{ backgroundColor: currentBuddy.primaryColor }}
                >
                  {currentBuddy.role}
                </span>
                <span className="text-xs text-amber-500 dark:text-amber-300 flex items-center gap-0.5 ml-auto font-black">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  Bạn chính
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-amber-200 mt-1 italic font-semibold">
                "{currentBuddy.catchphrase}"
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-100 mt-0.5 font-medium">
                Chuyên môn: {currentBuddy.specialty}
              </p>
            </div>
          </div>

          <div className="text-xs font-black text-slate-600 dark:text-sky-300 uppercase tracking-wider">
            Chọn bạn đồng hành chính của bạn:
          </div>

          {/* List of 5 Companions - Khung nền đổi màu & màu chữ sáng trong nền tối */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {COMPANION_LIST.map((buddy) => {
              const isSelected = buddy.id === selectedId;
              return (
                <div
                  key={buddy.id}
                  onClick={() => handleChoose(buddy.id)}
                  className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 relative ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50/80 dark:bg-gradient-to-r dark:from-sky-950/90 dark:to-indigo-950/90 dark:border-sky-400 dark:shadow-[0_0_15px_rgba(56,189,248,0.35)] scale-101'
                      : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 hover:border-slate-300 hover:dark:bg-slate-800 hover:dark:border-indigo-400/60'
                  }`}
                >
                  <CompanionAvatar characterId={buddy.id} size={48} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-slate-900 dark:text-white">
                        {buddy.name}
                      </span>
                      {isSelected ? (
                        <span className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      ) : null}
                    </div>
                    <div className={`text-xs font-bold ${getBrightRoleColor(buddy.id)}`}>
                      {buddy.role}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-100 truncate mt-0.5 font-medium">
                      {buddy.shortDesc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Role cooperation description - Khung nền đổi màu tím/chàm sang trọng & chữ sáng rõ ràng */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-gradient-to-br dark:from-slate-900/95 dark:to-purple-950/80 border border-indigo-100 dark:border-purple-500/50 dark:shadow-[0_0_20px_rgba(168,85,247,0.2)] text-xs space-y-1.5 transition-all">
            <div className="font-black flex items-center gap-1.5 text-indigo-700 dark:text-purple-300 text-xs sm:text-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-purple-300" />
              Cách 5 người bạn cùng hỗ trợ bạn trong suốt bài học:
            </div>
            <div className="text-[11px] sm:text-xs leading-relaxed space-y-1 mt-1 text-slate-700 dark:text-slate-100 font-medium">
              <p>• <strong className="text-pink-600 dark:text-pink-300 font-bold">Na (Hồng):</strong> Giảng giải từ vựng, ngữ pháp và phát âm chuẩn Seoul.</p>
              <p>• <strong className="text-amber-600 dark:text-amber-300 font-bold">Rin (Vàng):</strong> Mẹo nhớ từ nhanh, hướng dẫn làm bài tập chi tiết.</p>
              <p>• <strong className="text-sky-600 dark:text-sky-300 font-bold">Min (Xanh dương):</strong> Chuyên gia luyện đề trắc nghiệm và bấm giờ kiểm tra chặng.</p>
              <p>• <strong className="text-purple-600 dark:text-purple-300 font-bold">Lumi (Tím):</strong> Cổ vũ tinh thần, khen ngợi và truyền động lực tích cực.</p>
              <p>• <strong className="text-emerald-600 dark:text-emerald-300 font-bold">Sora (Xanh lá):</strong> Quản lý thời gian, giữ vững chuỗi học tập hàng ngày!</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-gradient-to-r dark:from-sky-500 dark:to-indigo-500 text-white font-black text-xs hover:bg-slate-800 dark:hover:from-sky-400 dark:hover:to-indigo-400 transition-all cursor-pointer shadow-xs dark:shadow-[0_0_12px_rgba(56,189,248,0.3)]"
          >
            Đồng ý & Tiếp tục học
          </button>
        </div>
      </div>
    </div>
  );
};
