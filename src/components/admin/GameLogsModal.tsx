import React, { useState, useMemo } from 'react';
import { MatchState, GameLogEntry, GameRound, SocketEvent } from '../../types.js';
import { X, Download, Trash2, Search, Filter, FileText, CheckCircle2, Clock, User, ShieldAlert, ArrowUpDown, ChevronDown } from 'lucide-react';

interface GameLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchState: MatchState;
  adminCommand: (event: string, data?: any) => void;
}

const ROUND_LABELS: Record<string, string> = {
  WAITING: 'Phòng Đợi',
  KHOI_DONG: 'Khởi Động',
  VCNV: 'VCNV',
  TANG_TOC: 'Tăng Tốc',
  VE_DICH: 'Về Đích',
  CH_PHU: 'Câu Hỏi Phụ',
  JEOPARDY: 'Jeopardy!',
  MA_TRAN_KEP: 'Ma Trận Kép',
  CHINH_PHUC: 'Chinh Phục',
  DAU_TRI: 'Đấu Trí',
  SUMMARY: 'Tổng Kết',
};

export default function GameLogsModal({ isOpen, onClose, matchState, adminCommand }: GameLogsModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRound, setSelectedRound] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('ALL');
  const [confirmClear, setConfirmClear] = useState(false);
  const [sortDesc, setSortDesc] = useState(true);

  const logs: GameLogEntry[] = matchState?.logs || [];

  // Filter logs
  const filteredLogs = useMemo(() => {
    if (!isOpen) return [];
    return logs
      .filter((entry) => {
        if (selectedRound !== 'ALL' && entry.round !== selectedRound) return false;
        if (selectedType !== 'ALL' && entry.type !== selectedType) return false;
        if (selectedPlayer !== 'ALL') {
          if (entry.player === undefined || entry.player.toString() !== selectedPlayer) return false;
        }
        if (searchTerm.trim()) {
          const s = searchTerm.toLowerCase();
          const matchAction = entry.action?.toLowerCase().includes(s);
          const matchDetail = entry.detail?.toLowerCase().includes(s);
          const matchPlayer = entry.playerName?.toLowerCase().includes(s);
          const matchRound = entry.round?.toLowerCase().includes(s);
          if (!matchAction && !matchDetail && !matchPlayer && !matchRound) return false;
        }
        return true;
      })
      .sort((a, b) => (sortDesc ? b.timestamp - a.timestamp : a.timestamp - b.timestamp));
  }, [isOpen, logs, selectedRound, selectedType, selectedPlayer, searchTerm, sortDesc]);

  if (!isOpen) return null;

  // Export to TXT formatted log
  const handleDownloadTxt = () => {
    const timestampStr = new Date().toLocaleString('vi-VN');
    const matchCode = matchState?.matchCode || 'UNKNOWN';
    const tournament = matchState?.tournamentName || 'Đường Lên Đỉnh Olympia';

    let content = `========================================================================\n`;
    content += `         NHẬT KÝ THI ĐẤU CHI TIẾT (MATCH LOGS)                          \n`;
    content += `========================================================================\n`;
    content += `Giải đấu:       ${tournament}\n`;
    content += `Mã trận đấu:    ${matchCode}\n`;
    content += `Thời gian xuất: ${timestampStr}\n`;
    content += `Tổng số sự kiện: ${logs.length}\n`;
    content += `------------------------------------------------------------------------\n`;
    content += `ĐIỂM SỐ HIỆN TẠI CỦA CÁC THÍ SINH:\n`;
    ([1, 2, 3, 4] as const).forEach((pos) => {
      const p = matchState?.players[pos];
      content += `  - Bàn ${pos}: ${p?.name || `Thí sinh ${pos}`} ---> ${p?.score ?? 0} điểm\n`;
    });
    content += `========================================================================\n`;
    content += `CHI TIẾT DIỄN BIẾN SỰ KIỆN (THEO THỜI GIAN):\n`;
    content += `------------------------------------------------------------------------\n`;

    // Sort ascending for chronological review
    const chronLogs = [...logs].sort((a, b) => a.timestamp - b.timestamp);
    chronLogs.forEach((entry, idx) => {
      const time = new Date(entry.timestamp).toLocaleTimeString('vi-VN', { hour12: false });
      const roundName = ROUND_LABELS[entry.round] || entry.round;
      const playerStr = entry.player ? `Bàn ${entry.player} (${entry.playerName || ''})` : 'Hệ Thống';
      const scoreChangeStr = entry.scoreDelta !== undefined && entry.scoreDelta !== null
        ? ` [Điểm: ${entry.scoreDelta > 0 ? '+' : ''}${entry.scoreDelta} => ${entry.scoreAfter ?? ''}đ]`
        : '';

      content += `[#${(idx + 1).toString().padStart(3, '0')}] [${time}] [${roundName}] [${playerStr}] [${entry.type}]\n`;
      content += `    Hành động: ${entry.action}${scoreChangeStr}\n`;
      if (entry.detail) {
        content += `    Chi tiết:  ${entry.detail}\n`;
      }
      content += `\n`;
    });

    content += `======================= HẾT NHẬT KÝ TRẬN ĐẤU =======================\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Nhat_Ky_Tran_Dau_${matchCode}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export to CSV
  const handleDownloadCsv = () => {
    const matchCode = matchState?.matchCode || 'UNKNOWN';
    const chronLogs = [...logs].sort((a, b) => a.timestamp - b.timestamp);

    let csv = '\uFEFF'; // UTF-8 BOM for Excel
    csv += 'STT,Thời Gian,Vòng Thi,Vị Trí,Tên Thí Sinh,Phân Loại,Hành Động,Chi Tiết,Thay Đổi Điểm,Điểm Sau Cùng\n';

    chronLogs.forEach((entry, idx) => {
      const time = new Date(entry.timestamp).toLocaleTimeString('vi-VN', { hour12: false });
      const roundName = ROUND_LABELS[entry.round] || entry.round;
      const pos = entry.player ?? '';
      const pName = `"${(entry.playerName || '').replace(/"/g, '""')}"`;
      const type = entry.type;
      const action = `"${(entry.action || '').replace(/"/g, '""')}"`;
      const detail = `"${(entry.detail || '').replace(/"/g, '""')}"`;
      const delta = entry.scoreDelta ?? '';
      const after = entry.scoreAfter ?? '';

      csv += `${idx + 1},${time},"${roundName}",${pos},${pName},${type},${action},${detail},${delta},${after}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Nhat_Ky_Tran_Dau_${matchCode}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export to JSON
  const handleDownloadJson = () => {
    const matchCode = matchState?.matchCode || 'UNKNOWN';
    const data = {
      tournamentName: matchState?.tournamentName,
      matchCode,
      exportedAt: new Date().toISOString(),
      currentScores: matchState?.players,
      totalEvents: logs.length,
      logs,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Nhat_Ky_Tran_Dau_${matchCode}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearLogs = () => {
    adminCommand(SocketEvent.ADMIN_CLEAR_LOGS);
    setConfirmClear(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-500/10 border border-teal-500/20 rounded-2xl text-teal-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                  NHẬT KÝ TRẬN ĐẤU & GHI NHẬN TÍN HIỆU
                </h2>
                <span className="px-2 py-0.5 bg-teal-500/15 border border-teal-500/30 text-teal-300 font-mono text-xs font-bold rounded-full">
                  {logs.length} sự kiện
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ghi nhận chi tiết điểm số, tiếng chuông bấm, câu trả lời và đúng/sai của thí sinh mọi vòng thi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
              title="Đóng modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TOOLBAR & FILTERS */}
        <div className="p-3 sm:p-4 bg-slate-950/40 border-b border-slate-850 space-y-2.5 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            
            {/* Search input */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo nội dung, câu trả lời, thí sinh..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Filter selectors */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {/* Round filter */}
              <select
                value={selectedRound}
                onChange={(e) => setSelectedRound(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300 focus:outline-none font-medium cursor-pointer"
              >
                <option value="ALL">Mọi vòng thi</option>
                {Object.entries(ROUND_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>

              {/* Type filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300 focus:outline-none font-medium cursor-pointer"
              >
                <option value="ALL">Mọi phân loại</option>
                <option value="SCORE">Điểm số (SCORE)</option>
                <option value="BUZZER">Chuông / Tín hiệu (BUZZER)</option>
                <option value="ANSWER">Câu trả lời (ANSWER)</option>
                <option value="ROUND">Chuyển vòng (ROUND)</option>
                <option value="SYSTEM">Hệ thống (SYSTEM)</option>
              </select>

              {/* Player filter */}
              <select
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300 focus:outline-none font-medium cursor-pointer"
              >
                <option value="ALL">Mọi thí sinh</option>
                {([1, 2, 3, 4] as const).map((pos) => {
                  const p = matchState?.players[pos];
                  return (
                    <option key={pos} value={pos.toString()}>
                      Bàn {pos}: {p?.name || `Thí sinh ${pos}`}
                    </option>
                  );
                })}
              </select>

              {/* Sort direction */}
              <button
                type="button"
                onClick={() => setSortDesc(!sortDesc)}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 flex items-center gap-1 cursor-pointer"
                title="Đổi thứ tự hiển thị"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-teal-400" />
                <span>{sortDesc ? 'Mới nhất trước' : 'Cũ nhất trước'}</span>
              </button>
            </div>

          </div>

          {/* Action buttons bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-850 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <span>Hiển thị: <strong className="text-teal-300 font-mono">{filteredLogs.length}</strong> / {logs.length} sự kiện</span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Download buttons */}
              <button
                type="button"
                onClick={handleDownloadTxt}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1 cursor-pointer"
                title="Tải về file nhật ký dạng văn bản TXT"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải TXT</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadCsv}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-teal-600/20 flex items-center gap-1 cursor-pointer"
                title="Tải về bảng tính Excel / CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải CSV (Excel)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadJson}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                title="Tải về file JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>

              {/* Clear logs */}
              {confirmClear ? (
                <div className="flex items-center gap-1 bg-rose-950/60 border border-rose-500/40 p-1 rounded-xl">
                  <span className="text-[11px] text-rose-300 font-bold px-1">Chắc chắn xóa?</span>
                  <button
                    type="button"
                    onClick={handleClearLogs}
                    className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg cursor-pointer"
                  >
                    Xóa ngay
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  disabled={logs.length === 0}
                  className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40"
                  title="Xóa toàn bộ nhật ký"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa Logs</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* LOGS TABLE / FEED */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 font-sans bg-slate-950/30 min-h-[300px]">
          {filteredLogs.length === 0 ? (
            <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center p-8 text-slate-500">
              <FileText className="w-12 h-12 stroke-[1.5] mb-2 opacity-40 text-teal-400" />
              <p className="text-sm font-bold text-slate-400">Không tìm thấy bản ghi nhật ký nào</p>
              <p className="text-xs text-slate-600 mt-1 max-w-sm">
                Khi trận đấu diễn ra, mọi điểm số, chuông bấm và câu trả lời sẽ được tự động ghi lại tại đây.
              </p>
            </div>
          ) : (
            filteredLogs.map((entry, idx) => {
              const time = new Date(entry.timestamp).toLocaleTimeString('vi-VN', { hour12: false });
              const roundLabel = ROUND_LABELS[entry.round] || entry.round;

              // Type badge styles
              let typeBadgeClass = 'bg-slate-800 text-slate-400 border-slate-700';
              if (entry.type === 'SCORE') {
                typeBadgeClass = entry.scoreDelta && entry.scoreDelta > 0
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border-rose-500/30';
              } else if (entry.type === 'BUZZER') {
                typeBadgeClass = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
              } else if (entry.type === 'ANSWER') {
                typeBadgeClass = 'bg-blue-500/15 text-blue-400 border-blue-500/30';
              } else if (entry.type === 'ROUND') {
                typeBadgeClass = 'bg-purple-500/15 text-purple-400 border-purple-500/30';
              }

              return (
                <div
                  key={entry.id || idx}
                  className="bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-3 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-sm"
                >
                  {/* Left: Time, Round, Player, Type */}
                  <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-850 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {time}
                      </span>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {roundLabel}
                      </span>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeBadgeClass}`}>
                        {entry.type}
                      </span>

                      {entry.player && (
                        <span className="text-[11px] font-bold text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                          <span className="w-3.5 h-3.5 rounded bg-slate-800 text-[9px] flex items-center justify-center font-mono text-teal-400">
                            {entry.player}
                          </span>
                          <span className="truncate max-w-[140px]">
                            {entry.playerName || `Bàn ${entry.player}`}
                          </span>
                        </span>
                      )}
                    </div>

                    {/* Action and detail */}
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-200 leading-snug">
                        {entry.action}
                      </p>
                      {entry.detail && (
                        <p className="text-[11px] text-slate-400 leading-relaxed font-mono break-words">
                          {entry.detail}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Score Delta & Total */}
                  {entry.scoreDelta !== undefined && entry.scoreDelta !== null && (
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0 bg-slate-950/60 sm:bg-transparent px-3 py-1.5 sm:p-0 rounded-lg border sm:border-0 border-slate-850">
                      <span className={`text-base font-black font-mono ${
                        entry.scoreDelta > 0 ? 'text-emerald-400' : entry.scoreDelta < 0 ? 'text-rose-400' : 'text-slate-400'
                      }`}>
                        {entry.scoreDelta > 0 ? `+${entry.scoreDelta}` : entry.scoreDelta}
                      </span>
                      {entry.scoreAfter !== undefined && (
                        <span className="text-[11px] font-mono text-slate-400">
                          Điểm mới: <strong className="text-white font-bold">{entry.scoreAfter}</strong>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Nhật ký được cập nhật tự động thời gian thực từ máy chủ</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
