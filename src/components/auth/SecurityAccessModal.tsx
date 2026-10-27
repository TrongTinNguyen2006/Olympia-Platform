import React, { useState } from 'react';
import { ShieldAlert, KeyRound, Lock, ArrowRight, AlertCircle, CheckCircle2, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface SecurityAccessModalProps {
  role: string;
  matchCode?: string;
  reason: 'ROLE_UNAUTHORIZED' | 'MATCH_PASSWORD_REQUIRED';
  onGrantAccess: (matchPassword?: string) => void;
  onOpenAuthModal: () => void;
  onBackToGateway: () => void;
}

export default function SecurityAccessModal({
  role,
  matchCode,
  reason,
  onGrantAccess,
  onOpenAuthModal,
  onBackToGateway
}: SecurityAccessModalProps) {
  const [inputPassword, setInputPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerifyMatchPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!matchCode) {
        // If no match code specified yet, pass password directly
        onGrantAccess(inputPassword);
        return;
      }

      const res = await fetch('/api/match/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchCode, matchPassword: inputPassword })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Mật khẩu trận đấu không đúng.');
        return;
      }

      onGrantAccess(inputPassword);
    } catch (err) {
      setError('Không thể kết nối máy chủ xác thực.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-slate-900 border border-red-500/30 rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden text-slate-100 text-center space-y-5"
      >
        <div className="inline-flex p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
          {reason === 'ROLE_UNAUTHORIZED' ? (
            <ShieldAlert className="w-10 h-10 animate-pulse" />
          ) : (
            <Lock className="w-10 h-10 text-amber-400" />
          )}
        </div>

        <div>
          <div className="inline-block px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] text-red-400 font-bold uppercase tracking-wider mb-2">
            BẢO MẬT HỆ THỐNG OLYMPIA
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            {reason === 'ROLE_UNAUTHORIZED'
              ? `Truy Cập Vai Trò ${role} Bị Từ Chối`
              : `Yêu Cầu Mật Khẩu Trận Đấu`}
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            {reason === 'ROLE_UNAUTHORIZED'
              ? `Đường dẫn vai trò ${role} đã được sinh theo tài khoản cá nhân. Việc tự ý đổi đuôi link /role=${role.toLowerCase()} bị chặn để phòng chống lộ dữ liệu & gian lận.`
              : `Vui lòng nhập mật khẩu trận đấu ${matchCode ? `(${matchCode})` : ''} để truy cập giao diện.`}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* MATCH PASSWORD INPUT FORM */}
        <form onSubmit={handleVerifyMatchPassword} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1 text-left">
              Mật Khẩu Trận Đấu (Match Password)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                placeholder="Nhập mật khẩu trận đấu (mặc định: 123)"
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-600/25 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Xác Nhận Mật Khẩu Trận Đấu</span>
          </button>
        </form>

        <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
          {reason === 'ROLE_UNAUTHORIZED' && (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Đăng Nhập Tài Khoản Gateway</span>
            </button>
          )}

          <button
            type="button"
            onClick={onBackToGateway}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
          >
            <span>Quay Lại Gateway</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
