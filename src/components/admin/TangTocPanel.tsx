import React, { useState } from 'react';
import { MatchState, SocketEvent, getTangTocImprovedPoints } from '../../types.js';
import { Play, Eye, Check, ChevronLeft, ChevronRight, Info, Volume2, Square, Bell, RotateCcw } from 'lucide-react';
import HelpTip from './HelpTip.js';

interface TangTocPanelProps {
  matchState: MatchState;
  adminCommand: (event: SocketEvent, data?: any) => void;
  matchQuestions?: any;
}

export default function TangTocPanel({ matchState, adminCommand, matchQuestions }: TangTocPanelProps) {
  const tangToc = matchState.tang_toc;
  const isTimerRunning = matchState.isTimerRunning;
  const currentQuestionIndex = tangToc?.currentQuestionIndex ?? 0;
  const mode = tangToc?.mode || 'TRADITIONAL';

  // Selected correct players for distributed grading (40-30-20-10)
  const [correctPlayers, setCorrectPlayers] = useState<{ [pos: number]: boolean }>({
    1: false,
    2: false,
    3: false,
    4: false,
  });

  const handleResetQuestion = () => {
    adminCommand(SocketEvent.TANG_TOC_SET_QUESTION, { questionIndex: -1 });
    setCorrectPlayers({ 1: false, 2: false, 3: false, 4: false });
  };

  const handleNextQuestion = () => {
    adminCommand(SocketEvent.NEXT_QUESTION);
    setCorrectPlayers({ 1: false, 2: false, 3: false, 4: false });
  };

  const handlePrevQuestion = () => {
    adminCommand(SocketEvent.PREV_QUESTION);
    setCorrectPlayers({ 1: false, 2: false, 3: false, 4: false });
  };

  const handleStartTimer = (seconds: number) => {
    adminCommand(SocketEvent.START_TIMER, { seconds });
  };

  const handleToggleAnswers = () => {
    adminCommand(SocketEvent.TANG_TOC_SHOW_ANSWERS, { show: !tangToc.showAnswers });
  };

  const handleToggleExplanation = () => {
    adminCommand(SocketEvent.TANG_TOC_SHOW_EXPLANATION);
  };

  const handleAutoGrade = () => {
    // Collect checked players in speed order (fastest timestamp first)
    const sortedAnswers = [...(tangToc.answers || [])].sort((a, b) => a.timestamp - b.timestamp);
    const submittedSelected = sortedAnswers
      .filter((ans) => correctPlayers[ans.playerPosition])
      .map((ans) => ans.playerPosition);

    const unsubmittedSelected = [1, 2, 3, 4].filter(
      (pos) => correctPlayers[pos] && !submittedSelected.includes(pos)
    );

    const correctPositions = [...submittedSelected, ...unsubmittedSelected];
    adminCommand(SocketEvent.GRADE_ANSWER, { isCorrect: true, correctPositions });
  };

  const currentCaiTienQ = matchQuestions?.tang_toc?.cai_tien_cau_hoi?.[currentQuestionIndex];
  const buzzedPos = matchState.buzzedPlayer || tangToc.buzzedPlayer;
  const buzzedPlayerObj = buzzedPos ? matchState.players[buzzedPos] : null;

  return (
    <div className="space-y-3">
      {/* HEADER SECTION */}
      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <h2 className="text-sm font-bold text-teal-300">Tăng Tốc</h2>
          <HelpTip content="Điều khiển 4 câu hỏi Tăng tốc, đếm ngược thời gian và chấm điểm theo thời gian gửi (Truyền thống) hoặc thứ tự bấm chuông (Cải tiến)." />
        </div>

        {/* MODE SWITCHER */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 gap-1">
          <button
            onClick={() => adminCommand(SocketEvent.TANG_TOC_SET_MODE, { mode: 'TRADITIONAL' })}
            className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold transition-all cursor-pointer ${
              mode === 'TRADITIONAL'
                ? 'bg-indigo-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Truyền Thống
          </button>
          <button
            onClick={() => adminCommand(SocketEvent.TANG_TOC_SET_MODE, { mode: 'IMPROVED' })}
            className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold transition-all cursor-pointer ${
              mode === 'IMPROVED'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Cải Tiến (Chuông)
          </button>
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
        {/* MAIN CONTROLS (LEFT COLUMN) */}
        <div className="lg:col-span-8 xl:col-span-9 grid grid-cols-1 md:grid-cols-12 gap-2.5">
          {/* LEFT COMPONENT: QUESTION & SPEED METRIC (5 COLS) */}
          <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Điều Khiển Câu Hỏi:</h3>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-teal-400 uppercase font-extrabold block">Chọn nhanh câu hỏi Tăng tốc:</span>
              <button
                type="button"
                onClick={handleResetQuestion}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer border border-slate-700"
                title="Bỏ chọn câu hỏi, xóa đáp án và reset về trạng thái ban đầu"
              >
                <RotateCcw className="w-3 h-3" />
                Reset câu hỏi
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((idx) => {
                const isSelected = currentQuestionIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => adminCommand(SocketEvent.TANG_TOC_SET_QUESTION, { questionIndex: idx })}
                    className={`py-2 px-1 text-xs font-black rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md shadow-teal-500/10'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    Câu {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Chỉ số câu hỏi Tăng Tốc:</span>
                <strong className="text-sm text-white mt-0.5 block">
                  {currentQuestionIndex >= 0 ? `Câu số ${currentQuestionIndex + 1}` : 'Chưa chọn câu hỏi'}
                </strong>
              </div>
            </div>

            <div className="border-t border-slate-800/60 pt-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-xs font-bold text-white block">Hiển thị Ảnh/Video cùng lúc</strong>
                  <p className="text-[9px] text-slate-500 leading-normal max-w-[160px]">
                    Tắt đi sẽ hiển thị logo cuộc thi khi câu hỏi hiển thị cho đến khi lật mở đáp án/giải thích.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => adminCommand(SocketEvent.TANG_TOC_TOGGLE_MEDIA)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                    tangToc?.showMedia !== false
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {tangToc?.showMedia !== false ? 'BẬT (Mặc định)' : 'TẮT (Hiện Logo)'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {mode === 'TRADITIONAL' ? 'Kích Hoạt Đếm Ngược (Chọn mức thời gian):' : 'Kích Hoạt Đếm Ngược (Cải Tiến):'}
            </span>
            
            {mode === 'TRADITIONAL' ? (
              <div className="grid grid-cols-2 gap-2">
                {[10, 20, 30, 40].map((sec) => (
                  <button
                    key={sec}
                    disabled={currentQuestionIndex < 0}
                    onClick={() => handleStartTimer(sec)}
                    className={`py-2.5 font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1 uppercase tracking-wider ${
                      currentQuestionIndex < 0
                        ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                        : 'bg-indigo-500 text-slate-950 hover:bg-indigo-400 cursor-pointer'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    {sec} GIÂY ⏱️
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={currentQuestionIndex < 0}
                  onClick={() => handleStartTimer(currentCaiTienQ?.loai_cau_hoi === 4 ? 40 : 30)}
                  className={`py-3 font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1 uppercase tracking-wider ${
                    currentQuestionIndex < 0
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                      : 'bg-amber-500 text-slate-950 hover:bg-amber-400 cursor-pointer'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  BẮT ĐẦU ({currentCaiTienQ?.loai_cau_hoi === 4 ? 40 : 30}s)
                </button>

                <button
                  disabled={currentQuestionIndex < 0}
                  onClick={handleToggleExplanation}
                  className={`py-3 border font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1 uppercase tracking-wider ${
                    currentQuestionIndex < 0
                      ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-60'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300 cursor-pointer'
                  }`}
                >
                  <Info className="w-3.5 h-3.5" />
                  HIỆN ĐÁP ÁN
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COMPONENT */}
        <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between gap-3">
          {mode === 'TRADITIONAL' ? (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">2. Kết Quả Thu Được & Chấm Điểm:</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Bấm trực tiếp vào dòng của thí sinh để chọn đáp án ĐÚNG (chuyển màu vàng).
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={handleToggleAnswers}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {tangToc.showAnswers ? 'Ẩn đáp án' : 'Lật đáp án'}
                </button>
              </div>

              {/* 4 Player Rows default, sorted by time answered (ascending from least to most time) */}
              <div className="space-y-2">
                {(() => {
                  const positions = [1, 2, 3, 4] as const;
                  const allRows = positions.map((pos) => {
                    const ansObj = (tangToc.answers || []).find((a) => a.playerPosition === pos);
                    const hasSubmitted = !!ansObj;
                    const timestamp = hasSubmitted ? ansObj.timestamp : 0;
                    const answer = hasSubmitted ? ansObj.answer : '-';
                    const sortKey = hasSubmitted ? ansObj.timestamp : 999999 + pos;

                    return {
                      pos,
                      hasSubmitted,
                      timestamp,
                      answer,
                      sortKey,
                    };
                  });

                  allRows.sort((a, b) => a.sortKey - b.sortKey);

                  return allRows.map((row) => {
                    const { pos, hasSubmitted, timestamp, answer } = row;
                    const player = matchState.players[pos];
                    const isSelected = !!correctPlayers[pos];

                    return (
                      <div
                        key={pos}
                        onClick={() => setCorrectPlayers((prev) => ({ ...prev, [pos]: !prev[pos] }))}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between shadow-sm select-none ${
                          isSelected
                            ? 'bg-amber-400 border-amber-300 text-slate-950 font-bold shadow-amber-400/20'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-slate-950 text-amber-400' : 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-400'
                            }`}
                          >
                            {pos}
                          </span>
                          <div>
                            <strong className={`text-xs block ${isSelected ? 'text-slate-950 font-black' : 'text-white'}`}>
                              {player?.name || `Thí sinh ${pos}`}
                            </strong>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className={`text-[10px] ${isSelected ? 'text-slate-800 font-semibold' : 'text-slate-400'}`}>
                                Đáp án:
                              </span>
                              <strong
                                className={`text-xs font-mono tracking-wider uppercase ${
                                  isSelected ? 'text-slate-950 font-black' : hasSubmitted ? 'text-amber-300 font-bold' : 'text-slate-500'
                                }`}
                              >
                                {hasSubmitted ? `"${answer}"` : '-'}
                              </strong>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-right">
                          <div>
                            <span
                              className={`text-xs font-mono font-bold block ${
                                isSelected ? 'text-slate-950' : hasSubmitted ? 'text-teal-400' : 'text-slate-500'
                              }`}
                            >
                              {timestamp}s
                            </span>
                            <span className={`text-[8px] uppercase font-semibold ${isSelected ? 'text-slate-800' : 'text-slate-500'}`}>
                              Tốc độ
                            </span>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                              isSelected ? 'bg-slate-950 border-slate-950 text-amber-400' : 'border-slate-700 bg-slate-900'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Action Buttons: Clear & Auto Grade */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCorrectPlayers({ 1: false, 2: false, 3: false, 4: false })}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[11px] font-bold rounded-lg transition-all cursor-pointer"
                >
                  Bỏ chọn tất cả
                </button>

                <button
                  type="button"
                  onClick={handleAutoGrade}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl transition-all shadow-lg shadow-amber-400/20 cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  Chấm điểm (40 - 30 - 20 - 10đ)
                </button>
              </div>
            </div>
          ) : (
            /* IMPROVED MODE CONTROLS */
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Trạng Thái Bấm Chuông Cải Tiến:
                </h3>
                <span className="text-xs font-bold text-slate-400">
                  Gợi ý đang hiện: <strong className="text-amber-300">{(tangToc?.currentHintIndex ?? 0) + 1}</strong>
                </span>
              </div>

              {/* Buzzed Player Card */}
              {buzzedPos ? (
                <div className="p-4 bg-amber-500/10 border-2 border-amber-500/50 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-amber-400 block">Thí Sinh Bấm Chuông Nhanh Nhất:</span>
                      <strong className="text-lg text-white block font-black">
                        Bàn {buzzedPos} - {buzzedPlayerObj?.name || `Bàn số ${buzzedPos}`}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-300 block">
                        Gợi ý số {(tangToc?.buzzedHintIndex ?? 0) + 1}
                        <span className="ml-1 text-emerald-400 font-extrabold">
                          (+{getTangTocImprovedPoints(tangToc?.buzzedHintIndex ?? 0, currentCaiTienQ?.loai_cau_hoi || 3)}đ)
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Grading Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-500/20">
                    <button
                      onClick={() => adminCommand(SocketEvent.TANG_TOC_GRADE_IMPROVED, { isCorrect: true })}
                      className="py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      TRẢ LỜI ĐÚNG (+{getTangTocImprovedPoints(tangToc?.buzzedHintIndex ?? 0, currentCaiTienQ?.loai_cau_hoi || 3)}đ)
                    </button>
                    <button
                      onClick={() => adminCommand(SocketEvent.TANG_TOC_GRADE_IMPROVED, { isCorrect: false })}
                      className="py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-black text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1"
                    >
                      TRẢ LỜI SAI (MẤT LƯỢT)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-2">
                  <p className="text-xs text-slate-400 italic">Chưa có thí sinh nào bấm chuông.</p>
                  {tangToc?.blockedPlayers && tangToc.blockedPlayers.length > 0 && (
                    <div className="text-[11px] text-rose-400 font-bold">
                      Các bàn bị mất lượt: {tangToc.blockedPlayers.join(', ')}
                    </div>
                  )}
                  {!isTimerRunning && (
                    <button
                      onClick={() => adminCommand(SocketEvent.TANG_TOC_RESUME_TIMER)}
                      className="mt-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold text-xs rounded-xl transition-all inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Tiếp Tục Đếm Ngược
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: TĂNG TỐC SOUND EFFECTS CONTROL PANEL */}
      <div className="lg:col-span-4 xl:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-2.5 space-y-2 shadow-md sticky top-[80px]">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            Âm Thanh Tăng Tốc
          </h3>
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
            { id: 'Acceleration_Start', label: '1. Bắt đầu vòng' },
            { id: 'Acceleration_QuestionShow', label: '2. Hiện câu hỏi' },
            { id: 'Acceleration_10Seconds', label: '3. Tính giờ 10s' },
            { id: 'Acceleration_20Seconds', label: '4. Tính giờ 20s' },
            { id: 'Acceleration_30Seconds', label: '5. Tính giờ 30s' },
            { id: 'Acceleration_40Seconds', label: '6. Tính giờ 40s' },
            { id: 'General_Buzz', label: '7. Chuông Tăng tốc' },
            { id: 'Acceleration_Right', label: '8. Trả lời đúng' },
            { id: 'Acceleration_Wrong', label: '9. Trả lời sai' },
          ].map((sound) => (
            <button
              key={sound.id}
              type="button"
              onClick={() => adminCommand(SocketEvent.ADMIN_PLAY_SOUND, { soundId: sound.id })}
              className="p-2 bg-slate-950 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center min-h-[44px] group active:scale-[0.98]"
              title={`Phát: ${sound.label}`}
            >
              <span className="text-[11px] font-semibold text-slate-300 group-hover:text-indigo-300 text-center leading-snug">
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
