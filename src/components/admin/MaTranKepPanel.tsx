import React from 'react';
import { Socket } from 'socket.io-client';
import { MatchState, SocketEvent } from '../../types';
import { Play, Square, RefreshCw, CheckCircle, Clock, FastForward, Award, HelpCircle } from 'lucide-react';
import RoundSoundPanel from './RoundSoundPanel';

interface MaTranKepPanelProps {
  socket: Socket | null;
  matchState: MatchState;
}

export const MaTranKepPanel: React.FC<MaTranKepPanelProps> = ({ socket, matchState }) => {
  const mtkState = matchState.ma_tran_kep;
  const status = mtkState?.status || 'IDLE';
  const timerLeft = mtkState?.timerSecondsLeft ?? 180;
  const isRunning = mtkState?.isTimerRunning || false;

  const [selectedDuration, setSelectedDuration] = React.useState<number>(180);

  const activePos = mtkState?.activePlayerPosition || 1;

  const handleSetActivePlayer = (pos: number) => {
    socket?.emit(SocketEvent.MA_TRAN_KEP_SET_ACTIVE_PLAYER, { position: pos });
  };

  const handlePrepare = () => {
    socket?.emit(SocketEvent.MA_TRAN_KEP_PREPARE);
  };

  const handleStart = () => {
    socket?.emit(SocketEvent.MA_TRAN_KEP_START, { duration: selectedDuration });
  };

  const handleEnd = () => {
    if (window.confirm('Bạn có chắc chắn muốn kết thúc vòng thi Ma Trận Kép?')) {
      socket?.emit(SocketEvent.MA_TRAN_KEP_END);
    }
  };

  const handleReset = () => {
    if (window.confirm('Bạn có chắc chắn muốn làm mới (reset) lại vòng thi Ma Trận Kép?')) {
      socket?.emit(SocketEvent.MA_TRAN_KEP_RESET);
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-900 text-white rounded-xl border border-slate-800 shadow-2xl">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-800/80 rounded-lg border border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              VÒNG THI: MA TRẬN KÉP
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase border ${
                status === 'RUNNING' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse' :
                status === 'READY' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                status === 'ENDED' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' :
                'bg-slate-700 text-slate-300 border-slate-600'
              }`}>
                {status === 'RUNNING' ? 'ĐANG THI' : status === 'READY' ? 'SẴN SÀNG' : status === 'ENDED' ? 'KẾT THÚC' : 'CHỜ'}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              4 thí sinh cùng chọn 2 đáp án trong bảng 4x3 (12 ô) để giải 12 câu hỏi.
            </p>
          </div>
        </div>

        {/* Duration Selector & Timer Display */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-700">
            {[
              { label: '1p30s', value: 90 },
              { label: '2p', value: 120 },
              { label: '2p30s', value: 150 },
              { label: '3p', value: 180 },
            ].map((dur) => (
              <button
                key={dur.value}
                type="button"
                onClick={() => setSelectedDuration(dur.value)}
                disabled={status === 'RUNNING'}
                className={`px-2.5 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
                  selectedDuration === dur.value
                    ? 'bg-amber-500 text-slate-950 shadow font-black'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {dur.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-lg border border-slate-700 font-mono">
            <Clock className={`w-5 h-5 ${isRunning ? 'text-amber-400 animate-spin' : 'text-slate-400'}`} />
            <span className={`text-2xl font-black ${timerLeft <= 30 && isRunning ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
              {formatTimer(timerLeft)}
            </span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrepare}
            disabled={status === 'RUNNING'}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-medium text-sm rounded-lg flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" /> Chuẩn bị
          </button>

          <button
            onClick={handleStart}
            disabled={status === 'RUNNING'}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm rounded-lg flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" /> Bắt đầu ({selectedDuration === 90 ? '1p30s' : selectedDuration === 120 ? '2p' : selectedDuration === 150 ? '2p30s' : '3p'})
          </button>

          <button
            onClick={handleEnd}
            disabled={status !== 'RUNNING'}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-medium text-sm rounded-lg flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Square className="w-4 h-4 fill-current" /> Kết thúc
          </button>

          <button
            onClick={handleReset}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-sm rounded-lg flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            title="Làm mới trạng thái"
          >
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>

      {/* Active Candidate View Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-lg">
        <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
          📺 Chọn thí sinh hiển thị bảng lớn trên Viewer & Overlay:
        </span>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map(pos => {
            const isActive = activePos === pos;
            const p = matchState.players[pos];
            return (
              <button
                key={pos}
                onClick={() => handleSetActivePlayer(pos)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-400'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                <span>V{pos}: {p?.name ? p.name.split(' ')[0] : `TS${pos}`}</span>
                {isActive && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Candidate Progress Grid (4 Candidates) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(pos => {
          const p = matchState.players[pos];
          const pState = mtkState?.playerStates?.[pos];
          const isLocked = pState?.isLocked || false;
          const isFinished = pState?.isFinished || false;
          const solvedCount = pState?.solvedQuestionIds?.length || 0;
          const skippedCount = pState?.skippedQuestionIds?.length || 0;
          const board = pState?.board || [];
          const isActiveOnViewer = activePos === pos;

          return (
            <div key={pos} className={`rounded-xl border p-4 flex flex-col gap-3 transition-all ${
              isActiveOnViewer ? 'bg-indigo-950/30 border-indigo-500/60 shadow-indigo-500/10 shadow-lg' : 'bg-slate-800/60 border-slate-700/80'
            }`}>
              {/* Candidate Info Bar */}
              <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-lg border border-slate-700/60">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 flex items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold">
                    V{pos}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-slate-200">
                        {p?.name || `Thí sinh ${pos}`}
                      </h3>
                      {isActiveOnViewer && (
                        <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 text-[10px] font-extrabold rounded uppercase">
                          Đang xem
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5" /> Đúng: {solvedCount}/12
                      </span>
                      <span className="flex items-center gap-1 text-amber-400">
                        <FastForward className="w-3.5 h-3.5" /> Bỏ qua: {skippedCount}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex items-center gap-3">
                  {isLocked && (
                    <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse font-medium">
                      🔒 Khoá 5s
                    </span>
                  )}
                  {isFinished && (
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                      🏁 Hoàn thành
                    </span>
                  )}
                  <div className="text-xl font-bold text-amber-400">
                    {pState?.score ?? (p?.score || 0)}
                  </div>
                </div>
              </div>

              {/* Player Board Live Grid (4x3) */}
              <div className="grid grid-cols-4 gap-1.5 p-2 bg-slate-950 rounded-lg border border-slate-800">
                {board.length === 0 ? (
                  <div className="col-span-4 text-center py-6 text-xs text-slate-500 italic">
                    Chưa bắt đầu lượt thi
                  </div>
                ) : (
                  board.map((card, cIdx) => {
                    const isSelected = pState?.selectedCellIndices?.includes(cIdx);
                    const feedback = pState?.feedbackState || 'NONE';

                    let cellStyle = 'bg-slate-800 border-slate-700 text-slate-300';
                    if (isSelected) {
                      if (feedback === 'BOTH_CORRECT') cellStyle = 'bg-emerald-900/60 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400';
                      else if (feedback === 'ONE_CORRECT') cellStyle = 'bg-amber-900/60 border-amber-400 text-amber-200 ring-2 ring-amber-400';
                      else if (feedback === 'BOTH_INCORRECT') cellStyle = 'bg-rose-900/60 border-rose-400 text-rose-200 ring-2 ring-rose-400';
                      else cellStyle = 'bg-indigo-900/80 border-indigo-400 text-white ring-2 ring-indigo-400 shadow-lg';
                    }

                    return (
                      <div
                        key={cIdx}
                        className={`p-2 h-14 rounded border text-[11px] leading-tight flex items-center justify-center text-center font-medium transition-all ${cellStyle}`}
                      >
                        <span className="line-clamp-2">{card.text}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* BẢNG ĐIỀU KHIỂN ÂM THANH MA TRẬN KÉP */}
      <RoundSoundPanel
        title="Bảng Điều Khiển Âm Thanh: Ma Trận Kép"
        accentColor="indigo"
        columns={4}
        adminCommand={(event, data) => socket?.emit(event, data)}
        sounds={[
          { id: 'MTK_Intro', label: '1. Vào vòng thi' },
          { id: 'MTK_Prepare', label: '2. Nhạc chuẩn bị' },
          { id: 'MTK_StartOriginal', label: '3. Bắt đầu (Gốc)' },
          { id: 'MTK_Start1m30s', label: '4. Nhạc 1m30s' },
          { id: 'MTK_Start2m', label: '5. Nhạc 2 phút' },
          { id: 'MTK_Right', label: '6. Trả lời đúng' },
          { id: 'MTK_RightHalf', label: '7. Đúng 1/2 ô' },
          { id: 'MTK_Wrong', label: '8. Trả lời sai' },
          { id: 'MTK_Pass', label: '9. Bỏ qua câu' },
          { id: 'MTK_Win', label: '10. Hoàn thành / Thắng' },
          { id: 'MTK_Finish', label: '11. Kết thúc vòng' },
        ]}
      />
    </div>
  );
};
