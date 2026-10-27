import React, { useState, useEffect } from 'react';
import { useGameSocket } from '../hooks/useGameSocket.js';
import { useSoundEngine } from '../hooks/useSoundEngine.js';
import { SocketEvent, GameRound, MatchState, MatchDbModel, getTangTocImprovedPoints } from '../types.js';
import { Volume2, Award, Zap, AlertTriangle, Play, HelpCircle, LogOut, Trophy, Star, Users, Bell, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SummaryPlayerView from './player/SummaryPlayerView.js';
import { JeopardyView } from './views/JeopardyView.js';
import { MaTranKepPlayerView } from './views/MaTranKepPlayerView.js';
import ChinhPhucPlayerView from './views/ChinhPhucPlayerView.js';
import { DauTriPlayerView } from './views/DauTriPlayerView.js';
import UniversalMediaPlayer from './UniversalMediaPlayer.js';
import CircularTimer from './CircularTimer.js';
import SmoothTimerBar from './SmoothTimerBar.js';
import BorderTimer from './BorderTimer.js';
import ShootoutScoreDots, { ImprovedScoreDots } from './ShootoutScoreDots.js';
import { RoundLogoRenderer } from './common/RoundLogoAssets.js';
import { safeFetchJson } from '../utils/api.js';

function getObstacleClassification(text: string) {
  const cleanText = text.replace(/\s/g, '');
  const count = cleanText.length;

  if (count === 0) return { count: 0, label: 'KÝ TỰ' };

  const onlyDigits = /^[0-9]+$/.test(cleanText);
  if (onlyDigits) {
    return { count, label: 'CHỮ SỐ' };
  }

  let hasLetter = false;
  let hasSpecial = false;
  let hasDigits = false;

  for (const char of cleanText) {
    if (/[0-9]/.test(char)) {
      hasDigits = true;
    } else if (/\p{L}/u.test(char)) {
      hasLetter = true;
    } else {
      hasSpecial = true;
    }
  }

  if (hasSpecial || (hasLetter && hasDigits)) {
    return { count, label: 'KÝ TỰ' };
  } else if (hasLetter) {
    return { count, label: 'CHỮ CÁI' };
  } else if (hasDigits) {
    return { count, label: 'CHỮ SỐ' };
  }

  return { count, label: 'KÝ TỰ' };
}

function SidebarBottomControl({
  round,
  matchState,
  matchQuestions,
  position,
  pressBuzzer,
  pressBuzzerCNV,
  hasBuzzedCNV,
  setHasBuzzedCNV,
  socket,
}: {
  round: GameRound;
  matchState: MatchState | null;
  matchQuestions?: MatchDbModel | null;
  position: 1 | 2 | 3 | 4;
  pressBuzzer: () => void;
  pressBuzzerCNV: () => void;
  hasBuzzedCNV: boolean;
  setHasBuzzedCNV: (val: boolean) => void;
  socket?: any;
}) {
  const buzzerState = matchState?.buzzerState || 'LOCKED';
  const isMyBuzzerWin = buzzerState === 'BUZZED' && matchState?.buzzedPlayer === position;

  if (round === 'CHINH_PHUC') {
    return null;
  }

  // 1. TĂNG TỐC: Circular Countdown Clock or Improved Mode Buzzer
  if (round === 'TANG_TOC') {
    const tangToc = matchState?.tang_toc;
    const isImproved = tangToc?.mode === 'IMPROVED';

    if (isImproved) {
      const buzzedPos = matchState?.buzzedPlayer || tangToc?.buzzedPlayer;
      const isMyBuzzerWin = buzzedPos === position;
      const isBlocked = tangToc?.blockedPlayers?.includes(position);
      const isOtherBuzzed = buzzedPos && !isMyBuzzerWin;
      const isTimerRunning = matchState?.isTimerRunning;
      const buzzerLocked = tangToc?.buzzerLocked || matchState?.buzzerState === 'LOCKED';
      const isOpen = isTimerRunning && !buzzerLocked && !isBlocked && !buzzedPos;

      return (
        <div className="flex flex-col items-center justify-center p-4 bg-slate-950/90 border border-slate-800 rounded-2xl shadow-inner text-center space-y-3">
          <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase">
            NÚT CHUÔNG TĂNG TỐC
          </span>
          <button
            type="button"
            disabled={!isOpen}
            onClick={pressBuzzer}
            className={`w-40 h-40 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-150 transform active:scale-95 shadow-2xl focus:outline-none select-none ${
              isMyBuzzerWin
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-teal-300 text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-pulse'
                : isBlocked
                ? 'bg-slate-800/80 border-slate-700/80 text-rose-400 cursor-not-allowed opacity-60'
                : isOtherBuzzed
                ? 'bg-slate-800/80 border-slate-700/80 text-amber-400 cursor-not-allowed opacity-60'
                : isOpen
                ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 border-amber-300 hover:border-orange-200 text-slate-950 active:bg-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)] cursor-pointer animate-pulse hover:scale-105'
                : 'bg-slate-800/50 border-slate-700/80 text-slate-500 cursor-not-allowed opacity-60'
            }`}
          >
            <Bell className="w-12 h-12" />
            <span className="font-extrabold text-xs tracking-wider mt-1.5 uppercase text-center px-2 leading-tight">
              {isMyBuzzerWin
                ? 'BẠN CÓ QUYỀN'
                : isBlocked
                ? 'BẠN BỊ MẤT LƯỢT'
                : isOtherBuzzed
                ? `BÀN ${buzzedPos} CÓ QUYỀN`
                : isOpen
                ? 'BẤM CHUÔNG'
                : 'KHÓA CHUÔNG'}
            </span>
          </button>
        </div>
      );
    }

    const isTimerRunning = matchState?.isTimerRunning;
    const timerSeconds = matchState?.timerSeconds ?? 0;
    const currentQIndex = matchState?.tang_toc?.currentQuestionIndex ?? -1;
    const questionItem = isImproved
      ? matchQuestions?.tang_toc?.cai_tien_cau_hoi?.[currentQIndex]
      : matchQuestions?.tang_toc?.cau_hoi?.[currentQIndex];

    const duration = questionItem
      ? (isImproved 
          ? ((questionItem as { loai_cau_hoi?: number }).loai_cau_hoi === 4 ? 40 : 30)
          : ((questionItem as { thoi_gian?: number }).thoi_gian || 30))
      : 0;

    const maxTimer = matchState?.timerTotal || duration;

    return (
      <div className="flex flex-col items-center justify-center p-4 bg-slate-950/90 border border-slate-800 rounded-2xl shadow-inner text-center">
        <CircularTimer seconds={timerSeconds} total={maxTimer} isRunning={!!isTimerRunning} />
      </div>
    );
  }

  // 2. VCNV: Big Obstacle Buzzer
  if (round === 'VCNV') {
    const isBlockedCNV = matchState?.vcnv?.cnvBlockedPlayers?.includes(position);
    const alreadyBuzzedCNV = hasBuzzedCNV || matchState?.vcnv?.cnvBuzzedPlayers?.some((bp: any) => bp.position === position);
    const isSolved = matchState?.vcnv?.cnvSolved;

    return (
      <div className="flex flex-col items-center justify-center p-4 bg-slate-950/90 border border-slate-800 rounded-2xl shadow-inner text-center space-y-3">
        <span className="text-[10px] font-black tracking-widest text-red-400 uppercase">
          NÚT CHUÔNG VCNV
        </span>
        <button
          type="button"
          onClick={() => {
            pressBuzzerCNV();
            setHasBuzzedCNV(true);
            localStorage.setItem('hasBuzzedCNV', 'true');
          }}
          disabled={alreadyBuzzedCNV || isBlockedCNV || isSolved}
          className={`w-40 h-40 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-150 transform active:scale-95 cursor-pointer shadow-2xl focus:outline-none select-none ${
            isBlockedCNV || isSolved
              ? 'bg-slate-950 border-rose-950 text-rose-500/50 cursor-not-allowed opacity-40'
              : alreadyBuzzedCNV
              ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed opacity-60'
              : 'bg-gradient-to-br from-red-600 via-rose-600 to-red-700 border-red-400 text-white cursor-pointer shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse hover:scale-105'
          }`}
        >
          <AlertTriangle className="w-12 h-12" />
          <span className="font-extrabold text-xs tracking-wider mt-1.5 uppercase text-center px-2 leading-tight">
            {isBlockedCNV ? 'LOẠI BỎ' : alreadyBuzzedCNV ? 'ĐÃ BẤM' : 'BẤM CHUÔNG VCNV'}
          </span>
        </button>
        <p className="text-[10px] text-slate-400 leading-tight">
          Bấm chuông để giành quyền giải Chướng Ngại Vật.
        </p>
      </div>
    );
  }

  // 3. KHỞI ĐỘNG: Big Buzzer
  if (round === 'KHOI_DONG') {
    const kd = matchState?.khoi_dong;
    const isCollective = kd?.subRound === 'COLLECTIVE';
    const isDisqualified = kd?.disqualifiedPlayers?.includes(position);
    const isBlockedThis = kd?.blockedThisQuestionPlayers?.includes(position);
    const isBlockedNext = kd?.blockedNextQuestionPlayers?.includes(position);
    const isBlocked = isDisqualified || isBlockedThis || isBlockedNext;

    return (
      <div className="flex flex-col items-center justify-center p-4 bg-slate-950/90 border border-slate-800 rounded-2xl shadow-inner text-center space-y-3">
        <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">
          NÚT CHUÔNG KHỞI ĐỘNG
        </span>
        <button
          type="button"
          disabled={isBlocked || buzzerState !== 'OPEN' || !isCollective || !kd?.isConfirmed}
          onClick={pressBuzzer}
          className={`w-40 h-40 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-150 transform active:scale-95 shadow-2xl focus:outline-none select-none ${
            isBlocked
              ? 'bg-slate-800/80 border-slate-700/80 text-slate-500 cursor-not-allowed opacity-60'
              : buzzerState === 'OPEN' && isCollective && kd?.isConfirmed
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-teal-300 hover:border-emerald-200 text-slate-950 active:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)] cursor-pointer'
              : isMyBuzzerWin
              ? 'bg-gradient-to-br from-red-600 to-rose-700 border-red-500 text-white animate-pulse'
              : 'bg-slate-800/50 border-slate-700/80 text-slate-500 cursor-not-allowed opacity-60'
          }`}
        >
          <Volume2 className="w-12 h-12" />
          <span className="font-extrabold text-xs tracking-wider mt-1.5 uppercase text-center px-2 leading-tight">
            {isDisqualified 
              ? 'BẠN ĐÃ BỊ LOẠI' 
              : isBlockedThis || isBlockedNext
              ? 'BẠN BỊ MẤT LƯỢT'
              : !kd?.isConfirmed
              ? 'VUI LÒNG CHỜ'
              : !isCollective 
              ? 'LƯỢT CÁ NHÂN' 
              : buzzerState === 'OPEN' 
              ? 'BẤM CHUÔNG' 
              : isMyBuzzerWin 
              ? 'BẠN CÓ QUYỀN' 
              : 'KHÓA CHUÔNG'}
          </span>
        </button>
      </div>
    );
  }

  // 4. VỀ ĐÍCH: Claim Points Buzzer
  if (round === 'VE_DICH') {
    const vd = matchState?.ve_dich;
    const activeIndex = vd?.currentPlayerIndex;
    const activePosition = activeIndex !== null && activeIndex !== undefined ? (activeIndex + 1) as 1 | 2 | 3 | 4 : null;
    const isMe = position === activePosition;
    const activeTurn = activePosition ? vd?.turns?.[activePosition] : null;
    const isOpenForClaim = activeTurn?.claimBuzzerState === 'OPEN' || buzzerState === 'OPEN';

    if (isMe) {
      return (
        <div className="flex flex-col items-center justify-center p-4 bg-slate-950/90 border border-slate-800 rounded-2xl text-center space-y-2">
          <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase">LƯỢT THI CỦA BẠN</span>
          <p className="text-xs text-slate-300 font-semibold leading-relaxed">
            Trả lời trực tiếp bằng lời nói cho MC. Thí sinh khác có thể giành quyền nếu bạn trả lời sai.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center p-4 bg-slate-950/90 border border-slate-800 rounded-2xl shadow-inner text-center space-y-3">
        <span className="text-[10px] font-black tracking-widest text-red-400 uppercase">
          CHUÔNG CƯỚP ĐIỂM
        </span>
        <button
          type="button"
          disabled={!isOpenForClaim}
          onClick={pressBuzzer}
          className={`w-40 h-40 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-150 transform active:scale-95 cursor-pointer shadow-2xl focus:outline-none select-none ${
            isOpenForClaim
              ? 'bg-gradient-to-br from-red-600 to-rose-700 border-red-400 hover:border-red-300 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse'
              : isMyBuzzerWin
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 text-slate-950'
              : 'bg-slate-800/50 border-slate-700/80 text-slate-500 cursor-not-allowed opacity-60'
          }`}
        >
          <Volume2 className="w-12 h-12" />
          <span className="font-extrabold text-xs tracking-wider mt-1.5 uppercase text-center px-2 leading-tight">
            {isOpenForClaim ? 'CƯỚP QUYỀN' : isMyBuzzerWin ? 'BẠN CÓ QUYỀN' : 'KHÓA CHUÔNG'}
          </span>
        </button>
      </div>
    );
  }

  // 5. CAU HOI PHU
  if (round === 'CH_PHU') {
    const chp = matchState?.cau_hoi_phu;
    if (chp?.ruleMode === 'SHOOTOUT') {
      const isMyTurn = chp?.currentTurnPlayer === position;
      return (
        <div className={`flex flex-col items-center justify-center p-5 border rounded-2xl text-center space-y-3 transition-all ${
          isMyTurn 
            ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.3)] animate-pulse' 
            : 'bg-slate-950/90 border-slate-800 text-slate-400'
        }`}>
          <span className="text-[10px] font-black tracking-widest uppercase text-amber-400">
            CHẾ ĐỘ LUÂN LƯU (KHÔNG DÙNG CHUÔNG)
          </span>
          <p className="text-xs font-bold text-white">
            {isMyTurn ? '🎯 ĐANG LÀ LƯỢT TRẢ LỜI CỦA BẠN!' : `Chờ đến lượt trả lời (Đang là Bàn ${chp?.currentTurnPlayer || 1})`}
          </p>
          <div className="pt-1">
            <ShootoutScoreDots 
              history={chp?.history?.[position]} 
              isCurrentTurn={isMyTurn}
              size="lg"
            />
          </div>
        </div>
      );
    }

    const isFoul = chp?.foulPlayers?.includes(position);
    const isIncorrect = chp?.incorrectPlayers?.includes(position);
    const isOpen = buzzerState === 'OPEN' && !isFoul && !isIncorrect;

    return (
      <div className="flex flex-col items-center justify-center p-4 bg-slate-950/90 border border-slate-800 rounded-2xl shadow-inner text-center space-y-3">
        <span className="text-[10px] font-black tracking-widest text-teal-400 uppercase">
          CHUÔNG CÂU HỎI PHỤ
        </span>
        <button
          type="button"
          disabled={!isOpen}
          onClick={pressBuzzer}
          className={`w-40 h-40 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-150 transform active:scale-95 cursor-pointer shadow-2xl focus:outline-none select-none ${
            isOpen
              ? 'bg-gradient-to-br from-teal-500 to-emerald-600 border-teal-300 hover:border-emerald-200 text-slate-950 shadow-[0_0_30px_rgba(20,184,166,0.4)]'
              : isMyBuzzerWin
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-teal-400 text-slate-950 animate-pulse'
              : 'bg-slate-800/50 border-slate-700/80 text-slate-500 cursor-not-allowed opacity-60'
          }`}
        >
          <Volume2 className="w-12 h-12" />
          <span className="font-extrabold text-xs tracking-wider mt-1.5 uppercase text-center px-2 leading-tight">
            {isFoul ? 'VI PHẠM' : isIncorrect ? 'BỊ KHÓA' : isOpen ? 'BẤM CHUÔNG' : isMyBuzzerWin ? 'BẠN CÓ QUYỀN' : 'KHÓA CHUÔNG'}
          </span>
        </button>
      </div>
    );
  }

  // 6. JEOPARDY
  if (round === 'JEOPARDY') {
    const jp = matchState?.jeopardy;
    const isBuzzed = (matchState?.buzzerState === 'BUZZED' && matchState?.buzzedPlayer === position) || jp?.buzzedPlayer === position;
    const isOtherBuzzed = (matchState?.buzzedPlayer || jp?.buzzedPlayer) && !isBuzzed;
    const isIncorrect = jp?.incorrectPlayersForClue?.includes(position);
    const hasAnyBuzzed = isBuzzed || isOtherBuzzed;
    const isClueActive = !!jp?.selectedClue && jp?.clueStage !== 'FINISHED';
    const isDisabled = hasAnyBuzzed || isIncorrect || !isClueActive;

    return (
      <div className="flex flex-col items-center justify-center p-4 bg-slate-950/90 border border-slate-800 rounded-2xl shadow-inner text-center space-y-3">
        <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase">
          NÚT CHUÔNG J!
        </span>
        <button
          type="button"
          disabled={isDisabled}
          onClick={pressBuzzer}
          className={`w-40 h-40 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-150 transform active:scale-95 shadow-2xl focus:outline-none select-none ${
            hasAnyBuzzed
              ? 'bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 border-yellow-200 text-slate-950 shadow-[0_0_35px_rgba(245,158,11,0.6)] animate-pulse'
              : !isDisabled
              ? 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 border-emerald-300 hover:border-yellow-200 text-slate-950 shadow-[0_0_35px_rgba(16,185,129,0.6)] cursor-pointer hover:scale-105 active:scale-90'
              : 'bg-slate-800/80 border-slate-700/80 text-slate-400 cursor-not-allowed opacity-70'
          }`}
        >
          <Bell className="w-12 h-12" />
          <span className="font-extrabold text-xs tracking-wider mt-1.5 uppercase text-center px-2 leading-tight">
            {hasAnyBuzzed
              ? isBuzzed
                ? 'BẠN GIÀNH QUYỀN!'
                : `BÀN ${matchState?.buzzedPlayer || jp?.buzzedPlayer} GIÀNH QUYỀN`
              : isIncorrect
              ? 'TRẢ LỜI SAI'
              : 'NÚT CHUÔNG'}
          </span>
        </button>
      </div>
    );
  }

  // 6. ĐẤU TRÍ: Big Buzzer (giống KĐ)
  if (round === 'DAU_TRI') {
    const dauTri = matchState?.dau_tri;
    const isMyTurnLost = dauTri?.foulOrWrongPlayers?.includes(position);
    const isMeBuzzed = dauTri?.buzzedPlayer === position;
    const isAnotherBuzzed = dauTri?.buzzedPlayer !== null && !isMeBuzzed;
    const canBuzz = dauTri?.status === 'PLAYING' && dauTri?.stage === 'MAIN_QUESTION' && !dauTri?.buzzerLocked && !isMyTurnLost && dauTri?.buzzedPlayer === null;
    const isDisabled = !canBuzz && !isMeBuzzed;

    const handleDauTriBuzz = () => {
      if (canBuzz) {
        socket?.emit(SocketEvent.DAU_TRI_BUZZ, { position });
      }
    };

    return (
      <div className="flex flex-col items-center justify-center p-4 bg-slate-950/90 border border-slate-800 rounded-2xl shadow-inner text-center space-y-3">
        <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">
          NÚT CHUÔNG ĐẤU TRÍ
        </span>
        <button
          type="button"
          disabled={isDisabled}
          onClick={handleDauTriBuzz}
          className={`w-40 h-40 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-150 transform active:scale-95 shadow-2xl focus:outline-none select-none ${
            isMeBuzzed
              ? 'bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 border-yellow-200 text-slate-950 shadow-[0_0_35px_rgba(245,158,11,0.6)] animate-pulse'
              : isAnotherBuzzed
              ? 'bg-slate-800/80 border-slate-700/80 text-slate-400 cursor-not-allowed opacity-70'
              : isMyTurnLost
              ? 'bg-rose-950/60 border-rose-900 text-rose-400 cursor-not-allowed opacity-70'
              : canBuzz
              ? 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 border-indigo-300 hover:border-yellow-200 text-white shadow-[0_0_35px_rgba(99,102,241,0.6)] cursor-pointer hover:scale-105 active:scale-90'
              : 'bg-slate-800/80 border-slate-700/80 text-slate-400 cursor-not-allowed opacity-70'
          }`}
        >
          <Volume2 className="w-12 h-12" />
          <span className="font-extrabold text-xs tracking-wider mt-1.5 uppercase text-center px-2 leading-tight">
            {isMeBuzzed
              ? 'BẠN GIÀNH QUYỀN!'
              : isAnotherBuzzed
              ? `BÀN ${dauTri?.buzzedPlayer} GIÀNH QUYỀN`
              : isMyTurnLost
              ? 'MẤT LƯỢT'
              : canBuzz
              ? 'BẤM CHUÔNG'
              : 'CHUÔNG ĐANG KHÓA'}
          </span>
          {canBuzz && (
            <span className="text-[10px] text-indigo-200 mt-1 font-mono font-bold">[Space]</span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl text-center space-y-1 text-slate-500 text-xs">
      <p className="font-semibold uppercase text-[10px] tracking-wider text-slate-400">Trạng thái chuông</p>
      <p>Chưa kích hoạt bấm chuông</p>
    </div>
  );
}

export default function PlayerView() {
  const {
    matchState,
    isConnected,
    errorMsg,
    setErrorMsg,
    joinGame,
    submitAnswer,
    pressBuzzer,
    pressBuzzerCNV,
    socket,
  } = useGameSocket();

  // Mount sound engine to play live audio events
  useSoundEngine(matchState, socket);

  // Authentication states
  const [name, setName] = useState('');
  const [position, setPosition] = useState<1 | 2 | 3 | 4>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('pos');
      if (p === '1' || p === '2' || p === '3' || p === '4') {
        return parseInt(p, 10) as 1 | 2 | 3 | 4;
      }
    }
    return 1;
  });
  const [matchCode, setMatchCode] = useState(() => {
    if (typeof window !== 'undefined') {
      const m = new URLSearchParams(window.location.search).get('match') || new URLSearchParams(window.location.search).get('matchCode');
      if (m) return m.toUpperCase();
    }
    return '';
  });
  const [isJoined, setIsJoined] = useState(false);
  const [joinError, setJoinError] = useState('');
  
  // Question database state
  const [matchQuestions, setMatchQuestions] = useState<any>(null);

  // Local interaction states
  const [textAnswer, setTextAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [vcnvLastAnswer, setVcnvLastAnswer] = useState('');
  const [tangTocLastAnswer, setTangTocLastAnswer] = useState('');
  const [hasBuzzedCNV, setHasBuzzedCNV] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hasBuzzedCNV') === 'true';
    }
    return false;
  });
  const [buzzedNotification, setBuzzedNotification] = useState<{ playerName: string, position: number } | null>(null);
  const [localShowAnswersDismissed, setLocalShowAnswersDismissed] = useState(false);

  // Reset answer dismiss state on question change or showAnswers toggle
  useEffect(() => {
    setLocalShowAnswersDismissed(false);
  }, [matchState?.tang_toc?.currentQuestionIndex, matchState?.tang_toc?.showAnswers]);

  // Pop-up buzzer notification observer
  useEffect(() => {
    const buzzedPlayerPos = matchState?.vcnv?.cnvBuzzedPlayer;
    if (buzzedPlayerPos) {
      const p = matchState?.players[buzzedPlayerPos];
      if (p) {
        setBuzzedNotification({
          playerName: p.name,
          position: buzzedPlayerPos
        });
        const timer = setTimeout(() => {
          setBuzzedNotification(null);
        }, 5000);
        return () => clearTimeout(timer);
      }
    } else {
      setBuzzedNotification(null);
    }
  }, [matchState?.vcnv?.cnvBuzzedPlayer]);

  // Load question bank for displaying questions to player
  useEffect(() => {
    if (matchState?.matchCode && matchState.matchCode.trim()) {
      safeFetchJson<any>(`/api/match/${encodeURIComponent(matchState.matchCode.trim())}?t=${matchState.loadedAt || Date.now()}`)
        .then((data) => {
          if (data && data.success && data.match) {
            setMatchQuestions(data.match);
          }
        })
        .catch((err) => console.error('Failed to fetch match questions:', err));
    }
  }, [matchState?.matchCode, matchState?.loadedAt]);

  // Real-time socket updates for loaded match questions
  useEffect(() => {
    if (!socket) return;
    const handleQuestionsUpdated = (data: { matchCode: string; matchQuestions: any }) => {
      if (data && data.matchQuestions) {
        setMatchQuestions(data.matchQuestions);
      }
    };
    socket.on(SocketEvent.MATCH_QUESTIONS_UPDATED, handleQuestionsUpdated);
    return () => {
      socket.off(SocketEvent.MATCH_QUESTIONS_UPDATED, handleQuestionsUpdated);
    };
  }, [socket]);

  // Retrieve my player state in the match
  const myPlayer = matchState && isJoined ? matchState.players[position] : null;

  // Handle reconnecting or page state cleanups
  useEffect(() => {
    if (isJoined && matchState) {
      const serverPlayer = matchState.players[position];
      // If server does not have us registered under our socket, or name differs, let's keep track
      if (!serverPlayer || !serverPlayer.isReady) {
        // We might have been disconnected or kicked by admin
      }
    }
  }, [matchState, isJoined, position]);

  // Submit Answer via socket
  const handleTextAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTextAnswer(val);
    // Realtime sync input to MC & Admin (as requested in actual live typing feature)
    submitAnswer(val);
  };

  const handleTextAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAns = textAnswer.trim().toUpperCase();
    
    if (matchState?.currentRound === 'VCNV') {
      if (finalAns) {
        submitAnswer(finalAns);
        setIsSubmitted(true);
        setVcnvLastAnswer(finalAns);
        setTextAnswer('');
      } else {
        // Accidental 2nd Enter or empty submit -> Clear previous answer
        submitAnswer('');
        setIsSubmitted(false);
        setVcnvLastAnswer('');
        setTextAnswer('');
      }
    } else if (matchState?.currentRound === 'TANG_TOC') {
      if (finalAns) {
        submitAnswer(finalAns);
        setIsSubmitted(true);
        setTangTocLastAnswer(finalAns);
        setTextAnswer('');
      } else {
        submitAnswer('');
        setIsSubmitted(false);
        setTangTocLastAnswer('');
        setTextAnswer('');
      }
    } else {
      submitAnswer(finalAns);
      setIsSubmitted(Boolean(finalAns));
    }
  };

  // Reset answer when round or question changes
  useEffect(() => {
    setTextAnswer('');
    setIsSubmitted(false);
    setVcnvLastAnswer('');
    setTangTocLastAnswer('');
    if (matchState?.currentRound !== 'VCNV') {
      setHasBuzzedCNV(false);
      localStorage.removeItem('hasBuzzedCNV');
    }
  }, [matchState?.currentRound, matchState?.tang_toc?.currentQuestionIndex, matchState?.vcnv?.selectedRow]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setJoinError('Vui lòng nhập họ và tên của bạn!');
      return;
    }
    setJoinError('');

    const targetMatchCode = (matchCode || matchState?.matchCode || '').trim().toUpperCase();
    if (!targetMatchCode) {
      setJoinError('Vui lòng nhập Mã ID đề thi (6 chữ số)!');
      return;
    }
    const res = await joinGame(name.trim(), position, targetMatchCode);
    if (res.success) {
      setIsJoined(true);
    } else {
      setJoinError(res.error || 'Không thể tham gia phòng thi. Vị trí có thể đã có người khác chọn.');
    }
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl shadow-emerald-950/20"
        >
          <div className="flex flex-col items-center mb-6">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-3 text-emerald-400">
              <Zap className="w-8 h-8 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold font-sans tracking-tight text-center bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-400 bg-clip-text text-transparent uppercase">
              {matchState?.tournamentName || 'ĐƯỜNG LÊN ĐỈNH OLYMPIA'}
            </h1>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Họ và Tên Thí Sinh</label>
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập họ và tên đầy đủ của bạn..."
                maxLength={25}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Chọn Bàn Thi Đấu</label>
              <div className="grid grid-cols-4 gap-2">
                {([1, 2, 3, 4] as const).map((pos) => {
                  const p = matchState?.players[pos];
                  const isTaken = p && p.socketId !== null;

                  return (
                    <button
                      key={pos}
                      type="button"
                      disabled={isTaken}
                      onClick={() => setPosition(pos)}
                      className={`py-3 rounded-xl border text-sm font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
                        isTaken
                          ? 'bg-slate-950 border-red-950/40 text-slate-600 cursor-not-allowed opacity-60'
                          : position === pos
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/20 ring-1 ring-emerald-500/50'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <span>VỊ TRÍ {pos}</span>
                      {isTaken ? (
                        <span className="text-[9px] text-red-400 mt-0.5 font-bold">ĐÃ CÓ</span>
                      ) : (
                        <span className="text-[9px] text-emerald-500/80 mt-0.5 font-normal">Trống</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {joinError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{joinError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Play className="w-4 h-4 fill-current" />
              SẴN SÀNG THI ĐẤU (BÀN {position})
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              Máy chủ: {isConnected ? 'Đã kết nối trực tiếp' : 'Đang kết nối...'}
            </span>
            <span className="font-mono">Olympia Live Engine</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // Once authenticated & connected:
  const round: GameRound = matchState?.currentRound || 'WAITING';

  const buzzerState = matchState?.buzzerState || 'LOCKED';
  const isTimerRunning = matchState?.isTimerRunning || false;
  const isMyBuzzerWin = buzzerState === 'BUZZED' && matchState?.buzzedPlayer === position;

  // Find current active question if matchQuestions is loaded
  let activeQuestionText = '';
  let activeQuestionPoints = 0;
  let activeQuestionLinhVuc = '';
  let activeQuestionMedia: any = null;

  if (matchQuestions && matchState) {
    if (round === 'KHOI_DONG') {
      const kd = matchState.khoi_dong;
      const isIndividual = kd.subRound === 'INDIVIDUAL';
      const isPlayerSelected = kd.currentPlayerIndex !== null && kd.currentPlayerIndex !== undefined;
      const canShowQuestion = kd.isStarted && (isIndividual ? isPlayerSelected : true);

      if (!canShowQuestion) {
        activeQuestionText = isIndividual 
          ? (isPlayerSelected ? 'Vui lòng chờ bắt đầu' : 'Chuẩn bị Khởi động cá nhân') 
          : 'Chuẩn bị Khởi động chung';
        activeQuestionPoints = 0;
        activeQuestionLinhVuc = isIndividual 
          ? (isPlayerSelected ? `Cá nhân Thí sinh ${kd.currentPlayerIndex + 1}` : 'Chuẩn bị Khởi động') 
          : 'Khởi động chung';
      } else {
        const qIndex = kd.currentQuestionIndex ?? 0;
        const q = matchQuestions.khoi_dong?.cau_hoi?.[qIndex];
        if (q) {
          activeQuestionText = q.noi_dung;
          activeQuestionPoints = 10;
          activeQuestionLinhVuc = isIndividual ? `Cá nhân Thí sinh ${kd.currentPlayerIndex + 1}` : 'Vòng chung bấm chuông';
          activeQuestionMedia = q.media;
        }
      }
    } else if (round === 'VCNV') {
      const vcnv = matchState.vcnv;
      const selectedRowId = vcnv.selectedRow;
      if (selectedRowId && !vcnv.cnvSolved && !vcnv.rows[selectedRowId]?.isAnswered) {
        const questionItem = matchQuestions?.vuot_chuong_ngai_vat?.hang_ngang?.find(
          (h: any) => h.id === selectedRowId
        );
        if (questionItem) {
          activeQuestionText = questionItem.cau_hoi;
          activeQuestionPoints = 10;
          activeQuestionLinhVuc = selectedRowId === 5 ? 'VCNV: Trung tâm (Hàng 5)' : `VCNV: Hàng ngang số ${selectedRowId}`;
          activeQuestionMedia = questionItem.media;
        } else {
          activeQuestionText = 'Vui lòng chờ đợi';
        }
      } else {
        activeQuestionText = '';
      }
    } else if (round === 'VE_DICH') {
      const vd = matchState.ve_dich;
      const activePlayerPos = vd.currentPlayerIndex !== null ? (vd.currentPlayerIndex + 1) as 1 | 2 | 3 | 4 : null;
      if (activePlayerPos) {
        const turn = vd.turns[activePlayerPos];
        const currentChoice = turn?.chosenPackage?.[turn.currentQuestionIndex];
        if (currentChoice && matchQuestions.ve_dich?.cau_hoi) {
          let q = null;
          if (currentChoice.questionId) {
            q = matchQuestions.ve_dich.cau_hoi.find((x: any) => x.id === currentChoice.questionId);
          }
          if (!q) {
            const filtered = matchQuestions.ve_dich.cau_hoi.filter((q: any) => q.muc_diem === currentChoice.points);
            const targetIdx = ((activePlayerPos - 1) * 3 + turn.currentQuestionIndex) % filtered.length;
            q = filtered[targetIdx];
          }
          if (q) {
            activeQuestionText = q.noi_dung;
            activeQuestionPoints = q.muc_diem;
            activeQuestionLinhVuc = q.linh_vuc || 'Về Đích';
            activeQuestionMedia = q.media;
          }
        }
      }
    } else if (round === 'CH_PHU') {
      const chp = matchState.cau_hoi_phu;
      const q = matchQuestions.cau_hoi_phu?.cau_hoi?.[chp.currentQuestionIndex];
      if (q) {
        activeQuestionText = q.noi_dung;
        activeQuestionPoints = 0;
        activeQuestionLinhVuc = 'Câu hỏi phụ';
        activeQuestionMedia = q.media;
      }
    }
  }

  const renderPlayerRowCrossword = (rowId: number, length: number) => {
    const vcnv = matchState?.vcnv;
    if (!vcnv) return null;
    const rowObj = vcnv.rows[rowId];
    if (!rowObj) return null;
    const isSelected = vcnv.selectedRow === rowId;
    
    const questionItem = matchQuestions?.vuot_chuong_ngai_vat?.hang_ngang?.find(
      (h: any) => h.id === rowId
    );
    const correctAnsWord = questionItem?.dap_an?.replace(/\s+/g, '') || '';
    const wordLength = correctAnsWord.length || length;
    const letters = Array.from({ length: wordLength });

    const isIncorrectRow = rowObj.isAnswered && rowObj.isCorrect === false;
    const showValue = (rowObj.isAnswered && rowObj.isCorrect !== false) || vcnv.cnvSolved;

    return (
      <div className="flex gap-0.5 items-center justify-center flex-wrap">
        {letters.map((_, idx) => {
          let letterToShow = '';
          if (showValue) {
            letterToShow = correctAnsWord[idx] || '?';
          }

          return (
            <motion.div
              key={idx}
              initial={{ rotateX: 0 }}
              animate={{ rotateX: showValue ? 360 : 0 }}
              transition={{ duration: 0.6, delay: idx * 0.05 }}
              className={`w-6 h-6 sm:w-7 sm:h-7 border text-[10px] sm:text-xs font-black flex items-center justify-center rounded select-none transition-all ${
                showValue
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-teal-400 text-slate-950 font-sans'
                  : isIncorrectRow
                  ? 'bg-slate-900/40 border-slate-850/60 text-slate-700/30 opacity-40'
                  : isSelected
                  ? 'bg-teal-500/10 border-teal-500 text-teal-300 animate-pulse'
                  : 'bg-slate-950 border-slate-800 text-slate-600'
              }`}
            >
              {showValue ? letterToShow : isSelected ? '•' : ''}
            </motion.div>
          );
        })}
      </div>
    );
  };

  const maxContainerClass = 'max-w-[1400px]';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header Stat Board */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-30">
        <div className={`${maxContainerClass} w-full mx-auto flex items-center justify-between px-4 lg:px-6`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg">
              {position}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">
                {round === 'KHOI_DONG' && matchState?.khoi_dong?.isConfirmed && (
                  (matchState?.khoi_dong?.subRound === 'INDIVIDUAL'
                    ? matchState?.khoi_dong?.individualScoringMode
                    : matchState?.khoi_dong?.collectiveScoringMode) !== 'TRADITIONAL'
                )
                  ? `${myPlayer?.name || name} | ${matchState?.khoi_dong?.wrongCounts?.[position] ?? 0}`
                  : (myPlayer?.name || name)}
              </h2>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Bàn {position} {round === 'KHOI_DONG' && matchState?.khoi_dong?.disqualifiedPlayers?.includes(position) ? '(BỊ LOẠI)' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {round === 'KHOI_DONG' && matchState?.khoi_dong?.isConfirmed && (
              (matchState?.khoi_dong?.subRound === 'INDIVIDUAL'
                ? matchState?.khoi_dong?.individualScoringMode
                : matchState?.khoi_dong?.collectiveScoringMode) !== 'TRADITIONAL'
            ) && (
              <div className="hidden sm:flex items-center gap-2 text-[11px] bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-emerald-400 font-bold">Đúng: {matchState?.khoi_dong?.playerStats?.[position]?.correct ?? 0}</span>
                <span className="text-slate-600">|</span>
                <span className="text-rose-400 font-bold">Sai: {matchState?.khoi_dong?.playerStats?.[position]?.wrong ?? 0}</span>
                <span className="text-slate-600">|</span>
                <span className="text-amber-400 font-bold">Bỏ qua: {matchState?.khoi_dong?.playerStats?.[position]?.skip ?? 0}</span>
                <span className="text-slate-600">|</span>
                <span className="text-sky-400 font-bold">Tổng: {matchState?.khoi_dong?.playerStats?.[position]?.total ?? 0}</span>
              </div>
            )}
            <div className="bg-slate-950 px-4 py-1.5 rounded-lg border border-slate-800/80 flex flex-col items-center">
              <span className="text-[9px] text-slate-400 uppercase tracking-widest leading-none font-bold">Điểm số</span>
              <span className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                {matchState?.currentRound === 'JEOPARDY' && matchState?.jeopardy?.scoringMode === 'SEPARATE'
                  ? (matchState?.jeopardy?.separateScores?.[position] ?? 0)
                  : (myPlayer?.score ?? 0)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className={`flex-1 ${maxContainerClass} w-full mx-auto p-3 md:p-4 flex flex-col lg:flex-row gap-4 items-stretch justify-center`}>
        {/* Left Side: Interactive Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {errorMsg && (
            <div className="mb-3 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs flex items-center gap-2 justify-center">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 md:p-5 shadow-xl flex-1 flex flex-col justify-between min-h-[320px]">
            {/* Round Indicator Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-full text-slate-300 font-bold uppercase tracking-wider">
                  VÒNG: {round}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Mã: {matchState?.matchCode || 'WAITING'}
              </div>
            </div>

            {/* Interactive Core Panel depending on round state */}
            <div className="flex-1 flex flex-col items-center justify-center my-3 md:my-4">
            {round === 'WAITING' && (
              <div className="text-center space-y-3">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-full inline-block text-slate-500 animate-pulse">
                  <HelpCircle className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-bold text-slate-300">
                  {matchState?.tournamentName || 'Vui lòng chờ đợi'}
                </h3>
                <p className="text-xs text-slate-500">Đạo diễn đang chuẩn bị bắt đầu trận đấu...</p>
              </div>
            )}

            {/* BUZZER FOR KHOI DONG */}
            {round === 'KHOI_DONG' && (() => {
              const kd = matchState?.khoi_dong;
              const isStarted = kd?.isStarted;
              const isIndividual = kd?.subRound === 'INDIVIDUAL';
              const isPlayerSelected = kd?.currentPlayerIndex !== null && kd?.currentPlayerIndex !== undefined;
              const isMyTurn = !isIndividual || (isPlayerSelected && (kd?.currentPlayerIndex + 1) === position);
              const canShowQuestion = isStarted && (isIndividual ? isPlayerSelected : true);

              if (!kd?.isConfirmed) {
                const customSetting = matchState?.roundCustomSettings?.['KHOI_DONG'];
                const customRoundLogo = customSetting?.customLogoUrl || customSetting?.logoUrl;
                const roundName = customSetting?.customName?.trim() || 'KHỞI ĐỘNG';

                return (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-5 my-auto" id="player-khoi-dong-unselected">
                    {customRoundLogo && customRoundLogo !== 'none' && (
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-950 border-2 border-emerald-500/40 p-3 shadow-xl flex items-center justify-center">
                        <RoundLogoRenderer logoIdOrUrl={customRoundLogo} className="w-full h-full object-contain drop-shadow" />
                      </div>
                    )}
                    <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-white to-teal-300 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                      {roundName}
                    </h2>
                  </div>
                );
              }

              if (kd?.isPrepRunning) {
                return (
                  <div className="flex-1 flex items-center justify-center py-12">
                    <motion.div
                      key={kd.prepCountdown ?? 3}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1.3, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="text-9xl font-black font-mono text-emerald-400 drop-shadow-[0_0_35px_rgba(16,185,129,0.8)]"
                    >
                      {kd.prepCountdown ?? 3}
                    </motion.div>
                  </div>
                );
              }

              if (!canShowQuestion) {
                return (
                  <div className="text-center space-y-4 py-8">
                    <div className="p-4 bg-slate-950 border border-slate-850 rounded-full inline-flex items-center justify-center text-slate-500 animate-pulse">
                      <HelpCircle className="w-12 h-12" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-300">
                      {isIndividual && !isPlayerSelected ? 'Chuẩn bị Khởi động cá nhân' : 'Vui lòng chờ bắt đầu lượt thi'}
                    </h3>
                  </div>
                );
              }

              return (
                <div className="w-full space-y-6 flex flex-col items-center animate-fade-in">
                  {activeQuestionText && (
                    <div className="w-full min-h-[220px] md:min-h-[260px] h-[220px] md:h-[260px] bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-inner relative overflow-hidden flex flex-col justify-between items-center">
                      <div className="absolute top-0 left-0 bg-teal-500 text-slate-950 font-extrabold text-[10px] px-3 py-1 rounded-br uppercase tracking-wider z-10">
                        {activeQuestionLinhVuc}
                      </div>
                      {activeQuestionPoints > 0 && (
                        <div className="absolute top-0 right-0 bg-indigo-500 text-white font-mono font-black text-[10px] px-3 py-1 rounded-bl z-10">
                          {activeQuestionPoints} ĐIỂM
                        </div>
                      )}

                      {/* Centered Question Content Frame */}
                      <div className="w-full flex-1 flex items-center justify-center my-auto px-2">
                        {activeQuestionMedia?.url ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-center">
                            <div className="flex flex-col w-full h-full justify-center">
                              <UniversalMediaPlayer 
                                media={activeQuestionMedia} 
                                mediaControl={matchState?.mediaControl} 
                                largeMode={true}
                                round="KHOI_DONG"
                                isTimerRunning={matchState?.isTimerRunning}
                                hideControls={true}
                                className="w-full h-36 md:h-48 object-contain rounded-xl"
                              />
                            </div>
                            <p className="text-base md:text-lg lg:text-xl font-black text-slate-100 leading-relaxed text-center px-2">
                              {activeQuestionText}
                            </p>
                          </div>
                        ) : (
                          <p className="text-base md:text-xl lg:text-2xl font-black text-slate-100 leading-relaxed text-center w-full">
                            {activeQuestionText}
                          </p>
                        )}
                      </div>

                      {/* 3s Large Number Countdown Badge at Bottom-Right */}
                      {(kd?.threeSecCountdown ?? 0) > 0 && (
                        <div className="absolute bottom-4 right-5 bg-amber-500/30 border-2 border-amber-400 text-amber-300 font-mono font-black text-2xl md:text-3xl px-4 py-1.5 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center animate-pulse z-30 pointer-events-none min-w-[52px]">
                          {kd.threeSecCountdown}
                        </div>
                      )}

                      {/* Smooth Timer Bar for Player View - Anchored at Absolute Bottom */}
                      {isTimerRunning && (
                        <SmoothTimerBar
                          seconds={matchState?.timerSeconds ?? 0}
                          total={matchState?.timerTotal || (kd?.subRound === 'INDIVIDUAL' ? (kd?.individualTimerDuration || 60) : (kd?.collectiveTimerDuration || 60))}
                          isRunning={isTimerRunning}
                          className="absolute bottom-0 left-0 right-0 border-t border-slate-800/80 z-30"
                          heightClass="h-2.5"
                        />
                      )}
                    </div>
                  )}

                  {/* Visual Cue of Buzzer Status */}
                  <div className="text-center pt-2">
                    {!isMyTurn ? (
                      <span className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold uppercase tracking-wider px-4 py-1.5 rounded-full inline-block">
                        👀 LƯỢT THI CỦA THÍ SINH {kd?.currentPlayerIndex + 1}
                      </span>
                    ) : buzzerState === 'OPEN' ? (
                      <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider px-4 py-1.5 rounded-full inline-block">
                        🔓 CHUÔNG ĐANG MỞ
                      </span>
                    ) : buzzerState === 'LOCKED' ? (
                      <span className="text-xs bg-slate-800 border border-slate-700 text-slate-400 font-bold uppercase tracking-wider px-4 py-1.5 rounded-full inline-block">
                        🔒 CHUÔNG ĐANG KHÓA
                      </span>
                    ) : buzzerState === 'BUZZED' ? (
                      <span className={`text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full inline-block ${
                        isMyBuzzerWin 
                          ? 'bg-red-500/10 border border-red-500/20 text-red-400' 
                          : 'bg-slate-800 border border-slate-700 text-slate-400'
                      }`}>
                        {isMyBuzzerWin ? '🔔 BẠN ĐÃ BẤM CHUÔNG' : `⚠️ THÍ SINH BÀN ${matchState?.buzzedPlayer} ĐÃ BẤM CHUÔNG`}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })()}

            {/* SUMMARY SCOREBOARD FOR PLAYER */}
            {round === 'SUMMARY' && matchState && (
              <SummaryPlayerView matchState={matchState} position={position} />
            )}

            {/* JEOPARDY SPECIFIC VIEW */}
            {round === 'JEOPARDY' && matchState && (
              <JeopardyView
                matchState={matchState}
                userRole="PLAYER"
                playerPosition={position}
                socket={socket}
              />
            )}

            {/* MA TRAN KEP SPECIFIC VIEW */}
            {round === 'MA_TRAN_KEP' && matchState && (
              <MaTranKepPlayerView
                matchState={matchState}
                position={position}
                socket={socket}
              />
            )}

            {/* CHINH PHUC SPECIFIC VIEW */}
            {round === 'CHINH_PHUC' && matchState && (
              <ChinhPhucPlayerView
                matchState={matchState}
                socket={socket}
                playerPosition={position}
              />
            )}

            {/* DAU TRI SPECIFIC VIEW */}
            {round === 'DAU_TRI' && matchState && (
              <DauTriPlayerView
                state={matchState}
                questions={matchQuestions}
                playerPosition={position}
                emitSocket={(evt, data) => socket?.emit(evt, data)}
              />
            )}

            {/* CAU HOI PHU SPECIFIC VIEW */}
            {round === 'CH_PHU' && (() => {
              const chp = matchState?.cau_hoi_phu;
              const confirmed = chp?.confirmedPlayers || [];
              const isParticipating = confirmed.includes(position);
              
              if (!isParticipating) {
                return (
                  <div className="w-full max-w-md text-center space-y-6 py-6 animate-fade-in">
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-full inline-flex items-center justify-center text-slate-500 animate-pulse">
                      <Users className="w-12 h-12 text-slate-600" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-md font-bold text-slate-300">Vui lòng chờ đợi</h3>
                    </div>

                    <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2 text-left">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Các thí sinh thi đấu:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {confirmed.map(pos => {
                          const playerObj = matchState.players[pos as 1 | 2 | 3 | 4];
                          const name = playerObj?.name || `Bàn ${pos}`;
                          const isFoul = chp?.foulPlayers?.includes(pos);
                          const isIncorrect = chp?.incorrectPlayers?.includes(pos);
                          const isBuzzed = matchState.buzzerState === 'BUZZED' && matchState.buzzedPlayer === pos;
                          const isTurn = chp?.ruleMode === 'SHOOTOUT' && chp?.currentTurnPlayer === pos;
                          
                          return (
                            <div
                              key={pos}
                              className={`p-2.5 border rounded-lg text-xs flex items-center justify-between gap-2 ${
                                isTurn
                                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold animate-pulse'
                                  : isBuzzed
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold animate-pulse'
                                  : isFoul
                                  ? 'bg-red-500/10 border-red-500/20 text-red-400 font-semibold'
                                  : isIncorrect
                                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 font-semibold'
                                  : 'bg-slate-900 border-slate-850 text-slate-300'
                              }`}
                            >
                              <span className="truncate font-bold">{name}</span>
                              {chp?.ruleMode === 'SHOOTOUT' ? (
                                <div className="ml-auto flex-shrink-0">
                                  <ShootoutScoreDots
                                    history={chp?.history?.[pos]}
                                    isCurrentTurn={isTurn}
                                    size="md"
                                  />
                                </div>
                              ) : chp?.ruleMode === 'IMPROVED' ? (
                                <div className="ml-auto flex-shrink-0">
                                  <ImprovedScoreDots
                                    score={chp?.scores?.[pos]}
                                    totalTime={chp?.totalTime?.[pos]}
                                    size="sm"
                                  />
                                </div>
                              ) : isBuzzed ? (
                                <span className="text-[8px] bg-emerald-500/20 px-1 py-0.5 rounded font-black">RENG!</span>
                              ) : isFoul ? (
                                <span className="text-[8px] bg-red-500/20 px-1 py-0.5 rounded font-black">FẠM QUY</span>
                              ) : isIncorrect ? (
                                <span className="text-[8px] bg-amber-500/20 px-1 py-0.5 rounded font-black">SAI</span>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }

              const isFoul = chp?.foulPlayers?.includes(position);
              const isIncorrect = chp?.incorrectPlayers?.includes(position);
              
              return (
                <div className="w-full space-y-4 flex flex-col items-center animate-fade-in">
                  {confirmed.length > 0 && (chp?.ruleMode === 'SHOOTOUT' || chp?.ruleMode === 'IMPROVED') && (
                    <div className="w-full p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5 text-left">
                      <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider block">
                        {chp?.ruleMode === 'SHOOTOUT' ? 'Bảng Điểm Luân Lưu Thí Sinh:' : 'Bảng Điểm Chạm 5 Thí Sinh:'}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {confirmed.map(pos => {
                          const playerObj = matchState.players[pos as 1 | 2 | 3 | 4];
                          const name = playerObj?.name || `Bàn ${pos}`;
                          const isTurn = chp?.ruleMode === 'SHOOTOUT' && chp?.currentTurnPlayer === pos;
                          
                          return (
                            <div
                              key={pos}
                              className={`p-2 px-3 border rounded-lg text-xs flex items-center justify-between gap-2 ${
                                isTurn
                                  ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold ring-1 ring-amber-400/50'
                                  : 'bg-slate-900 border-slate-800 text-slate-300'
                              }`}
                            >
                              <span className="truncate font-bold">{name}</span>
                              <div className="ml-auto flex-shrink-0">
                                {chp?.ruleMode === 'SHOOTOUT' ? (
                                  <ShootoutScoreDots
                                    history={chp?.history?.[pos]}
                                    isCurrentTurn={isTurn}
                                    size="md"
                                  />
                                ) : (
                                  <ImprovedScoreDots
                                    score={chp?.scores?.[pos]}
                                    totalTime={chp?.totalTime?.[pos]}
                                    size="sm"
                                  />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {chp?.questionRevealed && activeQuestionText ? (
                    <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center shadow-inner relative overflow-visible">
                      <BorderTimer 
                        seconds={matchState.timerSeconds} 
                        total={matchState.timerTotal || (chp?.ruleMode === 'SHOOTOUT' ? 10 : 15)} 
                        isRunning={isTimerRunning} 
                      />
                      <p className="text-base md:text-lg lg:text-xl font-bold text-slate-100 leading-relaxed mt-4 px-2">
                        {activeQuestionText}
                      </p>
                      {activeQuestionMedia?.url && (
                        <div className="w-full flex justify-center py-2 mt-2">
                          <UniversalMediaPlayer 
                            media={activeQuestionMedia} 
                            mediaControl={matchState?.mediaControl} 
                            largeMode={true}
                            round="CH_PHU"
                            isTimerRunning={matchState?.isTimerRunning}
                            hideControls={true}
                            className="max-h-[240px] w-auto max-w-full object-contain rounded-xl border border-slate-800"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full p-6 bg-slate-950 border border-slate-850 rounded-2xl text-center space-y-2 animate-pulse">
                      <h3 className="text-lg font-bold text-slate-300">Vui lòng chờ đợi</h3>
                    </div>
                  )}

                  <div className="text-center pt-2">
                    {isFoul ? (
                      <span className="text-xs bg-red-500/15 border border-red-500/20 text-red-400 font-black uppercase tracking-wider px-4 py-1.5 rounded-full inline-block animate-pulse">
                        ⚠️ PHẠM QUY (BẤM TRƯỚC GIỜ)
                      </span>
                    ) : isIncorrect ? (
                      <span className="text-xs bg-amber-500/15 border border-amber-500/20 text-amber-400 font-black uppercase tracking-wider px-4 py-1.5 rounded-full inline-block">
                        ❌ SAI (BỊ KHÓA CHUÔNG)
                      </span>
                    ) : buzzerState === 'OPEN' ? (
                      <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider px-4 py-1.5 rounded-full inline-block">
                        🔓 CHUÔNG ĐANG MỞ
                      </span>
                    ) : buzzerState === 'LOCKED' ? (
                      <span className="text-xs bg-slate-800 border border-slate-700 text-slate-400 font-bold uppercase tracking-wider px-4 py-1.5 rounded-full inline-block">
                        🔒 CHUÔNG ĐANG KHÓA
                      </span>
                    ) : buzzerState === 'BUZZED' ? (
                      <span className={`text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full inline-block ${
                        isMyBuzzerWin 
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                          : 'bg-slate-800 border border-slate-700 text-slate-400'
                      }`}>
                        {isMyBuzzerWin ? '🔔 BẠN ĐÃ BẤM CHUÔNG' : `⚠️ THÍ SINH BÀN ${matchState?.buzzedPlayer} ĐÃ BẤM CHUÔNG`}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })()}

            {/* VE DICH ROUND SPECIFIC VIEW */}
            {round === 'VE_DICH' && (() => {
              const vd = matchState?.ve_dich;
              const activeIndex = vd?.currentPlayerIndex;
              const activePosition = activeIndex !== null && activeIndex !== undefined ? (activeIndex + 1) as 1 | 2 | 3 | 4 : null;
              const activeTurn = activePosition ? vd?.turns?.[activePosition] : null;

              if (!activePosition || !activeTurn) {
                return (
                  <div className="text-center space-y-4 py-8">
                    <div className="p-4 bg-slate-950 border border-slate-850 rounded-full inline-flex items-center justify-center text-slate-500 animate-pulse">
                      <Award className="w-12 h-12 text-slate-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-300">Vui lòng chờ đợi</h3>
                  </div>
                );
              }

              const draft = activeTurn.draftPackage || [null, null, null];
              const isMe = position === activePosition;
              const activePlayerObj = matchState.players[activePosition];

              return (
                <div className="w-full space-y-6 flex flex-col items-center animate-fade-in">
                  <div className="text-center space-y-1 relative">
                    {vd?.practiceTimer?.isRunning && (
                      <div className="mb-2 inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                        <Clock className="w-3.5 h-3.5" />
                        <span>CHẾ ĐỘ THỰC HÀNH ({vd.practiceTimer.timerType === 'MAIN' ? 'THI CHÍNH' : 'TRANH CHUÔNG'}): {vd.practiceTimer.secondsLeft}s</span>
                      </div>
                    )}
                    <br />
                    <span className="text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-1.5 rounded-full font-bold uppercase tracking-wider inline-block">
                      LƯỢT THI CỦA: {isMe ? 'BẠN' : activePlayerObj?.name?.toUpperCase() || `THÍ SINH BÀN ${activePosition}`}
                    </span>
                  </div>

                  {!activeTurn.packageConfirmed ? (
                    !activeTurn.showPackageBoard ? (
                      <div className="w-full bg-slate-950 border border-slate-800 p-8 rounded-2xl space-y-3 text-center animate-fade-in">
                        <div className="w-12 h-12 bg-teal-500/10 border border-teal-500/20 rounded-full flex items-center justify-center mx-auto text-teal-400">
                          <Trophy className="w-6 h-6 animate-pulse" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                          {isMe ? 'Chuẩn bị bước vào phần thi Về đích' : `Thí sinh ${activePlayerObj?.name || activePosition} chuẩn bị`}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Vui lòng chờ ban tổ chức mở bảng chọn gói điểm...
                        </p>
                      </div>
                    ) : (
                      <div className="w-full bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4 text-center">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <h4 className="text-xs font-bold text-teal-400 uppercase tracking-widest">
                            BẢNG LỰA CHỌN GÓI ĐIỂM ({vd?.ruleMode === 'O19' ? 'LUẬT O19' : 'LUẬT O20+'})
                          </h4>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {vd?.ruleMode === 'O19' ? 'Gói điểm có sẵn' : `${draft.length} câu hỏi`}
                          </span>
                        </div>

                        {vd?.ruleMode === 'O19' ? (
                          /* O19 BOARD */
                          <div
                            className="grid gap-3 max-w-2xl mx-auto w-full"
                            style={{ gridTemplateColumns: `repeat(${(vd?.o19PresetPackages || []).length || 4}, minmax(0, 1fr))` }}
                          >
                            {(vd?.o19PresetPackages || []).map((pkg) => (
                              <div
                                key={pkg.id}
                                className="p-4 bg-slate-900 border border-indigo-500/30 rounded-2xl text-center flex flex-col items-center justify-center shadow-lg"
                              >
                                <div className="text-2xl md:text-3xl font-black text-amber-400 font-mono">{pkg.totalPoints}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          /* O20+ DYNAMIC 1-ROW GRID (N columns = draft.length) */
                          <div
                            className="grid gap-3 max-w-2xl mx-auto w-full"
                            style={{ gridTemplateColumns: `repeat(${draft.length}, minmax(0, 1fr))` }}
                          >
                            {Array.from({ length: draft.length }).map((_, colIdx) => {
                              const pts = draft[colIdx];
                              return (
                                <div key={colIdx} className="space-y-2 text-center">
                                  <span className="text-[11px] font-extrabold text-slate-400 uppercase block">
                                    Câu {colIdx + 1}
                                  </span>
                                  {/* Central Question Box showing ? or score */}
                                  <div
                                    className={`py-4 md:py-6 rounded-2xl border-2 font-mono font-black text-2xl md:text-3xl flex flex-col items-center justify-center transition-all ${
                                      pts === null || pts === undefined
                                        ? 'bg-slate-950/80 border-slate-800 text-slate-500 shadow-inner'
                                        : pts === 10
                                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/20 scale-105'
                                        : pts === 20
                                        ? 'bg-teal-500/20 border-teal-400 text-teal-300 shadow-lg shadow-teal-500/20 scale-105'
                                        : pts === 30
                                        ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 shadow-lg shadow-indigo-500/20 scale-105'
                                        : 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-lg shadow-purple-500/20 scale-105'
                                    }`}
                                  >
                                    <span>{pts === null || pts === undefined ? '?' : `${pts}đ`}</span>
                                  </div>

                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    <div className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-6 md:p-8 text-center shadow-2xl relative overflow-visible flex flex-col items-center justify-between min-h-[320px] animate-fade-in">
                      <BorderTimer seconds={matchState?.timerSeconds ?? 0} total={matchState?.timerTotal || 15} isRunning={!!isTimerRunning} />
                      {!activeTurn.currentQuestionConfirmed ? (
                        <div className="my-auto text-center space-y-3 py-10">
                          <div className="text-4xl animate-bounce">⭐️</div>
                          <h4 className="text-base font-bold text-slate-300">
                            Vui lòng chờ ban tổ chức xác nhận câu hỏi
                          </h4>
                        </div>
                      ) : (
                        <>
                          {/* Badges */}
                          <div className="w-full flex justify-between items-center mb-2 z-10">
                            <span className="bg-teal-500/20 border border-teal-500/30 text-teal-300 font-extrabold text-[10px] md:text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                              {activeQuestionLinhVuc || 'VỀ ĐÍCH'}
                            </span>
                            <div className="flex items-center gap-2">
                              {activeTurn.starUsed && (
                                <span className="bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 font-bold text-[10px] md:text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                                  <Star className="w-3.5 h-3.5 fill-current text-yellow-400" /> Ngôi sao hy vọng
                                </span>
                              )}
                              <span className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-mono font-black text-[10px] md:text-xs px-3 py-1 rounded-full">
                                {activeQuestionPoints} ĐIỂM
                              </span>
                            </div>
                          </div>

                          {activeQuestionMedia?.url && (
                            <div className="my-2 w-full flex justify-center z-10">
                              <UniversalMediaPlayer 
                                media={activeQuestionMedia} 
                                mediaControl={matchState?.mediaControl} 
                                largeMode={true}
                                round="VE_DICH"
                                isTimerRunning={matchState?.isTimerRunning}
                                hideControls={true}
                                className="max-h-[260px] w-auto max-w-full object-contain rounded-xl border border-slate-800"
                              />
                            </div>
                          )}

                          {(() => {
                            const textLen = (activeQuestionText || '').length;
                            let fontSizeClass = 'text-sm md:text-lg lg:text-xl';
                            if (textLen > 250) fontSizeClass = 'text-[11px] md:text-xs lg:text-sm';
                            else if (textLen > 180) fontSizeClass = 'text-xs md:text-sm lg:text-base';
                            else if (textLen > 120) fontSizeClass = 'text-xs md:text-base lg:text-lg';
                            else if (textLen > 60) fontSizeClass = 'text-sm md:text-lg lg:text-xl';

                            return (
                              <p className={`${fontSizeClass} font-black text-white leading-relaxed px-2 text-center w-full my-auto py-2 z-10`}>
                                {activeQuestionText}
                              </p>
                            );
                          })()}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* VCNV VIEW */}
            {round === 'VCNV' && (
              !matchState?.vcnv?.showRows ? (
                <div className="w-full py-16 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-3xl text-amber-400 shadow-xl shadow-amber-500/10">
                    <span className="text-5xl block">🧩</span>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-amber-300">
                      VƯỢT CHƯỚNG NGẠI VẬT
                    </h2>
                  </div>
                </div>
              ) : (
                <div className="w-full space-y-6 flex flex-col items-stretch">
                {/* TOP ROW: Image on Left, Crossword Rows on Right */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-stretch">
                  {/* Top-Left: Image & Segments */}
                  <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3 justify-between">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">Hình Ảnh Chướng Ngại Vật</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        {(() => {
                          const text = matchQuestions?.vuot_chuong_ngai_vat?.tu_khoa_chinh || '';
                          const classification = getObstacleClassification(text);
                          return `${classification.count} ${classification.label}`;
                        })()}
                      </span>
                    </div>

                    <div className="aspect-video bg-slate-950 border border-slate-800 rounded-xl overflow-hidden relative shadow-inner">
                      {matchQuestions?.vuot_chuong_ngai_vat?.anh_goc_url ? (
                        <img
                          src={matchQuestions.vuot_chuong_ngai_vat.anh_goc_url}
                          alt="Chướng Ngại Vật"
                          referrerPolicy="no-referrer"
                          className="absolute inset-0 w-full h-full object-cover z-0"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-slate-950 flex items-center justify-center text-[10px] text-slate-600">
                          Đang tải ảnh chướng ngại vật...
                        </div>
                      )}

                      {/* Puzzle Segment Overlay */}
                      {matchState?.vcnv && !matchState.vcnv.cnvSolved && (() => {
                        const vcnv = matchState.vcnv;
                        const is8Rows = (vcnv.soHangNgang || 8) === 8;
                        if (is8Rows) {
                          return (
                            <div className="absolute inset-0 z-10 pointer-events-none">
                              {[1, 2, 3, 4, 5, 6, 7, 8].map((seg) => {
                                const col = (seg - 1) % 4;
                                const row = Math.floor((seg - 1) / 4);
                                return (
                                  <AnimatePresence key={seg}>
                                    {!vcnv.revealedSegments.includes(seg) && (
                                      <motion.div
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.8 }}
                                        style={{
                                          left: `${col * 25}%`,
                                          top: `${row * 50}%`,
                                          width: '25%',
                                          height: '50%',
                                        }}
                                        className="absolute bg-slate-950 border border-slate-800 flex items-center justify-center p-1 pointer-events-auto"
                                      >
                                        <span className="text-amber-400 font-black text-sm md:text-base font-mono">{seg}</span>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                );
                              })}
                            </div>
                          );
                        }

                        return (
                          <div className="absolute inset-0 z-10 pointer-events-none">
                            {/* Corner Segment 1 */}
                            <AnimatePresence>
                              {!vcnv.revealedSegments.includes(1) && (
                                <motion.div
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  transition={{ duration: 0.8 }}
                                  style={{ clipPath: 'polygon(0% 0%, 50% 0%, 50% 25%, 25% 25%, 25% 50%, 0% 50%)' }}
                                  className="absolute inset-0 bg-slate-950 flex items-start justify-start p-2 pointer-events-auto border-r border-b border-slate-800"
                                >
                                  <span className="text-amber-400 font-black text-xl font-mono leading-none">1</span>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Corner Segment 2 */}
                            <AnimatePresence>
                              {!vcnv.revealedSegments.includes(2) && (
                                <motion.div
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  transition={{ duration: 0.8 }}
                                  style={{ clipPath: 'polygon(50% 0%, 100% 0%, 100% 50%, 75% 50%, 75% 25%, 50% 25%)' }}
                                  className="absolute inset-0 bg-slate-950 flex items-start justify-end p-2 pointer-events-auto border-l border-b border-slate-800"
                                >
                                  <span className="text-amber-400 font-black text-xl font-mono leading-none">2</span>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Corner Segment 3 */}
                            <AnimatePresence>
                              {!vcnv.revealedSegments.includes(3) && (
                                <motion.div
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  transition={{ duration: 0.8 }}
                                  style={{ clipPath: 'polygon(0% 50%, 25% 50%, 25% 75%, 50% 75%, 50% 100%, 0% 100%)' }}
                                  className="absolute inset-0 bg-slate-950 flex items-end justify-start p-2 pointer-events-auto border-r border-t border-slate-800"
                                >
                                  <span className="text-amber-400 font-black text-xl font-mono leading-none">3</span>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Corner Segment 4 */}
                            <AnimatePresence>
                              {!vcnv.revealedSegments.includes(4) && (
                                <motion.div
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  transition={{ duration: 0.8 }}
                                  style={{ clipPath: 'polygon(75% 50%, 100% 50%, 100% 100%, 50% 100%, 50% 75%, 75% 75%)' }}
                                  className="absolute inset-0 bg-slate-950 flex items-end justify-end p-2 pointer-events-auto border-l border-t border-slate-800"
                                >
                                  <span className="text-amber-400 font-black text-xl font-mono leading-none">4</span>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Center Segment 5 */}
                            <AnimatePresence>
                              {!vcnv.revealedSegments.includes(5) && (
                                <motion.div
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  transition={{ duration: 0.8 }}
                                  className="absolute left-[25%] top-[25%] w-[50%] h-[50%] bg-gradient-to-br from-orange-500 to-amber-600 border-2 border-orange-400/80 shadow-lg pointer-events-auto flex items-center justify-center text-teal-300 font-black text-2xl font-mono"
                                >
                                  5
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Top-Right: Crossword Rows */}
                  <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3 justify-between">
                    <div className="border-b border-slate-800 pb-2">
                      <span className="text-[10px] font-bold tracking-widest text-teal-400 uppercase">Các Hàng Ngang</span>
                    </div>

                    <div className="space-y-1.5 flex-1 flex flex-col justify-center">
                      {(() => {
                        const vcnv = matchState?.vcnv;
                        const is8Rows = (vcnv?.soHangNgang || 8) === 8;
                        const rowIdsToRender = is8Rows 
                          ? ([1, 2, 3, 4, 5, 6, 7, 8] as const)
                          : ([1, 2, 3, 4, 5] as const).filter((id) => id !== 5 || vcnv?.selectedRow === 5 || vcnv?.rows[5]?.isAnswered);

                        return rowIdsToRender.map((id) => {
                          if (!vcnv) return null;
                          const row = vcnv.rows[id];
                          const length = 10;
                          const isIncorrect = row?.isAnswered && row?.isCorrect === false;

                          return (
                            <div key={id} className="flex items-center gap-2">
                              <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded font-bold text-[10px] flex items-center justify-center shrink-0 border transition-all ${
                                vcnv.selectedRow === id
                                  ? 'bg-teal-500 text-slate-950 border-teal-400'
                                  : isIncorrect
                                  ? 'bg-slate-900/60 border-slate-800 text-slate-600 opacity-40 line-through'
                                  : row?.isAnswered
                                  ? 'bg-emerald-600/20 border-emerald-700 text-emerald-400'
                                  : 'bg-slate-950 border-slate-900 text-slate-400'
                              }`}>
                                {id}
                              </div>
                              <div className="flex-1 overflow-x-auto py-0.5 scrollbar-thin">
                                {renderPlayerRowCrossword(id, length)}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>

                {/* MIDDLE-BOTTOM: Question Text Spanning Full Width */}
                {activeQuestionText && (
                  <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center shadow-inner relative overflow-hidden space-y-3">
                    <div className="absolute top-0 left-0 bg-teal-500 text-slate-950 font-extrabold text-[9px] px-3 py-0.5 rounded-br uppercase tracking-wider">
                      {activeQuestionLinhVuc}
                    </div>
                    {activeQuestionPoints > 0 && (
                      <div className="absolute top-0 right-0 bg-indigo-500 text-white font-mono font-black text-[9px] px-3 py-0.5 rounded-bl">
                        {activeQuestionPoints} ĐIỂM
                      </div>
                    )}
                    <p className="text-base md:text-lg lg:text-xl font-bold text-slate-100 leading-relaxed mt-4 px-2 text-center w-full">
                      {activeQuestionText}
                    </p>

                    {activeQuestionMedia?.url && (
                      <div className="w-full flex justify-center py-2">
                        <UniversalMediaPlayer 
                          media={activeQuestionMedia} 
                          mediaControl={matchState?.mediaControl} 
                          largeMode={true}
                          round="VCNV"
                          isTimerRunning={matchState?.isTimerRunning}
                          hideControls={true}
                          className="max-h-[240px] w-auto max-w-full object-contain rounded-xl border border-slate-800"
                        />
                      </div>
                    )}

                    {/* Timer Bar below question */}
                    {(isTimerRunning || round === 'VCNV') && (() => {
                      const totalSecs = matchState.timerTotal || 15;
                      const displaySecs = isTimerRunning ? matchState.timerSeconds : (matchState.timerSeconds > 0 ? matchState.timerSeconds : totalSecs);
                      const countUpPercent = Math.min(100, Math.max(0, ((totalSecs - displaySecs) / totalSecs) * 100));
                      return (
                        <div className="pt-2 text-left w-full">
                          <div className="w-full h-2 bg-slate-900 rounded-full overflow-visible border border-slate-800 relative">
                            <motion.div
                              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full relative"
                              style={{ width: `${countUpPercent}%` }}
                              animate={{ width: `${countUpPercent}%` }}
                              transition={{ duration: 0.1, ease: "linear" }}
                            >
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_8px_#fff,0_0_12px_#10b981] z-20" />
                            </motion.div>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-1">
                            <span>0s</span>
                            <span className="text-teal-400 font-bold">{displaySecs}s</span>
                            <span>{totalSecs}s</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Bottom: Answer Input Form & Recent Submitted Answer */}
                <div className="w-full space-y-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5">
                  <form onSubmit={handleTextAnswerSubmit} className="space-y-3 w-full">
                    <div className="relative w-full">
                      <input
                        type="text"
                        value={textAnswer}
                        onChange={handleTextAnswerChange}
                        disabled={!isTimerRunning}
                        placeholder={isTimerRunning ? "Nhập câu trả lời cho hàng ngang..." : "Hết giờ nhập..."}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3.5 text-base text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-mono tracking-wider text-center uppercase"
                      />
                      {isTimerRunning && (
                        <span className="absolute right-3 top-3.5 text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-bold uppercase">
                          ĐANG MỞ
                        </span>
                      )}
                    </div>
                  </form>

                  {/* Display Most Recent Submitted Answer Centered */}
                  {vcnvLastAnswer && (
                    <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl text-center">
                      <strong className="text-lg md:text-xl font-black text-amber-300 font-mono tracking-wider uppercase block">
                        "{vcnvLastAnswer}"
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            )
          )}

            {/* TANG TOC VIEW */}
            {round === 'TANG_TOC' && (() => {
              const currentQIndex = matchState?.tang_toc?.currentQuestionIndex ?? -1;
              const tangToc = matchState?.tang_toc;
              const mode = tangToc?.mode || 'TRADITIONAL';

              const questionItem = matchQuestions?.tang_toc?.cau_hoi?.[currentQIndex];
              const caiTienQuestionItem = matchQuestions?.tang_toc?.cai_tien_cau_hoi?.[currentQIndex];

              if (currentQIndex < 0) {
                return (
                  <div className="w-full p-8 text-center space-y-6 bg-slate-950/40 border border-slate-800/80 rounded-2xl flex flex-col items-center">
                    <div className="w-16 h-16 bg-indigo-500/10 border-2 border-indigo-500/40 rounded-2xl flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10 animate-pulse">
                      <Zap className="w-8 h-8 stroke-[1.5]" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-xl font-black text-white uppercase tracking-tight font-sans">VÒNG TĂNG TỐC</h2>
                      {mode === 'IMPROVED' && (
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 font-bold text-xs rounded-full uppercase tracking-wider inline-block">
                          CHẾ ĐỘ CẢI TIẾN
                        </span>
                      )}
                    </div>
                  </div>
                );
              }

              if (mode === 'IMPROVED' && caiTienQuestionItem) {
                const buzzedPos = matchState?.buzzedPlayer || tangToc?.buzzedPlayer;
                const isMyBuzzed = buzzedPos === position;
                const isBlocked = tangToc?.blockedPlayers?.includes(position);
                const isOtherBuzzed = buzzedPos && !isMyBuzzed;
                const totalDuration = caiTienQuestionItem.loai_cau_hoi === 4 ? 40 : 30;

                return (
                  <div className="w-full space-y-5 flex flex-col items-center animate-fade-in">
                    {/* Question Box (Header tag removed, unified purple styling) */}
                    <div className="w-full bg-slate-900/90 border border-purple-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800/80">
                        <span className="text-xs font-bold text-purple-300 tracking-wider">
                          CÂU HỎI <strong className="text-white font-black">{currentQIndex + 1}</strong> / 4 ({caiTienQuestionItem.loai_cau_hoi} GỢI Ý)
                        </span>
                      </div>
                      <p className="text-base md:text-lg lg:text-xl font-bold text-white leading-relaxed text-center px-2">
                        {caiTienQuestionItem.noi_dung || 'Nội dung câu hỏi Tăng Tốc Cải Tiến'}
                      </p>
                    </div>

                    {/* Hints list */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {caiTienQuestionItem.goi_y?.map((g, hIdx) => {
                        const currentHintIdx = tangToc?.currentHintIndex ?? 0;
                        const isRevealed = (hIdx <= currentHintIdx && (isTimerRunning || currentHintIdx > 0)) || !!tangToc?.showExplanation;
                        const isCurrent = hIdx === currentHintIdx && isTimerRunning;
                        const pts = getTangTocImprovedPoints(hIdx, caiTienQuestionItem.loai_cau_hoi);

                        return (
                          <div
                            key={g.stt}
                            className={`p-4 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                              isCurrent
                                ? 'bg-gradient-to-br from-purple-600/25 via-indigo-600/15 to-violet-600/25 border-purple-400 ring-2 ring-purple-400/40 shadow-lg shadow-purple-500/20'
                                : isRevealed
                                ? 'bg-slate-900/90 border-slate-700/80 shadow-md'
                                : 'bg-slate-950/40 border-slate-850/80 opacity-50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                                isCurrent
                                  ? 'bg-purple-500 text-white shadow-sm'
                                  : isRevealed
                                  ? 'bg-slate-800 text-slate-300'
                                  : 'bg-slate-900 text-slate-500'
                              }`}>
                                GỢI Ý {g.stt}
                              </span>
                              <span className={`text-[11px] font-black ${isCurrent ? 'text-purple-300 animate-pulse' : isRevealed ? 'text-teal-400' : 'text-slate-600'}`}>
                                +{pts} ĐIỂM
                              </span>
                            </div>
                            <p className={`text-sm md:text-base font-bold leading-snug ${isRevealed ? 'text-white' : 'text-slate-600 select-none'}`}>
                              {isRevealed ? (g.noi_dung || `(Gợi ý số ${g.stt})`) : '••••••••••••••••••••••••'}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Timer progress bar */}
                    {isTimerRunning && (
                      <div className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3 space-y-1.5 shadow-inner">
                        <div className="flex justify-between items-center text-[11px] font-mono font-bold">
                          <span className="text-slate-400 uppercase tracking-wider text-[10px]">Thời gian đếm ngược</span>
                          <span className="text-purple-400">{matchState.timerSeconds.toFixed(1)}s / {totalDuration}s</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-400 rounded-full transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                            style={{
                              width: `${Math.min(100, Math.max(0, (matchState.timerSeconds / totalDuration) * 100))}%`
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Buzzer Status Banner */}
                    <div className="w-full flex flex-col items-center space-y-3 pt-1">
                      {isMyBuzzed ? (
                        <div className="p-5 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 border-2 border-emerald-400 text-emerald-200 rounded-2xl text-center space-y-1 animate-pulse w-full shadow-[0_0_25px_rgba(16,185,129,0.25)]">
                          <Bell className="w-8 h-8 mx-auto text-emerald-400" />
                          <strong className="text-base font-black uppercase block tracking-wide">BẠN ĐÃ GIÀNH QUYỀN TRẢ LỜI!</strong>
                          <span className="text-xs text-emerald-200 block">Hãy đưa ra đáp án trực tiếp cho MC / Ban Giám Khảo</span>
                        </div>
                      ) : isBlocked ? (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-center text-xs font-bold w-full">
                          ⛔ Bạn đã bị mất lượt trả lời cho câu hỏi này.
                        </div>
                      ) : isOtherBuzzed ? (
                        <div className="p-4 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded-xl text-center text-xs font-bold w-full">
                          ⚠️ Thí sinh bàn {buzzedPos} đã bấm chuông giành quyền trả lời!
                        </div>
                      ) : isTimerRunning && !tangToc?.buzzerLocked ? (
                        <div className="p-4 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded-xl text-center text-xs font-bold w-full flex items-center justify-center gap-2">
                          <Bell className="w-4 h-4 text-purple-400 animate-bounce" />
                          <span>BẤM NÚT CHUÔNG BÊN PHẢI ĐỂ GIÀNH QUYỀN TRẢ LỜI</span>
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-950 border border-slate-800 text-slate-500 rounded-xl text-center text-xs font-bold w-full">
                          🔒 Chuông đang khóa
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              // Map and sort contestant answers for pop-up
              const sortedAnswersWithPlayers = ([1, 2, 3, 4] as const).map((pos) => {
                const player = matchState?.players[pos];
                const ansObj = tangToc?.answers?.find((a) => a.playerPosition === pos);
                return {
                  playerPosition: pos,
                  name: player?.name || `Bàn số ${pos}`,
                  answer: ansObj?.answer || '',
                  timestamp: ansObj?.timestamp ?? null,
                };
              });

              const sortedAndGrouped = [...sortedAnswersWithPlayers].sort((a, b) => {
                if (a.timestamp !== null && b.timestamp !== null) {
                  return a.timestamp - b.timestamp;
                }
                if (a.timestamp !== null && b.timestamp === null) {
                  return -1;
                }
                if (a.timestamp === null && b.timestamp !== null) {
                  return 1;
                }
                return a.playerPosition - b.playerPosition;
              });

              return (
                <div className="w-full space-y-6 flex flex-col items-center">
                  {/* Top: Centered Question Text Spanning Full Width */}
                  <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 left-0 bg-indigo-500 text-white font-black text-[9px] px-3 py-0.5 rounded-br uppercase tracking-wider">
                      CÂU HỎI {currentQIndex + 1} / 4
                    </div>
                    <p className="text-base md:text-lg lg:text-xl font-bold text-white leading-relaxed mt-4 px-2 text-center w-full">
                      {questionItem?.noi_dung || '(Quan sát hình ảnh/video bên dưới và gõ đáp án)'}
                    </p>
                  </div>

                  {/* Middle: Media Center Stage */}
                  {questionItem?.media?.url && (
                    <div className="w-full h-[280px] md:h-[360px] bg-slate-950 border border-slate-850 rounded-2xl p-2 md:p-3 flex items-center justify-center shadow-2xl overflow-hidden">
                      {tangToc?.showMedia !== false || (matchState?.timerTotal ?? 0) > 0 || tangToc?.showAnswers || tangToc?.showExplanation ? (
                        <UniversalMediaPlayer 
                          media={questionItem.media} 
                          mediaControl={matchState?.mediaControl} 
                          largeMode={true}
                          round="TANG_TOC"
                          isTimerRunning={matchState?.isTimerRunning}
                          hideControls={true}
                          className="h-full aspect-video object-contain rounded-xl"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center space-y-2 p-6 text-center select-none">
                          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
                            <Trophy className="w-8 h-8 animate-pulse" />
                          </div>
                          <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">
                            {matchState?.tournamentName || 'ĐƯỜNG LÊN ĐỈNH OLYMPIA'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bottom: Answer Input Form & Recent Submitted Answer */}
                  <div className="w-full space-y-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5">
                    <form onSubmit={handleTextAnswerSubmit} className="space-y-3 w-full">
                      <div className="relative w-full">
                        <input
                          type="text"
                          value={textAnswer}
                          onChange={handleTextAnswerChange}
                          disabled={!isTimerRunning}
                          placeholder={isTimerRunning ? "Gõ nhanh câu trả lời..." : "Hết giờ nhập..."}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3.5 text-base text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-mono tracking-wider text-center uppercase"
                        />
                        {isTimerRunning && (
                          <span className="absolute right-3 top-3.5 text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-mono">
                            ĐANG MỞ
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                        <span></span>
                      </div>
                    </form>

                    {/* Recent Submitted Answer Centered */}
                    {tangTocLastAnswer && (
                      <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl text-center">
                        <strong className="text-lg md:text-xl font-black text-amber-300 font-mono tracking-wider uppercase block">
                          "{tangTocLastAnswer}"
                        </strong>
                      </div>
                    )}

                    {/* Host Explanation */}
                    {tangToc?.showExplanation && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-2 bg-slate-950 border border-indigo-500/40 rounded-2xl p-4 shadow-2xl"
                      >
                        <div className="px-3 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-bold inline-block uppercase tracking-wider">
                          ĐÁP ÁN ĐÚNG & GIẢI THÍCH
                        </div>
                        <h4 className="text-2xl font-black text-emerald-400 font-mono tracking-wide uppercase">
                          {questionItem?.dap_an_dung || 'KẾT QUẢ'}
                        </h4>
                      </motion.div>
                    )}
                  </div>

                  {/* Realtime Answers Popup Overlay */}
                  <AnimatePresence>
                    {tangToc?.showAnswers && !localShowAnswersDismissed && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center z-50 p-6"
                      >
                        <motion.div
                          initial={{ scale: 0.9, y: 30 }}
                          animate={{ scale: 1, y: 0 }}
                          exit={{ scale: 0.9, y: 30 }}
                          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                          className="bg-slate-900 border-2 border-indigo-500/60 rounded-3xl p-5 w-full max-w-md shadow-[0_0_50px_rgba(99,102,241,0.2)] flex flex-col justify-between space-y-4"
                        >
                          <div className="text-center space-y-1">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">ĐÃ KHÓA ĐÁP ÁN</span>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">
                              ĐÁP ÁN CÁC THÍ SINH
                            </h3>
                            <p className="text-[10px] text-slate-400">Sắp xếp theo thứ tự thời gian trả lời tăng dần</p>
                          </div>

                          <div className="space-y-2 max-h-[280px] overflow-y-auto">
                            {sortedAndGrouped.map((ans, idx) => {
                              const hasAnswer = ans.answer !== '';
                              const isFastest = idx === 0 && hasAnswer;

                              return (
                                <div
                                  key={ans.playerPosition}
                                  className={`p-3 rounded-xl flex items-center justify-between border ${
                                    isFastest
                                      ? 'bg-indigo-500/10 border-indigo-500/40 shadow-sm'
                                      : 'bg-slate-950/60 border-slate-800'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className={`w-5 h-5 rounded font-bold text-[10px] flex items-center justify-center shrink-0 ${
                                      isFastest ? 'bg-indigo-500 text-slate-950' : 'bg-slate-850 text-slate-400'
                                    }`}>
                                      {ans.playerPosition}
                                    </span>
                                    <div className="min-w-0">
                                      <span className="text-xs font-bold text-slate-200 block truncate">
                                        {ans.name} {ans.playerPosition === position && <span className="text-indigo-400 font-medium">(Bạn)</span>}
                                      </span>
                                      {hasAnswer ? (
                                        <strong className="text-sm font-bold text-amber-300 font-mono block mt-0.5 uppercase">
                                          "{ans.answer}"
                                        </strong>
                                      ) : (
                                        <span className="text-[11px] text-slate-600 italic block mt-0.5">
                                          Không có đáp án
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {hasAnswer && (
                                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                                      <span className="text-xs text-indigo-400 font-mono font-bold">{ans.timestamp}s</span>
                                      {isFastest && (
                                        <span className="inline-flex items-center gap-0.5 text-[7px] text-indigo-300 uppercase font-black tracking-wider bg-indigo-500/20 px-1 py-0.5 rounded">
                                          <Trophy className="w-2 h-2 text-indigo-400" /> NHANH NHẤT
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          <div className="pt-2 border-t border-slate-800/60 text-center">
                            <button
                              type="button"
                              onClick={() => setLocalShowAnswersDismissed(true)}
                              className="w-full py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-lg transition-all uppercase tracking-wider cursor-pointer"
                            >
                              ĐÓNG XEM ĐÁP ÁN (XEM LẠI CÂU HỎI)
                            </button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

        {/* Right Side: Real-time Live Scoreboard & Contestant Tracking */}
        <div className="w-full lg:w-80 shrink-0 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" />
                Bảng điểm & Theo dõi
              </h3>
              <span className="text-[10px] font-mono font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-emerald-400">
                TRỰC TIẾP
              </span>
            </div>
            
            <div className="flex flex-col gap-3">
              {(() => {
                const isCPColorActive = round === 'CHINH_PHUC' && (
                  matchState?.chinh_phuc?.colorMethod === 'HIGH_TO_LOW' ||
                  matchState?.chinh_phuc?.colorMethod === 'LOW_TO_HIGH' ||
                  matchState?.chinh_phuc?.gmdt?.step === 'KET_QUA' ||
                  matchState?.chinh_phuc?.isBoardShown
                );
                const sidebarPositions = isCPColorActive && matchState?.chinh_phuc?.colorOrder
                  ? (matchState.chinh_phuc.colorOrder as (1 | 2 | 3 | 4)[])
                  : ([1, 2, 3, 4] as const);

                return sidebarPositions.map((pos) => {
                  const playerObj = matchState?.players?.[pos];
                  const isMe = pos === position;
                  const hasJoined = !!(playerObj && playerObj.name);

                  // 1. Check if player has buzzed / claimed signal
                  let isBuzzed = false;
                  if (round === 'VCNV') {
                    const isCNVBuzzed = matchState?.vcnv?.cnvBuzzedPlayers?.some((b: any) => b.position === pos);
                    isBuzzed = isCNVBuzzed || (matchState?.buzzerState === 'BUZZED' && matchState?.buzzedPlayer === pos);
                  } else if (round === 'VE_DICH') {
                    const activeIndex = matchState?.ve_dich?.currentPlayerIndex;
                    const activePos = activeIndex !== null && activeIndex !== undefined ? activeIndex + 1 : null;
                    const turn = activePos ? matchState?.ve_dich?.turns[activePos] : null;
                    isBuzzed = (turn?.claimBuzzerState === 'BUZZED' && turn?.claimBuzzerPlayer === pos) || (matchState?.buzzerState === 'BUZZED' && matchState?.buzzedPlayer === pos);
                  } else {
                    isBuzzed = (matchState?.buzzerState === 'BUZZED' && matchState?.buzzedPlayer === pos);
                  }

                  // 2. Check if player is turn player in individual rounds (KĐ or VĐ)
                  let isTurnPlayer = false;
                  if (round === 'KHOI_DONG') {
                    const kd = matchState?.khoi_dong;
                    if (kd?.isConfirmed && kd?.subRound === 'INDIVIDUAL') {
                      const activeIndex = kd.currentPlayerIndex;
                      const activePos = activeIndex !== null && activeIndex !== undefined ? activeIndex + 1 : null;
                      if (activePos === pos) {
                        isTurnPlayer = true;
                      }
                    }
                  } else if (round === 'VE_DICH') {
                    const activeIndex = matchState?.ve_dich?.currentPlayerIndex;
                    const activePos = activeIndex !== null && activeIndex !== undefined ? activeIndex + 1 : null;
                    if (activePos === pos) {
                      isTurnPlayer = true;
                    }
                  }

                  let cardBgClass = 'bg-slate-950 border-slate-800/60 text-slate-300';
                  let numberBgClass = 'bg-slate-800 text-slate-400';
                  let scoreColorClass = 'text-emerald-400';

                  const cpColorKey = isCPColorActive ? matchState?.chinh_phuc?.playerColors?.[pos] : null;

                  if (cpColorKey) {
                    const CP_COLOR_SIDEBAR_MAP: Record<string, { border: string; bgMe: string; text: string; numBg: string }> = {
                      RED: {
                        border: 'border-red-500',
                        bgMe: 'bg-red-600/35 border-red-400 text-white shadow-lg shadow-red-500/20 ring-2 ring-red-400/60',
                        text: 'text-red-300',
                        numBg: 'bg-red-500 text-white font-black',
                      },
                      YELLOW: {
                        border: 'border-amber-400',
                        bgMe: 'bg-amber-500/35 border-amber-300 text-amber-100 shadow-lg shadow-amber-500/20 ring-2 ring-amber-300/60',
                        text: 'text-amber-300',
                        numBg: 'bg-amber-400 text-slate-950 font-black',
                      },
                      BLUE: {
                        border: 'border-blue-500',
                        bgMe: 'bg-blue-600/35 border-blue-400 text-white shadow-lg shadow-blue-500/20 ring-2 ring-blue-400/60',
                        text: 'text-blue-300',
                        numBg: 'bg-blue-500 text-white font-black',
                      },
                      GREEN: {
                        border: 'border-emerald-500',
                        bgMe: 'bg-emerald-600/35 border-emerald-400 text-white shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-400/60',
                        text: 'text-emerald-300',
                        numBg: 'bg-emerald-500 text-white font-black',
                      },
                    };
                    const cpStyle = CP_COLOR_SIDEBAR_MAP[cpColorKey] || CP_COLOR_SIDEBAR_MAP['RED'];

                    if (isMe) {
                      cardBgClass = cpStyle.bgMe;
                    } else {
                      cardBgClass = `bg-slate-950/90 ${cpStyle.border} text-slate-200`;
                    }
                    numberBgClass = cpStyle.numBg;
                    scoreColorClass = cpStyle.text;
                  } else if (isBuzzed) {
                  cardBgClass = 'bg-yellow-500/20 border-yellow-400 text-yellow-300 shadow-md shadow-yellow-500/10 ring-1 ring-yellow-400/50';
                  numberBgClass = 'bg-yellow-400 text-slate-950 font-black';
                  scoreColorClass = 'text-yellow-300';
                } else if (isTurnPlayer && !isMe) {
                  cardBgClass = 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-md shadow-blue-500/10 ring-1 ring-blue-400/50';
                  numberBgClass = 'bg-blue-500 text-white font-black';
                  scoreColorClass = 'text-blue-300';
                } else if (isMe) {
                  cardBgClass = 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-400/50';
                  numberBgClass = 'bg-emerald-400 text-slate-950 font-black';
                  scoreColorClass = 'text-emerald-300';
                } else if (!hasJoined) {
                  cardBgClass = 'bg-slate-950/30 border-slate-900/60 opacity-50 text-slate-500';
                }

                return (
                  <div
                    key={pos}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${cardBgClass}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-5 h-5 rounded font-black text-[10px] flex items-center justify-center shrink-0 ${numberBgClass}`}>
                        {pos}
                      </div>
                      <span className="text-xs font-bold truncate">
                        {playerObj?.name || `Bàn ${pos}`}
                      </span>
                    </div>
                    
                    <span className={`text-sm font-bold font-mono ${scoreColorClass}`}>
                      {matchState?.currentRound === 'JEOPARDY' && matchState?.jeopardy?.scoringMode === 'SEPARATE'
                        ? (matchState?.jeopardy?.separateScores?.[pos as unknown as number] ?? 0)
                        : (playerObj?.score ?? 0)}
                    </span>
                  </div>
                );
              });
            })()}
            </div>

            {/* Về Đích package points bar under last contestant */}
            {round === 'VE_DICH' && (() => {
              const vd = matchState?.ve_dich;
              const activeIndex = vd?.currentPlayerIndex;
              const activePos = activeIndex !== null && activeIndex !== undefined ? (activeIndex + 1) as 1 | 2 | 3 | 4 : null;
              const activeTurn = activePos ? vd?.turns?.[activePos] : null;

              if (!activeTurn?.packageConfirmed || !activeTurn?.chosenPackage?.length) return null;

              return (
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block">Gói câu hỏi Về Đích</span>
                    {activeTurn.starUsed && (
                      <span className="text-[10px] text-yellow-300 font-bold bg-yellow-500/20 border border-yellow-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current text-yellow-400" /> Ngôi sao
                      </span>
                    )}
                  </div>

                  <div
                    className="grid gap-2"
                    style={{ gridTemplateColumns: `repeat(${activeTurn.chosenPackage.length}, minmax(0, 1fr))` }}
                  >
                    {activeTurn.chosenPackage.map((q, idx) => {
                      const isCurrent = idx === activeTurn.currentQuestionIndex;
                      const isPast = idx < activeTurn.currentQuestionIndex;
                      return (
                        <div
                          key={idx}
                          className={`py-2 px-1 rounded-xl border text-center transition-all ${
                            isCurrent
                              ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300 shadow-md font-bold scale-102 ring-1 ring-yellow-400/50'
                              : isPast
                              ? 'bg-slate-950/60 border-slate-900 text-slate-600 opacity-50'
                              : 'bg-slate-950 border-slate-800 text-slate-300 font-bold'
                          }`}
                        >
                          <strong className="text-sm md:text-base font-black font-mono block">{q.points}</strong>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Sidebar Bottom Control (Buzzer / Circular Timer) */}
          <SidebarBottomControl
            round={round}
            matchState={matchState}
            matchQuestions={matchQuestions}
            position={position}
            pressBuzzer={pressBuzzer}
            pressBuzzerCNV={pressBuzzerCNV}
            hasBuzzedCNV={hasBuzzedCNV}
            setHasBuzzedCNV={setHasBuzzedCNV}
            socket={socket}
          />
        </div>
      </main>

      {/* Floating non-blocking buzzer pop-up on the right */}
      <AnimatePresence>
        {buzzedNotification && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className="fixed top-20 right-4 z-50 max-w-sm bg-slate-900 border-2 border-red-500/50 rounded-xl p-4 shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-start gap-3"
          >
            <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-red-400">Tín hiệu chuông VCNV</h4>
              <p className="text-xs text-slate-200 leading-relaxed">
                Thí sinh <strong className="text-white text-sm font-extrabold">{buzzedNotification.playerName}</strong> (Bàn số {buzzedNotification.position}) đã bấm chuông giành quyền giải Chướng Ngại Vật!
              </p>
              <span className="text-[9px] text-slate-500 block font-mono pt-1">Thông báo tự động đóng sau 5 giây</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contestant Answers Reveal Popup Modal */}
      <AnimatePresence>
        {matchState?.currentRound === 'VCNV' && matchState?.vcnv?.selectedRow && (() => {
          const rowObj = matchState.vcnv.rows[matchState.vcnv.selectedRow];
          if (!rowObj || !rowObj.showAnswers) return null;
          
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="bg-slate-900/95 border-2 border-amber-500/80 rounded-2xl p-6 w-full max-w-2xl shadow-[0_0_50px_rgba(245,158,11,0.15)] space-y-6"
              >
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">ĐÁP ÁN ĐÃ KHÓA</span>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">
                    CÂU TRẢ LỜI CỦA THÍ SINH
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">Hàng Ngang Số {matchState.vcnv.selectedRow}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {([1, 2, 3, 4] as const).map((pos) => {
                    const player = matchState.players[pos];
                    const answer = rowObj.playerAnswers[pos] || '';
                    return (
                      <div
                        key={pos}
                        className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-center min-h-[90px] shadow-inner text-center"
                      >
                        <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">
                          Thí sinh {pos}
                        </span>
                        <span className="text-xs font-bold text-slate-300 block truncate mt-0.5 animate-pulse">
                          {player?.name || `Bàn số ${pos}`}
                        </span>
                        
                        <div className="mt-3 pt-2.5 border-t border-slate-900 flex justify-center items-center">
                          {answer ? (
                            <strong className="text-lg font-black text-amber-300 font-mono tracking-wider">
                              {answer.toUpperCase()}
                            </strong>
                          ) : (
                            <span className="text-xs font-semibold text-slate-600 italic">
                              CHƯA TRẢ LỜI
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* NON-BLOCKING BUZZER AT BOTTOM OF POPUP MODAL */}
                <div className="pt-4 border-t border-slate-800/80 flex flex-col items-center space-y-2">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                    ⚡ Bấm chuông giành quyền giải CNV tại đây nếu đã nhận diện được từ khóa:
                  </span>
                  {(() => {
                    const isBlockedCNV = matchState?.vcnv?.cnvBlockedPlayers?.includes(position);
                    const alreadyBuzzedCNV = hasBuzzedCNV || matchState?.vcnv?.cnvBuzzedPlayers?.some((bp: any) => bp.position === position);
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          pressBuzzerCNV();
                          setHasBuzzedCNV(true);
                          localStorage.setItem('hasBuzzedCNV', 'true');
                        }}
                        disabled={alreadyBuzzedCNV || isBlockedCNV || matchState?.vcnv?.cnvSolved}
                        className={`w-full max-w-md py-3 font-bold rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2 border uppercase tracking-wider ${
                          isBlockedCNV
                            ? 'bg-slate-950 border-rose-950 text-rose-500 cursor-not-allowed'
                            : alreadyBuzzedCNV
                            ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed opacity-60'
                            : 'bg-red-600 hover:bg-red-700 border-red-500 text-white cursor-pointer shadow-[0_0_20px_rgba(239,68,68,0.35)] animate-pulse'
                        }`}
                      >
                        <AlertTriangle className={`w-3.5 h-3.5 ${alreadyBuzzedCNV || isBlockedCNV ? 'text-slate-500' : 'text-white'}`} />
                        {isBlockedCNV ? 'BẠN ĐÃ BỊ PHẠT LOẠI BỎ' : alreadyBuzzedCNV ? 'ĐÃ BẤM CHUÔNG VCNV' : 'BẤM CHUÔNG GIÀNH CNV CHÍNH'}
                      </button>
                    );
                  })()}
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* LARGE POPUP MODAL FOR EXTERNAL MEDIA IN PLAYER VIEW */}
      {(() => {
        const extMedia = matchState?.activeExternalMedia;
        const isExtActive = extMedia && extMedia.isPlaying !== false;
        if (!isExtActive) return null;

        const rawExtType = (extMedia.type || '').toLowerCase().trim();
        const extUrl = extMedia.url || '';
        const isAudioExt = rawExtType === 'audio' || (extUrl && extUrl.match(/\.(mp3|wav|ogg|m4a|aac|flac)($|\?)/i) !== null);
        const isVisualExt = !isAudioExt;

        return (
          <AnimatePresence>
            {isVisualExt && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-[9999] p-4"
              >
                <motion.div
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  className="bg-slate-900 border border-indigo-500/40 rounded-2xl w-full max-w-4xl p-4 shadow-2xl space-y-3 flex flex-col max-h-[90vh]"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 px-1">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                      🎬 Media Ngoài: {extMedia.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded uppercase">
                      {extMedia.type}
                    </span>
                  </div>

                  <div className="flex-1 overflow-hidden flex items-center justify-center bg-black rounded-xl p-1 min-h-[300px]">
                    <UniversalMediaPlayer
                      media={{ url: extMedia.url, type: (extMedia.type || 'video').toLowerCase() as any }}
                      mediaControl={{ isPlaying: extMedia.isPlaying, key: extMedia.key }}
                      className="max-h-[75vh] w-full object-contain mx-auto"
                      largeMode={true}
                      hideControls={false}
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}

            {isAudioExt && (
              <UniversalMediaPlayer
                media={{ url: extMedia.url, type: 'audio' }}
                mediaControl={{ isPlaying: extMedia.isPlaying, key: extMedia.key }}
                className="hidden"
              />
            )}
          </AnimatePresence>
        );
      })()}
    </div>
  );
}
