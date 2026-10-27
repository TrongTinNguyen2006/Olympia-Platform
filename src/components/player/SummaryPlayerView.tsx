import React, { useEffect, useState } from 'react';
import { MatchState } from '../../types.js';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Award, Sparkles, Star } from 'lucide-react';

interface SummaryPlayerViewProps {
  matchState: MatchState;
  position: number; // Current player's position (1-4)
}

export default function SummaryPlayerView({ matchState, position }: SummaryPlayerViewProps) {
  const summary = matchState.summary;
  const mode = summary?.mode || null;

  // Track revealed count in ROUNDS mode (1 to 4)
  const [revealedCount, setRevealedCount] = useState(1);

  // Sorting helper: low score first. If tie, lower position first.
  const sortedLoserToWinner = Object.keys(matchState.players)
    .map(Number)
    .map(pos => ({ pos, ...matchState.players[pos] }))
    .sort((a, b) => {
      if (a.score !== b.score) {
        return a.score - b.score;
      }
      return a.pos - b.pos; // Lower position first
    });

  // Automatically cycle through steps in ROUNDS mode with 3.5s delay (matching Viewer screen)
  useEffect(() => {
    if (mode === 'ROUNDS') {
      setRevealedCount(1);
      const timer = setInterval(() => {
        setRevealedCount(prev => {
          if (prev < 4) {
            return prev + 1;
          } else {
            clearInterval(timer);
            return prev;
          }
        });
      }, 3500);

      return () => clearInterval(timer);
    }
  }, [mode]);

  // Player info
  const myPlayerInfo = matchState.players[position as 1 | 2 | 3 | 4];
  const myScore = myPlayerInfo?.score ?? 0;

  // Intro state (no mode selected)
  if (!mode) {
    return (
      <div className="w-full max-w-xl mx-auto text-center p-8 space-y-6" id="player-summary-intro">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="w-24 h-24 bg-yellow-500/10 border-2 border-yellow-500/20 rounded-full inline-flex items-center justify-center text-yellow-400">
            <Trophy className="w-12 h-12 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">
              VUI LÒNG CHỜ ĐỢI
            </h2>
          </div>

          <div className="p-6 bg-slate-950 border border-slate-850 rounded-2xl space-y-2 max-w-md mx-auto shadow-inner">
            <span className="text-xs text-slate-500 uppercase font-black tracking-widest block">Điểm số của bạn</span>
            <strong className="text-5xl font-mono font-black text-emerald-400 block">{myScore}</strong>
          </div>
        </motion.div>
      </div>
    );
  }

  // ROUNDS MODE
  if (mode === 'ROUNDS') {
    const activeIndex = Math.min(revealedCount - 1, 3);
    const activePlayer = sortedLoserToWinner[activeIndex];
    const isMeActive = activePlayer?.pos === position;

    return (
      <div className="w-full max-w-2xl mx-auto space-y-6 p-6" id="player-summary-rounds">
        <div className="text-center space-y-1">
          <span className="text-xs bg-teal-500/10 border border-teal-500/20 text-teal-400 font-bold px-3 py-1 rounded-full uppercase tracking-widest">
            TỔNG KẾT TỪNG VÒNG
          </span>
        </div>

        {/* Current revealed player focus card */}
        <AnimatePresence mode="wait">
          {activePlayer && (
            <motion.div
              key={activePlayer.pos}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className={`p-8 rounded-3xl border text-center space-y-5 shadow-2xl transition-all duration-300 ${
                isMeActive
                  ? 'bg-gradient-to-b from-teal-500/10 to-teal-950/20 border-teal-400 shadow-teal-500/5'
                  : 'bg-slate-950 border-slate-850'
              }`}
            >
              {isMeActive && (
                <div className="flex items-center justify-center">
                  <span className="text-xs bg-teal-500 text-slate-950 font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    BẠN
                  </span>
                </div>
              )}

              <h4 className="text-3xl font-black text-white tracking-tight truncate">
                {activePlayer.name || 'Thí sinh'}
              </h4>

              <div className="py-4 px-8 bg-slate-900 border-2 border-slate-800 rounded-2xl inline-block min-w-[200px] shadow-inner">
                <strong className="text-5xl font-mono font-black text-emerald-400 block">
                  {activePlayer.score}
                </strong>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Small stacked progress indicators */}
        <div className="p-5 bg-slate-950 border border-slate-850 rounded-2xl space-y-3 shadow-inner">
          <span className="text-[10px] text-slate-500 uppercase font-black block tracking-widest text-center">Tiến trình công bố:</span>
          <div className="grid grid-cols-4 gap-3">
            {sortedLoserToWinner.map((player, idx) => {
              const isRevealed = idx < revealedCount;
              const isActive = idx === activeIndex;
              const isMe = player.pos === position;

              return (
                <div
                  key={player.pos}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    isActive
                      ? 'bg-teal-500/20 border-teal-500 text-teal-300 font-bold scale-102 shadow-lg shadow-teal-500/5'
                      : isRevealed
                      ? 'bg-slate-900 border-slate-800 text-slate-300'
                      : 'bg-slate-950 border-slate-900/60 text-slate-700 opacity-40 select-none'
                  }`}
                >
                  <div className="text-[10px] font-black truncate text-slate-400 max-w-full">
                    {isRevealed ? player.name || 'Thí sinh' : '???'}
                  </div>
                  <div className="text-base font-mono font-black mt-1">
                    {isRevealed ? player.score : '???'}
                  </div>
                  {isMe && (
                    <div className="text-[8px] text-teal-400 font-black mt-1 uppercase tracking-wider">BẠN</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // FINAL MODE (Show ordered contestants from 1 to 4)
  const orderedPositions = [1, 2, 3, 4] as const;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 p-6" id="player-summary-final">
      <div className="text-center space-y-1.5 pb-2">
        <span className="text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold px-3.5 py-1.5 rounded-full uppercase tracking-widest">
          TỔNG KẾT CUỐI TRẬN
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {orderedPositions.map((pos) => {
          const playerObj = matchState.players[pos];
          const isMe = pos === position;

          return (
            <div
              key={pos}
              className={`p-6 rounded-2xl border flex flex-col justify-between min-h-[160px] relative transition-all ${
                isMe
                  ? 'bg-slate-900 border-teal-500 shadow-xl shadow-teal-500/5'
                  : 'bg-slate-950 border-slate-850'
              }`}
            >
              <div>
                {isMe && (
                  <span className="text-[10px] font-black tracking-widest uppercase bg-teal-500 text-slate-950 px-2 py-0.5 rounded inline-block mb-1.5">
                    BẠN
                  </span>
                )}
                <span className="text-xl font-extrabold text-white block truncate mt-1">
                  {playerObj?.name || 'Trống'}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Điểm số</span>
                <strong className="font-mono text-3xl font-black text-emerald-400">
                  {playerObj?.score ?? 0}
                </strong>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
