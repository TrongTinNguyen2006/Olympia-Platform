import React from 'react';
import { MatchState, PlayerColor } from '../../types.js';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Sparkles, Trophy } from 'lucide-react';
import ChinhPhucGMDT from '../ChinhPhucGMDT.js';
import { RoundLogoRenderer } from '../common/RoundLogoAssets.js';
import RoundTitleScreen from '../common/RoundTitleScreen.js';

interface ChinhPhucViewProps {
  matchState: MatchState;
  isOverlay?: boolean;
}

const COLOR_MAP: Record<PlayerColor, { bg50: string; bg100: string; border: string; text50: string; text100: string; hex: string; ring: string; bgTint: string; textCol: string }> = {
  RED: {
    bg50: 'bg-red-600/50',
    bg100: 'bg-red-600',
    border: 'border-red-400',
    text50: 'text-red-100',
    text100: 'text-white',
    hex: '#ef4444',
    ring: 'ring-2 ring-white shadow-xl shadow-red-500/50',
    bgTint: 'bg-red-500/20 border-red-500/50',
    textCol: 'text-red-300',
  },
  YELLOW: {
    bg50: 'bg-amber-500/50',
    bg100: 'bg-amber-500',
    border: 'border-amber-300',
    text50: 'text-amber-100',
    text100: 'text-slate-950 font-extrabold',
    hex: '#f59e0b',
    ring: 'ring-2 ring-white shadow-xl shadow-amber-500/50',
    bgTint: 'bg-amber-500/20 border-amber-500/50',
    textCol: 'text-amber-300',
  },
  BLUE: {
    bg50: 'bg-blue-600/50',
    bg100: 'bg-blue-600',
    border: 'border-blue-400',
    text50: 'text-blue-100',
    text100: 'text-white',
    hex: '#3b82f6',
    ring: 'ring-2 ring-white shadow-xl shadow-blue-500/50',
    bgTint: 'bg-blue-500/20 border-blue-500/50',
    textCol: 'text-blue-300',
  },
  GREEN: {
    bg50: 'bg-emerald-600/50',
    bg100: 'bg-emerald-600',
    border: 'border-emerald-400',
    text50: 'text-emerald-100',
    text100: 'text-white',
    hex: '#10b981',
    ring: 'ring-2 ring-white shadow-xl shadow-emerald-500/50',
    bgTint: 'bg-emerald-500/20 border-emerald-500/50',
    textCol: 'text-emerald-300',
  },
};

export default function ChinhPhucView({ matchState, isOverlay }: ChinhPhucViewProps) {
  const cpState = matchState?.chinh_phuc;

  if (!cpState) return null;

  // 1. Initial screen: Only show round name and logo
  if (!cpState.isBoardShown && cpState.colorMethod === null) {
    if (isOverlay) return null;

    const customSetting = matchState?.roundCustomSettings?.['CHINH_PHUC'];
    const customRoundLogo = customSetting?.customLogoUrl || customSetting?.logoUrl;
    const roundName = customSetting?.customName?.trim() || 'CHINH PHỤC';

    return <RoundTitleScreen title={roundName} logoUrl={customRoundLogo} roundKey="CHINH_PHUC" id="chinh-phuc-viewer-intro" />;
  }

  // Render GMĐT mini-game if GMĐT step is running and board is not shown yet
  if (cpState.colorMethod === 'GMDT' && cpState.gmdt?.step !== 'KET_QUA' && !cpState.isBoardShown) {
    return <ChinhPhucGMDT matchState={matchState} isOverlay={isOverlay} />;
  }

  // 2. Render Turn Order Reveal Screen before board is shown
  if (!cpState.isBoardShown) {
    const slots = [
      { color: 'RED' as PlayerColor, turnText: '#1' },
      { color: 'YELLOW' as PlayerColor, turnText: '#2' },
      { color: 'BLUE' as PlayerColor, turnText: '#3' },
      { color: 'GREEN' as PlayerColor, turnText: '#4' },
    ];

    if (isOverlay) {
      return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[85vw] p-4 bg-slate-950/95 rounded-3xl border border-blue-900/80 backdrop-blur-md shadow-2xl z-50">
          <div className="text-center text-xs font-black uppercase tracking-widest text-blue-400 mb-2">
            THỨ TỰ THI ĐẤU VÒNG CHINH PHỤC
          </div>
          <div className="grid grid-cols-4 gap-3">
            {slots.map((slot, idx) => {
              const isRevealed = cpState.colorRevealedSlots?.[idx] ?? (idx < (cpState.colorRevealedCount || 0));
              const pos = cpState.colorOrder[idx] || (idx + 1);
              const player = matchState.players[pos as 1|2|3|4];
              const colorInfo = COLOR_MAP[slot.color];

              return (
                <div
                  key={slot.color}
                  className={`p-3 rounded-2xl border transition-all text-center ${
                    isRevealed
                      ? `${colorInfo.bg100} ${colorInfo.border} ${colorInfo.text100} shadow-lg ring-2 ring-white/50`
                      : 'bg-slate-900/80 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="text-[11px] font-black uppercase tracking-wider opacity-80">{slot.turnText}</div>
                  {isRevealed ? (
                    <>
                      <div className="text-xs font-black truncate mt-0.5">{player?.name || `Thí sinh ${pos}`}</div>
                      <div className="text-[10px] font-bold font-mono opacity-90">{player?.score || 0}</div>
                    </>
                  ) : (
                    <div className="text-xs font-bold py-1">???</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="w-full px-4 sm:px-8 py-6 space-y-6 bg-gradient-to-b from-blue-950/40 via-slate-900 to-slate-950 border border-blue-900/50 rounded-3xl shadow-2xl min-h-[480px] flex flex-col justify-between">
        {/* HEADER */}
        <div className="text-center space-y-2 border-b border-blue-900/40 pb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> VÒNG THI CHINH PHỤC
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-wide">
            CÔNG BỐ THỨ TỰ THI ĐẤU
          </h2>
        </div>

        {/* 4 REVEAL CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 my-auto py-4">
          {slots.map((slot, idx) => {
            const isRevealed = cpState.colorRevealedSlots?.[idx] ?? (idx < (cpState.colorRevealedCount || 0));
            const pos = cpState.colorOrder[idx] || (idx + 1);
            const player = matchState.players[pos as 1|2|3|4];
            const colorInfo = COLOR_MAP[slot.color];

            return (
              <motion.div
                key={slot.color}
                initial={false}
                animate={isRevealed ? { scale: [0.9, 1.03, 1], opacity: 1 } : { opacity: 0.8 }}
                transition={{ duration: 0.4 }}
                className={`relative rounded-3xl p-5 border-2 transition-all flex flex-col justify-between min-h-[200px] shadow-2xl overflow-hidden ${
                  isRevealed
                    ? `${colorInfo.bg100} ${colorInfo.border} ${colorInfo.text100} ${colorInfo.ring}`
                    : 'bg-slate-950/80 border-slate-800 text-slate-500 shadow-inner'
                }`}
              >
                {/* TOP BADGE */}
                <div className="flex items-center justify-start">
                  <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border ${
                    isRevealed ? 'bg-slate-950/60 text-white border-white/20' : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}>
                    {slot.turnText}
                  </span>
                </div>

                {/* MAIN CONTENT AREA: ONLY NAME AND SCORE */}
                <div className="text-center py-4 space-y-2 my-auto">
                  {isRevealed ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', damping: 12 }}
                      className="space-y-2"
                    >
                      <div className="text-xl sm:text-2xl font-black truncate drop-shadow-md">
                        {player?.name || `Thí sinh ${pos}`}
                      </div>
                      <div className="inline-block px-4 py-1 bg-slate-950/70 text-amber-300 rounded-xl text-lg sm:text-xl font-black font-mono border border-white/10 mt-1">
                        {player?.score || 0}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-2 py-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600 font-mono font-black text-xl animate-pulse">
                        ?
                      </div>
                      <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        Chờ công bố
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  const activePos = cpState.activePlayerPosition;
  const activePlayer = matchState.players[activePos];
  const isColorActive = cpState.colorMethod === 'HIGH_TO_LOW' || cpState.colorMethod === 'LOW_TO_HIGH' || cpState.gmdt?.step === 'KET_QUA' || cpState.isBoardShown;
  const activeColor = cpState.playerColors[activePos] || 'RED';
  const activeColorInfo = COLOR_MAP[activeColor];

  const displayOrder = isColorActive ? cpState.colorOrder : [1, 2, 3, 4];

  const selectedCellIndex = cpState.selectedCellIndex;
  const selectedCell = selectedCellIndex !== null && selectedCellIndex !== undefined ? cpState.board[selectedCellIndex] : null;

  let diffLabel = 'Dễ';
  let defaultPoints = 10;
  if (selectedCell) {
    if (selectedCell.difficulty === 'MEDIUM') {
      diffLabel = 'Trung Bình';
      defaultPoints = 20;
    } else if (selectedCell.difficulty === 'HARD') {
      diffLabel = 'Khó';
      defaultPoints = 30;
    }
  }
  const questionPoints = cpState.selectedQuestion?.muc_diem || defaultPoints;
  const activePlayerName = activePlayer?.name || `Bàn ${activePos}`;

  const timerSeconds = cpState.isTimerRunning
    ? Math.max(0, Math.ceil(cpState.timerSecondsLeft))
    : (cpState.timerSecondsLeft !== undefined && cpState.timerSecondsLeft !== null && cpState.timerSecondsLeft === 0)
    ? 0
    : (cpState.timerTotalSeconds || 10);

  // ---------------------------------------------------------
  // 1. OVERLAY LAYOUT (80% screen width at bottom)
  // ---------------------------------------------------------
  if (isOverlay) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[80vw] p-4 space-y-2.5 bg-slate-950/95 rounded-3xl border border-blue-900/80 backdrop-blur-md shadow-2xl z-50">
        {/* BANNER: THÍ SINH LỰA CHỌN CÂU HỎI X ĐIỂM NGAY TRÊN THANH ĐIỂM */}
        <AnimatePresence>
          {selectedCellIndex !== null && selectedCellIndex !== undefined && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              className={`px-4 py-2 rounded-2xl border text-sm sm:text-base font-extrabold text-center shadow-xl backdrop-blur-md transition-all ${
                isColorActive
                  ? `${activeColorInfo.bg100} ${activeColorInfo.border} ${activeColorInfo.text100} ring-2 ring-white/40`
                  : 'bg-indigo-600 border-indigo-400 text-white shadow-indigo-500/20'
              }`}
            >
              Thí sinh {activePlayerName} lựa chọn câu hỏi {questionPoints} điểm
            </motion.div>
          )}
        </AnimatePresence>

        {/* SCORE BAR FOR OVERLAY */}
        <div className="grid grid-cols-4 gap-3">
          {displayOrder.map((pos) => {
            const color = cpState.playerColors[pos];
            const player = matchState.players[pos as 1|2|3|4];
            const colorInfo = COLOR_MAP[color] || COLOR_MAP['RED'];
            const isActive = pos === activePos;

            return (
              <div
                key={pos}
                className={`px-3 py-2 rounded-2xl border transition-all flex items-center justify-between ${
                  isColorActive
                    ? `${colorInfo.border} ${
                        isActive
                          ? `${colorInfo.bg100} ${colorInfo.text100} ${colorInfo.ring}`
                          : `${colorInfo.bg50} ${colorInfo.text50}`
                      }`
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className="truncate">
                  <div className="text-xs font-black truncate max-w-[120px]">
                    {player?.name || `Bàn ${pos}`}
                  </div>
                </div>
                <div className="text-sm font-black font-mono">{player?.score || 0}</div>
              </div>
            );
          })}
        </div>

        {/* QUESTION DISPLAY & TIMER IN OVERLAY */}
        <AnimatePresence>
          {selectedCellIndex !== null && cpState.selectedQuestion && cpState.questionState !== 'IDLE' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-slate-900 border-2 border-blue-500/60 rounded-3xl p-4 shadow-2xl space-y-2.5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-black">
                    CÂU HỎI Ô SỐ {selectedCellIndex + 1}
                  </span>
                  <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                    {cpState.selectedQuestion.muc_diem} ĐIỂM
                  </span>
                </div>

                {/* COUNTDOWN TIMER: ONLY SHOWN WHEN RUNNING */}
                {cpState.isTimerRunning && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center justify-center gap-1.5 text-amber-300 font-mono font-black text-xl bg-amber-500/20 w-20 py-1 rounded-xl border border-amber-500/40 shadow-lg shadow-amber-500/10 tabular-nums"
                  >
                    <Clock className="w-5 h-5 text-amber-400" />
                    <span>{timerSeconds}</span>
                  </motion.div>
                )}
              </div>

              <div className="text-base sm:text-lg font-bold text-white text-center leading-relaxed py-1">
                {cpState.selectedQuestion.noi_dung}
              </div>

              {(cpState.questionState === 'ANSWERED_CORRECT' || cpState.questionState === 'ANSWERED_INCORRECT') && (
                <div className="text-center pt-2 border-t border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">Đáp án đúng:</span>
                  <div className="text-base font-black text-emerald-400 mt-0.5">
                    {cpState.selectedQuestion.dap_an_dung}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ---------------------------------------------------------
  // 2. VIEWER LAYOUT
  // - Main top grid (50% left = Question + Protruding Timer, 50% right = 6x6 Board)
  // - Bottom horizontal row = Contestant list with reduced card height
  // ---------------------------------------------------------

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 py-3 space-y-4 bg-gradient-to-b from-blue-950/40 via-slate-900 to-slate-950 border border-blue-900/50 rounded-3xl shadow-2xl">
      {/* HEADER BAR */}
      <div className="flex items-center justify-between border-b border-blue-900/40 pb-2.5">
        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs sm:text-sm font-black uppercase tracking-widest">
            VÒNG THI CHINH PHỤC
          </span>
          <h2 className="text-lg sm:text-2xl font-black text-white tracking-wide">
            BẢNG THI ĐẤU 6x6
          </h2>
        </div>

        <div className="flex items-center gap-2.5 bg-slate-950/80 px-4 py-1.5 rounded-2xl border border-blue-900/50 text-xs sm:text-sm">
          <span className="text-slate-400 font-bold">Lượt thi ({cpState.roundNumber}):</span>
          <span
            className={`px-3 py-1 rounded-lg font-black ${
              isColorActive
                ? `${COLOR_MAP[activeColor]?.bg100 || 'bg-red-600'} ${COLOR_MAP[activeColor]?.text100 || 'text-white'}`
                : 'bg-indigo-600 text-white'
            }`}
          >
            {activePlayer?.name || `Bàn ${activePos}`}
          </span>
        </div>
      </div>

      {/* TOP SECTION: 50% LEFT = QUESTION + PROTRUDING TIMER TAB, 50% RIGHT = 6x6 BOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch w-full">
        {/* LEFT 50%: ANNOUNCEMENT BANNER PUSHED UP + QUESTION CARD WITH PROTRUDING CLOCK TAB */}
        <div className="flex flex-col space-y-3 justify-between h-full">
          {/* ANNOUNCEMENT LINE IN ACTIVE PLAYER'S COLOR */}
          {selectedCellIndex !== null && selectedCellIndex !== undefined ? (
            <div className={`p-3 rounded-2xl border text-xs sm:text-sm font-extrabold text-center shadow-lg transition-all ${activeColorInfo.bgTint} ${activeColorInfo.textCol}`}>
              Thí sinh {activePlayerName} lựa chọn câu hỏi {questionPoints} điểm
            </div>
          ) : (
            <div className="p-3 rounded-2xl border border-blue-900/40 bg-slate-950/70 text-xs sm:text-sm font-bold text-center text-slate-400">
              Đang trong lượt thi của thí sinh {activePlayerName}
            </div>
          )}

          {/* QUESTION CARD (EXPANDED & PULLED UP WITH PROTRUDING CLOCK TAB) */}
          <div className="flex-1 flex flex-col justify-center relative pt-4">
            {selectedCellIndex !== null && selectedCellIndex !== undefined ? (
              cpState.selectedQuestion && cpState.questionState !== 'IDLE' ? (
                <div className="relative p-5 sm:p-6 bg-gradient-to-br from-indigo-950/90 via-slate-900 to-indigo-950/90 border-2 border-indigo-500/40 rounded-3xl shadow-2xl space-y-3 flex-1 flex flex-col justify-between">
                  {/* HALF-PROTRUDING CLOCK TAB IN TOP CENTER */}
                  <div className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 z-20">
                    <div className={`w-24 sm:w-28 h-9 sm:h-11 rounded-2xl border-2 shadow-2xl backdrop-blur-xl flex items-center justify-center gap-2 font-mono font-black text-lg sm:text-2xl tabular-nums transition-all ${
                      cpState.isTimerRunning && timerSeconds > 0
                        ? 'bg-slate-950 border-amber-400 text-amber-300 shadow-[0_0_25px_rgba(251,191,36,0.5)] ring-2 ring-amber-400/40'
                        : 'bg-slate-950 border-indigo-500/60 text-slate-300 shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                    }`}>
                      <Clock className={`w-4 h-4 sm:w-5 sm:h-5 ${cpState.isTimerRunning ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span>{timerSeconds}</span>
                    </div>
                  </div>

                  {/* TOP HEADER: LEFT = CÂU HỎI Ô SỐ X, RIGHT = X ĐIỂM */}
                  <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2.5 pt-1">
                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-black uppercase tracking-wider">
                      CÂU HỎI Ô SỐ {selectedCellIndex + 1}
                    </span>
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-black uppercase tracking-wider font-mono">
                      {questionPoints} ĐIỂM
                    </span>
                  </div>

                  {/* QUESTION TEXT */}
                  <p className="text-base sm:text-xl md:text-2xl font-bold text-amber-300 leading-relaxed my-auto py-2 text-center">
                    {cpState.selectedQuestion.noi_dung}
                  </p>

                  {/* ANSWER DISPLAY */}
                  {(cpState.questionState === 'ANSWERED_CORRECT' || cpState.questionState === 'ANSWERED_INCORRECT') && (
                    <div className="text-center pt-2.5 border-t border-indigo-500/20">
                      <span className="text-xs text-slate-400 font-medium">Đáp án đúng:</span>
                      <div className="text-base sm:text-lg font-black text-emerald-400 mt-0.5">
                        {cpState.selectedQuestion.dap_an_dung}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative p-6 sm:p-7 bg-slate-950/80 rounded-3xl border-2 border-slate-800 text-center space-y-3 flex-1 flex flex-col justify-center items-center shadow-xl">
                  {/* PROTRUDING CLOCK TAB IN PENDING STATE */}
                  <div className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 z-20">
                    <div className="w-24 sm:w-28 h-9 sm:h-11 rounded-2xl border-2 border-slate-700 bg-slate-950 text-slate-400 shadow-xl flex items-center justify-center gap-2 font-mono font-black text-lg sm:text-2xl tabular-nums">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>{timerSeconds}</span>
                    </div>
                  </div>
                  <div className="text-amber-400 font-extrabold text-sm sm:text-base tracking-wider uppercase pt-2">
                    Đã chọn ô số {selectedCellIndex + 1} ({diffLabel} - {questionPoints} điểm)
                  </div>
                  <div className="text-xs text-slate-400 font-medium animate-pulse">
                    Đang chờ MC / Ban tổ chức công bố câu hỏi...
                  </div>
                </div>
              )
            ) : (
              <div className="p-8 bg-slate-950/90 rounded-3xl border border-dashed border-blue-900/40 text-center space-y-2 flex flex-col items-center justify-center h-full min-h-[220px]">
                <Sparkles className="w-6 h-6 text-blue-500/40" />
                <div className="text-sm font-semibold text-slate-400">Chưa chọn ô câu hỏi</div>
                <div className="text-xs text-slate-500">
                  Thí sinh trong lượt thi sẽ lựa chọn ô số trên bảng.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT 50%: 6x6 BOARD DISPLAY */}
        <div className="bg-slate-950/90 border border-blue-900/50 rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-center min-h-[46vh]">
          <div className="grid grid-cols-6 gap-2 sm:gap-2.5 w-full max-w-2xl mx-auto pointer-events-none select-none my-auto">
            {cpState.board.map((cell, idx) => {
              const isSelected = selectedCellIndex === idx;
              const claimedPlayer = cell.claimedByPlayer;
              const claimedColor = (claimedPlayer && isColorActive) ? cpState.playerColors[claimedPlayer] : null;

              const isRevealed = idx < cpState.tacticalRevealedCount || cpState.tacticalRevealedCount >= 36;

              let symbol = '';
              if (isRevealed && !cpState.symbolsHidden) {
                if (cell.difficulty === 'MEDIUM') symbol = '!';
                else if (cell.difficulty === 'HARD') symbol = '?';
              }

              return (
                <div
                  key={idx}
                  className={`relative aspect-[1.4/1] rounded-xl border transition-all overflow-hidden flex items-center justify-between p-1.5 ${
                    isSelected
                      ? 'bg-white border-2 border-slate-100 text-slate-950 ring-2 ring-white scale-105 z-20 font-black'
                      : claimedColor
                      ? `${COLOR_MAP[claimedColor].bg100} ${COLOR_MAP[claimedColor].border} ${COLOR_MAP[claimedColor].text100}`
                      : isRevealed
                      ? 'bg-slate-950 border-2 border-slate-700/80 text-slate-200 border-t-slate-600/80 font-bold'
                      : 'bg-slate-950/90 border-2 border-slate-800/80 text-slate-600'
                  }`}
                >
                  {isRevealed ? (
                    <>
                      <span className="absolute top-1 left-1.5 sm:top-1.5 sm:left-2 text-[10px] sm:text-xs md:text-sm font-mono font-extrabold opacity-90 leading-none">
                        {cell.index}
                      </span>
                      {symbol && (
                        <span className="absolute right-1.5 sm:right-2.5 top-1/2 -translate-y-1/2 text-xs sm:text-base md:text-lg font-black leading-none">
                          {symbol}
                        </span>
                      )}
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: CONTESTANTS LIST AS A HORIZONTAL ROW */}
      <div className="bg-slate-950/90 border border-blue-900/50 rounded-2xl p-2.5 space-y-1.5">
        <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider text-center border-b border-slate-800/80 pb-1">
          DANH SÁCH THÍ SINH
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {displayOrder.map((pos) => {
            const color = cpState.playerColors[pos];
            const player = matchState.players[pos as 1|2|3|4];
            const colorInfo = COLOR_MAP[color] || COLOR_MAP['RED'];
            const isActive = pos === activePos;

            return (
              <div
                key={pos}
                className={`px-3 py-1.5 rounded-xl border transition-all flex items-center justify-between shadow-sm ${
                  isColorActive
                    ? `${colorInfo.border} ${
                        isActive
                          ? `${colorInfo.bg100} ${colorInfo.text100} ${colorInfo.ring}`
                          : `${colorInfo.bg50} ${colorInfo.text50}`
                      }`
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-1">
                  <span className="text-xs font-black opacity-80 font-mono">#{pos}</span>
                  <div className="text-xs font-extrabold truncate max-w-[110px]">
                    {player?.name || `Bàn ${pos}`}
                  </div>
                </div>
                <div className="text-xs sm:text-sm font-black font-mono">{player?.score || 0}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
