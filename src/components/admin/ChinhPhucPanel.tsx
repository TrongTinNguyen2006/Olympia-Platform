import React from 'react';
import { MatchState, SocketEvent, ChinhPhucQuestion, PlayerColor } from '../../types.js';
import { Play, Check, X, Shield, RefreshCw, Award, ArrowRight, Sparkles, Clock, Lock, Eye, EyeOff, SlidersHorizontal, CheckCircle2, UserCheck, RotateCcw, Square } from 'lucide-react';
import HelpTip from './HelpTip.js';
import RoundSoundPanel from './RoundSoundPanel.js';

interface ChinhPhucPanelProps {
  matchState: MatchState;
  adminCommand: (event: string, data?: any) => void;
  matchQuestions?: any;
}

const PLAYER_COLOR_CLASSES: Record<PlayerColor, { bg: string; text: string; border: string; hex: string; ring: string }> = {
  RED: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500', hex: '#ef4444', ring: 'ring-red-500/50' },
  YELLOW: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500', hex: '#f59e0b', ring: 'ring-amber-500/50' },
  BLUE: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500', hex: '#3b82f6', ring: 'ring-blue-500/50' },
  GREEN: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500', hex: '#10b981', ring: 'ring-emerald-500/50' },
};

const PLAYER_COLOR_NAMES: Record<PlayerColor, string> = {
  RED: 'Đỏ',
  YELLOW: 'Vàng',
  BLUE: 'Xanh Dương',
  GREEN: 'Xanh Lá',
};

const COLOR_SLOT_INFO: { color: PlayerColor; label: string; turnText: string }[] = [
  { color: 'RED', label: 'MÀU ĐỎ', turnText: 'LƯỢT 1' },
  { color: 'YELLOW', label: 'MÀU VÀNG', turnText: 'LƯỢT 2' },
  { color: 'BLUE', label: 'MÀU XANH DƯƠNG', turnText: 'LƯỢT 3' },
  { color: 'GREEN', label: 'MÀU XANH LÁ', turnText: 'LƯỢT 4' },
];

export default function ChinhPhucPanel({ matchState, adminCommand, matchQuestions }: ChinhPhucPanelProps) {
  const [selectedQuestionId, setSelectedQuestionId] = React.useState<string>('');
  const [draftQuestion, setDraftQuestion] = React.useState<ChinhPhucQuestion | null>(null);
  const [manualOrder, setManualOrder] = React.useState<number[]>([1, 2, 3, 4]);

  const cpState = matchState?.chinh_phuc;
  const gmdt = cpState?.gmdt;

  const [medCount, setMedCount] = React.useState<number>(cpState?.mediumCount || 10);
  const [hrdCount, setHrdCount] = React.useState<number>(cpState?.hardCount || 8);

  // Initialize / sync manualOrder and grid counts
  React.useEffect(() => {
    if (cpState?.colorOrder && cpState.colorOrder.length === 4) {
      setManualOrder(cpState.colorOrder);
    }
  }, [cpState?.colorOrder]);

  React.useEffect(() => {
    if (cpState?.mediumCount !== undefined) setMedCount(cpState.mediumCount);
    if (cpState?.hardCount !== undefined) setHrdCount(cpState.hardCount);
  }, [cpState?.mediumCount, cpState?.hardCount]);

  const handleApplyGridConfig = () => {
    const med = Math.max(6, Math.min(12, Number(medCount) || 10));
    const hrd = Math.max(6, Math.min(12, Number(hrdCount) || 8));
    adminCommand(SocketEvent.CHINH_PHUC_CONFIG_GRID, { mediumCount: med, hardCount: hrd });
  };

  const handleToggleAutoHideSymbols = (checked: boolean) => {
    adminCommand(SocketEvent.CHINH_PHUC_SET_AUTO_HIDE_SYMBOLS, { autoHide: checked });
  };

  const handleManualToggleSymbolsHidden = () => {
    adminCommand(SocketEvent.CHINH_PHUC_TOGGLE_SYMBOLS_HIDDEN);
  };

  // Memoized lists of questions
  const deQuestions: ChinhPhucQuestion[] = matchQuestions?.chinh_phuc?.de_cau_hoi?.de || [];
  const tbQuestions: ChinhPhucQuestion[] = matchQuestions?.chinh_phuc?.de_cau_hoi?.trung_binh || [];
  const khoQuestions: ChinhPhucQuestion[] = matchQuestions?.chinh_phuc?.de_cau_hoi?.kho || [];

  const allQuestions = React.useMemo(() => {
    return [
      ...deQuestions.map((q, i) => ({ ...q, id: q.id || `de_${i}`, muc_diem: q.muc_diem || 10 })),
      ...tbQuestions.map((q, i) => ({ ...q, id: q.id || `tb_${i}`, muc_diem: q.muc_diem || 20 })),
      ...khoQuestions.map((q, i) => ({ ...q, id: q.id || `kho_${i}`, muc_diem: q.muc_diem || 30 })),
    ];
  }, [deQuestions, tbQuestions, khoQuestions]);

  // Sync draft question when cell index or selected question changes
  React.useEffect(() => {
    if (!cpState) return;
    if (cpState.selectedCellIndex !== null) {
      if (cpState.selectedQuestion) {
        setDraftQuestion(cpState.selectedQuestion);
        setSelectedQuestionId(cpState.selectedQuestion.id || '');
      } else {
        const cell = cpState.board[cpState.selectedCellIndex];
        const diff = cell?.difficulty || 'EASY';
        let candidateList = deQuestions;
        if (diff === 'MEDIUM') candidateList = tbQuestions;
        else if (diff === 'HARD') candidateList = khoQuestions;

        if (candidateList.length > 0) {
          const firstQ = candidateList[0];
          setDraftQuestion(firstQ);
          setSelectedQuestionId(firstQ.id || '');
        } else if (allQuestions.length > 0) {
          setDraftQuestion(allQuestions[0]);
          setSelectedQuestionId(allQuestions[0].id || '');
        }
      }
    } else {
      setDraftQuestion(null);
      setSelectedQuestionId('');
    }
  }, [cpState?.selectedCellIndex, cpState?.selectedQuestion, deQuestions, tbQuestions, khoQuestions, allQuestions]);

  if (!cpState) return null;

  const activePos = cpState.activePlayerPosition || 1;
  const activePlayer = matchState.players[activePos as 1|2|3|4];
  const activeColor = cpState.playerColors[activePos] || 'RED';

  const handleSelectColorMethod = (method: 'HIGH_TO_LOW' | 'LOW_TO_HIGH' | 'GMDT' | 'MANUAL') => {
    adminCommand(SocketEvent.CHINH_PHUC_SET_COLOR_METHOD, { method });
  };

  const handleManualSlotChange = (slotIndex: number, newPlayerPos: number) => {
    const nextOrder = [...manualOrder];
    const existingIndex = nextOrder.indexOf(newPlayerPos);
    if (existingIndex !== -1 && existingIndex !== slotIndex) {
      // Swap positions
      const oldPlayerAtSlot = nextOrder[slotIndex];
      nextOrder[existingIndex] = oldPlayerAtSlot;
    }
    nextOrder[slotIndex] = newPlayerPos;
    setManualOrder(nextOrder);
  };

  const handleConfirmManualColors = () => {
    adminCommand(SocketEvent.CHINH_PHUC_SET_MANUAL_COLORS, { order: manualOrder, confirm: true });
  };

  const handleRevealNextColor = () => {
    adminCommand(SocketEvent.CHINH_PHUC_REVEAL_NEXT_COLOR);
  };

  const handleToggleColorSlot = (slotIndex: number) => {
    const isCurrentlyRevealed = cpState.colorRevealedSlots?.[slotIndex] ?? (slotIndex < cpState.colorRevealedCount);
    adminCommand(SocketEvent.CHINH_PHUC_REVEAL_COLOR_SLOT, { slotIndex, revealed: !isCurrentlyRevealed });
  };

  const handleRevealAllColors = () => {
    [0, 1, 2, 3].forEach((idx) => {
      adminCommand(SocketEvent.CHINH_PHUC_REVEAL_COLOR_SLOT, { slotIndex: idx, revealed: true });
    });
  };

  const handleHideAllColors = () => {
    [0, 1, 2, 3].forEach((idx) => {
      adminCommand(SocketEvent.CHINH_PHUC_REVEAL_COLOR_SLOT, { slotIndex: idx, revealed: false });
    });
  };

  const handleResetColorMethod = () => {
    adminCommand(SocketEvent.CHINH_PHUC_RESET_COLOR_METHOD);
  };

  const handleShowBoard = () => {
    adminCommand(SocketEvent.CHINH_PHUC_SHOW_BOARD);
  };

  const handleStartTactical = () => {
    adminCommand(SocketEvent.CHINH_PHUC_START_TACTICAL_10S);
  };

  const handleRevealAll = () => {
    adminCommand(SocketEvent.CHINH_PHUC_REVEAL_ALL_CELLS);
  };

  const handleStartRound = () => {
    adminCommand(SocketEvent.CHINH_PHUC_START_ROUND);
  };

  const handleSelectCell = (cellIndex: number) => {
    adminCommand(SocketEvent.CHINH_PHUC_SELECT_CELL, { cellIndex });
  };

  const handleSelectQuestionFromDropList = (qId: string) => {
    setSelectedQuestionId(qId);
    const found = allQuestions.find((q) => q.id === qId);
    if (found) {
      setDraftQuestion(found);
    }
  };

  const handleShowQuestion = () => {
    if (draftQuestion) {
      adminCommand(SocketEvent.CHINH_PHUC_SHOW_QUESTION, { question: draftQuestion });
    } else {
      adminCommand(SocketEvent.CHINH_PHUC_SHOW_QUESTION);
    }
  };

  const handleStartTimer = (mode: 'TRADITIONAL' | 'IMPROVED') => {
    adminCommand(SocketEvent.CHINH_PHUC_START_TIMER, { mode });
  };

  const handleGrade = (isCorrect: boolean) => {
    adminCommand(SocketEvent.CHINH_PHUC_GRADE_ANSWER, { isCorrect });
  };

  const handleNextTurn = () => {
    adminCommand(SocketEvent.CHINH_PHUC_NEXT_TURN);
  };

  const handleEndRound = () => {
    adminCommand(SocketEvent.CHINH_PHUC_END_ROUND);
  };

  // GMĐT controls
  const handleSetGMDTStep = (step: any) => {
    adminCommand(SocketEvent.GMDT_SET_STEP, { step });
  };

  const revealedCount = cpState.colorRevealedSlots ? cpState.colorRevealedSlots.filter(Boolean).length : (cpState.colorRevealedCount || 0);

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
              VÒNG 5 - CHINH PHỤC
            </span>
            <HelpTip content="Vòng thi Chinh phục: Bảng 6x6 (36 ô) với 18 ô Dễ (10đ), 10 ô TB (20đ), 8 ô Khó (30đ). Thí sinh có màu sắc riêng và chọn ô trả lời." />
          </div>
          <h2 className="text-xl font-black text-white mt-1">ĐIỀU KHIỂN VÒNG THI CHINH PHỤC</h2>
        </div>

        {/* RIGHT HEADER ACTIONS */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* COLOR ASSIGNMENT METHOD STATUS */}
          <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Xác định màu sắc:</span>
            {cpState.colorMethod ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/20">
                  {cpState.colorMethod === 'HIGH_TO_LOW' && 'Điểm Cao → Thấp'}
                  {cpState.colorMethod === 'LOW_TO_HIGH' && 'Điểm Thấp → Cao'}
                  {cpState.colorMethod === 'GMDT' && 'Giải Mã Điện Thoại'}
                  {cpState.colorMethod === 'MANUAL' && 'Thủ Công (Admin gán)'}
                </span>
                {!cpState.isBoardShown && (
                  <button
                    onClick={handleResetColorMethod}
                    title="Chọn lại phương thức định danh màu"
                    className="p-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer px-2"
                  >
                    <RotateCcw className="w-3 h-3" /> Đổi cách
                  </button>
                )}
              </div>
            ) : (
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 animate-pulse">
                Chưa chọn
              </span>
            )}
          </div>

          {/* FINISH ROUND BUTTON */}
          <button
            onClick={handleEndRound}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg flex items-center gap-1.5 cursor-pointer ring-1 ring-rose-400/40 active:scale-95"
            title="Kết thúc vòng thi Chinh Phục & Phát nhạc hoàn thành"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Kết Thúc Vòng Thi</span>
          </button>
        </div>
      </div>

      {/* STEP 1: COLOR METHOD ASSIGNMENT (4 MODES) */}
      {!cpState.colorMethod && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            1. Chọn Phương Thức Xác Định Màu Sắc Cho Thí Sinh
          </h3>
          <p className="text-xs text-slate-400">
            Quy ước màu sắc chuẩn Olympia: <strong>Đỏ (Lượt 1)</strong> → <strong>Vàng (Lượt 2)</strong> → <strong>Xanh Dương (Lượt 3)</strong> → <strong>Xanh Lá (Lượt 4)</strong>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <button
              onClick={() => handleSelectColorMethod('HIGH_TO_LOW')}
              className="p-4 bg-slate-950 border border-slate-800 hover:border-blue-500/50 rounded-xl text-left transition-all hover:bg-blue-950/20 cursor-pointer group"
            >
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">CÁCH 1</span>
              <h4 className="text-sm font-bold text-white mt-2 group-hover:text-blue-300">Điểm Cao Đến Thấp</h4>
              <p className="text-[11px] text-slate-400 mt-1">Xếp hạng theo điểm hiện tại giảm dần.</p>
            </button>

            <button
              onClick={() => handleSelectColorMethod('LOW_TO_HIGH')}
              className="p-4 bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left transition-all hover:bg-amber-950/20 cursor-pointer group"
            >
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">CÁCH 2</span>
              <h4 className="text-sm font-bold text-white mt-2 group-hover:text-amber-300">Điểm Thấp Đến Cao</h4>
              <p className="text-[11px] text-slate-400 mt-1">Xếp hạng theo điểm hiện tại tăng dần.</p>
            </button>

            <button
              onClick={() => handleSelectColorMethod('GMDT')}
              className="p-4 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-left transition-all hover:bg-emerald-950/20 cursor-pointer group"
            >
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">CÁCH 3</span>
              <h4 className="text-sm font-bold text-white mt-2 group-hover:text-emerald-300">Giải Mã Điện Thoại (GMĐT)</h4>
              <p className="text-[11px] text-slate-400 mt-1">Thi mini-game bàn phím T9 để phân định.</p>
            </button>

            <button
              onClick={() => handleSelectColorMethod('MANUAL')}
              className="p-4 bg-slate-950 border border-slate-800 hover:border-purple-500/50 rounded-xl text-left transition-all hover:bg-purple-950/20 cursor-pointer group ring-1 ring-purple-500/20"
            >
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">CÁCH 4</span>
              <h4 className="text-sm font-bold text-white mt-2 group-hover:text-purple-300">Thủ Công (Admin gán)</h4>
              <p className="text-[11px] text-slate-400 mt-1">Admin tự gán màu sắc và chốt thứ tự.</p>
            </button>
          </div>
        </div>
      )}

      {/* MANUAL COLOR ASSIGNMENT FORM (WHEN IN MANUAL MODE AND NOT YET CONFIRMED) */}
      {cpState.colorMethod === 'MANUAL' && !cpState.colorConfirmed && !cpState.isBoardShown && (
        <div className="bg-slate-900 border-2 border-purple-500/40 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-purple-400" />
                Gán Thủ Công Màu Sắc Cho Thí Sinh
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Lựa chọn thí sinh đứng ở từng vị trí màu sắc (Lượt 1: Đỏ, Lượt 2: Vàng, Lượt 3: Xanh Dương, Lượt 4: Xanh Lá).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setManualOrder([1, 2, 3, 4])}
                className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all cursor-pointer"
              >
                Mặc định 1-2-3-4
              </button>
              <button
                type="button"
                onClick={() => {
                  const sorted = [1, 2, 3, 4].sort((a, b) => {
                    const scoreA = matchState.players[a as 1|2|3|4]?.score || 0;
                    const scoreB = matchState.players[b as 1|2|3|4]?.score || 0;
                    return scoreB - scoreA;
                  });
                  setManualOrder(sorted);
                }}
                className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all cursor-pointer"
              >
                Theo điểm cao → thấp
              </button>
            </div>
          </div>

          {/* 4 COLOR SLOTS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {COLOR_SLOT_INFO.map((slot, idx) => {
              const assignedPos = manualOrder[idx] || (idx + 1);
              const assignedPlayer = matchState.players[assignedPos as 1|2|3|4];
              const colorInfo = PLAYER_COLOR_CLASSES[slot.color];

              return (
                <div
                  key={slot.color}
                  className={`p-4 rounded-2xl border-2 ${colorInfo.bg} ${colorInfo.border} flex flex-col justify-between space-y-4 shadow-lg`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-slate-950/80 px-2 py-0.5 rounded border border-white/10 text-white">
                      {slot.turnText}
                    </span>
                    <span className={`text-xs font-black ${colorInfo.text}`}>
                      {slot.label}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Chọn Thí Sinh:</label>
                    <select
                      value={assignedPos}
                      onChange={(e) => handleManualSlotChange(idx, Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 hover:border-white rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                    >
                      {[1, 2, 3, 4].map((p) => {
                        const pl = matchState.players[p as 1|2|3|4];
                        return (
                          <option key={p} value={p}>
                            Bàn {p}: {pl?.name || `Thí sinh ${p}`} ({pl?.score || 0})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="bg-slate-950/90 rounded-xl p-2.5 text-center border border-white/5">
                    <div className="text-xs font-bold text-white truncate">
                      {assignedPlayer?.name || `Bàn ${assignedPos}`}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Vị trí Bàn #{assignedPos} • {assignedPlayer?.score || 0}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CONFIRM BUTTON */}
          <div className="pt-2">
            <button
              onClick={handleConfirmManualColors}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm tracking-wide cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              CHỐT THỨ TỰ MÀU SẮC & HIỂN THỊ
            </button>
          </div>
        </div>
      )}

      {/* MINI-GAME GMĐT CONTROL PANEL */}
      {cpState.colorMethod === 'GMDT' && !cpState.isBoardShown && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              ĐIỀU KHIỂN MINI-GAME "GIẢI MÃ ĐIỆN THOẠI"
            </h3>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full font-bold">
              Bước hiện tại: {gmdt?.step}
            </span>
          </div>

          {/* GMĐT STEPS BUTTONS */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <button
              onClick={() => handleSetGMDTStep('GIAO_DIEN')}
              className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                gmdt?.step === 'GIAO_DIEN' ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              1. Hiển thị Giao diện
            </button>

            <button
              onClick={() => handleSetGMDTStep('MAT_MA')}
              className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                gmdt?.step === 'MAT_MA' ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              2. Hiển thị Mật mã
            </button>

            <button
              onClick={() => handleSetGMDTStep('GOI_Y')}
              className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                gmdt?.step === 'GOI_Y' ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              3. Hiển thị Gợi ý
            </button>

            <button
              onClick={() => handleSetGMDTStep('DEM_GIO')}
              className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                gmdt?.step === 'DEM_GIO' ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              4. Đếm giờ 60s
            </button>

            <button
              onClick={() => handleSetGMDTStep('DAP_AN')}
              className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                gmdt?.step === 'DAP_AN' ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              5. Công bố Đáp án
            </button>

            <button
              onClick={() => handleSetGMDTStep('KET_QUA')}
              className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                gmdt?.step === 'KET_QUA' ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              6. Công bố Kết quả
            </button>
          </div>

          {/* GMĐT INFO & REAL-TIME PLAYER PROGRESS */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500">Mật mã:</span> <span className="font-mono font-bold text-amber-400">{gmdt?.matMa}</span>
              </div>
              <div>
                <span className="text-slate-500">Gợi ý:</span> <span className="font-bold text-white">{gmdt?.goiY}</span>
              </div>
              <div>
                <span className="text-slate-500">Đáp án đúng:</span> <span className="font-bold text-emerald-400">{gmdt?.dapAnDung}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              {[1, 2, 3, 4].map((pos) => {
                const prog = gmdt?.playerProgress[pos];
                const player = matchState.players[pos as 1|2|3|4];
                return (
                  <div key={pos} className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{player?.name || `Bàn ${pos}`}</span>
                      {prog?.isCorrect === true && <span className="text-emerald-400 font-bold">ĐÚNG</span>}
                      {prog?.isCorrect === false && <span className="text-red-400 font-bold">SAI</span>}
                      {prog?.isCorrect === null && <span className="text-slate-500">Chưa gửi</span>}
                    </div>
                    <div className="text-xs font-mono tracking-widest text-blue-400">
                      {prog?.inputChars.join('') || '-------'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: COLOR ORDER REVEAL PHASE CONTROLS (HIỂN THỊ THỨ TỰ TỪNG Ô THEO QUY ƯỚC MÀU) */}
      {cpState.colorMethod &&
        (cpState.colorMethod !== 'GMDT' || gmdt?.step === 'KET_QUA') &&
        (cpState.colorMethod !== 'MANUAL' || cpState.colorConfirmed) &&
        !cpState.isBoardShown && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
            {/* STATUS HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    BƯỚC 2: CÔNG BỐ THỨ TỰ THI ĐẤU
                  </span>
                  <span className="text-xs text-slate-400">
                    Đã mở: <strong className="text-emerald-400 font-mono">{revealedCount}/4 ô</strong>
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">Điều Khiển Hiển Thị Thứ Tự Màu Sắc</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Nhấn nút "Hiển thị thứ tự" để mở lần lượt từng ô (Đỏ → Vàng → Xanh Dương → Xanh Lá) hoặc click trực tiếp vào ô tương ứng.
                </p>
              </div>

              {/* QUICK ACTIONS */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleRevealAllColors}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Hiện tất cả 4 ô
                </button>
                <button
                  onClick={handleHideAllColors}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <EyeOff className="w-3.5 h-3.5" /> Ẩn toàn bộ
                </button>
              </div>
            </div>

            {/* PRIMARY BUTTON: HIỂN THỊ THỨ TỰ LẦN LƯỢT */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <div className="text-xs font-bold text-white">Nút điều khiển hiển thị thứ tự:</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {revealedCount < 4
                    ? `Sẵn sàng mở ô tiếp theo: ${COLOR_SLOT_INFO[revealedCount]?.turnText} (${COLOR_SLOT_INFO[revealedCount]?.label})`
                    : 'Đã mở đầy đủ cả 4 ô thứ tự màu sắc!'}
                </div>
              </div>

              <button
                onClick={handleRevealNextColor}
                disabled={revealedCount >= 4}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm tracking-wide cursor-pointer ring-2 ring-blue-500/30"
              >
                <Sparkles className="w-4 h-4" />
                HIỂN THỊ THỨ TỰ (LẦN LƯỢT)
              </button>
            </div>

            {/* 4 COLOR PREVIEW CARDS (CLICKABLE TO TOGGLE) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {COLOR_SLOT_INFO.map((slot, idx) => {
                const pos = cpState.colorOrder[idx] || (idx + 1);
                const player = matchState.players[pos as 1|2|3|4];
                const colorInfo = PLAYER_COLOR_CLASSES[slot.color];
                const isRevealed = cpState.colorRevealedSlots?.[idx] ?? (idx < (cpState.colorRevealedCount || 0));

                return (
                  <div
                    key={slot.color}
                    onClick={() => handleToggleColorSlot(idx)}
                    className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden ${
                      isRevealed
                        ? `${colorInfo.bg} ${colorInfo.border} shadow-lg ${colorInfo.ring}`
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-slate-950/80 px-2 py-0.5 rounded border border-white/10 text-white">
                        {slot.turnText}
                      </span>
                      <span className={`text-xs font-black ${isRevealed ? colorInfo.text : 'text-slate-500'}`}>
                        {slot.label}
                      </span>
                    </div>

                    <div className="py-3 text-center space-y-1">
                      {isRevealed ? (
                        <>
                          <div className="text-base font-black text-white truncate">
                            {player?.name || `Bàn ${pos}`}
                          </div>
                          <div className="text-xs font-bold text-slate-300">
                            Bàn #{pos} • <span className="text-amber-400 font-mono">{player?.score || 0}</span>
                          </div>
                        </>
                      ) : (
                        <div className="py-2 flex flex-col items-center justify-center text-slate-500 gap-1">
                          <Lock className="w-5 h-5 opacity-40" />
                          <span className="text-xs font-bold">Chưa hiển thị</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] border-t border-white/10 pt-2 font-semibold">
                      <span className="text-slate-400">Trạng thái:</span>
                      <span className={isRevealed ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                        {isRevealed ? '● ĐANG HIỂN THỊ' : '○ ĐANG ẨN'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* BUTTON TO ENTER MAIN 6x6 BOARD */}
            <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={handleResetColorMethod}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                ← Chọn lại phương thức định danh
              </button>

              <button
                onClick={handleShowBoard}
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm tracking-wide cursor-pointer ring-2 ring-emerald-400/30"
              >
                <Play className="w-4 h-4 fill-current" />
                VÀO BẢNG 6x6 CHINH PHỤC
              </button>
            </div>
          </div>
        )}

      {/* STEP 3: MAIN BOARD CONTROL & TACTICAL PHASE */}
      {cpState.isBoardShown && (
        <div className="space-y-6">
          {/* SPLIT LAYOUT: LEFT BOARD (5 cols), RIGHT CONTROLS & GRADING (7 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* LEFT SIDE: COMPACT 6x6 GRID DISPLAY */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    BẢNG 6x6 CHINH PHỤC
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Click vào ô để chọn câu hỏi</p>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  Đã lật: <strong className="text-amber-400 font-mono">{cpState.tacticalRevealedCount}/36</strong>
                </span>
              </div>

              <div className="grid grid-cols-6 gap-2 max-w-[340px] mx-auto py-2">
                {cpState.board.map((cell, idx) => {
                  const isSelected = cpState.selectedCellIndex === idx;
                  const claimedPlayer = cell.claimedByPlayer;
                  const claimedColor = claimedPlayer ? cpState.playerColors[claimedPlayer] : null;

                  const isRevealed = idx < cpState.tacticalRevealedCount || cpState.tacticalRevealedCount >= 36;

                  let symbol = '';
                  if (isRevealed && !cpState.symbolsHidden) {
                    if (cell.difficulty === 'MEDIUM') symbol = '!';
                    else if (cell.difficulty === 'HARD') symbol = '?';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectCell(idx)}
                      className={`relative aspect-[1.4/1] rounded-lg border font-bold text-xs flex items-center justify-between transition-all cursor-pointer overflow-hidden p-1 ${
                        isSelected
                          ? 'border-white bg-blue-600 text-white ring-4 ring-blue-500/50 scale-105 z-10 shadow-lg'
                          : claimedColor
                          ? `${PLAYER_COLOR_CLASSES[claimedColor].bg} ${PLAYER_COLOR_CLASSES[claimedColor].border} text-white`
                          : isRevealed
                          ? 'bg-slate-950 border-slate-800 hover:border-blue-500/50 text-slate-200'
                          : 'bg-slate-950/40 border-slate-800/40 text-slate-600'
                      }`}
                    >
                      {isRevealed ? (
                        <>
                          <span className="absolute top-0.5 left-1 text-[10px] font-mono font-extrabold opacity-80 leading-none">
                            {cell.index}
                          </span>
                          {symbol && (
                            <span className="absolute right-1 top-1/2 -translate-y-1/2 text-xs font-black leading-none">
                              {symbol}
                            </span>
                          )}
                        </>
                      ) : (
                        <Lock className="w-3.5 h-3.5 opacity-30 text-slate-500 m-auto" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* SYMBOLS & BOARD CONFIGURATION */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                {/* ẨN KÝ HIỆU Ô */}
                <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      {cpState.symbolsHidden ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-blue-400" />}
                      Ký hiệu ô (! / ?)
                    </span>
                    {cpState.symbolsCountdownSecondsLeft > 0 ? (
                      <span className="text-[11px] font-black text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 animate-pulse">
                        Tự ẩn sau {cpState.symbolsCountdownSecondsLeft}s
                      </span>
                    ) : (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        cpState.symbolsHidden
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {cpState.symbolsHidden ? 'Đang ẩn ký hiệu' : 'Đang hiện ký hiệu'}
                      </span>
                    )}
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                    <input
                      type="checkbox"
                      checked={!!cpState.autoHideSymbolsAfter10s}
                      onChange={(e) => handleToggleAutoHideSymbols(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700 cursor-pointer"
                    />
                    <span>Ẩn ký hiệu sau 10s kể từ khi hiện đủ 36 ô</span>
                  </label>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleManualToggleSymbolsHidden}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                        cpState.symbolsHidden
                          ? 'bg-blue-600 hover:bg-blue-500 border-blue-400 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                      }`}
                    >
                      {cpState.symbolsHidden ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          Hiện lại ký hiệu ô
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          Ẩn ngay ký hiệu ô
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* CẤU HÌNH SỐ LƯỢNG CÂU HỎI TRUNG BÌNH / KHÓ */}
                <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                      Cấu trúc câu hỏi bảng 36 ô
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Dễ: <strong className="text-emerald-400 font-mono">{36 - medCount - hrdCount}</strong> ô
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[11px] text-slate-400 font-medium mb-1">
                        Trung bình (! - 20đ):
                      </label>
                      <input
                        type="number"
                        min={6}
                        max={12}
                        value={medCount}
                        onChange={(e) => setMedCount(Math.max(6, Math.min(12, parseInt(e.target.value) || 6)))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs font-bold focus:border-blue-500 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-500">Tối thiểu 6, tối đa 12</span>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 font-medium mb-1">
                        Khó (? - 30đ):
                      </label>
                      <input
                        type="number"
                        min={6}
                        max={12}
                        value={hrdCount}
                        onChange={(e) => setHrdCount(Math.max(6, Math.min(12, parseInt(e.target.value) || 6)))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs font-bold focus:border-blue-500 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-500">Tối thiểu 6, tối đa 12</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyGridConfig}
                    className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                    Áp dụng & Tạo lại bảng ô
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: CONTROLS, TIMER & GRADING */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* TACTICAL & TURN CONTROLS */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleStartTactical}
                      disabled={cpState.is10sTacticalRunning}
                      className="px-3 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow cursor-pointer flex items-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      10s Hiện Ô
                    </button>

                    <button
                      onClick={handleRevealAll}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Hiện Tất Cả Ô
                    </button>

                    <button
                      onClick={handleStartRound}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow cursor-pointer flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Bắt Đầu Lượt
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleNextTurn}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer border border-slate-700"
                    >
                      Lượt Tiếp →
                    </button>

                    <button
                      onClick={handleEndRound}
                      className="px-3 py-2 bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer border border-rose-500/50 shadow flex items-center gap-1.5"
                      title="Kết thúc vòng thi Chinh Phục"
                    >
                      <Square className="w-3 h-3 fill-current" />
                      Kết Thúc Vòng
                    </button>
                  </div>
                </div>

                {/* TURN STATUS DISPLAY */}
                <div className="flex items-center justify-between text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium">Vòng lượt: <strong className="text-white font-mono">{cpState.roundNumber}</strong></span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Đang đến lượt:</span>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-black text-white ${PLAYER_COLOR_CLASSES[activeColor].bg} border ${PLAYER_COLOR_CLASSES[activeColor].border}`}>
                      {activePlayer?.name || `Bàn ${activePos}`} ({PLAYER_COLOR_NAMES[activeColor]})
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTIVE QUESTION & GRADING PANEL */}
              {cpState.selectedCellIndex !== null ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                  {/* HEADER */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-xs font-black bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        Ô SỐ {cpState.selectedCellIndex + 1}
                      </span>
                      <span className="text-xs text-slate-400">
                        Mức độ: <strong className="text-amber-400 font-bold">
                          {cpState.board[cpState.selectedCellIndex]?.points || 10}đ ({cpState.board[cpState.selectedCellIndex]?.difficulty === 'EASY' ? 'Dễ' : cpState.board[cpState.selectedCellIndex]?.difficulty === 'MEDIUM' ? 'Trung Bình' : 'Khó'})
                        </strong>
                      </span>
                    </div>

                    {cpState.questionState !== 'IDLE' ? (
                      <span className="px-2.5 py-1 text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> ĐÃ HIỂN THỊ CÂU HỎI
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        ĐANG CHỜ CÔNG BỐ CÂU HỎI
                      </span>
                    )}
                  </div>

                  {/* DROP-LIST QUESTION SELECTOR */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Chọn câu hỏi từ danh sách (Drop-list):
                    </label>
                    <select
                      value={selectedQuestionId}
                      onChange={(e) => handleSelectQuestionFromDropList(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 hover:border-blue-500 rounded-xl px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="">-- Chọn câu hỏi từ kho câu hỏi --</option>
                      {deQuestions.length > 0 && (
                        <optgroup label="--- Câu hỏi Dễ (10đ) ---">
                          {deQuestions.map((q, idx) => (
                            <option key={q.id || `de_${idx}`} value={q.id || `de_${idx}`}>
                              [10đ] #{idx + 1}: {q.noi_dung}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {tbQuestions.length > 0 && (
                        <optgroup label="--- Câu hỏi Trung Bình (20đ) ---">
                          {tbQuestions.map((q, idx) => (
                            <option key={q.id || `tb_${idx}`} value={q.id || `tb_${idx}`}>
                              [20đ] #{idx + 1}: {q.noi_dung}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {khoQuestions.length > 0 && (
                        <optgroup label="--- Câu hỏi Khó (30đ) ---">
                          {khoQuestions.map((q, idx) => (
                            <option key={q.id || `kho_${idx}`} value={q.id || `kho_${idx}`}>
                              [30đ] #{idx + 1}: {q.noi_dung}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  {/* QUESTION PREVIEW */}
                  {draftQuestion ? (
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Xem trước nội dung câu hỏi (Chỉ Admin xem):</span>
                        <span className="font-bold text-amber-400">{draftQuestion.muc_diem || 10} ĐIỂM</span>
                      </div>
                      <div className="text-sm font-bold text-white leading-relaxed">
                        {draftQuestion.noi_dung}
                      </div>
                      <div className="text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                        Đáp án đúng: <strong className="text-emerald-400">{draftQuestion.dap_an_dung}</strong>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic text-center py-3 bg-slate-950/50 rounded-xl border border-slate-800">
                      Chưa chọn câu hỏi nào trong drop-list
                    </div>
                  )}

                  {/* ACTION BUTTON: HIỆN CÂU HỎI */}
                  <div className="pt-1">
                    <button
                      onClick={handleShowQuestion}
                      disabled={!draftQuestion}
                      className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        cpState.questionState !== 'IDLE'
                          ? 'bg-blue-600 hover:bg-blue-500 text-white'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white ring-2 ring-emerald-400/30'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Eye className="w-4 h-4" />
                      {cpState.questionState !== 'IDLE' ? 'Cập Nhật / Hiển Thị Lại Câu Hỏi' : 'HIỆN CÂU HỎI LÊN GIAO DIỆN'}
                    </button>
                  </div>

                  {/* TIMER & GRADING CONTROLS (AVAILABLE WHEN REVEALED OR READY) */}
                  {cpState.questionState !== 'IDLE' && (
                    <div className="border-t border-slate-800 pt-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-medium">Chế độ thời gian:</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStartTimer('TRADITIONAL')}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                              cpState.timeMode === 'TRADITIONAL' ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-950 text-slate-400 border-slate-800'
                            }`}
                          >
                            Truyền Thống (10s)
                          </button>
                          <button
                            onClick={() => handleStartTimer('IMPROVED')}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                              cpState.timeMode === 'IMPROVED' ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-950 text-slate-400 border-slate-800'
                            }`}
                          >
                            Cải Tiến (10/15/20s)
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <button
                          onClick={() => handleStartTimer(cpState.timeMode)}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Clock className="w-4 h-4" />
                          Tính Giờ ({cpState.timerSecondsLeft}s)
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleGrade(true)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            ĐÚNG (+{draftQuestion?.muc_diem || cpState.selectedQuestion?.muc_diem || 10}đ)
                          </button>

                          <button
                            onClick={() => handleGrade(false)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                            SAI (0đ)
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-2 text-slate-400">
                  <Sparkles className="w-6 h-6 mx-auto text-blue-400/50" />
                  <div className="text-xs font-medium">
                    Hãy click chọn 1 ô từ bảng 6x6 bên trái để bắt đầu chọn câu hỏi.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BẢNG ĐIỀU KHIỂN ÂM THANH CHINH PHỤC */}
      <RoundSoundPanel
        title="Bảng Điều Khiển Âm Thanh: Chinh Phục"
        accentColor="teal"
        columns={4}
        adminCommand={adminCommand}
        sounds={[
          { id: 'CP_Start', label: '1. Bắt đầu vòng thi' },
          { id: 'CP_Ambience1', label: '2. Nhạc nền 1' },
          { id: 'CP_Ambience2', label: '3. Nhạc nền 2' },
          { id: 'CP_10SecondsGrid', label: '4. 10s Hiện bảng' },
          { id: 'CP_TurnStart', label: '5. Bắt đầu lượt' },
          { id: 'CP_PickQuestion', label: '6. Chọn ô câu hỏi' },
          { id: 'CP_ShowQuestion', label: '7. Hiện câu hỏi' },
          { id: 'CP_10SecondsTimer', label: '8. Tính giờ 10s' },
          { id: 'CP_Right', label: '9. Trả lời đúng' },
          { id: 'CP_Wrong', label: '10. Trả lời sai' },
          { id: 'CP_Finish', label: '11. Kết thúc vòng' },
        ]}
      />
    </div>
  );
}
