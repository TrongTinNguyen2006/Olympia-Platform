import React, { useState, useEffect } from 'react';
import { MatchState, RoundCustomSetting, SocketEvent } from '../../types.js';
import {
  Settings2,
  Check,
  RotateCcw,
  Save,
  X,
  Ban,
  Sparkles,
  Link,
  ChevronDown,
  ChevronUp,
  Wand2,
} from 'lucide-react';
import {
  PRESET_ROUND_LOGOS,
  PresetRoundLogo,
  RoundLogoRenderer,
  getDefaultLogoForRound,
  getPresetLogo,
} from '../common/RoundLogoAssets.js';

interface RoundCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchState: MatchState;
  adminCommand: (event: string, data?: any) => void;
}

interface RoundConfigItem {
  id: string;
  defaultName: string;
  defaultBadge: string;
  color: string;
}

const DEFAULT_ROUNDS: RoundConfigItem[] = [
  { id: 'KHOI_DONG', defaultName: 'Khởi Động', defaultBadge: 'Vòng 1', color: 'text-emerald-400 border-emerald-500/30' },
  { id: 'VCNV', defaultName: 'Vượt Chướng Ngại Vật', defaultBadge: 'Vòng 2', color: 'text-amber-400 border-amber-500/30' },
  { id: 'TANG_TOC', defaultName: 'Tăng Tốc', defaultBadge: 'Vòng 3', color: 'text-violet-400 border-violet-500/30' },
  { id: 'VE_DICH', defaultName: 'Về Đích', defaultBadge: 'Vòng 4', color: 'text-red-400 border-red-500/30' },
  { id: 'CH_PHU', defaultName: 'Câu Hỏi Phụ', defaultBadge: 'Phụ', color: 'text-cyan-400 border-cyan-500/30' },
  { id: 'JEOPARDY', defaultName: 'Jeopardy!', defaultBadge: 'Đặc Biệt', color: 'text-yellow-400 border-yellow-500/30' },
  { id: 'MA_TRAN_KEP', defaultName: 'Ma Trận Kép', defaultBadge: 'Đặc Biệt', color: 'text-indigo-400 border-indigo-500/30' },
  { id: 'CHINH_PHUC', defaultName: 'Chinh Phục', defaultBadge: 'Đặc Biệt', color: 'text-teal-400 border-teal-500/30' },
  { id: 'DAU_TRI', defaultName: 'Đấu Trí', defaultBadge: 'Đặc Biệt', color: 'text-rose-400 border-rose-500/30' },
];

export default function RoundCustomizerModal({
  isOpen,
  onClose,
  matchState,
  adminCommand,
}: RoundCustomizerModalProps) {
  const [formData, setFormData] = useState<Record<string, { customLogoUrl: string }>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('KHOI_DONG');
  const [logoCategoryFilter, setLogoCategoryFilter] = useState<'ALL' | 'RECOMMENDED' | 'VÒNG THI' | 'BIỂU TRƯNG' | 'DANH HIỆU'>('ALL');
  const [showAdvancedUrl, setShowAdvancedUrl] = useState(false);

  // Sync state from server on load / change / open
  useEffect(() => {
    if (!isOpen) return;

    const settings = matchState?.roundCustomSettings || {};
    const initial: Record<string, { customLogoUrl: string }> = {};

    DEFAULT_ROUNDS.forEach((r) => {
      const current = settings[r.id];
      // If user hasn't customized logo, default is preset for this round
      const existingLogo = current?.customLogoUrl || current?.logoUrl;
      initial[r.id] = {
        customLogoUrl: existingLogo !== undefined ? existingLogo : getDefaultLogoForRound(r.id),
      };
    });

    setFormData(initial);
  }, [matchState?.roundCustomSettings, isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectLogo = (roundId: string, logoId: string) => {
    setFormData((prev) => ({
      ...prev,
      [roundId]: {
        customLogoUrl: logoId,
      },
    }));
  };

  const handleResetRound = (roundId: string) => {
    setFormData((prev) => ({
      ...prev,
      [roundId]: {
        customLogoUrl: getDefaultLogoForRound(roundId),
      },
    }));
  };

  const handleAutoAssignAllDefaults = () => {
    setFormData((prev) => {
      const updated = { ...prev };
      DEFAULT_ROUNDS.forEach((r) => {
        updated[r.id] = {
          customLogoUrl: getDefaultLogoForRound(r.id),
        };
      });
      return updated;
    });
  };

  const handleSaveAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const payload: Record<string, RoundCustomSetting> = {};
    Object.entries(formData).forEach(([roundId, val]) => {
      const item = val as { customLogoUrl?: string };
      const logo = item.customLogoUrl?.trim() || undefined;
      payload[roundId] = {
        logoUrl: logo,
        customLogoUrl: logo,
      };
    });

    adminCommand(SocketEvent.ADMIN_UPDATE_ROUND_SETTINGS, { settings: payload });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const activeRoundConfig = DEFAULT_ROUNDS.find((r) => r.id === activeTab) || DEFAULT_ROUNDS[0];
  const activeRoundData = formData[activeTab] || {
    customLogoUrl: getDefaultLogoForRound(activeTab),
  };

  const currentSelectedLogo = activeRoundData.customLogoUrl || 'none';
  const isNoLogoSelected = currentSelectedLogo === 'none' || currentSelectedLogo === '';

  // Filter logos
  const filteredLogos = PRESET_ROUND_LOGOS.filter((logo) => {
    if (logoCategoryFilter === 'RECOMMENDED') {
      return logo.recommendedFor?.includes(activeTab);
    }
    if (logoCategoryFilter === 'VÒNG THI') {
      return logo.category === 'Vòng thi';
    }
    if (logoCategoryFilter === 'BIỂU TRƯNG') {
      return logo.category === 'Biểu trưng';
    }
    if (logoCategoryFilter === 'DANH HIỆU') {
      return logo.category === 'Danh hiệu';
    }
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-750 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* MODAL HEADER */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-500/15 border border-violet-500/30 rounded-xl text-violet-400">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                TÙY CHỈNH LOGO VÒNG THI
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Logo Thiết Kế Sẵn
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Chỉ cần chọn logo yêu thích từ bộ sưu tập của web, hoặc chọn không hiển thị logo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse">
                <Check className="w-3.5 h-3.5" /> Đã lưu thành công!
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* ROUND SELECTOR PILLS */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                1. Chọn Vòng Thi Cần Thiết Lập:
              </label>
              <button
                type="button"
                onClick={handleAutoAssignAllDefaults}
                className="text-[11px] text-violet-400 hover:text-violet-300 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                title="Gán tự động logo thiết kế chuẩn cho tất cả 9 vòng"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Gán logo chuẩn cho cả 9 vòng</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
              {DEFAULT_ROUNDS.map((round) => {
                const isSelected = activeTab === round.id;
                const current = formData[round.id];
                const roundLogo = current?.customLogoUrl || getDefaultLogoForRound(round.id);
                const hasNoLogo = roundLogo === 'none';

                return (
                  <button
                    key={round.id}
                    type="button"
                    onClick={() => setActiveTab(round.id)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-violet-600/20 border-violet-500 text-violet-200 shadow-sm ring-1 ring-violet-500/50'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {!hasNoLogo && (
                      <div className="w-4 h-4 shrink-0">
                        <RoundLogoRenderer logoIdOrUrl={roundLogo} className="w-4 h-4" />
                      </div>
                    )}
                    {hasNoLogo && <Ban className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                    <span>{round.defaultName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTIVE ROUND SETTINGS CARD */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-4">
            {/* Round info & reset action */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border bg-slate-900 ${activeRoundConfig.color}`}>
                  {activeRoundConfig.defaultBadge}
                </span>
                <h4 className="text-xs font-black text-white">
                  Đang chọn logo cho: <span className="text-violet-300">{activeRoundConfig.defaultName}</span>
                </h4>
              </div>

              <button
                type="button"
                onClick={() => handleResetRound(activeTab)}
                className="text-xs text-slate-400 hover:text-rose-300 flex items-center gap-1 transition-colors cursor-pointer"
                title="Khôi phục logo mặc định cho vòng này"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Khôi phục mặc định</span>
              </button>
            </div>

            {/* LOGO SELECTION SECTION */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Chọn Logo Cho Vòng (Nhấp để chọn):
                </label>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1 text-[10px]">
                  {(['ALL', 'RECOMMENDED', 'VÒNG THI', 'BIỂU TRƯNG', 'DANH HIỆU'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setLogoCategoryFilter(cat)}
                      className={`px-2 py-0.5 rounded-lg border font-semibold transition-colors cursor-pointer ${
                        logoCategoryFilter === cat
                          ? 'bg-violet-600/30 border-violet-500 text-violet-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat === 'ALL'
                        ? 'Tất cả'
                        : cat === 'RECOMMENDED'
                        ? 'Gợi ý'
                        : cat.toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>

              {/* LOGO GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[260px] overflow-y-auto p-1 border border-slate-850 rounded-xl bg-slate-900/40 no-scrollbar">
                {/* OPTION 1: KHÔNG DÙNG LOGO (NONE) */}
                <button
                  type="button"
                  onClick={() => handleSelectLogo(activeTab, 'none')}
                  className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer relative group ${
                    isNoLogoSelected
                      ? 'bg-rose-950/25 border-rose-500 text-rose-200 shadow-md ring-2 ring-rose-500/40'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isNoLogoSelected && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-white">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-rose-400 transition-colors mb-2">
                    <Ban className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold leading-tight">Không Có Logo</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Ẩn biểu tượng logo</span>
                </button>

                {/* PRESET LOGOS */}
                {filteredLogos.map((preset: PresetRoundLogo) => {
                  const isSelected = currentSelectedLogo === preset.id;
                  const isRecommended = preset.recommendedFor?.includes(activeTab);

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectLogo(activeTab, preset.id)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer relative group ${
                        isSelected
                          ? 'bg-violet-950/30 border-violet-500 text-violet-100 shadow-md ring-2 ring-violet-500/40'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      {/* Selection Checkmark */}
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center text-white z-10 shadow">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}

                      {/* Recommended badge */}
                      {isRecommended && !isSelected && (
                        <span className="absolute top-1.5 right-1.5 text-[9px] font-black text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1 py-0.2 rounded-md">
                          Gợi ý
                        </span>
                      )}

                      {/* SVG Logo Graphic */}
                      <div className="w-12 h-12 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-center p-1 mb-1.5 group-hover:scale-105 transition-transform">
                        {preset.svg({ className: 'w-full h-full object-contain drop-shadow-sm' })}
                      </div>

                      <span className="text-xs font-bold leading-tight line-clamp-1">
                        {preset.name}
                      </span>
                      <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {preset.category}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* LIVE PREVIEW BANNER - LOGO FOCUSED */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-inner p-1.5">
                  {isNoLogoSelected ? (
                    <Ban className="w-6 h-6 text-slate-600" />
                  ) : (
                    <RoundLogoRenderer
                      logoIdOrUrl={currentSelectedLogo}
                      className="w-11 h-11 object-contain drop-shadow"
                    />
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">
                    Xem Trước Logo Hiển Thị ({activeRoundConfig.defaultName}):
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border bg-slate-950 ${activeRoundConfig.color}`}>
                      {activeRoundConfig.defaultBadge}
                    </span>
                    <h5 className="text-sm font-black text-white">
                      {isNoLogoSelected
                        ? 'Chế độ: Ẩn logo'
                        : (getPresetLogo(currentSelectedLogo)?.name || 'Logo tùy chọn')}
                    </h5>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isNoLogoSelected
                      ? 'Biểu tượng logo sẽ không hiển thị trên màn hình phát sóng'
                      : 'Biểu tượng logo này sẽ hiển thị trực tiếp trên thanh phát sóng của trận đấu'}
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg shrink-0">
                Hiển Thị Trực Tiếp
              </span>
            </div>

            {/* COLLAPSIBLE ADVANCED OPTION: EXTERNAL IMAGE URL */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvancedUrl(!showAdvancedUrl)}
                className="text-xs text-slate-400 hover:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Link className="w-3 h-3" />
                <span>Tùy chọn nâng cao: Nhập URL ảnh logo bên ngoài</span>
                {showAdvancedUrl ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showAdvancedUrl && (
                <div className="mt-2.5 p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 animate-in fade-in duration-150">
                  <label className="text-[11px] text-slate-400 block">
                    Nhập đường dẫn URL ảnh logo nếu không muốn dùng logo của web (PNG, SVG, JPG):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={activeRoundData.customLogoUrl.startsWith('http') ? activeRoundData.customLogoUrl : ''}
                      onChange={(e) => handleSelectLogo(activeTab, e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="flex-1 bg-slate-950 border border-slate-750 focus:border-violet-500 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none font-mono text-[11px]"
                    />
                    {activeRoundData.customLogoUrl.startsWith('http') && (
                      <button
                        type="button"
                        onClick={() => handleSelectLogo(activeTab, getDefaultLogoForRound(activeTab))}
                        className="px-2.5 py-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs"
                      >
                        Hủy URL
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs rounded-xl transition-all cursor-pointer"
          >
            Đóng
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-violet-600/25 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Toàn Bộ Cài Đặt Logo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
