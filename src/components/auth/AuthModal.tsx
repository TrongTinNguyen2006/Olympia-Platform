import React, { useState } from 'react';
import { Mail, Lock, User, ShieldCheck, KeyRound, AlertCircle, CheckCircle2, LogIn, UserPlus, ArrowRight, X, Clock, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { safeFetchJson } from '../../utils/api.js';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role?: string;
}

interface AuthModalProps {
  currentUser: UserProfile | null;
  onLoginSuccess: (user: UserProfile, token: string, roleTokens: Record<string, string>) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose?: () => void;
  canClose?: boolean;
}

export default function AuthModal({ currentUser, onLoginSuccess, onLogout, isOpen, onClose, canClose = true }: AuthModalProps) {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'VERIFY_EMAIL'>('LOGIN');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [demoCode, setDemoCode] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const data = await safeFetchJson<any>('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!data || !data.success) {
        if (data && data.requiresVerification) {
          setError(data.message);
          setDemoCode(data.verificationCode || '');
          setMode('VERIFY_EMAIL');
        } else {
          setError(data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email & mật khẩu.');
        }
        return;
      }

      setSuccessMsg('Đăng nhập thành công!');
      setTimeout(() => {
        onLoginSuccess(data.user, data.token, data.roleTokens);
        if (onClose) onClose();
      }, 600);
    } catch (err) {
      setError('Lỗi kết nối máy chủ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const data = await safeFetchJson<any>('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName })
      });

      if (!data || !data.success) {
        setError(data?.message || 'Đăng ký thất bại.');
        return;
      }

      setSuccessMsg(data.message);
      setDemoCode(data.verificationCode || '');
      setTimeout(() => {
        setMode('VERIFY_EMAIL');
        setError('');
      }, 1000);
    } catch (err) {
      setError('Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const data = await safeFetchJson<any>('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode })
      });

      if (!data || !data.success) {
        setError(data?.message || 'Xác thực thất bại.');
        return;
      }

      setSuccessMsg(data.message);
      setTimeout(() => {
        setMode('LOGIN');
        setError('');
      }, 1200);
    } catch (err) {
      setError('Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-slate-900 border border-indigo-500/30 rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden text-slate-100"
      >
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        {canClose && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {currentUser ? (
          /* LOGGED IN USER PROFILE CARD */
          <div className="space-y-6 text-center py-2">
            <div className="inline-flex p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
              <ShieldCheck className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">{currentUser.fullName}</h3>
              <p className="text-xs text-indigo-300 font-mono mt-1">{currentUser.email}</p>
              <div className="inline-block mt-2 px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-400 font-bold rounded-full uppercase tracking-wide">
                Mã tài khoản: {currentUser.id}
              </div>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl text-left space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Trạng thái bảo mật:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đã xác thực Email
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Phòng chống Brute-Force:</span>
                <span className="text-indigo-400 font-bold">Kích hoạt (Khóa 15' / 5 lỗi)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Đường dẫn tài khoản:</span>
                <span className="text-teal-300 font-bold">Đã đồng bộ hoá URL</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onLogout}
                className="flex-1 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Đăng Xuất Tài Khoản
              </button>
              {canClose && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20"
                >
                  Hoàn Tất
                </button>
              )}
            </div>
          </div>
        ) : (
          /* AUTH FORM (LOGIN / REGISTER / VERIFY_EMAIL) */
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <div className="inline-flex p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400 mb-1">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                {mode === 'LOGIN' && 'Đăng Nhập Tài Khoản'}
                {mode === 'REGISTER' && 'Đăng Ký Tài Khoản'}
                {mode === 'VERIFY_EMAIL' && 'Xác Thực Email (6 Chữ Số)'}
              </h2>
              <p className="text-xs text-slate-400">
                {mode === 'LOGIN' && 'Vui lòng đăng nhập để truy cập và sử dụng hệ thống thi đấu Olympia'}
                {mode === 'REGISTER' && 'Tạo tài khoản mới để bắt đầu sử dụng hệ thống thi đấu Olympia'}
                {mode === 'VERIFY_EMAIL' && 'Nhập mã kích hoạt 6 chữ số vừa gửi đến Email của bạn'}
              </p>
            </div>

            {/* TAB SELECTOR (LOGIN / REGISTER) */}
            {mode !== 'VERIFY_EMAIL' && (
              <div className="grid grid-cols-2 p-1 bg-slate-950/80 border border-slate-800 rounded-2xl gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('LOGIN');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === 'LOGIN'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Đăng Nhập</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('REGISTER');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === 'REGISTER'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Đăng Ký</span>
                </button>
              </div>
            )}

            {/* ERROR BANNER */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* SUCCESS BANNER */}
            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* DEMO VERIFICATION CODE BANNER (For simulation testing ease) */}
            {demoCode && mode === 'VERIFY_EMAIL' && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center justify-between">
                <span>Mã xác thực hệ thống vừa tạo:</span>
                <span className="font-mono font-bold text-sm text-amber-200 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/40">{demoCode}</span>
              </div>
            )}

            {/* FORM MODES */}
            {mode === 'LOGIN' && (
              <form onSubmit={handleLogin} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Địa chỉ Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vd: user@olympia.vn"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Mật khẩu</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/25 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Đang đăng nhập...</span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Đăng Nhập Ngay</span>
                    </>
                  )}
                </button>

                <div className="pt-2 text-center text-xs text-slate-400">
                  Chưa có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('REGISTER');
                      setError('');
                      setSuccessMsg('');
                    }}
                    className="text-indigo-400 font-bold hover:underline cursor-pointer"
                  >
                    Đăng ký ngay
                  </button>
                </div>
              </form>
            )}

            {mode === 'REGISTER' && (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Họ và Tên</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="vd: Nguyen Van A"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Địa chỉ Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vd: user@olympia.vn"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Mật khẩu bảo mật</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tối thiểu 8 ký tự (gồm chữ & số)"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/25 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Đang tạo tài khoản...</span>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Đăng Ký & Nhận Mã Xác Thực</span>
                    </>
                  )}
                </button>

                <div className="pt-2 text-center text-xs text-slate-400">
                  Đã có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('LOGIN');
                      setError('');
                      setSuccessMsg('');
                    }}
                    className="text-indigo-400 font-bold hover:underline cursor-pointer"
                  >
                    Đăng nhập
                  </button>
                </div>
              </form>
            )}

            {mode === 'VERIFY_EMAIL' && (
              <form onSubmit={handleVerifyEmail} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Email cần xác thực</label>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Mã xác thực 6 chữ số</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-slate-950 border border-indigo-500 rounded-xl px-3 py-2 text-center text-lg font-mono font-bold tracking-widest text-indigo-300 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-600/25 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Đang kiểm tra...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Kích Hoạt Tài Khoản</span>
                    </>
                  )}
                </button>

                <div className="pt-2 text-center text-xs text-slate-400">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('LOGIN');
                      setError('');
                    }}
                    className="text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Quay lại Đăng Nhập
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
