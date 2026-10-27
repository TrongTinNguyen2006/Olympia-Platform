import React, { useState, useEffect, useRef } from 'react';
import { useGameSocket } from '../hooks/useGameSocket.js';
import { useSoundEngine } from '../hooks/useSoundEngine.js';
import { SocketEvent, GameRound } from '../types.js';
import { safeFetchJson } from '../utils/api.js';
import {
  Shield,
  RefreshCw,
  LogOut,
  Users,
  Trash2,
  Award,
  Send,
  MessageSquare,
  Menu,
  HelpCircle,
  Play,
  Pause,
  RotateCcw,
  Edit3,
  X,
  Check,
  Video,
  Volume2,
  VolumeX,
  Square,
  Film,
  Sliders,
  Copy,
  Lock,
  BookOpen,
  Crown,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Monitor,
  Radio,
  Tv,
  Eye,
  FileText,
  Settings2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import HelpTip from './admin/HelpTip.js';
import { UserProfile } from './auth/AuthModal.js';

// Sub-panels
import KhoiDongPanel from './admin/KhoiDongPanel.js';
import VCNVPanel from './admin/VCNVPanel.js';
import TangTocPanel from './admin/TangTocPanel.js';
import VeDichPanel from './admin/VeDichPanel.js';
import CHPhuPanel from './admin/CHPhuPanel.js';
import { JeopardyPanel } from './admin/JeopardyPanel.js';
import { MaTranKepPanel } from './admin/MaTranKepPanel.js';
import ChinhPhucPanel from './admin/ChinhPhucPanel.js';
import { DauTriPanel } from './admin/DauTriPanel.js';
import QuestionManager from './admin/QuestionManager.js';
import GameLogsModal from './admin/GameLogsModal.js';
import UniversalMediaPlayer from './UniversalMediaPlayer.js';
import RoundCustomizerModal from './admin/RoundCustomizerModal.js';
import RoundSoundPanel from './admin/RoundSoundPanel.js';
import { RoundLogoRenderer } from './common/RoundLogoAssets.js';

const ADMIN_TOKEN = 'OLYMPIA_ADMIN_SECRET_KEY';

interface AdminViewProps {
  currentUser?: UserProfile | null;
  sessionToken?: string | null;
  roleTokens?: Record<string, string>;
  onOpenAuthModal?: () => void;
  onOpenSuperAdmin?: () => void;
  onLogout?: () => void;
}

export default function AdminView({
  currentUser,
  sessionToken,
  roleTokens = {},
  onOpenAuthModal,
  onOpenSuperAdmin,
  onLogout
}: AdminViewProps = {}) {
  const {
    matchState,
    isConnected,
    chatMessages,
    sendChatMessage,
    adminAuth,
    adminCommand,
    socket,
  } = useGameSocket();

  const {
    triggerPlaySound,
    triggerStopAll,
    triggerUpdateConfig,
  } = useSoundEngine(matchState, socket);

  // Authentication & State
  const [showQuestionManager, setShowQuestionManager] = useState(false);
  const [showGameLogsModal, setShowGameLogsModal] = useState(false);
  const [showRoundCustomizer, setShowRoundCustomizer] = useState(false);
  const [matchQuestions, setMatchQuestions] = useState<any>(null);
  const [selectedExternalMediaId, setSelectedExternalMediaId] = useState<string>('');

  // Match Load Package States
  const [inputMatchCode, setInputMatchCode] = useState('');
  const [inputMatchPassword, setInputMatchPassword] = useState('');
  const [loadLoading, setLoadLoading] = useState(false);
  const [loadSuccessModal, setLoadSuccessModal] = useState<any | null>(null);
  const [loadErrorMsg, setLoadErrorMsg] = useState('');
  const [copiedLinkKey, setCopiedLinkKey] = useState<string | null>(null);

  // Tournament Name editing states
  const [tournamentNameInput, setTournamentNameInput] = useState(matchState?.tournamentName || 'Đường Lên Đỉnh Olympia');
  const [savedTournamentNotice, setSavedTournamentNotice] = useState(false);

  useEffect(() => {
    if (matchState?.tournamentName !== undefined) {
      setTournamentNameInput(matchState.tournamentName || 'Đường Lên Đỉnh Olympia');
    }
  }, [matchState?.tournamentName]);

  const handleSaveTournamentName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const nameToSave = tournamentNameInput.trim() || 'Đường Lên Đỉnh Olympia';
    adminCommand(SocketEvent.ADMIN_UPDATE_TOURNAMENT_NAME, { tournamentName: nameToSave });
    setSavedTournamentNotice(true);
    setTimeout(() => setSavedTournamentNotice(false), 2500);
  };

  // Auto connect admin auth when mounted
  useEffect(() => {
    if (socket && isConnected) {
      adminAuth(ADMIN_TOKEN, matchState?.matchCode || '');
    }
  }, [socket, isConnected]);

  useEffect(() => {
    if (matchQuestions?.media_ngoai?.length > 0) {
      if (!selectedExternalMediaId || !matchQuestions.media_ngoai.some((m: any) => m.id === selectedExternalMediaId)) {
        setSelectedExternalMediaId(matchQuestions.media_ngoai[0].id);
      }
    }
  }, [matchQuestions]);

  // Manual score editing modal state
  const [editingScorePlayer, setEditingScorePlayer] = useState<{ position: 1 | 2 | 3 | 4; name: string; score: number } | null>(null);
  const [newScoreInput, setNewScoreInput] = useState<string>('0');

  const handleOpenScoreModal = (pos: 1 | 2 | 3 | 4) => {
    const player = matchState?.players[pos];
    const currentScore = player?.score ?? 0;
    setEditingScorePlayer({
      position: pos,
      name: player?.name || `Bàn ${pos}`,
      score: currentScore,
    });
    setNewScoreInput(currentScore.toString());
  };

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScorePlayer) return;
    const numScore = parseInt(newScoreInput, 10);
    if (!isNaN(numScore)) {
      adminCommand(SocketEvent.ADMIN_UPDATE_SCORE, {
        position: editingScorePlayer.position,
        score: numScore,
      });
    }
    setEditingScorePlayer(null);
  };

  // Fetch match questions whenever matchCode/loadedAt changes
  useEffect(() => {
    if (matchState?.matchCode && matchState.matchCode.trim()) {
      safeFetchJson<any>(`/api/match/${encodeURIComponent(matchState.matchCode.trim())}?t=${matchState.loadedAt || Date.now()}`)
        .then((data) => {
          if (data && data.success) {
            setMatchQuestions(data.match);
          }
        })
        .catch((err) => console.error('Error fetching questions in Controller:', err));
    }
  }, [matchState?.matchCode, matchState?.loadedAt, showQuestionManager]);

  // Real-time socket updates for loaded match questions
  useEffect(() => {
    if (!socket) return;
    const handleQuestionsUpdated = (data: { matchCode: string; matchQuestions: any }) => {
      if (data && data.matchQuestions) {
        setMatchQuestions(data.matchQuestions);
      }
    };
    socket.on(SocketEvent.MATCH_QUESTIONS_UPDATED, handleQuestionsUpdated);
    return () => {
      socket.off(SocketEvent.MATCH_QUESTIONS_UPDATED, handleQuestionsUpdated);
    };
  }, [socket]);

  // Local chat logic
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      const container = chatEndRef.current.parentElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [chatMessages]);

  const handleKickPlayer = (position: 1 | 2 | 3 | 4) => {
    if (window.confirm(`Bạn có chắc chắn muốn kick Thí sinh số ${position} ra khỏi phòng?`)) {
      adminCommand(SocketEvent.ADMIN_KICK_PLAYER, { position });
    }
  };

  const handleChangeRound = (newRound: GameRound) => {
    triggerStopAll();
    adminCommand(SocketEvent.CHANGE_ROUND, { round: newRound });
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage('ADMIN', chatInput.trim());
    setChatInput('');
  };

  // Handle Load Match Package via API
  const handleLoadMatchPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMatchCode.trim()) {
      setLoadErrorMsg('Vui lòng nhập Mã bộ đề!');
      return;
    }
    setLoadLoading(true);
    setLoadErrorMsg('');

    try {
      const data = await safeFetchJson<any>('/api/controller/load-match-package', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken || localStorage.getItem('olympia_token') || ''}`
        },
        body: JSON.stringify({
          matchCode: inputMatchCode.trim().toUpperCase(),
          matchPassword: inputMatchPassword.trim()
        })
      });

      if (data && data.success) {
        setLoadSuccessModal({
          matchCode: data.matchCode,
          counts: data.counts,
          message: data.message
        });
        setInputMatchPassword('');
      } else {
        setLoadErrorMsg(data?.message || 'Không thể nạp bộ đề.');
      }
    } catch (err) {
      setLoadErrorMsg('Lỗi kết nối tới máy chủ.');
    } finally {
      setLoadLoading(false);
    }
  };

  // Helper to copy links
  const copyToClipboard = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLinkKey(key);
    setTimeout(() => setCopiedLinkKey(null), 2500);
  };

  const origin = window.location.origin;
  const currentRound: GameRound = matchState?.currentRound || 'WAITING';

  // Sub-links configuration (Single Player link + MC + Scoreboard + Overlay + Viewer)
  const subLinks = [
    {
      key: 'player',
      title: 'Thí Sinh',
      badge: 'Thí Sinh',
      icon: Users,
      color: 'teal',
      accentBorder: 'border-teal-500/40 hover:border-teal-400',
      badgeBg: 'bg-teal-500/15 text-teal-300 border border-teal-500/30',
      hoverGlow: 'hover:shadow-teal-500/10',
      url: `${origin}/?role=player&token=${roleTokens.PLAYER || ''}`
    },
    {
      key: 'mc',
      title: 'MC',
      badge: 'MC',
      icon: Radio,
      color: 'indigo',
      accentBorder: 'border-indigo-500/40 hover:border-indigo-400',
      badgeBg: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30',
      hoverGlow: 'hover:shadow-indigo-500/10',
      url: `${origin}/?role=mc&token=${roleTokens.MC || ''}`
    },
    {
      key: 'scoreboard',
      title: 'Bảng Điểm',
      badge: 'Bảng Điểm',
      icon: Monitor,
      color: 'amber',
      accentBorder: 'border-amber-500/40 hover:border-amber-400',
      badgeBg: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
      hoverGlow: 'hover:shadow-amber-500/10',
      url: `${origin}/?role=scoreboard&token=${roleTokens.BANG_DIEM || roleTokens.SCOREBOARD || ''}`
    },
    {
      key: 'overlay',
      title: 'Overlay',
      badge: 'Overlay',
      icon: Tv,
      color: 'rose',
      accentBorder: 'border-rose-500/40 hover:border-rose-400',
      badgeBg: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
      hoverGlow: 'hover:shadow-rose-500/10',
      url: `${origin}/?role=overlay&token=${roleTokens.OVERLAY || ''}`
    },
    {
      key: 'viewer',
      title: 'Khán Giả',
      badge: 'Khán Giả',
      icon: Eye,
      color: 'emerald',
      accentBorder: 'border-emerald-500/40 hover:border-emerald-400',
      badgeBg: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
      hoverGlow: 'hover:shadow-emerald-500/10',
      url: `${origin}/?role=viewer&token=${roleTokens.VIEWER || ''}`
    }
  ];

  if (showQuestionManager) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4">
        <QuestionManager 
          onClose={() => setShowQuestionManager(false)}
          activeMatchCode={matchState?.matchCode || ''}
          adminCommand={adminCommand}
          currentUser={currentUser}
          sessionToken={sessionToken}
          onOpenAuthModal={onOpenAuthModal}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans text-xs sm:text-[13px]">
      
      {/* UNIFIED STICKY CONTROLLER TOP BAR + ROUND NAVIGATION */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
        <header className="px-3 sm:px-5 py-2.5 sm:py-3.5 min-h-[72px] sm:min-h-[82px] flex items-center">
          <div className="max-w-[1750px] w-full mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 sm:gap-3.5">
            
            {/* LEFT / PRIMARY SECTION: TITLE & CONTESTANT BADGES */}
            <div className="flex flex-col gap-1.5 sm:gap-2 flex-1 min-w-0">
              {/* TOP SUB-ROW: TITLE & LIVE STATUS */}
              <div className="flex flex-wrap items-center justify-between sm:justify-start gap-1.5 sm:gap-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="p-1.5 bg-gradient-to-tr from-teal-500 to-indigo-600 rounded-lg text-slate-950 shadow-sm shadow-teal-500/20 shrink-0">
                    <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-xs sm:text-sm font-black text-white tracking-tight uppercase whitespace-nowrap">
                      GIAO DIỆN ĐIỀU KHIỂN (CONTROLLER)
                    </h1>
                    <HelpTip content="Trung tâm chỉ đạo và điều phối trận đấu thời gian thực. Đề thi được nạp an toàn bằng Mã đề & Mật khẩu." />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 border border-slate-800 rounded-md text-[11px]">
                    <span className="text-slate-400">Trận:</span>
                    <strong className="text-teal-400 font-mono text-xs font-bold">
                      {matchState?.matchCode || 'WAITING'}
                    </strong>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide shrink-0 ${
                    isConnected ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-red-400 border border-rose-500/30'
                  }`}>
                    {isConnected ? '● LIVE' : '○ OFFLINE'}
                  </span>
                </div>
              </div>

              {/* BOTTOM SUB-ROW: 4 CONTESTANT BADGES (PROPORTIONATELY COMPACT) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 w-full">
                {([1, 2, 3, 4] as const).map((pos) => {
                  const player = matchState?.players[pos];
                  const isJoined = player && player.socketId !== null;
                  const displayScore = matchState?.currentRound === 'JEOPARDY' && matchState?.jeopardy?.scoringMode === 'SEPARATE'
                    ? (matchState?.jeopardy?.separateScores?.[pos] ?? 0)
                    : (player?.score ?? 0);

                  return (
                    <div
                      key={pos}
                      className={`px-2.5 py-1.5 sm:py-2 rounded-xl border flex items-center justify-between gap-1.5 transition-all shadow-sm min-h-[46px] sm:min-h-[50px] ${
                        isJoined
                          ? 'bg-slate-950 border-teal-500/50 ring-1 ring-teal-500/20 shadow-teal-500/5'
                          : 'bg-slate-950/80 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                        <span className="w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-lg bg-slate-850 font-black text-[11px] sm:text-xs flex items-center justify-center text-teal-300 border border-slate-700/80 shrink-0">
                          {pos}
                        </span>
                        <span className="font-bold text-white text-xs sm:text-[13px] truncate">
                          {player?.name || `Bàn ${pos}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenScoreModal(pos)}
                          className="text-xs sm:text-sm text-emerald-300 font-mono font-black bg-emerald-500/15 hover:bg-emerald-500/25 px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-lg border border-emerald-500/30 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                          title="Sửa điểm thí sinh"
                        >
                          {displayScore}
                        </button>
                        {isJoined && (
                          <button
                            type="button"
                            onClick={() => handleKickPlayer(pos)}
                            title="Kick thí sinh"
                            className="text-rose-400/60 hover:text-rose-400 p-0.5 hover:bg-rose-500/15 rounded-md transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT / ACTIONS SECTION: 2 BALANCED ROWS (SCALED DOWN CORRESPONDINGLY) */}
            <div className="flex flex-col gap-1.5 shrink-0 justify-center">
              {/* HÀNG 1: QUẢN LÝ ĐỀ & HỆ THỐNG */}
              <div className="flex items-center flex-wrap sm:flex-nowrap lg:justify-end gap-1.5">
                {currentUser?.role === 'ADMIN' && onOpenSuperAdmin && (
                  <button
                    type="button"
                    onClick={onOpenSuperAdmin}
                    className="px-2.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[11px] sm:text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span className="whitespace-nowrap">Web Admin</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowQuestionManager(true)}
                  className="px-2.5 py-1.5 bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 text-emerald-300 text-[11px] sm:text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="whitespace-nowrap">Kho Đề 📚</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowGameLogsModal(true)}
                  className="px-2.5 py-1.5 bg-teal-500/15 border border-teal-500/30 hover:bg-teal-500/25 text-teal-300 text-[11px] sm:text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                  title="Xem và xuất nhật ký trận đấu, tín hiệu chuông, điểm số chi tiết"
                >
                  <FileText className="w-3.5 h-3.5 text-teal-400" />
                  <span className="whitespace-nowrap">Nhật Ký {matchState?.logs?.length ? `(${matchState.logs.length})` : ''}</span>
                </button>
              </div>

              {/* HÀNG 2: TÙY CHỈNH & ĐIỀU HÀNH */}
              <div className="flex items-center flex-wrap sm:flex-nowrap lg:justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowRoundCustomizer(true)}
                  className="px-2.5 py-1.5 bg-violet-500/15 border border-violet-500/30 hover:bg-violet-500/25 text-violet-300 text-[11px] sm:text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                  title="Mở bảng pop-up tùy chỉnh biểu trưng logo các vòng thi"
                >
                  <Settings2 className="w-3.5 h-3.5 text-violet-400" />
                  <span className="whitespace-nowrap">Tùy Chỉnh Logo ⚙️</span>
                </button>

                <button
                  type="button"
                  onClick={() => adminCommand(SocketEvent.ADMIN_TOGGLE_OVERLAY, { visible: matchState?.overlayVisible === false ? true : false })}
                  className={`px-2.5 py-1.5 border text-[11px] sm:text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 ${
                    matchState?.overlayVisible === false
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                      : 'bg-rose-500/25 border-rose-500/50 text-rose-300'
                  }`}
                  title="Click để Ẩn/Hiện Overlay Stream"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span className="whitespace-nowrap">{matchState?.overlayVisible === false ? 'Overlay: ẨN' : 'Overlay: HIỆN'}</span>
                </button>

                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    title="Đăng xuất khỏi phiên điều khiển"
                    className="px-2.5 py-1.5 bg-slate-850 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/30 text-slate-300 hover:text-rose-300 text-[11px] sm:text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="whitespace-nowrap">Đăng Xuất</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </header>

        {/* TOP HORIZONTAL ROUND NAVIGATION STRIP */}
        <nav className="border-t border-slate-800/80 px-2 sm:px-4 py-1 bg-slate-950/80">
          <div className="max-w-[1750px] mx-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
            <div className="flex items-center gap-1 shrink-0 pr-1.5 border-r border-slate-800">
              <Menu className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider hidden sm:inline">Vòng Thi:</span>
            </div>

            <div className="flex items-center gap-1 flex-1 overflow-x-auto no-scrollbar py-0.5">
              {([
                { id: 'WAITING', label: 'Phòng Đợi' },
                { id: 'KHOI_DONG', label: '1. Khởi Động' },
                { id: 'VCNV', label: '2. VCNV' },
                { id: 'TANG_TOC', label: '3. Tăng Tốc' },
                { id: 'VE_DICH', label: '4. Về Đích' },
                { id: 'CH_PHU', label: '5. Câu Hỏi Phụ' },
                { id: 'JEOPARDY', label: '6. Jeopardy!' },
                { id: 'MA_TRAN_KEP', label: '7. Ma Trận Kép' },
                { id: 'CHINH_PHUC', label: '8. Chinh Phục' },
                { id: 'DAU_TRI', label: '9. Đấu Trí' },
                { id: 'SUMMARY', label: 'Tổng Kết Điểm' },
              ] as const).map((r) => {
                const isActive = currentRound === r.id;
                const customSetting = matchState?.roundCustomSettings?.[r.id];
                const customLogo = customSetting?.customLogoUrl || customSetting?.logoUrl;

                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleChangeRound(r.id)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-teal-500/20 to-indigo-500/20 border-teal-500 text-teal-300 shadow-sm shadow-teal-500/10'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {customLogo && customLogo !== 'none' && (
                      <div className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                        <RoundLogoRenderer logoIdOrUrl={customLogo} className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <span className="whitespace-nowrap">{r.label}</span>
                    {isActive && <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-ping shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      </div>

      {/* CORE CONTROL AREA: FULL WIDTH WORKSPACE + BOTTOM MEDIA/CHAT ROW */}
      <div className="flex-1 max-w-[1700px] w-full mx-auto p-2 sm:p-3 flex flex-col gap-2 min-h-0">
        
        {/* FULL WIDTH DYNAMIC ROUND PANEL */}
        <main className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 min-h-[350px] shadow-xl flex flex-col">
          
          {/* TAB 1: PHÒNG ĐỢI (WAITING ROOM & LOBBY HUB) */}
          {currentRound === 'WAITING' && (
            <div className="space-y-4 sm:space-y-5">
              
              {/* KHỐI 1: CẤU HÌNH TRẬN ĐẤU & BỘ ĐỀ THI */}
              <section className="bg-slate-950 border border-indigo-500/25 rounded-xl p-3.5 sm:p-4 shadow-lg shadow-indigo-950/10">
                <div className="flex items-center justify-between pb-2.5 mb-3.5 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-indigo-500/15 border border-indigo-500/30 rounded-lg text-indigo-400">
                      <Crown className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                        CẤU HÌNH TRẬN ĐẤU &amp; BỘ ĐỀ THI
                      </h2>
                      <p className="text-[11px] text-slate-400">
                        Cài đặt tên trận đấu hiển thị và nạp gói câu hỏi vào hệ thống
                      </p>
                    </div>
                  </div>
                  {savedTournamentNotice && (
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                      <Check className="w-3 h-3" /> Đã lưu cài đặt
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                  {/* CARD: TÊN CUỘC THI */}
                  <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-3.5 flex flex-col justify-between shadow-sm">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wide">
                          Tên Cuộc Thi
                        </span>
                        <span className="text-[10px] text-slate-400">Màn hình Thí sinh &amp; Khán giả</span>
                      </div>

                      <form onSubmit={handleSaveTournamentName} className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={tournamentNameInput}
                          onChange={(e) => setTournamentNameInput(e.target.value)}
                          placeholder="VD: Đường Lên Đỉnh Olympia..."
                          className="flex-1 bg-slate-950 border border-slate-700/80 focus:border-indigo-500 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none font-semibold transition-all"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all shadow-md shadow-indigo-600/20 cursor-pointer shrink-0 flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Lưu</span>
                        </button>
                      </form>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Hiện hành:</span>
                      <span className="font-bold text-indigo-300 truncate max-w-[220px]">
                        {matchState?.tournamentName || 'Đường Lên Đỉnh Olympia'}
                      </span>
                    </div>
                  </div>

                  {/* CARD: NẠP BỘ ĐỀ THI */}
                  <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-3.5 flex flex-col justify-between shadow-sm">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-teal-300 uppercase tracking-wide">
                            Nạp Bộ Đề Thi
                          </span>
                          <span className="text-[10px] text-slate-400">Nhập mã 6 số</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowQuestionManager(true)}
                          className="px-2.5 py-1 bg-slate-950 hover:bg-slate-850 border border-slate-700/80 text-teal-300 text-[11px] font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>Kho Đề Thi</span>
                        </button>
                      </div>

                      <form onSubmit={handleLoadMatchPackage} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                        <div className="sm:col-span-5">
                          <input
                            type="text"
                            required
                            value={inputMatchCode}
                            onChange={(e) => setInputMatchCode(e.target.value)}
                            placeholder="Mã đề (VD: 123456)"
                            className="w-full bg-slate-950 border border-slate-700/80 focus:border-teal-500 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none uppercase font-mono font-bold"
                          />
                        </div>
                        <div className="sm:col-span-4">
                          <input
                            type="password"
                            value={inputMatchPassword}
                            onChange={(e) => setInputMatchPassword(e.target.value)}
                            placeholder="Mật khẩu (mặc định 123)"
                            className="w-full bg-slate-950 border border-slate-700/80 focus:border-teal-500 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <button
                            type="submit"
                            disabled={loadLoading}
                            className="w-full py-1.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-slate-950 font-black text-xs rounded-lg transition-all shadow-md shadow-teal-500/20 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3 h-3 ${loadLoading ? 'animate-spin' : ''}`} />
                            <span>{loadLoading ? 'Đang Nạp...' : 'Nạp Đề'}</span>
                          </button>
                        </div>
                      </form>

                      {loadErrorMsg && (
                        <div className="mt-2 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-300 text-[11px] flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                          <span>{loadErrorMsg}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Đề đang dùng:</span>
                      <span className="font-mono font-bold text-teal-300">
                        {matchState?.matchCode || 'Mặc định (OLYMPIA26)'}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* KHỐI 2: ĐƯỜNG DẪN KẾT NỐI (CHỈ CÒN TÊN, BẤM VÀO TỰ ĐỘNG COPY) */}
              <section className="bg-slate-950 border border-teal-500/25 rounded-xl p-3.5 sm:p-4 shadow-lg shadow-teal-950/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 mb-3.5 border-b border-slate-800/80 gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-teal-500/15 border border-teal-500/30 rounded-lg text-teal-400">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                        ĐƯỜNG DẪN KẾT NỐI
                      </h2>
                      <p className="text-[11px] text-slate-400">
                        Bấm trực tiếp vào từng nút để sao chép đường dẫn
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] text-teal-300 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20 self-start sm:self-auto font-bold">
                    ⚡ Click để tự động copy link
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {subLinks.map((link) => {
                    const Icon = link.icon;
                    const isCopied = copiedLinkKey === link.key;

                    return (
                      <button
                        key={link.key}
                        type="button"
                        onClick={() => copyToClipboard(link.url, link.key)}
                        className={`group relative py-3 px-2.5 rounded-xl border transition-all duration-150 flex items-center justify-center gap-2 bg-slate-900 ${
                          isCopied
                            ? 'border-emerald-400 bg-emerald-950/40 shadow-md shadow-emerald-500/20 scale-[1.02] ring-1 ring-emerald-400/30'
                            : `${link.accentBorder} hover:bg-slate-850 hover:scale-[1.01] shadow-sm`
                        } cursor-pointer active:scale-95`}
                        title={`Bấm để copy đường dẫn: ${link.title}`}
                      >
                        <div className={`p-1.5 rounded-lg transition-transform group-hover:scale-110 shrink-0 ${isCopied ? 'bg-emerald-500/20 text-emerald-300' : link.badgeBg}`}>
                          {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Icon className="w-4 h-4" />}
                        </div>

                        <span className="text-xs font-bold text-white whitespace-nowrap">
                          {isCopied ? '✓ Đã Copy' : link.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* KHỐI 3: ÂM THANH PHÒNG CHỜ & GIỚI THIỆU */}
              <section className="bg-slate-950 border border-amber-500/25 rounded-xl p-3.5 sm:p-4 shadow-lg shadow-amber-950/10">
                <div className="flex items-center justify-between pb-2.5 mb-3.5 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-amber-500/15 border border-amber-500/30 rounded-lg text-amber-400">
                      <Volume2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                        ÂM THANH PHÒNG CHỜ &amp; GIỚI THIỆU
                      </h2>
                      <p className="text-[11px] text-slate-400">
                        Nhạc hiệu, âm thanh mở màn và giới thiệu thành phần tham dự
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={triggerStopAll}
                    className="px-2.5 py-1 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-sm active:scale-95"
                  >
                    <Square className="w-3.5 h-3.5 fill-current text-rose-400" />
                    <span>Dừng âm thanh</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {[
                    { id: 'General_Intro', label: '1. Nhạc hiệu cuộc thi' },
                    { id: 'General_Entrance', label: '2. Nhạc mở đầu' },
                    { id: 'General_IntroduceContestant', label: '3. Giới thiệu thí sinh' },
                    { id: 'General_RoundIntro', label: '4. Nhạc hiệu vòng thi' },
                    { id: 'General_Supervisior_1', label: '5. Ban cố vấn 1' },
                    { id: 'General_Supervisior_2', label: '6. Ban cố vấn 2' },
                    { id: 'General_Supervisior_3', label: '7. Ban cố vấn 3' },
                    { id: 'General_Supervisior_4', label: '8. Ban cố vấn 4' },
                    { id: 'General_Supervisior_5', label: '9. Ban cố vấn 5' },
                    { id: 'General_Space', label: '10. Dấu ba chấm' },
                  ].map((sound) => (
                    <button
                      key={sound.id}
                      type="button"
                      onClick={() => adminCommand(SocketEvent.ADMIN_PLAY_SOUND, { soundId: sound.id })}
                      className="px-2.5 py-2.5 bg-slate-900 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/40 rounded-lg transition-all cursor-pointer flex items-center justify-center text-center min-h-[46px] group active:scale-95 shadow-sm"
                    >
                      <span className="text-[11px] font-medium text-slate-300 group-hover:text-amber-300 leading-snug">
                        {sound.label}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

            </div>
          )}

          {currentRound === 'KHOI_DONG' && (
            <KhoiDongPanel matchState={matchState} adminCommand={adminCommand} matchQuestions={matchQuestions} />
          )}

          {currentRound === 'VCNV' && (
            <VCNVPanel matchState={matchState} adminCommand={adminCommand} matchQuestions={matchQuestions} />
          )}

          {currentRound === 'TANG_TOC' && (
            <TangTocPanel matchState={matchState} adminCommand={adminCommand} matchQuestions={matchQuestions} />
          )}

          {currentRound === 'VE_DICH' && (
            <VeDichPanel matchState={matchState} adminCommand={adminCommand} matchQuestions={matchQuestions} />
          )}

          {currentRound === 'CH_PHU' && (
            <CHPhuPanel matchState={matchState} adminCommand={adminCommand} matchQuestions={matchQuestions} />
          )}

          {currentRound === 'JEOPARDY' && (
            <JeopardyPanel matchState={matchState} socket={socket} matchQuestions={matchQuestions} />
          )}

          {currentRound === 'MA_TRAN_KEP' && (
            <MaTranKepPanel matchState={matchState} socket={socket} />
          )}

          {currentRound === 'CHINH_PHUC' && (
            <ChinhPhucPanel matchState={matchState} adminCommand={adminCommand} matchQuestions={matchQuestions} />
          )}

          {currentRound === 'DAU_TRI' && (
            <DauTriPanel state={matchState} questions={matchQuestions} emitSocket={adminCommand} />
          )}

          {currentRound === 'SUMMARY' && (
            <div className="space-y-6" id="admin-summary-panel">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400 animate-pulse" />
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">ĐIỀU PHỐI TỔNG KẾT ĐIỂM SỐ</h3>
                    <p className="text-[10px] text-slate-400">Chọn chế độ và kiểm soát tiến trình hiển thị cho MC & khán giả</p>
                  </div>
                </div>
                {matchState?.summary?.mode && (
                  <button
                    onClick={() => adminCommand(SocketEvent.SUMMARY_SET_MODE, { mode: null })}
                    className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-300 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Hủy Lựa Chọn
                  </button>
                )}
              </div>

              {!matchState?.summary?.mode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <button
                    onClick={() => adminCommand(SocketEvent.SUMMARY_SET_MODE, { mode: 'ROUNDS' })}
                    className="group p-6 bg-slate-950 border border-slate-800 hover:border-teal-500/50 rounded-2xl text-left transition-all hover:bg-teal-950/10 flex flex-col justify-between h-48 cursor-pointer"
                  >
                    <div>
                      <span className="text-[10px] bg-teal-500/10 text-teal-400 font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                        DẠNG THỨ NHẤT
                      </span>
                      <h4 className="text-base font-black text-white group-hover:text-teal-400 transition-colors mt-3">
                        1. Tổng kết từng vòng
                      </h4>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        Hiển thị điểm số xếp hạng theo thứ tự từ thấp đến cao.
                      </p>
                    </div>
                    <span className="text-[10px] text-teal-400 font-extrabold group-hover:underline self-end">KÍCH HOẠT HIỆN THỊ →</span>
                  </button>

                  <button
                    onClick={() => adminCommand(SocketEvent.SUMMARY_SET_MODE, { mode: 'FINAL' })}
                    className="group p-6 bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-2xl text-left transition-all hover:bg-indigo-950/10 flex flex-col justify-between h-48 cursor-pointer"
                  >
                    <div>
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                        DẠNG THỨ HAI
                      </span>
                      <h4 className="text-base font-black text-white group-hover:text-indigo-400 transition-colors mt-3">
                        2. Bảng điểm
                      </h4>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        Hiển thị điểm số cố định theo thứ tự bàn thi đấu.
                      </p>
                    </div>
                    <span className="text-[10px] text-indigo-400 font-extrabold group-hover:underline self-end">KÍCH HOẠT HIỆN THỊ →</span>
                  </button>
                </div>
              ) : (
                <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Đang phát sóng chế độ: {matchState.summary.mode === 'ROUNDS' ? 'Tổng kết từng vòng' : 'Bảng điểm'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Màn hình Viewer và MC đã được đồng bộ hóa trực tiếp.
                  </p>
                </div>
              )}

              {/* BẢNG ĐIỀU KHIỂN ÂM THANH TỔNG KẾT & TRAO GIẢI */}
              <RoundSoundPanel
                title="Bảng Điều Khiển Âm Thanh: Tổng Kết & Trao Giải"
                accentColor="amber"
                columns={4}
                adminCommand={adminCommand}
                sounds={[
                  { id: 'General_Intro', label: '1. Nhạc hiệu cuộc thi' },
                  { id: 'General_RoundSummary', label: '2. Nhạc tổng kết điểm' },
                  { id: 'General_Rank_1', label: '3. Xếp hạng Nhất' },
                  { id: 'General_Rank_2', label: '4. Xếp hạng Nhì' },
                  { id: 'General_Rank_3', label: '5. Xếp hạng Ba' },
                  { id: 'General_Rank_4', label: '6. Xếp hạng Tư' },
                  { id: 'General_Victory', label: '7. Trao giải & Về đích' },
                  { id: 'General_Space', label: '8. Dấu ba chấm' },
                ]}
              />
            </div>
          )}

        </main>

        {/* BOTTOM SECTION: MEDIA PLAYER & DIRECT MC CHAT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 mt-1">
          
          {/* LEFT / COL-7: MULTIMEDIA CONTROLS */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-1 mb-1.5">
              <div className="flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-teal-400" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Media & Trình Chiếu Ngoài
                </h3>
              </div>
              <span className="text-[9px] text-slate-500 font-mono">BROADCAST SYNC</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
              {/* Media selector */}
              <div className="space-y-1">
                <select
                  value={selectedExternalMediaId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedExternalMediaId(id);
                    const item = matchQuestions?.media_ngoai?.find((m: any) => m.id === id);
                    if (item) {
                      adminCommand(SocketEvent.ADMIN_SET_EXTERNAL_MEDIA, {
                        mediaUrl: item.url,
                        mediaType: item.type || 'video',
                        title: item.title || 'Media ngoài'
                      });
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none font-mono"
                >
                  <option value="">-- Chọn Media phát sóng --</option>
                  {matchQuestions?.media_ngoai?.map((m: any) => (
                    <option key={m.id} value={m.id}>
                      {m.title || m.id} ({m.type || 'video'})
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => adminCommand(SocketEvent.MEDIA_PLAY, {})}
                    className="flex-1 py-1 bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 text-[10px] font-bold rounded flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" /> Phát
                  </button>
                  <button
                    onClick={() => adminCommand(SocketEvent.MEDIA_PAUSE, {})}
                    className="flex-1 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 text-[10px] font-bold rounded flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Pause className="w-3 h-3 fill-current" /> Tạm dừng
                  </button>
                  <button
                    onClick={() => adminCommand(SocketEvent.ADMIN_CLEAR_EXTERNAL_MEDIA, {})}
                    className="flex-1 py-1 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[10px] font-bold rounded flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Square className="w-3 h-3 fill-current" /> Đóng
                  </button>
                </div>
              </div>

              {/* Volume master */}
              <div className="bg-slate-950 border border-slate-850 p-2 rounded-lg space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                  <span>Âm Lượng Master:</span>
                  <span className="font-mono text-teal-400">
                    {Math.round((matchState?.audioConfig?.volume ?? 1) * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => triggerUpdateConfig(matchState?.audioConfig?.volume ?? 1, !matchState?.audioConfig?.isMuted)}
                    className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                  >
                    {matchState?.audioConfig?.isMuted ? <VolumeX className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3 h-3 text-teal-400" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={matchState?.audioConfig?.volume ?? 1}
                    onChange={(e) => {
                      const newVol = parseFloat(e.target.value);
                      triggerUpdateConfig(newVol, matchState?.audioConfig?.isMuted ?? false);
                    }}
                    className="flex-1 accent-teal-500 cursor-pointer h-1 bg-slate-900 rounded-lg"
                  />
                  <button
                    onClick={triggerStopAll}
                    className="px-1.5 py-0.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[9px] font-bold rounded transition-all flex items-center gap-0.5 cursor-pointer shrink-0"
                  >
                    <Square className="w-2.5 h-2.5 fill-current text-rose-400" /> Dừng âm
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT / COL-5: CHAT CHỈ ĐẠO MC */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-1 mb-1">
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                  Chat Chỉ Đạo MC
                </h3>
              </div>
              <span className="text-[9px] text-slate-500 font-mono">LIVE FEED</span>
            </div>

            {/* Chat list */}
            <div className="flex-1 bg-slate-950 border border-slate-850 rounded-lg p-1.5 overflow-y-auto max-h-16 min-h-[40px] space-y-1 mb-1 font-sans text-xs">
              {(!chatMessages || chatMessages.length === 0) ? (
                <p className="text-[10px] text-slate-600 italic text-center py-0.5">Chưa có tin nhắn chỉ đạo nào...</p>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={msg.id || i} className={`flex items-start gap-1 ${msg.sender === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`px-2 py-0.5 rounded text-[11px] max-w-[92%] ${
                      msg.sender === 'ADMIN' 
                        ? 'bg-indigo-600/30 border border-indigo-500/30 text-indigo-200' 
                        : 'bg-slate-800 border border-slate-700 text-slate-200'
                    }`}>
                      <span className="font-bold text-[9px] opacity-70 mr-1">[{msg.sender}]:</span>
                      <span>{msg.text}</span>
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Send input */}
            <form onSubmit={handleSendChat} className="flex gap-1 items-center">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Nhắn chỉ đạo trực tiếp cho MC..."
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-2 py-1 text-[11px] text-white placeholder:text-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm shrink-0"
              >
                <Send className="w-3 h-3" />
                <span>Gửi</span>
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* LOAD PACKAGE SUCCESS POP-UP MODAL */}
      {loadSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">NẠP BỘ ĐỀ THÀNH CÔNG!</h3>
                <p className="text-xs text-slate-400">Mã trận: <strong className="text-teal-400 font-mono">{loadSuccessModal.matchCode}</strong></p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Bộ đề đã được nạp và đồng bộ thời gian thực sang toàn bộ các màn hình (MC, Thí sinh, Khán giả, Bảng điểm). Đề thi cũ trong phiên đã được thay thế sạch sẽ.
            </p>

            <div className="bg-slate-950 rounded-2xl p-3.5 border border-slate-850 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Câu hỏi Khởi Động:</span>
                <strong className="font-mono text-teal-400">{loadSuccessModal.counts?.khoiDongCount || 0} câu</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Hàng ngang VCNV:</span>
                <strong className="font-mono text-indigo-400">{loadSuccessModal.counts?.vcnvCount || 0} hàng</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Câu hỏi Tăng Tốc:</span>
                <strong className="font-mono text-amber-400">{loadSuccessModal.counts?.tangTocCount || 0} câu</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Câu hỏi Về Đích:</span>
                <strong className="font-mono text-emerald-400">{loadSuccessModal.counts?.veDichCount || 0} câu</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Câu hỏi Phụ:</span>
                <strong className="font-mono text-rose-400">{loadSuccessModal.counts?.cauHoiPhuCount || 0} câu</strong>
              </div>
            </div>

            <button
              onClick={() => setLoadSuccessModal(null)}
              className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-teal-500/20 cursor-pointer"
            >
              Đồng Ý & Tiếp Tục Điều Khiển
            </button>
          </motion.div>
        </div>
      )}

      {/* MANUAL SCORE EDIT MODAL */}
      {editingScorePlayer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Chỉnh Sửa Điểm Thủ Công</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingScorePlayer(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-850">
              <p className="text-[10px] text-slate-500 uppercase font-extrabold tracking-widest">THÍ SINH VỊ TRÍ {editingScorePlayer.position}:</p>
              <p className="text-base font-extrabold text-white">{editingScorePlayer.name}</p>
            </div>

            <form onSubmit={handleSaveScore} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Điểm số mới:
                </label>
                <input
                  type="number"
                  value={newScoreInput}
                  onChange={(e) => setNewScoreInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-2xl font-mono font-bold text-emerald-400 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Điều chỉnh nhanh:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: '+10', delta: 10 },
                    { label: '+20', delta: 20 },
                    { label: '+30', delta: 30 },
                    { label: '-5', delta: -5 },
                    { label: '-10', delta: -10 },
                    { label: 'Reset 0', setZero: true },
                  ].map((btn, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (btn.setZero) {
                          setNewScoreInput('0');
                        } else {
                          const current = parseInt(newScoreInput, 10) || 0;
                          setNewScoreInput((current + (btn.delta || 0)).toString());
                        }
                      }}
                      className="py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono font-bold rounded-lg transition-all cursor-pointer"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingScorePlayer(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/15"
                >
                  Lưu Cập Nhật
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* DETAILED GAME LOGS & EVENT AUDIT MODAL */}
      {showGameLogsModal && (
        <GameLogsModal
          isOpen={showGameLogsModal}
          onClose={() => setShowGameLogsModal(false)}
          matchState={matchState}
          adminCommand={adminCommand}
        />
      )}

      {/* ROUND LOGO & NAME CUSTOMIZER POP-UP MODAL */}
      <RoundCustomizerModal
        isOpen={showRoundCustomizer}
        onClose={() => setShowRoundCustomizer(false)}
        matchState={matchState}
        adminCommand={adminCommand}
      />

    </div>
  );
}
