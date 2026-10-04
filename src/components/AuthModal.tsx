import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  CheckCircle2,
  AlertCircle,
  LogIn,
  UserPlus,
  Sparkles,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  RotateCcw,
  Send,
  ShieldCheck,
  Dices
} from 'lucide-react';
import { AppUser } from '../types';
import {
  registerUser,
  loginUser,
  generateRandomPassword,
  sendOtpToGmail,
  verifyOtpCode,
  resetPasswordWithOtp,
  setPersonalPassword,
  normalizeEmail
} from '../services/authService';
import { playClickSound, playSuccessSound } from '../utils/audio';

export type AuthModalMode = 'login' | 'register' | 'change_password' | 'forgot_password';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AppUser) => void;
  initialMode?: AuthModalMode;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<AuthModalMode>(initialMode);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP State for Forgot Password
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [previewOtp, setPreviewOtp] = useState<string | null>(null);

  // Status notifications
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setErrorMsg('');
    setSuccessMsg('');
    setIsOtpSent(false);
    setOtpCode('');
  }, [initialMode, isOpen]);

  // Countdown for OTP resend
  useEffect(() => {
    if (otpCooldown > 0) {
      const timer = setTimeout(() => setOtpCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCooldown]);

  if (!isOpen) return null;

  // Generate and set a random strong password
  const handleGenerateStrongPassword = () => {
    playClickSound();
    const suggested = generateRandomPassword();
    setPassword(suggested);
    setConfirmPassword(suggested);
    setShowPassword(true);
    setShowConfirmPassword(true);
    setSuccessMsg('Đã tạo mật khẩu mạnh ngẫu nhiên! Bạn có thể lưu lại mật khẩu này.');
    setTimeout(() => setSuccessMsg(''), 3500);
  };

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
      setErrorMsg('Mật khẩu xác nhận không khớp! Vui lòng kiểm tra lại.');
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
        }, 700);
      } else {
        setErrorMsg(res.error || 'Đăng ký không thành công!');
      }
    }, 250);
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
      setErrorMsg('Vui lòng nhập mật khẩu tài khoản cá nhân!');
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
        }, 700);
      } else {
        setErrorMsg(res.error || 'Mật khẩu hoặc Gmail không chính xác! Nếu quên, bạn có thể chọn "Quên mật khẩu?" bên dưới.');
      }
    }, 250);
  };

  // Step 1 of Forgot Password: Send OTP to Gmail
  const handleSendOtp = async () => {
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Vui lòng nhập chính xác Gmail cá nhân của bạn để nhận mã OTP!');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await sendOtpToGmail(email);
      setIsLoading(false);
      setIsOtpSent(true);
      setOtpCooldown(60);
      if (res.otp) {
        setPreviewOtp(res.otp);
      }
      playSuccessSound();
      setSuccessMsg(`Đã gửi mã OTP 6 chữ số tới Gmail "${email}"! Vui lòng kiểm tra hộp thư.`);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Không thể gửi mã OTP tới Gmail!');
    }
  };

  // Step 2 & 3 of Forgot Password: Verify OTP & Set New Password & Log in
  const handleVerifyOtpAndResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setErrorMsg('Vui lòng nhập đúng 6 chữ số mã OTP nhận được qua Gmail!');
      return;
    }

    if (!password.trim() || password.length < 6) {
      setErrorMsg('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp! Vui lòng nhập lại.');
      return;
    }

    setIsLoading(true);
    try {
      const verifyRes = await verifyOtpCode(email, otpCode);
      if (!verifyRes.success) {
        setIsLoading(false);
        setErrorMsg(verifyRes.error || 'Mã OTP không chính xác hoặc đã hết hạn!');
        return;
      }

      // Reset password and log student in automatically
      const resetRes = resetPasswordWithOtp(email, password);
      setIsLoading(false);

      if (resetRes.success && resetRes.user) {
        playSuccessSound();
        setSuccessMsg('Xác thực OTP & Đổi mật khẩu thành công! Đang đăng nhập...');
        setTimeout(() => {
          onLoginSuccess(resetRes.user!);
          onClose();
        }, 800);
      } else {
        setErrorMsg(resetRes.error || 'Không thể cập nhật mật khẩu mới!');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Lỗi xử lý xác thực OTP!');
    }
  };

  // Handle Direct Change Password
  const handleChangePasswordDirect = (e: React.FormEvent) => {
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
    }, 250);
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
            {mode === 'register'
              ? '✨'
              : mode === 'forgot_password'
              ? '📧'
              : mode === 'change_password'
              ? '🔑'
              : '🔐'}
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            {mode === 'register'
              ? 'Tạo Tài Khoản Học Viên'
              : mode === 'forgot_password'
              ? 'Quên Mật Khẩu (Nhận OTP Gmail)'
              : mode === 'change_password'
              ? 'Đổi Mật Khẩu Cá Nhân'
              : 'Đăng Nhập Tài Khoản'}
          </h3>
          <p className="text-xs sm:text-sm text-sky-100 mt-1 max-w-xs mx-auto">
            {mode === 'register'
              ? 'Tự đặt mật khẩu của riêng bạn để bảo vệ kết quả học tập'
              : mode === 'forgot_password'
              ? 'Gửi mã OTP 6 số qua Gmail cá nhân để đăng nhập và đặt lại mật khẩu'
              : mode === 'change_password'
              ? 'Học viên có toàn quyền tự do đổi và đặt lại mật khẩu mới'
              : 'Nhập Gmail và Mật khẩu cá nhân của bạn'}
          </p>

          {/* Mode Switch Tabs */}
          <div className="flex bg-white/15 p-1 rounded-2xl max-w-sm mx-auto mt-4 border border-white/20">
            <button
              onClick={() => {
                playClickSound();
                setMode('login');
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
                setMode('forgot_password');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                mode === 'forgot_password'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>OTP Gmail</span>
            </button>
            <button
              onClick={() => {
                playClickSound();
                setMode('change_password');
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

          {/* MODE 1: REGISTRATION (TỰ TẠO MẬT KHẨU) */}
          {mode === 'register' && (
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
                    (Dùng để đăng nhập & nhận mã OTP khi quên mật khẩu)
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

              {/* Self-create Password with Random Generator Helper */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Tự đặt Mật khẩu tài khoản <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateStrongPassword}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md transition-colors"
                    title="Gợi ý tạo mật khẩu mạnh ngẫu nhiên"
                  >
                    <Dices className="w-3.5 h-3.5" />
                    <span>Tạo mật khẩu mạnh</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tự gõ mật khẩu của bạn..."
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
                  <strong>Quyền riêng tư:</strong> Học viên có quyền tự do đặt và đổi mật khẩu bất kỳ lúc nào. Nếu quên, bạn chỉ cần yêu cầu mã OTP gửi qua Gmail cá nhân.
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
          )}

          {/* MODE 2: FORGOT PASSWORD VIA GMAIL OTP (QUÊN MẬT KHẨU NHẬN MÃ OTP) */}
          {mode === 'forgot_password' && (
            <form onSubmit={handleVerifyOtpAndResetPassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gmail cá nhân của học viên <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tenban@gmail.com"
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm text-slate-800 font-medium"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={isLoading || otpCooldown > 0 || !email.trim()}
                    onClick={handleSendOtp}
                    className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shrink-0 cursor-pointer disabled:opacity-50 shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{otpCooldown > 0 ? `Gửi lại (${otpCooldown}s)` : 'Gửi mã OTP'}</span>
                  </button>
                </div>
              </div>

              {/* Informative OTP Prompt Box */}
              {isOtpSent && previewOtp && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs animate-fadeIn flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📩</span>
                    <div>
                      <div className="font-bold">Mã OTP đã gửi về Gmail:</div>
                      <div className="text-[11px] text-amber-800">
                        Kiểm tra hộp thư hoặc dùng mã OTP nhanh: <strong className="font-mono text-sm bg-white px-1.5 py-0.5 rounded border border-amber-300 text-amber-950">{previewOtp}</strong>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpCode(previewOtp);
                      playClickSound();
                    }}
                    className="text-[10px] font-black bg-amber-200 hover:bg-amber-300 text-amber-900 px-2 py-1 rounded-lg cursor-pointer transition-all"
                  >
                    Điền mã
                  </button>
                </div>
              )}

              {/* 6-digit OTP code input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nhập mã OTP 6 chữ số từ Gmail <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Ví dụ: 123456"
                    required
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900 font-mono tracking-widest font-black"
                  />
                </div>
              </div>

              {/* New Password input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Tự đặt Mật khẩu mới <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateStrongPassword}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md"
                  >
                    <Dices className="w-3.5 h-3.5" />
                    <span>Tạo mật khẩu mạnh</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới bạn muốn đặt..."
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

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Xác nhận lại Mật khẩu mới <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới..."
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
                disabled={isLoading || !isOtpSent || otpCode.length < 6}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Đang xác thực mã OTP & cập nhật...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Xác Nhận OTP & Đăng Nhập Ngay</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 3: DIRECT CHANGE PASSWORD */}
          {mode === 'change_password' && (
            <form onSubmit={handleChangePasswordDirect} className="space-y-3.5">
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

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Tự đặt Mật khẩu mới <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateStrongPassword}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md"
                  >
                    <Dices className="w-3.5 h-3.5" />
                    <span>Tạo mật khẩu mạnh</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
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
                  Xác nhận lại Mật khẩu mới <span className="text-rose-500">*</span>
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

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500">Quên mật khẩu cũ?</span>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setMode('forgot_password');
                    setErrorMsg('');
                  }}
                  className="text-sky-600 font-bold hover:underline cursor-pointer"
                >
                  Nhận mã OTP qua Gmail
                </button>
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
          )}

          {/* MODE 4: STANDARD LOGIN */}
          {mode === 'login' && (
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
                      playClickSound();
                      setMode('forgot_password');
                      setErrorMsg('');
                    }}
                    className="text-[11px] text-sky-600 font-bold hover:underline cursor-pointer"
                  >
                    Quên mật khẩu? (Gửi OTP)
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu cá nhân..."
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
                  <span>Đang kiểm tra đăng nhập...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Đăng Nhập Với Mật Khẩu Cá Nhân</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Bottom Switcher Helper */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            {mode === 'login' ? (
              <>
                <span>Chưa có tài khoản học viên?</span>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setMode('register');
                    setErrorMsg('');
                  }}
                  className="font-bold text-sky-600 hover:underline cursor-pointer"
                >
                  Đăng ký ngay
                </button>
              </>
            ) : mode === 'register' ? (
              <>
                <span>Đã có tài khoản?</span>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setMode('login');
                    setErrorMsg('');
                  }}
                  className="font-bold text-sky-600 hover:underline cursor-pointer"
                >
                  Đăng nhập
                </button>
              </>
            ) : (
              <>
                <span>Quay lại đăng nhập</span>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setMode('login');
                    setErrorMsg('');
                  }}
                  className="font-bold text-sky-600 hover:underline cursor-pointer"
                >
                  Đăng nhập
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
