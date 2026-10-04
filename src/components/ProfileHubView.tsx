import React, { useState } from 'react';
import {
  User,
  Flame,
  Award,
  BookOpen,
  HelpCircle,
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
  ChevronRight,
  ExternalLink,
  Target,
  Crown,
  Eye,
  EyeOff,
  KeyRound
} from 'lucide-react';
import { AppUser, SocialAuthProvider, UserProgress } from '../types';
import { ACHIEVEMENT_BADGES } from '../data/achievements';
import { LEARNING_TIPS } from '../data/learningTips';
import { TopikMockTestView } from './TopikMockTestView';
import { GamesHubView } from './GamesHubView';
import { SocialSquareView } from './SocialSquareView';
import { GrammarNotebookView } from './GrammarNotebookView';
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
  onToggleBookmarkRule,
  onSaveMistake,
  onDeleteMistake,
  onUnlockBadge,
  masteredCardsCount,
  onOpenPlayerManagement,
  onOpenAuthModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'badges' | 'topik_test' | 'games' | 'community' | 'tips' | 'grammar'
  >('badges');

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

    // Auto unlock rules
    if (badgeId === 'badge-newbie' && progress.completedStageIds?.length > 0) return true;
    if (badgeId === 'badge-streak-3' && progress.streak >= 3) return true;
    if (badgeId === 'badge-streak-7' && progress.streak >= 7) return true;
    if (badgeId === 'badge-sharpshooter' && totalAnswered >= 10 && accuracyPercent >= 80) return true;
    if (badgeId === 'badge-vocab-master' && masteredCardsCount >= 20) return true;

    return false;
  };

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

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in">
      {/* USER PROFILE HEADER CARD */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center text-3xl sm:text-4xl shadow-md ${
                  isMainAdminEmail(adminUser?.email)
                    ? 'bg-gradient-to-tr from-amber-400 via-amber-500 to-orange-500 text-white shadow-amber-200'
                    : isSubAdminEmail(adminUser?.email)
                    ? 'bg-gradient-to-tr from-indigo-500 via-purple-500 to-sky-500 text-white shadow-indigo-200'
                    : 'bg-gradient-to-tr from-sky-400 to-indigo-500 text-white'
                }`}
              >
                {adminUser?.avatar || (isAuthorizedAdmin ? '👑' : '🎓')}
              </div>
              <span
                className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase border-2 border-white shadow-xs ${
                  isMainAdminEmail(adminUser?.email)
                    ? 'bg-amber-400 text-amber-950 font-black'
                    : isSubAdminEmail(adminUser?.email)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-emerald-500 text-white'
                }`}
              >
                {isMainAdminEmail(adminUser?.email)
                  ? 'Admin Chính'
                  : isSubAdminEmail(adminUser?.email)
                  ? 'Admin Phụ'
                  : isAuthorizedAdmin
                  ? 'Admin'
                  : 'Học Viên'}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  {adminUser ? adminUser.name : 'Người Dùng Khách'}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    isMainAdminEmail(adminUser?.email)
                      ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-950 border border-amber-300 font-black shadow-2xs'
                      : isSubAdminEmail(adminUser?.email)
                      ? 'bg-indigo-100 text-indigo-900 border border-indigo-200 font-black'
                      : isAuthorizedAdmin
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 font-black'
                      : 'bg-sky-100 text-sky-800 border border-sky-200'
                  }`}
                >
                  {isMainAdminEmail(adminUser?.email)
                    ? '👑 Admin Chính (Tổng Quản Trị - Toàn quyền tối cao)'
                    : isSubAdminEmail(adminUser?.email)
                    ? '🛡️ Admin Phụ (Phó Quản Trị Hệ Thống)'
                    : isAuthorizedAdmin
                    ? '👑 Quản Trị Viên (Admin)'
                    : adminUser
                    ? '🎓 Học Viên (Chỉ học, không sửa app)'
                    : 'Chưa đăng nhập'}
                </span>
              </div>

              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {adminUser
                  ? isAuthorizedAdmin || isDesignatedAdminEmail(adminUser.email)
                    ? '🔒 Gmail Ban Quản Trị (Đã ẩn bảo mật toàn hệ thống)'
                    : adminUser.email
                  : 'Tạo tài khoản hoặc đăng nhập để lưu tiến độ học tập'}
              </p>

              <div className="flex items-center gap-3 text-xs font-bold text-slate-600 mt-2">
                <span className="flex items-center gap-1 text-amber-600">
                  <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>{progress.streak} ngày liên tiếp</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-sky-600">
                  <Sparkles className="w-4 h-4 text-sky-500" />
                  <span>{progress.totalXp} XP</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
            {isAuthorizedAdmin && (
              <>
                {onOpenPlayerManagement && (
                  <button
                    onClick={onOpenPlayerManagement}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-md shadow-amber-200 transition-all cursor-pointer"
                  >
                    <Crown className="w-4 h-4 fill-white" />
                    <span>Quản lý người chơi</span>
                  </button>
                )}
                <button
                  onClick={onOpenSettings}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-200 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Quản trị kho từ vựng</span>
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
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-black shadow-md shadow-sky-200 transition-all cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Đăng nhập / Đăng ký</span>
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
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black shadow-xs transition-all cursor-pointer"
                  title="Tự đổi và đặt lại mật khẩu cá nhân của bạn"
                >
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>Đổi mật khẩu</span>
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* TIẾN ĐỘ HỌC TẬP (Chuỗi & Tỉ lệ phần trăm câu đúng) */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-black">Tiến Độ Học Tập & Hiệu Suất</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Cập nhật thời gian thực</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {/* Streak */}
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
              <span>Chuỗi ngày học</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              {progress.streak} <span className="text-xs font-normal text-slate-300">ngày</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1">Mục tiêu: Đạt chuỗi 7 ngày</p>
          </div>

          {/* Accuracy % */}
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-xs text-emerald-300 font-bold">
              <span>Tỉ lệ câu đúng</span>
              <Target className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-300 mt-1">
              {accuracyPercent}%
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              {correctCount} / {totalAnswered || 0} câu đã làm
            </p>
          </div>

          {/* Total XP */}
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-xs text-sky-300 font-bold">
              <span>Tổng điểm XP</span>
              <Sparkles className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-sky-300 mt-1">
              {progress.totalXp}
            </div>
            <p className="text-[11px] text-slate-300 mt-1">Hạng Bạc năng động</p>
          </div>

          {/* Mastered Vocab */}
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-xs text-purple-300 font-bold">
              <span>Từ vựng đã thuộc</span>
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-300 mt-1">
              {masteredCardsCount}
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              {progress.completedStageIds?.length || 0} / 8 chặng lộ trình
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="pt-2">
          <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
            <span>Độ chính xác tổng quan</span>
            <span>{accuracyPercent}% độ chính xác ({correctCount} đúng)</span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, accuracyPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION (6 Sub-sections inside "Tôi") */}
      <div className="bg-white rounded-3xl p-1.5 border border-slate-200 shadow-xs flex items-center overflow-x-auto gap-1">
        <button
          onClick={() => {
            playClickSound();
            setActiveSubTab('badges');
          }}
          className={`flex items-center gap-1.5 py-2.5 px-3.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'badges'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Danh hiệu</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveSubTab('topik_test');
          }}
          className={`flex items-center gap-1.5 py-2.5 px-3.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'topik_test'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Thi thử (TOPIK)</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveSubTab('games');
          }}
          className={`flex items-center gap-1.5 py-2.5 px-3.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'games'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>Trò chơi</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveSubTab('community');
          }}
          className={`flex items-center gap-1.5 py-2.5 px-3.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'community'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Cộng đồng</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveSubTab('tips');
          }}
          className={`flex items-center gap-1.5 py-2.5 px-3.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'tips'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>Mẹo học</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveSubTab('grammar');
          }}
          className={`flex items-center gap-1.5 py-2.5 px-3.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'grammar'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Lý thuyết ngữ pháp</span>
        </button>
      </div>

      {/* SUB-TAB CONTENTS */}
      <div className="pt-2">
        {activeSubTab === 'badges' && (
          /* BADGES / DANH HIỆU */
          <div className="space-y-5 animate-fade-in">
            <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 rounded-3xl p-5 border border-amber-200">
              <h3 className="text-base sm:text-lg font-black text-amber-950 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                <span>Bộ Sưu Tập Danh Hiệu Khuyến Khích</span>
              </h3>
              <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                Tích cực học tập, đạt chuỗi ngày liên tiếp, duy trì tỷ lệ câu đúng cao và chinh phục các bài thi thử TOPIK để mở khóa các danh hiệu vinh danh độc quyền!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {ACHIEVEMENT_BADGES.map((badge) => {
                const unlocked = isBadgeUnlocked(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`rounded-3xl p-5 border-2 transition-all flex flex-col justify-between ${
                      unlocked
                        ? 'bg-white border-amber-300 shadow-sm hover:shadow-md'
                        : 'bg-slate-50/70 border-slate-200 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs ${
                            unlocked
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-400'
                          }`}
                        >
                          {badge.icon}
                        </div>
                        {unlocked ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Đã mở khóa
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-500 text-[10px] font-bold flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Chưa đạt
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-black text-slate-800">{badge.title}</h4>
                      <p className="text-xs font-mono font-bold text-amber-600 mt-0.5">
                        {badge.koreanTitle}
                      </p>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {badge.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
                      Điều kiện: {badge.criteria}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeSubTab === 'topik_test' && (
          /* THI THỬ (TOPIK TEST) */
          <div className="animate-fade-in">
            <TopikMockTestView
              onAddXp={onAddXp}
              onRecordQuizResult={onRecordQuizResult}
              onUnlockBadge={onUnlockBadge}
            />
          </div>
        )}

        {activeSubTab === 'games' && (
          /* TRÒ CHƠI (GỘP FARM, FISHING & PUZZLE) */
          <div className="animate-fade-in">
            <GamesHubView onAddXp={onAddXp} />
          </div>
        )}

        {activeSubTab === 'community' && (
          /* CỘNG ĐỒNG (SOCIAL NETWORK) */
          <div className="animate-fade-in">
            <SocialSquareView
              totalXp={progress.totalXp}
              streak={progress.streak}
              onAddXp={onAddXp}
            />
          </div>
        )}

        {activeSubTab === 'tips' && (
          /* MẸO HỌC TIẾNG HÀN */
          <div className="space-y-4 animate-fade-in">
            <div className="bg-gradient-to-r from-sky-50 to-indigo-50 rounded-3xl p-5 border border-sky-200">
              <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-sky-600" />
                <span>Cẩm Nang Mẹo Học Tiếng Hàn Thực Chiến</span>
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Tổng hợp các bí kíp phát âm, phương pháp ghi nhớ từ vựng ngắt quãng, mẹo nhận diện từ Hán - Hàn và chiến thuật làm bài thi TOPIK đạt điểm tối đa.
              </p>
            </div>

            <div className="space-y-4">
              {LEARNING_TIPS.map((tip) => (
                <div
                  key={tip.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3 hover:border-sky-200 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{tip.icon}</span>
                      <div>
                        <h4 className="text-sm sm:text-base font-black text-slate-800">{tip.title}</h4>
                        <p className="text-xs font-mono font-bold text-sky-600">{tip.koreanTitle}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    {tip.summary}
                  </p>

                  <div className="space-y-1.5 pl-2">
                    {tip.keyPoints.map((point, pIdx) => (
                      <p key={pIdx} className="text-xs text-slate-700 leading-relaxed">
                        {point}
                      </p>
                    ))}
                  </div>

                  {tip.exampleKo && (
                    <div className="mt-3 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-black text-slate-900">{tip.exampleKo}</div>
                        <div className="text-xs text-amber-900 mt-0.5">{tip.exampleVi}</div>
                      </div>
                      <button
                        onClick={() => speakKorean(tip.exampleKo!)}
                        className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 transition-colors cursor-pointer shrink-0"
                        title="Nghe ví dụ"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'grammar' && (
          /* LÝ THUYẾT GIẢI ĐÁP NGỮ PHÁP */
          <div className="animate-fade-in">
            <GrammarNotebookView
              bookmarkedRuleIds={progress.bookmarkedRules || []}
              onToggleBookmarkRule={onToggleBookmarkRule}
              savedMistakes={progress.savedMistakes || []}
              onSaveMistake={onSaveMistake}
              onDeleteMistake={onDeleteMistake}
              onAddXp={onAddXp}
            />
          </div>
        )}
      </div>

      {/* QUICK LOGIN MODAL FOR SOCIAL / APP USERS */}
      {showQuickLogin && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-black text-slate-800">Đăng Nhập Tài Khoản Học Tập</h3>
              <p className="text-xs text-slate-500 mt-1">
                Lưu trữ tiến độ học, tỉ lệ phần trăm câu đúng và chuỗi học tập cá nhân
              </p>
            </div>

            {/* Provider Selectors */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleProviderSelect('gmail')}
                className={`p-3 rounded-2xl border-2 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  selectedProvider === 'gmail'
                    ? 'border-red-500 bg-red-50 text-red-700 ring-2 ring-red-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-base font-black text-red-500">G</span>
                <span>Google (Máy chủ)</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderSelect('facebook')}
                className={`p-3 rounded-2xl border-2 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  selectedProvider === 'facebook'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-base font-black text-blue-600">f</span>
                <span>Facebook</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderSelect('apple')}
                className={`p-3 rounded-2xl border-2 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  selectedProvider === 'apple'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span>🍏</span>
                <span>Apple ID</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderSelect('zing_id')}
                className={`p-3 rounded-2xl border-2 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  selectedProvider === 'zing_id'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-base font-black text-emerald-600">Z</span>
                <span>Zing ID</span>
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Email / ID tài khoản:
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
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
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Mật khẩu tài khoản:
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 p-3 rounded-2xl text-[11px] text-amber-900 leading-relaxed border border-amber-200">
              💡 <strong>Lưu ý:</strong> Quyền quản trị hệ thống thuộc về Ban Quản Trị (Gmail của tất cả Quản Trị Viên được ẩn bảo mật toàn diện). Người dùng đăng nhập bằng tài khoản và mật khẩu cá nhân tự đặt.
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowQuickLogin(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleExecuteLogin}
                className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-black shadow-xs cursor-pointer"
              >
                Xác nhận đăng nhập
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
