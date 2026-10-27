import React from 'react';
import { MatchState, SocketEvent } from '../../types.js';
import { Play, Check, X, RefreshCw, ChevronLeft, ChevronRight, Square, Music } from 'lucide-react';
import HelpTip from './HelpTip.js';

interface KhoiDongPanelProps {
  matchState: MatchState;
  adminCommand: (event: SocketEvent, data?: any) => void;
  matchQuestions?: any;
}

export default function KhoiDongPanel({ matchState, adminCommand, matchQuestions }: KhoiDongPanelProps) {
  const khoiDong = matchState.khoi_dong;
  const isTimerRunning = matchState.isTimerRunning;
  const subRound = khoiDong?.subRound;
  const individualRule = khoiDong?.individualRule || 'O24';
  const currentPlayerIndex = khoiDong?.currentPlayerIndex ?? null;
  const currentQuestionIndex = khoiDong?.currentQuestionIndex ?? 0;
  const isConfirmed = !!khoiDong?.isConfirmed;

  const handleSetSubRound = (mode: 'INDIVIDUAL' | 'COLLECTIVE') => {
    adminCommand(SocketEvent.KHOI_DONG_SET_ROUND, { subRound: mode });
  };

  const handleSelectPlayer = (idx: number) => {
    adminCommand(SocketEvent.KHOI_DONG_SET_PLAYER, { playerIndex: idx });
  };

  const handleNextQuestion = () => {
    adminCommand(SocketEvent.NEXT_QUESTION);
  };

  const handlePrevQuestion = () => {
    adminCommand(SocketEvent.PREV_QUESTION);
  };

  const handleStartTimer = (seconds: number) => {
    adminCommand(SocketEvent.START_TIMER, { seconds });
  };

  const handleUpdateConfig = (config: any) => {
    adminCommand(SocketEvent.KHOI_DONG_UPDATE_CONFIG, config);
  };

  const handleEndTurn = () => {
    adminCommand(SocketEvent.KHOI_DONG_END_TURN);
  };

  const handleGrade = (isCorrect: boolean, isSkip: boolean = false) => {
    adminCommand(SocketEvent.GRADE_ANSWER, { isCorrect, isSkip });
  };

  return (
    <div className="space-y-3">
      {/* HEADER ROW */}
      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <h2 className="text-sm font-bold text-teal-300">Khởi Động</h2>
          <HelpTip content="Vòng Khởi Động: Quản lý câu hỏi cá nhân (60s) và lượt thi chung bấm chuông nhanh. Chọn thí sinh, chốt cài đặt và thực hiện chấm đáp án." />
        </div>
        <div className="flex gap-2">
          {isTimerRunning ? (
            <button
              onClick={() => adminCommand(SocketEvent.PAUSE_TIMER)}
              className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              Tạm Dừng ⏱️
            </button>
          ) : (
            <button
              onClick={() => adminCommand(SocketEvent.RESET_TIMER)}
              className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-400 text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              Reset Hẹn Giờ ⏱️
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-start">
        {/* LEFT COLUMN: MAIN KHOI DONG CONTROLS */}
        <div className="lg:col-span-8 xl:col-span-9 grid grid-cols-1 md:grid-cols-12 gap-2.5">
          {/* SUBROUND SELECTION AND GRADING PANEL (LEFT SIDE) */}
          <div className="md:col-span-5 flex flex-col gap-2.5">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
              1. Chế Độ Lượt Thi Khởi Động
              <HelpTip content="Cá Nhân: Mỗi thí sinh thi riêng theo thời gian/số câu. Chung: Cả 4 thí sinh cùng giành quyền trả lời." />
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSetSubRound('INDIVIDUAL')}
                className={`py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  subRound === 'INDIVIDUAL'
                    ? 'bg-teal-500/10 border-teal-500 text-teal-300 shadow-md shadow-teal-500/5'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                CÁ NHÂN
              </button>

              <button
                onClick={() => handleSetSubRound('COLLECTIVE')}
                className={`py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  subRound === 'COLLECTIVE'
                    ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/5'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                CHUNG
              </button>
            </div>

            {isConfirmed ? (
              /* BẢNG CHỐT THÔNG TIN CÀI ĐẶT (HIỂN THỊ KHI ĐÃ CHỐT) */
              <div className="bg-slate-950/90 border border-teal-500/50 rounded-xl p-4 space-y-3 shadow-xl shadow-teal-500/10 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                    📋 Bảng Chốt Thông Tin Cài Đặt (Khởi Động)
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">
                    {subRound === 'INDIVIDUAL' ? 'Thi Cá Nhân' : 'Thi Chung'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-medium block">Thí sinh thi:</span>
                    <span className="font-bold text-white text-xs truncate block mt-0.5">
                      {subRound === 'INDIVIDUAL'
                        ? (currentPlayerIndex !== null
                            ? `Thí sinh ${currentPlayerIndex + 1}: ${matchState.players[(currentPlayerIndex + 1) as 1|2|3|4]?.name || 'N/A'}`
                            : '⚠️ Chưa chọn thí sinh')
                        : 'Lượt thi chung (Cả 4 thí sinh)'}
                    </span>
                  </div>

                  <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-medium block">Luật thi đấu:</span>
                    <span className="font-bold text-teal-300 text-xs block mt-0.5">
                      {subRound === 'INDIVIDUAL'
                        ? ((khoiDong.individualRule || 'O24') === 'O24' ? 'Cá nhân - Luật O24+' : 'Cá nhân - Luật O19/O21')
                        : ((khoiDong.collectiveRule || 'O23') === 'O23' ? 'Chung - Luật O23+' : 'Chung - Luật O22')}
                    </span>
                  </div>

                  <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-medium block">Giới hạn thời gian:</span>
                    <span className="font-bold text-sky-300 text-xs block mt-0.5">
                      {subRound === 'INDIVIDUAL'
                        ? (khoiDong.individualTimerDuration ? `${khoiDong.individualTimerDuration} giây` : 'Không có')
                        : (khoiDong.collectiveTimerDuration ? `${khoiDong.collectiveTimerDuration} giây` : 'Không có')}
                    </span>
                  </div>

                  <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-medium block">Giới hạn câu hỏi:</span>
                    <span className="font-bold text-indigo-300 text-xs block mt-0.5">
                      {subRound === 'INDIVIDUAL'
                        ? (khoiDong.individualMaxQuestions !== null && khoiDong.individualMaxQuestions !== undefined && khoiDong.individualMaxQuestions > 0 ? `${khoiDong.individualMaxQuestions} câu` : 'Không có')
                        : (khoiDong.collectiveMaxQuestions !== null && khoiDong.collectiveMaxQuestions !== undefined && khoiDong.collectiveMaxQuestions > 0 ? `${khoiDong.collectiveMaxQuestions} câu` : 'Không có')}
                    </span>
                  </div>

                  <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 col-span-2">
                    <span className="text-[10px] text-slate-400 font-medium block">Cách tính điểm:</span>
                    <span className="font-bold text-amber-300 text-xs block mt-0.5">
                      {subRound === 'INDIVIDUAL'
                        ? (khoiDong.individualScoringMode === 'ADVANCED_1' ? 'Cải tiến 1 (+10đ, sai -5đ, bỏ qua 0đ)'
                          : khoiDong.individualScoringMode === 'ADVANCED_2' ? 'Cải tiến 2 (+10đ, 3 lần sai/bỏ qua free, từ lần 4: -5đ)'
                          : 'Truyền thống (+10đ, 0đ)')
                        : (khoiDong.collectiveScoringMode === 'ADVANCED_1' ? 'Cải tiến 1 (+10đ, mất lượt câu kế, 0đ)'
                          : khoiDong.collectiveScoringMode === 'ADVANCED_2' ? 'Cải tiến 2 (+10đ, lũy tiến: 1st 0, 2nd -5, 3rd -10...)'
                          : khoiDong.collectiveScoringMode === 'ADVANCED_3' ? `Cải tiến 3 (+10đ, mất lượt câu kế, sai ${khoiDong.disqualifyThreshold || 3} lần bị loại)`
                          : khoiDong.collectiveScoringMode === 'ADVANCED_4' ? `Cải tiến 4 (Lũy tiến + Mất lượt + Bị loại ${khoiDong.disqualifyThreshold || 3} lần)`
                          : 'Truyền thống (+10đ, -5đ)')}
                    </span>
                  </div>

                  <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 col-span-2 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium">Chuyển câu tự động:</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateConfig({ autoNextQuestion: !(khoiDong.autoNextQuestion ?? true) })}
                      className={`font-bold text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        (khoiDong.autoNextQuestion ?? true)
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 hover:bg-emerald-500/30'
                          : 'bg-amber-500/20 border-amber-500 text-amber-300 hover:bg-amber-500/30'
                      }`}
                    >
                      {(khoiDong.autoNextQuestion ?? true) ? '⚡ BẬT (Tự động sang câu khi chấm)' : '🖐️ TẮT (Bấm nút TIẾP thủ công)'}
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    ✓ Cài đặt đã được chốt thành công
                  </span>
                  <button
                    onClick={() => handleUpdateConfig({ isConfirmed: false })}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700 shadow"
                  >
                    <span>↩️ Mở lại cài đặt</span>
                  </button>
                </div>
              </div>
            ) : subRound ? (
              /* BƯỚC CÀI ĐẶT (CHƯA CHỐT) */
              <div className="space-y-4">
                {subRound === 'INDIVIDUAL' ? (
                  <div className="pt-3 border-t border-slate-800/60 space-y-3">
                    {/* Rule selection for Individual */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Luật thi Cá nhân:</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleUpdateConfig({
                            individualRule: 'O24',
                            individualTimerDuration: null,
                            individualMaxQuestions: (khoiDong.individualMaxQuestions && khoiDong.individualMaxQuestions > 0) ? khoiDong.individualMaxQuestions : 6
                          })}
                          className={`py-2 px-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                            (khoiDong.individualRule || 'O24') === 'O24'
                              ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          Luật O24+ (Chỉ giới hạn câu hỏi)
                        </button>
                        <button
                          onClick={() => handleUpdateConfig({
                            individualRule: 'O19_O21',
                            individualTimerDuration: khoiDong.individualTimerDuration || 60,
                            individualMaxQuestions: khoiDong.individualMaxQuestions
                          })}
                          className={`py-2 px-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                            khoiDong.individualRule === 'O19_O21'
                              ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          Luật O19/O21 (Tự do/Có thời gian)
                        </button>
                      </div>
                    </div>

                    {/* Config Duration & Max Questions for Individual */}
                    {(khoiDong.individualRule || 'O24') === 'O24' ? (
                      /* O24+ Individual Rules: No Time Limit, Custom Question Count */
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400">Giới hạn thời gian:</label>
                          <div className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-500 font-bold">
                            Không có
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-teal-300">Số câu hỏi (Admin nhập):</label>
                          <input
                            type="number"
                            min={1}
                            max={99}
                            value={khoiDong.individualMaxQuestions ?? 6}
                            onChange={(e) => handleUpdateConfig({ individualMaxQuestions: Math.max(1, Number(e.target.value)) })}
                            className="w-full bg-slate-950 border border-teal-500/50 rounded-lg px-2.5 py-1.5 text-xs text-teal-300 font-bold focus:outline-none focus:border-teal-400"
                            placeholder="Nhập số câu (ví dụ 6)"
                          />
                        </div>
                      </div>
                    ) : (
                      /* O19/O21 Individual Rules: Timer option + Question option (Cannot be both unlimited) */
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400">Thời gian trả lời:</label>
                          <select
                            value={khoiDong.individualTimerDuration === null ? 'UNLIMITED' : (khoiDong.individualTimerDuration || 60)}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === 'UNLIMITED') {
                                handleUpdateConfig({
                                  individualTimerDuration: null,
                                  individualMaxQuestions: (khoiDong.individualMaxQuestions && khoiDong.individualMaxQuestions > 0) ? khoiDong.individualMaxQuestions : 6
                                });
                              } else {
                                handleUpdateConfig({ individualTimerDuration: Number(val) });
                              }
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-teal-300 font-bold focus:outline-none focus:border-teal-500"
                          >
                            <option value={30}>30 giây</option>
                            <option value={45}>45 giây</option>
                            <option value={60}>60 giây (Chuẩn)</option>
                            <option value={90}>90 giây</option>
                            <option value="UNLIMITED">Không có</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400">Giới hạn câu hỏi:</label>
                          <div className="space-y-1">
                            <select
                              value={khoiDong.individualMaxQuestions === null ? 'UNLIMITED' : 'LIMITED'}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'UNLIMITED') {
                                  handleUpdateConfig({
                                    individualMaxQuestions: null,
                                    individualTimerDuration: khoiDong.individualTimerDuration || 60
                                  });
                                } else {
                                  handleUpdateConfig({
                                    individualMaxQuestions: (khoiDong.individualMaxQuestions && khoiDong.individualMaxQuestions > 0) ? khoiDong.individualMaxQuestions : 6
                                  });
                                }
                              }}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-teal-300 font-bold focus:outline-none focus:border-teal-500"
                            >
                              <option value="LIMITED">Có giới hạn số câu</option>
                              <option value="UNLIMITED">Không có</option>
                            </select>

                            {khoiDong.individualMaxQuestions !== null && (
                              <input
                                type="number"
                                min={1}
                                max={99}
                                value={khoiDong.individualMaxQuestions ?? 6}
                                onChange={(e) => handleUpdateConfig({ individualMaxQuestions: Math.max(1, Number(e.target.value)) })}
                                className="w-full bg-slate-950 border border-teal-500/50 rounded-lg px-2.5 py-1 text-xs text-teal-300 font-bold focus:outline-none focus:border-teal-400 mt-1"
                                placeholder="Số câu (ví dụ: 6)"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Scoring Mode Selection for Individual */}
                    <div className="space-y-1 pt-1">
                      <label className="text-[10px] font-bold text-slate-400">Cách thức tính điểm cá nhân:</label>
                      <select
                        value={khoiDong.individualScoringMode || 'TRADITIONAL'}
                        onChange={(e) => handleUpdateConfig({ individualScoringMode: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                      >
                        <option value="TRADITIONAL">Truyền thống (+10đ, sai/bỏ qua 0đ)</option>
                        <option value="ADVANCED_1">Cải tiến 1 (+10đ, sai -5đ, bỏ qua 0đ)</option>
                        <option value="ADVANCED_2">Cải tiến 2 (+10đ, 3 lần sai/bỏ qua free, từ lần 4: -5đ)</option>
                      </select>
                    </div>

                    {/* Auto Next Question Toggle for Individual */}
                    <div className="flex items-center justify-between bg-slate-950 p-2 border border-slate-800 rounded-lg">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-300">Chuyển câu tự động:</span>
                        <span className="text-[9px] text-slate-500">Tự động sang câu kế khi chấm Đúng/Sai</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUpdateConfig({ autoNextQuestion: !(khoiDong.autoNextQuestion ?? true) })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer border ${
                          (khoiDong.autoNextQuestion ?? true)
                            ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                            : 'bg-slate-900 border-slate-700 text-slate-400'
                        }`}
                      >
                        {(khoiDong.autoNextQuestion ?? true) ? '⚡ BẬT' : '🖐️ TẮT'}
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-800/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Thí Sinh Đang Thi Cá Nhân:</span>
                        {currentPlayerIndex !== null && (
                          <span className="text-[10px] font-bold text-teal-400">Thí sinh {currentPlayerIndex + 1}</span>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[0, 1, 2, 3].map((idx) => {
                          const pos = (idx + 1) as 1 | 2 | 3 | 4;
                          const isSelected = currentPlayerIndex === idx;
                          const name = matchState.players[pos]?.name || `SỐ ${pos}`;
                          const wrongCount = khoiDong.wrongCounts?.[pos] || 0;

                          return (
                            <button
                              key={idx}
                              onClick={() => handleSelectPlayer(idx)}
                              className={`py-2 rounded-lg border text-xs font-bold transition-all flex flex-col items-center justify-center cursor-pointer relative ${
                                isSelected
                                  ? 'bg-teal-500/20 border-teal-500 text-teal-300 shadow-md shadow-teal-500/10'
                                  : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                              }`}
                            >
                              <span>SỐ {pos}</span>
                              <span className="text-[9px] text-slate-500 mt-0.5 max-w-full truncate px-1">{name}</span>
                              {wrongCount > 0 && (
                                <span className="text-[9px] font-black text-rose-400 mt-0.5">❌ {wrongCount}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* COLLECTIVE CONFIG & SETUP */
                  <div className="pt-3 border-t border-slate-800/60 space-y-3">
                    {/* Rule selection for Collective */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Luật thi Chung:</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleUpdateConfig({
                            collectiveRule: 'O23',
                            collectiveTimerDuration: null,
                            collectiveMaxQuestions: (khoiDong.collectiveMaxQuestions && khoiDong.collectiveMaxQuestions > 0) ? khoiDong.collectiveMaxQuestions : 12
                          })}
                          className={`py-2 px-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                            (khoiDong.collectiveRule || 'O23') === 'O23'
                              ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          Luật O23+ (Chỉ giới hạn câu hỏi)
                        </button>
                        <button
                          onClick={() => handleUpdateConfig({
                            collectiveRule: 'O22',
                            collectiveTimerDuration: khoiDong.collectiveTimerDuration || 60,
                            collectiveMaxQuestions: null
                          })}
                          className={`py-2 px-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                            khoiDong.collectiveRule === 'O22'
                              ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          Luật O22 (Chỉ giới hạn thời gian)
                        </button>
                      </div>
                    </div>

                    {/* Config Duration & Max Questions for Collective */}
                    {(khoiDong.collectiveRule || 'O23') === 'O23' ? (
                      /* O23+ Collective Rules: No Time Limit, Custom Max Questions */
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400">Giới hạn thời gian:</label>
                          <div className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-500 font-bold">
                            Không có
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-indigo-300">Số câu hỏi (Admin nhập):</label>
                          <input
                            type="number"
                            min={1}
                            max={99}
                            value={khoiDong.collectiveMaxQuestions ?? 12}
                            onChange={(e) => handleUpdateConfig({ collectiveMaxQuestions: Math.max(1, Number(e.target.value)) })}
                            className="w-full bg-slate-950 border border-indigo-500/50 rounded-lg px-2.5 py-1.5 text-xs text-indigo-300 font-bold focus:outline-none focus:border-indigo-400"
                            placeholder="Nhập số câu (ví dụ 12)"
                          />
                        </div>
                      </div>
                    ) : (
                      /* O22 Collective Rules: Time Limit (30/45/60/90s), Unlimited Questions */
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400">Thời gian lượt chung:</label>
                          <select
                            value={khoiDong.collectiveTimerDuration || 60}
                            onChange={(e) => handleUpdateConfig({ collectiveTimerDuration: Number(e.target.value) })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-indigo-300 font-bold focus:outline-none focus:border-indigo-500"
                          >
                            <option value={30}>30 giây</option>
                            <option value={45}>45 giây</option>
                            <option value={60}>60 giây (Chuẩn)</option>
                            <option value={90}>90 giây</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400">Giới hạn câu hỏi:</label>
                          <div className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-500 font-bold">
                            Không có
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Scoring Mode Selection for Collective */}
                    <div className="space-y-1 pt-1">
                      <label className="text-[10px] font-bold text-slate-400">Cách thức tính điểm lượt chung:</label>
                      <select
                        value={khoiDong.collectiveScoringMode || 'TRADITIONAL'}
                        onChange={(e) => handleUpdateConfig({ collectiveScoringMode: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                      >
                        <option value="TRADITIONAL">Truyền thống (+10đ, -5đ)</option>
                        <option value="ADVANCED_1">Cải tiến 1 (+10đ, mất lượt câu kế, 0đ)</option>
                        <option value="ADVANCED_2">Cải tiến 2 (+10đ, lũy tiến: 1st 0, 2nd -5, 3rd -10...)</option>
                        <option value="ADVANCED_3">Cải tiến 3 (+10đ, mất lượt câu kế, sai N lần bị loại lượt chung)</option>
                        <option value="ADVANCED_4">Cải tiến 4 (Kết hợp 2 & 3: Lũy tiến + Mất lượt + Bị loại)</option>
                      </select>
                    </div>

                    {/* Buzzer Auto Unlock Delay */}
                    <div className="space-y-1 pt-1">
                      <label className="text-[10px] font-bold text-slate-400">Thời gian trễ tự động mở chuông:</label>
                      <select
                        value={khoiDong.collectiveBuzzerDelay ?? 3}
                        onChange={(e) => handleUpdateConfig({ collectiveBuzzerDelay: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-emerald-300 font-bold focus:outline-none focus:border-emerald-500"
                      >
                        <option value={0}>Ngay lập tức (0 giây)</option>
                        <option value={2}>Mở sau 2 giây</option>
                        <option value={3}>Mở sau 3 giây (Mặc định)</option>
                        <option value={5}>Mở sau 5 giây</option>
                      </select>
                    </div>

                    {/* Threshold N for Advanced 3 / 4 */}
                    {(khoiDong.collectiveScoringMode === 'ADVANCED_3' || khoiDong.collectiveScoringMode === 'ADVANCED_4') && (
                      <div className="flex items-center justify-between bg-slate-950 p-2 border border-slate-800 rounded-lg">
                        <span className="text-[10px] text-slate-400 font-bold">Giới hạn số lần sai bị loại (N):</span>
                        <select
                          value={khoiDong.disqualifyThreshold || 3}
                          onChange={(e) => handleUpdateConfig({ disqualifyThreshold: Number(e.target.value) })}
                          className="bg-slate-900 border border-slate-800 text-rose-400 text-xs font-bold rounded px-2 py-1"
                        >
                          <option value={2}>2 lần</option>
                          <option value={3}>3 lần (Mặc định)</option>
                          <option value={4}>4 lần</option>
                        </select>
                      </div>
                    )}

                    {/* Auto Next Question Toggle for Collective */}
                    <div className="flex items-center justify-between bg-slate-950 p-2 border border-slate-800 rounded-lg">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-300">Chuyển câu tự động:</span>
                        <span className="text-[9px] text-slate-500">Tự động sang câu kế khi chấm Đúng/Sai</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUpdateConfig({ autoNextQuestion: !(khoiDong.autoNextQuestion ?? true) })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer border ${
                          (khoiDong.autoNextQuestion ?? true)
                            ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                            : 'bg-slate-900 border-slate-700 text-slate-400'
                        }`}
                      >
                        {(khoiDong.autoNextQuestion ?? true) ? '⚡ BẬT' : '🖐️ TẮT'}
                      </button>
                    </div>

                    {/* Live Candidate Status Badges for Collective */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {[1, 2, 3, 4].map((p) => {
                        const pos = p as 1 | 2 | 3 | 4;
                        const wrong = khoiDong.wrongCounts?.[pos] || 0;
                        const isBlocked = khoiDong.blockedNextQuestionPlayers?.includes(pos);
                        const isDisqualified = khoiDong.disqualifiedPlayers?.includes(pos);
                        const name = matchState.players[pos]?.name || `SỐ ${pos}`;

                        return (
                          <div key={pos} className="bg-slate-950 border border-slate-850 p-2 rounded-lg text-xs flex items-center justify-between">
                            <span className="font-bold text-slate-300">{name}:</span>
                            <div className="flex items-center gap-1 text-[10px] font-extrabold">
                              {isDisqualified ? (
                                <span className="text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/30">🚫 Bị loại</span>
                              ) : isBlocked ? (
                                <span className="text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">🔒 Mất lượt kế</span>
                              ) : (
                                <span className="text-slate-400">Sai: {wrong}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* NÚT CHỐT CÀI ĐẶT */}
                <button
                  onClick={() => {
                    if (subRound === 'INDIVIDUAL' && currentPlayerIndex === null) {
                      handleSelectPlayer(0);
                    }
                    handleUpdateConfig({ isConfirmed: true });
                  }}
                  className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span>📌 Chốt Cài Đặt Khởi Động (Hiển Thị Lên Màn Hình)</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* QUESTION AND TIMER ACTIONS */}
        <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between gap-3">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">2. Câu Hỏi & Đếm Ngược:</h3>
            
            {!khoiDong.isStarted ? (
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <span className="text-[10px] text-teal-400 uppercase font-extrabold block">Xem & Chọn câu hỏi bắt đầu:</span>
                
                {(() => {
                  const totalQuestionsInBank = Math.max(36, matchQuestions?.khoi_dong?.cau_hoi?.length || 0);

                  return (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] text-slate-400 font-medium">Lựa chọn câu đầu tiên (Dropdown):</label>
                        <select
                          value={khoiDong.startQuestionIndex ?? 0}
                          onChange={(e) => adminCommand(SocketEvent.KHOI_DONG_SET_START_QUESTION, { startQuestionIndex: Number(e.target.value) })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                        >
                          {Array.from({ length: totalQuestionsInBank }).map((_, idx) => {
                            const question = matchQuestions?.khoi_dong?.cau_hoi?.[idx];
                            const previewText = question?.noi_dung ? (question.noi_dung.length > 55 ? question.noi_dung.substring(0, 55) + '...' : question.noi_dung) : '(Trống)';
                            return (
                              <option key={idx} value={idx} className="bg-slate-950 text-white">
                                Câu {idx + 1}: {previewText}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                        {Array.from({ length: totalQuestionsInBank }).map((_, idx) => {
                          const question = matchQuestions?.khoi_dong?.cau_hoi?.[idx];
                          const isSelected = (khoiDong.startQuestionIndex ?? 0) === idx;

                          return (
                            <div
                              key={idx}
                              onClick={() => adminCommand(SocketEvent.KHOI_DONG_SET_START_QUESTION, { startQuestionIndex: idx })}
                              className={`p-2.5 rounded-lg border text-xs text-left cursor-pointer transition-all flex flex-col gap-1 ${
                                isSelected
                                  ? 'bg-emerald-500/15 border-emerald-500 text-slate-100 shadow-md shadow-emerald-500/5'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`font-extrabold text-[10px] ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`}>
                                  Câu {idx + 1}
                                </span>
                                {isSelected && (
                                  <span className="text-[8px] bg-emerald-500 text-slate-950 px-1 py-0.5 rounded font-black uppercase">
                                    CÂU ĐẦU TIÊN
                                  </span>
                                )}
                              </div>
                              <p className="font-semibold text-slate-200">{question?.noi_dung || '(Trống - Chưa nhập câu hỏi)'}</p>
                              {question?.dap_an_dung && (
                                <span className="text-[10px] text-emerald-400">Đáp án: {question.dap_an_dung}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      {subRound === 'INDIVIDUAL' ? 'Đang thi cá nhân' : 'Chỉ số câu hỏi chung'}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handlePrevQuestion}
                      className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 cursor-pointer transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNextQuestion}
                      className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 cursor-pointer transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question Details Block & Integrated Grading Buttons */}
                {(() => {
                  const activeQIdx = currentQuestionIndex;
                  const activeQuestion = matchQuestions?.khoi_dong?.cau_hoi?.[activeQIdx];

                  const maxQuestionsInTurn = subRound === 'INDIVIDUAL' 
                    ? khoiDong.individualMaxQuestions
                    : khoiDong.collectiveMaxQuestions;

                  const isFinishedTurn = khoiDong.isStarted 
                    && maxQuestionsInTurn !== null 
                    && maxQuestionsInTurn !== undefined 
                    && maxQuestionsInTurn > 0 
                    && (khoiDong.countAnswered ?? 0) >= maxQuestionsInTurn;

                  if (!activeQuestion) {
                    return (
                      <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl text-center text-xs text-slate-500 italic">
                        Đang tải nội dung câu hỏi... Vui lòng bấm nạp đề nếu chưa nạp.
                      </div>
                    );
                  }

                  return (
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-left">
                      <div>
                        <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest">NỘI DUNG CÂU HỎI:</span>
                        <p className="text-sm font-bold text-white mt-1 leading-relaxed">{activeQuestion.noi_dung}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-900">
                        <div>
                          <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest">ĐÁP ÁN ĐÚNG:</span>
                          <p className="text-xs font-bold text-emerald-400 mt-0.5">{activeQuestion.dap_an_dung}</p>
                        </div>
                        {activeQuestion.chu_thich && (
                          <div>
                            <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest">GHI CHÚ / GIẢI THÍCH:</span>
                            <p className="text-[10px] text-slate-400 mt-0.5">{activeQuestion.chu_thich}</p>
                          </div>
                        )}
                      </div>

                      {/* INTEGRATED GRADING ACTION BUTTONS */}
                      <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
                        <div className="flex items-center justify-between text-xs text-slate-300">
                          <span className="font-semibold text-amber-300">
                            {subRound === 'INDIVIDUAL' 
                              ? (currentPlayerIndex !== null 
                                  ? `Thí sinh ${currentPlayerIndex + 1} đang trả lời` 
                                  : 'Chưa chọn thí sinh')
                              : matchState.buzzerState === 'BUZZED' && matchState.buzzedPlayer
                              ? `Thí sinh ${matchState.buzzedPlayer} bấm chuông`
                              : 'Chờ tín hiệu bấm chuông'}
                          </span>
                          <span className="font-bold text-teal-300 text-[11px]">
                            Đã trả lời: {khoiDong.countAnswered ?? 0}
                            {maxQuestionsInTurn !== null && maxQuestionsInTurn !== undefined && maxQuestionsInTurn > 0
                              ? ` / ${maxQuestionsInTurn} câu`
                              : ' câu'}
                          </span>
                        </div>

                        {isFinishedTurn && maxQuestionsInTurn !== null && (
                          <div className="p-2 bg-amber-500/15 border border-amber-500/30 rounded-lg text-amber-300 text-[11px] font-bold text-center">
                            ⚠️ Đã hoàn thành {maxQuestionsInTurn}/{maxQuestionsInTurn} câu hỏi. Không thể chấm thêm!
                          </div>
                        )}

                        <div className="flex items-center gap-2 flex-wrap pt-1">
                          <button
                            type="button"
                            onClick={() => handleGrade(true)}
                            disabled={isFinishedTurn}
                            className={`flex-1 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1 shadow-lg shadow-emerald-500/15 ${
                              isFinishedTurn ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                            ĐÚNG (+10đ)
                          </button>

                          <button
                            type="button"
                            onClick={() => handleGrade(false)}
                            disabled={isFinishedTurn}
                            className={`flex-1 py-2.5 px-3 bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1 shadow-lg shadow-red-500/15 ${
                              isFinishedTurn ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                          >
                            <X className="w-4 h-4 stroke-[3]" />
                            SAI
                          </button>

                          {subRound === 'INDIVIDUAL' && (
                            <button
                              type="button"
                              onClick={() => handleGrade(false, true)}
                              disabled={isFinishedTurn}
                              className={`flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1 border border-amber-500/30 ${
                                isFinishedTurn ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                              }`}
                            >
                              BỎ QUA ⏩
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={handleNextQuestion}
                            className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer shadow-lg shadow-indigo-600/15 shrink-0"
                            title="Chuyển sang câu hỏi kế tiếp"
                          >
                            <span>TIẾP</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between px-1 pt-1 text-[11px]">
                          <span className="text-slate-400">Chế độ chuyển câu:</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateConfig({ autoNextQuestion: !(khoiDong.autoNextQuestion ?? true) })}
                            className={`font-semibold px-2 py-0.5 rounded border transition-colors cursor-pointer flex items-center gap-1 ${
                              (khoiDong.autoNextQuestion ?? true)
                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                                : 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
                            }`}
                          >
                            <span>{(khoiDong.autoNextQuestion ?? true) ? '⚡ Tự động chuyển khi chấm' : '🖐️ Bấm nút TIẾP thủ công'}</span>
                            <span className="text-[9px] underline opacity-75">(Đổi)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Timers / Control Actions */}
            {!khoiDong.isStarted ? (
              <div className="flex flex-col gap-2.5 w-full">
                {khoiDong.isPrepRunning ? (
                  <div className="w-full py-4 bg-amber-500/20 border border-amber-500/40 text-amber-300 font-sans text-sm font-black rounded-xl text-center animate-pulse flex items-center justify-center gap-2">
                    <span className="text-xl">⏳</span>
                    <span>ĐANG ĐẾM NGƯỢC 3S CHUẨN BỊ ({khoiDong.prepCountdown ?? 3}s)...</span>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => adminCommand(SocketEvent.ADMIN_KHOI_DONG_PLAY_PREP_MUSIC)}
                        className="py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/15 uppercase tracking-wider flex items-center justify-center gap-1.5"
                      >
                        <span>🎵 Chạy Nhạc Chuẩn Bị</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          if (subRound === 'INDIVIDUAL' && currentPlayerIndex === null) {
                            handleSelectPlayer(0);
                          }
                          handleUpdateConfig({ isConfirmed: true });
                          adminCommand(SocketEvent.ADMIN_KHOI_DONG_START_PREP);
                        }}
                        className="py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/15 uppercase tracking-wider flex items-center justify-center gap-1.5"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Bắt Đầu 3s Đếm Ngược</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        if (subRound === 'INDIVIDUAL' && currentPlayerIndex === null) {
                          handleSelectPlayer(0);
                        }
                        handleUpdateConfig({ isConfirmed: true });
                        adminCommand(SocketEvent.KHOI_DONG_START);
                      }}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-sans text-[11px] font-semibold rounded-lg transition-all cursor-pointer text-center"
                    >
                      (Bắt đầu ngay không chờ 3s)
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3 w-full">
                {subRound === 'INDIVIDUAL' ? (
                  <div className="space-y-2 w-full">
                    <button
                      onClick={handleEndTurn}
                      className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-sans text-xs font-black rounded-xl transition-all cursor-pointer uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20"
                    >
                      <Square className="w-4 h-4 fill-current text-white" />
                      Kết thúc lượt thi
                    </button>
                    <div className={`grid ${individualRule === 'O24' ? 'grid-cols-2' : 'grid-cols-1'} gap-2 w-full`}>
                      {individualRule === 'O24' && (
                        <button
                          onClick={() => handleStartTimer(5)}
                          className="py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-amber-300 font-mono text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <span>⏱️</span>
                          <span>Đếm ngược 5s</span>
                        </button>
                      )}
                      <button
                        onClick={() => adminCommand(SocketEvent.RESET_TIMER)}
                        className="py-2.5 bg-red-950/20 border border-red-900/40 text-red-400 hover:bg-red-900/10 font-mono text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Dừng Hẹn Giờ
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 w-full">
                    <button
                      onClick={handleEndTurn}
                      className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-sans text-xs font-black rounded-xl transition-all cursor-pointer uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20"
                    >
                      <Square className="w-4 h-4 fill-current text-white" />
                      Kết thúc lượt thi chung
                    </button>
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <button
                        onClick={() => handleStartTimer(3)}
                        className="py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-emerald-400 font-mono text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <span>⏱️</span>
                        <span>Đếm ngược 3s</span>
                      </button>
                      <button
                        onClick={() => adminCommand(SocketEvent.RESET_TIMER)}
                        className="py-2.5 bg-red-950/20 border border-red-900/40 text-red-400 hover:bg-red-900/10 font-mono text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Dừng Hẹn Giờ
                      </button>
                    </div>
                    <button
                      onClick={() => adminCommand(SocketEvent.KHOI_DONG_SET_ROUND, { subRound: 'COLLECTIVE' })}
                      className="w-full py-2.5 bg-red-950/40 border border-red-900/40 text-red-400 hover:bg-red-900/30 font-sans text-xs font-bold rounded-xl transition-all cursor-pointer uppercase tracking-wider"
                    >
                      Hủy / Thiết lập lại lượt thi chung
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-500">
            <span>Trạng thái lượt thi:</span>
            {subRound === 'INDIVIDUAL' ? (
              <span className={`font-sans font-bold text-xs ${khoiDong.isStarted ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`}>
                {khoiDong.isStarted 
                  ? `ĐANG THI ĐẤU (THÍ SINH ${currentPlayerIndex !== null ? currentPlayerIndex + 1 : '?'})` 
                  : (currentPlayerIndex !== null ? 'CHỜ BẮT ĐẦU' : 'CHUẨN BỊ KHỞI ĐỘNG')}
              </span>
            ) : (
              <span className="font-mono font-bold text-white">{isTimerRunning ? `ĐANG CHẠY: ${matchState.timerSeconds}s` : 'DỪNG'}</span>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: KHỞI ĐỘNG SOUND EFFECTS PANEL */}
      <div className="lg:col-span-4 xl:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-2.5 space-y-2 shadow-md sticky top-[80px]">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
          <div className="flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-teal-400" />
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
              Âm Thanh Khởi Động
            </h3>
          </div>
          <button
            onClick={() => adminCommand(SocketEvent.ADMIN_STOP_ALL_SOUNDS)}
            className="px-2 py-0.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[9px] font-bold rounded transition-all flex items-center gap-0.5 cursor-pointer shrink-0"
          >
            <Square className="w-2.5 h-2.5 fill-current text-rose-400" />
            <span>Dừng Âm</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'Warm-up_Start', label: '1. Vào phần thi' },
            { id: 'Warm-up_BeginTurn', label: '2. Nhạc chuẩn bị' },
            { id: 'Warm-up_QuestionShow', label: '3. 3s Đếm ngược' },
            { id: 'Warm-up_MainFirstHalf', label: '4. Nửa đầu lượt' },
            { id: 'Warm-up_MainLastHalf', label: '5. Nửa sau lượt' },
            { id: 'Warm-up_MainFinalQuestion', label: '6. Câu hỏi cuối' },
            { id: 'Warm-up_Correct', label: '7. Đánh giá ĐÚNG' },
            { id: 'Warm-up_Wrong', label: '8. Đánh giá SAI' },
            { id: 'General_Buzz', label: '9. Chuông lượt chung' },
            { id: 'Warm-up_5Seconds', label: '10. Đếm ngược 5s' },
            { id: 'Warm-up_Finish', label: '11. Kết thúc lượt' },
            { id: 'General_Space', label: '12. Dấu ba chấm' },
          ].map((sound) => (
            <button
              key={sound.id}
              type="button"
              onClick={() => adminCommand(SocketEvent.ADMIN_PLAY_SOUND, { soundId: sound.id })}
              className="p-2 bg-slate-950 hover:bg-teal-950/40 border border-slate-800 hover:border-teal-500/40 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center min-h-[44px] group active:scale-[0.98]"
              title={`Phát: ${sound.label}`}
            >
              <span className="text-[11px] font-semibold text-slate-300 group-hover:text-teal-300 text-center leading-snug">
                {sound.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);
}
