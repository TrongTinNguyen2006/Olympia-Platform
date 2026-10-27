import React, { useEffect, useCallback } from 'react';
import { MatchState, SocketEvent } from '../../types.js';
import { Zap, Clock, ShieldAlert, Award, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import UniversalMediaPlayer from '../UniversalMediaPlayer.js';

interface DauTriPlayerViewProps {
  state: MatchState;
  questions: any;
  playerPosition: number;
  emitSocket: (event: string, data?: any) => void;
}

export const DauTriPlayerView: React.FC<DauTriPlayerViewProps> = ({
  state,
  questions,
  playerPosition,
  emitSocket
}) => {
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

  const isMyTurnLost = dauTri.foulOrWrongPlayers.includes(playerPosition);
  const isMeBuzzed = dauTri.buzzedPlayer === playerPosition;
  const isAnotherBuzzed = dauTri.buzzedPlayer !== null && !isMeBuzzed;
  const canBuzz = dauTri.status === 'PLAYING' && dauTri.stage === 'MAIN_QUESTION' && !dauTri.buzzerLocked && !isMyTurnLost && dauTri.buzzedPlayer === null;
  const isMyBonus = dauTri.activeBonusPlayerPosition === playerPosition;

  const currentMainQ = questions?.dau_tri?.cau_hoi?.[dauTri.currentMainQuestionIndex] || {
    noi_dung: 'Đang tải câu hỏi...'
  };

  const handleBuzz = useCallback(() => {
    if (canBuzz) {
      emitSocket(SocketEvent.DAU_TRI_BUZZ, { position: playerPosition });
    }
  }, [canBuzz, emitSocket, playerPosition]);

  // Handle keyboard spacebar buzz
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && canBuzz) {
        e.preventDefault();
        handleBuzz();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canBuzz, handleBuzz]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Khi chưa bắt đầu vòng thi: chỉ hiện tên vòng thi và logo
  if (dauTri.status === 'CONFIG' || dauTri.status === 'READY') {
    return (
      <div className="max-w-xl mx-auto min-h-[420px] flex flex-col items-center justify-center text-center p-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-4"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-xl shadow-indigo-950/60 border border-indigo-400/30">
            <Zap className="w-10 h-10" />
          </div>
          <div className="space-y-1.5">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-indigo-400 block">
              GIAO DIỆN THÍ SINH
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wide">
              VÒNG ĐẤU TRÍ
            </h1>
            <p className="text-slate-300 text-sm font-semibold pt-1">
              Thí sinh: <span className="text-indigo-400">{state.players[playerPosition]?.name || `Vị trí #${playerPosition}`}</span>
            </p>
            <p className="text-xs text-slate-500">
              Vòng thi chưa bắt đầu. Vui lòng chờ tín hiệu từ chương trình...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Time Warning or Target Score Badge if applicable */}
      {((dauTri.endRule === 'TIME_LIMIT' && dauTri.overallSecondsLeft <= 180) || dauTri.endRule === 'SCORE_LIMIT') && (
        <div className="flex items-center justify-end gap-3">
          {dauTri.endRule === 'TIME_LIMIT' && dauTri.overallSecondsLeft <= 180 && (
            <div className="flex items-center space-x-2 px-4 py-2 rounded-xl font-mono text-base font-bold border bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse">
              <Clock className="w-4 h-4" />
              <span>{formatTime(dauTri.overallSecondsLeft)}</span>
            </div>
          )}

          {dauTri.endRule === 'SCORE_LIMIT' && (
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold border bg-indigo-950/80 border-indigo-600 text-indigo-300">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Mục tiêu: {dauTri.targetScore || 100} điểm</span>
            </div>
          )}
        </div>
      )}

      {/* Main Question / Bonus Stage Card */}
      {dauTri.stage === 'MAIN_QUESTION' ? (
        <div className="bg-slate-900 border border-indigo-900/50 rounded-2xl p-6 shadow-2xl space-y-6">
          {/* Question Banner */}
          <div className="p-6 sm:p-10 rounded-2xl bg-slate-950 border border-slate-800 min-h-[220px] flex flex-col justify-center items-center text-center relative overflow-hidden">
            {dauTri.isMainQuestionRevealed ? (
              (() => {
                const text = currentMainQ.noi_dung || '';
                const len = text.length;
                const hasMedia = !!currentMainQ.media?.url;
                let fontClass = 'text-xl sm:text-2xl lg:text-3xl font-bold';
                if (hasMedia) {
                  if (len > 180) fontClass = 'text-sm sm:text-base lg:text-lg font-semibold';
                  else if (len > 100) fontClass = 'text-base sm:text-lg lg:text-xl font-semibold';
                  else fontClass = 'text-lg sm:text-xl lg:text-2xl font-bold';
                } else {
                  if (len > 240) fontClass = 'text-sm sm:text-base lg:text-lg font-semibold';
                  else if (len > 160) fontClass = 'text-base sm:text-lg lg:text-xl font-semibold';
                  else if (len > 100) fontClass = 'text-lg sm:text-xl lg:text-2xl font-bold';
                }

                if (hasMedia) {
                  return (
                    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 text-left">
                      {/* Media container */}
                      <div className="w-full md:w-1/2 flex items-center justify-center">
                        <div className="w-full max-h-[300px] rounded-xl overflow-hidden border border-indigo-500/40 bg-slate-950 p-1 flex items-center justify-center shadow-lg">
                          <UniversalMediaPlayer
                            media={currentMainQ.media}
                            mediaControl={state.mediaControl}
                            round="DAU_TRI"
                            className="max-h-[280px] w-auto max-w-full rounded-lg object-contain"
                          />
                        </div>
                      </div>

                      {/* Text container */}
                      <div className="w-full md:w-1/2 flex flex-col justify-center space-y-3">
                        <div>
                          <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 text-xs font-black uppercase tracking-widest">
                            CÂU HỎI CHÍNH #{dauTri.currentMainQuestionIndex + 1} - 10 ĐIỂM
                          </span>
                        </div>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`${fontClass} text-white leading-relaxed tracking-wide`}
                        >
                          {text}
                        </motion.div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4 w-full">
                    <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 text-xs font-black uppercase tracking-widest">
                      CÂU HỎI CHÍNH #{dauTri.currentMainQuestionIndex + 1} - 10 ĐIỂM
                    </div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`${fontClass} text-white leading-relaxed tracking-wide`}
                    >
                      {text}
                    </motion.div>
                  </div>
                );
              })()
            ) : (
              /* Cột bên trái chỉ hiện: "CÂU HỎI CHÍNH #X - 10 điểm" khi chưa hiện câu hỏi */
              <div className="flex flex-col items-center justify-center space-y-2">
                <span className="text-2xl sm:text-3xl font-black text-indigo-300 uppercase tracking-wider">
                  CÂU HỎI CHÍNH #{dauTri.currentMainQuestionIndex + 1} - 10 ĐIỂM
                </span>
              </div>
            )}

            {/* Buzzer Banner if active */}
            {dauTri.buzzedPlayer && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg"
              >
                <Zap className="w-4 h-4" />
                <span>
                  {isMeBuzzed
                    ? 'BẠN ĐÃ BẤM CHUÔNG GIÀNH QUYỀN!'
                    : `THÍ SINH ${state.players[dauTri.buzzedPlayer]?.name || dauTri.buzzedPlayer} ĐÃ BẤM CHUÔNG!`}
                </span>
              </motion.div>
            )}
          </div>
        </div>
      ) : (
        /* Bonus Stage View */
        <div className="bg-slate-900 border border-amber-900/50 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                GÓI CÂU HỎI THƯỞNG (3 CÂU - 15 ĐIỂM)
              </span>
            </div>

            <div className="text-xs font-bold text-slate-300">
              {isMyBonus ? (
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
                  🌟 BẠN ĐANG ĐƯỢC HƯỞNG GÓI THƯỞNG
                </span>
              ) : (
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                  Thí sinh {state.players[dauTri.activeBonusPlayerPosition!]?.name} đang trả lời
                </span>
              )}
            </div>
          </div>

          {/* Theme Banner */}
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/50 text-center">
            <div className="text-xs uppercase font-bold text-amber-400 mb-1">Chủ đề gói thưởng:</div>
            <div className="text-xl sm:text-2xl font-black text-white">
              "{dauTri.activeBonusPack?.chu_de}"
            </div>
          </div>

          {/* If a bonus question is active */}
          {dauTri.stage === 'BONUS_QUESTION' && (() => {
            const currentBonusQ = dauTri.activeBonusPack?.cau_hoi?.[dauTri.currentBonusQuestionIndex];
            const hasMedia = !!currentBonusQ?.media?.url;

            if (hasMedia) {
              return (
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 text-left">
                  <div className="w-full md:w-1/2 flex items-center justify-center">
                    <div className="w-full max-h-[260px] rounded-xl overflow-hidden border border-amber-500/40 bg-slate-950 p-1 flex items-center justify-center shadow-lg">
                      <UniversalMediaPlayer
                        media={currentBonusQ.media}
                        mediaControl={state.mediaControl}
                        round="DAU_TRI"
                        className="max-h-[240px] w-auto max-w-full rounded-lg object-contain"
                      />
                    </div>
                  </div>

                  <div className="w-full md:w-1/2 flex flex-col justify-center space-y-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-bold px-3 py-1 rounded bg-amber-500 text-slate-950">
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

                    <p className="text-base sm:text-lg lg:text-xl font-bold text-white leading-relaxed">
                      {currentBonusQ?.noi_dung}
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4">
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-xs font-bold px-3 py-1 rounded bg-amber-500 text-slate-950">
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

                  <p className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                    {currentBonusQ?.noi_dung}
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
