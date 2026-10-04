import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LogIn,
  UserPlus,
  Crown,
  Sparkles,
  ArrowRight,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Shield,
  RotateCcw
} from 'lucide-react';
import { AppUser } from '../types';
import {
  registerUser,
  loginUser,
  setPersonalPassword,
  DESIGNATED_ADMINS,
  isDesignatedAdminEmail,
  isMainAdminEmail,
  MAIN_ADMIN_EMAIL,
  MAIN_ADMIN_DEFAULT_PASSWORD,
  SUB_ADMIN_MASTER_PASSWORD,
  SHARED_ADMIN_PASSWORD,
  quickLoginAdmin,
  sendAdminCredentialsToGmail
} from '../services/authService';
import { playClickSound, playSuccessSound } from '../utils/audio';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AppUser) => void;
  initialMode?: 'login' | 'register' | 'change_password';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'change_password'>(initialMode);
  
  // Registration & Login fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Admin selected login state
  const [selectedAdminName, setSelectedAdminName] = useState<string | null>(null);
  const [selectedAdminEmail, setSelectedAdminEmail] = useState<string | null>(null);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Status notifications
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Handle Registration: User self-creates personal password
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên của bạn!');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Vui lòng nhập địa chỉ Gmail hợp lệ (ví dụ: tenban@gmail.com)!');
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Vui lòng tự đặt mật khẩu cá nhân cho tài khoản!');
      return;
    }

    if (password.trim().length < 6) {
      setErrorMsg('Mật khẩu cá nhân phải có ít nhất 6 ký tự!');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp! Vui lòng nhập lại.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = registerUser(name, email, password);
      setIsLoading(false);
      if (res.success && res.user) {
        playSuccessSound();
        setSuccessMsg(`Tạo tài khoản thành công! Mật khẩu cá nhân đã được lưu an toàn.`);
        setTimeout(() => {
          onLoginSuccess(res.user!);
          onClose();
        }, 800);
      } else {
        setErrorMsg(res.error || 'Đăng ký không thành công!');
      }
    }, 300);
  };

  // Handle Login: User inputs personal password
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim()) {
      setErrorMsg('Vui lòng nhập Gmail của bạn để đăng nhập!');
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Vui lòng nhập mật khẩu tài khoản cá nhân của bạn!');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = loginUser(email, password);
      setIsLoading(false);
      if (res.success && res.user) {
        playSuccessSound();
        setSuccessMsg(`Đăng nhập thành công! Chào mừng ${res.user.name}.`);
        setTimeout(() => {
          onLoginSuccess(res.user!);
          onClose();
        }, 800);
      } else {
        setErrorMsg(res.error || 'Đăng nhập thất bại! Vui lòng kiểm tra lại mật khẩu cá nhân.');
      }
    }, 300);
  };

  // Handle Direct Admin Access without typing password (Admin không cần đăng nhập / 1-chạm)
  const handleDirectAdminLogin = (adminEmail: string) => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    setTimeout(() => {
      const res = quickLoginAdmin(adminEmail, SHARED_ADMIN_PASSWORD);
      setIsLoading(false);
      if (res.success && res.user) {
        playSuccessSound();
        setSuccessMsg(`Truy cập Quản Trị Viên thành công! Chào mừng ${res.user.name}.`);
        setTimeout(() => {
          onLoginSuccess(res.user!);
          onClose();
        }, 600);
      } else {
        setErrorMsg(res.error || 'Không thể đăng nhập Quản trị viên!');
      }
    }, 200);
  };

  // Handle Admin Selected Login: Admin inputs password or uses shared 123456
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdminEmail) return;

    const pwd = adminPasswordInput.trim() || SHARED_ADMIN_PASSWORD;

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    setTimeout(() => {
      const res = loginUser(selectedAdminEmail, pwd);
      setIsLoading(false);
      if (res.success && res.user) {
        playSuccessSound();
        setSuccessMsg(`Xác thực Ban Quản Trị thành công! Chào mừng ${res.user.name}.`);
        setTimeout(() => {
          onLoginSuccess(res.user!);
          onClose();
        }, 700);
      } else {
        setErrorMsg('Mật khẩu Quản trị viên không chính xác! Mật khẩu chung của tất cả Admin là: 123456');
      }
    }, 250);
  };

  // Handle Self-setting / Changing Personal Password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim()) {
      setErrorMsg('Vui lòng nhập Gmail tài khoản cần đổi mật khẩu!');
      return;
    }

    if (!password.trim() || password.length < 6) {
      setErrorMsg('Mật khẩu mới phải có tối thiểu 6 ký tự!');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp! Vui lòng kiểm tra lại.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = setPersonalPassword(email, password);
      setIsLoading(false);
      if (res.success) {
        playSuccessSound();
        setSuccessMsg('Đã cập nhật mật khẩu cá nhân thành công! Bạn có thể đăng nhập ngay.');
        setTimeout(() => {
          if (res.user) {
            onLoginSuccess(res.user);
            onClose();
          } else {
            setMode('login');
          }
        }, 800);
      } else {
        setErrorMsg(res.error || 'Không thể cập nhật mật khẩu!');
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 p-6 text-white text-center">
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/40 shadow-inner text-2xl">
            {mode === 'register' ? '✨' : mode === 'change_password' ? '🔑' : '🔐'}
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            {mode === 'register'
              ? 'Tạo Tài Khoản Học Viên'
              : mode === 'change_password'
              ? 'Tự Đặt / Đổi Mật Khẩu Cá Nhân'
              : 'Đăng Nhập Tài Khoản'}
          </h3>
          <p className="text-xs sm:text-sm text-sky-100 mt-1 max-w-xs mx-auto">
            {mode === 'register'
              ? 'Tự đặt mật khẩu tài khoản cá nhân để bảo vệ tiến độ học tập'
              : mode === 'change_password'
              ? 'Nhập Gmail và thiết lập mật khẩu cá nhân mới của riêng bạn'
              : 'Nhập Gmail và Mật khẩu cá nhân bạn đã đặt'}
          </p>

          {/* Mode Switch Tabs */}
          <div className="flex bg-white/15 p-1 rounded-2xl max-w-sm mx-auto mt-4 border border-white/20">
            <button
              onClick={() => {
                playClickSound();
                setMode('login');
                setSelectedAdminName(null);
                setSelectedAdminEmail(null);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                mode === 'login'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng Nhập</span>
            </button>
            <button
              onClick={() => {
                playClickSound();
                setMode('register');
                setSelectedAdminName(null);
                setSelectedAdminEmail(null);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                mode === 'register'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Đăng Ký</span>
            </button>
            <button
              onClick={() => {
                playClickSound();
                setMode('change_password');
                setSelectedAdminName(null);
                setSelectedAdminEmail(null);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                mode === 'change_password'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Đổi MK</span>
            </button>
          </div>
        </div>

        {/* Body Form */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Notifications */}
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form Controls based on Mode */}
          {mode === 'register' ? (
            /* REGISTRATION FORM */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên người học <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn An"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm text-slate-800 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Địa chỉ Gmail cá nhân <span className="text-rose-500">*</span>
                  <span className="text-[11px] font-normal text-slate-500 ml-1">
                    (Không trùng lặp, dùng để đăng nhập)
                  </span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tenban@gmail.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm text-slate-800 font-medium"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tự đặt Mật khẩu tài khoản <span className="text-rose-500">*</span>
                  <span className="text-[11px] font-normal text-slate-500 ml-1">
                    (Tối thiểu 6 ký tự)
                  </span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tự nhập mật khẩu riêng của bạn..."
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm text-slate-800 font-medium font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Xác nhận lại Mật khẩu <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu giống bên trên"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm text-slate-800 font-medium font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-[11px] text-sky-800 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Bảo mật tài khoản cá nhân:</strong> Bạn tự đặt và ghi nhớ mật khẩu của riêng mình để đăng nhập mọi lúc.
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-sky-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Đang xử lý tạo tài khoản...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Tạo Tài Khoản Với Mật Khẩu Cá Nhân</span>
                  </>
                )}
              </button>
            </form>
          ) : mode === 'change_password' ? (
            /* CHANGE PASSWORD FORM */
            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Địa chỉ Gmail tài khoản <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập Gmail tài khoản của bạn..."
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm text-slate-800 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tự đặt Mật khẩu mới <span className="text-rose-500">*</span>
                  <span className="text-[11px] font-normal text-slate-500 ml-1">
                    (Tối thiểu 6 ký tự)
                  </span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới..."
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm text-slate-800 font-medium font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Xác nhận Mật khẩu mới <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Xác nhận lại mật khẩu mới..."
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm text-slate-800 font-medium font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-sm shadow-md shadow-amber-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Đang cập nhật mật khẩu...</span>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Lưu Mật Khẩu Cá Nhân Mới</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STANDARD LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Địa chỉ Gmail tài khoản <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập Gmail của bạn..."
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm text-slate-800 font-medium"
                  />
                </div>
              </div>

              {/* Password Input for Login */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Mật khẩu cá nhân <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('change_password');
                      setErrorMsg('');
                    }}
                    className="text-[11px] text-sky-600 font-bold hover:underline cursor-pointer"
                  >
                    Quên / Tự đặt lại MK?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu tài khoản của bạn..."
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm text-slate-800 font-medium font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-sky-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Đang xác thực tài khoản...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Đăng Nhập Tài Khoản</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ADMIN PORTAL LOGIN SECTION - ALL ADMIN EMAILS ARE COMPLETELY HIDDEN */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-1.5">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                <span>Khu Vực Ban Quản Trị</span>
              </span>
              <div className="flex items-center gap-1 text-[10px] font-bold">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ⚡ Vào ngay không cần MK
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  MK chung: 123456
                </span>
              </div>
            </div>

            {/* If an Admin is selected */}
            {selectedAdminName && selectedAdminEmail ? (
              <form onSubmit={handleAdminLoginSubmit} className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-400 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    <span className="text-xl shrink-0">👑</span>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-amber-950 truncate">
                        {selectedAdminName}
                      </div>
                      <div className="text-[10px] text-amber-800 font-bold truncate">
                        🔒 Gmail Quản Trị Viên (Đã ẩn bảo mật toàn hệ thống)
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAdminName(null);
                      setSelectedAdminEmail(null);
                      setAdminPasswordInput('');
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-700 px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 cursor-pointer shrink-0 transition-colors"
                  >
                    Đổi Admin
                  </button>
                </div>

                {/* Option 1: VÀO NGAY KHÔNG CẦN MẬT KHẨU (1-Chạm) */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleDirectAdminLogin(selectedAdminEmail)}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.01] active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-emerald-100" />
                  <span>🚀 Vào Ngay Không Cần Mật Khẩu (1-Chạm)</span>
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-amber-300"></div>
                  <span className="shrink-0 mx-2 text-[10px] font-bold text-amber-800 uppercase">
                    hoặc đăng nhập bằng mật khẩu chung
                  </span>
                  <div className="flex-grow border-t border-amber-300"></div>
                </div>

                {/* Option 2: MẬT KHẨU CHUNG 123456 */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-amber-900">
                      Mật Khẩu Chung Admin:
                    </label>
                    <button
                      type="button"
                      onClick={() => setAdminPasswordInput('123456')}
                      className="text-[10px] text-amber-900 font-bold bg-amber-200/90 hover:bg-amber-300 px-2 py-0.5 rounded-md cursor-pointer transition-all"
                    >
                      ⚡ Điền nhanh: 123456
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      placeholder="Nhập 123456..."
                      className="w-full pl-3 pr-10 py-2 rounded-xl border border-amber-300 text-xs font-bold text-slate-800 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-1.5 text-[10px] text-amber-900/90 bg-amber-100/70 p-1.5 rounded-lg border border-amber-200">
                    <span className="truncate">
                      🔑 <strong>Mật khẩu chung tất cả Admin:</strong> <code className="font-mono bg-white/90 px-1 py-0.2 rounded font-black text-amber-950">123456</code>
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        setIsLoading(true);
                        await sendAdminCredentialsToGmail();
                        setIsLoading(false);
                        setSuccessMsg(`Đã gửi thông tin mật khẩu Admin (123456) về Gmail ${MAIN_ADMIN_EMAIL}!`);
                        setTimeout(() => setSuccessMsg(''), 4000);
                      }}
                      className="text-amber-950 font-bold underline hover:text-amber-800 shrink-0 cursor-pointer ml-1"
                    >
                      Gửi về Gmail
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Đang xác thực tài khoản...</span>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Đăng Nhập Với Mật Khẩu (123456)</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-2">
                {/* Admin Chính Highlighted Card - NO EMAIL EXPOSED */}
                {DESIGNATED_ADMINS.filter((a) => a.adminLevel === 'main').map((admin) => (
                  <div
                    key={admin.name}
                    className="p-3 rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shadow-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center text-lg font-black shrink-0 shadow-xs">
                        👑
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-black text-amber-950 truncate">
                            {admin.name}
                          </span>
                          <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[9px] font-black uppercase">
                            Admin Chính
                          </span>
                        </div>
                        <div className="text-[10px] text-amber-800 font-semibold truncate">
                          🔒 Gmail Đã Bảo Mật • MK chung: 123456
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 justify-end">
                      <button
                        type="button"
                        onClick={() => handleDirectAdminLogin(admin.email)}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black transition-all cursor-pointer flex items-center gap-1 shadow-xs hover:scale-102 active:scale-95"
                        title="Vào ngay không cần gõ mật khẩu"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Vào ngay</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAdminName(`${admin.name} (Admin Chính)`);
                          setSelectedAdminEmail(admin.email);
                          setAdminPasswordInput('123456');
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-black transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                        title="Đăng nhập với mật khẩu"
                      >
                        <Lock className="w-3 h-3" />
                        <span>MK: 123456</span>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Admin Phụ Buttons - NO EMAIL EXPOSED */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {DESIGNATED_ADMINS.filter((a) => a.adminLevel === 'sub').map((admin) => (
                    <div
                      key={admin.name}
                      className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/70 transition-all flex flex-col justify-between gap-1.5 shadow-2xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-xs">🛡️</span>
                          <span className="text-xs font-black text-slate-800 truncate">
                            {admin.name}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          🔒 Gmail Đã Bảo Mật
                        </div>
                      </div>
                      <div className="flex items-center gap-1 pt-1 border-t border-indigo-100 justify-between">
                        <button
                          type="button"
                          onClick={() => handleDirectAdminLogin(admin.email)}
                          className="flex-1 py-1 px-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black transition-all cursor-pointer flex items-center justify-center gap-0.5 shadow-2xs"
                          title="Vào ngay không cần mật khẩu"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Vào ngay</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAdminName(`${admin.name} (Admin Phụ)`);
                            setSelectedAdminEmail(admin.email);
                            setAdminPasswordInput('123456');
                          }}
                          className="flex-1 py-1 px-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black transition-all cursor-pointer flex items-center justify-center gap-0.5 shadow-2xs"
                          title="Đăng nhập mật khẩu 123456"
                        >
                          <Lock className="w-3 h-3" />
                          <span>123456</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-center text-xs text-slate-500">
          🔒 Bảo mật: Gmail tất cả Quản trị viên được ẩn hoàn toàn trên toàn hệ thống • Mỗi cá nhân tự đặt và quản lý mật khẩu của mình.
        </div>
      </div>
    </div>
  );
};
