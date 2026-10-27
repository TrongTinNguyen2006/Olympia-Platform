import React from 'react';
import { MatchState, CHPhuRuleMode } from '../../types.js';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Users, Bell, Trophy, ShieldAlert, XCircle, Clock, Sparkles, Target, Zap } from 'lucide-react';
import UniversalMediaPlayer from '../UniversalMediaPlayer.js';
import BorderTimer from '../BorderTimer.js';
import ShootoutScoreDots, { ImprovedScoreDots } from '../ShootoutScoreDots.js';
import RoundTitleScreen from '../common/RoundTitleScreen.js';

interface CHPhuViewerProps {
  matchState: MatchState;
  matchQuestions?: any;
}

export default function CHPhuViewer({ matchState, matchQuestions }: CHPhuViewerProps) {
  const chPhu = matchState.cau_hoi_phu;
  const isTimerRunning = matchState.isTimerRunning;
  const displaySeconds = matchState.timerSeconds;
  const defaultTotalTime = matchState.timerTotal || (chPhu?.ruleMode === 'SHOOTOUT' ? 10 : 15);

  const currentIdx = chPhu?.currentQuestionIndex ?? 0;
  const questionItem = matchQuestions?.cau_hoi_phu?.cau_hoi?.[currentIdx] || matchQuestions?.cau_hoi_phu?.[currentIdx];
  const questionRevealed = chPhu?.questionRevealed ?? false;
  const confirmedPlayers = chPhu?.confirmedPlayers || [];
  const ruleMode: CHPhuRuleMode = chPhu?.ruleMode || 'TRADITIONAL';

  // ONLY show main viewer interface when contestants are confirmed!
  if (!confirmedPlayers || confirmedPlayers.length === 0) {
    const customSetting = matchState?.roundCustomSettings?.['CH_PHU'];
    const customRoundLogo = customSetting?.customLogoUrl || customSetting?.logoUrl;
    const roundName = customSetting?.customName?.trim() || 'CÂU HỎI PHỤ';

    return <RoundTitleScreen title={roundName} logoUrl={customRoundLogo} roundKey="CH_PHU" id="viewer-chp-title" />;
  }

  const buzzedPlayer = matchState.buzzerState === 'BUZZED' ? matchState.buzzedPlayer : (chPhu?.buzzedPlayer ?? null);
  const winnerPosition = chPhu?.winnerPosition ?? null;

  return (
    <div className="w-full h-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between space-y-6 relative overflow-hidden">
      
      {/* 1. HEADER RULE MODE BANNER */}
      <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-5 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-teal-400 animate-spin" />
          <span className="text-xs font-black uppercase tracking-wider text-teal-300">
            CÂU HỎI PHỤ 2.0:
          </span>
          <span className="text-xs font-bold text-white uppercase bg-teal-500/15 border border-teal-500/30 px-2.5 py-0.5 rounded-full">
            {ruleMode === 'TRADITIONAL' ? '1. Luật Truyền Thống' : ruleMode === 'IMPROVED' ? '2. Luật Cải Tiến (Chạm 5)' : '3. Luật Luân Lưu (5 Lượt)'}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          {ruleMode === 'IMPROVED' && (
            <span className="text-indigo-300 font-bold bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-lg">
              Câu {currentIdx + 1} / {chPhu?.maxQuestions || 15} (Chạm 5đ Thắng)
            </span>
          )}
          {ruleMode === 'SHOOTOUT' && chPhu?.currentTurnPlayer && (
            <span className="text-amber-300 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 animate-pulse">
              <Zap className="w-3.5 h-3.5 fill-current text-amber-400" />
              Lượt trả lời: Bàn {chPhu.currentTurnPlayer} ({matchState.players[chPhu.currentTurnPlayer as 1|2|3|4]?.name})
            </span>
          )}
        </div>
      </div>

      {/* 2. TOP QUESTION PANEL WITH BORDER TIMER */}
      <AnimatePresence mode="wait">
        {questionRevealed && questionItem ? (
          <motion.div
            key="revealed-chp-question"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex-1 w-full bg-slate-950 border border-slate-850 rounded-2xl p-8 flex flex-col items-center justify-center text-center relative min-h-[320px] shadow-2xl overflow-visible"
          >
            {/* Perimeter Smooth Border Timer */}
            <BorderTimer seconds={displaySeconds} total={defaultTotalTime} isRunning={isTimerRunning} />

            {/* Question Text & Media Content */}
            {(() => {
              const text = questionItem.noi_dung || '';
              const len = text.length;
              const hasMedia = !!questionItem.media?.url;

              let fontClass = 'text-2xl md:text-3xl lg:text-4xl font-black';
              if (hasMedia) {
                if (len > 180) fontClass = 'text-base md:text-lg font-semibold';
                else if (len > 100) fontClass = 'text-lg md:text-xl font-bold';
                else fontClass = 'text-xl md:text-2xl font-extrabold';
              } else {
                if (len > 220) fontClass = 'text-lg md:text-xl lg:text-2xl font-semibold';
                else if (len > 140) fontClass = 'text-xl md:text-2xl lg:text-3xl font-bold';
                else if (len > 80) fontClass = 'text-2xl md:text-3xl lg:text-4xl font-extrabold';
                else fontClass = 'text-3xl md:text-4xl lg:text-5xl font-black';
              }

              return hasMedia ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center w-full my-auto z-10 px-2 pt-6">
                  <UniversalMediaPlayer 
                    media={questionItem.media} 
                    mediaControl={matchState.mediaControl} 
                    largeMode={false}
                    round="CH_PHU"
                    isTimerRunning={matchState.isTimerRunning}
                    hideControls={true}
                    className="w-full h-48"
                  />
                  <p className={`${fontClass} text-white leading-relaxed text-center md:text-left`}>
                    {text}
                  </p>
                </div>
              ) : (
                <p className={`${fontClass} text-white leading-relaxed text-center py-6 my-auto w-full z-10 px-4 pt-8`}>
                  {text}
                </p>
              );
            })()}
          </motion.div>
        ) : (
          <motion.div
            key="hidden-chp-question"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 w-full bg-slate-950 border border-slate-850 rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[320px] relative overflow-hidden"
          >
            <div className="text-6xl mb-4 animate-bounce">⭐️</div>
            <h4 className="text-xl font-black text-slate-300 uppercase tracking-widest">
              SẴN SÀNG CHO CÂU HỎI PHỤ SỐ {currentIdx + 1}
            </h4>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-2">
              Chờ hiệu lệnh công bố câu hỏi từ Ban tổ chức
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. BOTTOM BAR: CHP PARTICIPANTS & SCOREBOARD */}
      <div className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-black uppercase tracking-widest text-teal-400 flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-400" /> THÍ SINH THI ĐẤU CÂU HỎI PHỤ
          </span>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {confirmedPlayers.length} Thí sinh
          </span>
        </div>

        <div className={`grid gap-4 w-full ${
          confirmedPlayers.length === 1 ? 'grid-cols-1' :
          confirmedPlayers.length === 2 ? 'grid-cols-2' :
          confirmedPlayers.length === 3 ? 'grid-cols-3' : 'grid-cols-4'
        }`}>
          {confirmedPlayers.map((pos) => {
            const playerObj = matchState.players[pos as 1 | 2 | 3 | 4];
            const name = playerObj?.name || `Thí sinh Bàn ${pos}`;
            const isWinner = winnerPosition === pos;
            const isTurn = ruleMode === 'SHOOTOUT' && chPhu?.currentTurnPlayer === pos;
            const isBuzzed = ruleMode !== 'SHOOTOUT' && ((buzzedPlayer === pos) || isWinner);
            const isFoul = ruleMode !== 'SHOOTOUT' && chPhu?.foulPlayers?.includes(pos);
            const isIncorrect = ruleMode !== 'SHOOTOUT' && chPhu?.incorrectPlayers?.includes(pos);

            const score = chPhu?.scores?.[pos] ?? 0;
            const totalTime = chPhu?.totalTime?.[pos] ?? 0;
            const count = chPhu?.playerQuestionCounts?.[pos] ?? 0;

            let cardBg = "bg-slate-900/80 border-slate-800 text-slate-300";
            let statusText = null;

            if (isWinner) {
              cardBg = "bg-emerald-500 border-emerald-300 text-slate-950 font-black shadow-[0_0_35px_rgba(16,185,129,0.9)] scale-102 ring-2 ring-emerald-400";
              statusText = (
                <div className="flex items-center gap-1.5 bg-slate-950 text-emerald-400 text-xs px-3 py-1 rounded-full font-black animate-bounce shadow-md">
                  <Trophy className="w-3.5 h-3.5 fill-current" /> WINNER 🏆
                </div>
              );
            } else if (isTurn) {
              cardBg = "bg-amber-500/20 border-2 border-amber-400 text-white font-black shadow-[0_0_30px_rgba(245,158,11,0.6)] scale-102 ring-2 ring-amber-400/50 animate-pulse";
              statusText = (
                <span className="text-[10px] bg-amber-500 text-slate-950 px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
                  🎯 LƯỢT TRẢ LỜI
                </span>
              );
            } else if (isBuzzed) {
              cardBg = "bg-emerald-500/25 border-2 border-emerald-400 text-white font-black shadow-[0_0_35px_rgba(16,185,129,0.85)] scale-102 ring-2 ring-emerald-400/50 animate-pulse";
            } else if (isFoul) {
              cardBg = "bg-red-500/10 border border-red-500/30 text-red-400 font-bold";
              statusText = (
                <span className="text-[10px] bg-red-500/20 text-red-300 px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
                  ⚠️ PHẠM QUY
                </span>
              );
            } else if (isIncorrect) {
              cardBg = "bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold";
              statusText = (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
                  ❌ SAU KHÓA CHUÔNG
                </span>
              );
            }

            return (
              <motion.div
                key={pos}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border transition-all duration-300 flex items-center justify-between ${cardBg}`}
              >
                <div className="flex items-center gap-3 truncate">
                  <span className={`text-xs px-2.5 py-1 rounded-lg font-black uppercase tracking-wider ${
                    isWinner 
                      ? 'bg-slate-950 text-emerald-400' 
                      : isBuzzed 
                      ? 'bg-emerald-500 text-slate-950' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    Bàn {pos}
                  </span>
                  <div className="truncate">
                    <span className={`text-base md:text-lg font-black truncate block tracking-tight ${isWinner ? 'text-slate-950' : 'text-white'}`}>
                      {name}
                    </span>
                    {ruleMode === 'IMPROVED' && (
                      <div className="mt-1">
                        <ImprovedScoreDots
                          score={score}
                          totalTime={totalTime}
                          size="md"
                        />
                      </div>
                    )}
                    {ruleMode === 'SHOOTOUT' && (
                      <div className="mt-1">
                        <ShootoutScoreDots
                          history={chPhu?.history?.[pos]}
                          isCurrentTurn={isTurn}
                          size="lg"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {statusText && <div className="shrink-0 ml-2">{statusText}</div>}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
