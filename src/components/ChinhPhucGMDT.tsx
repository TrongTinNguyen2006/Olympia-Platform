import React, { useRef, useEffect } from 'react';
import { MatchState, SocketEvent } from '../types.js';
import { Clock, Key, HelpCircle, CheckCircle2, Award, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface ChinhPhucGMDTProps {
  matchState: MatchState;
  socket?: any;
  playerPosition?: 1 | 2 | 3 | 4; // If rendered on a contestant screen
  isOverlay?: boolean;
}

// Exactly 10 T9 keys as specified by user
const T9_10_KEYS = [
  { num: '1', sub: 'A B C' },
  { num: '2', sub: 'D E F' },
  { num: '3', sub: 'G H I' },
  { num: '4', sub: 'J K L' },
  { num: '5', sub: 'M N O' },
  { num: '6', sub: 'P Q R' },
  { num: '7', sub: 'S T' },
  { num: '8', sub: 'U V' },
  { num: '9', sub: 'W X' },
  { num: '0', sub: 'Y Z' },
];

export default function ChinhPhucGMDT({ matchState, socket, playerPosition, isOverlay }: ChinhPhucGMDTProps) {
  const gmdt = matchState?.chinh_phuc?.gmdt;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const len = gmdt?.matMa?.length || 7;
  const myProgress = playerPosition && gmdt ? gmdt.playerProgress[playerPosition] : null;
  const serverChars = myProgress?.inputChars || Array(len).fill('');

  const [localChars, setLocalChars] = React.useState<string[]>(() => serverChars);

  useEffect(() => {
    if (!gmdt) return;
    if (serverChars && serverChars.length === len) {
      setLocalChars((prev) => {
        if (prev.length !== len || prev.every((c) => !c)) {
          return serverChars;
        }
        return prev;
      });
    }
  }, [gmdt?.matMa, gmdt?.step, len]);

  if (!gmdt) return null;

  const handleCharChange = (idx: number, val: string) => {
    if (!playerPosition || !socket || gmdt.step !== 'DEM_GIO') return;
    const char = val.slice(-1).toUpperCase();

    setLocalChars((prev) => {
      const next = [...prev];
      while (next.length < len) next.push('');
      next[idx] = char;

      socket.emit(SocketEvent.PLAYER_GMDT_SUBMIT_CHAR, { position: playerPosition, inputChars: next });
      return next;
    });

    // Focus next box if character typed
    if (char && idx < len - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !localChars[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  return (
    <div
      className={`w-full max-w-5xl mx-auto space-y-4 ${
        isOverlay
          ? 'fixed bottom-4 left-1/2 -translate-x-1/2 w-[85vw] max-w-5xl z-50 p-4 bg-slate-950/95 rounded-3xl border border-blue-900/80 backdrop-blur-xl shadow-2xl space-y-3'
          : 'p-4 md:p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl'
      }`}
    >
      {/* TITLE & STEP HEADER */}
      <div className="text-center space-y-1 border-b border-slate-800 pb-3">
        <div className="flex items-center justify-center gap-2">
          <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-widest">
            MINI-GAME T9
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            GIẢI MÃ ĐIỆN THOẠI
          </h2>
          {gmdt.step === 'DEM_GIO' && gmdt.isTimerRunning && (gmdt.timerSecondsLeft ?? 0) > 0 && (
            <span className="ml-2 px-3 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-mono font-black animate-pulse flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              {Math.ceil(gmdt.timerSecondsLeft || 60)}s
            </span>
          )}
        </div>
      </div>

      {/* STEP DISPLAY GRID (Side-by-side no-scroll layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: MAT MA, GOI Y, TIMER, INPUTS */}
        <div className="lg:col-span-7 space-y-3">
          {/* STEP 1: MAT MA CODE DIGITS */}
          {gmdt.step !== 'GIAO_DIEN' && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center space-y-2">
              <div className="flex justify-center items-center gap-2 py-1 flex-wrap">
                {gmdt.matMa.split('').map((digit, i) => (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <div className="w-10 h-12 bg-gradient-to-b from-amber-500/20 to-amber-600/10 border-2 border-amber-500/50 rounded-lg flex items-center justify-center text-lg font-black font-mono text-amber-300 shadow">
                      {digit}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HINT */}
          {(gmdt.step === 'GOI_Y' || gmdt.step === 'DEM_GIO' || gmdt.step === 'DAP_AN' || gmdt.step === 'KET_QUA') && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 text-center space-y-0.5"
            >
              <div className="text-base font-bold text-white">{gmdt.goiY}</div>
            </motion.div>
          )}

          {/* COUNTDOWN & CONTESTANT INPUT AREA */}
          {gmdt.step === 'DEM_GIO' && (
            <div className="space-y-3">
              {/* CONTESTANT SCREEN -> SEPARATE INPUT BOXES */}
              {playerPosition ? (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-center space-y-2">
                  <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    NHẬP ĐÁP ÁN CỦA BẠN:
                  </div>

                  <div className="flex justify-center items-center gap-1.5 flex-wrap">
                    {Array.from({ length: len }).map((_, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (inputRefs.current[idx] = el)}
                        type="text"
                        maxLength={1}
                        value={localChars[idx] || ''}
                        onChange={(e) => handleCharChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="w-10 h-12 bg-slate-900 border-2 border-slate-700 focus:border-emerald-400 focus:bg-slate-800 text-center text-lg font-black text-white rounded-lg uppercase outline-none transition-all"
                      />
                    ))}
                  </div>

                  {myProgress?.isCorrect === true && (
                    <div className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1 pt-1">
                      <CheckCircle2 className="w-4 h-4" /> BẠN ĐÃ TRẢ LỜI ĐÚNG TRONG {(myProgress.timeTakenMs ? myProgress.timeTakenMs / 1000 : 0).toFixed(2)}s!
                    </div>
                  )}
                </div>
              ) : (
                /* VIEWER / MC SCREEN */
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {[1, 2, 3, 4].map((pos) => {
                    const prog = gmdt.playerProgress[pos];
                    const player = matchState.players[pos as 1 | 2 | 3 | 4];
                    const typedCount = prog?.inputChars ? prog.inputChars.filter((c) => Boolean(c && c.trim())).length : 0;
                    const progressPercent = len > 0 ? Math.min(100, (typedCount / len) * 100) : 0;

                    return (
                      <div key={pos} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center space-y-2">
                        <div className="text-[12px] font-bold text-slate-300 truncate">
                          {player?.name || `Bàn ${pos}`}
                        </div>

                        {/* SINGLE CAPSULE PROGRESS BAR */}
                        <div className="w-full bg-slate-900 border-2 border-slate-700 rounded-full h-5 p-0.5 overflow-hidden flex items-center shadow-inner">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              prog?.isCorrect === true
                                ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                                : prog?.isCorrect === false
                                ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                                : 'bg-slate-100'
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: DAP AN & KET QUA */}
          {(gmdt.step === 'DAP_AN' || gmdt.step === 'KET_QUA') && (
            <div className="space-y-3">
              <div className="bg-slate-950 border border-emerald-500/40 rounded-xl p-4 text-center space-y-1 shadow">
                <div className="text-2xl font-black text-emerald-400 tracking-wider">
                  {gmdt.dapAnDung}
                </div>
              </div>

              {gmdt.step === 'KET_QUA' && gmdt.ranks && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    BẢNG XẾP HẠNG & PHÂN BỔ MÀU SẮC
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {gmdt.ranks.map((r) => {
                      const player = matchState.players[r.position as 1 | 2 | 3 | 4];
                      const assignedColor = matchState.chinh_phuc.playerColors[r.position] || 'RED';
                      
                      const COLOR_CARD_MAP: Record<string, { bg: string; border: string }> = {
                        RED: { bg: 'bg-red-950/70', border: 'border-red-500' },
                        YELLOW: { bg: 'bg-amber-950/70', border: 'border-amber-400' },
                        BLUE: { bg: 'bg-blue-950/70', border: 'border-blue-500' },
                        GREEN: { bg: 'bg-emerald-950/70', border: 'border-emerald-500' },
                      };
                      const cardStyle = COLOR_CARD_MAP[assignedColor] || COLOR_CARD_MAP['RED'];

                      return (
                        <div
                          key={r.position}
                          className={`${cardStyle.bg} border-2 ${cardStyle.border} rounded-xl p-2.5 text-center space-y-1 shadow-md transition-all`}
                        >
                          <div className="text-[10px] font-bold text-slate-300">Hạng {r.rank}</div>
                          <div className="text-xs font-black text-white truncate">{player?.name || `Bàn ${r.position}`}</div>
                          {r.timeTakenMs ? (
                            <div className="text-[10px] text-emerald-400 font-mono font-bold">{(r.timeTakenMs / 1000).toFixed(2)}s</div>
                          ) : (
                            <div className="text-[10px] text-rose-400 font-medium">Chưa giải đúng</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: 10-KEY T9 REFERENCE KEYPAD */}
        <div className="lg:col-span-5 bg-slate-950/90 border border-slate-800 rounded-xl p-3 space-y-2 shadow-lg">
          <div className="grid grid-cols-3 gap-1.5">
            {T9_10_KEYS.slice(0, 9).map((k) => (
              <div
                key={k.num}
                className="bg-slate-900 border border-slate-700/60 rounded-lg p-2 flex flex-col items-center justify-center text-center shadow-sm hover:border-amber-500/50 transition-all select-none"
              >
                <span className="font-mono font-black text-amber-400 text-base leading-none">{k.num}</span>
                <span className="text-[10px] font-bold text-slate-200 mt-0.5 uppercase tracking-wide">
                  {k.sub}
                </span>
              </div>
            ))}
          </div>

          {/* KEY 0 CENTERED AT BOTTOM */}
          <div className="flex justify-center">
            <div
              key={T9_10_KEYS[9].num}
              className="w-1/3 bg-slate-900 border border-slate-700/60 rounded-lg p-2 flex flex-col items-center justify-center text-center shadow-sm hover:border-amber-500/50 transition-all select-none"
            >
              <span className="font-mono font-black text-amber-400 text-base leading-none">{T9_10_KEYS[9].num}</span>
              <span className="text-[10px] font-bold text-slate-200 mt-0.5 uppercase tracking-wide">
                {T9_10_KEYS[9].sub}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
