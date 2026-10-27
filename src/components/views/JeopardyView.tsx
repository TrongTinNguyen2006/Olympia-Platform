import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MatchState, SocketEvent } from '../../types';
import { Socket } from 'socket.io-client';
import { Award, Bell, Clock, AlertTriangle, CheckCircle, XCircle, Zap, Star, ShieldAlert, Sparkles, Trophy } from 'lucide-react';
import RoundTitleScreen from '../common/RoundTitleScreen.js';

interface JeopardyViewProps {
  matchState: MatchState;
  userRole?: 'MC' | 'PLAYER' | 'VIEWER' | 'OVERLAY';
  playerPosition?: number;
  socket?: Socket | null;
}

// Helper function to calculate pseudo-random wave index [0..4] for 5-stage staggered reveal
export function getClueWaveIndex(cIdx: number, kIdx: number, cluesPerCat: number): number {
  const cellIdx = cIdx * cluesPerCat + kIdx;
  const hash = (cellIdx * 17 + 7) % 23;
  return hash % 5;
}

export const JeopardyView: React.FC<JeopardyViewProps> = ({
  matchState,
  userRole = 'VIEWER',
  playerPosition,
  socket
}) => {
  const jp = matchState.jeopardy;

  if (!jp) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 space-y-2">
        <AlertTriangle className="w-8 h-8 text-amber-400 animate-bounce" />
        <p className="text-sm font-semibold">Chưa khởi tạo dữ liệu phần thi Jeopardy!</p>
      </div>
    );
  }

  const activeClue = jp.selectedClue && jp.categories?.[jp.selectedClue.categoryIndex]?.clues?.[jp.selectedClue.clueIndex];
  const activeCategoryTitle = jp.selectedClue && jp.categories?.[jp.selectedClue.categoryIndex]?.title;
  const isOverlay = userRole === 'OVERLAY';

  const isPlayerBuzzed = matchState.buzzedPlayer === playerPosition || jp.buzzedPlayer === playerPosition;
  const isControlPlayer = playerPosition ? jp.controlPlayer === playerPosition : false;

  return (
    <div className={`w-full max-w-7xl mx-auto flex flex-col items-center justify-center space-y-4 text-white ${
      userRole === 'PLAYER'
        ? 'p-0 bg-transparent min-h-0'
        : isOverlay
        ? 'p-2 bg-transparent min-h-[calc(100vh-120px)]'
        : 'p-4 bg-slate-950/80 min-h-[calc(100vh-120px)] rounded-2xl border border-slate-800 backdrop-blur-md shadow-lg'
    }`}>

      {/* HEADER / SCORES RIBBON - Only shown when board is shown */}
      {!isOverlay && userRole !== 'PLAYER' && jp.isBoardShown && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl backdrop-blur-md"
        >
          {/* LOGO BADGE */}
          <div className="px-3 py-1.5 rounded-lg bg-blue-500/15 border border-blue-500/40 text-sky-400 font-bold text-sm flex items-center gap-1.5 shrink-0">
            <Trophy className="w-4 h-4 text-sky-400" />
            <span>JEOPARDY!</span>
          </div>

          {/* PLAYER SCORE CARDS */}
          <div className="grid grid-cols-4 gap-2.5 flex-1 min-w-0">
            {([1, 2, 3, 4] as const).map((pos) => {
              const p = matchState.players[pos];
              const score = jp.scoringMode === 'COMBINED' ? (p?.score || 0) : (jp.separateScores?.[pos] || 0);
              const isControl = jp.controlPlayer === pos;
              const isBuzzed = matchState.buzzedPlayer === pos || jp.buzzedPlayer === pos;
              const isMe = userRole === 'PLAYER' && playerPosition === pos;

              return (
                <div
                  key={pos}
                  className={`px-3 py-1.5 rounded-lg border transition-all duration-200 flex items-center justify-between gap-2 relative overflow-hidden h-12 ${
                    isBuzzed
                      ? 'bg-sky-500/25 text-sky-200 border-sky-400 shadow-md animate-pulse'
                      : isControl
                      ? 'bg-blue-500/20 text-sky-300 border-blue-400/60'
                      : isMe
                      ? 'bg-indigo-950/70 text-indigo-200 border-indigo-500/50'
                      : 'bg-slate-950/70 text-slate-200 border-slate-800/80'
                  }`}
                >
                  <div className="text-left min-w-0 flex-1">
                    <span className="text-[11px] font-medium uppercase tracking-wide block text-slate-400 truncate flex items-center gap-1">
                      {isMe && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping flex-shrink-0" />}
                      TS {pos}: {p?.name || `Thí sinh ${pos}`}
                    </span>
                    <span className="text-sm md:text-base font-bold text-sky-400 tracking-tight">{score}</span>
                  </div>

                  {isControl && (
                    <span className="text-[10px] bg-blue-500/20 text-sky-300 border border-blue-400/40 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1 shrink-0">
                      <Star className="w-3 h-3 text-sky-400 fill-sky-400" />
                    </span>
                  )}

                  {isBuzzed && (
                    <span className="text-[10px] bg-sky-500 text-slate-950 font-bold px-1.5 py-0.5 rounded uppercase shrink-0">
                      Chuông!
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* CONTROL PLAYER NOTICE */}
      {userRole === 'PLAYER' && !activeClue && isControlPlayer && (
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full bg-blue-500/15 border border-blue-400/40 p-3 rounded-xl text-center shadow-md backdrop-blur-md flex items-center justify-center gap-2"
        >
          <Star className="w-4 h-4 text-sky-400 fill-sky-400" />
          <span className="text-sm font-bold text-sky-300">
            BẠN ĐANG CÓ QUYỀN CHỌN Ô! Hãy báo chủ đề và số điểm cho MC.
          </span>
        </motion.div>
      )}

      {/* MAIN CONTENT AREA: BOARD OR ACTIVE CLUE */}
      <div className="w-full flex-1 flex flex-col items-center justify-center relative min-h-[460px]">
        <AnimatePresence mode="wait">
          {activeClue ? (
            /* ACTIVE CLUE OVERLAY VIEW */
            <motion.div
              key="active-clue"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-4xl bg-slate-900/95 border border-blue-500/40 rounded-2xl p-5 md:p-7 shadow-2xl backdrop-blur-md flex flex-col items-center justify-between min-h-[450px] relative"
            >
              {/* Category & Point Header */}
              <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3 mb-2">
                <span className="px-3 py-1 bg-blue-500/15 border border-blue-400/40 text-sky-300 font-semibold text-xs rounded-full flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-sky-400" /> {activeCategoryTitle}
                </span>
                <span className="px-3 py-1 bg-sky-500/15 border border-sky-400/40 text-sky-300 font-bold text-sm rounded-full">
                  {activeClue.points} ĐIỂM
                </span>
              </div>

              {/* Clue Question Body */}
              <div className="w-full flex-1 flex flex-col items-center justify-center text-center my-3 px-2 space-y-4">
                {activeClue.media?.url && (
                  <div className="my-1 max-w-full flex justify-center">
                    {activeClue.media.type === 'video' ? (
                      <video src={activeClue.media.url} controls autoPlay className="max-h-52 md:max-h-60 rounded-xl border border-slate-800 shadow-lg" />
                    ) : activeClue.media.type === 'audio' ? (
                      <audio src={activeClue.media.url} controls autoPlay className="w-full max-w-md my-2" />
                    ) : (
                      <img src={activeClue.media.url} alt="Gợi ý Media" className="max-h-52 md:max-h-60 rounded-xl border border-slate-800 shadow-lg object-contain" />
                    )}
                  </div>
                )}

                <h2 className="text-lg md:text-xl font-medium text-slate-100 leading-relaxed text-center px-2">
                  {activeClue.question}
                </h2>

                {/* MC View Correct Answer */}
                {userRole === 'MC' && (
                  <div className="bg-emerald-950/50 border border-emerald-500/40 p-3 rounded-xl w-full max-w-xl mt-2">
                    <span className="text-[10px] text-emerald-400 font-bold block mb-0.5 uppercase tracking-wider">ĐÁP ÁN DÀNH CHO MC:</span>
                    <p className="text-base font-bold text-emerald-300">{activeClue.dap_an_dung}</p>
                  </div>
                )}

                {/* Buzzed Player Notification */}
                {(matchState.buzzedPlayer || jp.buzzedPlayer) && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mt-2 px-4 py-2 bg-sky-500/20 border border-sky-400/50 text-sky-200 font-bold text-sm rounded-xl flex items-center gap-2"
                  >
                    <Bell className="w-4 h-4 text-sky-400 fill-sky-400" />
                    <span>
                      {isPlayerBuzzed
                        ? '🎉 BẠN ĐÃ GIÀNH CHUÔNG TRẢ LỜI!'
                        : `THÍ SINH ${matchState.buzzedPlayer || jp.buzzedPlayer} (${matchState.players[matchState.buzzedPlayer || jp.buzzedPlayer || 1]?.name || ''}) ĐÃ GIÀNH CHUÔNG!`}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* 10 HORIZONTAL TIMER BARS */}
              <div className="w-full max-w-2xl mx-auto pt-3 pb-1 border-t border-slate-800/80">
                <div className="grid grid-cols-10 gap-1.5 w-full">
                  {Array.from({ length: 10 }).map((_, i) => {
                    const dist = Math.min(i, 9 - i);
                    const sec = jp.timer5sSeconds ?? matchState.timerSeconds ?? 0;
                    const isRunning = jp.is5sTimerRunning || matchState.isTimerRunning;
                    const isActive = isRunning && sec > (4 - dist);

                    return (
                      <div
                        key={i}
                        className={`h-2 rounded-full transition-all duration-200 border ${
                          isActive
                            ? 'bg-sky-400 border-sky-300 shadow-sm'
                            : 'bg-slate-800/80 border-slate-700/50 opacity-30'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : !jp.isBoardShown ? (
            /* BOARD HIDDEN WAITING SCREEN */
            <RoundTitleScreen
              title={matchState?.roundCustomSettings?.['JEOPARDY']?.customName?.trim() || 'JEOPARDY!'}
              logoUrl={matchState?.roundCustomSettings?.['JEOPARDY']?.customLogoUrl || matchState?.roundCustomSettings?.['JEOPARDY']?.logoUrl}
              roundKey="JEOPARDY"
              id="viewer-jeopardy-title"
            />
          ) : (
            /* JEOPARDY BOARD MATRIX VIEW */
            <motion.div
              key="jeopardy-board"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full space-y-3"
            >
              <div className={`grid gap-2.5 md:gap-3 ${jp.boardSize === '6x5' ? 'grid-cols-6' : 'grid-cols-5'}`}>
                {jp.categories.map((cat, cIdx) => (
                  <div key={cIdx} className="space-y-2">
                    {/* Category Title Card */}
                    {(() => {
                      const isRevealed = cat.isRevealed;
                      const isHighlighted = jp.highlightedCategoryIndex === cIdx;

                      return (
                        <div
                          className={`p-2.5 rounded-xl text-center h-20 md:h-24 overflow-hidden flex flex-col items-center justify-center border transition-all duration-200 relative ${
                            isHighlighted
                              ? 'bg-sky-500/25 border-sky-300 text-sky-200 shadow-lg font-bold ring-2 ring-sky-400/50'
                              : isRevealed
                              ? 'bg-blue-900/80 border-blue-500/50 text-sky-100 shadow-md'
                              : 'bg-slate-800/90 border-slate-700 text-slate-400'
                          }`}
                        >
                          <span className={`text-[9px] font-semibold uppercase tracking-wider block mb-0.5 ${isHighlighted ? 'text-sky-200' : isRevealed ? 'text-sky-300' : 'text-slate-400'}`}>
                            {isRevealed ? `CHỦ ĐỀ ${cIdx + 1}` : `CHỦ ĐỀ ${cIdx + 1} 🔒`}
                          </span>
                          <h3 className={`text-xs font-bold uppercase tracking-wide leading-snug line-clamp-2 ${isHighlighted ? 'text-white' : isRevealed ? 'text-slate-100' : 'text-slate-400'}`}>
                            {isRevealed ? cat.title : '••••••••••'}
                          </h3>
                        </div>
                      );
                    })()}

                    {/* Clue Value Cards */}
                    <div className="space-y-2">
                      {cat.clues.map((clue, kIdx) => {
                        const isAnswered = clue.isAnswered;

                        return (
                          <div
                            key={kIdx}
                            className={`w-full py-3.5 rounded-xl font-bold text-xl md:text-2xl text-center border transition-all duration-150 flex items-center justify-center h-16 ${
                              isAnswered
                                ? 'bg-slate-950/40 border-slate-900 text-slate-700 opacity-20 select-none pointer-events-none'
                                : 'bg-blue-950/80 border-blue-500/40 text-sky-300 hover:bg-blue-900/90 hover:border-sky-400 hover:text-sky-100 cursor-pointer shadow-md'
                            }`}
                          >
                            {!isAnswered && <span>{clue.points}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

