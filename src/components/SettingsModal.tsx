import React, { useState } from 'react';
import {
  X,
  Settings,
  ShieldCheck,
  Lock,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  Volume2,
  BookOpen,
  Sliders,
  Sparkles,
  AlertCircle,
  RotateCcw,
  Users,
  Crown,
  Award,
  Eye,
  EyeOff
} from 'lucide-react';
import { Flashcard, AppUser, SocialAuthProvider, VocabCategory } from '../types';
import { speakKorean, playClickSound, playSuccessSound } from '../utils/audio';
import { DESIGNATED_ADMINS, isDesignatedAdminEmail, isMainAdminEmail, isSubAdminEmail } from '../services/authService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: Flashcard[];
  onAddCard: (card: Omit<Flashcard, 'id'>) => void;
  onUpdateCard: (card: Flashcard) => void;
  onDeleteCard: (cardId: string) => void;
  onResetCards: () => void;
  adminUser: AppUser | null;
  onLogin: (provider: SocialAuthProvider, email?: string, name?: string, password?: string) => void;
  onLogout: () => void;
  onOpenPlayerManagement?: () => void;
  onOpenAuthModal?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  cards,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onResetCards,
  adminUser,
  onLogin,
  onLogout,
  onOpenPlayerManagement,
  onOpenAuthModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'vocab_admin'>('vocab_admin');
  const [showLoginModal, setShowLoginModal] = useState<SocialAuthProvider | null>(null);
  const [customLoginEmail, setCustomLoginEmail] = useState('');
  const [customLoginName, setCustomLoginName] = useState('');
  const [customLoginPassword, setCustomLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Add / Edit Card form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [formHangul, setFormHangul] = useState('');
  const [formRomanization, setFormRomanization] = useState('');
  const [formVietnamese, setFormVietnamese] = useState('');
  const [formCategory, setFormCategory] = useState<VocabCategory>('food');
  const [formPos, setFormPos] = useState<'Danh từ' | 'Động từ' | 'Tính từ' | 'Phó từ' | 'Đại từ' | 'Cụm từ'>('Danh từ');
  const [formTopik, setFormTopik] = useState<'Sơ cấp 1' | 'Sơ cấp 2' | 'Trung cấp'>('Sơ cấp 1');
  const [formExampleKo, setFormExampleKo] = useState('');
  const [formExampleVi, setFormExampleVi] = useState('');
  const [formTips, setFormTips] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Vocab management table search & filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'custom' | 'default'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // General settings state
  const [voiceSpeed, setVoiceSpeed] = useState<number>(0.85);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  if (!isOpen) return null;

  // Authorization check: User is an admin if they have role admin, isServerAdmin, or are in the designated admin list
  const isAuthorizedAdmin = Boolean(
    adminUser &&
      (adminUser.role === 'admin' ||
        adminUser.isServerAdmin ||
        isDesignatedAdminEmail(adminUser.email))
  );

  const handleOpenAddForm = () => {
    setEditingCardId(null);
    setFormHangul('');
    setFormRomanization('');
    setFormVietnamese('');
    setFormCategory('food');
    setFormPos('Danh từ');
    setFormTopik('Sơ cấp 1');
    setFormExampleKo('');
    setFormExampleVi('');
    setFormTips('');
    setFormError('');
    setFormSuccess('');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (card: Flashcard) => {
    setEditingCardId(card.id);
    setFormHangul(card.hangul);
    setFormRomanization(card.romanization);
    setFormVietnamese(card.vietnamese);
    setFormCategory(card.category);
    setFormPos(card.partOfSpeech || 'Danh từ');
    setFormTopik(card.topikLevel || 'Sơ cấp 1');
    setFormExampleKo(card.exampleKo || '');
    setFormExampleVi(card.exampleVi || '');
    setFormTips(card.tips || '');
    setFormError('');
    setFormSuccess('');
    setIsFormOpen(true);
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formHangul.trim() || !formRomanization.trim() || !formVietnamese.trim()) {
      setFormError('Vui lòng điền đầy đủ tiếng Hàn, phiên âm và nghĩa tiếng Việt!');
      return;
    }

    if (editingCardId) {
      const existing = cards.find((c) => c.id === editingCardId);
      if (existing) {
        onUpdateCard({
          ...existing,
          hangul: formHangul.trim(),
          romanization: formRomanization.trim(),
          vietnamese: formVietnamese.trim(),
          category: formCategory,
          partOfSpeech: formPos,
          topikLevel: formTopik,
          exampleKo: formExampleKo.trim(),
          exampleVi: formExampleVi.trim(),
          tips: formTips.trim() || undefined,
        });
        setFormSuccess('Đã cập nhật từ vựng thành công!');
      }
    } else {
      onAddCard({
        hangul: formHangul.trim(),
        romanization: formRomanization.trim(),
        vietnamese: formVietnamese.trim(),
        category: formCategory,
        partOfSpeech: formPos,
        topikLevel: formTopik,
        exampleKo: formExampleKo.trim(),
        exampleVi: formExampleVi.trim(),
        tips: formTips.trim() || undefined,
        isCustomAdmin: true,
        addedAt: new Date().toLocaleDateString('vi-VN'),
      });
      setFormSuccess('Đã thêm từ vựng mới vào kho lưu trữ!');
    }

    playSuccessSound();
    setTimeout(() => {
      setIsFormOpen(false);
      setFormSuccess('');
      setEditingCardId(null);
    }, 1000);
  };

  const customCardsCount = cards.filter((c) => c.isCustomAdmin).length;

  const filteredVocab = cards.filter((c) => {
    const matchesSearch =
      c.hangul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.romanization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.vietnamese.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === 'all'
        ? true
        : filterType === 'custom'
        ? c.isCustomAdmin
        : !c.isCustomAdmin;

    const matchesCategory =
      categoryFilter === 'all' ? true : c.category === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 p-5 sm:p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl border border-white/20 shadow-inner">
              ⚙️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight">
                  Cài Đặt & Trung Tâm Quản Trị
                </h3>
                {isAuthorizedAdmin && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase flex items-center gap-1">
                    <Crown className="w-3 h-3 fill-slate-950" />
                    <span>Admin</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                Quản lý kho từ vựng hơn 1000 từ, âm thanh và phân quyền người chơi
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 px-6">
          <button
            onClick={() => {
              playClickSound();
              setActiveSubTab('vocab_admin');
            }}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'vocab_admin'
                ? 'border-sky-500 text-sky-600 bg-white font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Quản Lý Từ Vựng ({cards.length})</span>
            {customCardsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black">
                +{customCardsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              playClickSound();
              setActiveSubTab('general');
            }}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'general'
                ? 'border-sky-500 text-sky-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Âm Thanh & Tuỳ Chọn</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeSubTab === 'general' ? (
            /* GENERAL & AUDIO SETTINGS */
            <div className="space-y-5">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-3">
                  <Volume2 className="w-4 h-4 text-sky-500" />
                  <span>Cài đặt giọng đọc tiếng Hàn & Hiệu ứng âm thanh</span>
                </h4>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                      <span>Tốc độ phát âm: {voiceSpeed}x</span>
                      <button
                        onClick={() => speakKorean('안녕하세요! 한국어 공부를 시작해 볼까요?', voiceSpeed)}
                        className="text-sky-600 hover:text-sky-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Nghe thử
                      </button>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.2"
                      step="0.05"
                      value={voiceSpeed}
                      onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>0.5x (Rất chậm)</span>
                      <span>0.85x (Chuẩn cho người mới)</span>
                      <span>1.2x (Nhanh bản xứ)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                    <div>
                      <div className="text-xs font-bold text-slate-800">Hiệu ứng âm thanh (Click, Đúng/Sai, Fanfare)</div>
                      <div className="text-[11px] text-slate-500">Phát âm thanh vui tai khi click hoặc hoàn thành bài quiz</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={soundEnabled}
                      onChange={(e) => setSoundEnabled(e.target.checked)}
                      className="w-5 h-5 rounded text-sky-500 focus:ring-sky-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-sky-50/50 rounded-2xl p-4 border border-sky-100">
                <h4 className="text-sm font-black text-slate-800 mb-2">Thông tin phiên bản & Kho dữ liệu</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ứng dụng 한국어 여정 (Korean Journey) tích hợp hơn 1,000 từ vựng tiếng Hàn phân loại theo chuẩn TOPIK I & II, bảng chữ cái Hangeul, lộ trình chặng đường RPG, minigame giải đố và quản trị người chơi đa cấp.
                </p>
                <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500 font-medium flex-wrap">
                  <span>Phiên bản: 2.5.0-Pro</span>
                  <span>•</span>
                  <span>Tổng từ vựng: {cards.length} từ (hơn 1000 từ)</span>
                  <span>•</span>
                  <span>Quản trị: 4 Quản trị viên chỉ định</span>
                </div>
              </div>
            </div>
          ) : (
            /* VOCABULARY ADMIN TAB */
            <div className="space-y-5">
              {/* AUTHENTICATION GATEWAY FOR ADMIN */}
              {!adminUser ? (
                <div className="bg-gradient-to-br from-amber-50/80 via-white to-sky-50/50 rounded-3xl p-6 sm:p-8 border-2 border-dashed border-amber-300 text-center shadow-xs">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-300 text-amber-900 mx-auto flex items-center justify-center text-2xl shadow-md shadow-amber-200 mb-4">
                    <Lock className="w-8 h-8 text-amber-900" />
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Yêu cầu đăng nhập Quản trị viên</span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-black text-slate-800">
                    Đăng Nhập Để Quản Lý Từ Vựng & Người Chơi
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
                    Chỉ 4 Quản Trị Viên được chỉ định mới có toàn quyền thêm, sửa, xóa từ vựng và quản lý học viên.
                  </p>

                  {/* 4 Designated Admins Quick Access */}
                  <div className="mt-6 max-w-lg mx-auto text-left space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span>Đăng nhập Ban Quản Trị Hệ Thống:</span>
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                        1 Admin Chính • 3 Admin Phụ
                      </span>
                    </div>

                    {/* Admin Chính Highlighted */}
                    <div>
                      <div className="text-[10px] font-bold text-amber-800 mb-1 flex items-center gap-1">
                        <span>👑 ADMIN CHÍNH:</span>
                      </div>
                      {DESIGNATED_ADMINS.filter((a) => a.adminLevel === 'main').map((admin) => (
                        <button
                          key={admin.email}
                          onClick={() => {
                            setCustomLoginEmail(admin.email);
                            setCustomLoginName(admin.name);
                            setShowLoginModal('gmail');
                          }}
                          className="w-full p-2.5 rounded-xl border-2 border-amber-400 bg-amber-50/70 hover:bg-amber-100/80 transition-all text-left flex items-center justify-between group cursor-pointer shadow-xs"
                        >
                          <div className="min-w-0 pr-1 flex items-center gap-2">
                            <span className="text-base">👑</span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-black text-amber-950 truncate">
                                  {admin.name}
                                </span>
                                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[9px] font-black uppercase">
                                  Admin Chính
                                </span>
                              </div>
                              <div className="text-[10px] text-amber-800/80 truncate">🔒 Gmail Quản Trị Viên (Đã ẩn bảo mật)</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded-md shrink-0">
                            Đăng nhập
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Admin Phụ */}
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                        <span>🛡️ ADMIN PHỤ:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {DESIGNATED_ADMINS.filter((a) => a.adminLevel === 'sub').map((admin) => (
                          <button
                            key={admin.email}
                            onClick={() => {
                              setCustomLoginEmail(admin.email);
                              setCustomLoginName(admin.name);
                              setShowLoginModal('gmail');
                            }}
                            className="p-2 rounded-xl border border-indigo-200 bg-white hover:bg-indigo-50/60 hover:border-indigo-300 transition-all text-left flex flex-col justify-between group cursor-pointer shadow-2xs"
                          >
                            <div className="flex items-center gap-1 min-w-0">
                              <span className="text-xs">🛡️</span>
                              <span className="text-xs font-black text-slate-800 truncate">
                                {admin.name}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 truncate mt-0.5">🔒 Gmail Đã Bảo Mật</div>
                            <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1 py-0.2 rounded-md mt-1 self-start">
                              Admin Phụ
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Or open full Auth Modal */}
                  <div className="mt-5 pt-4 border-t border-slate-200 max-w-md mx-auto flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAuthModal?.();
                      }}
                      className="px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-sky-200 transition-all cursor-pointer"
                    >
                      Mở bảng Đăng Nhập / Đăng Ký Tài Khoản
                    </button>
                  </div>
                </div>
              ) : (
                /* USER HAS LOGGED IN */
                <div className="space-y-6">
                  {/* User Profile Header */}
                  <div
                    className={`rounded-3xl p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isMainAdminEmail(adminUser.email)
                        ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700'
                        : isSubAdminEmail(adminUser.email)
                        ? 'bg-gradient-to-r from-indigo-600 via-sky-600 to-indigo-700'
                        : 'bg-gradient-to-r from-sky-600 to-indigo-600'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-3xl border border-white/30 shadow-inner">
                        {adminUser.avatar || (isAuthorizedAdmin ? '👑' : '🎓')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base sm:text-lg font-black">{adminUser.name}</h4>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                              isMainAdminEmail(adminUser.email)
                                ? 'bg-amber-300 text-slate-950'
                                : isSubAdminEmail(adminUser.email)
                                ? 'bg-indigo-200 text-indigo-950'
                                : 'bg-emerald-400 text-slate-950'
                            }`}
                          >
                            <Award className="w-3 h-3" />
                            {isMainAdminEmail(adminUser.email)
                              ? '👑 Admin Chính (Tổng Quản Trị)'
                              : isSubAdminEmail(adminUser.email)
                              ? '🛡️ Admin Phụ (Phó Quản Trị)'
                              : 'Tài Khoản Học Viên'}
                          </span>
                        </div>
                        <p className="text-xs text-white/90 mt-0.5 font-mono">{adminUser.email}</p>
                        <div className="flex items-center gap-2 text-[11px] text-white/80 mt-1">
                          <span className="capitalize">
                            Đăng nhập qua {adminUser.provider === 'gmail' ? 'Google / Gmail' : adminUser.provider}
                          </span>
                          <span>•</span>
                          <span>{adminUser.loggedInAt || 'Đang hoạt động'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      {isAuthorizedAdmin && onOpenPlayerManagement && (
                        <button
                          onClick={() => {
                            playClickSound();
                            onClose();
                            onOpenPlayerManagement();
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-amber-900 text-xs font-black shadow-xs hover:bg-amber-50 transition-all cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Quản Lý Người Chơi</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          playClickSound();
                          onLogout();
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>

                  {/* Notice if not Server Admin */}
                  {!isAuthorizedAdmin && (
                    <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-sky-900">Chế độ Học viên:</strong> Bạn có quyền tra cứu, nghe phát âm và ôn tập tất cả hơn 1000 từ vựng. Quyền thêm, sửa và quản lý người chơi được cấp cho 4 Quản Trị Viên hệ thống.
                      </div>
                    </div>
                  )}

                  {/* Vocabulary Statistics & Quick Action */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs">
                      <div className="text-xs text-slate-500 font-semibold">Tổng số từ vựng</div>
                      <div className="text-xl font-black text-slate-800 mt-1">{cards.length}</div>
                    </div>
                    <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs">
                      <div className="text-xs text-slate-500 font-semibold">Admin đã thêm</div>
                      <div className="text-xl font-black text-rose-600 mt-1">{customCardsCount}</div>
                    </div>
                    <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs">
                      <div className="text-xs text-slate-500 font-semibold">Chủ đề từ vựng</div>
                      <div className="text-xl font-black text-sky-600 mt-1">11 chủ đề</div>
                    </div>
                    <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs">
                      <div className="text-xs text-slate-500 font-semibold">Từ điển TOPIK</div>
                      <div className="text-xl font-black text-emerald-600 mt-1">Cấp 1 & 2</div>
                    </div>
                  </div>

                  {/* Action Bar: Add Word button & Reset button (Only for Authorized Admin) */}
                  {isAuthorizedAdmin && (
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            playClickSound();
                            handleOpenAddForm();
                          }}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-black shadow-md shadow-rose-200 hover:scale-102 active:scale-98 transition-all cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Thêm từ vựng mới vào từ điển</span>
                        </button>

                        {onOpenPlayerManagement && (
                          <button
                            onClick={() => {
                              playClickSound();
                              onClose();
                              onOpenPlayerManagement();
                            }}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-black shadow-md shadow-amber-200 hover:scale-102 active:scale-98 transition-all cursor-pointer"
                          >
                            <Users className="w-4 h-4" />
                            <span>Quản lý người chơi</span>
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          if (confirm('Bạn có chắc muốn khôi phục kho từ vựng về mặc định hơn 1000 từ chuẩn?')) {
                            onResetCards();
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Khôi phục mặc định</span>
                      </button>
                    </div>
                  )}

                  {/* ADD / EDIT VOCABULARY FORM MODAL / DRAWER */}
                  {isFormOpen && (
                    <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-sky-300 shadow-lg space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h4 className="text-base font-black text-slate-800 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-sky-500" />
                          <span>{editingCardId ? 'Chỉnh sửa từ vựng' : 'Thêm từ vựng tiếng Hàn mới'}</span>
                        </h4>
                        <button
                          onClick={() => setIsFormOpen(false)}
                          className="text-slate-400 hover:text-slate-700 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {formError && (
                        <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-bold border border-red-200 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{formError}</span>
                        </div>
                      )}

                      {formSuccess && (
                        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>{formSuccess}</span>
                        </div>
                      )}

                      <form onSubmit={handleSaveCard} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Tiếng Hàn (Hangul) *
                            </label>
                            <input
                              type="text"
                              required
                              value={formHangul}
                              onChange={(e) => setFormHangul(e.target.value)}
                              placeholder="Ví dụ: 사과, 친구, 가다..."
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Phiên âm La-tinh *
                            </label>
                            <input
                              type="text"
                              required
                              value={formRomanization}
                              onChange={(e) => setFormRomanization(e.target.value)}
                              placeholder="Ví dụ: sa-gwa, chin-gu..."
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Nghĩa tiếng Việt *
                            </label>
                            <input
                              type="text"
                              required
                              value={formVietnamese}
                              onChange={(e) => setFormVietnamese(e.target.value)}
                              placeholder="Ví dụ: quả táo, bạn bè..."
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-amber-900 focus:outline-none focus:ring-2 focus:ring-sky-400"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Chủ đề từ vựng
                            </label>
                            <select
                              value={formCategory}
                              onChange={(e) => setFormCategory(e.target.value as VocabCategory)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer bg-white"
                            >
                              <option value="food">🍲 Ẩm thực (food)</option>
                              <option value="greetings">👋 Chào hỏi (greetings)</option>
                              <option value="daily">🏡 Đời sống (daily)</option>
                              <option value="shopping">🛍️ Mua sắm (shopping)</option>
                              <option value="travel">✈️ Du lịch (travel)</option>
                              <option value="family">👨‍👩‍👧 Gia đình (family)</option>
                              <option value="emotions">💖 Cảm xúc (emotions)</option>
                              <option value="verbs">🏃 Động từ (verbs)</option>
                              <option value="numbers">🔢 Số đếm (numbers)</option>
                              <option value="hangeul">🔤 Bảng chữ cái (hangeul)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Từ loại (POS)
                            </label>
                            <select
                              value={formPos}
                              onChange={(e) => setFormPos(e.target.value as 'Danh từ')}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer bg-white"
                            >
                              <option value="Danh từ">Danh từ</option>
                              <option value="Động từ">Động từ</option>
                              <option value="Tính từ">Tính từ</option>
                              <option value="Phó từ">Phó từ</option>
                              <option value="Cụm từ">Cụm từ</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Cấp độ TOPIK
                            </label>
                            <select
                              value={formTopik}
                              onChange={(e) => setFormTopik(e.target.value as 'Sơ cấp 1')}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer bg-white"
                            >
                              <option value="Sơ cấp 1">Sơ cấp 1 (TOPIK I)</option>
                              <option value="Sơ cấp 2">Sơ cấp 2 (TOPIK I)</option>
                              <option value="Trung cấp">Trung cấp (TOPIK II)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Câu ví dụ tiếng Hàn
                            </label>
                            <input
                              type="text"
                              value={formExampleKo}
                              onChange={(e) => setFormExampleKo(e.target.value)}
                              placeholder="Ví dụ: 사과를 맛있게 먹어요."
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Dịch nghĩa ví dụ tiếng Việt
                            </label>
                            <input
                              type="text"
                              value={formExampleVi}
                              onChange={(e) => setFormExampleVi(e.target.value)}
                              placeholder="Ví dụ: Tôi ăn táo rất ngon miệng."
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Mẹo ghi nhớ hoặc lưu ý văn hóa (Tùy chọn)
                          </label>
                          <input
                            type="text"
                            value={formTips}
                            onChange={(e) => setFormTips(e.target.value)}
                            placeholder="Ví dụ: Từ này thường dùng khi đi chợ mua đồ..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (formHangul) speakKorean(formHangul);
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Volume2 className="w-3.5 h-3.5 text-sky-600" />
                            <span>Nghe thử phát âm</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setIsFormOpen(false)}
                              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
                            >
                              Hủy bỏ
                            </button>
                            <button
                              type="submit"
                              className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-black shadow-xs transition-all cursor-pointer"
                            >
                              {editingCardId ? 'Cập nhật từ vựng' : 'Lưu từ vựng'}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* VOCABULARY MANAGEMENT LIST */}
                  <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Tìm kiếm từ vựng theo tiếng Hàn, phiên âm hoặc tiếng Việt..."
                          className="w-full pl-9 pr-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value as 'all')}
                          className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none cursor-pointer"
                        >
                          <option value="all">Tất cả ({cards.length})</option>
                          <option value="custom">Do Admin thêm ({customCardsCount})</option>
                          <option value="default">Từ hệ thống ({cards.length - customCardsCount})</option>
                        </select>

                        <select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none cursor-pointer"
                        >
                          <option value="all">Tất cả chủ đề</option>
                          <option value="food">Ẩm thực</option>
                          <option value="greetings">Chào hỏi</option>
                          <option value="daily">Đời sống</option>
                          <option value="shopping">Mua sắm</option>
                          <option value="travel">Du lịch</option>
                          <option value="family">Gia đình</option>
                          <option value="emotions">Cảm xúc</option>
                          <option value="verbs">Động từ</option>
                          <option value="numbers">Số đếm</option>
                          <option value="hangeul">Chữ Hangeul</option>
                        </select>
                      </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                      {filteredVocab.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs">
                          Không tìm thấy từ vựng nào khớp với bộ lọc.
                        </div>
                      ) : (
                        filteredVocab.map((card) => (
                          <div
                            key={card.id}
                            className="p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => speakKorean(card.hangul)}
                                className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-600 transition-colors cursor-pointer"
                                title="Phát âm"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-base font-black text-slate-900 font-sans">
                                    {card.hangul}
                                  </span>
                                  <span className="text-xs font-mono font-medium text-sky-600">
                                    /{card.romanization}/
                                  </span>
                                  <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                                    {card.category}
                                  </span>
                                  {card.isCustomAdmin && (
                                    <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 text-[10px] font-black">
                                      Admin
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs font-medium text-slate-600 mt-0.5">
                                  {card.vietnamese}
                                </div>
                              </div>
                            </div>

                            {isAuthorizedAdmin && (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleOpenEditForm(card)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                                  title="Chỉnh sửa từ vựng"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Bạn có chắc muốn xóa từ "${card.hangul}"?`)) {
                                      onDeleteCard(card.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Xóa từ vựng"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>한국어 여정 • Hơn 1000 từ vựng & Quản trị</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* LOGIN PROMPT DIALOG */}
      {showLoginModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-xl shadow-xs">
              <span className="text-3xl">👑</span>
            </div>

            <div>
              <h4 className="text-base font-black text-slate-800">
                Xác thực Quản trị viên
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Đăng nhập tài khoản Admin để có quyền thêm, sửa từ vựng và quản lý người chơi.
              </p>
            </div>

            <div className="space-y-3 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Email Quản trị viên</label>
                <input
                  type="email"
                  value={customLoginEmail}
                  onChange={(e) => setCustomLoginEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Tên hiển thị</label>
                <input
                  type="text"
                  value={customLoginName}
                  onChange={(e) => setCustomLoginName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Mật khẩu Quản trị</label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={customLoginPassword}
                    onChange={(e) => setCustomLoginPassword(e.target.value)}
                    placeholder="Nhập mật khẩu quản trị..."
                    className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 font-mono"
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

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowLoginModal(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  onLogin(showLoginModal, customLoginEmail, customLoginName, customLoginPassword);
                  setShowLoginModal(null);
                  playSuccessSound();
                }}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-xs transition-all cursor-pointer"
              >
                Đăng nhập Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
