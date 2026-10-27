import React from 'react';
import { Socket } from 'socket.io-client';
import { motion } from 'framer-motion';
import { MatchState, SocketEvent } from '../../types';
import { Play, RotateCcw, Award, CheckCircle2, XCircle, Clock, Grid, Volume2, UserCheck, Star, Zap, Bell, HelpCircle } from 'lucide-react';
import { getClueWaveIndex } from '../views/JeopardyView';
import RoundSoundPanel from './RoundSoundPanel';

interface JeopardyPanelProps {
  matchState: MatchState;
  socket: Socket | null;
  matchQuestions?: any;
}

export const JeopardyPanel: React.FC<JeopardyPanelProps> = ({ matchState, socket, matchQuestions }) => {
  const templateCategoryCount = matchQuestions?.jeopardy?.categories?.length || 0;
  const isTemplate5x4 = templateCategoryCount > 0 && templateCategoryCount <= 5;
  const jp = matchState.jeopardy || {
    boardSize: '5x4',
    categories: [],
    isBoardShown: false,
    selectedClue: null,
    clueStage: 'CLOSED',
    buzzerRuleMode: 'PENALTY_025',
    scoringMode: 'SEPARATE',
    controlPlayer: null,
    separateScores: { 1: 0, 2: 0, 3: 0, 4: 0 },
    buzzedPlayer: null,
    buzzedTimestamp: null,
    incorrectPlayersForClue: [],
    foulPlayersForClue: [],
    foulUnlockTime: {},
    is5sTimerRunning: false,
    timer5sSeconds: 5
  };

  const handleShowBoard = () => {
    socket?.emit(SocketEvent.JEOPARDY_SHOW_BOARD);
  };

  const handleRevealCategory = (categoryIndex: number) => {
    socket?.emit(SocketEvent.JEOPARDY_REVEAL_CATEGORY, { categoryIndex });
  };

  const handleSelectClue = (categoryIndex: number, clueIndex: number) => {
    socket?.emit(SocketEvent.JEOPARDY_SELECT_CLUE, { categoryIndex, clueIndex });
  };

  const handleStartBuzzer = () => {
    socket?.emit(SocketEvent.JEOPARDY_START_BUZZER);
  };

  const handleGradeAnswer = (isCorrect: boolean) => {
    socket?.emit(SocketEvent.JEOPARDY_GRADE_ANSWER, { isCorrect });
  };

  const handleStart5s = () => {
    socket?.emit(SocketEvent.JEOPARDY_START_5S);
  };

  const handleCloseClue = () => {
    socket?.emit(SocketEvent.JEOPARDY_CLOSE_CLUE);
  };

  const handleSetBoardSize = (size: '5x4' | '6x5') => {
    if (size === '6x5' && isTemplate5x4) return;
    socket?.emit(SocketEvent.JEOPARDY_SET_BOARD_SIZE, { boardSize: size });
  };

  const handleSetBuzzerRule = (mode: 'PENALTY_025' | 'STRICT_LOCK') => {
    socket?.emit(SocketEvent.JEOPARDY_SET_BUZZER_RULE, { mode });
  };

  const handleSetScoringMode = (mode: 'COMBINED' | 'SEPARATE') => {
    socket?.emit(SocketEvent.JEOPARDY_SET_SCORING_MODE, { mode });
  };

  const handleSetControlPlayer = (position: number | null) => {
    socket?.emit(SocketEvent.JEOPARDY_SET_CONTROL_PLAYER, { position });
  };

  const handleResetGame = () => {
    if (window.confirm('Bạn có chắc chắn muốn khởi tạo lại toàn bộ bảng Jeopardy! không?')) {
      socket?.emit(SocketEvent.JEOPARDY_RESET_GAME);
    }
  };

  const activeClue = jp.selectedClue && jp.categories?.[jp.selectedClue.categoryIndex]?.clues?.[jp.selectedClue.clueIndex];
  const activeCategoryTitle = jp.selectedClue && jp.categories?.[jp.selectedClue.categoryIndex]?.title;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-white shadow-xl space-y-5 backdrop-blur-md" id="jeopardy-panel">
      {/* HEADER CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-lg font-bold text-sky-400 flex items-center gap-2">
            <Grid className="w-5 h-5 text-sky-400" /> PHẦN THI PHỤ: JEOPARDY!
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Format ô chữ Jeopardy! tích hợp âm thanh & chuông giành quyền thông minh
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {!jp.isBoardShown ? (
            <button
              onClick={handleShowBoard}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow transition flex items-center gap-1.5 text-xs uppercase tracking-wide cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" /> Hiển thị Bảng & Phát Nhạc
            </button>
          ) : (
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Bảng đã hiển thị
            </span>
          )}

          <button
            onClick={handleResetGame}
            className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Jeopardy
          </button>
        </div>
      </div>

      {/* CONFIG & SETTINGS RIBBON */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
        {/* Kích thước bảng */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block">Kích thước Bảng:</label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => handleSetBoardSize('5x4')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer ${
                jp.boardSize === '5x4'
                  ? 'bg-blue-600 text-white border-blue-400'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              5x4 (5 chủ đề)
            </button>
            <button
              onClick={() => handleSetBoardSize('6x5')}
              disabled={isTemplate5x4}
              title={isTemplate5x4 ? 'File đề thi nạp là loại 5x4 (5 chủ đề), không thể chuyển sang 6x5' : 'Chuyển sang 6x5 (6 chủ đề)'}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition border ${
                isTemplate5x4
                  ? 'bg-slate-900/40 text-slate-600 border-slate-850 cursor-not-allowed'
                  : jp.boardSize === '6x5'
                  ? 'bg-blue-600 text-white border-blue-400 cursor-pointer'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 cursor-pointer'
              }`}
            >
              6x5 (6 chủ đề)
            </button>
          </div>
          {isTemplate5x4 && (
            <p className="text-[10px] text-sky-400/80 mt-0.5 font-medium">* Khóa 6x5 do đề thi quy định 5x4</p>
          )}
        </div>

        {/* Luật chuông */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block">Chế độ Chuông:</label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => handleSetBuzzerRule('PENALTY_025')}
              className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition border cursor-pointer ${
                jp.buzzerRuleMode === 'PENALTY_025'
                  ? 'bg-sky-500 text-slate-950 border-sky-400'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              Phạt 0.25s phạm quy
            </button>
            <button
              onClick={() => handleSetBuzzerRule('STRICT_LOCK')}
              className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition border cursor-pointer ${
                jp.buzzerRuleMode === 'STRICT_LOCK'
                  ? 'bg-sky-500 text-slate-950 border-sky-400'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              Bỏ qua khi khóa
            </button>
          </div>
        </div>

        {/* Chế độ điểm */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block">Chế độ Tính điểm:</label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => handleSetScoringMode('SEPARATE')}
              className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition border cursor-pointer ${
                jp.scoringMode === 'SEPARATE'
                  ? 'bg-indigo-600 text-white border-indigo-400'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              Độc lập (Jeopardy Score)
            </button>
            <button
              onClick={() => handleSetScoringMode('COMBINED')}
              className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition border cursor-pointer ${
                jp.scoringMode === 'COMBINED'
                  ? 'bg-indigo-600 text-white border-indigo-400'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              Cộng điểm Trận đấu
            </button>
          </div>
        </div>

        {/* Quyền lựa chọn (Control Player) */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block">Quyền chọn ô:</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((pos) => {
              const p = matchState.players[pos];
              const isControl = jp.controlPlayer === pos;
              return (
                <button
                  key={pos}
                  onClick={() => handleSetControlPlayer(isControl ? null : pos)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer ${
                    isControl
                      ? 'bg-blue-600 text-white border-blue-400'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                  title={p?.name ? `Thí sinh ${pos}: ${p.name}` : `Thí sinh ${pos}`}
                >
                  TS{pos}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ACTIVE CLUE OVERLAY CONTROLS (IF CLUE IS SELECTED) */}
      {activeClue ? (
        <div className="bg-slate-950/80 p-4 rounded-xl border border-blue-500/30 space-y-3 shadow-md backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2.5">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-400 block">{activeCategoryTitle}</span>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Gợi ý {activeClue.points} điểm
              </h3>
            </div>

            <div className="flex items-center gap-2.5">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border uppercase tracking-wide ${
                jp.clueStage === 'READING'
                  ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                  : jp.clueStage === 'OPEN'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 animate-pulse'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {jp.clueStage === 'READING' ? 'MC Đang đọc' : jp.clueStage === 'OPEN' ? 'ĐÃ MỞ CHUÔNG' : 'Kết thúc'}
              </span>

              <button
                onClick={handleCloseClue}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition cursor-pointer active:scale-95"
              >
                Đóng Gợi Ý / Trở về Bảng
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1.5">
              <span className="text-[10px] text-sky-400 font-semibold block uppercase tracking-wider">NỘI DUNG GỢI Ý:</span>
              {activeClue.media?.url && (
                <div className="my-1 p-1.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center">
                  {activeClue.media.type === 'video' ? (
                    <video src={activeClue.media.url} controls className="max-h-32 rounded-lg" />
                  ) : activeClue.media.type === 'audio' ? (
                    <audio src={activeClue.media.url} controls className="w-full" />
                  ) : (
                    <img src={activeClue.media.url} alt="Media" className="max-h-32 object-contain rounded-lg" />
                  )}
                </div>
              )}
              <p className="text-xs font-medium text-slate-200 leading-relaxed">{activeClue.question}</p>
            </div>
            <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-emerald-400 font-semibold block mb-0.5 uppercase tracking-wider">ĐÁP ÁN DÀNH CHO MC:</span>
              <p className="text-xs font-bold text-emerald-300 leading-relaxed">{activeClue.dap_an_dung}</p>
            </div>
          </div>

          {/* BUZZED CONTESTANT BANNER & ACTIONS */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800">
            <div className="flex items-center gap-3">
              {matchState.buzzedPlayer ? (
                <div className="flex items-center gap-2.5 bg-sky-500/15 px-3 py-1.5 rounded-lg border border-sky-400/40">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
                  <div>
                    <span className="text-[10px] text-sky-300 font-medium block">Thí sinh giành chuông:</span>
                    <h4 className="text-sm font-bold text-sky-300">
                      TS {matchState.buzzedPlayer}: {matchState.players[matchState.buzzedPlayer]?.name || `Vị trí ${matchState.buzzedPlayer}`}
                    </h4>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 font-medium">
                  {jp.clueStage === 'READING' ? (
                    <span className="text-yellow-400 font-semibold">MC đang đọc gợi ý. Chuông chưa mở.</span>
                  ) : jp.clueStage === 'OPEN' ? (
                    <span className="text-emerald-400 font-semibold animate-pulse">Chuông đang mở! Đang chờ thí sinh bấm chuông...</span>
                  ) : (
                    <span>Chưa có thí sinh bấm chuông.</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {jp.clueStage === 'READING' && (
                <button
                  onClick={handleStartBuzzer}
                  className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg shadow transition text-xs flex items-center gap-1 cursor-pointer uppercase tracking-wider"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" /> Bắt đầu Mở Chuông
                </button>
              )}

              {matchState.buzzedPlayer && (
                <>
                  <button
                    onClick={() => handleGradeAnswer(true)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow transition text-xs flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> ĐÚNG (+{activeClue.points}đ)
                  </button>

                  <button
                    onClick={() => handleGradeAnswer(false)}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow transition text-xs flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <XCircle className="w-3.5 h-3.5" /> SAI (-{activeClue.points}đ)
                  </button>
                </>
              )}

              {jp.clueStage === 'OPEN' && !matchState.buzzedPlayer && (
                <button
                  onClick={handleStart5s}
                  disabled={jp.is5sTimerRunning}
                  className={`px-3.5 py-1.5 font-bold rounded-lg text-xs flex items-center gap-1 border transition cursor-pointer active:scale-95 ${
                    jp.is5sTimerRunning
                      ? 'bg-sky-500/20 border-sky-400/40 text-sky-300'
                      : 'bg-sky-500 hover:bg-sky-400 text-slate-950 border-sky-400'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" /> {jp.is5sTimerRunning ? `Đếm ngược ${jp.timer5sSeconds}s...` : 'Đếm ngược 5s'}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* JEOPARDY BOARD MATRIX */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Grid className="w-3.5 h-3.5 text-sky-400" /> BẢNG GỢI Ý ({jp.boardSize})
        </h3>

        <div className={`grid gap-2.5 ${jp.boardSize === '6x5' ? 'grid-cols-6' : 'grid-cols-5'}`}>
          {jp.categories.map((cat, cIdx) => (
            <div key={cIdx} className="space-y-1.5">
              {/* Category Header */}
              {(() => {
                const isRevealed = cat.isRevealed;
                const isHighlighted = jp.highlightedCategoryIndex === cIdx;

                return (
                  <button
                    type="button"
                    onClick={() => handleRevealCategory(cIdx)}
                    className={`w-full p-2 rounded-lg border text-center h-[64px] overflow-hidden flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isHighlighted
                        ? 'bg-sky-500/25 border-sky-300 text-sky-200 font-bold ring-2 ring-sky-400/50'
                        : isRevealed
                        ? 'bg-blue-900/80 border-blue-500/50 text-sky-100 hover:border-sky-400'
                        : 'bg-slate-800/90 border-slate-700 text-slate-400 hover:border-sky-400/80 hover:text-sky-300'
                    }`}
                    title={isRevealed ? 'Đã lật mở (Nhấn để highlight)' : 'Nhấn để lật mở chủ đề này'}
                  >
                    <span className={`text-[9px] font-semibold uppercase tracking-wider ${isHighlighted ? 'text-sky-200' : isRevealed ? 'text-sky-300' : 'text-slate-500'}`}>
                      Chủ đề {cIdx + 1} {!isRevealed && '🔒'}
                    </span>
                    <span className={`text-xs uppercase tracking-wide line-clamp-2 ${isHighlighted ? 'text-white font-bold' : isRevealed ? 'text-slate-100 font-bold' : 'text-slate-400 font-medium'}`}>
                      {isRevealed ? cat.title : '••••••••••'}
                    </span>
                  </button>
                );
              })()}

              {/* Clue Point Buttons */}
              <div className="space-y-1.5">
                {cat.clues.map((clue, kIdx) => {
                  const isSelected = jp.selectedClue?.categoryIndex === cIdx && jp.selectedClue?.clueIndex === kIdx;
                  const isAnswered = clue.isAnswered;

                  return (
                    <div key={kIdx}>
                      <button
                        onClick={() => handleSelectClue(cIdx, kIdx)}
                        disabled={isAnswered}
                        className={`w-full py-2.5 rounded-lg font-bold text-base transition border flex items-center justify-center ${
                          isSelected
                            ? 'bg-sky-400 text-slate-950 border-sky-300 shadow-sm'
                            : isAnswered
                            ? 'bg-slate-950/60 border-slate-900 text-slate-700 opacity-20 cursor-not-allowed select-none'
                            : 'bg-blue-950/80 hover:bg-blue-900 text-sky-300 border-blue-500/40 hover:border-sky-400 hover:text-sky-100 cursor-pointer shadow-md'
                        }`}
                      >
                        <span>{clue.points}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BẢNG ĐIỀU KHIỂN ÂM THANH JEOPARDY */}
      <RoundSoundPanel
        title="Bảng Điều Khiển Âm Thanh: Jeopardy!"
        accentColor="indigo"
        columns={3}
        adminCommand={(event, data) => socket?.emit(event, data)}
        sounds={[
          { id: 'Jeopardy_Start', label: '1. Bắt đầu vòng thi' },
          { id: 'Jeopardy_BoardShow', label: '2. Hiển thị bảng điểm' },
          { id: 'Jeopardy_ClueShow', label: '3. Hiển thị gợi ý' },
          { id: 'Jeopardy_5Seconds', label: '4. Đếm ngược 5 giây' },
          { id: 'General_Buzz', label: '5. Chuông giành quyền' },
          { id: 'Warm-up_Correct', label: '6. Trả lời đúng' },
          { id: 'Warm-up_Wrong', label: '7. Trả lời sai' },
          { id: 'Jeopardy_Finish', label: '8. Kết thúc vòng thi' },
          { id: 'General_Space', label: '9. Dấu ba chấm' },
        ]}
      />
    </div>
  );
};

