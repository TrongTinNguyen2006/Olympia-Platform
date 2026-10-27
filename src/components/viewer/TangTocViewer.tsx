import React from 'react';
import { MatchState, getTangTocImprovedPoints } from '../../types.js';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Trophy } from 'lucide-react';
import UniversalMediaPlayer from '../UniversalMediaPlayer.js';
import { RoundLogoRenderer } from '../common/RoundLogoAssets.js';
import RoundTitleScreen from '../common/RoundTitleScreen.js';

interface TangTocViewerProps {
  matchState: MatchState;
  matchQuestions?: any;
}

function CircularTimerClock({ seconds, total, isRunning }: { seconds: number; total: number; isRunning: boolean }) {
  const maxSec = total > 0 ? total : 30;
  const fraction = isRunning ? Math.max(0, Math.min(1, seconds / maxSec)) : 1;
  const integerSeconds = isRunning ? Math.max(0, Math.ceil(seconds)) : (seconds > 0 ? Math.ceil(seconds) : maxSec);
  
  const size = 120;
  const strokeWidth = 8;
  const center = size / 2;
  const radius = center - strokeWidth - 4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - fraction);
  
  // Angle starting from top (-90deg = -PI/2) moving clockwise
  const angle = -Math.PI / 2 + 2 * Math.PI * fraction;
  const nodeX = center + radius * Math.cos(angle);
  const nodeY = center + radius * Math.sin(angle);

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-[120px] h-[120px] flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            className="stroke-slate-800/80"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active progress ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            className="stroke-indigo-400 transition-all duration-100 ease-linear"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Glowing node running smoothly along perimeter */}
        {isRunning && fraction > 0 && (
          <div
            className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_12px_#a855f7,0_0_20px_#818cf8] border-2 border-indigo-400 z-10 transition-all duration-100 ease-linear transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${nodeX}px`,
              top: `${nodeY}px`,
            }}
          />
        )}

        {/* Integer countdown display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
          <span className={`text-3xl lg:text-4xl font-black font-mono tracking-tight ${isRunning ? 'text-indigo-300 animate-pulse' : 'text-slate-400'}`}>
            {integerSeconds}
          </span>
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest -mt-1">
            GIÂY
          </span>
        </div>
      </div>
    </div>
  );
}

export default function TangTocViewer({ matchState, matchQuestions }: TangTocViewerProps) {
  const tangToc = matchState.tang_toc;
  const isTimerRunning = matchState.isTimerRunning;
  const timerSeconds = matchState.timerSeconds;
  const currentQIndex = tangToc?.currentQuestionIndex ?? -1;
  const mode = tangToc?.mode || 'TRADITIONAL';

  const questionItem = matchQuestions?.tang_toc?.cau_hoi?.[currentQIndex];
  const caiTienQuestionItem = matchQuestions?.tang_toc?.cai_tien_cau_hoi?.[currentQIndex];

  const currentActiveQuestion = mode === 'IMPROVED' ? caiTienQuestionItem : questionItem;

  // Configure timer
  const maxTimer = matchState.timerTotal || (mode === 'IMPROVED' ? (caiTienQuestionItem?.loai_cau_hoi === 4 ? 40 : 30) : (currentQIndex < 2 ? 20 : 30));
  const countUpPercent = isTimerRunning ? Math.min(100, Math.max(0, ((maxTimer - timerSeconds) / maxTimer) * 100)) : 0;

  const buzzedPos = matchState.buzzedPlayer || tangToc?.buzzedPlayer;

  // Map and sort contestant answers by submission timestamp ascending
  const sortedAnswersWithPlayers = ([1, 2, 3, 4] as const).map((pos) => {
    const player = matchState.players[pos];
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

  // Splash screen if no question is selected yet
  if (currentQIndex < 0) {
    const customSetting = matchState?.roundCustomSettings?.['TANG_TOC'];
    const customRoundLogo = customSetting?.customLogoUrl || customSetting?.logoUrl;
    const roundName = customSetting?.customName?.trim() || 'TĂNG TỐC';

    return <RoundTitleScreen title={roundName} logoUrl={customRoundLogo} roundKey="TANG_TOC" id="tang-toc-viewer-intro" />;
  }

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
      <div className="flex-1 flex flex-col justify-between space-y-6">

        {/* Center content */}
        <div className="flex-1 flex flex-col justify-center w-full my-2">
          {mode === 'IMPROVED' && caiTienQuestionItem ? (
            /* IMPROVED MODE VIEW (Split Screen: Left = Question, Answer & Circular Clock, Right = 4 Hints) */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Question Box, Answer Box & Circular Countdown Clock */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                {/* Question Box */}
                <div className="p-6 bg-slate-950/80 border border-purple-500/30 rounded-2xl space-y-3 shadow-xl relative overflow-hidden">
                  <p className="text-xl lg:text-2xl font-black text-white leading-relaxed">
                    {caiTienQuestionItem.noi_dung || 'Nội dung câu hỏi Tăng Tốc Cải Tiến'}
                  </p>

                  {/* Optional Media */}
                  {caiTienQuestionItem.media?.url && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-slate-800">
                      <UniversalMediaPlayer
                        media={caiTienQuestionItem.media}
                        mediaControl={matchState.mediaControl}
                        largeMode={false}
                        round="TANG_TOC"
                        isTimerRunning={isTimerRunning}
                        hideControls={true}
                        className="w-full max-h-[220px] object-contain bg-slate-900"
                      />
                    </div>
                  )}
                </div>

                {/* Answer Box right below question when showExplanation is true */}
                {tangToc.showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="p-5 bg-gradient-to-r from-emerald-950/90 via-slate-950 to-emerald-950/90 border-2 border-emerald-500/60 rounded-2xl space-y-2 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-md text-[10px] font-black uppercase tracking-wider">
                        ĐÁP ÁN ĐÚNG
                      </span>
                    </div>
                    <h4 className="text-2xl lg:text-3xl font-black text-emerald-300 font-mono tracking-wider uppercase">
                      {caiTienQuestionItem.dap_an_dung || 'KẾT QUẢ'}
                    </h4>
                    {caiTienQuestionItem.chu_thich && (
                      <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-emerald-500/20 italic">
                        <strong className="text-emerald-400 font-bold not-italic">Giải thích: </strong>
                        {caiTienQuestionItem.chu_thich}
                      </p>
                    )}
                  </motion.div>
                )}

                {/* Circular Countdown Clock placed at the bottom, level with Hint 4 */}
                <div className="flex justify-center items-center pt-3 mt-auto">
                  <CircularTimerClock
                    seconds={timerSeconds}
                    total={maxTimer}
                    isRunning={isTimerRunning}
                  />
                </div>
              </div>

              {/* Right Column: 4 Hint Rows */}
              <div className="lg:col-span-7 flex flex-col space-y-3">
                <div className="flex items-center justify-between px-1 mb-1">
                  <span className="text-[11px] font-black uppercase tracking-widest text-purple-300">
                    GỢI Ý CÂU HỎI
                  </span>
                  <span className="text-[10px] font-bold uppercase text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                    {caiTienQuestionItem.loai_cau_hoi === 4 ? '4 Gợi ý (40s)' : '3 Gợi ý (30s)'}
                  </span>
                </div>

                {[1, 2, 3, 4].map((stt) => {
                  const hIdx = stt - 1;
                  const maxHints = caiTienQuestionItem.loai_cau_hoi === 4 ? 4 : 3;
                  const isExtraHint = stt > maxHints;
                  const hintData = caiTienQuestionItem.goi_y?.[hIdx];

                  if (isExtraHint) {
                    return (
                      <div
                        key={stt}
                        className="p-3.5 rounded-2xl border border-slate-900 bg-slate-950/20 opacity-20 select-none flex items-center justify-between"
                      >
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-900 text-slate-600 border border-slate-800">
                          #{stt}
                        </span>
                        <span className="text-xs text-slate-700 font-mono">••••••••</span>
                      </div>
                    );
                  }

                  const currentHintIdx = tangToc.currentHintIndex ?? 0;
                  const isRevealed =
                    (hIdx <= currentHintIdx && (isTimerRunning || currentHintIdx > 0)) ||
                    !!tangToc.showExplanation;
                  const isCurrent = hIdx === currentHintIdx && isTimerRunning;

                  return (
                    <motion.div
                      key={stt}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: hIdx * 0.08 }}
                      className={`p-4 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'bg-gradient-to-r from-purple-950/90 via-slate-950 to-indigo-950/90 border-indigo-400 shadow-[0_0_20px_rgba(129,140,248,0.25)] ring-2 ring-indigo-400/50'
                          : isRevealed
                          ? 'bg-slate-950/90 border-purple-500/30 shadow-md'
                          : 'bg-slate-950/30 border-slate-900/80 opacity-40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${
                            isCurrent
                              ? 'bg-indigo-500 text-white font-black'
                              : isRevealed
                              ? 'bg-purple-900/50 border border-purple-500/30 text-purple-200'
                              : 'bg-slate-900 text-slate-500'
                          }`}
                        >
                          #{stt} (+{getTangTocImprovedPoints(hIdx, caiTienQuestionItem.loai_cau_hoi)}đ)
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-black uppercase text-indigo-300 animate-pulse">
                            Đang mở...
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-sm lg:text-base font-extrabold ${
                          isRevealed ? 'text-white' : 'text-slate-600 blur-sm select-none'
                        }`}
                      >
                        {isRevealed
                          ? hintData?.noi_dung || `(Gợi ý số ${stt})`
                          : '••••••••••••••••••••••••'}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : tangToc.showExplanation ? (
            /* TRADITIONAL MODE EXPLANATION */
            <div className="max-w-4xl mx-auto w-full flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4 max-w-2xl bg-slate-950/80 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl"
              >
                <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-xs font-bold inline-block uppercase tracking-wider">
                  ĐÁP ÁN ĐÚNG & GIẢI THÍCH
                </div>
                <h4 className="text-3xl font-black text-emerald-400 font-mono tracking-wide uppercase">
                  {currentActiveQuestion?.dap_an_dung || 'KẾT QUẢ'}
                </h4>
                {currentActiveQuestion?.noi_dung && (
                  <p className="text-sm text-slate-300 leading-relaxed italic">
                    Câu hỏi: {currentActiveQuestion.noi_dung}
                  </p>
                )}
                {questionItem?.chu_thich && (
                  <div className="mt-3 p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-xs text-slate-300 leading-relaxed max-w-lg mx-auto text-left">
                    <span className="font-extrabold text-[10px] text-indigo-400 block mb-1 uppercase tracking-wider">Giải thích đáp án:</span>
                    {questionItem.chu_thich}
                  </div>
                )}
              </motion.div>
            </div>
          ) : questionItem ? (
            questionItem.media?.url ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto w-full">
                {/* Left Column: Media */}
                <div className="lg:col-span-7 flex flex-col items-center justify-center">
                  <div className="w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/80 shadow-2xl">
                    <UniversalMediaPlayer
                      media={questionItem.media}
                      mediaControl={matchState.mediaControl}
                      largeMode={true}
                      round="TANG_TOC"
                      isTimerRunning={isTimerRunning}
                      hideControls={true}
                      className="w-full max-h-[420px] object-contain"
                    />
                  </div>
                </div>

                {/* Right Column: Question + Timer */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-8 p-6 bg-slate-950/60 border border-slate-850 rounded-2xl shadow-xl">
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded inline-block">
                      NỘI DUNG CÂU HỎI TĂNG TỐC:
                    </span>
                    <p className="text-xl lg:text-2xl font-extrabold text-white leading-relaxed">
                      {questionItem.noi_dung || '(Câu hỏi hình ảnh/video)'}
                    </p>
                  </div>

                  {/* Timer positioned directly inside the right side of the split screen */}
                  {isTimerRunning && (
                    <div className="pt-4 border-t border-slate-800/60 w-full">
                      <div className="w-full h-3 bg-slate-950 border border-slate-850 rounded-full overflow-visible relative shadow-inner">
                        <motion.div
                          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-full relative"
                          style={{ width: `${countUpPercent}%` }}
                          animate={{ width: `${countUpPercent}%` }}
                          transition={{ duration: 0.1, ease: 'linear' }}
                        >
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_8px_#fff,0_0_16px_#06b6d4] z-20" />
                        </motion.div>
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-500 font-mono pt-2 px-1">
                        <span>0s</span>
                        <span className="text-indigo-400 font-black text-sm animate-pulse">{timerSeconds}s</span>
                        <span>{maxTimer}s</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center justify-center space-y-8 max-w-4xl mx-auto">
                <p className="text-2xl font-extrabold text-white leading-relaxed text-center px-4">
                  {questionItem.noi_dung}
                </p>
                
                {isTimerRunning && (
                  <div className="w-full max-w-2xl pt-4 border-t border-slate-800/60">
                    <div className="w-full h-3 bg-slate-950 border border-slate-850 rounded-full overflow-visible relative shadow-inner">
                      <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-full relative"
                        style={{ width: `${countUpPercent}%` }}
                        animate={{ width: `${countUpPercent}%` }}
                        transition={{ duration: 0.1, ease: 'linear' }}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_8px_#fff,0_0_16px_#06b6d4] z-20" />
                      </motion.div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-500 font-mono pt-2 px-1">
                      <span>0s</span>
                      <span className="text-indigo-400 font-black text-sm animate-pulse">{timerSeconds}s</span>
                      <span>{maxTimer}s</span>
                    </div>
                  </div>
                )}
              </div>
            )
          ) : null}
        </div>

        {/* Countdown Progress Bar at bottom (fallback for traditional mode with no media) */}
        {isTimerRunning && mode === 'TRADITIONAL' && !questionItem?.media?.url && (
          <div className="w-full max-w-4xl mx-auto pt-4 border-t border-slate-800/60">
            <div className="w-full h-2.5 bg-slate-950 border border-slate-850 rounded-full overflow-visible relative">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-full relative"
                style={{ width: `${countUpPercent}%` }}
                animate={{ width: `${countUpPercent}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_8px_#fff,0_0_16px_#06b6d4] z-20" />
              </motion.div>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono pt-1.5 px-1">
              <span>0s</span>
              <span className="text-indigo-400 font-bold text-xs animate-pulse">{timerSeconds}s</span>
              <span>{maxTimer}s</span>
            </div>
          </div>
        )}
      </div>

      {/* OVERLAY POP-UP MODAL FOR CONTESTANT ANSWERS / IMPROVED MODE RESULTS */}
      <AnimatePresence>
        {tangToc.showAnswers && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center z-50 p-6 rounded-2xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-slate-900 border-2 border-purple-500/60 rounded-3xl p-6 w-full max-w-3xl shadow-[0_0_50px_rgba(168,85,247,0.25)] flex flex-col justify-between space-y-6"
            >
              {/* CONTESTANT ANSWERS OVERLAY */}
              <div className="text-center space-y-1">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">ĐÃ KHÓA ĐÁP ÁN</span>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                  CÂU TRẢ LỜI CỦA THÍ SINH
                </h3>
                <p className="text-xs text-slate-400">Sắp xếp theo thứ tự thời gian trả lời tăng dần</p>
              </div>

              <div className="flex flex-col gap-3 max-w-2xl mx-auto w-full">
                {sortedAndGrouped.map((ans, idx) => {
                  const hasAnswer = ans.answer !== '';
                  const isFastest = idx === 0 && hasAnswer;

                  return (
                    <motion.div
                      key={ans.playerPosition}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.12, type: 'spring', stiffness: 220 }}
                      className={`p-3.5 md:p-4 rounded-2xl flex items-center justify-between transition-all relative border ${
                        isFastest
                          ? 'bg-gradient-to-r from-indigo-950/90 via-slate-900 to-indigo-950/90 border-amber-400/90 shadow-[0_0_30px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/50'
                          : hasAnswer
                          ? 'bg-slate-950/90 border-slate-800'
                          : 'bg-slate-950/40 border-slate-900/60 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 border shadow-md ${
                            isFastest
                              ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 border-amber-300 shadow-amber-500/20'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            #{idx + 1}
                          </span>
                          <span className={`w-6 h-6 rounded-lg font-bold text-[11px] flex items-center justify-center shrink-0 border ${
                            isFastest ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-slate-900 text-slate-500 border-slate-800'
                          }`}>
                            {ans.playerPosition}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-200 truncate">
                              {ans.name}
                            </span>
                            {isFastest && (
                              <span className="inline-flex items-center gap-1 text-[9px] text-amber-300 uppercase font-black tracking-wider bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-full shadow-sm">
                                <Trophy className="w-3 h-3 text-amber-400" /> NHANH NHẤT
                              </span>
                            )}
                          </div>

                          <div className="mt-1">
                            {hasAnswer ? (
                              <strong className={`text-xl md:text-2xl font-black font-mono tracking-wider uppercase ${
                                isFastest ? 'text-amber-300 drop-shadow-[0_0_10px_rgba(252,211,77,0.3)]' : 'text-slate-100'
                              }`}>
                                "{ans.answer}"
                              </strong>
                            ) : (
                              <span className="text-xs font-semibold text-slate-600 italic">
                                KHÔNG CÓ ĐÁP ÁN
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {hasAnswer && (
                        <div className="text-right shrink-0 ml-4 pl-4 border-l border-slate-800/80">
                          <span className="text-slate-400 font-semibold block text-[9px] uppercase tracking-wider mb-0.5">Thời gian</span>
                          <span className={`text-lg font-mono font-black ${isFastest ? 'text-amber-300' : 'text-indigo-400'}`}>
                            {ans.timestamp}s
                          </span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
