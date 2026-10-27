import React from 'react';
import { Socket } from 'socket.io-client';
import { MatchState, SocketEvent } from '../../types';
import { FastForward, CheckCircle, Clock, Lock, Award, AlertTriangle, Sparkles } from 'lucide-react';

interface MaTranKepPlayerViewProps {
  matchState: MatchState;
  position: number;
  socket: Socket | null;
}

export const MaTranKepPlayerView: React.FC<MaTranKepPlayerViewProps> = ({
  matchState,
  position,
  socket,
}) => {
  const mtk = matchState.ma_tran_kep;
  const pState = mtk?.playerStates?.[position];
  const timerSeconds = mtk?.timerSecondsLeft ?? 180;

  // Local ticker for smooth sub-second updates & lock countdown
  const [now, setNow] = React.useState(Date.now());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 250);
    return () => clearInterval(interval);
  }, []);

  // Retrieve current question
  const allQuestions = mtk?.questions || (matchState as any)?.matchQuestions?.ma_tran_kep?.cau_hoi || [];
  const currentQIndex = pState?.currentQuestionIndex ?? 0;

  // Current question content
  const currentQ = allQuestions?.[currentQIndex] || (
    mtk ? {
      id: currentQIndex + 1,
      noi_dung: `Câu hỏi ${currentQIndex + 1}`,
      dap_an_1: '',
      dap_an_2: ''
    } : null
  );

  const board = pState?.board || [];
  const solvedCount = pState?.solvedQuestionIds?.length || 0;
  const skippedCount = pState?.skippedQuestionIds?.length || 0;
  const remainingCount = 12 - solvedCount;
  const isLocked = pState?.isLocked || false;
  const isFinished = pState?.isFinished || false;
  const selectedIndices = pState?.selectedCellIndices || [];
  const feedbackState = pState?.feedbackState || 'NONE';
  const feedbackMessage = pState?.feedbackMessage;

  const handleToggleCell = (cIdx: number) => {
    if (isLocked || isFinished || feedbackState !== 'NONE' || mtk?.status !== 'RUNNING') return;
    socket?.emit(SocketEvent.MA_TRAN_KEP_TOGGLE_CELL, { position, cellIndex: cIdx });
  };

  const handleSkip = () => {
    if (isLocked || isFinished || remainingCount <= 1 || mtk?.status !== 'RUNNING') return;
    socket?.emit(SocketEvent.MA_TRAN_KEP_SKIP, { position });
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${mins}:${rem.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Header & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/90 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-indigo-400 tracking-wider uppercase">MA TRẬN KÉP</div>
            <div className="text-sm font-extrabold text-white flex items-center gap-2">
              Thí sinh {position}: {matchState.players[position]?.name || `Thí sinh ${position}`}
            </div>
          </div>
        </div>

        {/* Stats & Countdown */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
            <CheckCircle className="w-4 h-4" /> Đúng: {solvedCount}/12
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg">
            <FastForward className="w-4 h-4" /> Bỏ qua: {skippedCount}
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1 bg-slate-900 border border-slate-700 rounded-lg font-mono text-amber-400 font-black text-sm">
            <Clock className="w-4 h-4 text-amber-400" /> {formatTimer(timerSeconds)}
          </div>
        </div>
      </div>

      {/* Alert / Feedback Messages */}
      {feedbackMessage && (
        <div className="p-3 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-xl text-center font-bold text-sm flex items-center justify-center gap-2 animate-pulse shadow-lg">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          {feedbackMessage}
        </div>
      )}

      {isFinished && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-center font-extrabold text-base flex items-center justify-center gap-2 shadow-lg">
          <Sparkles className="w-6 h-6 text-emerald-400 animate-bounce" />
          Chúc mừng! Bạn đã hoàn thành xuất sắc tất cả 12 câu hỏi!
        </div>
      )}

      {/* Preparation Screen when status is READY or IDLE */}
      {!isFinished && mtk?.status !== 'RUNNING' && (
        <div className="p-8 my-auto bg-slate-900/90 border border-amber-500/30 rounded-2xl text-center flex flex-col items-center justify-center gap-4 shadow-2xl">
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 animate-pulse">
            <Clock className="w-10 h-10" />
          </div>
          <h3 className="text-xl md:text-2xl font-black text-amber-300 uppercase tracking-wide">
            CHUẨN BỊ THI ĐẤU
          </h3>
          <p className="text-sm md:text-base text-slate-300 max-w-lg leading-relaxed">
            Nội dung câu hỏi và bảng đáp án 4x3 sẽ xuất hiện ngay khi Ban Tổ Chức bấm nút <strong className="text-emerald-400 font-bold">"Bắt đầu"</strong>.
          </p>
        </div>
      )}

      {/* 12 Question Circles Indicator (Only when RUNNING) */}
      {!isFinished && mtk?.status === 'RUNNING' && (
        <div className="flex items-center justify-between gap-1.5 p-2 bg-slate-900/90 rounded-xl border border-slate-800 overflow-x-auto shadow-inner">
          {Array.from({ length: 12 }).map((_, qIdx) => {
            const q = allQuestions?.[qIdx] || { id: qIdx + 1 };
            const qId = q.id;
            const isSolved = pState?.solvedQuestionIds?.includes(qId);
            const isSkipped = pState?.skippedQuestionIds?.includes(qId);
            const isActive = qIdx === currentQIndex;
            const maxReached = pState?.maxReachedQuestionIndex ?? currentQIndex;
            const isVisited = qIdx <= maxReached || isSolved || isSkipped;

            let circleStyle = 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed opacity-40';
            if (isSolved) {
              circleStyle = 'bg-emerald-600 text-white border-emerald-400 font-black cursor-pointer hover:scale-105 shadow-md shadow-emerald-600/30';
            } else if (isSkipped) {
              circleStyle = 'bg-amber-600 text-white border-amber-400 font-bold cursor-pointer hover:scale-105 shadow-md shadow-amber-600/30';
            } else if (isActive) {
              circleStyle = 'bg-indigo-600 text-white ring-2 ring-indigo-400 border-white font-black scale-105 cursor-pointer shadow-lg shadow-indigo-600/50';
            } else if (isVisited) {
              circleStyle = 'bg-slate-800 hover:bg-indigo-900 text-indigo-200 border-indigo-500/40 font-bold cursor-pointer hover:scale-105';
            }

            return (
              <button
                key={qIdx}
                onClick={() => {
                  if (isVisited && !isLocked && mtk?.status === 'RUNNING') {
                    socket?.emit(SocketEvent.MA_TRAN_KEP_SELECT_QUESTION, { position, questionIndex: qIdx });
                  }
                }}
                disabled={!isVisited || isLocked || mtk?.status !== 'RUNNING'}
                title={`Câu ${qIdx + 1}${isSolved ? ' (Đúng)' : isSkipped ? ' (Bỏ qua)' : isVisited ? ' (Chuyển)' : ' (Khóa)'}`}
                className={`w-8 h-8 md:w-9 md:h-9 rounded-full border text-xs flex items-center justify-center shrink-0 transition-all active:scale-95 ${circleStyle}`}
              >
                {isSolved ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : (
                  <span>{qIdx + 1}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Question & 4x3 Board Wrapped in Relative Container with Lock Overlay (Only when RUNNING) */}
      {!isFinished && mtk?.status === 'RUNNING' && (
        <div className="relative flex flex-col gap-3 min-h-[300px]">
          {/* 5-Second Lock Overlay Mask */}
          {isLocked && (
            <div className="absolute inset-0 z-30 bg-slate-950/95 backdrop-blur-md border-2 border-rose-500/50 rounded-2xl flex flex-col items-center justify-center gap-3 text-center p-6 shadow-2xl animate-in fade-in duration-200">
              <Lock className="w-12 h-12 text-rose-500 animate-bounce" />
              <h3 className="text-lg md:text-xl font-black text-rose-300 uppercase tracking-wide">
                CÂU HỎI VÀ BẢNG ĐÁP ÁN TẠM THỜI BỊ KHÓA
              </h3>
              <p className="text-xs md:text-sm text-slate-300 max-w-md">
                Bảng thi bị che trong 5 giây do bạn chọn bỏ qua. Vui lòng chờ hệ thống mở lại...
              </p>
            </div>
          )}

          {/* Active Question Banner */}
          {currentQ && (
            <div className="p-4 bg-gradient-to-r from-indigo-950/90 via-slate-900 to-indigo-950/90 border border-indigo-500/30 rounded-xl shadow-inner text-center">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-400 block mb-1">
                CÂU HỎI {currentQIndex + 1} / 12
              </span>
              <p className="text-base md:text-lg font-bold text-amber-300 leading-relaxed">
                {currentQ.noi_dung}
              </p>
            </div>
          )}

          {/* 4x3 Grid Board (12 Answer Options) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-3 bg-slate-900/50 rounded-2xl border border-slate-800">
            {board.map((card, cIdx) => {
              const isSelected = selectedIndices.includes(cIdx);

              let cardStyle = 'bg-slate-900/90 border-slate-700/80 text-slate-200 hover:border-indigo-400/60 hover:bg-slate-800/80';
              if (isSelected) {
                if (feedbackState === 'BOTH_CORRECT') {
                  cardStyle = 'bg-emerald-950/90 border-emerald-400 text-emerald-200 ring-4 ring-emerald-400/50 scale-105 shadow-xl shadow-emerald-500/20';
                } else if (feedbackState === 'ONE_CORRECT') {
                  cardStyle = 'bg-amber-950/90 border-amber-400 text-amber-200 ring-4 ring-amber-400/50 scale-105 shadow-xl shadow-amber-500/20';
                } else if (feedbackState === 'BOTH_INCORRECT') {
                  cardStyle = 'bg-rose-950/90 border-rose-500 text-rose-200 ring-4 ring-rose-500/50 scale-105 shadow-xl shadow-rose-500/20';
                } else {
                  cardStyle = 'bg-indigo-950/90 border-indigo-400 text-white ring-2 ring-indigo-400 shadow-xl shadow-indigo-500/30 scale-102';
                }
              }

              return (
                <button
                  key={cIdx}
                  onClick={() => handleToggleCell(cIdx)}
                  disabled={isLocked || isFinished || feedbackState !== 'NONE' || mtk?.status !== 'RUNNING'}
                  className={`min-h-[70px] md:min-h-[85px] p-3 rounded-xl border font-bold text-xs md:text-sm leading-snug flex items-center justify-center text-center transition-all duration-200 active:scale-95 disabled:opacity-60 cursor-pointer select-none ${cardStyle}`}
                >
                  <span className="line-clamp-3">{card.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Skip Button */}
      {!isFinished && (
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSkip}
            disabled={isLocked || isFinished || remainingCount <= 1 || mtk?.status !== 'RUNNING'}
            className="px-5 py-2.5 bg-amber-600/80 hover:bg-amber-500 border border-amber-500/40 disabled:opacity-40 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <FastForward className="w-4 h-4" />
            {remainingCount <= 1 ? 'Không thể bỏ qua (Câu cuối)' : 'BỎ QUA CÂU NÀY (Khoá 5s)'}
          </button>
        </div>
      )}
    </div>
  );
};
