import React, { useState, useEffect, useMemo } from 'react';
import { useGameSocket } from '../hooks/useGameSocket.js';
import { Check, Trophy } from 'lucide-react';
import { motion } from 'motion/react';

interface ScoreboardViewProps {
  initialPosition?: 1 | 2 | 3 | 4;
}

export default function ScoreboardView({ initialPosition }: ScoreboardViewProps) {
  const { matchState } = useGameSocket();

  // Position 1..4
  const [position, setPosition] = useState<1 | 2 | 3 | 4>(() => {
    const params = new URLSearchParams(window.location.search);
    const p = parseInt(params.get('pos') || params.get('position') || params.get('p') || '0', 10);
    if (p >= 1 && p <= 4) return p as 1 | 2 | 3 | 4;
    const saved = localStorage.getItem('olympia_scoreboard_pos');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (parsed >= 1 && parsed <= 4) return parsed as 1 | 2 | 3 | 4;
    }
    return initialPosition || 1;
  });

  const [hasConfirmedPosition, setHasConfirmedPosition] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    const p = parseInt(params.get('pos') || params.get('position') || params.get('p') || '0', 10);
    if (p >= 1 && p <= 4) return true;
    return !!localStorage.getItem('olympia_scoreboard_confirmed');
  });

  const [buzzFlashState, setBuzzFlashState] = useState<boolean>(true); // true = Red (State 2), false = Blue (State 1)

  // Sync position changes to localStorage
  const handleSelectPosition = (pos: 1 | 2 | 3 | 4) => {
    setPosition(pos);
    localStorage.setItem('olympia_scoreboard_pos', pos.toString());
    localStorage.setItem('olympia_scoreboard_confirmed', 'true');
    setHasConfirmedPosition(true);

    // Update URL param without reloading
    const url = new URL(window.location.href);
    url.searchParams.set('pos', pos.toString());
    window.history.replaceState({}, '', url.toString());
  };

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Keyboard shortcut listener: 1, 2, 3, 4 to switch position; F for fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === '1' || e.code === 'Digit1' || e.code === 'Numpad1') {
        handleSelectPosition(1);
      } else if (e.key === '2' || e.code === 'Digit2' || e.code === 'Numpad2') {
        handleSelectPosition(2);
      } else if (e.key === '3' || e.code === 'Digit3' || e.code === 'Numpad3') {
        handleSelectPosition(3);
      } else if (e.key === '4' || e.code === 'Digit4' || e.code === 'Numpad4') {
        handleSelectPosition(4);
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Extract contestant info from real-time match state
  const player = matchState?.players ? matchState.players[position] : null;
  const candidateName = (player?.name && player.name.trim().length > 0)
    ? player.name.trim().toUpperCase()
    : `THÍ SINH ${position}`;
  const candidateScore = player?.score ?? 0;

  // Determine Buzzer status (Giành quyền trả lời)
  const isBuzzedForMe = useMemo(() => {
    if (!matchState) return false;
    const round = matchState.currentRound;

    // 1. General & Collective buzzer
    if (matchState.buzzedPlayer === position) {
      return true;
    }
    if (matchState.buzzerState === 'BUZZED' && matchState.buzzedPlayer === position) {
      return true;
    }

    // 2. VCNV buzzer
    if (round === 'VCNV') {
      if (matchState.vcnv?.cnvBuzzedPlayer === position) return true;
      if (matchState.vcnv?.cnvBuzzedPlayers?.some((bp: any) => bp.position === position)) return true;
    }

    // 3. Tăng Tốc (improved mode) buzzer
    if (round === 'TANG_TOC') {
      if (matchState.tang_toc?.buzzedPlayer === position) return true;
    }

    // 4. Về Đích claim buzzer
    if (round === 'VE_DICH') {
      const activeIdx = matchState.ve_dich?.currentPlayerIndex;
      const activePos = (activeIdx !== null && activeIdx !== undefined) ? (activeIdx + 1) : null;
      const turn = activePos ? matchState.ve_dich?.turns?.[activePos] : null;
      if (turn?.claimBuzzerPlayer === position) return true;
    }

    // 5. Câu hỏi phụ buzzer
    if (round === 'CH_PHU') {
      if (matchState.cau_hoi_phu?.buzzedPlayer === position) return true;
    }

    // 6. Jeopardy buzzer
    if (round === 'JEOPARDY') {
      if (matchState.jeopardy?.buzzedPlayer === position) return true;
    }

    return false;
  }, [matchState, position]);

  // Determine Disqualified / Lost Turn status (Bị loại / Mất lượt / Mất quyền trả lời)
  const isEliminatedOrLostTurn = useMemo(() => {
    if (!matchState) return false;
    const round = matchState.currentRound;

    // 1. Khởi động (Collective)
    if (round === 'KHOI_DONG') {
      const kd = matchState.khoi_dong;
      if (kd?.disqualifiedPlayers?.includes(position)) return true;
      if (kd?.blockedThisQuestionPlayers?.includes(position)) return true;
      if (kd?.blockedNextQuestionPlayers?.includes(position)) return true;
    }

    // 2. VCNV
    if (round === 'VCNV') {
      if (matchState.vcnv?.cnvBlockedPlayers?.includes(position)) return true;
    }

    // 3. Tăng Tốc (improved mode)
    if (round === 'TANG_TOC') {
      if (matchState.tang_toc?.blockedPlayers?.includes(position)) return true;
    }

    // 4. Câu hỏi phụ
    if (round === 'CH_PHU') {
      if (matchState.cau_hoi_phu?.foulPlayers?.includes(position)) return true;
      if (matchState.cau_hoi_phu?.incorrectPlayers?.includes(position)) return true;
    }

    // 5. Jeopardy
    if (round === 'JEOPARDY') {
      if (matchState.jeopardy?.incorrectPlayersForClue?.includes(position)) return true;
      if (matchState.jeopardy?.foulPlayersForClue?.includes(position)) return true;
    }

    return false;
  }, [matchState, position]);

  // 0.5s alternating loop when buzzing:
  // "Khi bấm chuông: Hiển thị trạng thái 2 trong 0.5s, rồi chuyển về trạng thái 1 trong 0.5s, lặp lại quá trình này"
  useEffect(() => {
    if (!isBuzzedForMe) {
      setBuzzFlashState(true); // Reset
      return;
    }

    // Initial state is Red (State 2)
    setBuzzFlashState(true);

    const interval = setInterval(() => {
      setBuzzFlashState((prev) => !prev);
    }, 500); // 0.5s interval

    return () => clearInterval(interval);
  }, [isBuzzedForMe]);

  // Determine current active visual display state:
  // State 1: Normal (Blue)
  // State 2: Buzzed / Giành quyền (Red)
  // State 3: Eliminated / Lost turn (Black + Gray)
  let activeDisplayState: 1 | 2 | 3 = 1;

  if (isEliminatedOrLostTurn) {
    activeDisplayState = 3;
  } else if (isBuzzedForMe) {
    activeDisplayState = buzzFlashState ? 2 : 1;
  } else {
    activeDisplayState = 1;
  }

  // Visual Theme Configuration based on 3 States:
  // State 1 (Normal): Top = #0073c6 / #0077c8 (bright blue), Bottom = #002060 / #001e5d (dark navy)
  // State 2 (Buzz/Giành quyền): Top = #ff0000 (bright red), Bottom = #b30000 / #a30000 (deep red)
  // State 3 (Bị loại/Mất lượt): Top = #000000 (pure black), Bottom = #707070 / #6f6f6f (neutral gray)
  const themeStyles = {
    1: {
      topBg: 'bg-[#0073c6]',
      bottomBg: 'bg-[#002060]',
      textColor: 'text-white',
    },
    2: {
      topBg: 'bg-[#ff0000]',
      bottomBg: 'bg-[#b30000]',
      textColor: 'text-white',
    },
    3: {
      topBg: 'bg-[#000000]',
      bottomBg: 'bg-[#707070]',
      textColor: 'text-white',
    },
  }[activeDisplayState];

  // If user hasn't selected a position yet, show the setup screen
  if (!hasConfirmedPosition) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
        >
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mx-auto shadow-inner">
              <Trophy className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
              BẢNG ĐIỂM THÍ SINH
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              Chọn vị trí / thứ tự thi đấu của bục thí sinh để đồng bộ tên, điểm số và tín hiệu chuông thời gian thực. (Có thể nhấn phím 1, 2, 3, 4 để chuyển đổi bất kỳ lúc nào).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {([1, 2, 3, 4] as const).map((pos) => {
              const pData = matchState?.players ? matchState.players[pos] : null;
              const pName = pData?.name || `Thí sinh ${pos}`;
              const pScore = pData?.score ?? 0;
              const isSelected = position === pos;

              return (
                <button
                  key={pos}
                  type="button"
                  onClick={() => handleSelectPosition(pos)}
                  className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                    isSelected
                      ? 'bg-sky-600/20 border-sky-500 shadow-[0_0_20px_rgba(2,132,199,0.3)] ring-2 ring-sky-500/50'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black tracking-widest text-sky-400 uppercase">
                      BÀN {pos}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-sky-400" />}
                  </div>
                  <div className="mt-3">
                    <h4 className="font-bold text-white text-base truncate group-hover:text-sky-300 transition-colors">
                      {pName}
                    </h4>
                    <span className="text-2xl font-black text-slate-300 block mt-1 font-mono">
                      {pScore} <span className="text-xs font-normal text-slate-400">điểm</span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => handleSelectPosition(position)}
              className="w-full py-3.5 px-6 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-sky-600/25 cursor-pointer flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              <span>Vào Giao Diện Bảng Điểm (Bàn {position})</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      id="scoreboard-root"
      className="relative w-screen h-screen overflow-hidden select-none flex flex-col cursor-default"
      style={{
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* 1. TOP HEADER SECTION: CANDIDATE NAME */}
      <div
        id="scoreboard-name-banner"
        className={`w-full h-[24vh] flex items-center justify-center px-4 sm:px-8 transition-colors duration-150 ${themeStyles.topBg}`}
      >
        <span
          id="scoreboard-candidate-name"
          className="text-white font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl uppercase tracking-wider text-center leading-tight drop-shadow-sm truncate max-w-full px-2"
        >
          {candidateName}
        </span>
      </div>

      {/* 2. BOTTOM MAIN BODY SECTION: CANDIDATE SCORE */}
      <div
        id="scoreboard-score-body"
        className={`w-full h-[76vh] flex items-center justify-center p-2 sm:p-6 transition-colors duration-150 relative ${themeStyles.bottomBg}`}
      >
        <span
          id="scoreboard-candidate-score"
          className="text-white font-black text-[28vw] sm:text-[25vw] md:text-[23vw] lg:text-[21vw] xl:text-[20vw] leading-none text-center select-none tracking-tight flex items-center justify-center"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {candidateScore}
        </span>
      </div>
    </div>
  );
}
