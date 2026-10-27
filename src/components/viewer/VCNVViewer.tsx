import React, { useEffect, useState } from 'react';
import { MatchState } from '../../types.js';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, HelpCircle, Lock } from 'lucide-react';
import UniversalMediaPlayer from '../UniversalMediaPlayer.js';
import { RoundLogoRenderer } from '../common/RoundLogoAssets.js';
import RoundTitleScreen from '../common/RoundTitleScreen.js';

interface VCNVViewerProps {
  matchState: MatchState;
  matchQuestions?: any;
  hideQuestionBox?: boolean;
  hideAnswersPopup?: boolean;
}

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

export default function VCNVViewer({ matchState, matchQuestions, hideQuestionBox = false, hideAnswersPopup = false }: VCNVViewerProps) {
  const vcnv = matchState.vcnv;
  const isTimerRunning = matchState.isTimerRunning;
  const timerSeconds = matchState.timerSeconds;
  
  const soHangNgang = vcnv.soHangNgang || 8;
  const is8Rows = soHangNgang === 8;

  // Convert row lengths to letters representation
  const renderRowCrossword = (rowId: number, length: number) => {
    const rowObj = vcnv.rows[rowId];
    const isSelected = vcnv.selectedRow === rowId;
    
    const questionItem = matchQuestions?.vuot_chuong_ngai_vat?.hang_ngang?.find(
      (h: any) => h.id === rowId
    );
    const correctAnsWord = questionItem?.dap_an?.replace(/\s+/g, '') || '';
    const wordLength = correctAnsWord.length || length;
    const letters = Array.from({ length: wordLength });

    const isIncorrectRow = rowObj?.isAnswered && rowObj?.isCorrect === false;
    const showValue = (rowObj?.isAnswered && rowObj?.isCorrect !== false) || vcnv.cnvSolved;
    const redCells = vcnv.redCells?.[rowId] || [];

    return (
      <div className="flex gap-1 items-center justify-center flex-wrap">
        {letters.map((_, idx) => {
          let letterToShow = '';
          if (showValue) {
            letterToShow = correctAnsWord[idx] || '?';
          }
          const isRed = showValue && redCells.includes(idx);

          return (
            <motion.div
              key={idx}
              initial={{ rotateX: 0 }}
              animate={{ rotateX: showValue ? 360 : 0 }}
              transition={{ duration: 0.6, delay: idx * 0.08 }}
              className={`w-7 h-7 md:w-8 md:h-8 border text-xs md:text-sm font-black flex items-center justify-center rounded-md select-none transition-all ${
                isRed
                  ? 'bg-gradient-to-br from-red-600 to-rose-700 border-red-400 text-white font-sans shadow-[0_0_12px_rgba(239,68,68,0.8)]'
                  : showValue
                  ? 'bg-gradient-to-br from-amber-500 to-orange-600 border-amber-400 text-slate-950 font-sans'
                  : isIncorrectRow
                  ? 'bg-slate-900/40 border-slate-850/60 text-slate-700/30 opacity-40'
                  : isSelected
                  ? 'bg-amber-500/10 border-amber-500 text-amber-300 animate-pulse'
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

  // Filter visible rows
  const visibleRowIds = is8Rows
    ? ([1, 2, 3, 4, 5, 6, 7, 8] as const)
    : ([1, 2, 3, 4, 5] as const).filter(
        (id) => id !== 5 || vcnv.selectedRow === 5 || vcnv.rows[5]?.isAnswered
      );

  const mainText = matchQuestions?.vuot_chuong_ngai_vat?.tu_khoa_chinh || '';
  const classification = getObstacleClassification(mainText);

  // If Admin has not pressed "Hiện hàng ngang", show round intro background with title only
  if (!vcnv.showRows) {
    const customSetting = matchState?.roundCustomSettings?.['VCNV'];
    const customRoundLogo = customSetting?.customLogoUrl || customSetting?.logoUrl;
    const roundName = customSetting?.customName?.trim() || 'VƯỢT CHƯỚNG NGẠI VẬT';

    return <RoundTitleScreen title={roundName} logoUrl={customRoundLogo} roundKey="VCNV" id="vcnv-viewer-intro" />;
  }

  return (
    <div className="relative w-full h-full flex flex-col gap-6 p-2">
      {/* TOP SECTION: CROSSWORD BOARD WITH CNV FRAME (LEFT) & 16:9 IMAGE REVEAL (RIGHT) */}
      <div className="grid grid-cols-12 gap-6 items-stretch">
        {/* LEFT COLUMN: CROSSWORD BOARD */}
        <div className="col-span-12 lg:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* BIG CLEAR CNV FRAME BOX AT THE VERY TOP */}
            <div className="p-3 bg-gradient-to-r from-amber-500/10 via-orange-500/15 to-amber-500/10 border-2 border-amber-500/40 rounded-xl text-center shadow-lg shadow-amber-500/5">
              <strong className="text-base md:text-lg lg:text-xl font-black text-amber-300 tracking-wide uppercase block drop-shadow-sm font-sans">
                CNV GỒM {classification.count} {classification.label}
              </strong>
            </div>

            {/* CROSSWORD ROWS */}
            <div className="space-y-3 pt-1">
              {visibleRowIds.map((id) => {
                const row = vcnv.rows[id];
                const questionItem = matchQuestions?.vuot_chuong_ngai_vat?.hang_ngang?.find(
                  (h: any) => h.id === id
                );
                const length = questionItem?.so_ky_tu || questionItem?.dap_an?.replace(/\s+/g, '')?.length || 10;
                const isIncorrect = row?.isAnswered && row?.isCorrect === false;

                return (
                  <div key={id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg font-black text-xs flex items-center justify-center shrink-0 border transition-all ${
                      vcnv.selectedRow === id
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                        : isIncorrect
                        ? 'bg-slate-900/60 border-slate-800 text-slate-600 opacity-40 line-through'
                        : row?.isAnswered
                        ? 'bg-amber-600/20 border-amber-700 text-amber-400'
                        : 'bg-slate-950 border-slate-900 text-slate-400'
                    }`}>
                      {id}
                    </div>
                    <div className="flex-1 overflow-x-auto">
                      {renderRowCrossword(id, length)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REVEAL MAP IMAGES */}
        <div className="col-span-12 lg:col-span-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-center">
          {/* Image Box */}
          <div className={`${is8Rows ? 'aspect-[4/3]' : 'aspect-video'} w-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden relative shadow-2xl`}>
            {matchQuestions?.vuot_chuong_ngai_vat?.anh_goc_url ? (
              <img
                src={matchQuestions.vuot_chuong_ngai_vat.anh_goc_url}
                alt="Chướng Ngại Vật"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
            ) : (
              <div className="absolute inset-0 bg-slate-950 flex items-center justify-center text-xs text-slate-600 z-0">
                Chưa có ảnh chướng ngại vật
              </div>
            )}

            {/* Puzzle Overlay with 100% Opaque Backgrounds */}
            {!vcnv.cnvSolved && (
              <div className="absolute inset-0 z-10 pointer-events-none">
                {is8Rows ? (
                  /* 8-Piece Grid: 2 Rows x 4 Columns */
                  [1, 2, 3, 4, 5, 6, 7, 8].map((seg) => {
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
                            className="absolute bg-slate-950 border border-slate-800 flex items-center justify-center p-2 pointer-events-auto"
                          >
                            <span className="text-amber-400 font-black text-xl md:text-2xl font-mono">{seg}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    );
                  })
                ) : (
                  /* 5-Piece Classic Layout */
                  <>
                    {/* Segment 1: Top-Left Corner */}
                    <AnimatePresence>
                      {!vcnv.revealedSegments.includes(1) && (
                        <motion.div
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.8 }}
                          style={{ clipPath: 'polygon(0% 0%, 50% 0%, 50% 25%, 25% 25%, 25% 50%, 0% 50%)' }}
                          className="absolute inset-0 bg-slate-950 flex items-start justify-start p-3 pointer-events-auto border-r border-b border-slate-800"
                        >
                          <span className="text-amber-400 font-black text-2xl font-mono leading-none">1</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Segment 2: Top-Right Corner */}
                    <AnimatePresence>
                      {!vcnv.revealedSegments.includes(2) && (
                        <motion.div
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.8 }}
                          style={{ clipPath: 'polygon(50% 0%, 100% 0%, 100% 50%, 75% 50%, 75% 25%, 50% 25%)' }}
                          className="absolute inset-0 bg-slate-950 flex items-start justify-end p-3 pointer-events-auto border-l border-b border-slate-800"
                        >
                          <span className="text-amber-400 font-black text-2xl font-mono leading-none">2</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Segment 3: Bottom-Left Corner */}
                    <AnimatePresence>
                      {!vcnv.revealedSegments.includes(3) && (
                        <motion.div
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.8 }}
                          style={{ clipPath: 'polygon(0% 50%, 25% 50%, 25% 75%, 50% 75%, 50% 100%, 0% 100%)' }}
                          className="absolute inset-0 bg-slate-950 flex items-end justify-start p-3 pointer-events-auto border-r border-t border-slate-800"
                        >
                          <span className="text-amber-400 font-black text-2xl font-mono leading-none">3</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Segment 4: Bottom-Right Corner */}
                    <AnimatePresence>
                      {!vcnv.revealedSegments.includes(4) && (
                        <motion.div
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.8 }}
                          style={{ clipPath: 'polygon(75% 50%, 100% 50%, 100% 100%, 50% 100%, 50% 75%, 75% 75%)' }}
                          className="absolute inset-0 bg-slate-950 flex items-end justify-end p-3 pointer-events-auto border-l border-t border-slate-800"
                        >
                          <span className="text-amber-400 font-black text-2xl font-mono leading-none">4</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Segment 5: Center Piece */}
                    <AnimatePresence>
                      {!vcnv.revealedSegments.includes(5) && (
                        <motion.div
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.8 }}
                          style={{ clipPath: 'polygon(25% 25%, 75% 25%, 75% 75%, 25% 75%)' }}
                          className="absolute inset-0 bg-slate-950 flex items-center justify-center p-3 pointer-events-auto border border-slate-800"
                        >
                          <span className="text-teal-400 font-black text-3xl font-mono leading-none">5</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: CURRENT ACTIVE QUESTION SEPARATELY BELOW IMAGE AND CROSSWORD */}
      {!hideQuestionBox && vcnv.selectedRow && !vcnv.cnvSolved && !vcnv.rows[vcnv.selectedRow]?.isAnswered && (() => {
        const questionItem = matchQuestions?.vuot_chuong_ngai_vat?.hang_ngang?.find(
          (h: any) => h.id === vcnv.selectedRow
        );
        const maxTimer = matchState.timerTotal || 15;
        const displaySecs = isTimerRunning ? timerSeconds : (timerSeconds > 0 ? timerSeconds : maxTimer);
        const countUpPercent = maxTimer > 0 ? Math.min(100, Math.max(0, ((maxTimer - displaySecs) / maxTimer) * 100)) : 0;

        return (
          <div className="w-full p-5 bg-slate-900 border-2 border-amber-500/40 rounded-2xl shadow-2xl space-y-3 text-left relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest block">
                HÀNG NGANG SỐ {vcnv.selectedRow} ({questionItem?.so_ky_tu || '0'} KÝ TỰ):
              </span>
              <span className="text-xs font-bold text-amber-400 font-mono bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                ⏱️ {displaySecs}s
              </span>
            </div>
            
            {questionItem?.media?.url ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <UniversalMediaPlayer 
                  media={questionItem.media} 
                  mediaControl={matchState.mediaControl} 
                  largeMode={false}
                  round="VCNV"
                  isTimerRunning={isTimerRunning}
                  hideControls={true}
                  className="w-full h-36 md:h-44 object-contain rounded-xl"
                />
                <p className="text-lg md:text-xl font-bold text-white leading-relaxed">
                  {questionItem?.cau_hoi || 'Nội dung câu hỏi đang được tải...'}
                </p>
              </div>
            ) : (
              <p className="text-lg md:text-xl font-bold text-white leading-relaxed py-2">
                {questionItem?.cau_hoi || 'Nội dung câu hỏi đang được tải...'}
              </p>
            )}

            {/* Timer Bar ALWAYS visible as soon as question appears */}
            <div className="pt-2">
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-visible border border-slate-800 relative">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full relative"
                  style={{ width: `${countUpPercent}%` }}
                  animate={{ width: `${countUpPercent}%` }}
                  transition={{ duration: 0.1, ease: "linear" }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_8px_#fff,0_0_16px_#f59e0b] z-20" />
                </motion.div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Contestant Answers Reveal Popup Modal */}
      <AnimatePresence>
        {!hideAnswersPopup && vcnv.selectedRow && (() => {
          const rowObj = vcnv.rows[vcnv.selectedRow];
          if (!rowObj || !rowObj.showAnswers) return null;
          
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-6"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="bg-slate-900/95 border-2 border-amber-500/80 rounded-2xl p-6 w-full max-w-2xl shadow-[0_0_50px_rgba(245,158,11,0.15)] space-y-6"
              >
                <div className="text-center space-y-1">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">
                    HÀNG NGANG SỐ {vcnv.selectedRow}
                  </h3>
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
                        <span className="text-xs font-bold text-slate-300 block truncate animate-pulse">
                          {player?.name || `Bàn số ${pos}`}
                        </span>
                        
                        <div className="mt-3 pt-2.5 border-t border-slate-900 flex justify-center items-center">
                          {answer ? (
                            <strong className="text-lg font-black text-amber-300 font-mono tracking-wider">
                              {answer.toUpperCase()}
                            </strong>
                          ) : (
                            <span className="text-base font-bold text-slate-600">
                              —
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
