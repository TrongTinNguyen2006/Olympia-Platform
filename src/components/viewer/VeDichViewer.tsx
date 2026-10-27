import React, { useMemo, useState, useEffect, useRef } from 'react';
import { MatchState } from '../../types.js';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ShieldAlert, Award, Clock } from 'lucide-react';
import UniversalMediaPlayer from '../UniversalMediaPlayer.js';
import BorderTimer from '../BorderTimer.js';
import { RoundLogoRenderer } from '../common/RoundLogoAssets.js';
import RoundTitleScreen from '../common/RoundTitleScreen.js';

interface VeDichViewerProps {
  matchState: MatchState;
  matchQuestions?: any;
}

export default function VeDichViewer({ matchState, matchQuestions }: VeDichViewerProps) {
  const veDich = matchState.ve_dich;
  const isTimerRunning = matchState.isTimerRunning;
  const timerSeconds = matchState.timerSeconds;

  // Find active player turn - strictly only if controller has selected a contestant (0 to 3)
  const hasActivePlayer = typeof veDich?.currentPlayerIndex === 'number' && veDich.currentPlayerIndex >= 0 && veDich.currentPlayerIndex <= 3;
  const activePosition = hasActivePlayer ? ((veDich.currentPlayerIndex + 1) as 1 | 2 | 3 | 4) : null;
  const activePlayer = activePosition ? matchState.players[activePosition] : null;
  const activeTurn = activePosition ? veDich.turns[activePosition] : null;

  const ruleMode = veDich?.ruleMode || 'O20_PLUS';
  const o19Packages = veDich?.o19PresetPackages || [
    { id: 'pkg1', name: 'Gói 40 điểm', pointsList: [10, 10, 20], totalPoints: 40 },
    { id: 'pkg2', name: 'Gói 60 điểm', pointsList: [10, 20, 30], totalPoints: 60 },
    { id: 'pkg3', name: 'Gói 80 điểm', pointsList: [20, 30, 30], totalPoints: 80 },
    { id: 'pkg4', name: 'Gói 100 điểm', pointsList: [30, 30, 40], totalPoints: 100 }
  ];
  const practiceTimer = veDich?.practiceTimer;

  // Find confirmed question item
  const currentQIndex = activeTurn?.currentQuestionIndex ?? 0;
  const activeQuestionChoice = activeTurn?.chosenPackage?.[currentQIndex];
  const pointsOfCurrentQ = activeQuestionChoice?.points;

  const activeQuestionItem = useMemo(() => {
    if (!activeTurn?.currentQuestionConfirmed || !activeQuestionChoice?.questionId || !matchQuestions?.ve_dich?.cau_hoi) {
      return null;
    }
    return matchQuestions.ve_dich.cau_hoi.find((q: any) => q.id === activeQuestionChoice.questionId);
  }, [activeTurn?.currentQuestionConfirmed, activeQuestionChoice?.questionId, matchQuestions]);

  const defaultTotalTime = matchState.timerTotal || (pointsOfCurrentQ === 10 ? 10 : pointsOfCurrentQ === 20 ? 15 : pointsOfCurrentQ === 30 ? 20 : 30);
  const displaySeconds = (isTimerRunning || timerSeconds > 0) ? timerSeconds : defaultTotalTime;

  // Track grading feedback for each contestant (correct / incorrect for 3s)
  const [gradedFeedback, setGradedFeedback] = useState<Record<number, { type: 'correct' | 'incorrect'; pointsDelta: number }>>({});
  const prevScoresRef = useRef<Record<number, number>>({});
  const prevClaimPlayerRef = useRef<number | null>(null);

  useEffect(() => {
    const currentScores: Record<number, number> = {};
    ([1, 2, 3, 4] as const).forEach((p) => {
      currentScores[p] = matchState.players[p]?.score ?? 0;
    });

    const prevScores = prevScoresRef.current;
    const currentClaimPlayer = activeTurn?.claimBuzzerPlayer ?? null;
    const prevClaimPlayer = prevClaimPlayerRef.current;

    ([1, 2, 3, 4] as const).forEach((p) => {
      const oldScore = prevScores[p];
      const newScore = currentScores[p];

      if (oldScore !== undefined && oldScore !== newScore) {
        const delta = newScore - oldScore;
        const feedbackType = delta > 0 ? 'correct' : 'incorrect';
        
        setGradedFeedback((prev) => ({
          ...prev,
          [p]: { type: feedbackType, pointsDelta: delta }
        }));

        setTimeout(() => {
          setGradedFeedback((prev) => {
            const next = { ...prev };
            delete next[p];
            return next;
          });
        }, 3000);
      }
    });

    if (prevClaimPlayer && !currentClaimPlayer) {
      const p = prevClaimPlayer;
      const oldScore = prevScores[p] ?? 0;
      const newScore = currentScores[p] ?? 0;
      if (newScore <= oldScore) {
        setGradedFeedback((prev) => ({
          ...prev,
          [p]: { type: 'incorrect', pointsDelta: newScore - oldScore }
        }));

        setTimeout(() => {
          setGradedFeedback((prev) => {
            const next = { ...prev };
            delete next[p];
            return next;
          });
        }, 3000);
      }
    }

    prevScoresRef.current = currentScores;
    prevClaimPlayerRef.current = currentClaimPlayer;
  }, [matchState.players, activeTurn?.claimBuzzerPlayer]);

  const draft = activeTurn?.draftPackage || [null, null, null];

  return (
    <div className="relative w-full h-full p-2" id="ve-dich-viewer-root">
      {/* PRACTICE TIMER OVERLAY BADGE */}
      {practiceTimer?.isRunning && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-500/20 border-2 border-amber-400 text-amber-300 backdrop-blur-md px-6 py-2 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.5)] flex items-center gap-3 animate-pulse">
          <Clock className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-black uppercase tracking-wider">
            THỰC HÀNH - {practiceTimer.type === 'MAIN' ? 'THI CHÍNH' : 'GIÀNH QUYỀN'}
          </span>
          <span className="text-xl font-mono font-black text-white bg-amber-500/30 px-3 py-0.5 rounded-lg border border-amber-400/40">
            {practiceTimer.secondsLeft}s
          </span>
        </div>
      )}

      {activePlayer && activeTurn ? (
        !activeTurn.packageConfirmed ? (
          !activeTurn.showPackageBoard ? (
            /* CONTESTANT INTRO SCREEN BEFORE SHOWING PACKAGE BOARD */
            <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto space-y-6 py-12 text-center animate-fade-in" id="viewer-vd-intro-screen">
              <div className="w-20 h-20 bg-teal-500/10 border border-teal-500/30 rounded-3xl flex items-center justify-center text-teal-400 shadow-xl shadow-teal-500/10">
                <Award className="w-10 h-10 animate-pulse" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-wide">
                  {activePlayer.name}
                </h2>
                <p className="text-base text-slate-300 font-medium">
                  Điểm số hiện tại: <span className="font-black text-amber-400">{activePlayer.score}</span>
                </p>
                <p className="text-xs text-slate-500 italic mt-2">
                  Vui lòng chờ ban tổ chức mở bảng chọn gói điểm...
                </p>
              </div>
            </div>
          ) : (
            /* DISPLAY PACKAGE SELECTION BOARD (O20+ 1-row grid or O19 preset packages) */
            <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto space-y-8 py-10" id="viewer-package-selection-screen">
              <div className="text-center space-y-2">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-widest bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full">
                  {ruleMode === 'O20_PLUS' ? 'Bảng Lựa Chọn Gói Điểm (Luật O20+)' : 'Bảng Lựa Chọn Gói Điểm (Luật O19)'}
                </span>
                <h2 className="text-3xl font-black text-white uppercase tracking-wider">{activePlayer.name}</h2>
              </div>

              {ruleMode === 'O20_PLUS' ? (
                /* O20+ DYNAMIC 1-ROW GRID (N columns = draft.length) */
                <div className="w-full flex items-center justify-center gap-4 bg-slate-900/60 p-8 rounded-3xl border border-slate-800 shadow-2xl overflow-x-auto" id="viewer-package-grid-o20">
                  {draft.map((pts, colIdx) => {
                    const hasSelected = pts !== null;
                    return (
                      <div key={colIdx} className="flex-1 min-w-[120px] max-w-[200px] flex flex-col items-center space-y-3">
                        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                          Câu {colIdx + 1}
                        </span>
                        <div
                          className={`w-full py-8 rounded-2xl border flex flex-col items-center justify-center transition-all duration-300 ${
                            hasSelected
                              ? pts === 10
                                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/20 scale-105 ring-2 ring-emerald-400/40'
                                : pts === 20
                                ? 'bg-teal-500/20 border-teal-400 text-teal-300 shadow-lg shadow-teal-500/20 scale-105 ring-2 ring-teal-400/40'
                                : pts === 30
                                ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 shadow-lg shadow-indigo-500/20 scale-105 ring-2 ring-indigo-400/40'
                                : 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-lg shadow-purple-500/20 scale-105 ring-2 ring-purple-400/40'
                              : 'bg-slate-950/80 border-slate-800 text-slate-600'
                          }`}
                        >
                          <span className="text-3xl md:text-4xl font-black font-mono">
                            {hasSelected ? `${pts}Đ` : '?'}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider mt-1 opacity-75">
                            {hasSelected ? `${pts === 10 ? '10s' : pts === 20 ? '15s' : pts === 30 ? '20s' : '30s'}` : 'Chưa chọn'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* O19 PRESET PACKAGES BOARD */
                <div
                  className="w-full grid gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800 shadow-2xl"
                  style={{ gridTemplateColumns: `repeat(${o19Packages.length || 4}, minmax(0, 1fr))` }}
                  id="viewer-package-grid-o19"
                >
                  {o19Packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="p-6 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center hover:border-indigo-500/50 transition-all shadow-xl"
                    >
                      <div className="text-4xl md:text-5xl font-black font-mono text-amber-400">{pkg.totalPoints}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        ) : (
          // STANDARD SCREEN WHEN PACKAGE IS CONFIRMED
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 h-full overflow-y-auto min-w-0" id="viewer-confirmed-screen">
            
            {/* LEFT SIDE PANEL: ACTIVE TURN OVERVIEW & OTHER CONTESTANTS (COL SPAN 4) */}
            <div className="col-span-1 lg:col-span-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 min-w-0">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                  <Award className="w-5 h-5 text-yellow-400 shrink-0" />
                  <div>
                    <h3 className="text-sm font-extrabold text-white font-sans">Thí Sinh Hiện Tại</h3>
                  </div>
                </div>

                {/* Profile Card for Main Contestant - Clean name & score only */}
                {(() => {
                  const isBuzzed = activeTurn?.claimBuzzerState === 'BUZZED' && activeTurn?.claimBuzzerPlayer === activePosition;
                  const feedback = gradedFeedback[activePosition];

                  let cardBgClass = "bg-slate-950 border-slate-800/80";
                  let statusBadge = null;

                  if (feedback?.type === 'correct') {
                    cardBgClass = "bg-emerald-950/90 border-2 border-emerald-400 shadow-xl shadow-emerald-500/30 scale-102";
                    statusBadge = <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded font-mono uppercase">ĐÚNG {feedback.pointsDelta > 0 ? `+${feedback.pointsDelta}` : ''}</span>;
                  } else if (feedback?.type === 'incorrect') {
                    cardBgClass = "bg-red-950/90 border-2 border-red-500 shadow-xl shadow-red-500/30 scale-102";
                    statusBadge = <span className="text-[10px] bg-red-500 text-white font-black px-2 py-0.5 rounded font-mono uppercase">SAI {feedback.pointsDelta}</span>;
                  } else if (isBuzzed) {
                    cardBgClass = "bg-yellow-950/90 border-2 border-yellow-400 shadow-xl shadow-yellow-500/30 ring-2 ring-yellow-400 animate-pulse";
                    statusBadge = null;
                  }

                  return (
                    <div className={`p-4 rounded-2xl relative overflow-hidden transition-all duration-300 border ${cardBgClass}`}>
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        {statusBadge}
                        {activeTurn.starUsed && (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                          >
                            <Star className="w-6 h-6 text-yellow-400 fill-current drop-shadow-lg" />
                          </motion.div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2">
                        <h4 className="text-2xl font-black text-white tracking-tight truncate pr-10">
                          {activePlayer.name}
                        </h4>
                        <div className="flex items-baseline gap-1.5">
                          <strong className="text-4xl font-black font-mono text-yellow-400 leading-none">{activePlayer.score}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Package Choices - Show ONLY Points */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Gói câu hỏi lựa chọn:</span>
                  <div
                    className="grid gap-2"
                    style={{ gridTemplateColumns: `repeat(${activeTurn.chosenPackage.length}, minmax(0, 1fr))` }}
                  >
                    {activeTurn.chosenPackage.map((q, idx) => {
                      const isPast = idx < currentQIndex;
                      const isActive = idx === currentQIndex;

                      return (
                        <div
                          key={idx}
                          className={`py-3 px-2 rounded-xl border text-center transition-all ${
                            isActive
                              ? 'bg-yellow-500/15 border-yellow-500 text-yellow-300 shadow-md shadow-yellow-500/10 font-bold scale-102'
                              : isPast
                              ? 'bg-slate-950 border-slate-900 text-slate-600 opacity-50'
                              : 'bg-slate-950 border-slate-800 text-slate-300'
                          }`}
                        >
                          <strong className="text-base md:text-lg font-black font-mono block">{q.points}</strong>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Other 3 Contestants Scores */}
                <div className="space-y-2 pt-3 border-t border-slate-800/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Điểm số các thí sinh khác:</span>
                  <div className="space-y-2">
                    {([1, 2, 3, 4] as const).filter(p => p !== activePosition).map(p => {
                      const player = matchState.players[p];
                      const isBuzzed = activeTurn?.claimBuzzerState === 'BUZZED' && activeTurn?.claimBuzzerPlayer === p;
                      const feedback = gradedFeedback[p];

                      let rowBgClass = "bg-slate-950/80 border-slate-850";
                      let badge = null;

                      if (feedback?.type === 'correct') {
                        rowBgClass = "bg-emerald-950/90 border-2 border-emerald-400 text-emerald-200 shadow-md shadow-emerald-500/20";
                        badge = <span className="text-[9px] font-black text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-1.5 py-0.5 rounded uppercase">ĐÚNG {feedback.pointsDelta > 0 ? `+${feedback.pointsDelta}` : ''}</span>;
                      } else if (feedback?.type === 'incorrect') {
                        rowBgClass = "bg-red-950/90 border-2 border-red-500 text-red-200 shadow-md shadow-red-500/20";
                        badge = <span className="text-[9px] font-black text-red-300 bg-red-500/20 border border-red-500/40 px-1.5 py-0.5 rounded uppercase">SAI {feedback.pointsDelta}</span>;
                      } else if (isBuzzed) {
                        rowBgClass = "bg-yellow-950/90 border-2 border-yellow-400 text-yellow-200 shadow-lg shadow-yellow-500/30 ring-2 ring-yellow-400 animate-pulse";
                        badge = null;
                      }

                      return (
                        <div key={p} className={`p-2.5 rounded-xl border flex items-center justify-between transition-all duration-300 ${rowBgClass}`}>
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-[10px] text-slate-400 shrink-0">
                              {p}
                            </span>
                            <span className="font-bold text-xs text-slate-200 truncate">{player?.name || `Thí sinh ${p}`}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            {badge}
                            <strong className="font-mono font-black text-emerald-400 text-sm">{player?.score ?? 0}</strong>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Golden Star Ambient Banner */}
              {activeTurn.starUsed && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-yellow-500/15 border border-yellow-500/20 rounded-xl flex items-center gap-2.5 text-yellow-300 shrink-0"
                >
                  <Star className="w-4 h-4 fill-current shrink-0 animate-bounce text-yellow-400" />
                  <div className="text-[11px] leading-tight">
                    <strong className="block font-bold">ĐÃ ĐẶT NGÔI SAO HY VỌNG!</strong>
                  </div>
                </motion.div>
              )}
            </div>

            {/* RIGHT SIDE PANEL: LIVE INTERACTION & QUESTION (COL SPAN 8) */}
            <div className="col-span-1 lg:col-span-8 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-center h-full relative min-w-0">
              
              {/* ACTIVE QUESTION PANEL (MAXIMIZED AREA & CENTERED WITH BORDER TIMER) */}
              <AnimatePresence mode="wait">
                {activeTurn.currentQuestionConfirmed && activeQuestionItem ? (
                  <motion.div
                    key="revealed-question"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="w-full h-full p-8 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-visible min-h-[360px] shadow-2xl"
                  >
                    {/* Perimeter Border Timer */}
                    <BorderTimer seconds={displaySeconds} total={defaultTotalTime} isRunning={isTimerRunning || !!veDich?.practiceTimer?.isRunning} />

                    {/* Top-Right Star Badge for NSHV */}
                    {activeTurn.starUsed && (
                      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-yellow-500/20 border border-yellow-400/50 px-3.5 py-1.5 rounded-2xl shadow-[0_0_20px_rgba(250,204,21,0.4)] backdrop-blur-md">
                        <motion.div
                          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.25, 1] }}
                          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          <Star className="w-6 h-6 text-yellow-300 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.9)]" />
                        </motion.div>
                        <span className="text-xs font-black text-yellow-300 uppercase tracking-wider">Ngôi Sao Hy Vọng</span>
                      </div>
                    )}

                    {(() => {
                      const text = activeQuestionItem.noi_dung || '';
                      const len = text.length;
                      const hasMedia = !!activeQuestionItem.media?.url;

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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center w-full my-auto z-10 px-2">
                          <UniversalMediaPlayer 
                            media={activeQuestionItem.media} 
                            mediaControl={matchState.mediaControl} 
                            largeMode={false}
                            round="VE_DICH"
                            isTimerRunning={matchState.isTimerRunning}
                            hideControls={true}
                            className="w-full h-48"
                          />
                          <p className={`${fontClass} text-white leading-relaxed text-center md:text-left`}>
                            {text}
                          </p>
                        </div>
                      ) : (
                        <p className={`${fontClass} text-white leading-relaxed text-center py-6 my-auto w-full z-10 px-4`}>
                          {text}
                        </p>
                      );
                    })()}
                  </motion.div>
                ) : (
                  // PLACEHOLDER WAITING LOGO WHEN QUESTION IS NOT CONFIRMED YET
                  <motion.div
                    key="hidden-question"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full p-8 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col items-center justify-center text-center min-h-[360px] relative overflow-hidden"
                  >
                    {/* Top-Right Star Badge for NSHV even in placeholder if chosen */}
                    {activeTurn.starUsed && (
                      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-yellow-500/20 border border-yellow-400/50 px-3.5 py-1.5 rounded-2xl shadow-[0_0_20px_rgba(250,204,21,0.4)] backdrop-blur-md">
                        <motion.div
                          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.25, 1] }}
                          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          <Star className="w-6 h-6 text-yellow-300 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.9)]" />
                        </motion.div>
                        <span className="text-xs font-black text-yellow-300 uppercase tracking-wider">Ngôi Sao Hy Vọng</span>
                      </div>
                    )}

                    <div className="text-6xl mb-4 animate-spin duration-1000">⭐️</div>
                    <h4 className="text-lg font-black text-slate-300 uppercase tracking-widest">
                      Sẵn Sàng Cho Câu Số {currentQIndex + 1} ({pointsOfCurrentQ || 20}Đ)
                    </h4>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Steal/Claim Status Bar */}
              {activeTurn.claimBuzzerState === 'OPEN' && (
                <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 rounded-xl text-xs text-center font-bold animate-pulse z-10">
                  🔔 Xin mời 3 thí sinh còn lại nhấn chuông cướp quyền trả lời
                </div>
              )}
            </div>

          </div>
        )
      ) : (
        (() => {
          const customSetting = matchState?.roundCustomSettings?.['VE_DICH'];
          const customRoundLogo = customSetting?.customLogoUrl || customSetting?.logoUrl;
          const roundName = customSetting?.customName?.trim() || 'VỀ ĐÍCH';

          return <RoundTitleScreen title={roundName} logoUrl={customRoundLogo} roundKey="VE_DICH" id="viewer-ve-dich-waiting" />;
        })()
      )}
    </div>
  );
}
