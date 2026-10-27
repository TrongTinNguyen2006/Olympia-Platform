import React from 'react';
import { MatchState } from '../../types';
import { Award, Clock, CheckCircle, FastForward, HelpCircle, User } from 'lucide-react';

interface MaTranKepMCViewProps {
  matchState: MatchState;
}

export const MaTranKepMCView: React.FC<MaTranKepMCViewProps> = ({ matchState }) => {
  const mtk = matchState.ma_tran_kep;
  const status = mtk?.status || 'IDLE';
  const timerLeft = mtk?.timerSecondsLeft ?? 180;

  // Local ticker for smooth timer rendering
  const [now, setNow] = React.useState(Date.now());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 250);
    return () => clearInterval(interval);
  }, []);

  const questions = mtk?.questions || (matchState as any)?.matchQuestions?.ma_tran_kep?.cau_hoi || [];

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${mins}:${rem.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6 flex flex-col gap-6">
      {/* MC Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              GIAO DIỆN MC — MA TRẬN KÉP
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase border ${
                status === 'RUNNING' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse' :
                status === 'READY' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {status === 'RUNNING' ? 'ĐANG THI' : status === 'READY' ? 'SẴN SÀNG' : 'CHỜ'}
              </span>
            </h1>
            <p className="text-xs text-slate-400">Theo dõi tiến trình giải câu hỏi và bảng đáp án của 4 thí sinh</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-900 px-5 py-2.5 rounded-xl border border-slate-700 font-mono">
          <Clock className="w-6 h-6 text-amber-400" />
          <span className="text-3xl font-black text-amber-400">{formatTimer(timerLeft)}</span>
        </div>
      </div>

      {/* Split Main View: 1/2 Left (Contestants Status & Active Questions) vs 1/2 Right (12 Questions Reference) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        
        {/* LEFT 1/2: Status of 4 Candidates (Passed questions, Correct answers, Current question, Selected options) */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-xl">
            <h2 className="text-sm font-black text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4" /> TRẠNG THÁI & THÔNG TIN THI CỦA 4 THÍ SINH
            </h2>
            <span className="text-xs font-semibold text-slate-400">Cập nhật trực tiếp</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1">
            {[1, 2, 3, 4].map(pos => {
              const p = matchState.players[pos];
              const pState = mtk?.playerStates?.[pos];
              const solvedCount = pState?.solvedQuestionIds?.length || 0;
              const skippedCount = pState?.skippedQuestionIds?.length || 0;
              const passedCount = solvedCount + skippedCount;
              const isFinished = pState?.isFinished || false;
              const isLocked = pState?.isLocked || false;
              const lockEnd = pState?.lockEndTime || 0;
              const currentQIdx = pState?.currentQuestionIndex ?? 0;
              const activeQ = questions[currentQIdx];
              const board = pState?.board || [];
              const selectedIndices = pState?.selectedCellIndices || [];
              const selectedCards = selectedIndices.map(idx => board[idx]?.text).filter(Boolean);

              const lockRemainingSec = isLocked && lockEnd ? Math.max(0, Math.ceil((lockEnd - now) / 1000)) : 0;

              return (
                <div key={pos} className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between gap-3 shadow-xl relative overflow-hidden">
                  {/* Contestant Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 flex items-center justify-center rounded-full bg-indigo-600 text-white font-extrabold text-xs">
                        {pos}
                      </span>
                      <span className="font-bold text-sm text-slate-100 truncate max-w-[130px]">
                        {p?.name || `Thí sinh ${pos}`}
                      </span>
                    </div>
                    <span className="text-lg font-black text-amber-400">
                      {pState?.score ?? (p?.score || 0)}
                    </span>
                  </div>

                  {/* Solved / Skipped / Passed Counts */}
                  <div className="grid grid-cols-3 gap-1 text-[11px] font-bold text-slate-300 text-center bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Đã qua</span>
                      <span className="text-indigo-400 text-sm font-black">{passedCount}/12</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Đúng</span>
                      <span className="text-emerald-400 text-sm font-black">{solvedCount}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Bỏ qua</span>
                      <span className="text-amber-400 text-sm font-black">{skippedCount}</span>
                    </div>
                  </div>

                  {/* Current Question & Lock Status */}
                  {isFinished ? (
                    <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl text-xs font-bold text-center border border-emerald-500/40">
                      🏁 Đã hoàn thành 12 câu hỏi!
                    </div>
                  ) : isLocked || lockRemainingSec > 0 ? (
                    <div className="p-2.5 bg-rose-500/20 text-rose-300 rounded-xl text-xs font-bold text-center border border-rose-500/40 animate-pulse flex items-center justify-center gap-1.5">
                      🔒 Đang khoá 5s (Còn {lockRemainingSec}s)
                    </div>
                  ) : (
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs flex flex-col gap-1">
                      <div className="text-[10px] text-indigo-400 font-extrabold uppercase">
                        Câu hỏi hiện tại ({currentQIdx + 1}/12):
                      </div>
                      <p className="text-slate-100 font-bold line-clamp-2 leading-tight">
                        {activeQ ? activeQ.noi_dung : `Câu hỏi ${currentQIdx + 1}`}
                      </p>
                      {activeQ && (
                        <div className="text-[10px] text-emerald-400 font-semibold pt-1 border-t border-slate-800">
                          Đáp án đúng: <span className="font-bold">{activeQ.dap_an_1}</span> + <span className="font-bold">{activeQ.dap_an_2}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Selected Options by Contestant */}
                  <div className="bg-indigo-950/40 p-2 rounded-xl border border-indigo-500/30 flex items-center justify-between text-xs">
                    <span className="text-indigo-300 font-extrabold uppercase text-[10px] shrink-0">Đáp án chọn:</span>
                    <div className="font-bold text-slate-100 truncate text-right pl-2">
                      {selectedCards.length > 0 ? (
                        <span className="text-amber-300">{selectedCards.join(' + ')}</span>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">Chưa chọn ô nào</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT 1/2: MC Master Question Bank Reference Table (1/2 width) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-xl flex flex-col h-full">
          <h2 className="text-sm font-bold text-indigo-300 mb-3 flex items-center gap-2 border-b border-slate-800 pb-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" /> BẢNG 12 CÂU HỎI VÀ ĐÁP ÁN DÀNH CHO MC
          </h2>

          <div className="overflow-y-auto max-h-[calc(100vh-220px)] rounded-xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase z-10">
                <tr>
                  <th className="p-2.5 w-10 text-center">STT</th>
                  <th className="p-2.5">Nội dung câu hỏi</th>
                  <th className="p-2.5 text-emerald-400 w-28">Đáp án 1</th>
                  <th className="p-2.5 text-emerald-400 w-28">Đáp án 2</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {questions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-500 italic">
                      Chưa nạp dữ liệu câu hỏi Ma Trận Kép.
                    </td>
                  </tr>
                ) : (
                  questions.map((q: any, idx: number) => (
                    <tr key={q.id || idx} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-2.5 text-center font-black text-indigo-400">{idx + 1}</td>
                      <td className="p-2.5 font-medium text-slate-200 leading-snug">{q.noi_dung}</td>
                      <td className="p-2.5 font-bold text-emerald-400">{q.dap_an_1}</td>
                      <td className="p-2.5 font-bold text-emerald-400">{q.dap_an_2}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
