import React from 'react';
import { MatchState } from '../../types.js';
import { Zap, Clock, Sparkles, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import UniversalMediaPlayer from '../UniversalMediaPlayer.js';
import { RoundLogoRenderer } from '../common/RoundLogoAssets.js';
import RoundTitleScreen from '../common/RoundTitleScreen.js';

interface DauTriViewerProps {
  state: MatchState;
  questions: any;
}

export const DauTriViewer: React.FC<DauTriViewerProps> = ({ state, questions }) => {
  const customSetting = state?.roundCustomSettings?.['DAU_TRI'];
  const customRoundLogo = customSetting?.customLogoUrl || customSetting?.logoUrl;
  const roundName = customSetting?.customName?.trim() || 'ĐẤU TRÍ';

  const dauTri = state.dau_tri || {
    status: 'CONFIG',
    endRule: 'QUESTIONS_LIMIT',
    maxQuestions: 15,
    timeLimitSeconds: 900,
    bonusQuestionsPerPack: 3,
    currentMainQuestionIndex: 0,
    isMainQuestionRevealed: false,
    isMainStarted: false,
    mainQuestionAnsweredCorrectlyBy: null,
    buzzerLocked: true,
    buzzedPlayer: null,
    buzzedTimestamp: null,
    buzzedBeforeReveal: false,
    foulOrWrongPlayers: [],
    stage: 'MAIN_QUESTION',
    bonusPacksQueueIndex: 0,
    activeBonusPack: null,
    activeBonusPlayerPosition: null,
    currentBonusQuestionIndex: 0,
    isBonusQuestionRevealed: false,
    bonusTimerSecondsLeft: 10,
    isBonusTimerRunning: false,
    overallSecondsLeft: 900,
    overallTotalSeconds: 900,
    isOverallTimerRunning: false,
    threeMinWarningPlayed: false
  };

  const questionsList = questions?.dau_tri?.cau_hoi || [];
  const currentMainQ = questionsList[dauTri.currentMainQuestionIndex] || {
    noi_dung: ''
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Khi chưa bắt đầu vòng thi: chỉ hiện tên vòng thi và logo
  if (dauTri.status === 'CONFIG' || dauTri.status === 'READY') {
    return <RoundTitleScreen title={roundName} logoUrl={customRoundLogo} roundKey="DAU_TRI" id="dau-tri-viewer-intro" />;
  }

  return (
    <div className="w-full h-full flex flex-col justify-start p-1 sm:p-2 select-none overflow-hidden">
      {/* Top Header / Round Bar (Pushed up high to the top) */}
      <div className="flex items-center justify-between bg-slate-900/90 backdrop-blur-md border border-indigo-900/60 rounded-2xl px-5 py-2.5 shadow-xl mb-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-black shadow-lg">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block">
              PHẦN THI
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wider leading-none">
              ĐẤU TRÍ
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Main Question Index Indicator */}
          <div className="px-3.5 py-1 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Câu hỏi chính:</span>
            <span className="text-base font-black text-white font-mono">
              #{dauTri.currentMainQuestionIndex + 1}
            </span>
            <span className="text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
              10 Điểm
            </span>
            {dauTri.endRule === 'QUESTIONS_LIMIT' && (
              <span className="text-xs text-slate-500">/ {dauTri.maxQuestions}</span>
            )}
          </div>

          {/* Score Limit Indicator */}
          {dauTri.endRule === 'SCORE_LIMIT' && (
            <div className="flex items-center space-x-2 px-3.5 py-1 rounded-xl font-mono text-sm font-bold border bg-indigo-950/80 border-indigo-600 text-indigo-300">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Mục tiêu: {dauTri.targetScore || 100} điểm</span>
            </div>
          )}

          {/* Time Limit Indicator - Only visible when <= 3 minutes (180 seconds) */}
          {dauTri.endRule === 'TIME_LIMIT' && dauTri.overallSecondsLeft <= 180 && (
            <div className="flex items-center space-x-2 px-3.5 py-1 rounded-xl font-mono text-base font-black border bg-rose-950/90 border-rose-500 text-rose-300 shadow-lg shadow-rose-950/50 animate-pulse">
              <Clock className="w-4 h-4" />
              <span>{formatTime(dauTri.overallSecondsLeft)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Center Stage: Main Question or Bonus Stage */}
      <div className="my-auto py-1 max-w-6xl w-full mx-auto flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {dauTri.status === 'ENDED' ? (
            <motion.div
              key="dau-tri-ended-stage"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="bg-slate-900/95 backdrop-blur-lg border border-rose-500/50 rounded-3xl p-8 sm:p-12 shadow-2xl text-center space-y-6"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-rose-500/20 border-2 border-rose-500/50 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-950/50">
                <Award className="w-10 h-10 text-amber-400" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-300 to-rose-500 uppercase tracking-wider">
                  KẾT THÚC PHẦN THI ĐẤU TRÍ
                </h2>
                <p className="text-slate-300 text-sm sm:text-base font-medium">
                  Phần thi Đấu Trí đã hoàn thành!
                </p>
              </div>
            </motion.div>
          ) : dauTri.stage === 'MAIN_QUESTION' ? (
            <motion.div
              key={`main-question-stage-${dauTri.currentMainQuestionIndex}-${dauTri.isMainQuestionRevealed}`}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-900/95 backdrop-blur-lg border border-indigo-800/50 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl space-y-6 text-center"
            >
              {/* Question Text or Pending Reader State */}
              <div className="min-h-[220px] flex flex-col items-center justify-center space-y-4">
                {dauTri.isMainQuestionRevealed ? (
                  (() => {
                    const text = currentMainQ.noi_dung || '';
                    const len = text.length;
                    const hasMedia = !!currentMainQ.media?.url;
                    
                    let fontClass = 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black';
                    if (hasMedia) {
                      if (len > 180) fontClass = 'text-base sm:text-lg md:text-xl font-semibold';
                      else if (len > 100) fontClass = 'text-lg sm:text-xl md:text-2xl font-bold';
                      else fontClass = 'text-xl sm:text-2xl md:text-3xl font-extrabold';
                    } else {
                      if (len > 220) fontClass = 'text-lg sm:text-xl md:text-2xl font-semibold';
                      else if (len > 140) fontClass = 'text-xl sm:text-2xl md:text-3xl font-bold';
                      else if (len > 80) fontClass = 'text-2xl sm:text-3xl md:text-4xl font-extrabold';
                      else fontClass = 'text-3xl sm:text-4xl md:text-5xl font-black';
                    }

                    if (hasMedia) {
                      /* Đưa media qua ngang với câu hỏi, phóng to thích hợp không tràn web */
                      return (
                        <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 lg:gap-10 text-left">
                          {/* Media container */}
                          <div className="w-full md:w-1/2 flex items-center justify-center">
                            <div className="w-full max-h-[360px] rounded-2xl overflow-hidden border-2 border-indigo-500/50 bg-slate-950 p-1.5 shadow-2xl flex items-center justify-center">
                              <UniversalMediaPlayer
                                media={currentMainQ.media}
                                mediaControl={state.mediaControl}
                                round="DAU_TRI"
                                className="max-h-[340px] w-auto max-w-full rounded-xl object-contain"
                              />
                            </div>
                          </div>

                          {/* Question text container */}
                          <div className="w-full md:w-1/2 flex flex-col justify-center space-y-4">
                            <div>
                              <span className="px-4 py-1 rounded-full bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 text-xs font-black uppercase tracking-widest inline-block">
                                CÂU HỎI CHÍNH #{dauTri.currentMainQuestionIndex + 1} - 10 ĐIỂM
                              </span>
                            </div>
                            <motion.p
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`${fontClass} text-white leading-relaxed tracking-wide`}
                            >
                              {text}
                            </motion.p>
                          </div>
                        </div>
                      );
                    }

                    /* Không có media: hiển thị căn giữa lớn */
                    return (
                      <>
                        <div className="flex items-center justify-center">
                          <span className="px-4 py-1 rounded-full bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 text-xs font-black uppercase tracking-widest">
                            CÂU HỎI CHÍNH #{dauTri.currentMainQuestionIndex + 1} - 10 ĐIỂM
                          </span>
                        </div>

                        <motion.p
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`${fontClass} text-white leading-relaxed tracking-wide max-w-4xl mx-auto`}
                        >
                          {text}
                        </motion.p>
                      </>
                    );
                  })()
                ) : (
                  /* Khi chưa hiện câu hỏi: Phần trung tâm chỉ hiện "CÂU HỎI CHÍNH #X - 10 điểm" */
                  <div className="flex flex-col items-center justify-center space-y-3 py-6">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-indigo-300 uppercase tracking-wider">
                      CÂU HỎI CHÍNH #{dauTri.currentMainQuestionIndex + 1} - 10 ĐIỂM
                    </h2>
                  </div>
                )}
              </div>

              {/* Buzzer Banner */}
              {dauTri.buzzedPlayer && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center space-x-3 px-6 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black text-base shadow-xl shadow-amber-500/30"
                >
                  <Zap className="w-5 h-5" />
                  <span>THÍ SINH {state.players[dauTri.buzzedPlayer]?.name || dauTri.buzzedPlayer} ĐÃ BẤM CHUÔNG!</span>
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* Bonus Stage Banner */
            <motion.div
              key="bonus-stage"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-900/95 backdrop-blur-lg border border-amber-800/50 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl space-y-6 text-center"
            >
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className="px-4 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  GÓI CÂU HỎI THƯỞNG (3 CÂU - 15 ĐIỂM)
                </span>

                {dauTri.activeBonusPlayerPosition && (
                  <span className="px-4 py-1 rounded-full bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 text-xs font-black uppercase tracking-widest">
                    THÍ SINH: {state.players[dauTri.activeBonusPlayerPosition]?.name}
                  </span>
                )}
              </div>

              {/* Bonus Theme */}
              <div className="py-2">
                <p className="text-xs uppercase font-bold text-amber-400 tracking-widest mb-1">Chủ đề:</p>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
                  "{dauTri.activeBonusPack?.chu_de}"
                </h2>
              </div>

              {/* Bonus Question if displayed */}
              {dauTri.stage === 'BONUS_QUESTION' && (() => {
                const currentBonusQ = dauTri.activeBonusPack?.cau_hoi?.[dauTri.currentBonusQuestionIndex];
                const text = currentBonusQ?.noi_dung || '';
                const len = text.length;
                const hasMedia = !!currentBonusQ?.media?.url;
                let fontClass = 'text-xl sm:text-2xl md:text-3xl font-bold';
                if (len > 220) fontClass = 'text-base sm:text-lg md:text-xl font-semibold';
                else if (len > 120) fontClass = 'text-lg sm:text-xl md:text-2xl font-bold';

                if (hasMedia) {
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-inner flex flex-col md:flex-row items-center justify-center gap-6 lg:gap-8 text-left"
                    >
                      <div className="w-full md:w-1/2 flex items-center justify-center">
                        <div className="w-full max-h-[300px] rounded-xl overflow-hidden border-2 border-amber-500/40 bg-slate-950 p-1 flex items-center justify-center shadow-lg">
                          <UniversalMediaPlayer
                            media={currentBonusQ.media}
                            mediaControl={state.mediaControl}
                            round="DAU_TRI"
                            className="max-h-[280px] w-auto max-w-full rounded-lg object-contain"
                          />
                        </div>
                      </div>

                      <div className="w-full md:w-1/2 flex flex-col justify-center space-y-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-xs font-extrabold px-3 py-1 rounded bg-amber-500 text-slate-950">
                            CÂU THƯỞNG #{dauTri.currentBonusQuestionIndex + 1} (5 ĐIỂM)
                          </span>
                          <span className={`text-2xl sm:text-3xl font-mono font-black px-3.5 py-0.5 rounded-xl border ${
                            dauTri.bonusTimerSecondsLeft <= 3 
                              ? 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse' 
                              : 'bg-slate-900 text-amber-400 border-amber-500/50 shadow-md'
                          }`}>
                            {dauTri.bonusTimerSecondsLeft}
                          </span>
                        </div>

                        <p className={`${fontClass} text-white leading-relaxed`}>
                          {text}
                        </p>
                      </div>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-inner"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <span className="text-xs font-extrabold px-3 py-1 rounded bg-amber-500 text-slate-950">
                        CÂU THƯỞNG #{dauTri.currentBonusQuestionIndex + 1} (5 ĐIỂM)
                      </span>
                      <span className={`text-2xl sm:text-3xl font-mono font-black px-4 py-0.5 rounded-xl border ${
                        dauTri.bonusTimerSecondsLeft <= 3 
                          ? 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse' 
                          : 'bg-slate-900 text-amber-400 border-amber-500/50 shadow-md'
                      }`}>
                        {dauTri.bonusTimerSecondsLeft}
                      </span>
                    </div>

                    <p className={`${fontClass} text-white leading-relaxed`}>
                      {text}
                    </p>
                  </motion.div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
export default DauTriViewer;
