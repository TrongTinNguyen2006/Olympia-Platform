import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useGameSocket } from '../hooks/useGameSocket.js';
import { useSoundEngine } from '../hooks/useSoundEngine.js';
import { SocketEvent, MatchState, getTangTocImprovedPoints } from '../types.js';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Bell, Clock, Star, Zap, Volume2, CheckCircle } from 'lucide-react';
import CountUpScore from './viewer/CountUpScore.js';
import UniversalMediaPlayer from './UniversalMediaPlayer.js';
import SmoothTimerBar from './SmoothTimerBar.js';
import VCNVViewer from './viewer/VCNVViewer.js';
import BorderTimer from './BorderTimer.js';
import ShootoutScoreDots, { ImprovedScoreDots } from './ShootoutScoreDots.js';
import { JeopardyView } from './views/JeopardyView.js';
import ChinhPhucView from './views/ChinhPhucView.js';
import { safeFetchJson } from '../utils/api.js';

function getQuestionFontSize(text: string) {
  const len = text ? text.length : 0;
  if (len > 240) return 'text-xs md:text-sm lg:text-base leading-snug font-semibold';
  if (len > 160) return 'text-sm md:text-base lg:text-lg leading-snug font-semibold';
  if (len > 100) return 'text-base md:text-lg lg:text-xl leading-snug font-semibold';
  return 'text-xl md:text-2xl leading-relaxed font-semibold';
}

function getVCNVQuestionFontSize(text: string) {
  return getQuestionFontSize(text);
}

function getVDQuestionFontSize(text: string) {
  return getQuestionFontSize(text);
}

export default function LivestreamOverlay() {
  const { matchState, socket } = useGameSocket();
  const { isAudioUnlocked, unlockAudio } = useSoundEngine(matchState, socket);
  const [matchQuestions, setMatchQuestions] = useState<any>(null);

  useEffect(() => {
    if (matchState?.matchCode && matchState.matchCode.trim()) {
      safeFetchJson<any>(`/api/match/${encodeURIComponent(matchState.matchCode.trim())}?t=${matchState.loadedAt || Date.now()}`)
        .then((data) => {
          if (data && data.success) {
            setMatchQuestions(data.match);
          }
        })
        .catch((err) => console.error('Error fetching questions for Overlay:', err));
    }
  }, [matchState?.matchCode, matchState?.loadedAt]);

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

  // Audio Unlock Overlay Banner component (Click anywhere on screen to unlock audio for OBS)
  const audioUnlockBanner = !isAudioUnlocked ? (
    <div
      onClick={unlockAudio}
      className="fixed inset-0 z-[9999] cursor-pointer bg-black/20 backdrop-blur-[1px] flex items-start justify-end p-4 pointer-events-auto"
    >
      <button
        type="button"
        onClick={unlockAudio}
        className="flex items-center gap-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold px-5 py-3 rounded-2xl shadow-2xl border-2 border-rose-300 animate-pulse text-xs cursor-pointer transition-all hover:scale-105 h-fit"
      >
        <Volume2 className="w-5 h-5 animate-bounce shrink-0" />
        <div className="text-left">
          <p className="font-black text-sm">BẬT ÂM THANH OVERLAY</p>
          <p className="text-[10px] text-rose-100 font-normal">Nhấp bất kỳ đâu để phát âm thanh ra OBS / Livestream</p>
        </div>
      </button>
    </div>
  ) : null;

  // If match state is missing, round is WAITING, or overlay is set to hidden, return transparent element for OBS
  if (!matchState || matchState.overlayVisible === false || matchState.currentRound === 'WAITING') {
    return (
      <div className="w-screen h-screen bg-transparent relative">
        {audioUnlockBanner}
      </div>
    );
  }

  const round = matchState.currentRound;

  const extMedia = matchState?.activeExternalMedia;
  const isExtActive = extMedia && extMedia.isPlaying !== false;
  const rawExtType = (extMedia?.type || '').toLowerCase().trim();
  const extUrl = extMedia?.url || '';
  const isAudioExt = rawExtType === 'audio' || (extUrl && extUrl.match(/\.(mp3|wav|ogg|m4a|aac|flac)($|\?)/i) !== null);
  const isVisualExt = isExtActive && !isAudioExt;

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* EXTERNAL MEDIA FULL SCREEN OVERLAY FOR LIVESTREAM */}
      {isExtActive && (
        <AnimatePresence>
          {isVisualExt && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="fixed inset-0 z-[10000] bg-black flex items-center justify-center p-0 pointer-events-auto"
            >
              <UniversalMediaPlayer
                media={{ url: extMedia.url, type: (extMedia.type || 'video').toLowerCase() as any }}
                mediaControl={{ isPlaying: extMedia.isPlaying, key: extMedia.key }}
                className="w-full h-full object-contain"
                largeMode={true}
                hideFrame={true}
                hideControls={false}
              />
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
      )}

      {/* MAIN OVERLAY CONTAINER - Animated ONCE per round */}
      <div
        className="w-full h-full bg-transparent overflow-hidden relative font-sans text-white select-none pointer-events-none p-8"
        style={{ perspective: '1000px' }}
      >
        {audioUnlockBanner}

        <motion.div
          key={round}
          initial={{ opacity: 0, y: 120, rotateX: -20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, y: 120, rotateX: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 180 }}
          className="w-full max-w-7xl mx-auto h-full flex flex-col justify-between pointer-events-auto"
        >
          {round === 'KHOI_DONG' && <KhoiDongOverlay matchState={matchState} matchQuestions={matchQuestions} />}
          {round === 'VCNV' && <VCNVOverlay matchState={matchState} matchQuestions={matchQuestions} />}
          {round === 'TANG_TOC' && <TangTocOverlay matchState={matchState} matchQuestions={matchQuestions} />}
          {round === 'VE_DICH' && <VeDichOverlay matchState={matchState} matchQuestions={matchQuestions} />}
          {round === 'CH_PHU' && <CHPhuOverlay matchState={matchState} matchQuestions={matchQuestions} />}
          {round === 'JEOPARDY' && <JeopardyOverlay matchState={matchState} />}
          {round === 'MA_TRAN_KEP' && <MaTranKepOverlay matchState={matchState} />}
          {round === 'CHINH_PHUC' && <ChinhPhucView matchState={matchState} isOverlay={true} />}
          {round === 'DAU_TRI' && <DauTriOverlay matchState={matchState} matchQuestions={matchQuestions} />}
          {round === 'SUMMARY' && <SummaryOverlay matchState={matchState} />}
        </motion.div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// COMMON 4 CANDIDATE SCORES BAR
// ----------------------------------------------------
function CandidateScoresBar({
  matchState,
  activePosition,
  buzzedPosition,
  cnvBuzzedPlayers,
  filterPositions,
}: {
  matchState: MatchState;
  activePosition?: number | null;
  buzzedPosition?: number | null;
  cnvBuzzedPlayers?: { position: 1 | 2 | 3 | 4; timestamp: number }[];
  filterPositions?: number[];
}) {
  const [scoreChanges, setScoreChanges] = useState<{ [pos: string]: { id: number; diff: number }[] }>({
    '1': [],
    '2': [],
    '3': [],
    '4': [],
  });
  const prevScoresRef = useRef<{ [pos: string]: number }>({});

  useEffect(() => {
    if (!matchState?.players) return;

    let changed = false;
    const newChanges = { ...scoreChanges };
    const isJeopardySeparate = matchState?.currentRound === 'JEOPARDY' && matchState?.jeopardy?.scoringMode === 'SEPARATE';

    (['1', '2', '3', '4'] as const).forEach((pos) => {
      const currentScore = isJeopardySeparate
        ? (matchState.jeopardy?.separateScores?.[pos as unknown as number] ?? 0)
        : (matchState.players[pos]?.score ?? 0);
      const prevScore = prevScoresRef.current[pos];

      if (prevScore !== undefined && currentScore !== prevScore) {
        const diff = currentScore - prevScore;
        const id = Date.now() + Math.random();

        newChanges[pos] = [...(newChanges[pos] || []), { id, diff }];
        changed = true;

        setTimeout(() => {
          setScoreChanges((prev) => ({
            ...prev,
            [pos]: (prev[pos] || []).filter((c) => c.id !== id),
          }));
        }, 2500);
      }
      prevScoresRef.current[pos] = currentScore;
    });

    if (changed) {
      setScoreChanges(newChanges);
    }
  }, [matchState?.players]);

  const positionsToRender = filterPositions && filterPositions.length > 0
    ? (filterPositions.filter((p) => [1, 2, 3, 4].includes(p)) as (1 | 2 | 3 | 4)[])
    : ([1, 2, 3, 4] as const);

  let gridCols = 'grid-cols-4';
  if (positionsToRender.length === 1) gridCols = 'grid-cols-1';
  else if (positionsToRender.length === 2) gridCols = 'grid-cols-2';
  else if (positionsToRender.length === 3) gridCols = 'grid-cols-3';

  return (
    <div className={`grid ${gridCols} gap-3 bg-slate-950/90 backdrop-blur-xl border border-slate-800/80 p-2.5 rounded-2xl shadow-2xl font-player relative`}>
      {positionsToRender.map((pos) => {
        const player = matchState.players[pos];
        const isBuzzed = (buzzedPosition ?? matchState.buzzedPlayer) === pos;
        const cnvIndex = cnvBuzzedPlayers?.findIndex((p) => p.position === pos) ?? -1;
        const isCnvBuzzed = cnvIndex !== -1;
        const isActive = activePosition === pos;

        const isCnvBlocked = matchState.currentRound === 'VCNV' && matchState.vcnv?.cnvBlockedPlayers?.includes(pos);
        const isKdDisqualified = matchState.currentRound === 'KHOI_DONG' && matchState.khoi_dong?.disqualifiedPlayers?.includes(pos);

        const isKhoiDong = matchState.currentRound === 'KHOI_DONG';
        const kd = matchState.khoi_dong;
        const scoringMode = kd?.subRound === 'INDIVIDUAL' 
          ? (kd?.individualScoringMode || 'TRADITIONAL') 
          : (kd?.collectiveScoringMode || 'TRADITIONAL');

        const rawName = player?.name || `Thí sinh ${pos}`;
        let displayName = rawName;
        if (isKhoiDong && scoringMode !== 'TRADITIONAL') {
          const wrongCount = kd?.wrongCounts?.[pos] ?? 0;
          displayName = `${rawName} | ${wrongCount}`;
        }

        return (
          <div key={pos} className="relative">
            {/* SCORE CHANGE POPUP ANIMATION (+10, -10) */}
            <AnimatePresence>
              {(scoreChanges[pos] || []).map((change) => (
                <motion.div
                  key={change.id}
                  initial={{ opacity: 0, y: 10, scale: 0.6 }}
                  animate={{ opacity: 1, y: -38, scale: 1.25 }}
                  exit={{ opacity: 0, y: -65, scale: 0.8 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className={`absolute -top-10 left-1/2 -translate-x-1/2 text-3xl md:text-4xl font-black font-mono tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)] select-none whitespace-nowrap z-50 pointer-events-none ${
                    change.diff > 0 ? 'text-emerald-400' : 'text-red-500'
                  }`}
                >
                  {change.diff > 0 ? `+${change.diff}` : change.diff}
                </motion.div>
              ))}
            </AnimatePresence>

            <div
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-300 border ${
                isKdDisqualified
                  ? 'bg-slate-700/80 border-slate-600 text-slate-200'
                  : isCnvBlocked
                  ? 'bg-slate-900/40 border-slate-800/60 text-slate-500 opacity-60 filter grayscale'
                  : isCnvBuzzed
                  ? 'bg-amber-400 text-slate-950 font-black border-2 border-yellow-200 shadow-[0_0_25px_rgba(250,204,21,0.9)] animate-pulse scale-[1.02]'
                  : isBuzzed
                  ? 'bg-amber-400 text-slate-950 font-black border-2 border-yellow-200 shadow-[0_0_25px_rgba(250,204,21,0.9)] animate-pulse scale-[1.02]'
                  : isActive
                  ? 'bg-emerald-500 text-slate-950 font-black border-2 border-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.8)] scale-[1.02]'
                  : 'bg-slate-900/60 border-slate-850 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                    isKdDisqualified
                      ? 'bg-slate-800 text-slate-300'
                      : isCnvBlocked
                      ? 'bg-slate-950 text-slate-600'
                      : isCnvBuzzed || isBuzzed
                      ? 'bg-slate-950 text-amber-300'
                      : isActive
                      ? 'bg-slate-950 text-emerald-300'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  P{pos}
                </span>
                <span
                  className={`text-base font-bold truncate ${
                    isKdDisqualified
                      ? 'text-slate-200 font-bold'
                      : isCnvBlocked
                      ? 'text-slate-500 line-through font-medium'
                      : isCnvBuzzed || isBuzzed || isActive
                      ? 'text-slate-950 font-black'
                      : 'text-slate-200'
                  }`}
                >
                  {displayName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isCnvBuzzed && !isCnvBlocked && (
                  <span className="bg-slate-950 text-amber-300 text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 font-mono">
                    <Bell className="w-3 h-3 fill-current animate-pulse" />
                    #{cnvIndex + 1}
                  </span>
                )}
                {isCnvBlocked && (
                  <span className="bg-slate-950 text-red-400 text-[10px] font-black px-1.5 py-0.5 rounded font-mono uppercase">
                    LOẠI
                  </span>
                )}
                {(() => {
                  const isJeopardySeparate = matchState?.currentRound === 'JEOPARDY' && matchState?.jeopardy?.scoringMode === 'SEPARATE';
                  const displayScore = isJeopardySeparate
                    ? (matchState.jeopardy?.separateScores?.[pos as unknown as number] ?? 0)
                    : (player?.score ?? 0);

                  return (
                    <span className={`font-mono text-xl font-black ${isCnvBlocked ? 'text-slate-500' : isCnvBuzzed || isBuzzed || isActive ? 'text-slate-950' : 'text-white'}`}>
                      <CountUpScore score={displayScore} />
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ----------------------------------------------------
// 1. KHỞI ĐỘNG OVERLAY
// ----------------------------------------------------
function KhoiDongOverlay({ matchState, matchQuestions }: { matchState: MatchState; matchQuestions: any }) {
  const kd = matchState.khoi_dong;
  const showOverlay = Boolean(kd.isStarted || kd.isPrepRunning);

  // ONLY show overlay interface once 3s prep countdown button is pressed
  if (!showOverlay) {
    return null;
  }

  const isIndividual = kd.subRound === 'INDIVIDUAL';
  const activePosition =
    isIndividual && kd.currentPlayerIndex !== null && kd.currentPlayerIndex !== undefined
      ? ((kd.currentPlayerIndex + 1) as 1 | 2 | 3 | 4)
      : null;

  const activeQIdx = kd.currentQuestionIndex ?? 0;
  const questionList = matchQuestions?.khoi_dong?.cau_hoi;
  const currentQuestion = questionList?.[activeQIdx];

  const totalQuestionsInTurn = isIndividual 
    ? kd.individualMaxQuestions 
    : kd.collectiveMaxQuestions;
  const currentCountDisplay = (kd.countAnswered ?? 0) + (kd.isStarted ? 1 : 0);
  const currentCountClamped = (totalQuestionsInTurn !== null && totalQuestionsInTurn !== undefined && totalQuestionsInTurn > 0)
    ? Math.min(currentCountDisplay, totalQuestionsInTurn)
    : currentCountDisplay;

  const isTimerRunning = matchState.isTimerRunning;
  const timerSeconds = matchState.timerSeconds;
  const defaultDuration = isIndividual 
    ? (kd.individualTimerDuration || 60) 
    : (kd.collectiveTimerDuration || 60);
  const maxTimer = matchState.timerTotal || defaultDuration;
  const countUpPercent = maxTimer > 0 ? Math.min(100, Math.max(0, ((maxTimer - timerSeconds) / maxTimer) * 100)) : 0;

  const turnKey = isIndividual ? `kd_turn_${kd.currentPlayerIndex ?? 0}` : `kd_turn_all_${kd.subRound || 'all'}`;

  return (
    <div className="h-full flex flex-col justify-end space-y-3 font-sans">
      <CandidateScoresBar matchState={matchState} activePosition={activePosition} />

      {/* QUESTION BOX - RENDERED WHEN PREP COUNTDOWN RUNS OR TURN IS STARTED */}
      <motion.div
        key={turnKey}
        initial={{ opacity: 0, y: 60, rotateX: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        transition={{ duration: 0.8, type: 'spring', damping: 20, stiffness: 90 }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative bg-slate-950/90 backdrop-blur-xl border border-emerald-500/40 rounded-2xl px-6 py-5 shadow-[0_0_40px_rgba(16,185,129,0.25)] flex flex-col justify-between overflow-visible min-h-[190px] h-[190px]"
      >
        {/* ACTIVE QUESTION DISPLAY (Hidden during 3s prep time, displayed after 3s countdown finishes) */}
        {kd.isPrepRunning ? (
          <div className="w-full flex-1" />
        ) : (
          <div className="w-full flex-1 flex items-center gap-5">
            {currentQuestion?.media?.url && (
              <div className="shrink-0 aspect-video max-h-32 max-w-[220px] rounded-xl border-2 border-emerald-500/40 bg-slate-950 p-0.5 overflow-hidden shadow-lg flex items-center justify-center">
                <UniversalMediaPlayer
                  media={{
                    url: currentQuestion.media.url,
                    type: currentQuestion.media.type || 'image',
                  }}
                  mediaControl={matchState?.mediaControl}
                  round="KHOI_DONG"
                  className="w-full h-full object-contain"
                  hideControls={true}
                  hideFrame={true}
                />
              </div>
            )}
            {currentQuestion?.noi_dung && (
              <p className={`text-white font-question flex-1 ${getQuestionFontSize(currentQuestion.noi_dung)}`}>
                {currentQuestion.noi_dung}
              </p>
            )}
          </div>
        )}

        {/* 3s Large Number Countdown Badge at Bottom-Right */}
        {(kd.threeSecCountdown ?? 0) > 0 && (
          <div className="absolute bottom-4 right-5 bg-amber-500/30 border-2 border-amber-400 text-amber-300 font-mono font-black text-2xl md:text-3xl px-4 py-1.5 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center animate-pulse z-30 pointer-events-none min-w-[52px]">
            {kd.threeSecCountdown}
          </div>
        )}

        {/* SMOOTH TIMER BAR */}
        {isTimerRunning && (
          <SmoothTimerBar
            seconds={timerSeconds}
            total={maxTimer}
            isRunning={isTimerRunning}
            className="absolute bottom-0 left-0 right-0 border-t border-slate-800/80 z-30"
            heightClass="h-2.5"
          />
        )}

        {/* PROTRUDING COUNTER BADGE */}
        {(kd.isStarted || kd.isPrepRunning) && (
          <div className="absolute top-3 right-4 z-20 pointer-events-none">
            <div className="bg-slate-900/90 border border-emerald-500/60 px-3.5 py-1 rounded-full shadow-lg text-xs font-mono font-black text-emerald-400 tracking-wider flex items-center gap-1.5">
              <span>
                Câu {currentCountClamped}
                {totalQuestionsInTurn !== null && totalQuestionsInTurn !== undefined && totalQuestionsInTurn > 0
                  ? `/${totalQuestionsInTurn}`
                  : ''}
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ----------------------------------------------------
// 2. VƯỢT CHƯỚNG NGẠI VẬT OVERLAY
// ----------------------------------------------------
function VCNVOverlay({ matchState, matchQuestions }: { matchState: MatchState; matchQuestions: any }) {
  const vcnv = matchState.vcnv;
  const isTimerRunning = matchState.isTimerRunning;
  const timerSeconds = matchState.timerSeconds;
  const maxTimer = matchState.timerTotal || 15;
  const countUpPercent = maxTimer > 0 ? Math.min(100, Math.max(0, ((maxTimer - timerSeconds) / maxTimer) * 100)) : 0;

  const selectedRow = vcnv?.selectedRow;
  const rowObj = selectedRow ? vcnv?.rows[selectedRow] : null;
  const questionItem = selectedRow ? matchQuestions?.vuot_chuong_ngai_vat?.hang_ngang?.[selectedRow - 1] : null;
  const buzzedPlayer = matchState.buzzedPlayer;
  const cnvBuzzedPlayers = vcnv?.cnvBuzzedPlayers || (vcnv?.cnvBuzzedPlayer ? [{ position: vcnv.cnvBuzzedPlayer as 1 | 2 | 3 | 4, timestamp: vcnv.cnvBuzzedTimestamp || Date.now() }] : []);

  const showAnswers = Boolean(rowObj?.showAnswers);

  // Track if timer has been started for the currently selected row
  const [hasTimerRun, setHasTimerRun] = useState(false);
  const prevRowRef = useRef<number | null>(selectedRow);

  useEffect(() => {
    if (prevRowRef.current !== selectedRow) {
      prevRowRef.current = selectedRow;
      setHasTimerRun(false);
    }
  }, [selectedRow]);

  useEffect(() => {
    if (isTimerRunning && selectedRow) {
      setHasTimerRun(true);
    }
  }, [isTimerRunning, selectedRow]);

  useEffect(() => {
    if (showAnswers) {
      setHasTimerRun(false);
    }
  }, [showAnswers]);

  let showBoard = Boolean(vcnv?.showRows);
  if (selectedRow) {
    if (showAnswers) {
      showBoard = false;
    } else if (isTimerRunning || hasTimerRun) {
      showBoard = false;
    } else {
      showBoard = Boolean(vcnv?.showRows);
    }
  }

  return (
    <div className="h-full flex flex-col justify-between font-sans relative">
      {/* FULL SCREEN CONTESTANT ANSWERS OVERLAY IN CENTER */}
      <AnimatePresence>
        {showAnswers && selectedRow && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-2xl rounded-2xl p-6 flex flex-col items-center justify-center border border-amber-500/30 shadow-[0_0_80px_rgba(0,0,0,0.9)]"
          >
            <div className="w-full max-w-4xl bg-slate-900/95 border-2 border-amber-400/80 rounded-3xl p-8 shadow-[0_0_60px_rgba(251,191,36,0.25)] space-y-6 text-center">
              <div className="flex justify-center">
                <span className="px-4 py-1.5 bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black rounded-full uppercase tracking-widest font-player">
                  HÀNG NGANG SỐ {selectedRow}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {([1, 2, 3, 4] as const).map((pos) => {
                  const player = matchState.players[pos];
                  const answer = rowObj?.playerAnswers?.[pos] || '';
                  const answerTime = (rowObj as any)?.answerTimes?.[pos];
                  return (
                    <div
                      key={pos}
                      className="bg-slate-950/90 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between items-center min-h-[150px] shadow-lg"
                    >
                      <div className="space-y-1 w-full text-center">
                        <span className="text-xs font-black text-amber-400 font-player uppercase tracking-wider block">
                          P{pos}
                        </span>
                        <h4 className="text-base font-bold text-slate-200 font-player truncate">
                          {player?.name || `Thí sinh ${pos}`}
                        </h4>
                      </div>

                      <div className="my-3 w-full py-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-center min-h-[60px]">
                        {answer ? (
                          <span className="text-2xl md:text-3xl font-black text-amber-300 font-mono tracking-wider break-all px-2">
                            {answer.toUpperCase()}
                          </span>
                        ) : (
                          <span className="text-lg font-bold text-slate-600">
                            —
                          </span>
                        )}
                      </div>

                      {answerTime ? (
                        <span className="text-xs font-mono font-bold text-slate-400">
                          {Math.round(answerTime)}s
                        </span>
                      ) : (
                        <span className="text-xs font-mono text-slate-600">-</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP SECTION: VCNV BOARD AT VERY TOP OF SCREEN */}
      <div>
        {showBoard && (
          <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-2xl">
            <VCNVViewer matchState={matchState} matchQuestions={matchQuestions} hideQuestionBox={true} hideAnswersPopup={true} />
          </div>
        )}
      </div>

      {/* BOTTOM SECTION: QUESTION BOX SITTING DIRECTLY ABOVE CANDIDATE SCORES BAR (Hidden when contestant answers shown) */}
      <div className="space-y-3">
        {selectedRow && !showAnswers && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative bg-slate-950/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl px-6 py-4 shadow-2xl flex flex-col justify-between overflow-hidden min-h-[160px] h-[160px]"
          >
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black rounded-lg uppercase tracking-wider font-player">
                  Vượt Chướng Ngại Vật • Hàng Ngang {selectedRow}
                </span>

                {/* CNV BUZZER INLINE BADGES ("1. Văn A", "2. Văn B") DIRECTLY ON QUESTION BOX */}
                {cnvBuzzedPlayers.length > 0 && (
                  <div className="flex items-center gap-2">
                    {cnvBuzzedPlayers.map((bp, idx) => (
                      <span
                        key={bp.position}
                        className="px-3 py-1 bg-amber-400 text-slate-950 font-black text-xs rounded-lg uppercase tracking-wider font-player border-2 border-yellow-200 shadow-lg animate-pulse flex items-center gap-1.5 font-mono"
                      >
                        <Bell className="w-3.5 h-3.5 fill-current" />
                        <span>{idx + 1}. {matchState.players[bp.position]?.name || `Thí sinh ${bp.position}`}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 font-mono text-xs text-amber-400 font-bold">
                <Clock className="w-4 h-4" />
                <span>{isTimerRunning ? `${timerSeconds}s` : ''}</span>
              </div>
            </div>

            <div className="flex-1 flex items-center gap-5 py-1">
              {questionItem?.media?.url && (
                <div className="shrink-0 aspect-video max-h-28 max-w-[220px] rounded-xl border-2 border-amber-500/40 bg-slate-950 p-0.5 overflow-hidden shadow-lg flex items-center justify-center">
                  <UniversalMediaPlayer
                    media={{
                      url: questionItem.media.url,
                      type: questionItem.media.type || 'image',
                    }}
                    mediaControl={matchState?.mediaControl}
                    round="VCNV"
                    className="w-full h-full object-contain"
                    hideControls={true}
                    hideFrame={true}
                  />
                </div>
              )}
              {questionItem?.cau_hoi && (
                <p className={`text-white font-question flex-1 ${getVCNVQuestionFontSize(questionItem.cau_hoi)}`}>
                  {questionItem.cau_hoi}
                </p>
              )}
            </div>

            {/* RUNNING TIMER BAR */}
            {isTimerRunning && (
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-slate-900/90 rounded-b-2xl overflow-visible">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 rounded-b-2xl relative transition-all duration-100 ease-linear shadow-[0_0_12px_rgba(251,191,36,0.8)]"
                  style={{ width: `${countUpPercent}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_8px_#fff,0_0_16px_#fbbf24] z-20" />
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ROW QUESTION BUZZER SIGNAL */}
        {buzzedPlayer && cnvBuzzedPlayers.length === 0 && (
          <div className="flex justify-center mb-1">
            <div className="bg-amber-400 text-slate-950 px-6 py-2 rounded-xl font-black font-player shadow-[0_0_20px_rgba(251,191,36,0.8)] border border-yellow-200 flex items-center gap-2 animate-bounce">
              <Bell className="w-5 h-5 text-slate-950 fill-current" />
              <span className="text-base uppercase tracking-wider">
                1. Thí sinh {matchState.players[buzzedPlayer]?.name || `Bàn ${buzzedPlayer}`}
              </span>
            </div>
          </div>
        )}

        <CandidateScoresBar matchState={matchState} buzzedPosition={buzzedPlayer} cnvBuzzedPlayers={cnvBuzzedPlayers} />
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 3. TĂNG TỐC OVERLAY
// ----------------------------------------------------
function TangTocOverlay({ matchState, matchQuestions }: { matchState: MatchState; matchQuestions: any }) {
  const tangToc = matchState.tang_toc;
  const currentQIndex = tangToc?.currentQuestionIndex ?? -1;
  const mode = tangToc?.mode || 'TRADITIONAL';

  const questionItem = currentQIndex >= 0 ? matchQuestions?.tang_toc?.cau_hoi?.[currentQIndex] : null;
  const caiTienQuestionItem = currentQIndex >= 0 ? matchQuestions?.tang_toc?.cai_tien_cau_hoi?.[currentQIndex] : null;

  const currentActiveQuestion = mode === 'IMPROVED' ? caiTienQuestionItem : questionItem;

  const isTimerRunning = matchState.isTimerRunning;
  const timerSeconds = matchState.timerSeconds;
  const maxTimer = matchState.timerTotal || (mode === 'IMPROVED' ? (caiTienQuestionItem?.loai_cau_hoi === 4 ? 40 : 30) : (currentQIndex < 2 ? 20 : 30));
  const countUpPercent = maxTimer > 0 ? Math.min(100, Math.max(0, ((maxTimer - timerSeconds) / maxTimer) * 100)) : 0;

  const showAnswers = Boolean(tangToc?.showAnswers);
  const showMediaConfig = tangToc?.showMedia !== false;
  const shouldShowMedia = Boolean(
    currentActiveQuestion?.media?.url && (showMediaConfig || isTimerRunning || showAnswers || currentActiveQuestion?.media?.showImmediate)
  );

  // Map and sort contestant answers by submission timestamp ascending
  const sortedAnswersWithPlayers = ([1, 2, 3, 4] as const).map((pos) => {
    const player = matchState.players[pos];
    const ansObj = tangToc?.answers?.find((a) => a.playerPosition === pos);
    return {
      playerPosition: pos,
      name: player?.name || `Thí sinh ${pos}`,
      answer: ansObj?.answer || '',
      timestamp: ansObj?.timestamp ?? null,
    };
  });

  const sortedAnswers = [...sortedAnswersWithPlayers].sort((a, b) => {
    if (a.timestamp !== null && b.timestamp !== null) return a.timestamp - b.timestamp;
    if (a.timestamp !== null && b.timestamp === null) return -1;
    if (a.timestamp === null && b.timestamp !== null) return 1;
    return a.playerPosition - b.playerPosition;
  });

  return (
    <div className="h-full flex flex-col justify-between font-sans relative">
      {/* FULL SCREEN CONTESTANT ANSWERS OVERLAY IN CENTER (For Traditional Mode) */}
      <AnimatePresence>
        {showAnswers && currentQIndex >= 0 && mode === 'TRADITIONAL' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl rounded-2xl p-6 flex flex-col items-center justify-center border border-indigo-500/30 shadow-[0_0_80px_rgba(0,0,0,0.9)]"
          >
            <div className="w-full max-w-4xl bg-slate-900/95 border-2 border-indigo-400/80 rounded-3xl p-8 shadow-[0_0_60px_rgba(99,102,241,0.25)] space-y-6 text-center">
              <div className="flex justify-center">
                <span className="px-4 py-1.5 bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-black rounded-full uppercase tracking-widest font-player">
                  TĂNG TỐC • CÂU SỐ {currentQIndex + 1}
                </span>
              </div>

              <div className="flex flex-col gap-3 max-w-3xl mx-auto w-full">
                {sortedAnswers.map((ans, idx) => {
                  const hasAnswer = Boolean(ans.answer);
                  const isFastest = idx === 0 && hasAnswer;

                  return (
                    <div
                      key={ans.playerPosition}
                      className={`p-4 rounded-2xl flex items-center justify-between border transition-all ${
                        isFastest
                          ? 'bg-gradient-to-r from-indigo-950/90 via-slate-900 to-indigo-950/90 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.3)] ring-1 ring-amber-400'
                          : hasAnswer
                          ? 'bg-slate-950/90 border-slate-800'
                          : 'bg-slate-950/40 border-slate-900/60 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center ${
                            isFastest
                              ? 'bg-amber-400 text-slate-950 font-bold'
                              : 'bg-slate-800 text-indigo-300'
                          }`}
                        >
                          P{ans.playerPosition}
                        </span>
                        <span className="text-base font-bold text-white font-player">
                          {ans.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-6">
                        {hasAnswer ? (
                          <span className="text-xl md:text-2xl font-black text-indigo-300 font-mono tracking-wider">
                            {ans.answer.toUpperCase()}
                          </span>
                        ) : (
                          <span className="text-base font-bold text-slate-600">
                            —
                          </span>
                        )}

                        <span className="text-sm font-mono font-bold text-amber-400 min-w-[60px] text-right">
                          {ans.timestamp !== null ? `${Math.round(ans.timestamp)}s` : '-'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP SECTION: QUESTION BOX & CONTENT */}
      <div className="w-full max-w-5xl mx-auto">
        {currentQIndex >= 0 && currentActiveQuestion && !showAnswers && (
          <div className="bg-gradient-to-b from-slate-950 via-slate-900/95 to-slate-950 backdrop-blur-2xl border-2 border-indigo-500/50 ring-1 ring-indigo-400/20 rounded-3xl p-6 shadow-[0_0_60px_rgba(0,0,0,0.95)] space-y-5">
            {/* QUESTION HEADER */}
            <div className="border-b border-indigo-500/20 pb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="px-3.5 py-1.5 bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-black rounded-xl uppercase tracking-widest font-player shadow-inner">
                  {mode === 'IMPROVED' ? 'Tăng Tốc Cải Tiến' : 'Tăng Tốc'} • Câu {currentQIndex + 1}/4
                </span>
                <div className="flex items-center gap-2 font-mono text-sm text-indigo-300 font-bold bg-indigo-950/60 px-3 py-1 rounded-lg border border-indigo-500/30">
                  <Clock className="w-4 h-4 text-indigo-400 animate-pulse" />
                  <span>{isTimerRunning ? `${timerSeconds}s` : `${maxTimer}s`}</span>
                </div>
              </div>

              <p className={`text-white font-question text-center drop-shadow-md ${getQuestionFontSize(currentActiveQuestion.noi_dung || '')}`}>
                {currentActiveQuestion.noi_dung || '(Câu hỏi Tăng Tốc)'}
              </p>

              {/* Correct Answer reveal if showExplanation */}
              {tangToc?.showExplanation && (
                <div className="mt-3 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-center space-y-1">
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider block">ĐÁP ÁN ĐÚNG</span>
                  <p className="text-xl font-black text-emerald-300 font-mono">{currentActiveQuestion.dap_an_dung}</p>
                  {currentActiveQuestion.chu_thich && (
                    <p className="text-xs text-slate-300 italic">{currentActiveQuestion.chu_thich}</p>
                  )}
                </div>
              )}
            </div>

            {/* IMPROVED MODE: HINTS GRID */}
            {mode === 'IMPROVED' && caiTienQuestionItem && (
              <div className="space-y-3">
                {/* Buzzed Player Alert if someone buzzed in */}
                {tangToc?.buzzedPlayer && (
                  <div className="p-3 bg-purple-900/90 border-2 border-purple-400 text-white font-black text-sm rounded-xl flex items-center justify-between shadow-lg animate-bounce">
                    <span className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-300" />
                      THÍ SINH {tangToc.buzzedPlayer} ({matchState.players[tangToc.buzzedPlayer as 1|2|3|4]?.name}) GIÀNH QUYỀN TRẢ LỜI!
                    </span>
                    <span className="text-xs font-mono bg-purple-950 px-2.5 py-1 rounded border border-purple-500/50">
                      Gợi ý #{ (tangToc.buzzedHintIndex ?? 0) + 1 } (+{getTangTocImprovedPoints(tangToc.buzzedHintIndex ?? 0, caiTienQuestionItem.loai_cau_hoi)}đ)
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((stt) => {
                    const hIdx = stt - 1;
                    const maxHints = caiTienQuestionItem.loai_cau_hoi === 4 ? 4 : 3;
                    if (stt > maxHints) return null;

                    const hintData = caiTienQuestionItem.goi_y?.[hIdx];
                    const currentHintIdx = tangToc.currentHintIndex ?? 0;
                    const isRevealed = (hIdx <= currentHintIdx && (isTimerRunning || currentHintIdx > 0)) || !!tangToc.showExplanation;
                    const isCurrent = hIdx === currentHintIdx && isTimerRunning;

                    return (
                      <div
                        key={stt}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isCurrent
                            ? 'bg-purple-950/90 border-indigo-400 shadow-[0_0_20px_rgba(129,140,248,0.3)] ring-2 ring-indigo-400/50'
                            : isRevealed
                            ? 'bg-slate-950/90 border-purple-500/30'
                            : 'bg-slate-950/30 border-slate-900/80 opacity-40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            isCurrent ? 'bg-indigo-500 text-white' : isRevealed ? 'bg-purple-900/50 text-purple-200' : 'bg-slate-900 text-slate-500'
                          }`}>
                            Gợi ý #{stt}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-black uppercase text-indigo-300 animate-pulse">
                              Đang mở...
                            </span>
                          )}
                        </div>
                        <p className={`text-sm font-extrabold ${isRevealed ? 'text-white' : 'text-slate-600 blur-sm select-none'}`}>
                          {isRevealed ? hintData?.noi_dung || `(Gợi ý số ${stt})` : '••••••••••••••••'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MEDIA CONTAINER (IF AVAILABLE) */}
            {shouldShowMedia && currentActiveQuestion.media?.url && (
              <div className="relative aspect-video w-full mx-auto rounded-2xl border-2 border-indigo-500/30 bg-slate-950 shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden flex items-center justify-center">
                <UniversalMediaPlayer
                  media={{
                    url: currentActiveQuestion.media.url,
                    type: currentActiveQuestion.media.type || 'image',
                  }}
                  mediaControl={matchState?.mediaControl}
                  className="w-full h-full"
                  hideControls={true}
                  hideFrame={true}
                  isTimerRunning={isTimerRunning}
                  round="TANG_TOC"
                />

                {/* TIMER BAR AT BOTTOM OF MEDIA CONTAINER */}
                {isTimerRunning && (
                  <div className="absolute bottom-0 left-0 right-0 h-2.5 bg-slate-900/90 overflow-visible">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative transition-all duration-100 ease-linear shadow-[0_0_16px_rgba(129,140,248,0.9)]"
                      style={{ width: `${countUpPercent}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_8px_#fff,0_0_16px_#c084fc] z-20" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TIMER BAR FALLBACK WHEN NO MEDIA */}
            {isTimerRunning && (!shouldShowMedia || !currentActiveQuestion.media?.url) && (
              <div className="w-full h-2.5 bg-slate-900/90 rounded-full overflow-visible relative">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full relative transition-all duration-100 ease-linear shadow-[0_0_16px_rgba(129,140,248,0.9)]"
                  style={{ width: `${countUpPercent}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_8px_#fff,0_0_16px_#c084fc] z-20" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* BOTTOM SECTION: CANDIDATE SCORES BAR AT VERY BOTTOM OF SCREEN */}
      <div>
        <CandidateScoresBar matchState={matchState} />
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 4. VỀ ĐÍCH OVERLAY
// ----------------------------------------------------
function VeDichOverlay({ matchState, matchQuestions }: { matchState: MatchState; matchQuestions: any }) {
  const vd = matchState.ve_dich;
  const activePosition = vd.currentPlayerIndex !== null ? ((vd.currentPlayerIndex + 1) as 1 | 2 | 3 | 4) : null;
  const activePlayer = activePosition ? matchState.players[activePosition] : null;
  const activeTurn = activePosition ? vd.turns[activePosition] : null;

  const currentQIndex = activeTurn?.currentQuestionIndex ?? 0;
  const activeQuestionChoice = activeTurn?.chosenPackage?.[currentQIndex];

  const questionItem = useMemo(() => {
    if (!activeTurn?.currentQuestionConfirmed || !activeQuestionChoice?.questionId || !matchQuestions?.ve_dich?.cau_hoi) {
      return null;
    }
    return matchQuestions.ve_dich.cau_hoi.find((q: any) => q.id === activeQuestionChoice.questionId);
  }, [activeTurn?.currentQuestionConfirmed, activeQuestionChoice?.questionId, matchQuestions]);

  const draft = activeTurn?.draftPackage || [20, 20, 20];
  const ruleMode = vd.ruleMode || 'O20_PLUS';
  const o19Packages = vd.o19PresetPackages || [];
  const isTimerRunning = matchState.isTimerRunning;
  const timerSeconds = matchState.timerSeconds;
  const qPts = questionItem?.muc_diem || activeQuestionChoice?.points || 20;
  const defaultSeconds = qPts === 10 ? 10 : qPts === 20 ? 15 : qPts === 30 ? 20 : 30;
  const maxTimer = matchState.timerTotal || defaultSeconds;
  const countUpPercent = maxTimer > 0 ? Math.min(100, Math.max(0, ((maxTimer - timerSeconds) / maxTimer) * 100)) : 0;

  const isPackageConfirmed = Boolean(activeTurn?.packageConfirmed);
  const chosenPkg = activeTurn?.chosenPackage || [];

  return (
    <div className="h-full flex flex-col justify-end space-y-3 font-sans">
      {/* Hide Candidate Scores until package confirmed */}
      {isPackageConfirmed && (
        <CandidateScoresBar
          matchState={matchState}
          activePosition={activePosition}
          buzzedPosition={activeTurn?.claimBuzzerPlayer}
        />
      )}

      {/* PACKAGE SELECTION GRID WHEN NOT YET CONFIRMED */}
      {activeTurn && !isPackageConfirmed && (
        !activeTurn.showPackageBoard ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-950/90 backdrop-blur-xl border border-teal-500/40 p-5 rounded-2xl shadow-xl space-y-2 w-full max-w-2xl mx-auto text-center"
          >
            <span className="px-3 py-1 bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-black rounded-full font-player uppercase tracking-wider">
              LƯỢT THI VỀ ĐÍCH
            </span>
            <h3 className="text-2xl font-black text-white uppercase font-player">{activePlayer?.name || `THÍ SINH BÀN ${activePosition}`}</h3>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="bg-gradient-to-r from-slate-950/95 via-red-950/30 to-slate-950/95 backdrop-blur-xl border-2 border-red-500/50 p-6 rounded-2xl shadow-[0_0_50px_rgba(225,29,72,0.25)] space-y-4 w-full max-w-4xl mx-auto"
          >
            <div className="text-center">
              <span className="px-4 py-1.5 bg-red-500/20 border border-red-500/40 text-red-300 text-sm font-black rounded-full font-player uppercase tracking-wider">
                LỰA CHỌN GÓI CÂU HỎI ({ruleMode === 'O19' ? 'LUẬT O19' : 'LUẬT O20+'}) • {activePlayer?.name || `Thí sinh ${activePosition}`}
              </span>
            </div>

            {ruleMode === 'O19' ? (
              <div
                className="grid gap-4 max-w-2xl mx-auto w-full"
                style={{ gridTemplateColumns: `repeat(${o19Packages.length || 4}, minmax(0, 1fr))` }}
              >
                {o19Packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="p-4 bg-slate-900/90 border-2 border-red-500/40 rounded-xl text-center flex flex-col items-center justify-center shadow-lg"
                  >
                    <div className="text-3xl font-black text-amber-400 font-mono">{pkg.totalPoints}</div>
                  </div>
                ))}
              </div>
            ) : (
              /* O20+ DYNAMIC 1-ROW GRID */
              <div
                className="grid gap-4 w-full"
                style={{ gridTemplateColumns: `repeat(${draft.length}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: draft.length }).map((_, colIdx) => {
                  const pts = draft[colIdx];
                  return (
                    <div key={colIdx} className="space-y-2 text-center">
                      <div className="text-sm font-black text-red-400/90 font-player uppercase tracking-widest">
                        CÂU {colIdx + 1}
                      </div>
                      <div
                        className={`py-6 rounded-2xl border-2 text-3xl md:text-4xl font-black font-mono text-center transition-all ${
                          pts === null || pts === undefined
                            ? 'bg-slate-900/90 border-slate-800 text-slate-500 shadow-inner'
                            : 'bg-red-600 border-red-200 text-white shadow-[0_0_25px_rgba(239,68,68,0.9)] scale-105'
                        }`}
                      >
                        {pts === null || pts === undefined ? '?' : `${pts}Đ`}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )
      )}

      {/* CONFIRMED PACKAGE & QUESTION BOX */}
      {isPackageConfirmed && (
        <motion.div
          key={`vd_turn_${activePosition ?? 0}`}
          initial={{ opacity: 0, y: 60, rotateX: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring', damping: 20, stiffness: 90 }}
          style={{ transformStyle: 'preserve-3d' }}
          className="grid grid-cols-12 gap-3 items-stretch"
        >
          {/* LEFT: QUESTION BOX */}
          <div className="col-span-9 relative bg-gradient-to-r from-slate-950/95 via-red-950/25 to-slate-950/95 backdrop-blur-xl border-2 border-red-500/50 rounded-2xl px-6 py-4 shadow-[0_0_35px_rgba(225,29,72,0.15)] flex flex-col justify-between overflow-visible min-h-[190px] h-[190px]">
            <BorderTimer seconds={timerSeconds} total={maxTimer} isRunning={isTimerRunning} />
            {/* FLOATING STAR INDICATOR IF ACTIVE */}
            {activeTurn.starUsed && (
              <div className="absolute top-3 right-4 z-10 flex items-center gap-1.5 bg-yellow-400 text-slate-950 px-3 py-1 rounded-lg font-black font-player text-xs shadow-lg animate-pulse">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>NGÔI SAO HY VỌNG</span>
              </div>
            )}

            {/* Question Content - Pushed directly to top of box */}
            <div className="flex-1 flex items-start justify-start pt-0 gap-5 overflow-hidden z-10">
              {questionItem ? (
                <>
                  {questionItem.media?.url && (
                    <div className="shrink-0 aspect-video max-h-32 max-w-[200px] rounded-xl border border-red-500/30 bg-slate-950 p-0.5 overflow-hidden shadow-lg flex items-center justify-center">
                      <UniversalMediaPlayer
                        media={{
                          url: questionItem.media.url,
                          type: questionItem.media.type || 'image',
                        }}
                        mediaControl={matchState?.mediaControl}
                        round="VE_DICH"
                        className="w-full h-full object-contain"
                        hideControls={true}
                        hideFrame={true}
                        isTimerRunning={isTimerRunning}
                      />
                    </div>
                  )}
                  {questionItem.noi_dung && (
                    <p className={`text-white font-question flex-1 ${getVDQuestionFontSize(questionItem.noi_dung)}`}>
                      {questionItem.noi_dung}
                    </p>
                  )}
                </>
              ) : null}
            </div>
          </div>

          {/* RIGHT: CANDIDATE TOTAL SCORE + 3 CHOICE CELLS */}
          <div className="col-span-3 bg-gradient-to-br from-slate-950/95 via-red-950/30 to-slate-950/95 backdrop-blur-xl border-2 border-red-500/50 rounded-2xl flex flex-col justify-between overflow-hidden shadow-[0_0_35px_rgba(225,29,72,0.15)] min-h-[190px] h-[190px]">
            <div className="flex-1 flex items-center justify-center p-3">
              <span className="text-5xl md:text-6xl font-black font-mono text-white tracking-tight drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                <CountUpScore score={activePlayer?.score ?? 0} />
              </span>
            </div>

            <div
              className="grid border-t-2 border-red-500/40 h-12"
              style={{ gridTemplateColumns: `repeat(${chosenPkg.length || 3}, minmax(0, 1fr))` }}
            >
              {(chosenPkg.length > 0 ? chosenPkg : [0, 1, 2]).map((item, idx) => {
                const isCurrent = idx === currentQIndex;
                const points = typeof item === 'object' && item !== null ? item.points : (draft[idx] || 20);

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-center text-sm font-black font-mono transition-all border-r last:border-r-0 border-red-500/30 ${
                      isCurrent
                        ? 'bg-red-600 text-white font-black shadow-lg shadow-red-600/50'
                        : 'bg-slate-900/80 text-slate-300 font-bold'
                    }`}
                  >
                    {points}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// 5. CÂU HỎI PHỤ OVERLAY
// ----------------------------------------------------
function CHPhuOverlay({ matchState, matchQuestions }: { matchState: MatchState; matchQuestions: any }) {
  const chPhu = matchState.cau_hoi_phu;
  const currentQIdx = chPhu?.currentQuestionIndex ?? 0;
  const questionItem = matchQuestions?.cau_hoi_phu?.cau_hoi?.[currentQIdx] || matchQuestions?.cau_hoi_phu?.[currentQIdx];
  const questionRevealed = chPhu?.questionRevealed ?? false;

  const isTimerRunning = matchState.isTimerRunning;
  const timerSeconds = matchState.timerSeconds;
  const maxTimer = matchState.timerTotal || (chPhu?.ruleMode === 'SHOOTOUT' ? 10 : 15);

  const confirmedPlayers = chPhu?.confirmedPlayers || [];

  return (
    <div className="h-full flex flex-col justify-end space-y-3 font-sans">
      {(chPhu?.ruleMode === 'SHOOTOUT' || chPhu?.ruleMode === 'IMPROVED') && confirmedPlayers.length > 0 ? (
        <div className={`grid gap-3 bg-slate-950/90 backdrop-blur-xl border border-slate-800/80 p-2.5 rounded-2xl shadow-2xl font-player relative ${
          confirmedPlayers.length === 2 ? 'grid-cols-2' : confirmedPlayers.length === 3 ? 'grid-cols-3' : 'grid-cols-4'
        }`}>
          {confirmedPlayers.map((pos) => {
            const player = matchState.players[pos as 1 | 2 | 3 | 4];
            const isTurn = chPhu?.ruleMode === 'SHOOTOUT' && chPhu?.currentTurnPlayer === pos;
            const isBuzzed = (chPhu?.buzzedPlayer ?? matchState.buzzedPlayer) === pos;
            const name = player?.name || `Thí sinh ${pos}`;

            return (
              <div
                key={pos}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-300 border ${
                  isTurn
                    ? 'bg-amber-500/20 border-2 border-amber-400 text-white shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-pulse'
                    : isBuzzed
                    ? 'bg-emerald-500/20 border-2 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] animate-pulse'
                    : 'bg-slate-900/60 border-slate-850 text-slate-200'
                }`}
              >
                <span className="text-xs font-black truncate max-w-[130px]">{name}</span>
                <div className="ml-auto pl-2 flex-shrink-0">
                  {chPhu?.ruleMode === 'SHOOTOUT' ? (
                    <ShootoutScoreDots
                      history={chPhu?.history?.[pos]}
                      isCurrentTurn={isTurn}
                      size="md"
                    />
                  ) : (
                    <ImprovedScoreDots
                      score={chPhu?.scores?.[pos]}
                      totalTime={chPhu?.totalTime?.[pos]}
                      size="sm"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <CandidateScoresBar
          matchState={matchState}
          filterPositions={chPhu?.confirmedPlayers || []}
          buzzedPosition={chPhu?.buzzedPlayer ?? matchState.buzzedPlayer}
        />
      )}

      <div className="relative bg-slate-950/90 backdrop-blur-xl border border-teal-500/40 rounded-2xl px-6 py-5 shadow-2xl flex flex-col justify-between overflow-visible min-h-[190px] h-[190px]">
        <BorderTimer seconds={timerSeconds} total={maxTimer} isRunning={isTimerRunning} />
        <div className="w-full flex-1 flex items-center gap-5">
          {questionRevealed && questionItem ? (
            <>
              {questionItem.media?.url && (
                <div className="shrink-0 aspect-video max-h-32 max-w-[200px] rounded-xl border border-teal-500/30 bg-slate-950 p-0.5 overflow-hidden shadow-lg flex items-center justify-center">
                  <UniversalMediaPlayer
                    media={{
                      url: questionItem.media.url,
                      type: questionItem.media.type || 'image',
                    }}
                    mediaControl={matchState?.mediaControl}
                    round="CH_PHU"
                    className="w-full h-full object-contain"
                    hideControls={true}
                    hideFrame={true}
                    isTimerRunning={isTimerRunning}
                  />
                </div>
              )}
              {questionItem.noi_dung && (
                <p className={`text-white font-question flex-1 ${getQuestionFontSize(questionItem.noi_dung)}`}>
                  {questionItem.noi_dung}
                </p>
              )}
            </>
          ) : (
            <div className="w-full text-center py-4">
              <span className="text-teal-400/80 font-black uppercase tracking-widest text-lg">
                CÂU HỎI PHỤ SỐ {currentQIdx + 1}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// ĐẤU TRÍ OVERLAY (THIẾT KẾ GIỐNG GIAO DIỆN KHOI DONG)
// ----------------------------------------------------
function DauTriOverlay({ matchState, matchQuestions }: { matchState: MatchState; matchQuestions: any }) {
  const dauTri = matchState.dau_tri;
  if (!dauTri) return null;

  const questionsList = matchQuestions?.dau_tri?.cau_hoi || [];
  const currentMainQ: any = questionsList[dauTri.currentMainQuestionIndex] || { noi_dung: '' };
  const currentBonusQ: any = dauTri.activeBonusPack?.cau_hoi?.[dauTri.currentBonusQuestionIndex] || { noi_dung: '' };

  const isMainStage = dauTri.stage === 'MAIN_QUESTION';
  const activeBonusPos = !isMainStage ? dauTri.activeBonusPlayerPosition : null;

  // Hiệu ứng chỉ xuất hiện khi bắt đầu câu hỏi chính mới hoặc khi hiện chủ đề gói thưởng
  const overlayAnimationKey = isMainStage
    ? `dt_main_${dauTri.currentMainQuestionIndex}`
    : `dt_bonus_${dauTri.bonusPacksQueueIndex}_${dauTri.activeBonusPack?.chu_de || ''}`;

  return (
    <div className="h-full flex flex-col justify-end space-y-3 font-sans">
      {/* 4 CANDIDATE SCORES BAR (Olympia style, same as Khoi Dong) */}
      <CandidateScoresBar
        matchState={matchState}
        activePosition={activeBonusPos}
        buzzedPosition={dauTri.buzzedPlayer}
      />

      {/* QUESTION BOX - MATCHING KHOI DONG OVERLAY DESIGN */}
      <motion.div
        key={overlayAnimationKey}
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', damping: 20, stiffness: 90 }}
        className="relative bg-slate-950/90 backdrop-blur-xl border border-indigo-500/40 rounded-2xl px-6 py-5 shadow-[0_0_40px_rgba(99,102,241,0.25)] flex flex-col justify-between overflow-visible min-h-[190px] h-[190px]"
      >
        {/* Top Badges / Indicators */}
        <div className="absolute -top-3.5 left-6 flex items-center gap-2 z-20 pointer-events-none">
          <div className="bg-indigo-600 text-white font-extrabold text-xs px-3.5 py-1 rounded-full uppercase tracking-wider shadow-lg border border-indigo-400/50 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-yellow-300" />
            <span>
              {isMainStage
                ? `CÂU HỎI CHÍNH #${dauTri.currentMainQuestionIndex + 1} - 10 ĐIỂM`
                : `GÓI THƯỞNG: "${dauTri.activeBonusPack?.chu_de || ''}"`}
            </span>
          </div>

          {/* Time Limit Indicator - Only visible when <= 3 minutes (180s) */}
          {dauTri.endRule === 'TIME_LIMIT' && dauTri.overallSecondsLeft <= 180 && (
            <div className="bg-rose-600 text-white font-mono font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-lg border border-rose-300 animate-pulse flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {Math.floor(dauTri.overallSecondsLeft / 60)}:{(dauTri.overallSecondsLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}

          {/* Score Limit Indicator */}
          {dauTri.endRule === 'SCORE_LIMIT' && (
            <div className="bg-indigo-700 text-white font-mono font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-lg border border-indigo-400 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>Đích: {dauTri.targetScore || 100}đ</span>
            </div>
          )}
        </div>

        {/* Protruding Right Badge: Buzzed Contestant */}
        {dauTri.buzzedPlayer && (
          <div className="absolute -top-3.5 right-6 z-20 pointer-events-none">
            <div className="bg-amber-500 text-slate-950 font-black text-xs px-3.5 py-1 rounded-full shadow-lg border border-yellow-300 animate-pulse flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5" />
              <span>BÀN {dauTri.buzzedPlayer}: {matchState.players[dauTri.buzzedPlayer]?.name} BẤM CHUÔNG!</span>
            </div>
          </div>
        )}

        {/* ACTIVE QUESTION CONTENT */}
        {isMainStage ? (
          !dauTri.isMainQuestionRevealed ? (
            /* Khi chưa hiện câu hỏi: Chỉ hiện "CÂU HỎI CHÍNH #X - 10 điểm" */
            <div className="w-full flex-1 flex items-center justify-center text-center">
              <h2 className="text-2xl md:text-3xl font-black text-indigo-300 uppercase tracking-wider">
                CÂU HỎI CHÍNH #{dauTri.currentMainQuestionIndex + 1} - 10 ĐIỂM
              </h2>
            </div>
          ) : (
            /* Khi đã hiện câu hỏi: Hiển thị nội dung với cỡ chữ mặc định tự động thu nhỏ giống các vòng khác */
            <div className="w-full flex-1 flex items-center gap-5">
              {currentMainQ.media?.url && (
                <div className="shrink-0 aspect-video max-h-[140px] max-w-[260px] md:max-w-[280px] rounded-xl border-2 border-indigo-500/40 bg-slate-950 p-0.5 overflow-hidden shadow-lg flex items-center justify-center">
                  <UniversalMediaPlayer
                    media={{
                      url: currentMainQ.media.url,
                      type: currentMainQ.media.type || 'image',
                    }}
                    mediaControl={matchState?.mediaControl}
                    round="DAU_TRI"
                    className="w-full h-full object-contain"
                    hideControls={true}
                    hideFrame={true}
                  />
                </div>
              )}
              {currentMainQ.noi_dung && (
                <p className={`text-white font-question flex-1 ${getQuestionFontSize(currentMainQ.noi_dung)}`}>
                  {currentMainQ.noi_dung}
                </p>
              )}
            </div>
          )
        ) : (
          /* BONUS STAGE */
          dauTri.stage === 'BONUS_QUESTION' && currentBonusQ?.noi_dung ? (
            <div className="w-full flex-1 flex items-center gap-5">
              {currentBonusQ.media?.url && (
                <div className="shrink-0 aspect-video max-h-[140px] max-w-[260px] md:max-w-[280px] rounded-xl border-2 border-amber-500/40 bg-slate-950 p-0.5 overflow-hidden shadow-lg flex items-center justify-center">
                  <UniversalMediaPlayer
                    media={{
                      url: currentBonusQ.media.url,
                      type: currentBonusQ.media.type || 'image',
                    }}
                    mediaControl={matchState?.mediaControl}
                    round="DAU_TRI"
                    className="w-full h-full object-contain"
                    hideControls={true}
                    hideFrame={true}
                  />
                </div>
              )}
              <div className="flex-1 space-y-1">
                <span className="text-xs font-bold text-amber-400">
                  CÂU THƯỞNG #{dauTri.currentBonusQuestionIndex + 1} (5 ĐIỂM)
                </span>
                <p className={`text-white font-question ${getQuestionFontSize(currentBonusQ.noi_dung)}`}>
                  {currentBonusQ.noi_dung}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full flex-1 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-black uppercase tracking-widest text-amber-400 mb-1">
                GÓI CÂU HỎI THƯỞNG (3 CÂU - 15 ĐIỂM)
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-white">
                "{dauTri.activeBonusPack?.chu_de}"
              </h2>
              {dauTri.activeBonusPlayerPosition && (
                <p className="text-xs text-indigo-300 mt-1 font-bold">
                  Thí sinh: {matchState.players[dauTri.activeBonusPlayerPosition]?.name}
                </p>
              )}
            </div>
          )
        )}

        {/* Bonus Timer Badge */}
        {!isMainStage && dauTri.stage === 'BONUS_QUESTION' && (
          <div className="absolute bottom-3 right-5 z-20 pointer-events-none">
            <div className={`px-3.5 py-1 rounded-xl shadow-xl text-2xl md:text-3xl font-mono font-black tracking-wider flex items-center justify-center border ${
              dauTri.bonusTimerSecondsLeft <= 3
                ? 'bg-rose-950/95 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-slate-900/95 border-amber-500/60 text-amber-400'
            }`}>
              {dauTri.bonusTimerSecondsLeft}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ----------------------------------------------------
// 6. SUMMARY OVERLAY
// ----------------------------------------------------
function SummaryOverlay({ matchState }: { matchState: MatchState }) {
  const isRoundsMode = matchState.summary?.mode === 'ROUNDS';

  // Sort players lowest score to highest score for reveal order (Rank 4 [lowest] to Rank 1 [highest])
  const playersInOrder = ([1, 2, 3, 4] as const)
    .map((pos) => ({
      pos,
      score: matchState.players[pos]?.score ?? 0,
      name: matchState.players[pos]?.name || `Thí sinh ${pos}`,
    }))
    .sort((a, b) => a.score - b.score || a.pos - b.pos);

  const [revealedCount, setRevealedCount] = useState(1);

  // Requirement 5: Reveal step 1 to 4 every 3.5s and stop permanently at 4 (highest scorer), do not replay
  useEffect(() => {
    if (!isRoundsMode) return;
    const timer = setInterval(() => {
      setRevealedCount((prev) => {
        if (prev >= 4) {
          clearInterval(timer);
          return 4;
        }
        return prev + 1;
      });
    }, 3500);
    return () => clearInterval(timer);
  }, [isRoundsMode]);

  // Requirement 6: Only display when "Tổng kết điểm theo vòng" is activated (mode === 'ROUNDS')
  if (!isRoundsMode) {
    return null;
  }

  const activeIndex = Math.min(revealedCount - 1, 3);
  const activeCandidate = playersInOrder[activeIndex];

  // Right leaderboard stack ordered from Rank 1 (top of stack) to Rank 4 (bottom of stack)
  const stackedRanks = playersInOrder.slice().reverse();

  return (
    <div className="h-full flex flex-col justify-end font-sans relative">
      <div className="flex items-end justify-between gap-16 md:gap-20 pb-4">
        {/* LEFT/MAIN FOCUS: ACTIVE CANDIDATE BANNER WITH PROMINENT SCORE BOX */}
        <div className="flex-1 max-w-2xl flex items-center relative py-2">
          {/* Requirement 2: Horizontal accent line stretching all the way to the far left edge of the screen */}
          <div className="absolute right-full mr-0 w-screen h-2.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.9)]" />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCandidate.pos}
              initial={{ opacity: 0, x: -30, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-0 w-full"
            >
              {/* PROMINENT SCORE BOX */}
              <div className="z-20 bg-emerald-500 text-slate-950 px-6 py-4 rounded-2xl shadow-[0_0_35px_rgba(16,185,129,0.8)] border-2 border-emerald-200 flex items-center justify-center min-w-[130px] shrink-0 font-mono text-4xl md:text-5xl font-black">
                <CountUpScore score={activeCandidate.score} />
              </div>

              {/* Clean candidate name banner */}
              <div className="z-10 -ml-4 pl-8 pr-8 py-4.5 bg-gradient-to-r from-slate-950/95 via-teal-950/90 to-slate-900/95 border-y-2 border-r-2 border-emerald-400/60 rounded-r-2xl shadow-2xl flex-1 flex items-center justify-between min-w-0">
                <h2 className="text-2xl md:text-3xl font-black text-white font-player uppercase tracking-wider truncate">
                  {activeCandidate.name}
                </h2>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT SIDE: Compact leaderboard stack flying in from right */}
        <div className="w-72 md:w-80 shrink-0 space-y-2">
          {stackedRanks.map((player, reverseIdx) => {
            const rankOrder = 4 - reverseIdx; // Rank 4 = 1 (bottom), Rank 1 = 4 (top)
            const isRevealed = rankOrder <= revealedCount;
            const isActive = rankOrder === activeIndex + 1;

            return (
              <div key={player.pos} className="min-h-[42px]">
                <AnimatePresence>
                  {isRevealed && (
                    <motion.div
                      initial={{ opacity: 0, x: 250 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ type: 'spring', damping: 22, stiffness: 140 }}
                      className={`px-4 py-2.5 rounded-xl border transition-all duration-300 flex items-center justify-between shadow-lg ${
                        isActive
                          ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-[1.02]'
                          : 'bg-slate-950/90 border-slate-800/80 text-slate-200'
                      }`}
                    >
                      <span className="text-sm font-extrabold font-player truncate pr-2">
                        {player.name}
                      </span>
                      <span
                        className={`font-mono text-base md:text-lg font-black ${
                          isActive ? 'text-emerald-300' : 'text-emerald-400'
                        }`}
                      >
                        {player.score}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// JEOPARDY OVERLAY (Bottom Question Frame + Candidate Scores Bar)
// ----------------------------------------------------
function JeopardyOverlay({
  matchState,
}: {
  matchState: MatchState;
}) {
  const jp = matchState.jeopardy;
  if (!jp) return null;

  const activeClue =
    jp.selectedClue &&
    jp.categories?.[jp.selectedClue.categoryIndex]?.clues?.[jp.selectedClue.clueIndex];
  const activeCategoryTitle =
    jp.selectedClue && jp.categories?.[jp.selectedClue.categoryIndex]?.title;

  const buzzedPos = jp.buzzedPlayer || matchState.buzzedPlayer;

  return (
    <div className="w-full h-full flex flex-col justify-end relative p-2 md:p-4 pb-3">
      {/* Container holding Question Frame & Candidate Scores Bar at the bottom */}
      <div className="w-full space-y-2.5">
        {/* Question Frame (Active Clue ONLY) */}
        <AnimatePresence>
          {activeClue && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 md:p-3.5 shadow-xl flex flex-col justify-between space-y-2 relative overflow-hidden"
            >
              {/* Header: Category Title & Point Value */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-500/15 border border-blue-400/40 text-sky-400 font-bold text-[11px] rounded-full uppercase tracking-wider">
                    J!
                  </span>
                  <span className="text-xs md:text-sm font-bold text-sky-300 uppercase tracking-wide">
                    {activeCategoryTitle}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {buzzedPos && (
                    <span className="px-2.5 py-0.5 bg-sky-500/20 text-sky-200 border border-sky-400/50 text-xs font-bold rounded-full uppercase tracking-wider animate-pulse flex items-center gap-1">
                      <Bell className="w-3 h-3 text-sky-400 fill-sky-400" /> TS {buzzedPos} CHUÔNG!
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 bg-sky-500/15 text-sky-300 border border-sky-400/40 text-xs font-bold rounded-full uppercase tracking-wider">
                    {activeClue.points} ĐIỂM
                  </span>
                </div>
              </div>

              {/* Question Text & Media Content */}
              <div className="flex flex-col md:flex-row items-center gap-3 text-center md:text-left py-0.5 min-h-[48px]">
                {activeClue.media?.url && (
                  <div className="shrink-0 max-w-xs max-h-24 overflow-hidden rounded-lg border border-slate-800 bg-black/60 flex items-center justify-center">
                    {activeClue.media.type === 'video' ? (
                      <video src={activeClue.media.url} controls autoPlay className="max-h-24 rounded-lg" />
                    ) : activeClue.media.type === 'audio' ? (
                      <audio src={activeClue.media.url} controls autoPlay className="w-full p-1" />
                    ) : (
                      <img src={activeClue.media.url} alt="Gợi ý" className="max-h-24 object-contain rounded-lg" />
                    )}
                  </div>
                )}
                <div className="flex-1 w-full">
                  <h2 className="font-semibold text-slate-100 text-xs md:text-sm leading-relaxed tracking-wide">
                    {activeClue.question}
                  </h2>
                </div>
              </div>

              {/* 10-Segmented Time Bar (5s Timer) */}
              <div className="w-full pt-1.5 border-t border-slate-800/80">
                <div className="grid grid-cols-10 gap-1.5 w-full">
                  {Array.from({ length: 10 }).map((_, i) => {
                    const dist = Math.min(i, 9 - i);
                    const sec = jp.timer5sSeconds ?? matchState.timerSeconds ?? 0;
                    const isRunning = jp.is5sTimerRunning || matchState.isTimerRunning;
                    const isActive = isRunning && sec > (4 - dist);

                    return (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-200 border ${
                          isActive
                            ? 'bg-sky-400 border-sky-300 shadow-sm'
                            : 'bg-slate-800/80 border-slate-700/50 opacity-25'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Candidate Scores Bar at the bottom */}
        <CandidateScoresBar
          matchState={matchState}
          buzzedPosition={buzzedPos}
        />
      </div>
    </div>
  );
}

// ----------------------------------------------------
// MA TRẬN KÉP OVERLAY
// ----------------------------------------------------
function MaTranKepOverlay({ matchState }: { matchState: MatchState }) {
  const mtk = matchState.ma_tran_kep;
  const timerLeft = mtk?.timerSecondsLeft ?? 180;
  const totalTimer = mtk?.timerTotalSeconds || 180;
  const questions = mtk?.questions || (matchState as any)?.matchQuestions?.ma_tran_kep?.cau_hoi || [];
  const activePos = mtk?.activePlayerPosition || 1;

  // Local ticker state for smooth 5s countdown rendering
  const [now, setNow] = React.useState(Date.now());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 250);
    return () => clearInterval(interval);
  }, []);

  const activePlayer = matchState.players[activePos];
  const activePlayerState = mtk?.playerStates?.[activePos];
  const activeBoard = activePlayerState?.board || [];
  const activeSelectedIndices = activePlayerState?.selectedCellIndices || [];
  const activeFeedback = activePlayerState?.feedbackState || 'NONE';

  // Calculate time bar percentage
  const timerPercent = Math.max(0, Math.min(100, (timerLeft / totalTimer) * 100));

  return (
    <div className="w-full h-full flex flex-col justify-end p-4 md:p-6 text-white font-sans relative overflow-hidden">
      {/* Top Left / Above 4 Boxes: Active Contestant Board */}
      <div className="mb-3 self-start">
        <div className="w-[32vw] max-w-[400px] bg-slate-950/95 backdrop-blur-md rounded-2xl border-2 border-indigo-500/50 p-2.5 flex flex-col gap-1.5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1 px-1">
            <span className="text-[11px] font-extrabold text-indigo-300 uppercase tracking-wide truncate">
              Bảng {activePos}: {activePlayer?.name || `Thí sinh ${activePos}`}
            </span>
          </div>

          {/* 4x3 Board Grid */}
          <div className="grid grid-cols-4 gap-1 flex-1">
            {activeBoard.map((card, cIdx) => {
              const isSelected = activeSelectedIndices.includes(cIdx);
              let bg = 'bg-slate-900 border-slate-800 text-slate-300';
              if (isSelected) {
                if (activeFeedback === 'BOTH_CORRECT') bg = 'bg-emerald-600 border-emerald-400 text-white font-black animate-pulse';
                else if (activeFeedback === 'ONE_CORRECT') bg = 'bg-amber-600 border-amber-400 text-white font-black animate-pulse';
                else if (activeFeedback === 'BOTH_INCORRECT') bg = 'bg-rose-600 border-rose-400 text-white font-black animate-bounce';
                else bg = 'bg-indigo-600 border-indigo-400 text-white font-black shadow-md';
              }

              return (
                <div key={cIdx} className={`h-9 rounded-lg border text-[10px] leading-tight font-extrabold flex items-center justify-center text-center p-1 ${bg}`}>
                  <span className="line-clamp-2">
                    {mtk?.status === 'RUNNING' || mtk?.status === 'ENDED' ? card.text : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row: 4 Boxes for 4 Contestants */}
      <div className="grid grid-cols-4 gap-3.5 w-full">
        {[1, 2, 3, 4].map(pos => {
          const p = matchState.players[pos];
          const pState = mtk?.playerStates?.[pos];
          const solvedCount = pState?.solvedQuestionIds?.length || 0;
          const isFinished = pState?.isFinished || false;
          const isLocked = pState?.isLocked || false;
          const lockEnd = pState?.lockEndTime || 0;
          const feedbackState = pState?.feedbackState || 'NONE';
          const currentQIdx = pState?.currentQuestionIndex ?? 0;
          const activeQ = questions[currentQIdx];
          const board = pState?.board || [];
          const selectedIndices = pState?.selectedCellIndices || [];

          // Selected card texts
          const selectedCards = selectedIndices.map(idx => board[idx]?.text).filter(Boolean);

          // Calculate lock remaining seconds
          const lockRemainingSec = isLocked && lockEnd ? Math.max(0, Math.ceil((lockEnd - now) / 1000)) : 0;

          // Box styling
          let boxStyle = 'bg-slate-950/90 border-slate-800 text-white';
          if (isFinished) {
            boxStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-100';
          } else if (feedbackState === 'BOTH_CORRECT' || feedbackState === 'ONE_CORRECT') {
            // Correct answer: Highlight Green for 1s
            boxStyle = 'bg-emerald-600/40 border-emerald-400 text-emerald-100 animate-pulse ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/30';
          } else if (isLocked || lockRemainingSec > 0) {
            // Pass/Penalized: Dark black with 5s countdown
            boxStyle = 'bg-black/95 border-rose-950 text-slate-500 shadow-none';
          }

          return (
            <div key={pos} className={`rounded-2xl border p-3 flex flex-col justify-between gap-2 shadow-2xl backdrop-blur-md transition-all ${boxStyle}`}>
              {/* Contestant Header: "1", "2", "3", "4" */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-indigo-600 text-white text-[10px] font-black shrink-0">
                    {pos}
                  </span>
                  <span className="font-bold text-xs text-white truncate">
                    {p?.name || `Thí sinh ${pos}`}
                  </span>
                </div>
              </div>

              {/* Progress & Question Info */}
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Đúng: {solvedCount}/12
                </span>
                {isLocked || lockRemainingSec > 0 ? (
                  <span className="text-rose-400 font-black flex items-center gap-1 animate-pulse">
                    <Lock className="w-3 h-3 text-rose-400" /> Bỏ qua ({lockRemainingSec}s)
                  </span>
                ) : (
                  <span className="text-slate-400">Câu {currentQIdx + 1}/12</span>
                )}
              </div>

              {/* Current Question Prompt */}
              <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800 text-[10px] font-semibold text-amber-200 line-clamp-2 h-9 flex items-center">
                {mtk?.status !== 'RUNNING' && mtk?.status !== 'ENDED' ? (
                  <span className="text-slate-500 italic">Chờ bắt đầu...</span>
                ) : isFinished ? (
                  <span className="text-emerald-400 font-bold">Đã hoàn thành 12 câu!</span>
                ) : (
                  <span>{activeQ ? activeQ.noi_dung : `Câu ${currentQIdx + 1}`}</span>
                )}
              </div>

              {/* Contestant's 2 Selected Answers */}
              <div className="bg-indigo-950/50 p-1.5 rounded-lg border border-indigo-500/30 flex items-center justify-between text-[10px]">
                <span className="text-indigo-300 font-extrabold uppercase shrink-0">Đã chọn:</span>
                <div className="font-bold text-slate-100 truncate text-right pl-1">
                  {mtk?.status === 'RUNNING' || mtk?.status === 'ENDED' ? (
                    selectedCards.length > 0 ? selectedCards.join(' + ') : <span className="text-slate-500 italic">Chưa chọn ô</span>
                  ) : (
                    <span className="text-slate-500 italic">Chưa chọn</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Time Progress Bar directly below the 4 contestant boxes */}
      <div className="w-full bg-slate-900/90 h-2 rounded-full overflow-hidden border border-slate-800 mt-2.5 shadow-inner">
        <div
          className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 h-full transition-all duration-300 ease-linear rounded-full"
          style={{ width: `${timerPercent}%` }}
        />
      </div>
    </div>
  );
}
