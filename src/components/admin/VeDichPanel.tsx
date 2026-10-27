import React, { useState, useEffect, useMemo } from 'react';
import { MatchState, SocketEvent } from '../../types.js';
import { Award, AlertTriangle, Star, Check, Play, Clock, HelpCircle, RefreshCw, LogOut, Eye, Volume2, Square, Plus, Trash2, Edit3, RotateCcw, Settings } from 'lucide-react';
import HelpTip from './HelpTip.js';
import BorderTimer from '../BorderTimer.js';

interface VeDichPanelProps {
  matchState: MatchState;
  adminCommand: (event: SocketEvent, data?: any) => void;
  matchQuestions?: any;
}

export default function VeDichPanel({ matchState, adminCommand, matchQuestions }: VeDichPanelProps) {
  const veDich = matchState.ve_dich;
  const isTimerRunning = matchState.isTimerRunning;
  const activeIndex = veDich?.currentPlayerIndex; // 0, 1, 2, 3 corresponding to pos 1, 2, 3, 4
  const activePosition = activeIndex !== null && activeIndex !== undefined ? (activeIndex + 1) as 1 | 2 | 3 | 4 : null;
  const currentTurn = activePosition ? veDich?.turns?.[activePosition] : null;

  const ruleMode = veDich?.ruleMode || 'O20_PLUS';
  const o20Count = veDich?.o20PackageQuestionCount || 3;
  const o19Packages = veDich?.o19PresetPackages || [
    { id: 'pkg1', name: 'Gói 40 điểm', pointsList: [10, 10, 20], totalPoints: 40 },
    { id: 'pkg2', name: 'Gói 60 điểm', pointsList: [10, 20, 30], totalPoints: 60 },
    { id: 'pkg3', name: 'Gói 80 điểm', pointsList: [20, 30, 30], totalPoints: 80 },
    { id: 'pkg4', name: 'Gói 100 điểm', pointsList: [30, 30, 40], totalPoints: 100 }
  ];
  const practiceTimer = veDich?.practiceTimer;

  // State for O19 Settings Modal
  const [isEditingO19Modal, setIsEditingO19Modal] = useState(false);
  const [modalPackages, setModalPackages] = useState<any[]>([]);
  const [editingSubPkgId, setEditingSubPkgId] = useState<string | null>(null);
  const [isAddingNewPkg, setIsAddingNewPkg] = useState(false);
  const [pkgName, setPkgName] = useState('');
  const [pkgPointsList, setPkgPointsList] = useState<(10 | 20 | 30 | 40)[]>([10, 20, 30]);

  const handleOpenO19SettingsModal = () => {
    setModalPackages(JSON.parse(JSON.stringify(o19Packages)));
    setEditingSubPkgId(null);
    setIsAddingNewPkg(false);
    setIsEditingO19Modal(true);
  };

  const handleStartEditSubPkg = (pkg: any) => {
    setEditingSubPkgId(pkg.id);
    setIsAddingNewPkg(false);
    setPkgName(pkg.name);
    setPkgPointsList([...pkg.pointsList]);
  };

  const handleStartAddNewPkg = () => {
    setEditingSubPkgId(null);
    setIsAddingNewPkg(true);
    setPkgName(`Gói ${modalPackages.length + 1}`);
    setPkgPointsList([20, 30, 30]);
  };

  const handleSaveSubPkgToModal = () => {
    if (pkgPointsList.length < 2 || pkgPointsList.length > 5) return;
    const totalPoints = pkgPointsList.reduce((sum, p) => sum + p, 0);

    if (isAddingNewPkg) {
      const newPkg = {
        id: `pkg_${Date.now()}`,
        name: pkgName || `Gói ${totalPoints} điểm`,
        pointsList: pkgPointsList,
        totalPoints
      };
      setModalPackages([...modalPackages, newPkg]);
    } else if (editingSubPkgId) {
      setModalPackages(modalPackages.map(p => 
        p.id === editingSubPkgId 
          ? { id: editingSubPkgId, name: pkgName || `Gói ${totalPoints} điểm`, pointsList: pkgPointsList, totalPoints } 
          : p
      ));
    }
    setEditingSubPkgId(null);
    setIsAddingNewPkg(false);
  };

  const handleDeleteSubPkgFromModal = (id: string) => {
    setModalPackages(modalPackages.filter(p => p.id !== id));
  };

  const handleResetModalToDefault = () => {
    const defaultPkgs = [
      { id: 'pkg1', name: 'Gói 40 điểm', pointsList: [10, 10, 20], totalPoints: 40 },
      { id: 'pkg2', name: 'Gói 60 điểm', pointsList: [10, 20, 30], totalPoints: 60 },
      { id: 'pkg3', name: 'Gói 80 điểm', pointsList: [20, 30, 30], totalPoints: 80 },
      { id: 'pkg4', name: 'Gói 100 điểm', pointsList: [30, 30, 40], totalPoints: 100 }
    ];
    setModalPackages(defaultPkgs);
    setEditingSubPkgId(null);
    setIsAddingNewPkg(false);
  };

  const handleSaveO19ModalFinal = () => {
    adminCommand(SocketEvent.VE_DICH_SET_PRESET_PACKAGES, { packages: modalPackages });
    setIsEditingO19Modal(false);
  };

  // Selected question ID in dropdown list
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('');

  // Active question details based on the current package question choices
  const currentQIndex = currentTurn?.currentQuestionIndex ?? 0;
  const activeQuestionChoice = currentTurn?.chosenPackage?.[currentQIndex];
  const pointsOfCurrentQ = activeQuestionChoice?.points;

  // Filter available questions of matching score (10, 20, 30, or 40 points)
  const availableQuestions = useMemo(() => {
    if (!pointsOfCurrentQ || !matchQuestions?.ve_dich?.cau_hoi) return [];
    return matchQuestions.ve_dich.cau_hoi.filter((q: any) => q.muc_diem === pointsOfCurrentQ);
  }, [pointsOfCurrentQ, matchQuestions]);

  // Sync selectedQuestionId when question changes
  useEffect(() => {
    if (activeQuestionChoice?.questionId) {
      setSelectedQuestionId(activeQuestionChoice.questionId);
    } else if (availableQuestions.length > 0) {
      setSelectedQuestionId(availableQuestions[0].id);
    } else {
      setSelectedQuestionId('');
    }
  }, [currentQIndex, activeQuestionChoice, availableQuestions]);

  const handleSelectPlayer = (pos: number) => {
    adminCommand(SocketEvent.VE_DICH_SELECT_PLAYER, { position: pos });
  };

  const handleSetRuleMode = (mode: 'O20_PLUS' | 'O19') => {
    adminCommand(SocketEvent.VE_DICH_SET_RULE_MODE, { ruleMode: mode });
  };

  const handleSetPackageCount = (count: number) => {
    adminCommand(SocketEvent.VE_DICH_SET_PACKAGE_COUNT, { count });
  };

  const handleSelectDraftPoints = (index: number, points: 10 | 20 | 30 | 40) => {
    if (!activePosition) return;
    adminCommand(SocketEvent.VE_DICH_SET_DRAFT_PACKAGE, { position: activePosition, index, points });
  };

  const handleConfirmPackage = () => {
    if (!activePosition || !currentTurn?.draftPackage) return;
    const draft = currentTurn.draftPackage;
    if (draft.every(p => p !== null)) {
      adminCommand(SocketEvent.VE_DICH_SET_PACKAGE, {
        position: activePosition,
        packages: draft as (10 | 20 | 30 | 40)[]
      });
    }
  };

  const handleSelectPresetPackage = (pointsList: (10 | 20 | 30 | 40)[]) => {
    if (!activePosition) return;
    adminCommand(SocketEvent.VE_DICH_SET_PACKAGE, {
      position: activePosition,
      packages: pointsList
    });
  };

  const handleConfirmQuestion = () => {
    if (!activePosition || !selectedQuestionId) return;
    adminCommand(SocketEvent.VE_DICH_CONFIRM_QUESTION, {
      position: activePosition,
      questionId: selectedQuestionId
    });
  };

  const handleToggleStar = () => {
    if (!activePosition) return;
    adminCommand(SocketEvent.VE_DICH_TOGGLE_STAR, { position: activePosition, isUsed: !currentTurn?.starUsed });
  };

  const handleStartTimerForQuestion = () => {
    if (!pointsOfCurrentQ) return;
    let seconds = 15;
    if (pointsOfCurrentQ === 10) seconds = 10;
    else if (pointsOfCurrentQ === 20) seconds = 15;
    else if (pointsOfCurrentQ === 30) seconds = 20;
    else if (pointsOfCurrentQ === 40) seconds = 30;

    adminCommand(SocketEvent.START_TIMER, { seconds });
  };

  const handleStartPractice = (type: 'MAIN' | 'CLAIM') => {
    adminCommand(SocketEvent.VE_DICH_START_PRACTICE, { type });
  };

  const handleStopPractice = () => {
    adminCommand(SocketEvent.VE_DICH_STOP_PRACTICE);
  };

  const handleStartTimer = (seconds: number) => {
    adminCommand(SocketEvent.START_TIMER, { seconds });
  };

  const handleStartClaim = () => {
    if (!activePosition) return;
    adminCommand(SocketEvent.VE_DICH_START_CLAIM, { activePosition });
  };

  const handleGrade = (isCorrect: boolean) => {
    adminCommand(SocketEvent.GRADE_ANSWER, { isCorrect });
  };

  const handleSelectQuestionIndex = (idx: number) => {
    if (!activePosition) return;
    adminCommand(SocketEvent.VE_DICH_SET_QUESTION_INDEX, { position: activePosition, index: idx });
  };

  // Find confirmed question item for details
  const activeQuestionItem = useMemo(() => {
    if (!activeQuestionChoice?.questionId || !matchQuestions?.ve_dich?.cau_hoi) return null;
    return matchQuestions.ve_dich.cau_hoi.find((q: any) => q.id === activeQuestionChoice.questionId);
  }, [activeQuestionChoice?.questionId, matchQuestions]);

  const draft = currentTurn?.draftPackage || [null, null, null];
  const isDraftComplete = draft[0] !== null && draft[1] !== null && draft[2] !== null;

  return (
    <div className="space-y-3" id="ve-dich-panel-root">
      {/* HEADER BAR */}
      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-2" id="ve-dich-header">
        <div className="flex items-center gap-1.5 min-w-0">
          <h2 className="text-sm font-bold text-teal-300 whitespace-nowrap">Vòng Về Đích</h2>
          <HelpTip content="Vòng Về Đích: Chọn thí sinh thi, lập gói 3 câu hỏi (20đ/30đ), bật Ngôi sao Hy vọng, đếm ngược thời gian và điều khiển bấm chuông giành quyền." />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {activePosition && (
            <button
              onClick={() => adminCommand(SocketEvent.VE_DICH_END_TURN)}
              className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-sm"
              id="btn-end-turn"
            >
              <LogOut className="w-3.5 h-3.5" />
              Kết Thúc Lượt 🚪
            </button>
          )}

          {isTimerRunning ? (
            <button
              onClick={() => adminCommand(SocketEvent.PAUSE_TIMER)}
              className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 text-xs font-bold rounded-lg transition-all whitespace-nowrap shadow-sm"
              id="btn-pause-timer"
            >
              Tạm Dừng ⏱️
            </button>
          ) : (
            <button
              onClick={() => adminCommand(SocketEvent.RESET_TIMER)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-400 text-xs font-bold rounded-lg transition-all whitespace-nowrap shadow-sm"
              id="btn-reset-timer"
            >
              Reset Hẹn Giờ ⏱️
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-start w-full min-w-0" id="ve-dich-outer-grid">
        {/* LEFT COLUMN: MAIN VỀ ĐÍCH CONTROLS */}
        <div className="xl:col-span-8 2xl:col-span-9 space-y-3 min-w-0">
          {/* THREE ZONE CONTROL: PLAYER CHOOSE, PACKAGE CONFIG, ACTIVE QUESTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 min-w-0" id="ve-dich-controls-container">
        
        {/* 1. SELECT CURRENT PLAYER */}
        <div className="col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-3 flex flex-col justify-between min-w-0" id="ve-dich-step1">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Chọn Thí Sinh Thi Chính:</h3>
            
            <div className="space-y-2">
              {([1, 2, 3, 4] as const).map((pos) => {
                const isSelected = activePosition === pos;
                const hasCompleted = veDich?.completedTurns?.includes(pos - 1);
                const name = matchState.players[pos]?.name || `Bàn số ${pos}`;

                return (
                  <button
                    key={pos}
                    onClick={() => handleSelectPlayer(pos)}
                    disabled={hasCompleted}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer min-w-0 ${
                      isSelected
                        ? 'bg-teal-500/10 border-teal-500 shadow-md shadow-teal-500/5 text-teal-300 ring-1 ring-teal-500/20'
                        : hasCompleted
                        ? 'bg-slate-950 border-slate-900 text-slate-600 line-through cursor-not-allowed opacity-40'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                    id={`btn-select-player-${pos}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-5 h-5 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-teal-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {pos}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{name}</h4>
                        <p className="text-[10px] text-slate-500">Điểm: {matchState.players[pos]?.score ?? 0}</p>
                      </div>
                    </div>

                    {hasCompleted && <span className="text-[9px] text-slate-500 font-bold uppercase shrink-0">Xong</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. PACKAGE SELECTION & PROGRESS CONTROL */}
        <div className="col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between gap-3 min-w-0" id="ve-dich-step2">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">2. Cấu Hình Gói Điểm:</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => handleSetRuleMode('O20_PLUS')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                    ruleMode === 'O20_PLUS' ? 'bg-teal-500 text-slate-950 font-black' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Luật O20+
                </button>
                <button
                  onClick={() => handleSetRuleMode('O19')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                    ruleMode === 'O19' ? 'bg-indigo-500 text-white font-black' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Luật O19
                </button>
              </div>
            </div>

            {/* Rule configuration options */}
            {ruleMode === 'O20_PLUS' ? (
              <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] sm:text-[11px] text-slate-300 font-bold">Số câu trong gói:</span>
                <div className="flex gap-1">
                  {[2, 3, 4, 5].map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => handleSetPackageCount(cnt)}
                      className={`w-6 h-6 rounded-md text-xs font-black transition-all cursor-pointer ${
                        o20Count === cnt
                          ? 'bg-teal-400 text-slate-950 font-black shadow-md scale-105'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] sm:text-[11px] text-slate-300 font-bold">Cài đặt gói O19:</span>
                <button
                  onClick={handleOpenO19SettingsModal}
                  className="px-2.5 py-1 bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-md shadow-indigo-500/20"
                >
                  <Settings className="w-3 h-3" /> Cài đặt
                </button>
              </div>
            )}

            {/* Practice timer controls */}
            <div className="p-2 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">⏱️ Thực hành:</span>
                {practiceTimer?.isRunning && (
                  <span className="text-xs font-mono font-bold text-amber-400 animate-pulse">
                    Đang chạy ({practiceTimer.secondsLeft}s)
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleStartPractice('MAIN')}
                  disabled={practiceTimer?.isRunning}
                  className="flex-1 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 font-bold text-[10px] rounded-md transition-all disabled:opacity-50 cursor-pointer text-center"
                >
                  Thi chính
                </button>
                <button
                  onClick={() => handleStartPractice('CLAIM')}
                  disabled={practiceTimer?.isRunning}
                  className="flex-1 py-1 bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 font-bold text-[10px] rounded-md transition-all disabled:opacity-50 cursor-pointer text-center"
                >
                  Giành quyền
                </button>
                {practiceTimer?.isRunning && (
                  <button
                    onClick={handleStopPractice}
                    className="px-2 py-1 bg-rose-600 text-white font-bold text-[10px] rounded-md hover:bg-rose-500 cursor-pointer"
                  >
                    Dừng 🛑
                  </button>
                )}
              </div>
            </div>
            
            {activePosition ? (
              !currentTurn?.packageConfirmed ? (
                !currentTurn?.showPackageBoard ? (
                  /* 2A. SHOW PACKAGE BOARD TRIGGER BUTTON */
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5 text-center" id="package-board-trigger">
                    <div className="w-8 h-8 bg-teal-500/10 border border-teal-500/20 rounded-full flex items-center justify-center mx-auto text-teal-400">
                      <Award className="w-4 h-4 animate-pulse" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider truncate">
                        {matchState.players[activePosition]?.name || `Thí sinh Bàn ${activePosition}`}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Nhấn nút bên dưới để mở bảng chọn gói điểm.
                      </p>
                    </div>
                    <button
                      onClick={() => adminCommand(SocketEvent.VE_DICH_SHOW_PACKAGE_BOARD, { position: activePosition, show: true })}
                      className="w-full py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg transition-all shadow-md shadow-teal-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                      id="btn-show-package-board"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      HIỂN THỊ GÓI ĐIỂM 🎯
                    </button>
                  </div>
                ) : (
                  /* 2B. PACKAGE SELECTION BY RULE MODE */
                  <div className="space-y-2.5" id="package-selector-grid">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-slate-400">
                        {ruleMode === 'O20_PLUS' ? 'Tự chọn điểm từng câu:' : 'Chọn 1 gói điểm có sẵn:'}
                      </p>
                      <button
                        onClick={() => adminCommand(SocketEvent.VE_DICH_SHOW_PACKAGE_BOARD, { position: activePosition, show: false })}
                        className="text-[10px] text-slate-500 hover:text-slate-300 underline cursor-pointer"
                      >
                        Ẩn bảng
                      </button>
                    </div>

                    {ruleMode === 'O20_PLUS' ? (
                      <div className="space-y-2.5 min-w-0">
                        {/* 1-Row Grid with Question Boxes */}
                        <div className="overflow-x-auto pb-1 -mx-0.5 px-0.5">
                          <div
                            className="grid gap-1.5 w-full min-w-[220px]"
                            style={{ gridTemplateColumns: `repeat(${o20Count}, minmax(46px, 1fr))` }}
                          >
                            {Array.from({ length: o20Count }).map((_, colIdx) => {
                              const selectedPts = currentTurn?.draftPackage?.[colIdx];
                              return (
                                <div key={colIdx} className="space-y-1 text-center min-w-0">
                                  <span className="text-[10px] font-extrabold text-slate-400 uppercase block truncate">
                                    Câu {colIdx + 1}
                                  </span>
                                  {/* Question Box displaying ? or points */}
                                  <div
                                    className={`py-1.5 sm:py-2 rounded-lg border font-mono font-black text-sm sm:text-base flex items-center justify-center transition-all ${
                                      selectedPts === null || selectedPts === undefined
                                        ? 'bg-slate-950 border-slate-800 text-slate-500'
                                        : selectedPts === 10
                                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm'
                                        : selectedPts === 20
                                        ? 'bg-teal-500/20 border-teal-400 text-teal-300 shadow-sm'
                                        : selectedPts === 30
                                        ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 shadow-sm'
                                        : 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-sm'
                                    }`}
                                  >
                                    {selectedPts === null || selectedPts === undefined ? '?' : `${selectedPts}đ`}
                                  </div>
                                  {/* Point selector buttons */}
                                  <div className="grid grid-cols-2 gap-1">
                                    {[10, 20, 30, 40].map((pts) => (
                                      <button
                                        key={pts}
                                        onClick={() => handleSelectDraftPoints(colIdx, pts as 10 | 20 | 30 | 40)}
                                        className={`py-1 px-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer border text-center ${
                                          selectedPts === pts
                                            ? 'bg-teal-500 text-slate-950 border-teal-400 font-black'
                                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                                        }`}
                                      >
                                        {pts}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <button
                          onClick={handleConfirmPackage}
                          disabled={!currentTurn?.draftPackage || currentTurn.draftPackage.some(p => p === null)}
                          className={`w-full py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                            currentTurn?.draftPackage && currentTurn.draftPackage.every(p => p !== null)
                              ? 'bg-teal-400 text-slate-950 hover:bg-teal-300 cursor-pointer font-black shadow-md'
                              : 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed'
                          }`}
                          id="btn-confirm-package"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          CHỐT GÓI ĐIỂM
                        </button>
                      </div>
                    ) : (
                      /* O19 PRESET PACKAGES LIST */
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">
                          Nhấp để chọn 1 gói điểm cho thí sinh:
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 w-full">
                          {o19Packages.map((pkg) => (
                            <div
                              key={pkg.id}
                              onClick={() => handleSelectPresetPackage(pkg.pointsList)}
                              className="p-2.5 bg-slate-950 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center group relative shadow-sm min-w-0"
                            >
                              <span className="text-base font-black font-mono text-amber-400 group-hover:scale-110 transition-transform">
                                {pkg.totalPoints}đ
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono truncate max-w-full">
                                {pkg.pointsList.join('-')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              ) : (
                // Package confirmed, show static points and clickable index buttons
                <div className="space-y-3" id="package-confirmed-info">
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Gói câu hỏi đã chọn:</span>
                    <div className={`grid gap-1.5 w-full`} style={{ gridTemplateColumns: `repeat(${currentTurn.chosenPackage.length}, minmax(0, 1fr))` }}>
                      {currentTurn.chosenPackage.map((q, idx) => {
                        const isCurrent = idx === currentQIndex;
                        const isPast = idx < currentQIndex;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectQuestionIndex(idx)}
                            className={`py-1.5 px-1 rounded-lg text-xs font-black transition-all border cursor-pointer truncate ${
                              isCurrent
                                ? 'bg-amber-400 text-slate-950 border-amber-400 font-extrabold shadow-sm'
                                : isPast
                                ? 'bg-slate-900 border-slate-850 text-slate-500'
                                : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-600'
                            }`}
                            id={`btn-question-idx-${idx}`}
                          >
                            Q{idx + 1}: {q.points}đ
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Star of Hope controls */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Ngôi sao Hy vọng:</span>
                    <button
                      onClick={handleToggleStar}
                      disabled={currentTurn.currentQuestionConfirmed}
                      className={`w-full py-2 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        currentTurn.currentQuestionConfirmed
                          ? 'bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed opacity-50'
                          : currentTurn.starUsed
                          ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300 shadow-md cursor-pointer animate-pulse'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400 cursor-pointer'
                      }`}
                      id="btn-star-hope"
                    >
                      <Star className={`w-3.5 h-3.5 ${currentTurn.starUsed ? 'fill-current' : ''}`} />
                      NGÔI SAO HY VỌNG ({currentTurn.starUsed ? 'ĐANG BẬT' : 'TẮT'})
                    </button>
                  </div>
                </div>
              )
            ) : null}
          </div>
        </div>

        {/* 3. ACTIVE QUESTION SELECTION & CONFIRMATION */}
        <div className="col-span-1 md:col-span-2 xl:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between gap-3 min-w-0" id="ve-dich-step3">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">3. Chọn Câu Hỏi & Hiển Thị:</h3>
            
            {currentTurn?.packageConfirmed && pointsOfCurrentQ ? (
              <div className="space-y-2.5" id="question-selection-zone">
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-teal-400 uppercase">
                    <span>CÂU SỐ {currentQIndex + 1}</span>
                    <span>{pointsOfCurrentQ} Điểm</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-400 font-semibold">Chọn từ kho câu hỏi:</label>
                    <select
                      value={selectedQuestionId}
                      onChange={(e) => setSelectedQuestionId(e.target.value)}
                      disabled={currentTurn.currentQuestionConfirmed}
                      className="w-full bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500 disabled:opacity-50"
                      id="select-ve-dich-question"
                    >
                      {availableQuestions.length === 0 ? (
                        <option value="">Không có câu hỏi {pointsOfCurrentQ}đ</option>
                      ) : (
                        availableQuestions.map((q: any, idx: number) => (
                          <option key={q.id} value={q.id} className="bg-slate-950 text-xs">
                            VD {q.muc_diem}đ - Câu {idx + 1} ({q.linh_vuc || 'Chung'})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {!currentTurn.currentQuestionConfirmed ? (
                    <button
                      onClick={handleConfirmQuestion}
                      disabled={!selectedQuestionId}
                      className="w-full mt-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                      id="btn-confirm-question-show"
                    >
                      <Play className="w-3.5 h-3.5" />
                      XÁC NHẬN & HIỆN CÂU HỎI
                    </button>
                  ) : (
                    <div className="mt-1 p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center text-[10px] text-emerald-400 font-bold uppercase">
                      ✓ CÂU HỎI ĐÃ HIỂN THỊ TRÊN MÁY THÍ SINH / VIEWER
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-950/60 border border-slate-800/60 rounded-xl text-center text-xs text-slate-500 italic">
                Vui lòng chọn thí sinh và chốt gói điểm ở bước 1 & 2 trước khi chọn câu hỏi.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FULL-WIDTH ACTIVE QUESTION & ANSWER DETAILS */}
      {activeQuestionItem && currentTurn?.currentQuestionConfirmed && (
        <div className="bg-slate-900 border border-teal-500/40 rounded-xl p-3.5 sm:p-4 space-y-3 relative overflow-visible shadow-md" id="confirmed-question-details">
          <BorderTimer seconds={matchState?.timerSeconds ?? 0} total={matchState?.timerTotal || 15} isRunning={!!matchState?.isTimerRunning} />
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2 relative z-10">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
              <span className="bg-teal-500/20 border border-teal-500/30 px-2 py-0.5 rounded text-[11px] font-black">
                CÂU SỐ {currentQIndex + 1} ({pointsOfCurrentQ} ĐIỂM)
              </span>
              <span className="text-slate-400 text-xs">Lĩnh vực: {activeQuestionItem.linh_vuc || 'Chung'}</span>
            </div>

            <button
              onClick={handleStartTimerForQuestion}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              id="btn-start-countdown-timer"
            >
              <Clock className="w-3.5 h-3.5" />
              Bắt đầu tính giờ ({pointsOfCurrentQ === 10 ? '10' : pointsOfCurrentQ === 20 ? '15' : pointsOfCurrentQ === 30 ? '20' : '30'}s) ⏰
            </button>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Nội dung câu hỏi:</span>
            <p className="text-sm font-bold text-white leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
              {activeQuestionItem.noi_dung}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between bg-emerald-950/30 border border-emerald-500/30 p-2.5 sm:p-3 rounded-xl gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-slate-400 font-bold uppercase shrink-0">Đáp án đúng:</span>
              <span className="text-sm text-emerald-400 font-black font-mono uppercase break-words">{activeQuestionItem.dap_an_dung}</span>
            </div>
            {currentTurn.starUsed && (
              <span className="text-xs text-yellow-400 font-bold bg-yellow-500/20 border border-yellow-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0">
                <Star className="w-3.5 h-3.5 fill-current" /> Ngôi sao hy vọng đang bật!
              </span>
            )}
          </div>
        </div>
      )}

      {/* 4. GRADING OPERATIONS ZONE */}
      {currentTurn && activePosition && currentTurn.currentQuestionConfirmed && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-4 space-y-3 shadow-md" id="ve-dich-step4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-850 pb-2">
            4. Chấm Điểm Thí Sinh Thi Chính:
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-slate-300">
                Thí sinh đang thực hiện lượt thi: <strong className="text-teal-300 font-black">{matchState.players[activePosition]?.name}</strong>
              </p>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Lưu ý: Nếu "ĐÚNG" sẽ cộng điểm (x2 nếu có NSHV). Nếu trả lời sai, bấm "GIÀNH QUYỀN" để mở chuông giành quyền 5 giây cho 3 thí sinh còn lại (tự động phạt trừ điểm thí sinh chính nếu có NSHV).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => handleGrade(true)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold rounded-lg transition-all cursor-pointer shadow-md whitespace-nowrap"
                id="btn-grade-main-correct"
              >
                ĐÚNG (Cộng Điểm) 👍
              </button>
              <button
                onClick={handleStartClaim}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-lg transition-all cursor-pointer shadow-md whitespace-nowrap"
                id="btn-grade-main-claim"
              >
                GIÀNH QUYỀN (Mở 5s Tranh Chuông) 🚨
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. SECONDARY CLAIM BOARD: 5 SECONDS GIÀNH QUYỀN */}
      {currentTurn && activePosition && currentTurn.currentQuestionConfirmed && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-4 space-y-3 shadow-md" id="ve-dich-step5">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-850 pb-2 gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                5. Trạng Thái Tranh Giành Chuông 5 Giây:
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Trạng thái hiện tại: {currentTurn.claimBuzzerState}</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => adminCommand(SocketEvent.VE_DICH_RESET_BUZZER)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-all cursor-pointer border border-slate-750 whitespace-nowrap"
                id="btn-manual-reset-buzzer"
              >
                Reset Chuông Thủ Công 🔄
              </button>

              <button
                onClick={handleStartClaim}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap"
                id="btn-retrigger-claim"
              >
                Phát/Reset Lệnh Tranh Chuông 🚨
              </button>
            </div>
          </div>

          {matchState.buzzerState === 'BUZZED' && matchState.buzzedPlayer ? (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3" id="claim-active-buzzed">
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-red-300 uppercase tracking-wider">🚨 ĐÃ CÓ NGƯỜI GIÀNH QUYỀN TRẢ LỜI:</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Thí sinh ở vị trí <strong className="text-white">bàn {matchState.buzzedPlayer} ({matchState.players[matchState.buzzedPlayer]?.name})</strong> đã bấm chuông giành quyền!
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    adminCommand(SocketEvent.GRADE_ANSWER, { isCorrect: true, buzzedWinner: matchState.buzzedPlayer });
                  }}
                  className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold rounded-lg transition-all cursor-pointer whitespace-nowrap"
                  id="btn-grade-claim-correct"
                >
                  ĐÚNG (Cộng Điểm Cho Người Giành)
                </button>
                <button
                  onClick={() => {
                    adminCommand(SocketEvent.GRADE_ANSWER, { isCorrect: false, buzzedWinner: matchState.buzzedPlayer });
                  }}
                  className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold rounded-lg transition-all cursor-pointer whitespace-nowrap"
                  id="btn-grade-claim-wrong"
                >
                  SAI (Phạt Trừ Điểm Người Giành)
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl text-center text-xs text-slate-500" id="claim-no-active">
              Không có tín hiệu chuông giành quyền hoạt động. Nhấp &quot;Phát Lệnh 5s Tranh Chuông&quot; khi thí sinh chính trả lời sai hoặc không trả lời để mở khóa chuông cho 3 thí sinh còn lại.
            </div>
          )}
        </div>
      )}
    </div>

      {/* RIGHT COLUMN: VỀ ĐÍCH SOUND EFFECTS CONTROL PANEL */}
      <div className="xl:col-span-4 2xl:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-2.5 space-y-2 shadow-md xl:sticky xl:top-[120px] w-full min-w-0" id="ve-dich-sound-panel">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-teal-400" />
            Âm Thanh Về Đích
          </h3>
          <button
            onClick={() => adminCommand(SocketEvent.ADMIN_STOP_ALL_SOUNDS)}
            className="px-2 py-0.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[9px] font-bold rounded transition-all flex items-center gap-0.5 cursor-pointer shrink-0"
            id="btn-stop-finish-sounds"
          >
            <Square className="w-2.5 h-2.5 fill-current text-rose-400" />
            <span>Dừng Âm</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'Finish_Start', label: '1. Bắt đầu vòng' },
            { id: 'Finish_UserStart', label: '2. Chọn thí sinh' },
            { id: 'Finish_PackShow', label: '3. Bảng gói câu' },
            { id: 'Finish_Choice', label: '4. Chọn mức điểm' },
            { id: 'Finish_PackChoose', label: '5. Chốt gói điểm' },
            { id: 'Finish_StarChoose', label: '6. Ngôi sao hy vọng' },
            { id: 'Finish_15Seconds', label: '7. Tính giờ 15s' },
            { id: 'Finish_20Seconds', label: '8. Tính giờ 20s' },
            { id: 'Finish_5Seconds', label: '9. 5s Tranh quyền' },
            { id: 'General_Buzz', label: '10. Chuông giành quyền' },
            { id: 'Finish_Right', label: '11. Trả lời đúng' },
            { id: 'Finish_Wrong', label: '12. Trả lời sai' },
            { id: 'Finish_Finish', label: '13. Hoàn thành lượt' },
            { id: 'General_Space', label: '14. Dấu ba chấm' },
          ].map((sound) => (
            <button
              key={sound.id}
              type="button"
              onClick={() => adminCommand(SocketEvent.ADMIN_PLAY_SOUND, { soundId: sound.id })}
              className="p-2 bg-slate-950 hover:bg-teal-950/40 border border-slate-800 hover:border-teal-500/40 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center min-h-[44px] group active:scale-[0.98]"
              id={`btn-sound-${sound.id}`}
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

      {/* MODAL CÀI ĐẶT GÓI ĐIỂM O19 */}
      {isEditingO19Modal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-400" /> CÀI ĐẶT GÓI ĐIỂM O19
              </h3>
              <button
                onClick={() => setIsEditingO19Modal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                ✕ Đóng
              </button>
            </div>

            {editingSubPkgId !== null || isAddingNewPkg ? (
              /* SUB-FORM FOR CREATING / EDITING A SINGLE PACKAGE */
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-500/30">
                  <span className="font-bold text-indigo-300">
                    {isAddingNewPkg ? 'Tạo Gói Mới' : 'Chỉnh Sửa Gói'}
                  </span>
                  <button
                    onClick={() => { setEditingSubPkgId(null); setIsAddingNewPkg(false); }}
                    className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Quay lại danh sách
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold block">Tên gói điểm:</label>
                  <input
                    type="text"
                    value={pkgName}
                    onChange={(e) => setPkgName(e.target.value)}
                    placeholder="VD: Gói 60 điểm, Gói 70 điểm..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-400 font-bold">
                      Các câu hỏi ({pkgPointsList.length} câu - Tổng: <span className="text-amber-400 font-black">{pkgPointsList.reduce((a, b) => a + b, 0)}Đ</span>):
                    </label>
                    <div className="flex gap-1">
                      {pkgPointsList.length < 5 && (
                        <button
                          onClick={() => setPkgPointsList([...pkgPointsList, 20])}
                          className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded text-[10px] font-bold cursor-pointer"
                        >
                          + Thêm câu
                        </button>
                      )}
                      {pkgPointsList.length > 2 && (
                        <button
                          onClick={() => setPkgPointsList(pkgPointsList.slice(0, -1))}
                          className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-[10px] font-bold cursor-pointer"
                        >
                          - Bớt câu
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {pkgPointsList.map((pts, qIdx) => (
                      <div key={qIdx} className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="font-bold text-slate-400">Câu {qIdx + 1}:</span>
                        <div className="flex gap-1.5">
                          {[10, 20, 30, 40].map((pVal) => (
                            <button
                              key={pVal}
                              onClick={() => {
                                const updated = [...pkgPointsList];
                                updated[qIdx] = pVal as 10 | 20 | 30 | 40;
                                setPkgPointsList(updated);
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                pts === pVal
                                  ? 'bg-indigo-500 text-white font-mono shadow-md scale-105'
                                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 font-mono'
                              }`}
                            >
                              {pVal}đ
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => { setEditingSubPkgId(null); setIsAddingNewPkg(false); }}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveSubPkgToModal}
                    className="flex-1 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
                  >
                    Hoàn Tất Gói Này
                  </button>
                </div>
              </div>
            ) : (
              /* MAIN PACKAGE LIST VIEW INSIDE MODAL */
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">
                    Danh sách gói hiện có ({modalPackages.length}):
                  </span>
                  <button
                    onClick={handleStartAddNewPkg}
                    className="px-2.5 py-1 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-[10px] rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-md shadow-indigo-500/20"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tạo gói mới
                  </button>
                </div>

                {modalPackages.length === 0 ? (
                  <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl text-center text-slate-500 italic">
                    Chưa có gói điểm nào. Vui lòng bấm "Tạo gói mới" hoặc "Khôi phục mặc định".
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                    {modalPackages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-2"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-extrabold text-white text-xs flex items-center gap-2">
                            <span>{pkg.name}</span>
                            <span className="text-amber-400 font-mono text-xs">({pkg.totalPoints}Đ)</span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {pkg.pointsList.join(' - ')} điểm ({pkg.pointsList.length} câu)
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleStartEditSubPkg(pkg)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg transition-all text-[10px] flex items-center gap-1 cursor-pointer"
                            title="Sửa gói này"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteSubPkgFromModal(pkg.id)}
                            className="p-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 rounded-lg transition-all text-[10px] flex items-center gap-1 cursor-pointer"
                            title="Xóa gói này"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-800 gap-2">
                  <button
                    onClick={handleResetModalToDefault}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Khôi phục 4 gói mặc định O19"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Khôi phục mặc định
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditingO19Modal(false)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSaveO19ModalFinal}
                      className="px-4 py-2 bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-teal-400/20 cursor-pointer"
                    >
                      Lưu lại
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
