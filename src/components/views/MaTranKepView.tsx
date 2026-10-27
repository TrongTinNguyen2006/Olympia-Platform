import React, { useState, useEffect } from 'react';
import { MatchState } from '../../types';
import { Award, Clock, CheckCircle, FastForward, Lock, Sparkles, UserCheck, Check, AlertCircle } from 'lucide-react';
import RoundTitleScreen from '../common/RoundTitleScreen.js';

interface MaTranKepViewProps {
  matchState: MatchState;
}

export const MaTranKepView: React.FC<MaTranKepViewProps> = ({ matchState }) => {
  const mtk = matchState.ma_tran_kep;

  // If status is IDLE (controller hasn't clicked "Chuẩn bị"), display the standardized Round Title Screen
  if (!mtk || mtk.status === 'IDLE') {
    const customSetting = matchState?.roundCustomSettings?.['MA_TRAN_KEP'];
    const customRoundLogo = customSetting?.customLogoUrl || customSetting?.logoUrl;
    const roundName = customSetting?.customName?.trim() || 'MA TRẬN KÉP';

    return <RoundTitleScreen title={roundName} logoUrl={customRoundLogo} roundKey="MA_TRAN_KEP" id="viewer-ma-tran-kep-title" />;
  }

  const timerLeft = mtk?.timerSecondsLeft ?? 180;
  const questions = mtk?.questions || (matchState as any)?.matchQuestions?.ma_tran_kep?.cau_hoi || [];
  const activePos = mtk?.activePlayerPosition || 1;

  // Local ticker state for smooth sub-second updates & lock countdowns
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 250);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const activePlayer = matchState.players[activePos];
  const activePlayerState = mtk?.playerStates?.[activePos];
  const activeBoard = activePlayerState?.board || [];
  const activeSelectedIndices = activePlayerState?.selectedCellIndices || [];
  const activeFeedback = activePlayerState?.feedbackState || 'NONE';
  const activeQIdx = activePlayerState?.currentQuestionIndex ?? 0;
  const activeQ = questions[activeQIdx];

  return (
    <div className="w-full min-h-[calc(100vh-140px)] bg-slate-950 text-white p-4 md:p-6 flex flex-col gap-5 justify-between font-sans overflow-hidden">
      {/* Top Banner & Centered Clock Header */}
      <div className="relative w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Title */}
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-indigo-600/30 text-indigo-400 rounded-xl border border-indigo-400/40 shadow-lg">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-amber-300 tracking-wider">
              MA TRẬN KÉP
            </h1>
          </div>
        </div>

        {/* Center Prominent Clock */}
        <div className="md:absolute md:left-1/2 md:-translate-x-1/2 flex items-center gap-3 bg-slate-950/90 px-8 py-2.5 rounded-2xl border-2 border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.2)] font-mono">
          <Clock className="w-7 h-7 text-amber-400 animate-spin" />
          <span className="text-3xl md:text-4xl font-black text-amber-400 tracking-wider">
            {formatTimer(timerLeft)}
          </span>
        </div>
      </div>

      {/* Main Grid Body (1/3 Left Stats + 2/3 Right Large Active Board) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-stretch">
        
        {/* LEFT 1/3 (Col 1 to 4): Status of all 4 Candidates */}
        <div className="lg:col-span-4 flex flex-col gap-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 p-4 shadow-2xl justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h2 className="text-sm font-black uppercase text-indigo-400 tracking-wider flex items-center gap-2">
              <span>Trạng thái thí sinh</span>
            </h2>
            <span className="text-xs font-semibold text-slate-400">4 Thí sinh</span>
          </div>

          <div className="flex flex-col gap-3 flex-1 justify-center">
            {[1, 2, 3, 4].map(pos => {
              const p = matchState.players[pos];
              const pState = mtk?.playerStates?.[pos];
              const solvedCount = pState?.solvedQuestionIds?.length || 0;
              const skippedCount = pState?.skippedQuestionIds?.length || 0;
              const isFinished = pState?.isFinished || false;
              const isLocked = pState?.isLocked || false;
              const lockEnd = pState?.lockEndTime || 0;
              const feedbackState = pState?.feedbackState || 'NONE';
              const isActiveDisplay = activePos === pos;

              // Calculate lock remaining seconds
              const lockRemainingSec = isLocked && lockEnd ? Math.max(0, Math.ceil((lockEnd - now) / 1000)) : 0;

              // Determine visual styling based on feedback & lock
              let cardBg = 'bg-slate-950/80 border-slate-800 text-white';
              let statusText = null;

              if (isFinished) {
                cardBg = 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200';
                statusText = (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Hoàn thành 12/12
                  </span>
                );
              } else if (feedbackState === 'BOTH_CORRECT' || feedbackState === 'ONE_CORRECT') {
                // Correct feedback: Flash Green for 1s
                cardBg = 'bg-emerald-500/30 border-emerald-400 text-emerald-100 ring-2 ring-emerald-400 animate-pulse shadow-lg shadow-emerald-500/20';
                statusText = (
                  <span className="text-xs font-extrabold text-emerald-300 flex items-center gap-1">
                    <Check className="w-4 h-4 text-emerald-400" /> Trả lời đúng!
                  </span>
                );
              } else if (isLocked || lockRemainingSec > 0) {
                // Passed/Locked: Dark black background with 5s countdown timer
                cardBg = 'bg-black/95 border-rose-900/60 text-slate-500 shadow-none';
                statusText = (
                  <span className="text-xs font-black text-rose-400 flex items-center gap-1 animate-pulse">
                    <Lock className="w-3.5 h-3.5" /> Bị khoá ({lockRemainingSec}s)
                  </span>
                );
              } else if (feedbackState === 'BOTH_INCORRECT') {
                cardBg = 'bg-rose-950/60 border-rose-500/50 text-rose-200';
                statusText = (
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Chưa chính xác
                  </span>
                );
              }

              return (
                <div
                  key={pos}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col gap-2 relative overflow-hidden ${cardBg} ${
                    isActiveDisplay ? 'ring-2 ring-indigo-500 shadow-indigo-500/20 shadow-lg' : ''
                  }`}
                >
                  {/* Contestant Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-7 h-7 flex items-center justify-center rounded-full font-black text-xs ${
                        isActiveDisplay ? 'bg-indigo-600 text-white ring-2 ring-indigo-300' : 'bg-slate-800 text-slate-300'
                      }`}>
                        V{pos}
                      </span>
                      <div>
                        <h3 className="font-bold text-sm text-slate-100 truncate max-w-[140px]">
                          {p?.name || `Thí sinh ${pos}`}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-amber-400">
                        {pState?.score ?? (p?.score || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Status & Solved Counts */}
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pt-1 border-t border-slate-800/60">
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Đúng: {solvedCount}/12
                      </span>
                      <span className="text-amber-400 flex items-center gap-1">
                        <FastForward className="w-3.5 h-3.5" /> Bỏ qua: {skippedCount}
                      </span>
                    </div>
                    {statusText}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT 2/3 (Col 5 to 12): Large Centered Board of Selected Candidate */}
        <div className="lg:col-span-8 bg-slate-900/90 rounded-2xl border-2 border-indigo-500/40 p-5 md:p-6 shadow-2xl flex flex-col justify-between gap-4">
          
          {/* Active Candidate Info & Current Question Banner */}
          <div className="bg-slate-950 p-4 rounded-xl border border-indigo-500/30 flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-extrabold text-xs">
                  THÍ SINH {activePos}
                </span>
                <span className="text-lg font-bold text-white">
                  {activePlayer?.name || `Thí sinh ${activePos}`}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-400">
                Tiến độ: <span className="text-emerald-400">{activePlayerState?.solvedQuestionIds?.length || 0}/12 câu</span>
              </div>
            </div>

            {/* Current Question Text */}
            {mtk?.status !== 'RUNNING' && mtk?.status !== 'ENDED' ? (
              <div className="p-3 bg-slate-900/80 text-slate-400 rounded-lg text-sm font-semibold text-center border border-slate-800">
                Chờ thí sinh bắt đầu...
              </div>
            ) : activePlayerState?.isFinished ? (
              <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-lg text-sm font-bold text-center border border-emerald-500/40 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" /> Thí sinh đã giải thành công tất cả 12 câu hỏi!
              </div>
            ) : activePlayerState?.isLocked ? (
              <div className="p-3 bg-rose-500/20 text-rose-300 rounded-lg text-sm font-bold text-center border border-rose-500/40 animate-pulse flex items-center justify-center gap-2">
                <Lock className="w-5 h-5 text-rose-400" /> Thí sinh vừa bấm bỏ qua — Đang bị khoá 5 giây
              </div>
            ) : (
              <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800">
                <div className="text-[11px] font-extrabold text-indigo-400 uppercase tracking-wider mb-1">
                  Câu hỏi số {activeQIdx + 1} / 12:
                </div>
                <div className="text-slate-100 font-bold text-sm md:text-base leading-relaxed">
                  {activeQ ? activeQ.noi_dung : `Câu hỏi ${activeQIdx + 1}`}
                </div>
              </div>
            )}
          </div>

          {/* Large 4x3 Grid Cards Board */}
          <div className="grid grid-cols-4 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800 flex-1 items-center">
            {activeBoard.length === 0 ? (
              <div className="col-span-4 text-center py-12 text-slate-500 italic text-sm">
                Vòng thi chưa bắt đầu
              </div>
            ) : (
              activeBoard.map((card, cIdx) => {
                const isSelected = activeSelectedIndices.includes(cIdx);

                let cellStyle = 'bg-slate-900/90 border-slate-800 text-slate-200 hover:border-slate-700';
                if (isSelected) {
                  if (activeFeedback === 'BOTH_CORRECT') {
                    cellStyle = 'bg-emerald-900/90 border-emerald-400 text-emerald-100 ring-2 ring-emerald-400 font-extrabold scale-105 shadow-lg shadow-emerald-500/30';
                  } else if (activeFeedback === 'ONE_CORRECT') {
                    cellStyle = 'bg-amber-900/90 border-amber-400 text-amber-100 ring-2 ring-amber-400 font-extrabold scale-105 shadow-lg shadow-amber-500/30';
                  } else if (activeFeedback === 'BOTH_INCORRECT') {
                    cellStyle = 'bg-rose-900/90 border-rose-500 text-rose-100 ring-2 ring-rose-500 font-extrabold scale-105 shadow-lg shadow-rose-500/30';
                  } else {
                    cellStyle = 'bg-indigo-900 border-indigo-400 text-white ring-2 ring-indigo-400 font-extrabold shadow-xl shadow-indigo-500/40 scale-105';
                  }
                }

                return (
                  <div
                    key={cIdx}
                    className={`p-3 h-20 md:h-24 rounded-xl border flex items-center justify-center text-center transition-all duration-200 ${cellStyle}`}
                  >
                    <span className="font-extrabold text-xs md:text-sm leading-snug line-clamp-3">
                      {mtk?.status === 'RUNNING' || mtk?.status === 'ENDED' ? card.text : ''}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
