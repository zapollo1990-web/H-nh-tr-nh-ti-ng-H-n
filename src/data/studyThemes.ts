export type StudyBackgroundTheme =
  | 'classroom'
  | 'sunset'
  | 'jeju'
  | 'midnight'
  | 'coffee'
  | 'kpop';

export interface BgThemeOption {
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

  // Cards & Blocks
  cardClass: string;
  cardTitleClass: string;
  cardSubtextClass: string;
  cardBorderClass: string;

  // Text highlights
  koreanTextClass: string;
  romanTextClass: string;
  meaningTextClass: string;
  subtleTextClass: string;

  // Button styles
  actionBtnClass: string;
  secondaryBtnClass: string;

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

    cardClass: 'bg-white/95 backdrop-blur-md border-2 border-slate-200 text-slate-900 shadow-md',
    cardTitleClass: 'text-slate-900 font-black',
    cardSubtextClass: 'text-slate-600 font-medium',
    cardBorderClass: 'border-slate-200',

    koreanTextClass: 'text-indigo-950 font-black',
    romanTextClass: 'text-indigo-600 font-mono font-bold',
    meaningTextClass: 'text-emerald-700 font-bold',
    subtleTextClass: 'text-slate-500',

    actionBtnClass: 'bg-sky-600 hover:bg-sky-700 text-white font-black shadow-md',
    secondaryBtnClass: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold',

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

    cardClass: 'bg-white/95 backdrop-blur-md border-2 border-amber-300/80 text-stone-900 shadow-md',
    cardTitleClass: 'text-stone-950 font-black',
    cardSubtextClass: 'text-stone-700 font-medium',
    cardBorderClass: 'border-amber-300/70',

    koreanTextClass: 'text-amber-950 font-black',
    romanTextClass: 'text-purple-700 font-mono font-bold',
    meaningTextClass: 'text-emerald-800 font-bold',
    subtleTextClass: 'text-stone-600',

    actionBtnClass: 'bg-amber-600 hover:bg-amber-700 text-white font-black shadow-md',
    secondaryBtnClass: 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 font-bold',

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

    stepBadgeClass: 'bg-emerald-900/10 text-emerald-950 border border-emerald-400 font-black',
    titleClass: 'text-emerald-950 font-black drop-shadow-xs',

    cardClass: 'bg-white/95 backdrop-blur-md border-2 border-emerald-300/80 text-emerald-950 shadow-md',
    cardTitleClass: 'text-emerald-950 font-black',
    cardSubtextClass: 'text-emerald-800 font-medium',
    cardBorderClass: 'border-emerald-300/70',

    koreanTextClass: 'text-emerald-950 font-black',
    romanTextClass: 'text-teal-700 font-mono font-bold',
    meaningTextClass: 'text-emerald-800 font-bold',
    subtleTextClass: 'text-emerald-700',

    actionBtnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md',
    secondaryBtnClass: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-300 font-bold',

    naCardClass: 'bg-white/95 backdrop-blur-md border-2 border-rose-200 text-slate-800 shadow-lg',
    naTitleClass: 'text-rose-800 font-black',
    naBadgeClass: 'bg-rose-100 text-rose-900 font-bold border border-rose-200',
    naTextClass: 'text-slate-800 font-semibold',

    coreCardClass: 'bg-white/95 backdrop-blur-md border-2 border-emerald-300/80 text-emerald-950 shadow-2xl',
    coreKoreanClass: 'text-emerald-950 font-black drop-shadow-xs',
    coreRomanClass: 'text-teal-700 font-black font-mono',
    coreMeaningClass: 'text-emerald-800 font-black',
    audioBtnClass: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-lg',

    rinCardClass: 'bg-amber-50/95 backdrop-blur-md border-2 border-amber-300 text-slate-800 shadow-lg',
    rinTitleClass: 'text-amber-900 font-black',
    rinBadgeClass: 'bg-amber-100 text-amber-950 font-bold border border-amber-300',
    rinTextClass: 'text-slate-800 font-semibold',

    quizCardClass: 'bg-white/95 backdrop-blur-md border-2 border-emerald-200 text-emerald-950 shadow-2xl',
    quizHeaderBorderClass: 'border-emerald-200',
    quizTitleClass: 'text-emerald-800 font-black',
    quizSubtextClass: 'text-emerald-700 font-bold',
    quizScoreBadgeClass: 'bg-emerald-100 border-2 border-emerald-400 text-emerald-900 font-black',
    quizQuestionClass: 'text-emerald-950 font-black',
    quizOptionDefault: 'bg-emerald-50/80 hover:bg-emerald-100 text-emerald-950 border-2 border-emerald-200 hover:border-emerald-400 font-bold shadow-xs',
    quizOptionInactive: 'bg-emerald-100/50 text-emerald-600/40 border-emerald-200 opacity-50',

    lumiCardClass: 'bg-purple-50/95 border-2 border-purple-200 text-slate-900 shadow-md',
    lumiTitleClass: 'text-purple-800 font-black',
    lumiTextClass: 'text-purple-950 font-bold',
    quizExplanationClass: 'text-emerald-900 font-semibold',
    nextBtnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg',

    completionTitleClass: 'text-emerald-950 font-black',
    completionSubtitleClass: 'text-emerald-800 font-bold',
    completionBtnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-xl',
  },

  // 4. NỀN TỐI NEON: ĐÊM SEOUL (XANH ĐEN • CHỮ SÁNG RỰC RỠ)
  midnight: {
    id: 'midnight',
    name: 'Đêm Seoul (Xanh đen neon)',
    category: 'dark',
    icon: '🌃',
    badgeLabel: 'Nền tối neon • Chữ sáng rực rỡ',
    isDark: true,
    bgClass: 'bg-gradient-to-br from-[#0B0F19] via-[#0F172A] to-[#020617]',

    headerClass: 'bg-black/60 backdrop-blur-md border-b border-indigo-500/30 text-white shadow-sm',
    headerBtnClass: 'bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-100 border border-indigo-500/40 shadow-2xs',
    headerTextClass: 'text-white font-extrabold',
    headerSubtextClass: 'text-sky-200 font-bold',
    progressTextClass: 'text-sky-200 font-black',
    progressTrackClass: 'bg-slate-800',
    themeToggleBtnClass: 'bg-indigo-900/60 hover:bg-indigo-800/80 text-amber-300 border border-indigo-400/50 shadow-2xs',

    stepBadgeClass: 'bg-indigo-950/80 text-sky-200 border border-indigo-500/50 font-black',
    titleClass: 'text-white font-black drop-shadow-md',

    cardClass: 'bg-slate-900/90 backdrop-blur-md border-2 border-indigo-500/40 text-white shadow-xl',
    cardTitleClass: 'text-white font-black',
    cardSubtextClass: 'text-slate-300 font-medium',
    cardBorderClass: 'border-indigo-500/40',

    koreanTextClass: 'text-amber-300 font-black',
    romanTextClass: 'text-sky-300 font-mono font-bold',
    meaningTextClass: 'text-emerald-300 font-bold',
    subtleTextClass: 'text-slate-400',

    actionBtnClass: 'bg-sky-500 hover:bg-sky-600 text-white font-black shadow-md shadow-sky-500/30',
    secondaryBtnClass: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-bold',

    naCardClass: 'bg-[#2a0e22]/95 backdrop-blur-md border-2 border-rose-400/60 text-white shadow-xl',
    naTitleClass: 'text-rose-200 font-black',
    naBadgeClass: 'bg-rose-900/60 text-rose-100 font-bold border border-rose-400/60',
    naTextClass: 'text-white font-medium',

    coreCardClass: 'bg-slate-900/90 backdrop-blur-md border-2 border-indigo-500/40 text-white shadow-2xl',
    coreKoreanClass: 'text-amber-300 font-black drop-shadow-md',
    coreRomanClass: 'text-sky-300 font-semibold font-mono',
    coreMeaningClass: 'text-emerald-300 font-bold',
    audioBtnClass: 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white hover:opacity-95 shadow-lg',

    rinCardClass: 'bg-[#2a1708]/95 backdrop-blur-md border-2 border-amber-400/60 text-white shadow-xl',
    rinTitleClass: 'text-amber-200 font-black',
    rinBadgeClass: 'bg-amber-900/60 text-amber-100 font-bold border border-amber-400/60',
    rinTextClass: 'text-white font-medium',

    quizCardClass: 'bg-slate-900/90 backdrop-blur-md border-2 border-indigo-500/40 text-white shadow-2xl',
    quizHeaderBorderClass: 'border-indigo-900/50',
    quizTitleClass: 'text-sky-300 font-black',
    quizSubtextClass: 'text-slate-100 font-bold',
    quizScoreBadgeClass: 'bg-emerald-500/30 border border-emerald-400 text-emerald-300 font-black',
    quizQuestionClass: 'text-white font-black',
    quizOptionDefault: 'bg-slate-800/80 hover:bg-indigo-900/60 text-white border-2 border-slate-700 hover:border-indigo-400 font-bold shadow-xs',
    quizOptionInactive: 'bg-slate-950/60 text-slate-500 border-slate-800 opacity-40',

    lumiCardClass: 'bg-[#240e36]/95 border-2 border-purple-400/60 text-white shadow-xl',
    lumiTitleClass: 'text-purple-200 font-black',
    lumiTextClass: 'text-white font-bold',
    quizExplanationClass: 'text-white font-medium',
    nextBtnClass: 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-95 text-white font-black shadow-lg',

    completionTitleClass: 'text-white font-black',
    completionSubtitleClass: 'text-slate-200 font-medium',
    completionBtnClass: 'bg-sky-500 hover:bg-sky-600 text-white font-black shadow-2xl',
  },

  // 5. NỀN NÂU ẤM TỐI: QUÁN CÀ PHÊ (NÂU GỖ • CHỮ CARAMEL SÁNG)
  coffee: {
    id: 'coffee',
    name: 'Quán cà phê (Nâu gỗ)',
    category: 'dark',
    icon: '☕',
    badgeLabel: 'Nền gỗ ấm • Chữ kem caramel sáng',
    isDark: true,
    bgClass: 'bg-gradient-to-br from-[#1C130E] via-[#2A1810] to-[#140C08]',

    headerClass: 'bg-black/60 backdrop-blur-md border-b border-amber-600/30 text-stone-100 shadow-sm',
    headerBtnClass: 'bg-amber-950/80 hover:bg-amber-900/80 active:scale-95 text-amber-100 border border-amber-600/40 shadow-2xs',
    headerTextClass: 'text-amber-50 font-extrabold',
    headerSubtextClass: 'text-amber-200 font-bold',
    progressTextClass: 'text-amber-200 font-black',
    progressTrackClass: 'bg-stone-900',
    themeToggleBtnClass: 'bg-amber-900/60 hover:bg-amber-800/80 text-amber-200 border border-amber-500/50 shadow-2xs',

    stepBadgeClass: 'bg-amber-950/80 text-amber-200 border border-amber-600/40 font-black',
    titleClass: 'text-amber-50 font-black drop-shadow-md',

    cardClass: 'bg-[#261610]/95 backdrop-blur-md border-2 border-amber-500/40 text-stone-100 shadow-xl',
    cardTitleClass: 'text-amber-50 font-black',
    cardSubtextClass: 'text-stone-300 font-medium',
    cardBorderClass: 'border-amber-500/40',

    koreanTextClass: 'text-amber-300 font-black',
    romanTextClass: 'text-amber-200 font-mono font-bold',
    meaningTextClass: 'text-emerald-300 font-bold',
    subtleTextClass: 'text-stone-400',

    actionBtnClass: 'bg-amber-600 hover:bg-amber-700 text-white font-black shadow-md',
    secondaryBtnClass: 'bg-[#2f1b13] hover:bg-[#3d2319] text-amber-100 border border-amber-700/50 font-bold',

    naCardClass: 'bg-[#2d0e22]/95 backdrop-blur-md border-2 border-rose-400/60 text-white shadow-xl',
    naTitleClass: 'text-rose-200 font-black',
    naBadgeClass: 'bg-rose-900/60 text-rose-100 font-bold border border-rose-400/60',
    naTextClass: 'text-white font-medium',

    coreCardClass: 'bg-[#261610]/95 backdrop-blur-md border-2 border-amber-500/40 text-stone-100 shadow-2xl',
    coreKoreanClass: 'text-amber-300 font-black drop-shadow-md',
    coreRomanClass: 'text-amber-200 font-semibold font-mono',
    coreMeaningClass: 'text-emerald-300 font-bold',
    audioBtnClass: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:opacity-95 shadow-lg',

    rinCardClass: 'bg-[#2e180d]/95 backdrop-blur-md border-2 border-amber-400/60 text-white shadow-xl',
    rinTitleClass: 'text-amber-200 font-black',
    rinBadgeClass: 'bg-amber-900/60 text-amber-100 font-bold border border-amber-400/60',
    rinTextClass: 'text-white font-medium',

    quizCardClass: 'bg-[#261610]/95 backdrop-blur-md border-2 border-amber-500/40 text-stone-100 shadow-2xl',
    quizHeaderBorderClass: 'border-amber-900/40',
    quizTitleClass: 'text-amber-300 font-black',
    quizSubtextClass: 'text-stone-200 font-bold',
    quizScoreBadgeClass: 'bg-emerald-500/30 border border-emerald-400 text-emerald-300 font-black',
    quizQuestionClass: 'text-stone-50 font-black',
    quizOptionDefault: 'bg-[#311c14] hover:bg-[#3d2319] text-amber-100 border-2 border-amber-700/60 hover:border-amber-400 font-bold shadow-xs',
    quizOptionInactive: 'bg-[#1c100b] text-stone-500 border-stone-800 opacity-40',

    lumiCardClass: 'bg-[#29132d]/95 border-2 border-purple-400/60 text-white shadow-xl',
    lumiTitleClass: 'text-purple-200 font-black',
    lumiTextClass: 'text-white font-bold',
    quizExplanationClass: 'text-stone-200 font-medium',
    nextBtnClass: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:opacity-95 text-white font-black shadow-lg',

    completionTitleClass: 'text-amber-100 font-black',
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

    cardClass: 'bg-purple-950/85 backdrop-blur-md border-2 border-purple-500/50 text-white shadow-xl',
    cardTitleClass: 'text-white font-black',
    cardSubtextClass: 'text-purple-200 font-medium',
    cardBorderClass: 'border-purple-500/50',

    koreanTextClass: 'text-amber-300 font-black',
    romanTextClass: 'text-pink-300 font-mono font-bold',
    meaningTextClass: 'text-emerald-300 font-bold',
    subtleTextClass: 'text-purple-300',

    actionBtnClass: 'bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 text-white font-black shadow-md',
    secondaryBtnClass: 'bg-purple-900/40 hover:bg-purple-800/60 text-purple-100 border border-purple-500/40 font-bold',

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
    quizOptionDefault: 'bg-purple-900/40 hover:bg-purple-800/60 text-white border-2 border-purple-500/40 font-bold shadow-xs',
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

export const STUDY_BG_STORAGE_KEY = 'korean_study_bg_theme';

export function getSavedStudyTheme(defaultDark = false): StudyBackgroundTheme {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STUDY_BG_STORAGE_KEY) as StudyBackgroundTheme;
    if (saved && BG_THEMES[saved]) return saved;
  }
  return defaultDark ? 'midnight' : 'classroom';
}

export function saveStudyTheme(themeId: StudyBackgroundTheme): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STUDY_BG_STORAGE_KEY, themeId);
  }
}
