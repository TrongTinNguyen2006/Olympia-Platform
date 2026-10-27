import React from 'react';
import { useGameSocket } from '../hooks/useGameSocket.js';
import { useSoundEngine } from '../hooks/useSoundEngine.js';
import { SocketEvent } from '../types.js';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Laptop, Trophy, Tv, Users, Clock, ShieldAlert, Bell, Star, Sparkles } from 'lucide-react';

import CountUpScore from './viewer/CountUpScore.js';
import KhoiDongViewer from './viewer/KhoiDongViewer.js';
import VCNVViewer from './viewer/VCNVViewer.js';
import TangTocViewer from './viewer/TangTocViewer.js';
import VeDichViewer from './viewer/VeDichViewer.js';
import CHPhuViewer from './viewer/CHPhuViewer.js';
import SummaryViewer from './viewer/SummaryViewer.js';
import { JeopardyView } from './views/JeopardyView.js';
import { MaTranKepView } from './views/MaTranKepView.js';
import ChinhPhucView from './views/ChinhPhucView.js';
import { DauTriViewer } from './viewer/DauTriViewer.js';
import UniversalMediaPlayer from './UniversalMediaPlayer.js';
import { safeFetchJson } from '../utils/api.js';
import { RoundLogoRenderer } from './common/RoundLogoAssets.js';
import RoundTitleScreen from './common/RoundTitleScreen.js';

const getRoundDetails = (round: string, customTournamentName?: string) => {
  switch (round) {
    case 'KHOI_DONG':
      return {
        name: 'Vòng 1: Khởi động',
        colorClass: 'text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]',
        themeColor: 'emerald',
        glowColor: 'rgba(16,185,129,0.3)',
      };
    case 'VCNV':
      return {
        name: 'Vòng 2: Vượt chướng ngại vật',
        colorClass: 'text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]',
        themeColor: 'amber',
        glowColor: 'rgba(245,158,11,0.3)',
      };
    case 'TANG_TOC':
      return {
        name: 'Vòng 3: Tăng tốc',
        colorClass: 'text-violet-500 drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]',
        themeColor: 'violet',
        glowColor: 'rgba(139,92,246,0.3)',
      };
    case 'VE_DICH':
      return {
        name: 'Vòng 4: Về đích',
        colorClass: 'text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]',
        themeColor: 'red',
        glowColor: 'rgba(220,38,38,0.3)',
      };
    case 'CH_PHU':
      return {
        name: 'Câu hỏi phụ',
        colorClass: 'text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]',
        themeColor: 'cyan',
        glowColor: 'rgba(6,182,212,0.3)',
      };
    case 'JEOPARDY':
      return {
        name: 'Phần thi Jeopardy! (v3.0)',
        colorClass: 'text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]',
        themeColor: 'amber',
        glowColor: 'rgba(251,191,36,0.3)',
      };
    case 'MA_TRAN_KEP':
      return {
        name: 'Ma trận kép',
        colorClass: 'text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.5)]',
        themeColor: 'indigo',
        glowColor: 'rgba(129,140,248,0.3)',
      };
    case 'CHINH_PHUC':
      return {
        name: 'Chinh phục',
        colorClass: 'text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]',
        themeColor: 'sky',
        glowColor: 'rgba(56,189,248,0.3)',
      };
    case 'DAU_TRI':
      return {
        name: 'Đấu trí (University Challenge)',
        colorClass: 'text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]',
        themeColor: 'indigo',
        glowColor: 'rgba(99,102,241,0.3)',
      };
    case 'SUMMARY':
      return {
        name: 'Tổng kết điểm',
        colorClass: 'text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]',
        themeColor: 'yellow',
        glowColor: 'rgba(250,204,21,0.3)',
      };
    case 'WAITING':
    default:
      return {
        name: customTournamentName || 'Đường Lên Đỉnh Olympia',
        colorClass: 'text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.5)]',
        themeColor: 'indigo',
        glowColor: 'rgba(129,140,248,0.3)',
      };
  }
};

export default function ViewerApp() {
  const { matchState, isConnected, socket } = useGameSocket();
  useSoundEngine(matchState, socket);
  const [matchQuestions, setMatchQuestions] = React.useState<any>(null);
  const [audioNeedsUnblock, setAudioNeedsUnblock] = React.useState(true);

  React.useEffect(() => {
    const handleUnblock = () => {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (ctx) {
          ctx.resume();
        }
        // Force-unlock HTML5 audio elements with a tiny silent wav
        const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
        silentAudio.play().catch(err => {
          console.warn('Silent HTML5 audio autoplay unblock failed:', err);
        });
      } catch (e) {
        console.warn('AudioContext unblock error:', e);
      }
      setAudioNeedsUnblock(false);
      window.removeEventListener('click', handleUnblock);
      window.removeEventListener('keydown', handleUnblock);
    };

    window.addEventListener('click', handleUnblock);
    window.addEventListener('keydown', handleUnblock);

    return () => {
      window.removeEventListener('click', handleUnblock);
      window.removeEventListener('keydown', handleUnblock);
    };
  }, []);

  // Track score changes for popups
  const [scoreChanges, setScoreChanges] = React.useState<{ [pos: string]: { id: number; diff: number }[] }>({
    '1': [],
    '2': [],
    '3': [],
    '4': []
  });
  const prevScoresRef = React.useRef<{ [pos: string]: number }>({});

  React.useEffect(() => {
    if (matchState?.matchCode && matchState.matchCode.trim()) {
      safeFetchJson<any>(`/api/match/${encodeURIComponent(matchState.matchCode.trim())}?t=${matchState.loadedAt || Date.now()}`)
        .then((data) => {
          if (data && data.success) {
            setMatchQuestions(data.match);
          }
        })
        .catch((err) => console.error('Error fetching questions in ViewerApp:', err));
    }
  }, [matchState?.matchCode, matchState?.loadedAt]);

  // Real-time socket updates for loaded match questions
  React.useEffect(() => {
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

  React.useEffect(() => {
    if (!matchState?.players) return;
    
    let changed = false;
    const newChanges = { ...scoreChanges };
    const isJeopardySeparate = matchState?.currentRound === 'JEOPARDY' && matchState?.jeopardy?.scoringMode === 'SEPARATE';

    (['1', '2', '3', '4'] as const).forEach((pos) => {
      const currentScore = isJeopardySeparate
        ? (matchState.jeopardy?.separateScores?.[pos as unknown as number] ?? 0)
        : (matchState.players[pos]?.score ?? 0);
      const prevScore = prevScoresRef.current[pos];

      if (prevScore !== undefined && currentScore !== prevScore) {
        const diff = currentScore - prevScore;
        const id = Date.now() + Math.random();
        
        newChanges[pos] = [...(newChanges[pos] || []), { id, diff }];
        changed = true;

        // Clean up after 2.5 seconds
        setTimeout(() => {
          setScoreChanges((prev) => ({
            ...prev,
            [pos]: (prev[pos] || []).filter((item) => item.id !== id),
          }));
        }, 2500);
      }
      prevScoresRef.current[pos] = currentScore;
    });

    if (changed) {
      setScoreChanges(newChanges);
    }
  }, [matchState?.players]);

  // If no match state, show dynamic connecting / welcome screens
  if (!matchState) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200 p-6 relative overflow-hidden">
        {/* Decorator background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15),transparent_60%)] animate-pulse" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.3)_1px,transparent_1px)] bg-[size:32px_32px] opacity-25" />

        <div className="text-center space-y-4 z-10">
          <div className="w-16 h-16 rounded-full border-4 border-t-indigo-500 border-slate-800 animate-spin mx-auto" />
          <h2 className="text-xl font-bold font-sans tracking-wide uppercase text-indigo-300">ĐANG ĐỢI KẾT NỐI TÍN HIỆU...</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">Màn hình khán giả sẽ tự động tải dữ liệu trận đấu và đồng bộ tức thì khi đạo diễn nạp đề thi.</p>
        </div>
      </div>
    );
  }

  const currentRound = matchState.currentRound;
  const customSetting = matchState?.roundCustomSettings?.[currentRound];
  const customRoundLogo = customSetting?.customLogoUrl || customSetting?.logoUrl;
  const roundDetails = getRoundDetails(currentRound, matchState?.tournamentName);

  // Check if current round is displaying its intro / title card screen
  const isShowingRoundTitle = () => {
    if (currentRound === 'WAITING') return true;
    if (currentRound === 'KHOI_DONG' && !matchState.khoi_dong?.isConfirmed) return true;
    if (currentRound === 'VCNV' && !matchState.vcnv?.showRows) return true;
    if (currentRound === 'TANG_TOC' && (matchState.tang_toc?.currentQuestionIndex ?? -1) < 0) return true;
    if (currentRound === 'VE_DICH' && (typeof matchState.ve_dich?.currentPlayerIndex !== 'number' || matchState.ve_dich.currentPlayerIndex < 0 || matchState.ve_dich.currentPlayerIndex > 3)) return true;
    if (currentRound === 'CH_PHU' && (!matchState.cau_hoi_phu?.confirmedPlayers || matchState.cau_hoi_phu.confirmedPlayers.length === 0)) return true;
    if (currentRound === 'JEOPARDY' && !matchState.jeopardy?.isBoardShown) return true;
    if (currentRound === 'MA_TRAN_KEP' && (!matchState.ma_tran_kep || matchState.ma_tran_kep.status === 'IDLE')) return true;
    if (currentRound === 'CHINH_PHUC' && (!matchState.chinh_phuc?.isBoardShown && matchState.chinh_phuc?.colorMethod === null)) return true;
    if (currentRound === 'DAU_TRI' && (matchState.dau_tri?.status === 'CONFIG' || matchState.dau_tri?.status === 'READY')) return true;
    return false;
  };

  // Render proper child viewer based on active round
  const renderViewerContent = () => {
    switch (currentRound) {
      case 'WAITING':
        return (
          <RoundTitleScreen
            title={matchState?.tournamentName || 'ĐƯỜNG LÊN ĐỈNH OLYMPIA'}
            roundKey="WAITING"
            id="viewer-waiting-room-title"
          />
        );
      case 'KHOI_DONG':
        return <KhoiDongViewer matchState={matchState} matchQuestions={matchQuestions} />;
      case 'VCNV':
        return <VCNVViewer matchState={matchState} matchQuestions={matchQuestions} />;
      case 'TANG_TOC':
        return <TangTocViewer matchState={matchState} matchQuestions={matchQuestions} />;
      case 'VE_DICH':
        return <VeDichViewer matchState={matchState} matchQuestions={matchQuestions} />;
      case 'CH_PHU':
        return <CHPhuViewer matchState={matchState} matchQuestions={matchQuestions} />;
      case 'JEOPARDY':
        return <JeopardyView matchState={matchState} userRole="VIEWER" socket={socket} />;
      case 'MA_TRAN_KEP':
        return <MaTranKepView matchState={matchState} />;
      case 'CHINH_PHUC':
        return <ChinhPhucView matchState={matchState} />;
      case 'DAU_TRI':
        return <DauTriViewer state={matchState} questions={matchQuestions} />;
      case 'SUMMARY':
        return <SummaryViewer matchState={matchState} />;
      default:
        return null;
    }
  };

  // Find winner if summary mode to highlight green
  const playersArray = Object.keys(matchState.players).map(Number).map(p => ({ pos: p, ...matchState.players[p] }));
  const maxScore = Math.max(...playersArray.map(p => p.score ?? 0));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-6 overflow-hidden relative">
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,24,48,0.4),transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.25)_1px,transparent_1px)] bg-[size:24px_24px] opacity-10" />

      {/* Browser Autoplay Audio Unblock Overlay */}
      {audioNeedsUnblock && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex flex-col items-center justify-center text-center p-6 cursor-pointer">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-8 bg-slate-900/90 border border-slate-800 rounded-3xl max-w-lg space-y-6 shadow-2xl relative z-50"
          >
            <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto animate-pulse">
              <Bell className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-white uppercase tracking-wider">Kích hoạt âm thanh tự động</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Trình duyệt yêu cầu bạn nhấp chuột tối thiểu một lần để cho phép phát âm thanh tự động trong các phần thi.
              </p>
            </div>
            <div className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform inline-block">
              Bắt đầu & Kích hoạt âm thanh 🔊
            </div>
          </motion.div>
        </div>
      )}

      {/* TOP BROADCAST BAR - only show when round is actively in gameplay */}
      {!isShowingRoundTitle() && currentRound !== 'WAITING' && (
        <header className="w-full max-w-[1600px] mx-auto z-10 flex items-center justify-between px-3 py-1 mb-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black tracking-widest text-slate-400 uppercase bg-slate-900/80 border border-slate-800 px-3.5 py-1 rounded-full shadow-sm">
              {matchState?.tournamentName || 'ĐƯỜNG LÊN ĐỈNH OLYMPIA'}
            </span>
          </div>
        </header>
      )}

      {/* CENTER STAGE VIEWPORT (16:9 REDESIGNED MAIN BOX) */}
      <main className={`flex-1 max-w-[1600px] w-full mx-auto my-1 bg-slate-900/40 border border-slate-800/60 rounded-3xl ${currentRound === 'DAU_TRI' ? 'p-3 pt-2' : 'p-5'} shadow-2xl relative flex flex-col justify-between min-h-[600px]`}>
        {/* Content Box - Full Height shifted to top */}
        <div className={`flex-1 flex flex-col ${currentRound === 'DAU_TRI' ? 'justify-start' : 'justify-center'} relative z-10`}>
          {renderViewerContent()}
        </div>
      </main>

      {/* GLOBAL SCORE POP-UP OVERLAY FOR ALL ROUNDS */}
      <div className="fixed bottom-12 left-0 right-0 max-w-[1600px] w-full mx-auto px-4 md:px-6 pointer-events-none z-[9999] grid grid-cols-4 gap-4">
        {([1, 2, 3, 4] as const).map((pos) => (
          <div key={pos} className="relative flex justify-center items-center">
            <AnimatePresence>
              {(scoreChanges[pos] || []).map((change) => (
                <motion.div
                  key={change.id}
                  initial={{ opacity: 0, y: 30, scale: 0.6 }}
                  animate={{ opacity: 1, y: -20, scale: 1.3 }}
                  exit={{ opacity: 0, y: -50, scale: 0.8 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className={`absolute -top-12 text-4xl md:text-5xl font-black font-mono tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] select-none whitespace-nowrap z-[9999] ${
                    change.diff > 0 ? 'text-emerald-400' : 'text-red-500'
                  }`}
                >
                  {change.diff > 0 ? `+${change.diff}` : change.diff}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* BOTTOM CONTESTANT HUD BOARD - REDESIGNED FOOTER */}
      {!isShowingRoundTitle() && !(currentRound === 'CH_PHU' || currentRound === 'JEOPARDY' || currentRound === 'CHINH_PHUC' || (currentRound === 'VE_DICH' && (() => {
        const activeIdx = matchState.ve_dich?.currentPlayerIndex;
        if (activeIdx === null || activeIdx === undefined) return false;
        const activePos = (activeIdx + 1) as 1 | 2 | 3 | 4;
        return matchState.ve_dich?.turns?.[activePos]?.packageConfirmed ?? false;
      })())) && (
        <footer className="w-full max-w-[1600px] mx-auto z-10 bg-slate-900/60 border border-slate-850 rounded-2xl p-4 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {([1, 2, 3, 4] as const).map((pos) => {
            const player = matchState.players[pos];
            const isJoined = player && player.socketId !== null;
            
            // Determine active turn or buzzer states to light up player HUD
            const isBuzzed = matchState.buzzerState === 'BUZZED' && matchState.buzzedPlayer === pos;
            const isDauTriBuzzed = currentRound === 'DAU_TRI' && matchState.dau_tri?.buzzedPlayer === pos;
            const isDauTriBonusActive = currentRound === 'DAU_TRI' && matchState.dau_tri?.stage !== 'MAIN_QUESTION' && matchState.dau_tri?.activeBonusPlayerPosition === pos;
            const vcnvBuzzerIndex = matchState.vcnv?.cnvBuzzedPlayers?.findIndex(bp => bp.position === pos) ?? -1;
            const isVcnvBuzzed = vcnvBuzzerIndex !== -1 || matchState.vcnv?.cnvBuzzedPlayer === pos;
            const hasVDPlayer = typeof matchState.ve_dich?.currentPlayerIndex === 'number' && matchState.ve_dich.currentPlayerIndex >= 0 && matchState.ve_dich.currentPlayerIndex <= 3;
            const activeTurn = hasVDPlayer ? matchState.ve_dich?.turns[(matchState.ve_dich.currentPlayerIndex + 1) as 1|2|3|4] : null;
            const isStealBuzzed = activeTurn?.claimBuzzerState === 'BUZZED' && activeTurn?.claimBuzzerPlayer === pos;
            
            const hasBuzzedSignal = isBuzzed || isDauTriBuzzed || isVcnvBuzzed || isStealBuzzed;

            // Determine if active contestant (Strict check for Ve Dich so no contestant is highlighted by default)
            const isKDActive = currentRound === 'KHOI_DONG' && matchState.khoi_dong?.isConfirmed && matchState.khoi_dong?.subRound === 'INDIVIDUAL' && (matchState.khoi_dong?.currentPlayerIndex + 1) === pos;
            const isVDActive = currentRound === 'VE_DICH' && hasVDPlayer && (matchState.ve_dich.currentPlayerIndex + 1) === pos;
            const isActiveContestant = isKDActive || isVDActive || isDauTriBonusActive;

            // Determine if winner highlight (green color) during summary
            const isWinner = currentRound === 'SUMMARY' && player && player.score === maxScore && maxScore > 0;

            // Styles assignment
            let boxBorderClass = 'border-slate-800';
            let bgStyleClass = 'bg-slate-950/80';
            let glowAnimation = {};

            if (isWinner) {
              // Green highlight for winner
              boxBorderClass = 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]';
              bgStyleClass = 'bg-emerald-950/40';
              glowAnimation = { scale: [1, 1.02, 1] };
            } else if (hasBuzzedSignal) {
              // Glowing gold/red for buzzers
              boxBorderClass = 'border-amber-500 shadow-[0_0_22px_rgba(245,158,11,0.45)]';
              bgStyleClass = 'bg-amber-950/30';
              glowAnimation = { scale: [1, 1.03, 1] };
            } else if (isActiveContestant) {
              // Glow colored with round theme
              if (currentRound === 'KHOI_DONG') {
                boxBorderClass = 'border-emerald-500/70 shadow-[0_0_15px_rgba(16,185,129,0.25)]';
                bgStyleClass = 'bg-emerald-950/10';
              } else if (currentRound === 'VE_DICH') {
                boxBorderClass = 'border-red-500/70 shadow-[0_0_15px_rgba(239,68,68,0.25)]';
                bgStyleClass = 'bg-red-950/10';
              }
              glowAnimation = { y: [0, -2, 0] };
            } else if (!isJoined) {
              boxBorderClass = 'border-slate-900/40 opacity-35';
              bgStyleClass = 'bg-slate-950/20';
            }

            return (
              <motion.div
                key={pos}
                animate={glowAnimation}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className={`p-4 rounded-xl border flex items-center justify-between transition-all relative overflow-hidden ${boxBorderClass} ${bgStyleClass}`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className={`w-8 h-8 rounded-lg font-black text-sm flex items-center justify-center shrink-0 border transition-colors ${
                    isWinner
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : hasBuzzedSignal
                      ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                      : isActiveContestant
                      ? currentRound === 'KHOI_DONG'
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-red-600 text-white border-red-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}>
                    {pos}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-black text-white truncate leading-none">
                        {(() => {
                          const rawName = player?.name || `Trống (Bàn ${pos})`;
                          const isKD = currentRound === 'KHOI_DONG';
                          const kd = matchState.khoi_dong;
                          const mode = kd?.subRound === 'INDIVIDUAL' 
                            ? (kd?.individualScoringMode || 'TRADITIONAL') 
                            : (kd?.collectiveScoringMode || 'TRADITIONAL');
                          if (isKD && mode !== 'TRADITIONAL') {
                            const wrongCount = kd?.wrongCounts?.[pos] ?? 0;
                            return `${rawName} | ${wrongCount}`;
                          }
                          return rawName;
                        })()}
                      </h4>
                      {isWinner && (
                        <span className="text-[9px] bg-yellow-500/20 text-yellow-400 font-extrabold px-1 rounded-full uppercase">🏆 Quán Quân</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right flex flex-col justify-center items-end relative min-w-[70px]">
                  {(() => {
                    const isJeopardySeparate = matchState?.currentRound === 'JEOPARDY' && matchState?.jeopardy?.scoringMode === 'SEPARATE';
                    const displayScore = isJeopardySeparate
                      ? (matchState.jeopardy?.separateScores?.[pos as unknown as number] ?? 0)
                      : (player?.score ?? 0);

                    return (
                      <strong className={`text-2xl font-black leading-none font-mono tracking-tight ${
                        isWinner 
                          ? 'text-yellow-400' 
                          : hasBuzzedSignal 
                          ? 'text-amber-400' 
                          : isActiveContestant 
                          ? 'text-rose-400' 
                          : 'text-emerald-400'
                      }`}>
                        <CountUpScore score={displayScore} />
                      </strong>
                    );
                  })()}
                </div>
              </motion.div>
            );
          })}
        </div>
      </footer>
      )}

      {/* EXTERNAL MEDIA FULL SCREEN OVERLAY FOR VIEWER */}
      {(() => {
        const extMedia = matchState?.activeExternalMedia;
        const isExtActive = extMedia && extMedia.isPlaying !== false;
        if (!isExtActive) return null;

        const rawExtType = (extMedia.type || '').toLowerCase().trim();
        const extUrl = extMedia.url || '';
        const isAudioExt = rawExtType === 'audio' || (extUrl && extUrl.match(/\.(mp3|wav|ogg|m4a|aac|flac)($|\?)/i) !== null);
        const isVisualExt = !isAudioExt;

        return (
          <AnimatePresence>
            {isVisualExt && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="fixed inset-0 z-[9999] bg-black flex items-center justify-center p-0"
              >
                <UniversalMediaPlayer
                  media={{ url: extMedia.url, type: (extMedia.type || 'video').toLowerCase() as any }}
                  mediaControl={{ isPlaying: extMedia.isPlaying, key: extMedia.key }}
                  className="w-full h-full object-contain"
                  largeMode={true}
                  hideFrame={true}
                  hideControls={false}
                />
              </motion.div>
            )}

            {isAudioExt && (
              <UniversalMediaPlayer
                media={{ url: extMedia.url, type: 'audio' }}
                mediaControl={{ isPlaying: extMedia.isPlaying, key: extMedia.key }}
                className="hidden"
              />
            )}
          </AnimatePresence>
        );
      })()}
    </div>
  );
}
