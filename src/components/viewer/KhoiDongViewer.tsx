import React from 'react';
import { MatchState } from '../../types.js';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import UniversalMediaPlayer from '../UniversalMediaPlayer.js';
import SmoothTimerBar from '../SmoothTimerBar.js';
import { RoundLogoRenderer } from '../common/RoundLogoAssets.js';
import RoundTitleScreen from '../common/RoundTitleScreen.js';

interface KhoiDongViewerProps {
  matchState: MatchState;
  matchQuestions?: any;
}

export default function KhoiDongViewer({ matchState, matchQuestions }: KhoiDongViewerProps) {
  const khoiDong = matchState.khoi_dong;
  const customSetting = matchState?.roundCustomSettings?.['KHOI_DONG'];
  const customRoundLogo = customSetting?.customLogoUrl || customSetting?.logoUrl;
  const roundName = customSetting?.customName?.trim() || 'KHỞI ĐỘNG';

  // Chỉ khi hoàn thành việc chốt cài đặt lượt thi mới hiển thị lượt thi tương ứng
  if (!khoiDong?.isConfirmed) {
    return <RoundTitleScreen title={roundName} logoUrl={customRoundLogo} roundKey="KHOI_DONG" id="khoi-dong-viewer-unselected" />;
  }
  
  // individual: activePosition = currentPlayerIndex + 1. If collective, there is no active single contestant.
  const isIndividual = khoiDong.subRound === 'INDIVIDUAL';
  const activePosition = isIndividual && khoiDong.currentPlayerIndex !== null && khoiDong.currentPlayerIndex !== undefined ? (khoiDong.currentPlayerIndex + 1) : null;
  const timerSeconds = matchState.timerSeconds;
  const isTimerRunning = matchState.isTimerRunning;

  const activeQIdx = khoiDong.currentQuestionIndex ?? 0;
  const questionList = matchQuestions?.khoi_dong?.cau_hoi;
  const questionItem = questionList?.[activeQIdx];

  // Render count-up progress bar
  const defaultDuration = isIndividual 
    ? (khoiDong.individualTimerDuration || 60) 
    : (khoiDong.collectiveTimerDuration || 60);
  const maxTimer = matchState.timerTotal || defaultDuration;
  const countUpPercent = (isTimerRunning || timerSeconds > 0) && maxTimer > 0 
    ? Math.min(100, Math.max(0, ((maxTimer - timerSeconds) / maxTimer) * 100)) 
    : 0;

  const hasMedia = !!questionItem?.media?.url;

  return (
    <div className="relative w-full h-full flex flex-col p-2 space-y-4">
      {/* 3s PREP COUNTDOWN OVERLAY */}
      {khoiDong.isPrepRunning && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="p-8 bg-slate-900/90 border border-emerald-500/40 rounded-3xl shadow-2xl shadow-emerald-500/20 max-w-md w-full flex flex-col items-center gap-6">
            <h2 className="text-xl font-black text-white">
              {isIndividual 
                ? (activePosition ? `Thí sinh số ${activePosition}: ${matchState.players[activePosition as 1|2|3|4]?.name || ''}` : 'Khởi Động Cá Nhân')
                : 'Khởi Động Chung'}
            </h2>
            <motion.div
              key={khoiDong.prepCountdown ?? 3}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-8xl font-black font-mono text-emerald-400 drop-shadow-[0_0_35px_rgba(16,185,129,0.8)]"
            >
              {khoiDong.prepCountdown ?? 3}
            </motion.div>
          </div>
        </div>
      )}

      {/* HEADER SECTION: Horizontal line alignment of sub-round subtitle and compact clock */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white leading-tight">
              {isIndividual ? 'Phần Thi Cá Nhân' : 'Lượt thi chung'}
            </h3>
          </div>
        </div>

        {/* Compact count/clock indicator aligned horizontally */}
        <div className="flex items-center gap-3">
          {khoiDong.isStarted && (
            <div className="flex items-center gap-2 bg-slate-950/80 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl shadow-inner animate-fade-in">
              <span className="text-xs text-slate-400 font-bold">Câu</span>
              <span className="text-base font-mono font-black text-white">
                {(khoiDong.countAnswered ?? 0)}
                {isIndividual
                  ? (khoiDong.individualMaxQuestions && khoiDong.individualMaxQuestions > 0 ? `/${khoiDong.individualMaxQuestions}` : '')
                  : (khoiDong.collectiveMaxQuestions && khoiDong.collectiveMaxQuestions > 0 ? `/${khoiDong.collectiveMaxQuestions}` : '')}
              </span>
            </div>
          )}

          {/* TIMER COUNTDOWN BADGE FOR BOTH INDIVIDUAL AND COLLECTIVE */}
          {(isTimerRunning || timerSeconds > 0) && (
            <div className="flex items-center gap-2 bg-slate-950/90 border border-amber-500/50 px-3.5 py-1.5 rounded-xl shadow-lg animate-pulse">
              <span className="text-sm">⏱️</span>
              <span className="text-base font-mono font-black text-amber-300">
                {Math.ceil(timerSeconds)}s
              </span>
            </div>
          )}

          {!isIndividual && (
            /* Special status tags for Collective round */
            khoiDong.timerType === 'FIRST_5S' ? (
              <div className="bg-amber-500/20 border border-amber-500/50 px-3 py-1.5 rounded-xl text-amber-300 font-bold text-xs animate-pulse flex items-center gap-1">
                <span>🔔</span>
                <span>5s giật chuông</span>
              </div>
            ) : khoiDong.timerType === 'SECOND_5S' ? (
              <div className="bg-rose-500/20 border border-rose-500/50 px-3 py-1.5 rounded-xl text-rose-300 font-bold text-xs animate-pulse flex items-center gap-1">
                <span>🗣️</span>
                <span>5s trả lời</span>
              </div>
            ) : matchState.buzzerState === 'BUZZED' && matchState.buzzedPlayer ? (
              <div className="bg-emerald-500/20 border border-emerald-500/50 px-3 py-1.5 rounded-xl text-emerald-300 font-bold text-xs truncate max-w-[180px] flex items-center gap-1">
                <span>🔔</span>
                <span className="truncate">
                  {(() => {
                    const buzzedPos = matchState.buzzedPlayer as 1 | 2 | 3 | 4;
                    const rawName = matchState.players[buzzedPos]?.name || `Thí sinh ${buzzedPos}`;
                    const scoringMode = khoiDong.collectiveScoringMode || 'TRADITIONAL';
                    if (scoringMode !== 'TRADITIONAL') {
                      const wrongCount = khoiDong.wrongCounts?.[buzzedPos] ?? 0;
                      return `${rawName} | ${wrongCount}`;
                    }
                    return rawName;
                  })()}
                </span>
              </div>
            ) : null
          )}
        </div>
      </div>

      {/* QUESTION & MEDIA CONTENT ZONE - EXPANDED FULL WIDTH */}
      <div className="flex-1 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-center shadow-lg relative min-h-[420px] overflow-hidden">
        {!khoiDong.isStarted ? (
          // Waiting screen
          <div className="flex flex-col items-center justify-center text-center space-y-6 py-12 max-w-2xl mx-auto">
            {customRoundLogo && customRoundLogo !== 'none' && (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-900 border border-emerald-500/30 flex items-center justify-center p-3 shadow-lg shadow-emerald-500/10">
                <RoundLogoRenderer logoIdOrUrl={customRoundLogo} className="w-full h-full object-contain" />
              </div>
            )}
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-white tracking-tight">
                {isIndividual 
                  ? (activePosition ? (matchState.players[activePosition as 1 | 2 | 3 | 4]?.name || `Thí sinh ${activePosition}`) : 'Khởi Động Cá Nhân') 
                  : 'Khởi Động Chung'
                }
              </h2>
            </div>
          </div>
        ) : (
          // Active question content
          <div className={`w-full h-full flex flex-col justify-center ${hasMedia ? 'grid grid-cols-1 md:grid-cols-2 gap-8 items-center' : 'w-full text-center px-1 md:px-2'}`}>
            
            {/* Left side: Question text (Full screen if no media, otherwise 1/2 left) */}
            <div className="space-y-4 flex flex-col justify-center h-full w-full">
              <div className={`flex items-center ${hasMedia ? 'text-left' : 'justify-center text-center'} min-h-[150px] w-full`}>
                <p className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-relaxed tracking-tight w-full">
                  {questionItem?.noi_dung || 'Nội dung câu hỏi chưa hiển thị...'}
                </p>
              </div>
            </div>

            {/* Right side: Image / Media with placeholder bottom (1/2 right, only present if hasMedia is true) */}
            {hasMedia && (
              <div className="flex flex-col w-full h-full justify-center">
                <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4 flex flex-col items-center shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-transparent to-slate-950/40 pointer-events-none" />
                  
                  <UniversalMediaPlayer 
                    media={questionItem.media} 
                    mediaControl={matchState.mediaControl} 
                    largeMode={true}
                    round="KHOI_DONG"
                    isTimerRunning={isTimerRunning}
                    hideControls={true}
                    className="w-full h-56 md:h-72 lg:h-[350px] object-contain rounded-xl relative z-10"
                  />
                  
                  {/* Decorative / Aesthetic Caption Placeholder Under the Image */}
                  <div className="mt-4 w-full bg-slate-950/60 border border-slate-800/40 rounded-xl py-3 px-4 flex items-center justify-between z-10 shadow-inner">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="w-1.5 h-1.5 bg-emerald-500/60 rounded-full" />
                      <span className="w-1.5 h-1.5 bg-emerald-500/30 rounded-full" />
                    </div>
                    <div className="h-1 w-24 bg-slate-800/80 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500/40 w-1/2 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        )}

        {/* 3s Large Number Countdown Badge at Bottom-Right */}
        {(khoiDong.threeSecCountdown ?? 0) > 0 && (
          <div className="absolute bottom-4 right-5 bg-amber-500/30 border-2 border-amber-400 text-amber-300 font-mono font-black text-2xl md:text-3xl px-4 py-1.5 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center animate-pulse z-30 pointer-events-none min-w-[52px]">
            {khoiDong.threeSecCountdown}
          </div>
        )}

        {/* BOTTOM TIMER BAR */}
        {(isTimerRunning || timerSeconds > 0) && (
          <SmoothTimerBar
            seconds={timerSeconds}
            total={maxTimer}
            isRunning={isTimerRunning}
            className="absolute bottom-0 left-0 right-0 border-t border-slate-800/80 z-30"
          />
        )}
      </div>
    </div>
  );
}
