import React, { useState, useEffect, useRef } from 'react';
import { useGameSocket } from '../hooks/useGameSocket.js';
import { useSoundEngine } from '../hooks/useSoundEngine.js';
import { MatchDbModel, SocketEvent, GameRound, getTangTocImprovedPoints } from '../types.js';
import { MessageSquare, Send, Award, Clock, HelpCircle, Check, Play, UserCheck, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import UniversalMediaPlayer from './UniversalMediaPlayer.js';
import SmoothTimerBar from './SmoothTimerBar.js';
import { JeopardyView } from './views/JeopardyView.js';
import { MaTranKepMCView } from './views/MaTranKepMCView.js';
import ChinhPhucView from './views/ChinhPhucView.js';
import { DauTriMCView } from './views/DauTriMCView.js';
import { safeFetchJson } from '../utils/api.js';
import { RoundLogoRenderer } from './common/RoundLogoAssets.js';

const ADMIN_TOKEN = 'OLYMPIA_ADMIN_SECRET_KEY';

export default function MCView() {
  const {
    matchState,
    isConnected,
    chatMessages,
    sendChatMessage,
    adminAuth,
    socket,
  } = useGameSocket();

  useSoundEngine(matchState, socket);

  // Connection/Auth states
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState('');

  // Auto-authorize MC on mount / socket connect without asking for match code
  useEffect(() => {
    let active = true;
    const targetCode = (matchState?.matchCode || '').trim().toUpperCase();
    
    adminAuth(ADMIN_TOKEN, targetCode).then((res) => {
      if (active && res.success) {
        setIsAuthorized(true);
      }
    });

    return () => {
      active = false;
    };
  }, [isConnected, matchState?.matchCode]);

  // Active loaded questions for display
  const [matchQuestions, setMatchQuestions] = useState<MatchDbModel | null>(null);

  // Chat logic
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      const container = chatEndRef.current.parentElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [chatMessages]);

  // Try to load question bank for the match
  useEffect(() => {
    if (matchState?.matchCode && matchState.matchCode.trim()) {
      safeFetchJson<any>(`/api/match/${encodeURIComponent(matchState.matchCode.trim())}?t=${matchState.loadedAt || Date.now()}`)
        .then((data) => {
          if (data && data.success && data.match) {
            setMatchQuestions(data.match);
          }
        })
        .catch((err) => console.error('Failed to fetch match questions:', err));
    }
  }, [matchState?.matchCode, matchState?.loadedAt]);

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

  const handleManualConnect = async () => {
    const targetCode = (matchState?.matchCode || '').trim().toUpperCase();
    const res = await adminAuth(ADMIN_TOKEN, targetCode);
    if (res.success) {
      setIsAuthorized(true);
    } else {
      setAuthError('Đang kết nối lại máy chủ MC...');
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage('MC', chatInput.trim());
    setChatInput('');
  };

  // Get current active round data
  const round: GameRound = matchState?.currentRound || 'WAITING';
  const buzzerState = matchState?.buzzerState || 'LOCKED';
  const isTimerRunning = matchState?.isTimerRunning || false;

  // Question helpers depending on active round
  const getCurrentQuestionTextAndAnswer = (): { question: string; answer: string; extra?: string; media?: any } => {
    if (!matchQuestions) {
      return { question: 'Vui lòng nạp đề thi từ Admin panel.', answer: 'Chưa có dữ liệu.' };
    }

    switch (round) {
      case 'KHOI_DONG': {
        const sub = matchState?.khoi_dong?.subRound;
        const qIdx = matchState?.khoi_dong?.currentQuestionIndex ?? 0;
        const scoringMode = sub === 'INDIVIDUAL' 
          ? matchState?.khoi_dong?.individualScoringMode 
          : matchState?.khoi_dong?.collectiveScoringMode;

        const scoringRuleLabel = scoringMode && scoringMode !== 'TRADITIONAL'
          ? ' [Luật Cải tiến: +10 đúng, -5 sai, 0 bỏ qua]'
          : ' [Luật Truyền thống: +10 đúng]';

        if (sub === 'INDIVIDUAL') {
          const activeIdx = matchState?.khoi_dong?.currentPlayerIndex;
          if (activeIdx === null || activeIdx === undefined) {
            return {
              question: `[Khởi động cá nhân${scoringRuleLabel}] Chuẩn bị Khởi động`,
              answer: 'Chưa chọn thí sinh',
            };
          }
          const label = `Cá nhân Thí sinh ${activeIdx + 1} - Câu ${qIdx + 1}${scoringRuleLabel}`;
          const qList = matchQuestions.khoi_dong?.cau_hoi;
          const qObj = qList?.[qIdx];
          return {
            question: qObj ? `[${label}] ${qObj.noi_dung}` : 'Hết bộ câu hỏi cá nhân',
            answer: qObj ? qObj.dap_an_dung : 'Không có',
            extra: qObj?.chu_thich,
            media: qObj?.media,
          };
        } else {
          const qList = matchQuestions.khoi_dong?.cau_hoi;
          const qObj = qList?.[qIdx];
          return {
            question: `[Khởi động chung - Câu ${qIdx + 1}${scoringRuleLabel}] ${qObj ? qObj.noi_dung : 'Hết câu hỏi'}`,
            answer: qObj ? qObj.dap_an_dung : 'Không có',
            extra: qObj?.chu_thich,
            media: qObj?.media,
          };
        }
      }
      case 'VCNV': {
        const rowId = matchState?.vcnv?.selectedRow;
        if (!rowId || matchState?.vcnv?.cnvSolved || matchState?.vcnv?.rows[rowId]?.isAnswered) {
          return { question: 'Admin chưa chọn hàng ngang.', answer: 'Đang đợi...' };
        }
        const rowObj = matchQuestions.vuot_chuong_ngai_vat?.hang_ngang?.find((r) => r.id === rowId);
        return {
          question: `[Hàng ngang số ${rowId}] ${rowObj ? rowObj.cau_hoi : 'Câu hỏi không tìm thấy'}`,
          answer: rowObj ? rowObj.dap_an : 'Không có',
          extra: `Từ khóa chính (${matchQuestions.vuot_chuong_ngai_vat?.tu_khoa_chinh?.replace(/\s+/g, '')?.length || '?'} ký tự): ${matchQuestions.vuot_chuong_ngai_vat?.tu_khoa_chinh || 'Chưa có'}`,
          media: rowObj?.media,
        };
      }
      case 'TANG_TOC': {
        const qIdx = matchState?.tang_toc?.currentQuestionIndex ?? 0;
        const mode = matchState?.tang_toc?.mode || 'TRADITIONAL';

        if (mode === 'IMPROVED') {
          const qObj = matchQuestions.tang_toc?.cai_tien_cau_hoi?.[qIdx];
          const hintCount = qObj?.loai_cau_hoi === 4 ? 4 : 3;
          return {
            question: `[Tăng tốc Cải tiến - Câu ${qIdx + 1} (${hintCount} gợi ý)] ${qObj ? qObj.noi_dung : 'Chưa cập nhật'}`,
            answer: qObj ? qObj.dap_an_dung : 'Không có',
            extra: qObj?.chu_thich ? `Giải thích: ${qObj.chu_thich}` : undefined,
            media: qObj?.media,
          };
        } else {
          const qObj = matchQuestions.tang_toc?.cau_hoi?.[qIdx];
          return {
            question: `[Tăng tốc Truyền thống - Câu ${qIdx + 1}] ${qObj ? qObj.noi_dung : 'Chưa cập nhật'}`,
            answer: qObj ? qObj.dap_an_dung : 'Không có',
            extra: qObj?.chu_thich ? `Chú thích: ${qObj.chu_thich}` : undefined,
            media: qObj?.media,
          };
        }
      }
      case 'VE_DICH': {
        const activeIdx = matchState?.ve_dich?.currentPlayerIndex;
        if (activeIdx === null || activeIdx === undefined) {
          return { question: 'Chờ lượt thí sinh chọn gói điểm Về đích.', answer: 'Đang đợi...' };
        }
        const playerPos = (activeIdx + 1) as 1 | 2 | 3 | 4;
        const turn = matchState?.ve_dich?.turns[playerPos];
        const currentQIdx = turn?.currentQuestionIndex ?? 0;
        const packageChoice = turn?.chosenPackage?.[currentQIdx];
        
        if (!packageChoice) {
          return { question: 'Thí sinh chưa cấu hình gói điểm Về đích.', answer: 'Đang đợi...' };
        }

        const points = packageChoice.points;
        const qList = matchQuestions.ve_dich?.cau_hoi;
        const matchingQs = qList?.filter((q: any) => q.muc_diem === points) || [];
        
        let qObj = null;
        if (packageChoice.questionId && qList) {
          qObj = qList.find((q: any) => q.id === packageChoice.questionId);
        }
        if (!qObj) {
          qObj = matchingQs[currentQIdx] || matchingQs[0];
        }

        const pkgSummary = turn.chosenPackage.map(p => `${p.points}đ`).join(' - ');
        const starNotice = turn.starUsed ? ' | 🌟 ĐÃ BẬT NGÔI SAO HY VỌNG' : '';
        const claimNotice = turn.claimBuzzerPlayer ? ` | 🔔 Bàn ${turn.claimBuzzerPlayer} bấm chuông giành điểm` : '';

        return {
          question: `[Về đích - Thí sinh ${playerPos} - Câu ${currentQIdx + 1} (${points}đ) - Gói ${pkgSummary}${starNotice}${claimNotice}] ${qObj ? qObj.noi_dung : 'Chưa nạp'}`,
          answer: qObj ? qObj.dap_an_dung : 'Không có',
          extra: qObj ? `Lĩnh vực: ${qObj.linh_vuc || 'Tổng hợp'} • ${qObj.chu_thich || 'Không có chú thích'}` : undefined,
          media: qObj?.media,
        };
      }
      case 'CH_PHU': {
        const qIdx = matchState?.cau_hoi_phu?.currentQuestionIndex ?? 0;
        const qObj = matchQuestions.cau_hoi_phu?.cau_hoi?.[qIdx];
        const isFoul = matchState?.buzzerState === 'BUZZED' && !matchState?.isTimerRunning;
        const foulNotice = isFoul ? ` (⚠️ BÀN ${matchState?.buzzedPlayer} PHẠM QUY - Bấm trước lệnh tính giờ!)` : '';

        return {
          question: `[Câu hỏi phụ ${qIdx + 1}${foulNotice}] ${qObj ? qObj.noi_dung : 'Chưa cập nhật'}`,
          answer: qObj ? qObj.dap_an_dung : 'Không có',
          media: qObj?.media,
        };
      }
      default:
        return { question: 'Trận đấu đang ở phòng chờ hoặc đã kết thúc.', answer: 'Không có.' };
    }
  };

  const { question, answer, extra, media } = getCurrentQuestionTextAndAnswer();

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center"
        >
          <div className="flex flex-col items-center mb-6">
            <div className="p-3.5 bg-teal-500/10 border border-teal-500/20 rounded-full mb-3 text-teal-400">
              <UserCheck className="w-8 h-8 animate-pulse" />
            </div>
            <h1 className="text-xl font-bold font-sans tracking-tight text-center text-teal-300">
              MC PORTAL PANEL
            </h1>
            <p className="text-slate-400 text-xs mt-1">Cổng thông tin người dẫn chương trình</p>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-xs text-slate-400">
              {isConnected ? (
                <span className="text-emerald-400 font-semibold flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Đang đồng bộ quyền MC với máy chủ...
                </span>
              ) : (
                <span className="text-amber-400 flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  Đang kết nối WebSocket...
                </span>
              )}
            </div>

            {authError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex items-start gap-2 text-left">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <button
              onClick={handleManualConnect}
              type="button"
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-teal-500/20 cursor-pointer"
            >
              VÀO GIAO DIỆN MC TRỰC TIẾP
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (round === 'JEOPARDY' && matchState) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4">
        <JeopardyView
          matchState={matchState}
          userRole="MC"
          socket={socket}
        />
      </div>
    );
  }

  if (round === 'MA_TRAN_KEP' && matchState) {
    return (
      <MaTranKepMCView matchState={matchState} />
    );
  }

  if (round === 'CHINH_PHUC' && matchState) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4">
        <ChinhPhucView matchState={matchState} />
      </div>
    );
  }

  if (round === 'DAU_TRI' && matchState) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4">
        <DauTriMCView state={matchState} questions={matchQuestions} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative">
      {/* 3S PREP COUNTDOWN OVERLAY FOR MC */}
      {round === 'KHOI_DONG' && matchState?.khoi_dong?.isPrepRunning && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="p-8 bg-slate-900/90 border border-emerald-500/40 rounded-3xl shadow-2xl shadow-emerald-500/20 max-w-md w-full flex flex-col items-center gap-6">
            <span className="px-4 py-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-extrabold text-xs uppercase tracking-widest rounded-full animate-pulse">
              Lượt thi chuẩn bị bắt đầu
            </span>
            <h2 className="text-xl font-black text-white">
              {matchState.khoi_dong.subRound === 'INDIVIDUAL'
                ? (matchState.khoi_dong.currentPlayerIndex !== null ? `Thí sinh số ${matchState.khoi_dong.currentPlayerIndex + 1}: ${matchState.players[(matchState.khoi_dong.currentPlayerIndex + 1) as 1|2|3|4]?.name || ''}` : 'Khởi Động Cá Nhân')
                : 'Khởi Động Chung'}
            </h2>
            <motion.div
              key={matchState.khoi_dong.prepCountdown ?? 3}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-8xl font-black font-mono text-emerald-400 drop-shadow-[0_0_35px_rgba(16,185,129,0.8)]"
            >
              {matchState.khoi_dong.prepCountdown ?? 3}
            </motion.div>
            <p className="text-slate-400 text-xs">Chuẩn bị đọc câu hỏi!</p>
          </div>
        </div>
      )}

      {/* MC Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 border border-teal-500/20 rounded-lg text-teal-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-md font-bold text-white tracking-tight">Màn hình Người dẫn chương trình (MC)</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Thời gian thực • Chuẩn luật Olympia 26</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 border border-slate-800 rounded-lg text-slate-400">
            <Clock className="w-4 h-4 text-teal-400" />
            Bảng điều phối: <strong className="text-white font-mono">{matchState?.matchCode || 'Chưa nạp'}</strong>
          </span>
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${isConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400'}`}>
            {isConnected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </header>

      {/* MC Core Layout split into columns */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT MAIN AREA: Question, Media, Answer & Contestant Live Activities */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Main Question & Answer Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            {round === 'KHOI_DONG' && !matchState?.khoi_dong?.isConfirmed ? (
              <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center text-center p-8 space-y-6 my-auto" id="mc-khoi-dong-unselected">
                {(() => {
                  const customSetting = matchState?.roundCustomSettings?.['KHOI_DONG'];
                  const customRoundLogo = customSetting?.customLogoUrl || customSetting?.logoUrl;
                  const roundName = customSetting?.customName?.trim() || 'KHỞI ĐỘNG';
                  return (
                    <>
                      {customRoundLogo && customRoundLogo !== 'none' && (
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-950 border-2 border-emerald-500/40 p-3 shadow-xl flex items-center justify-center">
                          <RoundLogoRenderer logoIdOrUrl={customRoundLogo} className="w-full h-full object-contain drop-shadow" />
                        </div>
                      )}
                      <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-white to-teal-300">
                        {roundName}
                      </h2>
                    </>
                  );
                })()}
              </div>
            ) : (
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                {(() => {
                  const customSetting = matchState?.roundCustomSettings?.[round];
                  const roundLogo = customSetting?.customLogoUrl || customSetting?.logoUrl;
                  return (
                    <span className="text-xs bg-slate-800 text-slate-300 font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-2">
                      {roundLogo && roundLogo !== 'none' && (
                        <div className="w-4 h-4 shrink-0">
                          <RoundLogoRenderer logoIdOrUrl={roundLogo} className="w-4 h-4" />
                        </div>
                      )}
                      <span>Vòng thi: {round}</span>
                    </span>
                  );
                })()}
                {isTimerRunning && (
                  <span className="text-xs bg-teal-500/10 text-teal-400 font-mono font-bold px-3 py-1 rounded-full border border-teal-500/20 animate-pulse">
                    ⏱️ THỜI GIAN: {matchState?.timerSeconds}s / {matchState?.timerTotal}s
                  </span>
                )}
              </div>

              {/* Massive Question Box for MC reading */}
              <div className="space-y-3 relative overflow-visible bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-inner">
                <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Nội dung câu hỏi phát sóng:</h3>
                {media?.url ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-3">
                    <UniversalMediaPlayer 
                      media={media} 
                      mediaControl={matchState?.mediaControl} 
                      largeMode={false}
                      round={round}
                      isTimerRunning={isTimerRunning}
                      hideControls={true}
                      className="w-full h-44 md:h-56 object-contain rounded-xl"
                    />
                    <div className="p-4 flex items-center justify-center min-h-[130px]">
                      <p className="text-base md:text-lg font-bold text-center leading-relaxed text-slate-100">
                        {question}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="min-h-[100px] flex items-center justify-center pb-3">
                    <p className="text-lg md:text-xl font-bold text-center leading-relaxed text-slate-100">
                      {question}
                    </p>
                  </div>
                )}

                {/* 3s Large Number Countdown Badge at Bottom-Right */}
                {(matchState?.khoi_dong?.threeSecCountdown ?? 0) > 0 && (
                  <div className="absolute bottom-4 right-5 bg-amber-500/30 border-2 border-amber-400 text-amber-300 font-mono font-black text-2xl md:text-3xl px-4 py-1.5 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center animate-pulse z-30 pointer-events-none min-w-[52px]">
                    {matchState?.khoi_dong?.threeSecCountdown}
                  </div>
                )}

                {/* Smooth Timer Bar for MC */}
                {isTimerRunning && (
                  <SmoothTimerBar
                    seconds={matchState?.timerSeconds ?? 0}
                    total={matchState?.timerTotal || 60}
                    isRunning={isTimerRunning}
                    className="absolute bottom-0 left-0 right-0 border-t border-slate-800/80 z-30"
                    heightClass="h-2.5"
                  />
                )}
              </div>

              {/* Correct Answer Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-1">
                  <h4 className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Đáp án đúng của Ban cố vấn:</h4>
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-sm font-bold text-emerald-300 uppercase font-mono">{answer}</span>
                  </div>
                </div>

                {extra && (
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Chú thích / Lĩnh vực:</h4>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-xs">
                      {extra}
                    </div>
                  </div>
                )}
              </div>
            </div>
            )}
          </div>

          {/* VCNV MC Real-time Overview Panel */}
          {round === 'VCNV' && (
            <div className="bg-slate-900 border-2 border-amber-500/40 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg text-sm">🧩</span>
                  <h3 className="text-sm font-extrabold uppercase tracking-wide text-white">
                    Thông Tin Chướng Ngại Vật (Real-time MC)
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-amber-300 bg-amber-500/15 px-3 py-1.5 rounded-xl border border-amber-500/30">
                    Đáp án CNV: <u className="no-underline text-white font-black">{matchQuestions?.vuot_chuong_ngai_vat?.tu_khoa_chinh || '---'}</u>
                    {matchQuestions?.vuot_chuong_ngai_vat?.tu_khoa_chinh && (
                      <span className="ml-1 text-amber-400 font-normal">
                        ({matchQuestions.vuot_chuong_ngai_vat.tu_khoa_chinh.replace(/\s+/g, '').length} ký tự)
                      </span>
                    )}
                  </span>
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase ${
                    matchState?.vcnv?.cnvSolved
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {matchState?.vcnv?.cnvSolved ? 'Đã giải' : 'Chưa giải'}
                  </span>
                </div>
              </div>

              {/* 5 Hàng Ngang & Đáp Án */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                  Các Hàng Ngang & Đáp Án Tương Ứng:
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {([1, 2, 3, 4, 5] as const).map((id) => {
                    const questionItem = matchQuestions?.vuot_chuong_ngai_vat?.hang_ngang?.find((h: any) => h.id === id);
                    const rowState = matchState?.vcnv?.rows?.[id];
                    const isSelected = matchState?.vcnv?.selectedRow === id;

                    return (
                      <div 
                        key={id}
                        className={`p-3 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs transition-all ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500/70 text-white font-semibold shadow-md shadow-amber-500/5'
                            : rowState?.isAnswered
                            ? rowState?.isCorrect === false
                              ? 'bg-slate-950/80 border-slate-800 text-slate-500 line-through'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded font-black flex items-center justify-center shrink-0 text-xs ${
                            isSelected ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {id}
                          </span>
                          <div>
                            <div className="font-extrabold text-slate-200">
                              Hàng ngang {id} ({questionItem?.so_ky_tu || questionItem?.dap_an?.replace(/\s+/g, '')?.length || '?' } ký tự)
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                          <div className="text-right">
                            <span className="text-[9px] text-slate-500 block uppercase">Đáp án</span>
                            <span className="font-mono font-bold text-amber-300 uppercase text-xs">
                              {questionItem?.dap_an || '---'}
                            </span>
                          </div>
                          <span className={`text-[10px] px-2.5 py-1 rounded-md font-extrabold uppercase ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 animate-pulse'
                              : rowState?.isAnswered
                              ? rowState?.isCorrect !== false ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-slate-800 text-slate-500'
                          }`}>
                            {isSelected ? 'Đang chọn' : rowState?.isAnswered ? (rowState?.isCorrect !== false ? 'Đã lật - Đúng' : 'Đã lật - Sai') : 'Chưa lật'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mảnh ghép góc hình ảnh & Ô Cam */}
              <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Trạng Thái Mảnh Ghép (Góc Ảnh & Ô Cam):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {([1, 2, 3, 4] as const).map((seg) => {
                    const isRevealed = matchState?.vcnv?.revealedSegments?.includes(seg);
                    const cornerNames = ['Góc 1 (T.Trái)', 'Góc 2 (T.Phải)', 'Góc 3 (D.Trái)', 'Góc 4 (D.Phải)'];
                    return (
                      <span
                        key={seg}
                        className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold ${
                          isRevealed
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-500'
                        }`}
                      >
                        {cornerNames[seg - 1]}: {isRevealed ? 'Đã mở' : 'Ẩn'}
                      </span>
                    );
                  })}
                  {(() => {
                    const isRevealed5 = matchState?.vcnv?.revealedSegments?.includes(5);
                    return (
                      <span
                        className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold ${
                          isRevealed5
                            ? 'bg-orange-500/30 border-orange-500/50 text-orange-300'
                            : 'bg-orange-950/40 border-orange-800/40 text-orange-400'
                        }`}
                      >
                        Mảnh 5 (Ô Cam): {isRevealed5 ? 'Đã mở' : 'Ẩn'}
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Tang Toc MC Real-time Overview Panel */}
          {round === 'TANG_TOC' && (
            <div className="bg-slate-900 border-2 border-purple-500/40 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-sm">⚡</span>
                  <h3 className="text-sm font-extrabold uppercase tracking-wide text-white">
                    Thông Tin Tăng Tốc (Real-time MC)
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold px-3 py-1 rounded-xl uppercase border ${
                    matchState?.tang_toc?.mode === 'IMPROVED'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                  }`}>
                    Chế độ: {matchState?.tang_toc?.mode === 'IMPROVED' ? 'CẢI TIẾN (Bấm chuông gợi ý)' : 'TRUYỀN THỐNG (Nhập đáp án)'}
                  </span>
                </div>
              </div>

              {matchState?.tang_toc?.mode === 'IMPROVED' ? (
                /* IMPROVED MODE HINTS & BUZZER TRACKING */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                      Trạng thái gợi ý đang mở:
                    </span>
                    <span className="text-xs font-mono font-bold text-purple-300 bg-purple-950 px-2.5 py-0.5 rounded border border-purple-800">
                      Gợi ý hiện tại: #{((matchState?.tang_toc?.currentHintIndex ?? 0) + 1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map((stt) => {
                      const qIdx = matchState?.tang_toc?.currentQuestionIndex ?? 0;
                      const caiTienQ = matchQuestions?.tang_toc?.cai_tien_cau_hoi?.[qIdx];
                      const maxHints = caiTienQ?.loai_cau_hoi === 4 ? 4 : 3;
                      if (stt > maxHints) return null;

                      const hintData = caiTienQ?.goi_y?.[stt - 1];
                      const isCurrent = (stt - 1) === (matchState?.tang_toc?.currentHintIndex ?? 0) && isTimerRunning;
                      const isRevealed = (stt - 1) <= (matchState?.tang_toc?.currentHintIndex ?? 0) || matchState?.tang_toc?.showExplanation;

                      return (
                        <div
                          key={stt}
                          className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between ${
                            isCurrent
                              ? 'bg-purple-950/80 border-purple-400 text-purple-200 ring-1 ring-purple-400/50'
                              : isRevealed
                              ? 'bg-slate-950 border-slate-800 text-slate-200'
                              : 'bg-slate-950/40 border-slate-900 text-slate-600'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-black text-[10px] uppercase text-purple-400">
                              #{stt} ({stt === 1 ? '+40đ' : stt === 2 ? '+30đ' : stt === 3 ? '+20đ' : '+10đ'})
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] font-black uppercase text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded animate-pulse">
                                Đang mở
                              </span>
                            )}
                          </div>
                          <p className="font-semibold leading-snug">
                            {isRevealed ? (hintData?.noi_dung || `(Gợi ý ${stt})`) : '••••••••••••'}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Active Buzzer Status */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Thí sinh bấm chuông:</span>
                    {matchState?.tang_toc?.buzzedPlayer ? (
                      <span className="px-2.5 py-1 bg-yellow-400 text-slate-950 font-black rounded-lg text-xs animate-bounce flex items-center gap-1">
                        🔔 Thí sinh {matchState.tang_toc.buzzedPlayer} ({matchState.players[matchState.tang_toc.buzzedPlayer as 1|2|3|4]?.name}) - Gợi ý #{((matchState.tang_toc.buzzedHintIndex ?? 0) + 1)} (+{getTangTocImprovedPoints(matchState.tang_toc.buzzedHintIndex ?? 0, matchQuestions?.tang_toc?.cai_tien_cau_hoi?.[matchState?.tang_toc?.currentQuestionIndex ?? 0]?.loai_cau_hoi || 3)}đ)
                      </span>
                    ) : (
                      <span className="text-slate-500 italic text-[11px]">Chưa có ai bấm chuông</span>
                    )}
                  </div>
                </div>
              ) : (
                /* TRADITIONAL MODE ANSWERS LISTING */
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                    Thứ tự gửi đáp án của thí sinh:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {([1, 2, 3, 4] as const).map((pos) => {
                      const player = matchState?.players?.[pos];
                      const ansObj = matchState?.tang_toc?.answers?.find((a) => a.playerPosition === pos);
                      return (
                        <div
                          key={pos}
                          className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-slate-800 rounded font-black text-[10px] text-white flex items-center justify-center">
                              {pos}
                            </span>
                            <span className="font-bold text-slate-300 max-w-[90px] truncate">
                              {player?.name || `Bàn ${pos}`}
                            </span>
                          </div>
                          <div className="text-right">
                            {ansObj ? (
                              <span className="font-mono font-bold text-amber-300">
                                "{ansObj.answer}" ({ansObj.timestamp}s)
                              </span>
                            ) : (
                              <span className="text-slate-600 italic">Chưa nhập</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: COMPACT SCOREBOARD & INTERNAL CHAT UNDERNEATH */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Scoreboard with integrated contestant answers in yellow */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>Bảng Điểm Thí Sinh</span>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Live Answers</span>
            </h3>

            <div className="space-y-2.5">
              {([1, 2, 3, 4] as const).map((pos) => {
                const player = matchState?.players[pos];
                const hasBuzzed = matchState?.buzzerState === 'BUZZED' && matchState?.buzzedPlayer === pos;
                const vcnvBuzzed = matchState?.vcnv?.cnvBuzzedPlayer === pos;
                const isCurrentTurn = (round === 'KHOI_DONG' && matchState?.khoi_dong?.isConfirmed && matchState?.khoi_dong?.subRound === 'INDIVIDUAL' && matchState?.khoi_dong?.currentPlayerIndex !== null && matchState?.khoi_dong?.currentPlayerIndex !== undefined && (matchState?.khoi_dong?.currentPlayerIndex + 1) === pos)
                  || (round === 'VE_DICH' && (matchState?.ve_dich?.currentPlayerIndex + 1) === pos);

                let liveAnswer = '';
                let timestampStr = '';
                if (round === 'VCNV' && matchState?.vcnv?.selectedRow) {
                  liveAnswer = matchState.vcnv.rows[matchState.vcnv.selectedRow]?.playerAnswers[pos] || '';
                } else if (round === 'TANG_TOC') {
                  const ansObj = matchState.tang_toc.answers.find(a => a.playerPosition === pos);
                  if (ansObj) {
                    liveAnswer = ansObj.answer;
                    timestampStr = `${ansObj.timestamp}s`;
                  }
                }

                // Default neutral theme vs active turn vs buzzed
                const cardTheme = (hasBuzzed || vcnvBuzzed)
                  ? 'bg-yellow-400/20 border-yellow-400 ring-2 ring-yellow-400 text-yellow-300'
                  : isCurrentTurn
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-300';

                return (
                  <div
                    key={pos}
                    className={`p-3 rounded-xl border ${cardTheme} transition-all space-y-2`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center shrink-0 ${
                          hasBuzzed || vcnvBuzzed
                            ? 'bg-yellow-400 text-slate-950 font-black'
                            : isCurrentTurn
                            ? 'bg-emerald-500 text-slate-950 font-black'
                            : 'bg-slate-800 text-white'
                        }`}>
                          {pos}
                        </div>
                        <h4 className="text-xs font-bold text-white truncate max-w-[110px]">
                          {player?.name || `Thí sinh ${pos}`}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCurrentTurn && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                            Đang thi
                          </span>
                        )}
                        {(hasBuzzed || vcnvBuzzed) && (
                          <span className="text-[9px] bg-yellow-400 text-slate-950 font-black px-2 py-0.5 rounded-full animate-bounce">
                            {vcnvBuzzed ? 'CNV!' : '🔔 Chuông!'}
                          </span>
                        )}
                        <strong className="text-base font-extrabold font-mono text-white">
                          {matchState?.currentRound === 'JEOPARDY' && matchState?.jeopardy?.scoringMode === 'SEPARATE'
                            ? (matchState?.jeopardy?.separateScores?.[pos as unknown as number] ?? 0)
                            : (player?.score ?? 0)}
                        </strong>
                      </div>
                    </div>

                    {/* Khởi động non-traditional stats */}
                    {round === 'KHOI_DONG' && matchState?.khoi_dong?.isConfirmed && (
                      (matchState?.khoi_dong?.subRound === 'INDIVIDUAL'
                        ? matchState?.khoi_dong?.individualScoringMode
                        : matchState?.khoi_dong?.collectiveScoringMode) !== 'TRADITIONAL'
                    ) && (
                      <div className="flex items-center justify-between text-[10px] bg-slate-950/80 px-2 py-1 rounded border border-slate-800 font-mono">
                        <span className="text-emerald-400 font-bold">Đ: {matchState?.khoi_dong?.playerStats?.[pos]?.correct ?? 0}</span>
                        <span className="text-rose-400 font-bold">S: {matchState?.khoi_dong?.playerStats?.[pos]?.wrong ?? 0}</span>
                        <span className="text-amber-400 font-bold">BQ: {matchState?.khoi_dong?.playerStats?.[pos]?.skip ?? 0}</span>
                        <span className="text-sky-400 font-bold">T: {matchState?.khoi_dong?.playerStats?.[pos]?.total ?? 0}</span>
                      </div>
                    )}

                    {/* Về Đích chosen package indicator */}
                    {round === 'VE_DICH' && matchState?.ve_dich?.turns?.[pos]?.chosenPackage?.length > 0 && (
                      <div className="flex items-center justify-between text-[10px] bg-slate-950/80 px-2 py-1 rounded border border-slate-800 font-mono">
                        <span className="text-amber-400 font-bold">Gói: {matchState.ve_dich.turns[pos].chosenPackage.map(p => `${p.points}đ`).join('-')}</span>
                        {matchState.ve_dich.turns[pos].starUsed && (
                          <span className="text-yellow-400 font-bold">⭐ NSHV</span>
                        )}
                      </div>
                    )}
                    {liveAnswer && (
                      <div className="p-2 bg-yellow-500/15 border border-yellow-500/40 rounded-lg flex items-center justify-between text-yellow-400 font-mono font-bold text-xs shadow-sm">
                        <span className="truncate">"{liveAnswer}"</span>
                        {timestampStr && (
                          <span className="text-[10px] text-yellow-400/90 bg-slate-900/80 px-1.5 py-0.5 rounded font-mono shrink-0 ml-1">
                            ⏱️ {timestampStr}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* INTERNAL CHAT MC & ADMIN (POSITIONED ON THE RIGHT UNDER SCOREBOARD) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex-1 flex flex-col min-h-[320px]">
            <div className="pb-2 border-b border-slate-800 flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Nội Bộ Chat MC & Admin</span>
            </div>

            {/* Message Feed */}
            <div className="flex-1 p-2 bg-slate-950 border border-slate-800/80 rounded-xl overflow-y-auto space-y-2 text-xs mb-3 max-h-[220px]">
              {chatMessages.length === 0 ? (
                <div className="text-center text-slate-600 italic py-8 text-[11px]">Không có tin nhắn nội bộ nào.</div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-1.5 ${msg.sender === 'MC' ? 'justify-end' : ''}`}>
                    <div className={`p-2 rounded-lg max-w-[220px] ${
                      msg.sender === 'MC' 
                        ? 'bg-teal-500/10 border border-teal-500/20 text-teal-200' 
                        : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-200'
                    }`}>
                      <strong className="text-[8px] uppercase tracking-wider block mb-0.5 font-bold">
                        {msg.sender === 'MC' ? 'Tôi (MC)' : 'Admin'}
                      </strong>
                      <p className="text-[11px] leading-tight">{msg.text}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Nhắn cho Admin..."
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-lg px-3 py-1.5 text-xs focus:outline-none transition-all text-white"
              />
              <button
                type="submit"
                className="bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 px-3 rounded-lg text-teal-300 flex items-center justify-center cursor-pointer transition-all"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* LARGE POPUP MODAL FOR EXTERNAL MEDIA IN MC VIEW */}
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-[9999] p-4"
              >
                <motion.div
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  className="bg-slate-900 border border-teal-500/40 rounded-2xl w-full max-w-4xl p-4 shadow-2xl space-y-3 flex flex-col max-h-[90vh]"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 px-1">
                    <span className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-2">
                      🎬 Media Ngoài: {extMedia.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20 px-2 py-0.5 rounded uppercase">
                      {extMedia.type}
                    </span>
                  </div>

                  <div className="flex-1 overflow-hidden flex items-center justify-center bg-black rounded-xl p-1 min-h-[300px]">
                    <UniversalMediaPlayer
                      media={{ url: extMedia.url, type: (extMedia.type || 'video').toLowerCase() as any }}
                      mediaControl={{ isPlaying: extMedia.isPlaying, key: extMedia.key }}
                      className="max-h-[75vh] w-full object-contain mx-auto"
                      largeMode={true}
                      hideControls={false}
                    />
                  </div>
                </motion.div>
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
