import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Volume2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Star,
  Check,
  Award,
  Crown,
  Heart,
  Palette,
  Compass,
  Sun,
  Moon,
} from 'lucide-react';
import { StageSubStep } from '../data/stagesCandyCrushData';
import {
  speakKorean,
  playClickSound,
  playSuccessSound,
  playFanfareSound,
  playIncorrectSound,
} from '../utils/audio';
import {
  CompanionAvatar,
  COMPANION_CHARACTERS,
  COMPANION_LIST,
} from '../data/companionCharacters';

interface StageStepLearningModalProps {
  isOpen: boolean;
  onClose: () => void;
  stageNumber: number;
  stageTitle: string;
  step: StageSubStep | null;
  onCompleteStep: (stepId: string) => void;
  onAddXp: (amount: number) => void;
  appTheme?: 'light' | 'dark';
}

export type StudyBackgroundTheme =
  | 'classroom'
  | 'sunset'
  | 'jeju'
  | 'midnight'
  | 'coffee'
  | 'kpop';

interface BgThemeOption {
  id: StudyBackgroundTheme;
  name: string;
  category: 'light' | 'dark';
  icon: string;
  badgeLabel: string;
  isDark: boolean;
  bgClass: string;

  // Header & Navigation
  headerClass: string;
  headerBtnClass: string;
  headerTextClass: string;
  headerSubtextClass: string;
  progressTextClass: string;
  progressTrackClass: string;
  themeToggleBtnClass: string;

  // Step Title & Banner
  stepBadgeClass: string;
  titleClass: string;

  // 1. Na Tutor Card
  naCardClass: string;
  naTitleClass: string;
  naBadgeClass: string;
  naTextClass: string;

  // 2. Core Knowledge Card
  coreCardClass: string;
  coreKoreanClass: string;
  coreRomanClass: string;
  coreMeaningClass: string;
  audioBtnClass: string;

  // 3. Rin Tip Card
  rinCardClass: string;
  rinTitleClass: string;
  rinBadgeClass: string;
  rinTextClass: string;

  // 4. Min Quiz Card
  quizCardClass: string;
  quizHeaderBorderClass: string;
  quizTitleClass: string;
  quizSubtextClass: string;
  quizScoreBadgeClass: string;
  quizQuestionClass: string;
  quizOptionDefault: string;
  quizOptionInactive: string;

  // Lumi Cheer Card
  lumiCardClass: string;
  lumiTitleClass: string;
  lumiTextClass: string;
  quizExplanationClass: string;
  nextBtnClass: string;

  // 5. Completion Screen
  completionTitleClass: string;
  completionSubtitleClass: string;
  completionBtnClass: string;
}

export const BG_THEMES: Record<StudyBackgroundTheme, BgThemeOption> = {
  // 1. NỀN SÁNG: GIẢNG ĐƯỜNG TRẮNG TINH (CHỮ ĐEN ĐẬM SIÊU RÕ NÉT)
  classroom: {
    id: 'classroom',
    name: 'Giảng đường sáng (Trắng)',
    category: 'light',
    icon: '🏫',
    badgeLabel: 'Nền sáng • Chữ đen rõ nét',
    isDark: false,
    bgClass: 'bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0]',

    headerClass: 'bg-white/95 backdrop-blur-md border-b border-slate-200/90 text-slate-800 shadow-sm',
    headerBtnClass: 'bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 border border-slate-300/80 shadow-2xs',
    headerTextClass: 'text-slate-900 font-extrabold',
    headerSubtextClass: 'text-slate-600 font-bold',
    progressTextClass: 'text-slate-800 font-black',
    progressTrackClass: 'bg-slate-200',
    themeToggleBtnClass: 'bg-amber-100/80 hover:bg-amber-200/80 text-amber-900 border border-amber-300 shadow-2xs',

    stepBadgeClass: 'bg-slate-900/10 text-slate-800 border border-slate-300 font-black',
    titleClass: 'text-slate-950 font-black drop-shadow-xs',

    naCardClass: 'bg-white/95 backdrop-blur-md border-2 border-rose-200/90 text-slate-800 shadow-lg',
    naTitleClass: 'text-rose-700 font-black',
    naBadgeClass: 'bg-rose-100 text-rose-800 font-bold border border-rose-200',
    naTextClass: 'text-slate-800 font-semibold',

    coreCardClass: 'bg-white/95 backdrop-blur-md border-2 border-slate-200/90 text-slate-900 shadow-2xl',
    coreKoreanClass: 'text-indigo-950 font-black drop-shadow-xs',
    coreRomanClass: 'text-indigo-600 font-black font-mono',
    coreMeaningClass: 'text-emerald-700 font-black',
    audioBtnClass: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg',

    rinCardClass: 'bg-white/95 backdrop-blur-md border-2 border-amber-200/90 text-slate-800 shadow-lg',
    rinTitleClass: 'text-amber-800 font-black',
    rinBadgeClass: 'bg-amber-100 text-amber-900 font-bold border border-amber-200',
    rinTextClass: 'text-slate-800 font-semibold',

    quizCardClass: 'bg-white/95 backdrop-blur-md border-2 border-slate-200 text-slate-900 shadow-2xl',
    quizHeaderBorderClass: 'border-slate-200',
    quizTitleClass: 'text-sky-700 font-black',
    quizSubtextClass: 'text-slate-600 font-bold',
    quizScoreBadgeClass: 'bg-emerald-50 border-2 border-emerald-300 text-emerald-800 font-black',
    quizQuestionClass: 'text-slate-950 font-black',
    quizOptionDefault: 'bg-slate-50 hover:bg-sky-50 text-slate-900 border-2 border-slate-200 hover:border-sky-400 font-bold shadow-xs',
    quizOptionInactive: 'bg-slate-100 text-slate-400 border-slate-200 opacity-50',

    lumiCardClass: 'bg-purple-50/95 border-2 border-purple-200 text-slate-900 shadow-md',
    lumiTitleClass: 'text-purple-800 font-black',
    lumiTextClass: 'text-purple-950 font-bold',
    quizExplanationClass: 'text-slate-700 font-semibold',
    nextBtnClass: 'bg-purple-600 hover:bg-purple-700 text-white font-black shadow-lg',

    completionTitleClass: 'text-slate-950 font-black',
    completionSubtitleClass: 'text-slate-700 font-bold',
    completionBtnClass: 'bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-xl',
  },

  // 2. NỀN ẤM: HOÀNG HÔN ẤM (VÀNG CAM • CHỮ NÂU ĐẬM SẮC NÉT)
  sunset: {
    id: 'sunset',
    name: 'Hoàng hôn ấm (Cam vàng)',
    category: 'light',
    icon: '🌇',
    badgeLabel: 'Nền ấm • Chữ nâu đậm sắc nét',
    isDark: false,
    bgClass: 'bg-gradient-to-br from-[#FFFBEB] via-[#FEF3C7] to-[#FDE68A]',

    headerClass: 'bg-amber-900/10 backdrop-blur-md border-b border-amber-300/60 text-stone-900 shadow-sm',
    headerBtnClass: 'bg-amber-100 hover:bg-amber-200 active:scale-95 text-amber-950 border border-amber-300/80 shadow-2xs',
    headerTextClass: 'text-stone-950 font-extrabold',
    headerSubtextClass: 'text-stone-700 font-bold',
    progressTextClass: 'text-stone-900 font-black',
    progressTrackClass: 'bg-amber-200/90',
    themeToggleBtnClass: 'bg-amber-200 hover:bg-amber-300 text-amber-950 border border-amber-400 shadow-2xs',

    stepBadgeClass: 'bg-amber-900/10 text-stone-900 border border-amber-300 font-black',
    titleClass: 'text-stone-950 font-black drop-shadow-xs',

    naCardClass: 'bg-white/95 backdrop-blur-md border-2 border-rose-200 text-stone-900 shadow-lg',
    naTitleClass: 'text-rose-800 font-black',
    naBadgeClass: 'bg-rose-100 text-rose-900 font-bold border border-rose-200',
    naTextClass: 'text-stone-800 font-semibold',

    coreCardClass: 'bg-white/95 backdrop-blur-md border-2 border-amber-300/90 text-stone-900 shadow-2xl',
    coreKoreanClass: 'text-amber-950 font-black drop-shadow-xs',
    coreRomanClass: 'text-purple-700 font-black font-mono',
    coreMeaningClass: 'text-emerald-800 font-black',
    audioBtnClass: 'bg-gradient-to-r from-amber-600 to-rose-600 text-white hover:from-amber-700 hover:to-rose-700 shadow-lg',

    rinCardClass: 'bg-amber-50/95 backdrop-blur-md border-2 border-amber-300 text-stone-900 shadow-lg',
    rinTitleClass: 'text-amber-900 font-black',
    rinBadgeClass: 'bg-amber-200 text-amber-950 font-bold border border-amber-300',
    rinTextClass: 'text-stone-800 font-semibold',

    quizCardClass: 'bg-white/95 backdrop-blur-md border-2 border-amber-300/80 text-stone-900 shadow-2xl',
    quizHeaderBorderClass: 'border-amber-200',
    quizTitleClass: 'text-sky-800 font-black',
    quizSubtextClass: 'text-stone-600 font-bold',
    quizScoreBadgeClass: 'bg-emerald-100 border-2 border-emerald-300 text-emerald-900 font-black',
    quizQuestionClass: 'text-stone-950 font-black',
    quizOptionDefault: 'bg-amber-50/80 hover:bg-amber-100 text-stone-900 border-2 border-amber-200 hover:border-amber-400 font-bold shadow-xs',
    quizOptionInactive: 'bg-amber-100/50 text-stone-400 border-amber-200 opacity-50',

    lumiCardClass: 'bg-purple-50/95 border-2 border-purple-200 text-stone-900 shadow-md',
    lumiTitleClass: 'text-purple-800 font-black',
    lumiTextClass: 'text-purple-950 font-bold',
    quizExplanationClass: 'text-stone-700 font-semibold',
    nextBtnClass: 'bg-gradient-to-r from-amber-600 to-rose-600 hover:opacity-95 text-white font-black shadow-lg',

    completionTitleClass: 'text-stone-950 font-black',
    completionSubtitleClass: 'text-stone-700 font-bold',
    completionBtnClass: 'bg-gradient-to-r from-amber-600 to-rose-600 hover:opacity-95 text-white font-black shadow-xl',
  },

  // 3. NỀN TƯƠI MÁT: ĐỒI XANH JEJU (XANH NGỌC • CHỮ XANH ĐEN DỊU MẮT)
  jeju: {
    id: 'jeju',
    name: 'Đồi xanh Jeju (Xanh ngọc)',
    category: 'light',
    icon: '🌿',
    badgeLabel: 'Nền ngọc bích • Chữ xanh đen rõ nét',
    isDark: false,
    bgClass: 'bg-gradient-to-br from-[#F0FDF4] via-[#DCFCE7] to-[#BBF7D0]',

    headerClass: 'bg-emerald-950/10 backdrop-blur-md border-b border-emerald-300/60 text-slate-900 shadow-sm',
    headerBtnClass: 'bg-emerald-100 hover:bg-emerald-200 active:scale-95 text-emerald-950 border border-emerald-300/80 shadow-2xs',
    headerTextClass: 'text-slate-950 font-extrabold',
    headerSubtextClass: 'text-emerald-800 font-bold',
    progressTextClass: 'text-emerald-900 font-black',
    progressTrackClass: 'bg-emerald-200',
    themeToggleBtnClass: 'bg-emerald-200 hover:bg-emerald-300 text-emerald-950 border border-emerald-400 shadow-2xs',

    stepBadgeClass: 'bg-emerald-900/10 text-emerald-950 border border-emerald-300 font-black',
    titleClass: 'text-slate-950 font-black drop-shadow-xs',

    naCardClass: 'bg-white/95 backdrop-blur-md border-2 border-rose-200 text-slate-900 shadow-lg',
    naTitleClass: 'text-rose-800 font-black',
    naBadgeClass: 'bg-rose-100 text-rose-900 font-bold border border-rose-200',
    naTextClass: 'text-slate-800 font-semibold',

    coreCardClass: 'bg-white/95 backdrop-blur-md border-2 border-emerald-300 text-slate-900 shadow-2xl',
    coreKoreanClass: 'text-emerald-950 font-black drop-shadow-xs',
    coreRomanClass: 'text-teal-700 font-black font-mono',
    coreMeaningClass: 'text-emerald-700 font-black',
    audioBtnClass: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-lg',

    rinCardClass: 'bg-white/95 backdrop-blur-md border-2 border-amber-200 text-slate-900 shadow-lg',
    rinTitleClass: 'text-amber-800 font-black',
    rinBadgeClass: 'bg-amber-100 text-amber-900 font-bold border border-amber-200',
    rinTextClass: 'text-slate-800 font-semibold',

    quizCardClass: 'bg-white/95 backdrop-blur-md border-2 border-emerald-200 text-slate-900 shadow-2xl',
    quizHeaderBorderClass: 'border-emerald-200',
    quizTitleClass: 'text-emerald-800 font-black',
    quizSubtextClass: 'text-slate-600 font-bold',
    quizScoreBadgeClass: 'bg-emerald-100 border-2 border-emerald-300 text-emerald-900 font-black',
    quizQuestionClass: 'text-slate-950 font-black',
    quizOptionDefault: 'bg-emerald-50/80 hover:bg-emerald-100 text-slate-900 border-2 border-emerald-200 hover:border-emerald-400 font-bold shadow-xs',
    quizOptionInactive: 'bg-emerald-100/50 text-slate-400 border-emerald-200 opacity-50',

    lumiCardClass: 'bg-purple-50/95 border-2 border-purple-200 text-slate-900 shadow-md',
    lumiTitleClass: 'text-purple-800 font-black',
    lumiTextClass: 'text-purple-950 font-bold',
    quizExplanationClass: 'text-slate-700 font-semibold',
    nextBtnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg',

    completionTitleClass: 'text-slate-950 font-black',
    completionSubtitleClass: 'text-slate-700 font-bold',
    completionBtnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-xl',
  },

  // 4. NỀN TỐI: ĐÊM SAO SEOUL (ĐEN TUYỀN • CHỮ SÁNG PHÁT QUANG)
  midnight: {
    id: 'midnight',
    name: 'Đêm sao Seoul (Đen tuyền)',
    category: 'dark',
    icon: '🌌',
    badgeLabel: 'Nền tối • Chữ sáng phát quang',
    isDark: true,
    bgClass: 'bg-gradient-to-br from-[#090D16] via-[#111827] to-[#030712]',

    headerClass: 'bg-black/60 backdrop-blur-md border-b border-white/10 text-white shadow-sm',
    headerBtnClass: 'bg-white/15 hover:bg-white/25 active:scale-95 text-white border border-white/10 shadow-2xs',
    headerTextClass: 'text-white font-extrabold',
    headerSubtextClass: 'text-white/80 font-bold',
    progressTextClass: 'text-white/90 font-black',
    progressTrackClass: 'bg-white/20',
    themeToggleBtnClass: 'bg-purple-900/60 hover:bg-purple-900/80 text-purple-200 border border-purple-500/40 shadow-2xs',

    stepBadgeClass: 'bg-white/20 text-white border border-white/20 font-black',
    titleClass: 'text-white font-black drop-shadow-md',

    naCardClass: 'bg-rose-950/70 backdrop-blur-md border-2 border-rose-400/60 text-white shadow-xl',
    naTitleClass: 'text-rose-200 font-black',
    naBadgeClass: 'bg-rose-500/30 text-rose-100 font-bold border border-rose-400/50',
    naTextClass: 'text-white font-medium',

    coreCardClass: 'bg-slate-950/90 backdrop-blur-md border-2 border-slate-700/80 text-white shadow-2xl',
    coreKoreanClass: 'text-amber-300 font-black drop-shadow-md',
    coreRomanClass: 'text-purple-200 font-semibold font-mono',
    coreMeaningClass: 'text-emerald-300 font-bold',
    audioBtnClass: 'bg-white text-slate-900 hover:bg-slate-100 shadow-lg',

    rinCardClass: 'bg-amber-950/70 backdrop-blur-md border-2 border-amber-400/60 text-white shadow-xl',
    rinTitleClass: 'text-amber-200 font-black',
    rinBadgeClass: 'bg-amber-500/30 text-amber-100 font-bold border border-amber-400/50',
    rinTextClass: 'text-white font-medium',

    quizCardClass: 'bg-slate-900/90 backdrop-blur-md border-2 border-slate-700/80 text-white shadow-2xl',
    quizHeaderBorderClass: 'border-white/10',
    quizTitleClass: 'text-sky-300 font-black',
    quizSubtextClass: 'text-slate-100 font-bold',
    quizScoreBadgeClass: 'bg-emerald-500/30 border border-emerald-400 text-emerald-300 font-black',
    quizQuestionClass: 'text-white font-black',
    quizOptionDefault: 'bg-slate-800/90 hover:bg-slate-700 text-white border-slate-600/70 font-bold shadow-xs',
    quizOptionInactive: 'bg-slate-900/40 text-white/30 border-slate-800 opacity-40',

    lumiCardClass: 'bg-purple-950/70 border-2 border-purple-400/60 text-white shadow-lg',
    lumiTitleClass: 'text-purple-200 font-black',
    lumiTextClass: 'text-white font-bold',
    quizExplanationClass: 'text-slate-100 font-medium',
    nextBtnClass: 'bg-purple-600 hover:bg-purple-700 text-white font-black shadow-lg',

    completionTitleClass: 'text-white font-black',
    completionSubtitleClass: 'text-white/90 font-medium',
    completionBtnClass: 'bg-white text-slate-900 hover:bg-slate-100 font-black shadow-2xl',
  },

  // 5. NỀN NÂU ẤM: CÀ PHÊ HONGDAE (NÂU TRẦM • CHỮ KEM DỊU MẮT)
  coffee: {
    id: 'coffee',
    name: 'Cà phê Hongdae (Nâu trầm)',
    category: 'dark',
    icon: '☕',
    badgeLabel: 'Nền nâu ấm • Chữ kem dịu mắt',
    isDark: true,
    bgClass: 'bg-gradient-to-br from-[#1C1917] via-[#292524] to-[#0C0A09]',

    headerClass: 'bg-stone-950/70 backdrop-blur-md border-b border-amber-800/40 text-stone-100 shadow-sm',
    headerBtnClass: 'bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-100 border border-stone-600 shadow-2xs',
    headerTextClass: 'text-stone-100 font-extrabold',
    headerSubtextClass: 'text-stone-300 font-bold',
    progressTextClass: 'text-amber-200 font-black',
    progressTrackClass: 'bg-stone-800',
    themeToggleBtnClass: 'bg-amber-900/60 hover:bg-amber-900/80 text-amber-200 border border-amber-600/50 shadow-2xs',

    stepBadgeClass: 'bg-stone-800 text-amber-200 border border-stone-600 font-black',
    titleClass: 'text-stone-100 font-black drop-shadow-md',

    naCardClass: 'bg-[#2b171c]/95 backdrop-blur-md border-2 border-rose-400/60 text-white shadow-xl',
    naTitleClass: 'text-rose-200 font-black',
    naBadgeClass: 'bg-rose-950 text-rose-100 font-bold border border-rose-700',
    naTextClass: 'text-white font-medium',

    coreCardClass: 'bg-stone-950/90 backdrop-blur-md border-2 border-amber-700/60 text-stone-100 shadow-2xl',
    coreKoreanClass: 'text-amber-300 font-black drop-shadow-md',
    coreRomanClass: 'text-amber-100 font-semibold font-mono',
    coreMeaningClass: 'text-emerald-300 font-bold',
    audioBtnClass: 'bg-amber-500 hover:bg-amber-600 text-stone-950 font-black shadow-lg',

    rinCardClass: 'bg-[#2d2214]/95 backdrop-blur-md border-2 border-amber-400/60 text-white shadow-xl',
    rinTitleClass: 'text-amber-200 font-black',
    rinBadgeClass: 'bg-amber-950 text-amber-100 font-bold border border-amber-700',
    rinTextClass: 'text-white font-medium',

    quizCardClass: 'bg-stone-900/90 backdrop-blur-md border-2 border-stone-700 text-stone-100 shadow-2xl',
    quizHeaderBorderClass: 'border-stone-800',
    quizTitleClass: 'text-sky-300 font-black',
    quizSubtextClass: 'text-amber-100 font-bold',
    quizScoreBadgeClass: 'bg-emerald-950 border border-emerald-700 text-emerald-300 font-black',
    quizQuestionClass: 'text-stone-100 font-black',
    quizOptionDefault: 'bg-stone-800/90 hover:bg-stone-700 text-stone-100 border-stone-600 font-bold shadow-xs',
    quizOptionInactive: 'bg-stone-950/40 text-stone-500 border-stone-800 opacity-40',

    lumiCardClass: 'bg-[#291730]/95 border-2 border-purple-400/60 text-white shadow-lg',
    lumiTitleClass: 'text-purple-200 font-black',
    lumiTextClass: 'text-white font-bold',
    quizExplanationClass: 'text-stone-100 font-medium',
    nextBtnClass: 'bg-amber-600 hover:bg-amber-700 text-white font-black shadow-lg',

    completionTitleClass: 'text-stone-100 font-black',
    completionSubtitleClass: 'text-stone-200 font-medium',
    completionBtnClass: 'bg-amber-500 hover:bg-amber-600 text-stone-950 font-black shadow-2xl',
  },

  // 6. NỀN TÍM NEON: TÍM K-POP SEOUL (TÍM ĐẬM NEON • CHỮ HỒNG RỰC RỠ)
  kpop: {
    id: 'kpop',
    name: 'Tím K-Pop Seoul (Tím neon)',
    category: 'dark',
    icon: '💜',
    badgeLabel: 'Nền tím neon • Chữ hồng sáng rực rỡ',
    isDark: true,
    bgClass: 'bg-gradient-to-br from-[#1E112A] via-[#2E1065] to-[#0F0728]',

    headerClass: 'bg-black/60 backdrop-blur-md border-b border-purple-500/30 text-white shadow-sm',
    headerBtnClass: 'bg-purple-900/40 hover:bg-purple-900/70 active:scale-95 text-purple-100 border border-purple-500/40 shadow-2xs',
    headerTextClass: 'text-white font-extrabold',
    headerSubtextClass: 'text-purple-200 font-bold',
    progressTextClass: 'text-purple-200 font-black',
    progressTrackClass: 'bg-purple-950',
    themeToggleBtnClass: 'bg-purple-800/60 hover:bg-purple-700/80 text-pink-200 border border-purple-400/50 shadow-2xs',

    stepBadgeClass: 'bg-purple-900/40 text-purple-200 border border-purple-500/40 font-black',
    titleClass: 'text-white font-black drop-shadow-md',

    naCardClass: 'bg-[#2d0e2e]/95 backdrop-blur-md border-2 border-rose-400/60 text-white shadow-xl',
    naTitleClass: 'text-rose-200 font-black',
    naBadgeClass: 'bg-rose-900/60 text-rose-100 font-bold border border-rose-400/60',
    naTextClass: 'text-white font-medium',

    coreCardClass: 'bg-purple-950/85 backdrop-blur-md border-2 border-purple-500/50 text-white shadow-2xl',
    coreKoreanClass: 'text-amber-300 font-black drop-shadow-md',
    coreRomanClass: 'text-pink-300 font-semibold font-mono',
    coreMeaningClass: 'text-emerald-300 font-bold',
    audioBtnClass: 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-95 shadow-lg',

    rinCardClass: 'bg-[#2d1b10]/95 backdrop-blur-md border-2 border-amber-400/60 text-white shadow-xl',
    rinTitleClass: 'text-amber-200 font-black',
    rinBadgeClass: 'bg-amber-900/60 text-amber-100 font-bold border border-amber-400/60',
    rinTextClass: 'text-white font-medium',

    quizCardClass: 'bg-purple-950/85 backdrop-blur-md border-2 border-purple-500/50 text-white shadow-2xl',
    quizHeaderBorderClass: 'border-purple-800/40',
    quizTitleClass: 'text-sky-300 font-black',
    quizSubtextClass: 'text-purple-100 font-bold',
    quizScoreBadgeClass: 'bg-emerald-500/30 border border-emerald-400 text-emerald-300 font-black',
    quizQuestionClass: 'text-white font-black',
    quizOptionDefault: 'bg-purple-900/40 hover:bg-purple-800/60 text-white border-purple-500/40 font-bold shadow-xs',
    quizOptionInactive: 'bg-purple-950/40 text-purple-400/40 border-purple-900 opacity-40',

    lumiCardClass: 'bg-[#280e3c]/95 border-2 border-pink-400/60 text-white shadow-xl',
    lumiTitleClass: 'text-pink-200 font-black',
    lumiTextClass: 'text-white font-bold',
    quizExplanationClass: 'text-white font-medium',
    nextBtnClass: 'bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 text-white font-black shadow-lg',

    completionTitleClass: 'text-white font-black',
    completionSubtitleClass: 'text-purple-200 font-medium',
    completionBtnClass: 'bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 text-white font-black shadow-2xl',
  },
};

export const StageStepLearningModal: React.FC<StageStepLearningModalProps> = ({
  isOpen,
  onClose,
  stageNumber,
  stageTitle,
  step,
  onCompleteStep,
  onAddXp,
  appTheme = 'light',
}) => {
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [scoreCount, setScoreCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Dedicated Learning Background Theme (Đổi nền toàn màn hình khi vào chặng học)
  const [studyTheme, setStudyTheme] = useState<StudyBackgroundTheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('korean_study_bg_theme') as StudyBackgroundTheme;
      if (saved && BG_THEMES[saved]) return saved;
    }
    // Default matching user's main app theme
    return appTheme === 'dark' ? 'midnight' : 'classroom';
  });

  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);

  // Save selected background theme
  const handleChangeBgTheme = (themeId: StudyBackgroundTheme) => {
    playClickSound();
    setStudyTheme(themeId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('korean_study_bg_theme', themeId);
    }
    setIsThemePickerOpen(false);
  };

  // Quick switch between Light Mode and Dark Mode
  const handleQuickToggleLightDark = () => {
    playClickSound();
    const currentIsDark = BG_THEMES[studyTheme]?.isDark ?? false;
    const targetTheme: StudyBackgroundTheme = currentIsDark ? 'classroom' : 'midnight';
    setStudyTheme(targetTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('korean_study_bg_theme', targetTheme);
    }
  };

  // Reset quiz state when step changes
  useEffect(() => {
    if (step) {
      setCurrentQuizIdx(0);
      setSelectedOpt(null);
      setIsAnswered(false);
      setScoreCount(0);
      setIsCompleted(false);
    }
  }, [step?.id]);

  if (!isOpen || !step) return null;

  const currentBg = BG_THEMES[studyTheme] || BG_THEMES.classroom;
  const isCheckpoint = step.type === 'checkpoint';
  const questions = step.practiceQuestions || [];
  const currQ = questions[currentQuizIdx];
  const progressPercent = Math.round((step.stepNumber / 5) * 100);

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    playClickSound();
    setSelectedOpt(idx);
    setIsAnswered(true);

    const isCorrect = idx === currQ.correctIndex;
    if (isCorrect) {
      playSuccessSound();
      setScoreCount((prev) => prev + 1);
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.6 },
      });
    } else {
      playIncorrectSound();
    }
  };

  const handleNextQuestion = () => {
    playClickSound();
    if (currentQuizIdx + 1 < questions.length) {
      setCurrentQuizIdx((prev) => prev + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
    } else {
      // Completed all questions in this step!
      setIsCompleted(true);
      playFanfareSound();
      onCompleteStep(step.id);
      onAddXp(isCheckpoint ? 50 : 25);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    }
  };

  const handleFinishStepWithoutQuiz = () => {
    playFanfareSound();
    onCompleteStep(step.id);
    onAddXp(20);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 w-screen h-screen min-h-screen flex flex-col overflow-hidden transition-colors duration-500 animate-fade-in ${currentBg.bgClass}`}
    >
      {/* FULLSCREEN TOP APP BAR: Breadcrumb, Step Progress, Background Changer & Exit */}
      <header className={`sticky top-0 z-40 transition-colors duration-300 shrink-0 ${currentBg.headerClass}`}>
        <div className="max-w-6xl w-full mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Left: Back / Exit button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-black text-xs transition-all cursor-pointer ${currentBg.headerBtnClass}`}
              title="Quay lại lộ trình học"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Thoát chặng</span>
            </button>

            {/* Stage & Step Info */}
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 shadow-2xs">
                  Chặng {stageNumber}
                </span>
                <span className={`text-xs truncate max-w-xs ${currentBg.headerSubtextClass}`}>
                  {stageTitle}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Progress indicator */}
          <div className="flex-1 max-w-xs mx-auto text-center px-2">
            <div className="flex items-center justify-between text-[11px] font-black mb-1">
              <span className={currentBg.progressTextClass}>
                {isCheckpoint ? 'Tập kiểm tra 👑' : `Mục ${step.stepNumber}/5`}
              </span>
              <span className="text-amber-500 font-mono font-extrabold">{progressPercent}%</span>
            </div>
            {/* Horizontal progress bar */}
            <div className={`w-full h-2 rounded-full overflow-hidden ${currentBg.progressTrackClass}`}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-sky-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Right: Quick Sun/Moon Toggle, Background Theme Picker & XP indicator */}
          <div className="flex items-center gap-2">
            {/* Quick Sáng / Tối 1-Click Toggle */}
            <button
              onClick={handleQuickToggleLightDark}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${currentBg.themeToggleBtnClass}`}
              title={
                currentBg.isDark
                  ? 'Chuyển sang Nền Sáng (Chữ đen đậm rõ nét ☀️)'
                  : 'Chuyển sang Nền Tối (Chống mỏi mắt 🌙)'
              }
            >
              {currentBg.isDark ? (
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

            {/* Background Theme Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  playClickSound();
                  setIsThemePickerOpen(!isThemePickerOpen);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${currentBg.headerBtnClass}`}
                title="Chọn bảng màu nền chi tiết"
              >
                <Palette className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden md:inline">Đổi nền:</span>
                <span>{currentBg.icon}</span>
              </button>

              {/* Theme Picker Popover with Light/Dark Groups */}
              {isThemePickerOpen && (
                <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl bg-slate-900/98 backdrop-blur-xl border border-white/20 shadow-2xl p-2.5 space-y-2 text-white animate-scale-up">
                  {/* Category: Nền Sáng */}
                  <div>
                    <div className="px-2 py-1 text-[10px] uppercase font-black tracking-wider text-amber-400 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Sun className="w-3 h-3 text-amber-400" />
                        <span>Nền Sáng • Chữ đen rõ nét</span>
                      </span>
                    </div>
                    <div className="space-y-1 mt-1">
                      {Object.values(BG_THEMES)
                        .filter((t) => !t.isDark)
                        .map((thm) => (
                          <button
                            key={thm.id}
                            onClick={() => handleChangeBgTheme(thm.id)}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              studyTheme === thm.id
                                ? 'bg-amber-500/30 text-amber-200 border border-amber-400/60'
                                : 'hover:bg-white/10 text-slate-200'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-sm">{thm.icon}</span>
                              <div className="text-left">
                                <div className="leading-tight">{thm.name}</div>
                              </div>
                            </span>
                            {studyTheme === thm.id && <Check className="w-3.5 h-3.5 text-amber-400" />}
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-white/10 my-1" />

                  {/* Category: Nền Tối */}
                  <div>
                    <div className="px-2 py-1 text-[10px] uppercase font-black tracking-wider text-sky-400 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Moon className="w-3 h-3 text-sky-400" />
                        <span>Nền Tối • Chữ sáng dịu mắt</span>
                      </span>
                    </div>
                    <div className="space-y-1 mt-1">
                      {Object.values(BG_THEMES)
                        .filter((t) => t.isDark)
                        .map((thm) => (
                          <button
                            key={thm.id}
                            onClick={() => handleChangeBgTheme(thm.id)}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              studyTheme === thm.id
                                ? 'bg-sky-500/30 text-sky-200 border border-sky-400/60'
                                : 'hover:bg-white/10 text-slate-200'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-sm">{thm.icon}</span>
                              <div className="text-left">
                                <div className="leading-tight">{thm.name}</div>
                              </div>
                            </span>
                            {studyTheme === thm.id && <Check className="w-3.5 h-3.5 text-sky-400" />}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-amber-400 text-slate-950 font-black text-xs shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>+{isCheckpoint ? 50 : 25} XP</span>
            </div>
          </div>
        </div>
      </header>

      {/* FULLSCREEN MAIN SCROLLABLE LEARNING ARENA */}
      <main className="flex-1 w-full overflow-y-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="max-w-3xl w-full mx-auto space-y-5">
          {!isCompleted ? (
            <>
              {/* Step Title Header Banner */}
              <div className="text-center space-y-1.5">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-xs ${currentBg.stepBadgeClass}`}>
                  {isCheckpoint ? '👑 MỐC KIỂM TRA CHẶNG' : `Mục ${step.stepNumber}/5 • Chặng ${stageNumber}`}
                </span>
                <h2 className={`text-xl sm:text-3xl font-black ${currentBg.titleClass}`}>
                  {step.title}
                </h2>
              </div>

              {/* 1. NA (Gia sư tiếng Hàn 🌸): Lời giảng dẫn đầu bài */}
              <div className={`p-4 sm:p-5 rounded-3xl backdrop-blur-md flex items-start gap-4 transition-colors duration-300 ${currentBg.naCardClass}`}>
                <CompanionAvatar characterId="na" size={54} mood="explaining" showBadge />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-black ${currentBg.naTitleClass}`}>
                      Na • Gia sư tiếng Hàn
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${currentBg.naBadgeClass}`}>
                      Giảng bài
                    </span>
                  </div>
                  <p className={`text-xs sm:text-sm mt-1.5 leading-relaxed ${currentBg.naTextClass}`}>
                    {step.summaryVi}
                  </p>
                </div>
              </div>

              {/* 2. CORE KNOWLEDGE CARD (Khối kiến thức trọng tâm phát âm chuẩn Seoul) */}
              <div className={`p-6 sm:p-10 rounded-3xl backdrop-blur-md text-center space-y-4 relative overflow-hidden transition-colors duration-300 ${currentBg.coreCardClass}`}>
                {/* Large Korean Text with Contrast Matched to Background */}
                <div className={`text-4xl sm:text-6xl font-black font-sans tracking-wider ${currentBg.coreKoreanClass}`}>
                  {step.contentKo}
                </div>

                {step.romanization && (
                  <div className={`text-sm sm:text-base tracking-wide ${currentBg.coreRomanClass}`}>
                    [{step.romanization}]
                  </div>
                )}

                {step.meaningVi && (
                  <div className={`text-base sm:text-xl ${currentBg.coreMeaningClass}`}>
                    "{step.meaningVi}"
                  </div>
                )}

                {/* Big Seoul Audio Button */}
                <div className="pt-2 flex justify-center">
                  <button
                    onClick={() => {
                      playClickSound();
                      speakKorean(step.contentKo, 0.85);
                    }}
                    className={`px-6 py-3 rounded-2xl font-black text-sm sm:text-base hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer ${currentBg.audioBtnClass}`}
                  >
                    <Volume2 className="w-5 h-5 animate-pulse" />
                    <span>Nghe phát âm chuẩn Seoul (Giọng nam)</span>
                  </button>
                </div>
              </div>

              {/* 3. RIN (Trợ lý bài tập 🧢): Mẹo ghi nhớ & Hướng dẫn chi tiết */}
              <div className={`p-4 sm:p-5 rounded-3xl backdrop-blur-md flex items-start gap-4 transition-colors duration-300 ${currentBg.rinCardClass}`}>
                <CompanionAvatar characterId="rin" size={50} mood="happy" showBadge />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-black ${currentBg.rinTitleClass}`}>
                      Rin • Trợ lý bài tập
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${currentBg.rinBadgeClass}`}>
                      Mẹo nhớ
                    </span>
                  </div>
                  <p className={`text-xs sm:text-sm mt-1.5 leading-relaxed ${currentBg.rinTextClass}`}>
                    💡 {step.detailExplanation}
                  </p>
                </div>
              </div>

              {/* 4. MIN (Luyện đề 💻) & LUMI (Động lực 💜): Luyện tập trắc nghiệm toàn màn hình */}
              {questions.length > 0 && currQ && (
                <div className={`p-5 sm:p-7 rounded-3xl backdrop-blur-md space-y-4 transition-colors duration-300 ${currentBg.quizCardClass}`}>
                  {/* Min Header */}
                  <div className={`flex items-center justify-between border-b pb-3 ${currentBg.quizHeaderBorderClass}`}>
                    <div className="flex items-center gap-3">
                      <CompanionAvatar characterId="min" size={40} mood="thinking" />
                      <div>
                        <span className={`text-xs font-black block ${currentBg.quizTitleClass}`}>
                          Min • Chuyên gia luyện đề
                        </span>
                        <span className={`text-[11px] ${currentBg.quizSubtextClass}`}>
                          Câu {currentQuizIdx + 1} / {questions.length}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-black px-3 py-1 rounded-full ${currentBg.quizScoreBadgeClass}`}>
                      Đúng {scoreCount}/{questions.length}
                    </span>
                  </div>

                  {/* Question Prompt */}
                  <p className={`text-base sm:text-lg font-black leading-relaxed ${currentBg.quizQuestionClass}`}>
                    {currQ.question}
                  </p>

                  {/* 4 Choices */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {currQ.options.map((opt, oIdx) => {
                      const isChosen = selectedOpt === oIdx;
                      const isCorrectOpt = oIdx === currQ.correctIndex;

                      let btnStyle = currentBg.quizOptionDefault;
                      if (isAnswered) {
                        if (isCorrectOpt) {
                          btnStyle = 'bg-emerald-600 text-white border-2 border-emerald-400 font-black shadow-lg scale-101';
                        } else if (isChosen) {
                          btnStyle = 'bg-rose-600 text-white border-2 border-rose-400 line-through opacity-90 font-bold';
                        } else {
                          btnStyle = currentBg.quizOptionInactive;
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={isAnswered}
                          onClick={() => handleSelectOption(oIdx)}
                          className={`p-3.5 sm:p-4 rounded-2xl text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {isAnswered && isCorrectOpt && <Check className="w-5 h-5 text-white shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* LUMI feedback & Next question button */}
                  {isAnswered && (
                    <div className={`pt-3 border-t space-y-3 animate-fade-in ${currentBg.quizHeaderBorderClass}`}>
                      <div className={`flex items-center gap-3 p-3 rounded-2xl ${currentBg.lumiCardClass}`}>
                        <CompanionAvatar characterId="lumi" size={40} mood={selectedOpt === currQ.correctIndex ? 'cheering' : 'happy'} />
                        <div className="flex-1 min-w-0">
                          <span className={`text-[10px] uppercase font-black ${currentBg.lumiTitleClass}`}>
                            Lumi truyền cảm hứng 💕
                          </span>
                          <p className={`text-xs sm:text-sm ${currentBg.lumiTextClass}`}>
                            {selectedOpt === currQ.correctIndex
                              ? 'Tuyệt vời! Bạn nắm bài rất nhanh và chuẩn xác! 🌟'
                              : 'Không sao đâu, Lumi cùng bạn ghi nhớ câu này để làm tốt hơn nhé!'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                        <p className={`text-xs font-medium ${currentBg.quizExplanationClass}`}>
                          💡 {currQ.explanation}
                        </p>

                        <button
                          onClick={handleNextQuestion}
                          className={`px-6 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0 ${currentBg.nextBtnClass}`}
                        >
                          <span>{currentQuizIdx + 1 < questions.length ? 'Câu tiếp theo →' : 'Hoàn thành mục'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action if no questions */}
              {questions.length === 0 && (
                <div className="pt-4 text-center">
                  <button
                    onClick={handleFinishStepWithoutQuiz}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    Hoàn thành mục này & Nhận XP
                  </button>
                </div>
              )}
            </>
          ) : (
            /* 5. FULLSCREEN COMPLETION SCREEN: Biệt đội 5 người bạn ăn mừng */
            <div className="py-8 sm:py-12 text-center space-y-6 max-w-xl mx-auto animate-scale-up">
              {/* 5 Friends Squad celebrating */}
              <div className="flex items-center justify-center -space-x-3 py-3">
                {COMPANION_LIST.map((buddy) => (
                  <div key={buddy.id} className="relative transition-transform hover:scale-125 hover:z-20">
                    <CompanionAvatar characterId={buddy.id} size={64} mood="cheering" />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center gap-1.5 text-amber-400">
                  <Star className="w-8 h-8 fill-amber-400 animate-bounce" />
                  <Star className="w-10 h-10 fill-amber-400 animate-bounce delay-100" />
                  <Star className="w-8 h-8 fill-amber-400 animate-bounce delay-200" />
                </div>
                <h3 className={`text-2xl sm:text-4xl font-black ${currentBg.completionTitleClass}`}>
                  {isCheckpoint ? 'Vượt Qua Mốc Kiểm Tra Chặng!' : 'Hoàn Thành Xuất Sắc!'}
                </h3>
                <p className={`text-sm font-medium ${currentBg.completionSubtitleClass}`}>
                  "Học không chỉ là cố gắng, mà còn là niềm vui! Cùng nhau, chúng ta làm được! 💕"
                </p>
              </div>

              <div className="p-4 rounded-3xl bg-amber-400 text-slate-950 max-w-xs mx-auto text-sm font-black shadow-xl">
                +{isCheckpoint ? 50 : 25} XP đã được cộng vào tài khoản của bạn!
              </div>

              <div className="pt-4">
                <button
                  onClick={() => {
                    playClickSound();
                    onClose();
                  }}
                  className={`px-8 py-3.5 rounded-2xl font-black text-sm transition-all cursor-pointer ${currentBg.completionBtnClass}`}
                >
                  Tiếp tục hành trình học →
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
