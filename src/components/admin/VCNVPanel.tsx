import React, { useState } from 'react';
import { MatchState, SocketEvent } from '../../types.js';
import { AlertTriangle, HelpCircle, Check, Play, Eye, Award, Image as ImageIcon, Volume2, Square, X, Settings2, Grid } from 'lucide-react';
import HelpTip from './HelpTip.js';

interface VCNVPanelProps {
  matchState: MatchState;
  adminCommand: (event: SocketEvent, data?: any) => void;
  matchQuestions?: any;
}

export default function VCNVPanel({ matchState, adminCommand, matchQuestions }: VCNVPanelProps) {
  const vcnv = matchState.vcnv;
  const isTimerRunning = matchState.isTimerRunning;
  const selectedRowId = vcnv.selectedRow;
  const currentRow = selectedRowId ? vcnv.rows[selectedRowId] : null;

  const soHangNgang = vcnv.soHangNgang || 8;
  const is8Rows = soHangNgang === 8;
  const scoringMode = vcnv.scoringMode || 'TRADITIONAL';

  const templateRowsCount = matchQuestions?.vuot_chuong_ngai_vat?.hang_ngang?.length || 0;
  const templateSoHN = matchQuestions?.vuot_chuong_ngai_vat?.so_hang_ngang;
  const isTemplate4HN = (templateSoHN === 4) || (templateRowsCount > 0 && templateRowsCount <= 4);

  // Modal for Red Cells table
  const [showRedCellsModal, setShowRedCellsModal] = useState(false);

  // Manual checkboxes for grading horizontal rows
  const [gradedPlayers, setGradedPlayers] = useState<{ [pos: number]: boolean }>({
    1: false,
    2: false,
    3: false,
    4: false,
  });

  // Points mapping for Chướng Ngại Vật correct solving
  const [obstacleWinner, setObstacleWinner] = useState<1 | 2 | 3 | 4 | ''>('');

  const getAutoObstaclePoints = (mode: string, is8: boolean, prevCount: number): number => {
    if (mode === 'IMPROVED') {
      const pts = 100 - prevCount * 10;
      return Math.max(20, Math.min(100, pts));
    }
    if (is8) {
      if (prevCount === 0 || prevCount === 1) return 80;
      if (prevCount === 2) return 70;
      if (prevCount === 3) return 60;
      if (prevCount === 4) return 50;
      if (prevCount === 5) return 40;
      if (prevCount === 6) return 30;
      return 20;
    } else {
      if (prevCount === 0) return 80;
      if (prevCount === 1) return 60;
      if (prevCount === 2) return 50;
      if (prevCount === 3) return 40;
      return 30;
    }
  };

  const [obstaclePoints, setObstaclePoints] = useState<number>(100);

  React.useEffect(() => {
    const prevCount = Object.values(vcnv.rows || {}).filter(
      (r) => (r.isAnswered || r.isOpen) && r.id !== selectedRowId
    ).length;
    const autoPts = getAutoObstaclePoints(scoringMode, is8Rows, prevCount);
    setObstaclePoints(autoPts);
  }, [scoringMode, is8Rows, selectedRowId, vcnv.rows]);

  const handleSelectRow = (rowId: number) => {
    adminCommand(SocketEvent.VCNV_SELECT_ROW, { rowId });
    setGradedPlayers({ 1: false, 2: false, 3: false, 4: false });
  };

  const handleOpenSegment = (segmentId: number) => {
    adminCommand(SocketEvent.VCNV_OPEN_SEGMENT, { segmentId });
  };

  const handleToggleShowAnswers = () => {
    adminCommand(SocketEvent.VCNV_SHOW_ANSWERS);
  };

  const handleStartTimer = () => {
    adminCommand(SocketEvent.START_TIMER, { seconds: 15 });
  };

  const handleStart15sLast = () => {
    adminCommand(SocketEvent.VCNV_START_15S);
  };

  const handleGradeRow = () => {
    const correctPositions = Object.keys(gradedPlayers)
      .map(Number)
      .filter((pos) => gradedPlayers[pos]);
    
    adminCommand(SocketEvent.GRADE_ANSWER, { isCorrect: true, correctPositions });
  };

  const handleAwardObstacle = () => {
    if (!obstacleWinner) return;
    adminCommand(SocketEvent.VCNV_AWARD_OBSTACLE, {
      position: Number(obstacleWinner),
      points: Number(obstaclePoints),
    });
    setObstacleWinner('');
  };

  const handleFoulObstacle = () => {
    adminCommand(SocketEvent.VCNV_FOUL_OBSTACLE);
  };

  const rowIds = Array.from({ length: is8Rows ? 8 : 5 }, (_, i) => i + 1);

  return (
    <div className="space-y-3">
      {/* HEADER SECTION */}
      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-bold text-teal-300">Vượt Chướng Ngại Vật (VCNV 2.0)</h2>
            <HelpTip content="Admin quản lý chọn hàng ngang, mở hình ảnh chướng ngại vật, lật đáp án hàng ngang và chốt thí sinh trả lời Chướng ngại vật chính." />
            
            {/* Format row count switcher */}
            <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400">Format:</span>
              <button
                onClick={() => adminCommand(SocketEvent.VCNV_SET_SO_HANG_NGANG, { soHN: 4 })}
                className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition border ${
                  soHangNgang === 4
                    ? 'bg-teal-500 text-slate-950 border-teal-400'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800 cursor-pointer'
                }`}
              >
                4 HN
              </button>
              <button
                onClick={() => adminCommand(SocketEvent.VCNV_SET_SO_HANG_NGANG, { soHN: 8 })}
                disabled={isTemplate4HN}
                title={isTemplate4HN ? 'Đề thi nạp là loại 4 Hàng Ngang, không thể chuyển sang 8 Hàng Ngang' : 'Chuyển sang 8 Hàng Ngang'}
                className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition border ${
                  isTemplate4HN
                    ? 'bg-slate-900/50 text-slate-600 border-slate-800 cursor-not-allowed'
                    : soHangNgang === 8
                    ? 'bg-teal-500 text-slate-950 border-teal-400'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800 cursor-pointer'
                }`}
              >
                8 HN
              </button>
            </div>
            {isTemplate4HN && (
              <span className="text-[10px] text-amber-400/90 font-medium">* Khóa 8 HN do đề thi quy định 4 HN</span>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {is8Rows && (
            <button
              onClick={() => setShowRedCellsModal(true)}
              className="px-2.5 py-1 font-bold text-xs rounded-lg bg-red-600 hover:bg-red-500 text-white border border-red-400 transition-all flex items-center gap-1 cursor-pointer shadow"
            >
              <Grid className="w-3.5 h-3.5" />
              Bảng hàng ngang 🟥
            </button>
          )}

          <button
            onClick={handleStart15sLast}
            disabled={vcnv.isLast15sRunning}
            className="px-2.5 py-1 font-extrabold text-xs rounded-lg bg-purple-600 hover:bg-purple-500 text-white border border-purple-400 transition-all flex items-center gap-1 cursor-pointer shadow disabled:opacity-50"
          >
            ⏱️ 15s Cuối Cùng
          </button>

          <button
            onClick={() => adminCommand(SocketEvent.VCNV_SHOW_ROWS)}
            className={`px-2.5 py-1 font-extrabold text-xs rounded-lg border transition-all flex items-center gap-1 cursor-pointer shadow ${
              vcnv.showRows
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400 animate-pulse'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            {vcnv.showRows ? 'Đang hiện hàng ngang ✓' : 'Hiện hàng ngang'}
          </button>

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
        {/* LEFT COLUMN: MAIN VCNV CONTROLS */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-2.5">

      {is8Rows && (
        <div className="p-2 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-400 text-[11px]">Chế độ tính điểm:</span>
            <HelpTip content="Truyền thống: 80đ -> 20đ. Cải tiến: Khởi điểm 100đ, trừ 10đ cho mỗi hàng ngang đã mở." />
            <div className="flex gap-1">
              <button
                onClick={() => {
                  adminCommand(SocketEvent.VCNV_SET_SCORING_MODE, { mode: 'TRADITIONAL' });
                  setObstaclePoints(80);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                  scoringMode === 'TRADITIONAL' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                Truyền Thống
              </button>
              <button
                onClick={() => {
                  adminCommand(SocketEvent.VCNV_SET_SCORING_MODE, { mode: 'IMPROVED' });
                  setObstaclePoints(100);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                  scoringMode === 'IMPROVED' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                Cải Tiến (100đ)
              </button>
            </div>
          </div>
          {vcnv.isLast15sStarted && (
            <span className="text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30 text-[10px]">
              ⚡ Đã kích hoạt 15s cuối
            </span>
          )}
        </div>
      )}

      {!vcnv.showRows && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center justify-between gap-3">
          <span>
            ℹ️ Màn hình các giao diện đang hiển thị <strong>Hình nền phần thi</strong> (chỉ gồm tên Vượt Chướng Ngại Vật).
          </span>
          <button
            onClick={() => adminCommand(SocketEvent.VCNV_SHOW_ROWS)}
            className="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs shrink-0 cursor-pointer hover:bg-amber-400"
          >
            Hiện hàng ngang ngay
          </button>
        </div>
      )}

      {/* CORE GRID: ROWS CONTROL AND REVEAL SYSTEM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ROW SELECTION BOARD (LEFT SIDE) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Danh Sách {rowIds.length} Hàng Ngang (Lưới 4x2):</h3>
            <span className="text-[10px] text-slate-500 italic">Click vào ô để hiện câu hỏi & lật mảnh ghép</span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {rowIds.map((id) => {
              const row = vcnv.rows[id] || { id, isOpen: false, isAnswered: false };
              const isSelected = selectedRowId === id;
              const isSegmentOpened = vcnv.revealedSegments.includes(id);
              const label = !is8Rows && id === 5 ? 'Ô TRUNG TÂM' : `HÀNG NGANG ${id}`;

              return (
                <button
                  key={id}
                  onClick={() => {
                    handleSelectRow(id);
                  }}
                  className={`p-3 rounded-xl border flex flex-col justify-between items-start text-left transition-all cursor-pointer min-h-[78px] ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/50'
                      : row.isAnswered
                      ? 'bg-slate-950 border-slate-900/60 opacity-60'
                      : isSegmentOpened
                      ? 'bg-slate-900 border-indigo-500/40 text-slate-200'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${
                      isSegmentOpened || row.isOpen ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {id}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      isSelected 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : row.isAnswered 
                        ? 'bg-slate-900 text-slate-500'
                        : isSegmentOpened 
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'bg-slate-900 text-slate-500'
                    }`}>
                      {isSelected ? 'Đang chọn' : row.isAnswered ? 'Đã lật ĐA' : isSegmentOpened ? 'Mảnh mở' : 'Khóa'}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white mt-1">{label}</h4>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* IMAGE SEGMENTS BOARD (RIGHT SIDE) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-teal-400" />
              Bản Đồ Mảnh Ghép VCNV ({is8Rows ? '8 Mảnh' : '5 Mảnh'}):
            </h3>
            
            {is8Rows ? (
              <div className="grid grid-cols-4 gap-2 bg-slate-950 rounded-xl p-2.5 border border-slate-800 max-w-[260px] mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((segId) => {
                  const isRevealed = vcnv.revealedSegments.includes(segId);
                  const isSelected = selectedRowId === segId;
                  return (
                    <button
                      key={segId}
                      onClick={() => handleOpenSegment(segId)}
                      className={`h-11 rounded-lg border font-mono font-black text-base flex items-center justify-center transition-all cursor-pointer ${
                        isRevealed
                          ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-sm'
                          : isSelected
                          ? 'bg-amber-400 border-amber-300 text-slate-950 font-black shadow-md ring-2 ring-amber-400/60 animate-pulse'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-500 hover:text-slate-300'
                      }`}
                      title={isRevealed ? `Mảnh ${segId}: Đã lật` : isSelected ? `Mảnh ${segId}: Tô vàng (Đang chọn HN) - Click để lật` : `Mảnh ${segId}: Click để lật`}
                    >
                      {segId}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 bg-slate-950 rounded-xl p-2.5 border border-slate-800 relative max-w-[260px] mx-auto min-h-[120px]">
                {[1, 2, 3, 4].map((segId) => {
                  const isRevealed = vcnv.revealedSegments.includes(segId);
                  const isSelected = selectedRowId === segId;
                  return (
                    <button
                      key={segId}
                      onClick={() => handleOpenSegment(segId)}
                      className={`h-12 rounded-lg border font-mono font-black text-base flex items-center justify-center transition-all cursor-pointer ${
                        isRevealed
                          ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300'
                          : isSelected
                          ? 'bg-amber-400 border-amber-300 text-slate-950 font-black shadow-md ring-2 ring-amber-400/60 animate-pulse'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {segId}
                    </button>
                  );
                })}
                {(() => {
                  const isRevealed5 = vcnv.revealedSegments.includes(5);
                  const isSelected5 = selectedRowId === 5;
                  return (
                    <button
                      onClick={() => handleOpenSegment(5)}
                      className={`absolute w-12 h-10 rounded-lg border font-mono font-black text-base flex items-center justify-center transition-all cursor-pointer shadow-xl left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${
                        isRevealed5
                          ? 'bg-teal-500/30 border-teal-400 text-teal-300'
                          : isSelected5
                          ? 'bg-amber-400 border-amber-300 text-slate-950 font-black shadow-md ring-2 ring-amber-400/60 animate-pulse'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      5
                    </button>
                  );
                })()}
              </div>
            )}
          </div>

          <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Hình ảnh gốc:</span>
            <p className="text-xs text-slate-300 overflow-hidden text-ellipsis whitespace-nowrap">{vcnv.cnvSolved ? '🔓 ĐÃ GIẢI' : '🔒 Đang ẩn'}</p>
          </div>
        </div>
      </div>

      {/* ACTIVE ROW GRADING DRAWER */}
      {selectedRowId && currentRow && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                ĐANG CHỌN: HÀNG {selectedRowId}
              </span>
              <span className="text-xs text-slate-400 font-mono">Đồng hồ: {matchState.timerSeconds}s</span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleStartTimer}
                disabled={isTimerRunning}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-40 cursor-pointer"
              >
                Phát Lệnh 15s ⏱️
              </button>
              <button
                onClick={handleToggleShowAnswers}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                {currentRow.showAnswers ? 'Ẩn đáp án' : 'Hiện đáp án'}
              </button>
            </div>
          </div>

          {/* Question Content Display */}
          {(() => {
            const questionItem = matchQuestions?.vuot_chuong_ngai_vat?.hang_ngang?.find(
              (h: any) => h.id === selectedRowId
            );
            const media = questionItem?.media;
            const isPlaying = matchState?.mediaControl?.isPlaying;
            return (
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3 text-left">
                <div className="flex flex-col md:flex-row justify-between gap-3 items-start">
                  <div className="flex-1">
                    <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest">NỘI DUNG CÂU HỎI HÀNG NGANG:</span>
                    <p className="text-sm font-bold text-white mt-1 leading-relaxed">
                      {questionItem?.cau_hoi || '(Trống - Chưa nhập câu hỏi)'}
                    </p>
                  </div>
                  {media?.url && (
                    <div className="flex flex-col gap-1.5 p-2 bg-slate-900 border border-slate-800 rounded-lg shrink-0 w-full md:w-auto">
                      <span className="text-[9px] text-amber-400 font-extrabold uppercase tracking-wider text-center">
                        AUDIO / MEDIA CÂU HỎI:
                      </span>
                      <div className="flex justify-center gap-1">
                        {isPlaying ? (
                          <button
                            onClick={() => adminCommand(SocketEvent.MEDIA_PAUSE)}
                            className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold rounded transition-colors cursor-pointer"
                          >
                            Tạm dừng ⏸️
                          </button>
                        ) : (
                          <button
                            onClick={() => adminCommand(SocketEvent.MEDIA_PLAY)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded transition-colors cursor-pointer"
                          >
                            Phát âm thanh ▶️
                          </button>
                        )}
                        <button
                          onClick={() => adminCommand(SocketEvent.MEDIA_REPLAY)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded transition-colors cursor-pointer"
                        >
                          Phát lại 🔄
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-6 pt-2 border-t border-slate-900/60 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-500 font-extrabold block">ĐÁP ÁN ĐÚNG:</span>
                    <strong className="text-emerald-400 font-mono">{questionItem?.dap_an || 'Chưa thiết lập'}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-extrabold block">SỐ KÝ TỰ:</span>
                    <strong className="text-slate-300 font-mono">{questionItem?.so_ky_tu || '0'} ký tự</strong>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Player Answers List & Grader Form */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-400">Chấm điểm thí sinh:</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {([1, 2, 3, 4] as const).map((pos) => {
                const player = matchState.players[pos];
                const submittedAns = currentRow.playerAnswers[pos] || '';
                const isSelected = gradedPlayers[pos];

                return (
                  <div
                    key={pos}
                    onClick={() => setGradedPlayers(prev => ({ ...prev, [pos]: !prev[pos] }))}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between min-h-[90px] ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Thí sinh {pos}</span>
                      <strong className="text-xs text-white block mt-0.5">{player?.name || `Bàn số ${pos}`}</strong>
                    </div>
                    
                    <div className="mt-2 pt-2 border-t border-slate-800/40 text-left">
                      <span className="text-[10px] text-slate-500">Đáp án nhập:</span>
                      <p className="text-xs text-amber-300 font-mono tracking-wider font-bold truncate">
                        {submittedAns ? `"${submittedAns}"` : 'CHƯA NHẬP'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleGradeRow}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold rounded-lg transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                Áp Dụng Chấm Điểm Hàng Ngang (+10đ Người Đúng)
              </button>
            </div>
          </div>
        </div>
      )}

          {/* DETECTED CNV BUZZER ALERT PANEL */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
          Theo Dõi Tín Hiệu Chuông Chướng Ngại Vật:
        </h3>

        {(() => {
          const buzzedPlayers = vcnv.cnvBuzzedPlayers || (vcnv.cnvBuzzedPlayer ? [{ position: vcnv.cnvBuzzedPlayer as 1 | 2 | 3 | 4, timestamp: vcnv.cnvBuzzedTimestamp || Date.now() }] : []);
          
          if (buzzedPlayers.length > 0) {
            return (
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">Danh sách chuông đã bấm (theo thứ tự thời gian):</span>
                <div className="space-y-2">
                  {buzzedPlayers.map((bp, index) => {
                    const player = matchState.players[bp.position];
                    const isActive = index === 0; // The fastest one is graded first
                    return (
                      <div
                        key={bp.position}
                        className={`p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all ${
                          isActive
                            ? 'bg-red-500/10 border-red-500/80 shadow-md animate-pulse'
                            : 'bg-slate-950/60 border-slate-850 opacity-70'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-5 h-5 rounded font-bold text-xs flex items-center justify-center ${
                            isActive ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {index + 1}
                          </span>
                          <div>
                            <strong className="text-sm text-white">
                              {player?.name || `Bàn số ${bp.position}`} (Bàn {bp.position})
                            </strong>
                            {isActive && <span className="ml-2 text-[10px] bg-red-500/20 text-red-400 font-extrabold uppercase px-1.5 py-0.5 rounded">Đang xét duyệt</span>}
                          </div>
                        </div>

                        {isActive && (
                          <div className="flex items-center gap-2 self-end md:self-auto">
                            {/* Select Points */}
                            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg">
                              <span className="text-xs text-slate-400">Số điểm:</span>
                              <select
                                value={obstaclePoints}
                                onChange={(e) => setObstaclePoints(Number(e.target.value) as any)}
                                className="bg-transparent text-white font-bold text-xs focus:outline-none"
                              >
                                {scoringMode === 'IMPROVED' ? (
                                  <>
                                    <option value={100} className="bg-slate-950">100đ (Mở 0 hàng)</option>
                                    <option value={90} className="bg-slate-950">90đ (Mở 1 hàng)</option>
                                    <option value={80} className="bg-slate-950">80đ (Mở 2 hàng)</option>
                                    <option value={70} className="bg-slate-950">70đ (Mở 3 hàng)</option>
                                    <option value={60} className="bg-slate-950">60đ (Mở 4 hàng)</option>
                                    <option value={50} className="bg-slate-950">50đ (Mở 5 hàng)</option>
                                    <option value={40} className="bg-slate-950">40đ (Mở 6 hàng)</option>
                                    <option value={30} className="bg-slate-950">30đ (Mở 7 hàng)</option>
                                    <option value={20} className="bg-slate-950">20đ (Mở 8 hàng / Phụ)</option>
                                    <option value={10} className="bg-slate-950">10đ</option>
                                  </>
                                ) : is8Rows ? (
                                  <>
                                    <option value={80} className="bg-slate-950">80đ (Mở 0-1 hàng)</option>
                                    <option value={70} className="bg-slate-950">70đ (Mở 2 hàng)</option>
                                    <option value={60} className="bg-slate-950">60đ (Mở 3 hàng)</option>
                                    <option value={50} className="bg-slate-950">50đ (Mở 4 hàng)</option>
                                    <option value={40} className="bg-slate-950">40đ (Mở 5 hàng)</option>
                                    <option value={30} className="bg-slate-950">30đ (Mở 6 hàng)</option>
                                    <option value={20} className="bg-slate-950">20đ (Mở 7-8 hàng / Phụ)</option>
                                  </>
                                ) : (
                                  <>
                                    <option value={80} className="bg-slate-950">80đ (Mở 0 hàng)</option>
                                    <option value={60} className="bg-slate-950">60đ (Mở 1 hàng)</option>
                                    <option value={50} className="bg-slate-950">50đ (Mở 2 hàng)</option>
                                    <option value={40} className="bg-slate-950">40đ (Mở 3 hàng)</option>
                                    <option value={30} className="bg-slate-950">30đ (Mở 4 hàng)</option>
                                    <option value={20} className="bg-slate-950">20đ (Phụ)</option>
                                  </>
                                )}
                              </select>
                            </div>

                            <button
                              onClick={() => {
                                adminCommand(SocketEvent.VCNV_AWARD_OBSTACLE, {
                                  position: bp.position,
                                  points: obstaclePoints,
                                });
                              }}
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold rounded-lg transition-all cursor-pointer"
                            >
                              ĐÚNG (Cộng Điểm)
                            </button>

                            <button
                              onClick={handleFoulObstacle}
                              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold rounded-lg transition-all cursor-pointer"
                            >
                              SAI (Loại Bỏ)
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          } else {
            return (
              <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl text-center text-xs text-slate-500">
                Không có tín hiệu bấm chuông CNV nào hiện tại. Chuông CNV luôn trực tuyến.
              </div>
            );
          }
        })()}
      </div>
      </div>

      {/* RIGHT COLUMN: VCNV SOUND EFFECTS CONTROL PANEL */}
      <div className="lg:col-span-4 xl:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-2.5 space-y-2 shadow-md sticky top-[80px]">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            Âm Thanh VCNV
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
            { id: 'Obstacle_Start', label: '1. Bắt đầu vòng' },
            { id: 'Obstacle_RowShow', label: '2. Hiện hàng ngang' },
            { id: 'Obstacle_RowChoose', label: '3. Chọn hàng ngang' },
            { id: 'Obstacle_RowThinking', label: '4. Tính giờ 15s' },
            { id: 'Obstacle_ShowAnswer', label: '5. Hiện đáp án' },
            { id: 'Obstacle_RowRight', label: '6. Hàng ngang đúng' },
            { id: 'Obstacle_RowWrong', label: '7. Hàng ngang sai' },
            { id: 'Obstacle_PictureShow', label: '8. Lật mở hình' },
            { id: 'Obstacle_Buzz', label: '9. Chuông CNV' },
            { id: 'Obstacle_Right', label: '10. Trả lời đúng CNV' },
            { id: 'General_Space', label: '11. Dấu ba chấm' },
          ].map((sound) => (
            <button
              key={sound.id}
              type="button"
              onClick={() => adminCommand(SocketEvent.ADMIN_PLAY_SOUND, { soundId: sound.id })}
              className="p-2 bg-slate-950 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/40 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center min-h-[44px] group active:scale-[0.98]"
              title={`Phát: ${sound.label}`}
            >
              <span className="text-[11px] font-semibold text-slate-300 group-hover:text-amber-300 text-center leading-snug">
                {sound.label}
              </span>
            </button>
          ))}
        </div>
      </div>
      </div>
      {/* BẢNG HÀNG NGANG RED CELLS MODAL (CNV 2.0 FOR 8 ROWS) */}
      {showRedCellsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-red-500/80 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <Grid className="w-5 h-5 text-red-400" />
                <h3 className="text-md font-black text-white uppercase tracking-tight">
                  BẢNG HÀNG NGANG - CHỌN Ô CHỮ MÀU ĐỎ (VCNV 2.0)
                </h3>
              </div>
              <button
                onClick={() => setShowRedCellsModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto flex-1">
              <p className="text-xs text-slate-300 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                📌 Nhấp vào từng ô chữ để chuyển sang <strong>màu đỏ 🟥</strong>. Các ô màu đỏ chỉ xuất hiện khi lật đáp án hàng ngang tương ứng trên giao diện Viewer/Thí sinh/Overlay/MC.
              </p>

              <div className="space-y-4">
                {rowIds.map((rowId) => {
                  const questionItem = matchQuestions?.vuot_chuong_ngai_vat?.hang_ngang?.find(
                    (h: any) => h.id === rowId
                  );
                  const dapAn = (questionItem?.dap_an || '').toUpperCase().replace(/\s+/g, '');
                  const charList = dapAn.length > 0 ? dapAn.split('') : Array.from({ length: questionItem?.so_ky_tu || 5 }, (_, idx) => `?`);
                  const redList = vcnv.redCells?.[rowId] || [];

                  return (
                    <div key={rowId} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400 uppercase">
                          Hàng ngang số {rowId}:
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {dapAn ? `Đáp án: ${dapAn}` : `(Chưa nhập đáp án - ${charList.length} ô)`}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {charList.map((char: string, charIdx: number) => {
                          const isRed = redList.includes(charIdx);
                          return (
                            <button
                              key={charIdx}
                              onClick={() => adminCommand(SocketEvent.VCNV_TOGGLE_RED_CELL, { rowId, charIndex: charIdx })}
                              className={`w-9 h-10 rounded-lg text-sm font-black font-mono flex items-center justify-center border transition-all cursor-pointer select-none ${
                                isRed
                                  ? 'bg-red-600 border-red-400 text-white shadow-[0_0_12px_rgba(239,68,68,0.8)] scale-105'
                                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-850'
                              }`}
                            >
                              {char}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setShowRedCellsModal(false)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
              >
                Hoàn Tất / Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
