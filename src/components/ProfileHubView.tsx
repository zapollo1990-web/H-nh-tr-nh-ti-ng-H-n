import React, { useState } from 'react';
import {
  User,
  Flame,
  Award,
  BookOpen,
  Gamepad2,
  Users,
  Lightbulb,
  CheckCircle2,
  Lock,
  LogOut,
  Sparkles,
  BarChart3,
  Volume2,
  ShieldCheck,
  Target,
  Crown,
  KeyRound,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AppUser, SocialAuthProvider, UserProgress } from '../types';
import { ACHIEVEMENT_BADGES } from '../data/achievements';
import { LEARNING_TIPS } from '../data/learningTips';
import { TopikMockTestView } from './TopikMockTestView';
import { GamesHubView } from './GamesHubView';
import { SocialSquareView } from './SocialSquareView';
import { speakKorean, playClickSound } from '../utils/audio';
import { isDesignatedAdminEmail, isMainAdminEmail, isSubAdminEmail } from '../services/authService';

interface ProfileHubViewProps {
  progress: UserProgress;
  adminUser: AppUser | null;
  onOpenSettings: () => void;
  onLogin: (provider: SocialAuthProvider, email?: string, name?: string, password?: string) => void;
  onLogout: () => void;
  onAddXp: (amount: number) => void;
  onRecordQuizResult: (isCorrect: boolean) => void;
  onToggleBookmarkRule: (ruleId: string) => void;
  onSaveMistake: (mistake: { sentence: string; correction: string; note: string }) => void;
  onDeleteMistake: (id: string) => void;
  onUnlockBadge: (badgeId: string) => void;
  masteredCardsCount: number;
  onOpenPlayerManagement?: () => void;
  onOpenAuthModal?: (initialMode?: 'login' | 'register' | 'change_password' | 'forgot_password') => void;
}

export const ProfileHubView: React.FC<ProfileHubViewProps> = ({
  progress,
  adminUser,
  onOpenSettings,
  onLogin,
  onLogout,
  onAddXp,
  onRecordQuizResult,
  onUnlockBadge,
  masteredCardsCount,
  onOpenPlayerManagement,
  onOpenAuthModal,
}) => {
  // Gọn gàng 4 danh mục chính: Tiến độ & Danh hiệu, Thi thử TOPIK, Giải trí (Game), Bạn học (Cộng đồng)
  const [activeSubTab, setActiveSubTab] = useState<'badges' | 'topik_test' | 'games' | 'community'>('badges');
  const [isBadgesExpanded, setIsBadgesExpanded] = useState<boolean>(false);

  const isAuthorizedAdmin = Boolean(
    adminUser &&
      (adminUser.role === 'admin' ||
        adminUser.isServerAdmin ||
        isDesignatedAdminEmail(adminUser.email))
  );

  // Quick Login Modal inside Profile
  const [showQuickLogin, setShowQuickLogin] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState('hocvien.kr@gmail.com');
  const [loginName, setLoginName] = useState('Học Viên');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<SocialAuthProvider>('gmail');

  // Accuracy calculation
  const totalAnswered = progress.totalQuestionsAnswered || 0;
  const correctCount = progress.correctQuestionsAnswered || 0;
  const accuracyPercent = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 100;

  // Check badges unlocked
  const isBadgeUnlocked = (badgeId: string) => {
    if (progress.unlockedBadgeIds?.includes(badgeId)) return true;
    if (badgeId === 'badge-newbie' && progress.completedStageIds?.length > 0) return true;
    if (badgeId === 'badge-streak-3' && progress.streak >= 3) return true;
    if (badgeId === 'badge-streak-7' && progress.streak >= 7) return true;
    if (badgeId === 'badge-sharpshooter' && totalAnswered >= 10 && accuracyPercent >= 80) return true;
    if (badgeId === 'badge-vocab-master' && masteredCardsCount >= 20) return true;
    return false;
  };

  const unlockedCount = ACHIEVEMENT_BADGES.filter((b) => isBadgeUnlocked(b.id)).length;

  const handleProviderSelect = (provider: SocialAuthProvider) => {
    setSelectedProvider(provider);
    if (provider === 'gmail') {
      setLoginEmail('hocvien.kr@gmail.com');
      setLoginName('Học Viên Tiếng Hàn');
      setLoginPassword('');
    } else if (provider === 'facebook') {
      setLoginEmail('user.fb@gmail.com');
      setLoginName('Bạn Học FB');
      setLoginPassword('123456');
    } else if (provider === 'apple') {
      setLoginEmail('user.apple@icloud.com');
      setLoginName('Học Viên Apple');
      setLoginPassword('123456');
    } else if (provider === 'zing_id') {
      setLoginEmail('user.zing@zing.vn');
      setLoginName('Thành Viên Zing');
      setLoginPassword('123456');
    }
  };

  const handleExecuteLogin = () => {
    onLogin(selectedProvider, loginEmail, loginName, loginPassword);
    setShowQuickLogin(false);
  };

  const roleBadgeText = isMainAdminEmail(adminUser?.email)
    ? 'Admin Chính'
    : isSubAdminEmail(adminUser?.email)
    ? 'Admin Phụ'
    : isAuthorizedAdmin
    ? 'Admin'
    : adminUser
    ? 'Học Viên'
    : 'Khách';

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-12 animate-fade-in">
      {/* 1. THẺ HỒ SƠ TINH GỌN (COMPACT PROFILE CARD) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative shrink-0">
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-xs ${
                isMainAdminEmail(adminUser?.email)
                  ? 'bg-gradient-to-tr from-amber-400 to-orange-500 text-white'
                  : isSubAdminEmail(adminUser?.email)
                  ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white'
                  : 'bg-gradient-to-tr from-sky-400 to-indigo-500 text-white'
              }`}
            >
              {adminUser?.avatar ? (
                adminUser.avatar.startsWith('/') || adminUser.avatar.startsWith('http') ? (
                  <img
                    src={adminUser.avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover rounded-2xl"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  adminUser.avatar
                )
              ) : isAuthorizedAdmin ? (
                '👑'
              ) : (
                '🎓'
              )}
            </div>
            <span
              className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase border border-white shadow-2xs ${
                isAuthorizedAdmin ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
              }`}
            >
              {roleBadgeText}
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-slate-900 truncate">
                {adminUser ? adminUser.name : 'Người Dùng Khách'}
              </h2>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isAuthorizedAdmin
                    ? 'bg-amber-50 text-amber-900 border border-amber-200'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {roleBadgeText}
              </span>
            </div>

            <p className="text-xs text-slate-500 truncate mt-0.5">
              {adminUser
                ? isAuthorizedAdmin || isDesignatedAdminEmail(adminUser.email)
                  ? '🔒 Ban Quản Trị (Bảo mật)'
                  : adminUser.email
                : 'Đăng nhập để đồng bộ tiến độ học'}
            </p>

            {/* Quick mini indicators */}
            <div className="flex items-center gap-3 text-xs font-bold mt-1.5 flex-wrap">
              <span className="flex items-center gap-1 text-amber-600">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{progress.streak} ngày</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-sky-600">
                <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                <span>{progress.totalXp} XP</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-emerald-600">
                <Target className="w-3.5 h-3.5 text-emerald-500" />
                <span>{accuracyPercent}% đúng</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap sm:self-center shrink-0">
          {isAuthorizedAdmin && (
            <>
              {onOpenPlayerManagement && (
                <button
                  onClick={onOpenPlayerManagement}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-xs transition-all cursor-pointer"
                  title="Quản lý danh sách người chơi"
                >
                  <Crown className="w-3.5 h-3.5 fill-white" />
                  <span>Người chơi</span>
                </button>
              )}
              <button
                onClick={onOpenSettings}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-xs transition-all cursor-pointer"
                title="Quản trị kho từ vựng"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Kho từ</span>
              </button>
            </>
          )}

          {!adminUser ? (
            <button
              onClick={() => {
                if (onOpenAuthModal) {
                  onOpenAuthModal();
                } else {
                  setShowQuickLogin(true);
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-black shadow-xs transition-all cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  playClickSound();
                  if (onOpenAuthModal) {
                    onOpenAuthModal('change_password');
                  }
                }}
                className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                title="Đổi mật khẩu tài khoản"
              >
                <KeyRound className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Đổi MK</span>
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-1 px-2.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
                title="Đăng xuất"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Thoát</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. CHỈ SỐ HỌC TẬP TINH GỌN (4 THẺ NGẮN GỌN THAY VÌ KHỐI ĐEN NẶNG NỀ) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-slate-400">Chuỗi học</div>
            <div className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              {progress.streak} <span className="text-xs font-normal text-slate-500">ngày</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Target className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-slate-400">Độ chuẩn xác</div>
            <div className="text-base sm:text-lg font-black text-emerald-600 leading-tight">
              {accuracyPercent}%
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-sky-500" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-slate-400">Tổng điểm</div>
            <div className="text-base sm:text-lg font-black text-sky-600 leading-tight">
              {progress.totalXp} <span className="text-xs font-normal text-slate-500">XP</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 text-purple-600" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-slate-400">Danh hiệu</div>
            <div className="text-base sm:text-lg font-black text-purple-600 leading-tight">
              {unlockedCount} / {ACHIEVEMENT_BADGES.length}
            </div>
          </div>
        </div>
      </div>

      {/* 3. ĐIỀU HƯỚNG 4 DANH MỤC RÕ RÀNG (KHÔNG RỐI MẮT) */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-2xs grid grid-cols-2 sm:grid-cols-4 gap-1">
        <button
          onClick={() => {
            playClickSound();
            setActiveSubTab('badges');
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeSubTab === 'badges'
              ? 'bg-amber-500 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Award className="w-4 h-4 shrink-0" />
          <span>Danh hiệu & Mẹo</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveSubTab('topik_test');
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeSubTab === 'topik_test'
              ? 'bg-amber-500 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          <span>Thi thử TOPIK</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveSubTab('games');
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeSubTab === 'games'
              ? 'bg-amber-500 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Gamepad2 className="w-4 h-4 shrink-0" />
          <span>Trò chơi học tập</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveSubTab('community');
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeSubTab === 'community'
              ? 'bg-amber-500 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span>Cộng đồng học</span>
        </button>
      </div>

      {/* 4. NỘI DUNG TỪNG TAB ĐƯỢC CHĂM CHÚT GỌN GÀNG */}
      <div className="pt-1">
        {/* TAB 1: DANH HIỆU & MẸO HỌC NHANH */}
        {activeSubTab === 'badges' && (
          <div className="space-y-4 animate-fade-in">
            {/* Lưới danh hiệu gọn gàng */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-black text-slate-800">
                    Danh hiệu đạt được ({unlockedCount}/{ACHIEVEMENT_BADGES.length})
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-slate-400">
                  {Math.round((unlockedCount / ACHIEVEMENT_BADGES.length) * 100)}% hoàn thành
                </span>
              </div>

              {/* Lưới danh hiệu: Mặc định thu gọn (3 danh hiệu đầu), bấm Xem thêm để mở toàn bộ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {(isBadgesExpanded ? ACHIEVEMENT_BADGES : ACHIEVEMENT_BADGES.slice(0, 3)).map((badge) => {
                  const unlocked = isBadgeUnlocked(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                        unlocked
                          ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 shadow-2xs'
                          : 'bg-slate-50/60 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700 opacity-60'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-2xs ${
                          unlocked
                            ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200'
                            : 'bg-slate-200 text-slate-400 dark:bg-neutral-700 dark:text-neutral-500'
                        }`}
                      >
                        {badge.icon}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-black text-slate-800 dark:text-neutral-100 truncate">{badge.title}</h4>
                          {unlocked ? (
                            <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 dark:bg-emerald-900/60 dark:text-emerald-300 px-1.5 py-0.2 rounded-md shrink-0">
                              Đạt
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 flex items-center gap-0.5 shrink-0">
                              <Lock className="w-2.5 h-2.5" /> Khóa
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-neutral-400 line-clamp-1 mt-0.5">{badge.description}</p>
                        <p className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold mt-1">
                          Yêu cầu: {badge.criteria}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Nút Xem thêm / Thu gọn danh hiệu */}
              <div className="pt-1 flex justify-center">
                <button
                  onClick={() => {
                    playClickSound();
                    setIsBadgesExpanded(!isBadgesExpanded);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-black transition-all flex items-center gap-1.5 border border-amber-200 dark:border-amber-800 cursor-pointer shadow-2xs hover:scale-102"
                >
                  {isBadgesExpanded ? (
                    <>
                      <span>Thu gọn danh hiệu</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Xem thêm ({ACHIEVEMENT_BADGES.length - 3} danh hiệu khác)</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Cẩm nang mẹo học (Accordion gọn, không trải dài vô tận) */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-sky-500" />
                <h3 className="text-sm font-black text-slate-800">
                  Mẹo học tiếng Hàn thực chiến ({LEARNING_TIPS.length} bài học ngắn)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {LEARNING_TIPS.map((tip) => (
                  <div
                    key={tip.id}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-sky-300 transition-colors space-y-2 bg-slate-50/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl shrink-0">{tip.icon}</span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-slate-800 truncate">{tip.title}</h4>
                          <span className="text-[10px] font-bold text-sky-600">{tip.koreanTitle}</span>
                        </div>
                      </div>
                      {tip.exampleKo && (
                        <button
                          onClick={() => {
                            playClickSound();
                            speakKorean(tip.exampleKo!);
                          }}
                          className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 transition-colors cursor-pointer shrink-0"
                          title="Nghe phát âm"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{tip.summary}</p>

                    {tip.exampleKo && (
                      <div className="p-2 rounded-lg bg-white border border-slate-200/80 text-[11px]">
                        <span className="font-bold text-slate-900">{tip.exampleKo}</span>
                        <span className="text-slate-500 ml-1.5">({tip.exampleVi})</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: THI THỬ TOPIK */}
        {activeSubTab === 'topik_test' && (
          <div className="animate-fade-in">
            <TopikMockTestView
              onAddXp={onAddXp}
              onRecordQuizResult={onRecordQuizResult}
              onUnlockBadge={onUnlockBadge}
            />
          </div>
        )}

        {/* TAB 3: TRÒ CHƠI HỌC TẬP (NÔNG TRẠI, CÂU CÁ, ĐỐ CHỮ) */}
        {activeSubTab === 'games' && (
          <div className="animate-fade-in">
            <GamesHubView onAddXp={onAddXp} />
          </div>
        )}

        {/* TAB 4: CỘNG ĐỒNG HỌC TẬP */}
        {activeSubTab === 'community' && (
          <div className="animate-fade-in">
            <SocialSquareView
              totalXp={progress.totalXp}
              streak={progress.streak}
              onAddXp={onAddXp}
            />
          </div>
        )}
      </div>

      {/* QUICK LOGIN MODAL */}
      {showQuickLogin && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-slate-100 space-y-3.5">
            <div className="text-center">
              <h3 className="text-base font-black text-slate-800">Đăng Nhập Tài Khoản</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Lưu trữ tiến độ học, tỉ lệ đúng và chuỗi học tập
              </p>
            </div>

            {/* Provider Quick Chips */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleProviderSelect('gmail')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  selectedProvider === 'gmail'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="font-black text-red-500">G</span>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderSelect('facebook')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  selectedProvider === 'facebook'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="font-black text-blue-600">f</span>
                <span>Facebook</span>
              </button>
            </div>

            <div className="space-y-2.5 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Email tài khoản:
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Tên hiển thị:
                </label>
                <input
                  type="text"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Mật khẩu:
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowQuickLogin(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleExecuteLogin}
                className="flex-1 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-black shadow-xs cursor-pointer"
              >
                Đăng nhập
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
