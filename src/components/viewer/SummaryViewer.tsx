import React, { useEffect, useState } from 'react';
import { MatchState } from '../../types.js';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Award, Sparkles, User, RefreshCw } from 'lucide-react';
import RoundTitleScreen from '../common/RoundTitleScreen.js';

interface SummaryViewerProps {
  matchState: MatchState;
}

export default function SummaryViewer({ matchState }: SummaryViewerProps) {
  const summary = matchState.summary;
  const mode = summary?.mode || null;

  // State to track revealed count in ROUNDS mode (1 to 4)
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

  // Automatically cycle through steps in ROUNDS mode with 3.5s delay
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

  // If no mode selected yet, display waiting intro screen
  if (!mode) {
    const customSetting = matchState?.roundCustomSettings?.['SUMMARY'];
    const customRoundLogo = customSetting?.customLogoUrl || customSetting?.logoUrl;
    const roundName = customSetting?.customName?.trim() || 'TỔNG KẾT ĐIỂM';

    return (
      <RoundTitleScreen
        title={roundName}
        logoUrl={customRoundLogo}
        roundKey="SUMMARY"
        id="summary-intro-screen"
      />
    );
  }

  // Chế độ 1: Tổng kết từng vòng (ROUNDS)
  if (mode === 'ROUNDS') {
    const activeIndex = Math.min(revealedCount - 1, 3);
    const activePlayer = sortedLoserToWinner[activeIndex];

    return (
      <div className="h-full flex flex-col justify-center p-4 font-sans relative overflow-hidden" id="summary-rounds-layout">
        {/* Glowing white title for summary interface */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <h2
            className="font-round-title text-2xl sm:text-3xl font-black uppercase tracking-wider text-white select-none text-center"
            style={{ textShadow: '0 0 8px rgba(255, 255, 255, 0.35), 0 0 16px rgba(226, 232, 240, 0.2)' }}
          >
            {matchState?.roundCustomSettings?.['SUMMARY']?.customName?.trim() || 'TỔNG KẾT ĐIỂM'}
          </h2>
        </motion.div>

        <div className="w-full bg-slate-950/90 backdrop-blur-2xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl">
          <div className="grid grid-cols-12 gap-6 items-center">
            {/* LEFT/MAIN FOCUS: WIDE CANDIDATE BANNER WITH PROMINENT SCORE BOX */}
            <div className="col-span-8 flex items-center gap-0 relative py-4">
              {/* ACCENT LINE ON FAR LEFT */}
              <div className="w-16 h-2 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-l-full shadow-[0_0_15px_rgba(16,185,129,0.8)] shrink-0" />

              <AnimatePresence mode="wait">
                {activePlayer && (
                  <motion.div
                    key={activePlayer.pos}
                    initial={{ opacity: 0, x: -30, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.98 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-0 w-full"
                  >
                    {/* PROMINENT SCORE BOX SITTING ON LEFT EDGE OF NAME BANNER */}
                    <div className="z-20 bg-emerald-500 text-slate-950 px-6 py-5 rounded-2xl shadow-[0_0_35px_rgba(16,185,129,0.7)] border-2 border-emerald-300 flex items-center justify-center min-w-[130px] shrink-0 font-mono text-4xl md:text-5xl font-black">
                      {activePlayer.score}
                    </div>

                    {/* WIDE CANDIDATE NAME BANNER */}
                    <div className="z-10 -ml-4 pl-8 pr-8 py-5 bg-gradient-to-r from-slate-900/95 via-teal-950/90 to-slate-900/95 border-y-2 border-r-2 border-emerald-400/60 rounded-r-2xl shadow-xl flex-1 flex items-center justify-between">
                      <h2 className="text-2xl md:text-4xl font-black text-white font-player uppercase tracking-wider truncate">
                        {activePlayer.name || 'Thí sinh'}
                      </h2>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* RIGHT SIDE: VERTICAL STACKED CARDS */}
            <div className="col-span-4 space-y-2.5">
              {sortedLoserToWinner.slice().reverse().map((player, reverseIdx) => {
                const actualOrderIdx = sortedLoserToWinner.length - 1 - reverseIdx;
                const isRevealed = actualOrderIdx < revealedCount;
                const isActive = actualOrderIdx === activeIndex;

                return (
                  <div
                    key={player.pos}
                    className={`px-4 py-3 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                      isActive
                        ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-[1.02]'
                        : isRevealed
                        ? 'bg-slate-900/80 border-slate-800 text-slate-200'
                        : 'bg-slate-950/50 border-slate-900 text-slate-600 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-base font-bold truncate font-player">
                        {isRevealed ? player.name || 'Thí sinh' : '???'}
                      </span>
                    </div>

                    <span className={`font-mono text-lg font-black ${isActive ? 'text-emerald-300' : isRevealed ? 'text-slate-200' : 'text-slate-700'}`}>
                      {isRevealed ? player.score : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chế độ 2: Tổng kết cuối trận (FINAL) - Hiển thị theo thứ tự thi đấu của thí sinh (1-4)
  const orderedPlayers = [1, 2, 3, 4] as const;

  return (
    <div className="h-full flex flex-col justify-center items-center p-4" id="summary-final-layout">
      {/* Glowing white title for summary interface */}
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-round-title text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-white select-none text-center mb-6"
        style={{ textShadow: '0 0 8px rgba(255, 255, 255, 0.35), 0 0 16px rgba(226, 232, 240, 0.2)' }}
      >
        {matchState?.roundCustomSettings?.['SUMMARY']?.customName?.trim() || 'TỔNG KẾT ĐIỂM'}
      </motion.h2>

      <div className="grid grid-cols-4 gap-6 w-full max-w-5xl mx-auto py-6">
        {orderedPlayers.map((pos) => {
          const player = matchState.players[pos];

          return (
            <motion.div
              key={pos}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl border text-center flex flex-col justify-center items-center h-48 relative bg-slate-900/90 border-slate-800 shadow-xl"
            >
              <h4 className="text-xl font-black text-white truncate max-w-full font-player">
                {player?.name || 'Thí sinh'}
              </h4>

              <div className="mt-4 pt-4 border-t border-slate-800/80 w-full flex justify-center">
                <strong className="text-4xl md:text-5xl font-mono font-black block text-emerald-400">
                  {player?.score ?? 0}
                </strong>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
