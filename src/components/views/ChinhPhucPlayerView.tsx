import React from 'react';
import { MatchState, PlayerColor } from '../../types.js';
import { Clock, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import ChinhPhucGMDT from '../ChinhPhucGMDT.js';

interface ChinhPhucPlayerViewProps {
  matchState: MatchState;
  socket: any;
  playerPosition: 1 | 2 | 3 | 4;
}

const COLOR_MAP: Record<PlayerColor, { bg: string; border: string; text: string; textCol: string; bgTint: string }> = {
  RED: {
    bg: 'bg-red-600',
    border: 'border-red-400',
    text: 'text-white',
    textCol: 'text-red-300',
    bgTint: 'bg-red-500/20 border-red-500/50',
  },
  YELLOW: {
    bg: 'bg-amber-500',
    border: 'border-amber-300',
    text: 'text-slate-950',
    textCol: 'text-amber-300',
    bgTint: 'bg-amber-500/20 border-amber-500/50',
  },
  BLUE: {
    bg: 'bg-blue-600',
    border: 'border-blue-400',
    text: 'text-white',
    textCol: 'text-blue-300',
    bgTint: 'bg-blue-500/20 border-blue-500/50',
  },
  GREEN: {
    bg: 'bg-emerald-600',
    border: 'border-emerald-400',
    text: 'text-white',
    textCol: 'text-emerald-300',
    bgTint: 'bg-emerald-500/20 border-emerald-500/50',
  },
};

export default function ChinhPhucPlayerView({ matchState, socket, playerPosition }: ChinhPhucPlayerViewProps) {
  const cpState = matchState?.chinh_phuc;

  if (!cpState) return null;

  // 1. Initial screen: Only show round name and logo
  if (!cpState.isBoardShown && cpState.colorMethod === null) {
    return (
      <div className="w-full h-full min-h-[460px] flex flex-col items-center justify-center text-center p-8 relative overflow-hidden my-auto">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center space-y-6"
        >
          {/* LOGO */}
          <div className="relative">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-br from-sky-500/20 via-blue-600/20 to-indigo-600/20 border-2 border-sky-400/40 flex items-center justify-center text-sky-400 shadow-[0_0_45px_rgba(56,189,248,0.3)] backdrop-blur-md">
              <Trophy className="w-16 h-16 sm:w-20 sm:h-20 text-sky-400 drop-shadow-[0_0_20px_rgba(56,189,248,0.6)]" />
            </div>
            <div className="absolute -inset-1 rounded-3xl bg-sky-400/10 blur-xl -z-10 animate-pulse" />
          </div>

          {/* ROUND NAME */}
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-white to-blue-300 drop-shadow-[0_0_25px_rgba(56,189,248,0.5)] font-sans">
            CHINH PHỤC
          </h1>
        </motion.div>
      </div>
    );
  }

  // Render GMĐT mini-game view for player if GMĐT step is active
  if (cpState.colorMethod === 'GMDT' && cpState.gmdt?.step !== 'KET_QUA' && !cpState.isBoardShown) {
    return <ChinhPhucGMDT matchState={matchState} socket={socket} playerPosition={playerPosition} />;
  }

  // 2. Render Color Order Reveal Screen before board is shown
  if (!cpState.isBoardShown) {
    const slots = [
      { color: 'RED' as PlayerColor, turnText: '#1' },
      { color: 'YELLOW' as PlayerColor, turnText: '#2' },
      { color: 'BLUE' as PlayerColor, turnText: '#3' },
      { color: 'GREEN' as PlayerColor, turnText: '#4' },
    ];

    return (
      <div className="w-full px-4 py-5 space-y-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl">
        <div className="text-center space-y-1 border-b border-slate-800 pb-3">
          <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
            CHINH PHỤC
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            CÔNG BỐ THỨ TỰ THI ĐẤU
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {slots.map((slot, idx) => {
            const isRevealed = cpState.colorRevealedSlots?.[idx] ?? (idx < (cpState.colorRevealedCount || 0));
            const pos = cpState.colorOrder[idx] || (idx + 1);
            const player = matchState.players[pos as 1|2|3|4];
            const isMe = pos === playerPosition;
            const colorInfo = COLOR_MAP[slot.color];

            return (
              <div
                key={slot.color}
                className={`rounded-2xl p-5 border-2 transition-all flex flex-col justify-between min-h-[140px] shadow-lg ${
                  isRevealed
                    ? `${colorInfo.bg} ${colorInfo.border} ${colorInfo.text} ${isMe ? 'ring-4 ring-white' : ''}`
                    : 'bg-slate-950/80 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${
                    isRevealed ? 'bg-slate-950/60 text-white border-white/20' : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}>
                    {slot.turnText}
                  </span>
                </div>

                <div className="text-center py-2 space-y-1.5">
                  {isRevealed ? (
                    <>
                      <div className="text-xl sm:text-2xl font-black truncate drop-shadow-md">
                        {player?.name || `Thí sinh ${pos}`}
                      </div>
                      <div className="inline-block px-4 py-1 bg-slate-950/70 text-amber-300 rounded-xl text-lg font-black font-mono border border-white/10">
                        {player?.score || 0}
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-600 py-3">
                      <div className="text-2xl font-black">?</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 3. Main Board & Question View
  const isColorActive = cpState.colorMethod === 'HIGH_TO_LOW' || cpState.colorMethod === 'LOW_TO_HIGH' || cpState.gmdt?.step === 'KET_QUA' || cpState.isBoardShown;
  const activePos = cpState.activePlayerPosition;
  const activePlayer = matchState.players[activePos];
  const activeColor = cpState.playerColors[activePos] || 'RED';
  const activeColorInfo = COLOR_MAP[activeColor];
  const isMyTurn = activePos === playerPosition;

  // Selected cell & difficulty calculation
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

  const timerSeconds = cpState.isTimerRunning
    ? Math.max(0, Math.ceil(cpState.timerSecondsLeft))
    : (cpState.timerSecondsLeft !== undefined && cpState.timerSecondsLeft !== null && cpState.timerSecondsLeft === 0)
    ? 0
    : (cpState.timerTotalSeconds || 10);

  return (
    <div className="w-full space-y-4">
      {/* TWO-COLUMN LAYOUT: LEFT = LARGER 6x6 BOARD, RIGHT = QUESTION & SINGLE TIMER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        {/* LEFT HALF: READ-ONLY 6x6 GRID DISPLAY */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col items-center justify-center gap-3">
          <div className="grid grid-cols-6 gap-2 sm:gap-2.5 max-w-sm sm:max-w-md w-full mx-auto pointer-events-none select-none my-1">
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
                      ? `${COLOR_MAP[claimedColor].bg} ${COLOR_MAP[claimedColor].border} ${COLOR_MAP[claimedColor].text}`
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

          <div className="text-xs sm:text-sm text-slate-400 font-medium text-center">
            {isMyTurn ? (
              <span className="text-emerald-400 font-bold">
                Đang đến lượt bạn! Chọn ô thông qua MC / Máy quản trị.
              </span>
            ) : (
              <span>Đang trong lượt thi của {activePlayer?.name || `Bàn ${activePos}`}.</span>
            )}
          </div>
        </div>

        {/* RIGHT HALF: QUESTION & SINGLE TIMER DISPLAY (NO PROGRESS BAR) */}
        <div className="space-y-4">
          {/* SINGLE COUNTDOWN TIMER (FIXED SIZE, INTEGER SECONDS, NO PULSE, NO 's') */}
          <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 flex items-center justify-between shadow-xl">
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" /> THỜI GIAN TRẢ LỜI
            </span>
            <div className={`w-20 sm:w-24 h-10 rounded-xl bg-slate-900 border flex items-center justify-center text-2xl font-black font-mono tabular-nums ${
              cpState.isTimerRunning ? 'border-amber-400 text-amber-400 shadow-md shadow-amber-500/20' : 'border-slate-700 text-slate-400'
            }`}>
              {timerSeconds}
            </div>
          </div>

          {/* SELECTION ANNOUNCEMENT & QUESTION CARD */}
          {selectedCellIndex !== null && selectedCellIndex !== undefined ? (
            <div className="space-y-3">
              {/* ANNOUNCEMENT LINE IN ACTIVE PLAYER'S COLOR */}
              <div className={`p-3.5 rounded-2xl border text-sm sm:text-base font-extrabold text-center shadow-lg transition-all ${activeColorInfo.bgTint} ${activeColorInfo.textCol}`}>
                Thí sinh {activePlayer?.name || `Bàn ${activePos}`} chọn câu {diffLabel} {questionPoints} điểm
              </div>

              {/* QUESTION CARD */}
              {cpState.selectedQuestion && cpState.questionState !== 'IDLE' ? (
                <div className="p-5 bg-gradient-to-br from-indigo-950/90 via-slate-900 to-indigo-950/90 border border-indigo-500/40 rounded-2xl shadow-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2.5">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
                      CÂU HỎI Ô SỐ {selectedCellIndex + 1}
                    </span>
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                      {questionPoints} ĐIỂM
                    </span>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-amber-300 leading-relaxed py-2">
                    {cpState.selectedQuestion.noi_dung}
                  </p>
                </div>
              ) : (
                <div className="p-6 bg-slate-950/80 rounded-2xl border border-slate-800 text-center space-y-2 shadow-xl">
                  <div className="text-amber-400 font-extrabold text-xs sm:text-sm uppercase">
                    Đã chọn ô số {selectedCellIndex + 1} ({diffLabel} - {questionPoints} điểm)
                  </div>
                  <div className="text-xs text-slate-400 font-medium animate-pulse">
                    Đang chờ Ban tổ chức công bố câu hỏi...
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 text-center space-y-2">
              <div className="text-sm font-semibold text-slate-400">Chưa chọn ô câu hỏi</div>
              <div className="text-xs text-slate-500">
                Thí sinh trong lượt thi sẽ lựa chọn ô số trên bảng.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
