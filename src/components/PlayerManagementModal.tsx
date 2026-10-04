import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  ShieldCheck,
  Shield,
  Search,
  Plus,
  Trash2,
  Edit2,
  Lock,
  Unlock,
  Award,
  Flame,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Crown,
  UserCheck,
  Star,
  ShieldAlert,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Send,
  Copy,
  ExternalLink,
  Check
} from 'lucide-react';
import { AppUser, UserRole } from '../types';
import {
  getRegisteredUsers,
  saveRegisteredUsers,
  updatePlayer,
  deletePlayer,
  registerUser,
  isDesignatedAdminEmail,
  isMainAdminEmail,
  isSubAdminEmail,
  DESIGNATED_ADMINS,
  normalizeEmail,
  getAdminTitle,
  MAIN_ADMIN_EMAIL,
  MAIN_ADMIN_DEFAULT_PASSWORD,
  SUB_ADMIN_MASTER_PASSWORD,
  getAdminCredentialsReport,
  formatCredentialsEmailText,
  sendAdminCredentialsToGmail
} from '../services/authService';
import { playClickSound, playSuccessSound } from '../utils/audio';

interface PlayerManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  onUserSessionUpdated?: (user: AppUser) => void;
}

export const PlayerManagementModal: React.FC<PlayerManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserSessionUpdated,
}) => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'main_admin' | 'sub_admin' | 'student'>('all');

  // Add Player State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('123456');
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  // Edit Player State
  const [editingPlayer, setEditingPlayer] = useState<AppUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editXp, setEditXp] = useState<number>(0);
  const [editStreak, setEditStreak] = useState<number>(0);
  const [editRole, setEditRole] = useState<UserRole>('student');
  const [editError, setEditError] = useState('');

  // Notification message
  const [globalNotice, setGlobalNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Admin Credentials & Gmail Dispatch State
  const [isAdminCredsOpen, setIsAdminCredsOpen] = useState(true);
  const [showAdminPasswords, setShowAdminPasswords] = useState(false);
  const [isSendingGmail, setIsSendingGmail] = useState(false);
  const [gmailSendResult, setGmailSendResult] = useState<string | null>(null);
  const [copiedTarget, setCopiedTarget] = useState<string | null>(null);

  const handleSendAdminPasswordsToGmail = async () => {
    setIsSendingGmail(true);
    setGmailSendResult(null);
    try {
      const res = await sendAdminCredentialsToGmail(MAIN_ADMIN_EMAIL);
      setIsSendingGmail(false);
      playSuccessSound();
      setGmailSendResult(`✅ ${res.message} (Ghi nhận lúc: ${res.sentAt})`);
      setGlobalNotice({
        type: 'success',
        text: `Đã gửi báo cáo mật khẩu Ban Quản Trị về Gmail ${MAIN_ADMIN_EMAIL}!`,
      });
      setTimeout(() => setGlobalNotice(null), 4000);
    } catch (e: any) {
      setIsSendingGmail(false);
      setGmailSendResult(`❌ Lỗi gửi email: ${e.message}`);
    }
  };

  const handleCopyReport = () => {
    const report = getAdminCredentialsReport();
    const { body } = formatCredentialsEmailText(report);
    navigator.clipboard.writeText(body);
    playClickSound();
    setCopiedTarget('full_report');
    setTimeout(() => setCopiedTarget(null), 2500);
  };

  const handleCopySingle = (text: string, targetId: string) => {
    navigator.clipboard.writeText(text);
    playClickSound();
    setCopiedTarget(targetId);
    setTimeout(() => setCopiedTarget(null), 2000);
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = () => {
    const list = getRegisteredUsers();
    setUsers(list);
  };

  if (!isOpen) return null;

  const isCurrentMainAdmin = currentUser ? isMainAdminEmail(currentUser.email) : false;
  const isCurrentSubAdmin = currentUser ? isSubAdminEmail(currentUser.email) : false;

  // Verify Admin rights
  const hasAdminRights =
    currentUser &&
    (currentUser.role === 'admin' ||
      currentUser.isServerAdmin ||
      isDesignatedAdminEmail(currentUser.email));

  if (!hasAdminRights) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 text-center shadow-2xl border border-slate-100">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 text-2xl">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-800">Quyền Hạn Hạn Chế</h3>
          <p className="text-sm text-slate-600 mt-2">
            Chỉ Ban Quản Trị (Admin Chính: Trần Bảo Ngọc & 3 Admin Phụ: Lê Thị Yến Nhi, Lê Thị Tuyết Lệ, Vũ Huỳnh Gia Linh) mới có quyền truy cập.
          </p>
          <button
            onClick={onClose}
            className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-sm hover:bg-slate-900 transition-all cursor-pointer"
          >
            Đóng Lại
          </button>
        </div>
      </div>
    );
  }

  // Filtered list
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesRole = true;
    if (roleFilter === 'main_admin') {
      matchesRole = isMainAdminEmail(u.email);
    } else if (roleFilter === 'sub_admin') {
      matchesRole = isSubAdminEmail(u.email);
    } else if (roleFilter === 'student') {
      matchesRole = u.role === 'student' && !isDesignatedAdminEmail(u.email);
    }

    return matchesSearch && matchesRole;
  });

  const totalMainAdmin = users.filter((u) => isMainAdminEmail(u.email)).length;
  const totalSubAdmins = users.filter((u) => isSubAdminEmail(u.email)).length;
  const totalStudents = users.filter((u) => u.role === 'student' && !isDesignatedAdminEmail(u.email)).length;

  const handleAddNewPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');

    if (!addPassword.trim() || addPassword.trim().length < 6) {
      setAddError('Mật khẩu đăng nhập phải có ít nhất 6 ký tự!');
      return;
    }

    const res = registerUser(addName, addEmail, addPassword.trim());
    if (!res.success) {
      setAddError(res.error || 'Thêm người chơi thất bại!');
      return;
    }

    playSuccessSound();
    setAddSuccess(`Đã tạo tài khoản cho người chơi: ${res.user?.name} (Mật khẩu: ${addPassword.trim()})`);
    loadUsers();
    setAddName('');
    setAddEmail('');
    setAddPassword('123456');
    setTimeout(() => {
      setIsAddOpen(false);
      setAddSuccess('');
    }, 1500);
  };

  const handleStartEdit = (user: AppUser) => {
    // If target is Main Admin and current is NOT Main Admin:
    if (isMainAdminEmail(user.email) && !isCurrentMainAdmin) {
      setGlobalNotice({
        type: 'error',
        text: 'Chỉ Admin Chính (Trần Bảo Ngọc) mới có quyền chỉnh sửa tài khoản của mình!',
      });
      setTimeout(() => setGlobalNotice(null), 3500);
      return;
    }

    // If target is Sub Admin and current is NOT Main Admin AND not editing themselves:
    if (isSubAdminEmail(user.email) && !isCurrentMainAdmin && user.email !== currentUser?.email) {
      setGlobalNotice({
        type: 'error',
        text: 'Chỉ Admin Chính (Trần Bảo Ngọc) mới có quyền thay đổi thông tin của Admin Phụ khác!',
      });
      setTimeout(() => setGlobalNotice(null), 3500);
      return;
    }

    setEditingPlayer(user);
    setEditName(user.name);
    setEditPassword(user.password || '');
    setShowEditPassword(false);
    setEditXp(user.totalXp || 0);
    setEditStreak(user.streak || 0);
    setEditRole(user.role);
    setEditError('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;

    if (!editName.trim()) {
      setEditError('Họ và tên không được để trống!');
      return;
    }

    if (editPassword.trim() && editPassword.trim().length < 6) {
      setEditError('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    // Determine final role:
    // Main admin and sub admins always keep their admin status
    let finalRole = editRole;
    if (isDesignatedAdminEmail(editingPlayer.email)) {
      finalRole = 'admin';
    } else if (!isCurrentMainAdmin && editingPlayer.role !== editRole) {
      // Sub admin cannot promote or demote other users
      setEditError('Chỉ Admin Chính (Trần Bảo Ngọc) mới có thẩm quyền bổ nhiệm hoặc thay đổi vai trò!');
      return;
    }

    const updates: Partial<AppUser> = {
      name: editName.trim(),
      totalXp: Number(editXp) || 0,
      streak: Number(editStreak) || 0,
      role: finalRole,
    };

    if (editPassword.trim()) {
      updates.password = editPassword.trim();
    }

    const res = updatePlayer(editingPlayer.id, updates);
    if (res.success) {
      playSuccessSound();
      setUsers(res.users);
      setEditingPlayer(null);
      setGlobalNotice({ type: 'success', text: `Đã cập nhật thông tin cho ${editName}!` });
      setTimeout(() => setGlobalNotice(null), 3000);

      if (currentUser && currentUser.id === editingPlayer.id && res.updatedUser) {
        onUserSessionUpdated?.(res.updatedUser);
      }
    }
  };

  const handleToggleSuspend = (user: AppUser) => {
    if (isMainAdminEmail(user.email)) {
      setGlobalNotice({
        type: 'error',
        text: 'Không thể tạm khóa tài khoản của Admin Chính (Trần Bảo Ngọc)!',
      });
      setTimeout(() => setGlobalNotice(null), 3500);
      return;
    }

    if (isSubAdminEmail(user.email)) {
      if (!isCurrentMainAdmin) {
        setGlobalNotice({
          type: 'error',
          text: 'Chỉ Admin Chính (Trần Bảo Ngọc) mới có quyền khóa/mở khóa Admin Phụ!',
        });
        setTimeout(() => setGlobalNotice(null), 3500);
        return;
      }
    }

    const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
    const res = updatePlayer(user.id, { status: newStatus });
    if (res.success) {
      playClickSound();
      setUsers(res.users);
      setGlobalNotice({
        type: 'success',
        text: `Đã ${newStatus === 'suspended' ? 'khóa' : 'mở khóa'} tài khoản ${user.name}!`,
      });
      setTimeout(() => setGlobalNotice(null), 3000);
    }
  };

  const handleDeleteUser = (user: AppUser) => {
    if (isMainAdminEmail(user.email)) {
      setGlobalNotice({
        type: 'error',
        text: 'Không thể xóa tài khoản của Admin Chính (Trần Bảo Ngọc)!',
      });
      setTimeout(() => setGlobalNotice(null), 3500);
      return;
    }

    if (isSubAdminEmail(user.email)) {
      setGlobalNotice({
        type: 'error',
        text: 'Tài khoản Admin Phụ được hệ thống bảo vệ an toàn!',
      });
      setTimeout(() => setGlobalNotice(null), 3500);
      return;
    }

    const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa người chơi "${user.name}"?`);
    if (!confirmed) return;

    const res = deletePlayer(user.id);
    if (res.success) {
      playClickSound();
      setUsers(res.users);
      setGlobalNotice({ type: 'success', text: `Đã xóa người chơi ${user.name} khỏi hệ thống!` });
      setTimeout(() => setGlobalNotice(null), 3000);
    } else {
      setGlobalNotice({ type: 'error', text: res.error || 'Xóa thất bại!' });
      setTimeout(() => setGlobalNotice(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Admin Hierarchy Information */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-5 sm:p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl border border-white/30 shadow-inner">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black tracking-tight">
                  Quản Lý Người Chơi (Admin Portal)
                </h3>
                {isCurrentMainAdmin ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black shadow-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-950" />
                    <span>Bạn là: Admin Chính (Trần Bảo Ngọc)</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    <span>Bạn là: Admin Phụ ({currentUser?.name})</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-100 mt-0.5">
                👑 <strong>Trần Bảo Ngọc</strong>: Admin Chính (Tổng Quản Trị) • 🛡️ <strong>Yến Nhi, Tuyết Lệ, Gia Linh</strong>: Admin Phụ
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer shrink-0"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Notice Toast */}
        {globalNotice && (
          <div
            className={`px-4 py-2.5 text-xs font-bold flex items-center justify-between animate-fadeIn ${
              globalNotice.type === 'success'
                ? 'bg-emerald-500 text-white'
                : 'bg-rose-500 text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              {globalNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>{globalNotice.text}</span>
            </div>
            <button
              onClick={() => setGlobalNotice(null)}
              className="text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stat Cards - Distinguishing Admin Chính vs Admin Phụ vs Học viên */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-slate-50 border-b border-slate-200">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-3 rounded-2xl border border-amber-300 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-amber-800 flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-600 fill-amber-600" />
                <span>Admin Chính</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900">
                Tối cao
              </span>
            </div>
            <div className="text-base sm:text-lg font-black text-amber-900 mt-1">Trần Bảo Ngọc</div>
            <div className="text-[10px] text-amber-700 font-medium">Tổng Quản Trị ({totalMainAdmin})</div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-indigo-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-indigo-700 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-indigo-500" />
                <span>Admin Phụ</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800">
                Đồng quản trị
              </span>
            </div>
            <div className="text-lg sm:text-xl font-black text-indigo-700 mt-0.5">{totalSubAdmins}</div>
            <div className="text-[10px] text-slate-500 font-medium">Yến Nhi, Tuyết Lệ, Gia Linh</div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-sky-200 shadow-xs">
            <span className="text-[11px] font-bold text-sky-600">Học Viên (Students)</span>
            <div className="text-lg sm:text-xl font-black text-sky-600 mt-0.5">{totalStudents}</div>
            <div className="text-[10px] text-slate-500 font-medium">Chỉ truy cập học bài</div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-emerald-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-600">Thêm Mới</span>
              <div className="text-xs font-bold text-slate-600">Học viên mới</div>
            </div>
            <button
              onClick={() => {
                playClickSound();
                setIsAddOpen(!isAddOpen);
              }}
              className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all cursor-pointer shadow-xs"
              title="Thêm người chơi mới"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* BẢO MẬT MẬT KHẨU RIÊNG ADMIN CHÍNH & PHỤ - GỬI GMAIL (zApollo1990@gmail.com) */}
        {(() => {
          const adminReport = getAdminCredentialsReport();
          return (
            <div className="bg-gradient-to-r from-amber-50/90 via-orange-50/40 to-indigo-50/50 p-4 border-b border-amber-200">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shadow-xs text-lg">
                    👑
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-2 flex-wrap">
                      <span>Mật Khẩu Chung Ban Quản Trị: 123456</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                        Đăng Nhập Chung 123456
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      Tất cả các Admin (cả Admin Chính & 3 Admin Phụ) đều sử dụng chung mật khẩu: <strong>123456</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setShowAdminPasswords(!showAdminPasswords);
                    }}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    title={showAdminPasswords ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showAdminPasswords ? <EyeOff className="w-3.5 h-3.5 text-slate-500" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{showAdminPasswords ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setIsAdminCredsOpen(!isAdminCredsOpen);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    {isAdminCredsOpen ? 'Thu gọn' : 'Chi tiết mật khẩu'}
                  </button>
                </div>
              </div>

              {isAdminCredsOpen && (
                <div className="space-y-3 animate-fadeIn">
                  {/* Master Banner Mật Khẩu Chung 123456 */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-sm flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl border border-white/30">
                        🔑
                      </div>
                      <div>
                        <div className="text-xs font-bold text-amber-100 uppercase tracking-wider">
                          Mật khẩu đăng nhập chung cho TẤT CẢ các Admin:
                        </div>
                        <div className="text-xl sm:text-2xl font-black font-mono tracking-widest text-white">
                          {showAdminPasswords ? '123456' : '••••••'}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopySingle('123456', 'shared_master')}
                      className="px-3.5 py-2 rounded-xl bg-white text-amber-900 hover:bg-amber-50 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0"
                    >
                      {copiedTarget === 'shared_master' ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-amber-900" />
                      )}
                      <span>{copiedTarget === 'shared_master' ? 'Đã sao chép 123456!' : 'Sao chép: 123456'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Admin Chính Card */}
                    <div className="p-3.5 rounded-2xl bg-white border-2 border-amber-400 shadow-xs relative overflow-hidden">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">👑</span>
                          <div>
                            <div className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                              <span>Trần Bảo Ngọc</span>
                              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[9px] font-black uppercase">
                                Admin Chính
                              </span>
                            </div>
                            <div className="text-[10px] text-amber-800 font-semibold">
                              Tổng Quản Trị • Toàn quyền tối cao
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
                          Toàn quyền
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 mt-2 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[11px] font-bold text-amber-900">Mật khẩu đăng nhập:</span>
                          <span className="font-mono font-black text-sm text-amber-950">
                            {showAdminPasswords ? '123456' : '••••••'}
                          </span>
                        </div>
                        <div className="text-[10px] text-amber-800/80 font-medium">
                          🔒 Tài khoản Gmail: {MAIN_ADMIN_EMAIL} (Đã ẩn bảo mật)
                        </div>
                      </div>
                    </div>

                    {/* Admin Phụ Card */}
                    <div className="p-3.5 rounded-2xl bg-white border border-indigo-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🛡️</span>
                          <div>
                            <div className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                              <span>3 Admin Phụ (Phó Quản Trị)</span>
                              <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 text-[9px] font-bold">
                                Đồng Quản Trị
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">
                              Đăng nhập chung mật khẩu: <strong>123456</strong>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        {adminReport.subAdmins.map((adm, idx) => (
                          <div
                            key={adm.email}
                            className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              <span className="text-xs">🛡️</span>
                              <div className="min-w-0">
                                <span className="font-bold text-slate-800 text-[11px] block truncate">
                                  {adm.name}
                                </span>
                                <span className="font-mono text-[11px] font-semibold text-indigo-700">
                                  {showAdminPasswords ? '123456' : '••••••'}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopySingle('123456', `sub_pass_${idx}`)}
                              className="text-[10px] font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 shrink-0 cursor-pointer"
                            >
                              {copiedTarget === `sub_pass_${idx}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              <span>{copiedTarget === `sub_pass_${idx}` ? 'Đã chép' : 'Sao chép'}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Gửi Gmail Action Bar */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                        <Mail className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <div className="text-xs font-black flex items-center gap-2 flex-wrap">
                          <span>Gửi Báo Cáo Mật Khẩu Tới Gmail:</span>
                          <span className="font-mono font-bold text-amber-300 underline decoration-amber-400/50">
                            {MAIN_ADMIN_EMAIL}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300 mt-0.5">
                          Đầy đủ danh sách tài khoản, vai trò và mật khẩu riêng bảo mật để lưu trữ an toàn.
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 flex-wrap justify-end">
                      <button
                        type="button"
                        disabled={isSendingGmail}
                        onClick={handleSendAdminPasswordsToGmail}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSendingGmail ? 'Đang gửi...' : 'Gửi Đến Gmail Ngay'}</span>
                      </button>

                      <a
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                          MAIN_ADMIN_EMAIL
                        )}&su=${encodeURIComponent(
                          `[한국어 여정] BÁO CÁO MẬT KHẨU BAN QUẢN TRỊ (ADMIN CHÍNH & PHỤ)`
                        )}&body=${encodeURIComponent(formatCredentialsEmailText(adminReport).body)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-white/20"
                        title="Mở ứng dụng Gmail trực tiếp với bản thảo đã điền sẵn"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Mở Gmail</span>
                      </a>

                      <button
                        type="button"
                        onClick={handleCopyReport}
                        className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-white/20"
                        title="Sao chép toàn bộ nội dung báo cáo mật khẩu"
                      >
                        {copiedTarget === 'full_report' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedTarget === 'full_report' ? 'Đã chép!' : 'Sao Chép Báo Cáo'}</span>
                      </button>
                    </div>
                  </div>

                  {gmailSendResult && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{gmailSendResult}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* Collapsible Add Form */}
        {isAddOpen && (
          <form
            onSubmit={handleAddNewPlayer}
            className="p-4 bg-emerald-50/50 border-b border-emerald-200 space-y-3 animate-fadeIn"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>Thêm Tài Khoản Học Viên Mới</span>
              </span>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
              >
                Đóng form
              </button>
            </div>

            {addError && (
              <div className="p-2 rounded-xl bg-rose-100 text-rose-800 text-xs font-semibold">
                {addError}
              </div>
            )}
            {addSuccess && (
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
                {addSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Họ và tên người học <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="Ví dụ: Lê Minh Trí"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Gmail (không trùng lặp) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="minhtri.kr@gmail.com"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Mật khẩu khởi tạo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={addPassword}
                  onChange={(e) => setAddPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự (mặc định: 123456)"
                  required
                  minLength={6}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              Lưu & Kích Hoạt Tài Khoản
            </button>
          </form>
        )}

        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên hoặc Gmail..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-slate-500 shrink-0">Lọc vai trò:</span>
            <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  roleFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Tất cả ({users.length})
              </button>
              <button
                onClick={() => setRoleFilter('main_admin')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  roleFilter === 'main_admin' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                <Crown className="w-3 h-3" />
                <span>Admin Chính ({totalMainAdmin})</span>
              </button>
              <button
                onClick={() => setRoleFilter('sub_admin')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  roleFilter === 'sub_admin' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                <Shield className="w-3 h-3" />
                <span>Admin Phụ ({totalSubAdmins})</span>
              </button>
              <button
                onClick={() => setRoleFilter('student')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  roleFilter === 'student' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-500'
                }`}
              >
                Học viên ({totalStudents})
              </button>
            </div>
          </div>
        </div>

        {/* Players List Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2.5">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                Không tìm thấy người chơi nào phù hợp với tìm kiếm.
              </div>
            ) : (
              filteredUsers.map((user) => {
                const isMainAdmin = isMainAdminEmail(user.email);
                const isSubAdmin = isSubAdminEmail(user.email);
                const isDesignated = isMainAdmin || isSubAdmin;
                const isSuspended = user.status === 'suspended';

                return (
                  <div
                    key={user.id}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isMainAdmin
                        ? 'bg-gradient-to-r from-amber-50/80 to-orange-50/50 border-amber-300 shadow-sm ring-1 ring-amber-300/50'
                        : isSubAdmin
                        ? 'bg-indigo-50/40 border-indigo-200'
                        : isSuspended
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    {/* User Identity & Badges */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 border relative ${
                          isMainAdmin
                            ? 'bg-gradient-to-tr from-amber-400 to-amber-200 border-amber-400 shadow-sm'
                            : isSubAdmin
                            ? 'bg-gradient-to-tr from-indigo-100 to-purple-100 border-indigo-200 text-indigo-700'
                            : 'bg-gradient-to-tr from-slate-100 to-slate-200 border-slate-200'
                        }`}
                      >
                        {user.avatar || (isMainAdmin ? '👑' : isSubAdmin ? '🛡️' : '🎓')}
                        {isMainAdmin && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-[10px] text-white shadow-xs">
                            ★
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-black text-sm truncate ${
                              isMainAdmin ? 'text-amber-950 font-black' : 'text-slate-800'
                            }`}
                          >
                            {user.name}
                          </span>

                          {/* Distinctive badges for Admin Chính vs Admin Phụ */}
                          {isMainAdmin ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black border border-amber-400 shadow-xs flex items-center gap-1">
                              <Crown className="w-3 h-3 fill-white" />
                              <span>Admin Chính (Tổng Quản Trị)</span>
                            </span>
                          ) : isSubAdmin ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-black border border-indigo-200 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-indigo-600" />
                              <span>Admin Phụ (Phó Quản Trị)</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold border border-sky-200">
                              🎓 Học viên
                            </span>
                          )}

                          {isSuspended && (
                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                              Đã khóa
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-500 truncate flex items-center gap-2 mt-0.5 flex-wrap">
                          {isDesignated ? (
                            <span className="text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-md font-bold text-[11px] border border-amber-200">
                              🔒 Gmail Quản Trị Viên (Đã ẩn bảo mật)
                            </span>
                          ) : (
                            <span>{user.email}</span>
                          )}
                          <span>•</span>
                          <span>Tham gia: {user.createdAt || '01/01/2026'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-emerald-600 font-medium text-[11px] bg-emerald-50 px-1.5 py-0.2 rounded-md border border-emerald-100">
                            <Lock className="w-2.5 h-2.5 text-emerald-500" />
                            <span>Mật khẩu bảo mật cá nhân</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {/* XP and Streak Badges */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-sky-50 text-sky-700 text-xs font-black border border-sky-100">
                          <Sparkles className="w-3 h-3 text-sky-500" />
                          <span>{user.totalXp || 0} XP</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-orange-50 text-orange-700 text-xs font-black border border-orange-100">
                          <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                          <span>{user.streak || 0} ngày</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartEdit(user)}
                          className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                            isMainAdmin && !isCurrentMainAdmin
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'hover:bg-slate-100 text-slate-600 hover:text-sky-600'
                          }`}
                          title={
                            isMainAdmin && !isCurrentMainAdmin
                              ? 'Chỉ Admin Chính mới sửa được tài khoản của mình'
                              : 'Chỉnh sửa thông tin'
                          }
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {!isDesignated && (
                          <>
                            <button
                              onClick={() => handleToggleSuspend(user)}
                              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                                isSuspended
                                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                  : 'hover:bg-slate-100 text-slate-600 hover:text-amber-600'
                              }`}
                              title={isSuspended ? 'Mở khóa tài khoản' : 'Tạm khóa tài khoản'}
                            >
                              {isSuspended ? (
                                <Unlock className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Lock className="w-4 h-4" />
                              )}
                            </button>

                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-all cursor-pointer"
                              title="Xóa người chơi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Edit Player Modal Overlay */}
        {editingPlayer && (
          <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-black text-slate-800">
                    Chỉnh Sửa: {editingPlayer.name}
                  </h4>
                  <div className="text-[11px] text-slate-500">
                    {getAdminTitle(editingPlayer.email)}
                  </div>
                </div>
                <button
                  onClick={() => setEditingPlayer(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {editError && (
                <div className="p-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                  {editError}
                </div>
              )}

              <form onSubmit={handleSaveEdit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Địa chỉ Gmail (Bất biến)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={
                      isDesignatedAdminEmail(editingPlayer.email) || editingPlayer.role === 'admin'
                        ? '🔒 [Email Ban Quản Trị - Đã ẩn bảo mật toàn hệ thống]'
                        : editingPlayer.email
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-500 bg-slate-100 cursor-not-allowed font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tổng Điểm XP
                    </label>
                    <input
                      type="number"
                      value={editXp}
                      onChange={(e) => setEditXp(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Chuỗi Streak (ngày)
                    </label>
                    <input
                      type="number"
                      value={editStreak}
                      onChange={(e) => setEditStreak(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vai Trò Hệ Thống
                  </label>
                  {isMainAdminEmail(editingPlayer.email) ? (
                    <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-600 fill-amber-600" />
                      <span>👑 Admin Chính (Trần Bảo Ngọc) - Tối cao, không thể thay đổi</span>
                    </div>
                  ) : isSubAdminEmail(editingPlayer.email) ? (
                    <div className="px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-black flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      <span>🛡️ Admin Phụ (Chỉ định gốc)</span>
                    </div>
                  ) : (
                    <>
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value as UserRole)}
                        disabled={!isCurrentMainAdmin}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                      >
                        <option value="student">🎓 Học Viên (Chỉ có quyền học app)</option>
                        <option value="admin">👑 Quản Trị Viên (Toàn quyền quản lý)</option>
                      </select>
                      {!isCurrentMainAdmin && (
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          * Chỉ Admin Chính (Trần Bảo Ngọc) mới có quyền phong cấp/thay đổi vai trò của học viên.
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Password field in Edit Modal */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Mật khẩu tài khoản (Có thể xem & Đặt lại)
                    </label>
                    <span className="text-[10px] text-slate-500">Tối thiểu 6 ký tự</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới nếu muốn đổi..."
                      className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    * Bạn có thể hỗ trợ học viên đặt lại mật khẩu nếu họ quên.
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingPlayer(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Lưu Thay Đổi
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            👑 <strong>Trần Bảo Ngọc</strong>: Admin Chính (Tổng Quản Trị) • 🛡️ <strong>Yến Nhi, Tuyết Lệ, Gia Linh</strong>: Admin Phụ
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold cursor-pointer"
          >
            Đóng Lại
          </button>
        </div>
      </div>
    </div>
  );
};
