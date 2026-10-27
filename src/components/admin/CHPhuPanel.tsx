import React, { useState, useEffect } from 'react';
import { MatchState, SocketEvent, CHPhuRuleMode } from '../../types.js';
import { Play, Check, X, ShieldAlert, Users, Radio, Eye, EyeOff, AlertTriangle, Volume2, Square, Trophy, Sparkles, RefreshCw } from 'lucide-react';
import ShootoutScoreDots, { ImprovedScoreDots } from '../ShootoutScoreDots.js';

interface CHPhuPanelProps {
  matchState: MatchState;
  adminCommand: (event: SocketEvent, data?: any) => void;
  matchQuestions?: any;
}

export default function CHPhuPanel({ matchState, adminCommand, matchQuestions }: CHPhuPanelProps) {
  const chPhu = matchState.cau_hoi_phu;
  const isTimerRunning = matchState.isTimerRunning;
  const currentQuestionIndex = chPhu?.currentQuestionIndex ?? 0;
  const ruleMode: CHPhuRuleMode = chPhu?.ruleMode || 'TRADITIONAL';

  // Local state for choosing contestants before confirming
  const [localSelected, setLocalSelected] = useState<number[]>([]);

  // Synchronize local selected list with confirmed list initially or when confirmed list changes
  useEffect(() => {
    if (chPhu?.confirmedPlayers) {
      setLocalSelected(chPhu.confirmedPlayers);
    }
  }, [chPhu?.confirmedPlayers]);

  const handleSetRuleMode = (mode: CHPhuRuleMode) => {
    adminCommand(SocketEvent.CHP_SET_RULE_MODE, { mode });
  };

  const handleTogglePlayerSelection = (pos: number) => {
    if (localSelected.includes(pos)) {
      setLocalSelected(localSelected.filter(p => p !== pos));
    } else {
      setLocalSelected([...localSelected, pos].sort());
    }
  };

  const handleConfirmPlayers = () => {
    if (localSelected.length < 2) return;
    adminCommand(SocketEvent.CHP_CONFIRM_PLAYERS, { positions: localSelected });
  };

  const handleToggleRevealQuestion = () => {
    adminCommand(SocketEvent.CHP_REVEAL_QUESTION, { reveal: !chPhu?.questionRevealed });
  };

  const handleSetBuzzerMode = (mode: 'CONTINUOUS' | 'ON_TIMER') => {
    adminCommand(SocketEvent.CHP_SET_BUZZER_MODE, { mode });
  };

  const handleNextQuestion = () => {
    adminCommand(SocketEvent.NEXT_QUESTION);
  };

  const handlePrevQuestion = () => {
    adminCommand(SocketEvent.PREV_QUESTION);
  };

  const handleStartTimer = () => {
    const seconds = ruleMode === 'SHOOTOUT' ? 10 : 15;
    adminCommand(SocketEvent.START_TIMER, { seconds });
  };

  const handleGrade = (isCorrect: boolean) => {
    adminCommand(SocketEvent.GRADE_ANSWER, { isCorrect });
  };

  const confirmedPlayers = chPhu?.confirmedPlayers || [];
  const activeQuestionItem = matchQuestions?.cau_hoi_phu?.cau_hoi?.[currentQuestionIndex] || matchQuestions?.cau_hoi_phu?.[currentQuestionIndex];

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
        <div>
          <h2 className="text-md font-bold text-teal-300">Vòng Thi: Câu Hỏi Phụ 2.0</h2>
          <p className="text-xs text-slate-400">Dành cho các thí sinh đồng điểm để phân định thứ hạng / vị trí vé đi tiếp.</p>
        </div>
        <div className="flex gap-2">
          {isTimerRunning ? (
            <button
              onClick={() => adminCommand(SocketEvent.PAUSE_TIMER)}
              className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 text-xs font-bold rounded-lg transition-all"
            >
              Tạm Dừng ⏱️
            </button>
          ) : (
            <button
              onClick={() => adminCommand(SocketEvent.RESET_TIMER)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-400 text-xs font-bold rounded-lg transition-all"
            >
              Reset Hẹn Giờ ⏱️
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-start">
        {/* LEFT COLUMN: MAIN CHP CONTROLS */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-2.5">
          {/* RULE MODE SELECTOR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-400" /> Choose Rule Mode (Luật Thi Câu Hỏi Phụ 2.0):
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Current: {ruleMode}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Option 1: TRADITIONAL */}
          <button
            onClick={() => handleSetRuleMode('TRADITIONAL')}
            className={`p-3.5 border rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between ${
              ruleMode === 'TRADITIONAL'
                ? 'bg-teal-500/15 border-teal-500/60 text-teal-200 ring-2 ring-teal-500/30'
                : 'bg-slate-950 border-slate-850 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black uppercase text-white">1. Truyền Thống</span>
                {ruleMode === 'TRADITIONAL' && <Check className="w-4 h-4 text-teal-400" />}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Thí sinh bấm chuông giành quyền trả lời ở từng câu (15s). Trả lời đúng thắng ngay vòng chơi.
              </p>
            </div>
          </button>

          {/* Option 2: IMPROVED */}
          <button
            onClick={() => handleSetRuleMode('IMPROVED')}
            className={`p-3.5 border rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between ${
              ruleMode === 'IMPROVED'
                ? 'bg-indigo-500/15 border-indigo-500/60 text-indigo-200 ring-2 ring-indigo-500/30'
                : 'bg-slate-950 border-slate-850 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black uppercase text-white">2. Cải Tiến (Chạm 5đ)</span>
                {ruleMode === 'IMPROVED' && <Check className="w-4 h-4 text-indigo-400" />}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Tối đa 15/20/25 câu hỏi (15s). Đúng +1đ. Ai đạt 5đ trước hoặc cao điểm nhất (xét tổng thời gian nếu hòa) thắng.
              </p>
            </div>
          </button>

          {/* Option 3: SHOOTOUT */}
          <button
            onClick={() => handleSetRuleMode('SHOOTOUT')}
            className={`p-3.5 border rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between ${
              ruleMode === 'SHOOTOUT'
                ? 'bg-amber-500/15 border-amber-500/60 text-amber-200 ring-2 ring-amber-500/30'
                : 'bg-slate-950 border-slate-850 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black uppercase text-white">3. Luân Lưu (5 Lượt Trả Lời)</span>
                {ruleMode === 'SHOOTOUT' && <Check className="w-4 h-4 text-amber-400" />}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Mỗi thí sinh 5 câu hỏi lần lượt (10s). Đúng +1đ, sai 0đ. Tự động thắng sớm nếu đối thủ hết cơ hội bám đuổi.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* WINNER DISPLAY BANNER IF CHP ENDED */}
      {chPhu?.winnerPosition && (
        <div className="p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-2 border-emerald-500/60 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500 text-slate-950 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg">
              🏆
            </div>
            <div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                XÁC ĐỊNH THÍ SINH CHIẾN THẮNG CHP
              </span>
              <h3 className="text-lg font-black text-white mt-1">
                Bàn {chPhu.winnerPosition} ({matchState.players[chPhu.winnerPosition as 1|2|3|4]?.name})
              </h3>
              {chPhu.winnerReason && (
                <p className="text-xs text-emerald-300 font-semibold mt-0.5">
                  Lý do: {chPhu.winnerReason}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleConfirmPlayers}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Thi Lại CHP
          </button>
        </div>
      )}

      {/* STEP 1 & STEP 2: CONTESTANTS & BUZZER/TURN CONFIG */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contestant Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Users className="w-4 h-4 text-teal-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">1. Thí Sinh Tham Gia CHP:</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(pos => {
              const player = matchState.players[pos as 1 | 2 | 3 | 4];
              const name = player?.name || `Bàn ${pos}`;
              const isSelected = localSelected.includes(pos);
              const isConfirmed = confirmedPlayers.includes(pos);
              const chpScore = chPhu?.scores?.[pos] ?? 0;
              const chpTime = chPhu?.totalTime?.[pos] ?? 0;

              return (
                <label
                  key={pos}
                  onClick={() => handleTogglePlayerSelection(pos)}
                  className={`flex flex-col justify-between p-2.5 border rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-teal-500/10 border-teal-500/40 text-teal-300'
                      : 'bg-slate-950 border-slate-850 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        className="accent-teal-400 cursor-pointer h-3.5 w-3.5 rounded"
                      />
                      <span className="text-xs font-bold">Bàn {pos}</span>
                    </div>
                    {isConfirmed && isSelected && (
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded font-bold uppercase">
                        Chốt
                      </span>
                    )}
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-white block truncate">{name}</span>
                    {isConfirmed && ruleMode !== 'TRADITIONAL' ? (
                      <div className="mt-1 pt-1 border-t border-slate-800/80 text-[10px] space-y-1 font-mono">
                        {ruleMode === 'IMPROVED' && (
                          <div className="pt-0.5 flex justify-start">
                            <ImprovedScoreDots
                              score={chpScore}
                              totalTime={chpTime}
                              size="sm"
                            />
                          </div>
                        )}
                        {ruleMode === 'SHOOTOUT' && (
                          <div className="pt-0.5 flex justify-end">
                            <ShootoutScoreDots 
                              history={chPhu?.history?.[pos]} 
                              isCurrentTurn={chPhu?.currentTurnPlayer === pos}
                              size="md"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                        Điểm chính: {player?.score ?? 0}
                      </span>
                    )}
                  </div>
                </label>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              onClick={handleConfirmPlayers}
              disabled={localSelected.length < 2}
              className={`w-full py-2.5 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer ${
                localSelected.length >= 2
                  ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md'
                  : 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              XÁC NHẬN BẮT ĐẦU CHP ({localSelected.length}/4 Thí Sinh)
            </button>
            {localSelected.length < 2 && (
              <p className="text-[10px] text-red-400 mt-2 text-center flex items-center justify-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Cần tối thiểu 2 thí sinh để bắt đầu Câu hỏi phụ!
              </p>
            )}
          </div>
        </div>

        {/* Mode Specific Controls & Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Radio className="w-4 h-4 text-teal-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                2. {ruleMode === 'SHOOTOUT' ? 'Trạng Thái Lượt Thi Luân Lưu:' : 'Cấu Hình Chuông CHP:'}
              </h3>
            </div>

            {ruleMode === 'SHOOTOUT' ? (
              <div className="mt-4 p-4 bg-slate-950 border border-amber-500/30 rounded-xl space-y-3">
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold uppercase">
                  Chế độ Luân Lưu (Không Dùng Chuông)
                </span>
                {chPhu?.currentTurnPlayer ? (
                  <div className="text-sm font-bold text-white pt-1">
                    Đang là lượt trả lời của: <span className="text-amber-400 font-black text-base">Bàn {chPhu.currentTurnPlayer} ({matchState.players[chPhu.currentTurnPlayer as 1|2|3|4]?.name})</span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Vui lòng bấm Xác nhận Thí sinh để khởi tạo lượt trả lời.</p>
                )}
                {chPhu?.stage === 'SUDDEN_DEATH' && (
                  <p className="text-xs text-rose-400 font-extrabold animate-pulse pt-1">
                    🔥 ĐANG TRONG LƯỢT TRẢ LỜI LUÂN LƯU SINH TỬ (SUDDEN DEATH - LƯỢT {chPhu.suddenDeathRound || 6})
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {/* Option A */}
                <label
                  onClick={() => handleSetBuzzerMode('ON_TIMER')}
                  className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                    chPhu?.buzzerMode === 'ON_TIMER'
                      ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300'
                      : 'bg-slate-950 border-slate-850 hover:border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="mt-0.5">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${chPhu?.buzzerMode === 'ON_TIMER' ? 'border-indigo-400' : 'border-slate-600'}`}>
                      {chPhu?.buzzerMode === 'ON_TIMER' && <div className="w-2 h-2 rounded-full bg-indigo-400" />}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-white">Chỉ mở chuông khi tính giờ (15s)</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block leading-relaxed">
                      Chuông chỉ hoạt động sau khi bấm PHÁT LỆNH 15S. Khóa chuông khi có người bấm đầu tiên.
                    </span>
                  </div>
                </label>

                {/* Option B */}
                <label
                  onClick={() => handleSetBuzzerMode('CONTINUOUS')}
                  className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                    chPhu?.buzzerMode === 'CONTINUOUS'
                      ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300'
                      : 'bg-slate-950 border-slate-850 hover:border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="mt-0.5">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${chPhu?.buzzerMode === 'CONTINUOUS' ? 'border-indigo-400' : 'border-slate-600'}`}>
                      {chPhu?.buzzerMode === 'CONTINUOUS' && <div className="w-2 h-2 rounded-full bg-indigo-400" />}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-white">Mở chuông liên tục</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block leading-relaxed">
                      Nhận chuông tại mọi thời điểm. Bấm trước giờ sẽ bị phạm quy.
                    </span>
                  </div>
                </label>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Trạng thái câu hỏi:</span>
            <button
              onClick={handleToggleRevealQuestion}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                chPhu?.questionRevealed
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
              }`}
            >
              {chPhu?.questionRevealed ? (
                <>
                  <Eye className="w-4 h-4" />
                  ĐÃ CÔNG BỐ
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" />
                  ĐANG ẨN CÂU HỎI
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CONTROL DECK */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">3. Quản Lý Câu Hỏi CHP:</h3>
          
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Chỉ số câu hỏi phụ:</span>
              <strong className="text-sm text-white block mt-0.5">
                Câu hỏi phụ số {currentQuestionIndex + 1} {ruleMode === 'IMPROVED' && `/ ${chPhu?.maxQuestions || 15}`}
              </strong>
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={handlePrevQuestion}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 text-xs cursor-pointer transition-all font-bold"
              >
                Trước
              </button>
              <button
                onClick={handleNextQuestion}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 text-xs cursor-pointer transition-all font-bold"
              >
                Tiếp Theo
              </button>
            </div>
          </div>

          {/* Active Question Display */}
          {activeQuestionItem ? (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 text-left">
              <div className="flex justify-between items-center">
                <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded font-bold uppercase inline-block">
                  {activeQuestionItem.linh_vuc || 'Câu Hỏi Phụ'}
                </span>
                {!chPhu?.questionRevealed && (
                  <span className="text-[9px] text-amber-400 font-bold uppercase">
                    Chưa hiển thị trên màn hình
                  </span>
                )}
              </div>
              <p className="text-xs text-white font-semibold leading-relaxed">
                {activeQuestionItem.noi_dung}
              </p>
              <div className="pt-2 border-t border-slate-850">
                <span className="text-[9px] text-slate-500 uppercase block font-bold">Đáp án đúng:</span>
                <span className="text-xs text-emerald-400 font-bold font-mono uppercase block">{activeQuestionItem.dap_an_dung}</span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center text-xs text-slate-500">
              Chưa có dữ liệu cho câu hỏi phụ số {currentQuestionIndex + 1}.
            </div>
          )}

          <button
            onClick={handleStartTimer}
            disabled={confirmedPlayers.length < 2}
            className={`w-full py-3 font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer ${
              confirmedPlayers.length >= 2
                ? 'bg-indigo-500 hover:bg-indigo-400 text-slate-950'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            PHÁT LỆNH {ruleMode === 'SHOOTOUT' ? '10 GIÂY (Cho Bàn ' + (chPhu?.currentTurnPlayer || '') + ')' : '15 GIÂY'} ⏱️
          </button>
        </div>

        {/* DETECTED BUZZER OR TURN STATUS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              4. {ruleMode === 'SHOOTOUT' ? 'Chấm Điểm Lượt Trả Lời Luân Lưu:' : 'Trạng Thái Chuông & Vi Phạm:'}
            </h3>
            
            {ruleMode === 'SHOOTOUT' ? (
              <div className="p-4 bg-slate-950 border border-amber-500/30 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-amber-300">
                    Lượt thí sinh: Bàn {chPhu?.currentTurnPlayer || 1}
                  </span>
                  <div className="pt-0.5">
                    <ShootoutScoreDots 
                      history={chPhu?.history?.[chPhu?.currentTurnPlayer || 1]} 
                      isCurrentTurn={true}
                      size="md"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleGrade(true)}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md"
                  >
                    <Check className="w-4 h-4" />
                    ĐÚNG (+1 ĐIỂM)
                  </button>
                  <button
                    onClick={() => handleGrade(false)}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md"
                  >
                    <X className="w-4 h-4" />
                    SAI (0 ĐIỂM)
                  </button>
                </div>
              </div>
            ) : matchState.buzzerState === 'BUZZED' && matchState.buzzedPlayer ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center space-y-3">
                <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-bold uppercase inline-block">
                  🚨 THÍ SINH ĐÃ GIÀNH CHUÔNG!
                </span>
                <p className="text-sm font-bold text-white leading-relaxed">
                  Bàn số {matchState.buzzedPlayer} ({matchState.players[matchState.buzzedPlayer as 1 | 2 | 3 | 4]?.name}) nhấn chuông!
                </p>

                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    onClick={() => handleGrade(true)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-md"
                  >
                    <Check className="w-4 h-4" />
                    ĐÚNG {ruleMode === 'IMPROVED' ? '(+1đ)' : '(THẮNG NGAY)'}
                  </button>
                  <button
                    onClick={() => handleGrade(false)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-md"
                  >
                    <X className="w-4 h-4" />
                    SAI (BẤM TIẾP/MẤT LƯỢT)
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center text-xs text-slate-500 space-y-1">
                <p>Đang đợi thí sinh nhấn chuông.</p>
                <p className="text-[10px] text-slate-600">
                  {chPhu?.buzzerMode === 'CONTINUOUS'
                    ? 'Nhận chuông tại mọi thời điểm (bấm trước giờ = phạm quy)'
                    : 'Chuông mở sau khi bấm PHÁT LỆNH 15S'}
                </p>
              </div>
            )}

            {/* List of Foul and Incorrect Players for Traditional/Improved */}
            {ruleMode !== 'SHOOTOUT' && (
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl space-y-1">
                  <span className="font-bold text-red-400 uppercase block text-[9px] tracking-wider">Lỗi phạm quy:</span>
                  {chPhu?.foulPlayers && chPhu.foulPlayers.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {chPhu.foulPlayers.map(p => (
                        <span key={p} className="bg-red-500/20 border border-red-500/30 text-red-300 font-extrabold px-1.5 py-0.5 rounded text-[10px]">
                          Bàn {p}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-600 italic text-[10px]">Không có</span>
                  )}
                </div>

                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-1">
                  <span className="font-bold text-amber-400 uppercase block text-[9px] tracking-wider">Trả lời sai (Khóa Q này):</span>
                  {chPhu?.incorrectPlayers && chPhu.incorrectPlayers.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {chPhu.incorrectPlayers.map(p => (
                        <span key={p} className="bg-amber-500/20 border border-amber-500/30 text-amber-300 font-extrabold px-1.5 py-0.5 rounded text-[10px]">
                          Bàn {p}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-600 italic text-[10px]">Không có</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[10px] text-slate-500">
        *Lưu ý: Chỉ thí sinh có trong danh sách chốt mới được thực hiện thao tác. Ở luật Cải tiến và Luân lưu, nhạc nền Ambience phát đè lặp lại ở 50% âm lượng.
      </div>
    </div>

      {/* RIGHT COLUMN: CHP SOUND EFFECTS CONTROL PANEL */}
      <div className="lg:col-span-4 xl:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-2.5 space-y-2 shadow-md sticky top-[80px]">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-teal-400" />
            Âm Thanh CHP
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
            { id: 'General_Ambience', label: '1. Nhạc Ambience' },
            { id: 'Additional_Start', label: '2. Bắt đầu vòng' },
            { id: 'Additional_QuestionShow', label: '3. Hiện câu hỏi' },
            { id: 'Additional_15Seconds', label: '4a. Tính giờ 15s' },
            { id: 'Additional_10Seconds', label: '4b. Tính giờ 10s' },
            { id: 'General_Buzz', label: '5. Chuông giành quyền' },
            { id: 'Additional_Right', label: '6. Trả lời đúng' },
            { id: 'Additional_Win', label: '7. Chiến thắng CHP' },
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
