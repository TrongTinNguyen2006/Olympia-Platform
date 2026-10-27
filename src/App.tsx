/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import PlayerView from './components/PlayerView.js';
import MCView from './components/MCView.js';
import AdminView from './components/AdminView.js';
import ViewerApp from './components/ViewerApp.js';
import LivestreamOverlay from './components/LivestreamOverlay.js';
import ScoreboardView from './components/ScoreboardView.js';
import QuestionManager from './components/admin/QuestionManager.js';
import SuperAdminDashboard from './components/admin/SuperAdminDashboard.js';
import AuthModal, { UserProfile } from './components/auth/AuthModal.js';
import SecurityAccessModal from './components/auth/SecurityAccessModal.js';
import { useGameSocket } from './hooks/useGameSocket.js';
import { SocketEvent } from './types.js';
import { safeFetchJson } from './utils/api.js';
import { ShieldAlert, AlertTriangle, ArrowLeft, RefreshCw, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Audio unlock helper for autoplay restrictions in modern browsers
  useEffect(() => {
    const unlockAudio = () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        
        const audioCtx = new AudioContextClass();
        const buffer = audioCtx.createBuffer(1, 1, 22050);
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        
        if (source.start) {
          source.start(0);
        } else if ((source as any).noteOn) {
          (source as any).noteOn(0);
        }
        
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }

        const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
        silentAudio.play().catch(() => {});
        
        removeListeners();
      } catch (err) {
        console.warn('Audio context unlock failed:', err);
      }
    };

    const removeListeners = () => {
      window.removeEventListener('click', unlockAudio, true);
      window.removeEventListener('touchstart', unlockAudio, true);
      window.removeEventListener('keydown', unlockAudio, true);
      window.removeEventListener('mousedown', unlockAudio, true);
    };

    window.addEventListener('click', unlockAudio, true);
    window.addEventListener('touchstart', unlockAudio, true);
    window.addEventListener('keydown', unlockAudio, true);
    window.addEventListener('mousedown', unlockAudio, true);

    return () => {
      removeListeners();
    };
  }, []);

  // --- AUTH & USER STATE ---
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('olympia_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    return localStorage.getItem('olympia_token') || null;
  });

  const [roleTokens, setRoleTokens] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('olympia_role_tokens');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'CONTROLLER' | 'SUPER_ADMIN' | 'KHO_DE'>('CONTROLLER');
  const [sessionTerminatedMsg, setSessionTerminatedMsg] = useState<string | null>(null);

  const [securityModalState, setSecurityModalState] = useState<{
    reason: 'ROLE_UNAUTHORIZED' | 'MATCH_PASSWORD_REQUIRED';
    role: string;
  } | null>(null);

  // Parse URL role parameter
  const [subRole, setSubRole] = useState<'PLAYER' | 'MC' | 'VIEWER' | 'OVERLAY' | 'BANG_DIEM' | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get('role')?.toUpperCase();
    if (r === 'PLAYER') return 'PLAYER';
    if (r === 'MC') return 'MC';
    if (r === 'VIEWER') return 'VIEWER';
    if (r === 'OVERLAY' || r === 'LIVESTREAM' || r === 'OBS') return 'OVERLAY';
    if (r === 'BANG_DIEM' || r === 'BANGDIEM' || r === 'SCOREBOARD') return 'BANG_DIEM';
    return null;
  });

  // Socket listener for session termination (when Controller logs out)
  const { socket } = useGameSocket();

  useEffect(() => {
    if (!socket) return;
    const handleSessionTerminated = (data: { reason: string }) => {
      setSessionTerminatedMsg(data?.reason || 'Phiên điều khiển đã kết thúc bởi Đạo diễn.');
    };

    socket.on(SocketEvent.SESSION_TERMINATED, handleSessionTerminated);
    return () => {
      socket.off(SocketEvent.SESSION_TERMINATED, handleSessionTerminated);
    };
  }, [socket]);

  // Check auth session on load
  useEffect(() => {
    if (sessionToken && !currentUser) {
      safeFetchJson<any>(`/api/auth/me?token=${encodeURIComponent(sessionToken)}`)
        .then((data) => {
          if (data && data.success && data.user) {
            setCurrentUser(data.user);
            if (data.roleTokens) {
              setRoleTokens(data.roleTokens);
              localStorage.setItem('olympia_role_tokens', JSON.stringify(data.roleTokens));
            }
            localStorage.setItem('olympia_user', JSON.stringify(data.user));
          } else {
            localStorage.removeItem('olympia_token');
            localStorage.removeItem('olympia_user');
            setCurrentUser(null);
            setSessionToken(null);
          }
        })
        .catch(() => {});
    }
  }, [sessionToken]);

  const handleLoginSuccess = (user: UserProfile, token: string, newRoleTokens: Record<string, string>) => {
    setCurrentUser(user);
    setSessionToken(token);
    setRoleTokens(newRoleTokens);
    localStorage.setItem('olympia_user', JSON.stringify(user));
    localStorage.setItem('olympia_token', token);
    localStorage.setItem('olympia_role_tokens', JSON.stringify(newRoleTokens));
    setSecurityModalState(null);
    setIsAuthModalOpen(false);
    setViewMode('CONTROLLER');
  };

  const handleLogout = () => {
    if (sessionToken) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sessionToken })
      }).catch(() => {});
    }
    setCurrentUser(null);
    setSessionToken(null);
    setRoleTokens({});
    localStorage.removeItem('olympia_user');
    localStorage.removeItem('olympia_token');
    localStorage.removeItem('olympia_role_tokens');
  };

  // If session was terminated via socket
  if (sessionTerminatedMsg) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl"
        >
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 inline-block">
            <AlertTriangle className="w-10 h-10 animate-bounce" />
          </div>
          <h2 className="text-xl font-black text-white">PHIÊN THI ĐÃ KẾT THÚC</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {sessionTerminatedMsg}
          </p>
          <button
            onClick={() => {
              setSessionTerminatedMsg(null);
              window.location.href = '/';
            }}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Trở Về Trang Chủ</span>
          </button>
        </motion.div>
      </div>
    );
  }

  // --- SUB-VIEWS (WHEN ACCESSED VIA DIRECT SUB-LINKS) ---
  if (subRole === 'PLAYER') {
    return <PlayerView />;
  }

  if (subRole === 'MC') {
    return <MCView />;
  }

  if (subRole === 'BANG_DIEM') {
    return (
      <div className="relative w-screen h-screen overflow-hidden">
        <ScoreboardView />
      </div>
    );
  }

  if (subRole === 'OVERLAY') {
    return (
      <div className="relative w-screen h-screen bg-transparent overflow-hidden">
        <LivestreamOverlay />
      </div>
    );
  }

  if (subRole === 'VIEWER') {
    return <ViewerApp />;
  }

  // --- MAIN APP VIEWS ---

  // 1. IF NOT LOGGED IN -> REQUIRE LOGIN / REGISTER POP-UP
  if (!currentUser) {
    return (
      <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 overflow-hidden select-none">
        {/* Ambient atmospheric backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(16,185,129,0.1),transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] opacity-30 pointer-events-none" />

        {/* Brand header behind modal */}
        <div className="text-center space-y-2 mb-6 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <span>🏛️</span>
            <span>Hệ Thống Thi Đấu Đường Lên Đỉnh Olympia</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            Cổng Điều Hành &amp; Quản Trị Trận Đấu
          </h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Vui lòng đăng nhập hoặc đăng ký tài khoản để tiếp tục sử dụng hệ thống.
          </p>
        </div>

        {/* Required Auth Modal Pop-up */}
        <AuthModal
          currentUser={null}
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
          isOpen={true}
          canClose={false}
          onClose={() => {}}
        />
      </div>
    );
  }

  // 2. IF LOGGED IN AND IN SUPER ADMIN DASHBOARD
  if (viewMode === 'SUPER_ADMIN' && currentUser.role === 'ADMIN') {
    return (
      <SuperAdminDashboard
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenController={() => setViewMode('CONTROLLER')}
      />
    );
  }

  // 3. IF LOGGED IN AND IN KHO DE (STANDALONE)
  if (viewMode === 'KHO_DE') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4">
        <QuestionManager
          onClose={() => setViewMode('CONTROLLER')}
          currentUser={currentUser}
          sessionToken={sessionToken}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />
      </div>
    );
  }

  // 4. DEFAULT POST-LOGIN VIEW: GIAO DIỆN ĐIỀU KHIỂN (CONTROLLER)
  return (
    <div className="relative min-h-screen bg-slate-950">
      <AdminView
        currentUser={currentUser}
        sessionToken={sessionToken}
        roleTokens={roleTokens}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenSuperAdmin={() => setViewMode('SUPER_ADMIN')}
        onLogout={handleLogout}
      />
      
      <AuthModal
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
