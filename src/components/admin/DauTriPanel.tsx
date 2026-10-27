import React, { useState } from 'react';
import { 
  Play, 
  Pause,
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Eye, 
  SkipForward, 
  Clock, 
  Award, 
  Zap, 
  ShieldAlert, 
  AlertTriangle,
  Flame,
  HelpCircle,
  Settings,
  Sparkles,
  Volume2,
  Image as ImageIcon,
  Video as VideoIcon
} from 'lucide-react';
import { MatchState, SocketEvent, DauTriEndRule } from '../../types.js';
import RoundSoundPanel from './RoundSoundPanel.js';

interface DauTriPanelProps {
  state: MatchState;
  questions: any;
  emitSocket: (event: string, data?: any) => void;
}

export const DauTriPanel: React.FC<DauTriPanelProps> = ({ state, questions, emitSocket }) => {
  const dauTri = state.dau_tri || {
    status: 'CONFIG',
    endRule: 'QUESTIONS_LIMIT',
    maxQuestions: 15,
    timeLimitSeconds: 900,
    bonusQuestionsPerPack: 3,
    currentMainQuestionIndex: 0,
    isMainQuestionRevealed: false,
    isMainStarted: false,
    mainQuestionAnsweredCorrectlyBy: null,
    buzzerLocked: true,
    buzzedPlayer: null,
    buzzedTimestamp: null,
    buzzedBeforeReveal: false,
    foulOrWrongPlayers: [],
    stage: 'MAIN_QUESTION',
    bonusPacksQueueIndex: 0,
    usedBonusPackIndices: [],
    activeBonusPack: null,
    activeBonusPlayerPosition: null,
    currentBonusQuestionIndex: 0,
    isBonusQuestionRevealed: false,
    bonusTimerSecondsLeft: 10,
    isBonusTimerRunning: false,
    overallSecondsLeft: 900,
    overallTotalSeconds: 900,
    isOverallTimerRunning: false,
    threeMinWarningPlayed: false
  };

  const [configEndRule, setConfigEndRule] = useState<DauTriEndRule>(dauTri.endRule || 'QUESTIONS_LIMIT');
  const [configMaxQuestions, setConfigMaxQuestions] = useState<number>(dauTri.maxQuestions || 15);
  const [configTimeMinutes, setConfigTimeMinutes] = useState<number>(Math.round((dauTri.timeLimitSeconds || 900) / 60));
  const [configTargetScore, setConfigTargetScore] = useState<number>(dauTri.targetScore || 100);
  const [configBonusCount, setConfigBonusCount] = useState<1 | 2 | 3>(dauTri.bonusQuestionsPerPack || 3);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [isPrepActive, setIsPrepActive] = useState<boolean>(false);

  const questionsList = questions?.dau_tri?.cau_hoi || [];
  const currentMainQ = questionsList[dauTri.currentMainQuestionIndex] || {
    id: dauTri.currentMainQuestionIndex + 1,
    noi_dung: 'Chưa có dữ liệu câu hỏi chính',
    dap_an_dung: 'Chưa có đáp án',
    chu_thich: '',
    goi_thuong: {
      chu_de: 'Chủ đề thưởng',
      cau_hoi: [
        { noi_dung: 'Câu thưởng 1', dap_an_dung: 'Đáp án 1' },
        { noi_dung: 'Câu thưởng 2', dap_an_dung: 'Đáp án 2' },
        { noi_dung: 'Câu thưởng 3', dap_an_dung: 'Đáp án 3' }
      ]
    }
  };

  const handleSaveConfig = () => {
    emitSocket(SocketEvent.DAU_TRI_CONFIG, {
      endRule: configEndRule,
      maxQuestions: configMaxQuestions,
      timeLimitMinutes: configTimeMinutes,
      targetScore: configTargetScore,
      bonusQuestionsPerPack: configBonusCount
    });
    setShowConfigModal(false);
  };

  const handleStartRound = () => {
    emitSocket(SocketEvent.DAU_TRI_CONFIG, {
      endRule: configEndRule,
      maxQuestions: configMaxQuestions,
      timeLimitMinutes: configTimeMinutes,
      targetScore: configTargetScore,
      bonusQuestionsPerPack: configBonusCount
    });
    emitSocket(SocketEvent.DAU_TRI_START_ROUND);
  };

  const handlePrepare = () => {
    emitSocket(SocketEvent.DAU_TRI_PREPARE);
    setIsPrepActive(true);
    setTimeout(() => setIsPrepActive(false), 3500);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header & Status Bar */}
      <div className="bg-slate-900 border border-indigo-900/60 rounded-xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
              <Zap className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-wide">Vòng Đấu Trí (University Challenge)</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  dauTri.status === 'PLAYING' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse' 
                    : dauTri.status === 'READY'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : dauTri.status === 'ENDED' 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {dauTri.status === 'PLAYING' ? 'Đang diễn ra' : dauTri.status === 'READY' ? 'Sẵn sàng' : dauTri.status === 'ENDED' ? 'Đã kết thúc' : 'Chờ bắt đầu'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Luật: {
                  dauTri.endRule === 'QUESTIONS_LIMIT'
                    ? `Giới hạn ${dauTri.maxQuestions} câu hỏi chính`
                    : dauTri.endRule === 'TIME_LIMIT'
                    ? `Tính giờ ${Math.round(dauTri.timeLimitSeconds / 60)} phút`
                    : `Chạm mốc ${dauTri.targetScore || 100} điểm`
                } • Gói thưởng: {dauTri.bonusQuestionsPerPack} câu ({dauTri.bonusQuestionsPerPack * 5} điểm max)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {dauTri.endRule === 'TIME_LIMIT' && (
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border font-mono text-sm font-bold ${
                dauTri.overallSecondsLeft <= 180 
                  ? 'bg-rose-950/60 border-rose-500/60 text-rose-300 animate-pulse' 
                  : 'bg-slate-800/80 border-slate-700 text-amber-400'
              }`}>
                <Clock className="w-4 h-4" />
                <span>{formatTime(dauTri.overallSecondsLeft)}</span>
                {dauTri.overallSecondsLeft <= 180 && (
                  <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded uppercase">3 Phút cuối!</span>
                )}
              </div>
            )}

            {dauTri.endRule === 'SCORE_LIMIT' && (
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs font-bold bg-indigo-950/80 border-indigo-700 text-indigo-300">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Mục tiêu: {dauTri.targetScore || 100} điểm</span>
              </div>
            )}

            <button
              onClick={() => setShowConfigModal(true)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Cài đặt vòng</span>
            </button>

            {dauTri.status === 'CONFIG' || dauTri.status === 'READY' ? (
              <>
                <button
                  type="button"
                  onClick={handlePrepare}
                  className={`px-3 py-2 ${
                    isPrepActive
                      ? 'bg-amber-500 text-slate-950 font-bold ring-2 ring-amber-300'
                      : 'bg-amber-600 hover:bg-amber-500 text-white font-semibold'
                  } border border-amber-500/50 rounded-lg text-xs flex items-center space-x-1.5 transition-all shadow-md active:scale-95 cursor-pointer`}
                  title="Phát nhạc chuẩn bị cho vòng thi Đấu Trí"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${isPrepActive ? 'animate-bounce' : ''}`} />
                  <span>{isPrepActive ? 'Đang chuẩn bị...' : 'Chuẩn bị'}</span>
                </button>
                <button
                  onClick={handleStartRound}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg text-sm shadow-lg shadow-emerald-950/40 flex items-center space-x-2 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  <span>Bắt đầu Vòng thi</span>
                </button>
              </>
            ) : (
              <>
                {dauTri.status === 'PLAYING' && (
                  <button
                    onClick={() => emitSocket(SocketEvent.DAU_TRI_END_ROUND)}
                    className="px-3.5 py-2 bg-rose-600/80 hover:bg-rose-600 text-white font-semibold rounded-lg text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Kết thúc vòng</span>
                  </button>
                )}
                <button
                  onClick={() => emitSocket(SocketEvent.DAU_TRI_RESET_ROUND)}
                  className="px-3 py-2 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Game Control Panels */}
      {dauTri.status === 'CONFIG' || dauTri.status === 'READY' ? (
        <div className="p-8 sm:p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg">
            <Zap className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white tracking-wide">VÒNG THI ĐẤU TRÍ</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Vòng thi chưa bắt đầu. Nhấn <strong className="text-emerald-400">&ldquo;Bắt đầu Vòng thi&rdquo;</strong> ở thanh điều khiển trên để mở Câu hỏi chính #1 (10 điểm).
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Main Question Section (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className={`p-5 rounded-xl border ${
              dauTri.stage === 'MAIN_QUESTION' 
                ? 'bg-slate-900 border-indigo-500/40 ring-1 ring-indigo-500/20' 
                : 'bg-slate-900/60 border-slate-800 opacity-90'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 bg-indigo-600 text-white text-xs font-black rounded">
                    CÂU HỎI CHÍNH #{dauTri.currentMainQuestionIndex + 1}
                  </span>
                  <span className="text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                    10 ĐIỂM
                  </span>
                  {dauTri.isMainQuestionRevealed ? (
                    <span className="text-[11px] bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Đã mở màn hình
                    </span>
                  ) : (
                    <span className="text-[11px] bg-amber-950/70 text-amber-300 border border-amber-800/60 px-2 py-0.5 rounded flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Đang đọc (Ẩn với màn hình)
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  Gói thưởng đã dùng: {dauTri.usedBonusPackIndices?.length ?? dauTri.bonusPacksQueueIndex}/{questionsList.length}
                </div>
              </div>

              {/* Question Text */}
              <div className="my-4 p-4 rounded-lg bg-slate-950 border border-slate-800">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Nội dung câu hỏi (MC & Controller thấy trước):</p>
                <p className="text-base text-slate-100 font-medium leading-relaxed">
                  {currentMainQ.noi_dung || `(Câu hỏi chính số ${dauTri.currentMainQuestionIndex + 1})`}
                </p>
                
                {/* Media Information & Controls */}
                {(() => {
                  const media = currentMainQ.media;
                  if (!media?.url) return null;

                  const isVideoOrAudio = media.type === 'video' || media.type === 'audio' || !!media.url.match(/\.(mp3|wav|ogg|m4a|mp4|webm|mov)($|\?)/);
                  const isPlaying = !!state.mediaControl?.isPlaying;

                  return (
                    <div className="mt-3 p-3 bg-slate-900/90 border border-indigo-500/40 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center space-x-2">
                        {isVideoOrAudio ? (
                          <VideoIcon className="w-5 h-5 text-indigo-400" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-emerald-400" />
                        )}
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                            <span>{isVideoOrAudio ? 'Media Video/Âm thanh' : 'Hình ảnh câu hỏi'}</span>
                            <span className="text-[10px] px-2 py-0.2 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded font-normal">
                              Miễn trừ luật -5 điểm
                            </span>
                            <span className="text-[10px] px-2 py-0.2 bg-amber-950 text-amber-300 border border-amber-800 rounded font-normal">
                              Gói thưởng đi kèm: #{dauTri.currentMainQuestionIndex + 1}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {isVideoOrAudio 
                              ? (isPlaying ? '🔊 Đang phát trên màn hình thí sinh/viewer' : '⏸️ Chưa phát (bấm nút để phát)') 
                              : '🖼️ Tự động hiển thị cùng câu hỏi'}
                          </div>
                        </div>
                      </div>

                      {isVideoOrAudio && (
                        <div className="flex items-center space-x-1.5 shrink-0">
                          {isPlaying ? (
                            <button
                              onClick={() => emitSocket(SocketEvent.MEDIA_PAUSE)}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded flex items-center space-x-1 shadow transition-colors"
                            >
                              <Pause className="w-3.5 h-3.5" />
                              <span>Tạm dừng</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => emitSocket(SocketEvent.MEDIA_PLAY)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded flex items-center space-x-1 shadow transition-colors"
                            >
                              <Play className="w-3.5 h-3.5" />
                              <span>Phát media ▷</span>
                            </button>
                          )}
                          <button
                            onClick={() => emitSocket(SocketEvent.MEDIA_REPLAY)}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded flex items-center space-x-1 border border-slate-700 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Phát lại</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-emerald-400">Đáp án chuẩn: </span>
                    <span className="text-sm font-bold text-emerald-300 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900">
                      {currentMainQ.dap_an_dung || '---'}
                    </span>
                  </div>
                  {currentMainQ.chu_thich && (
                    <div className="text-xs text-slate-400 italic">
                      Chú thích: {currentMainQ.chu_thich}
                    </div>
                  )}
                </div>
              </div>

              {/* Reveal Question Button (for text questions that are not auto-revealed) */}
              {!dauTri.isMainQuestionRevealed && (
                <div className="mb-4">
                  <button
                    onClick={() => emitSocket(SocketEvent.DAU_TRI_REVEAL_MAIN_QUESTION)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-lg shadow-md flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Hiện câu hỏi lên Màn hình Thí sinh & Khán giả</span>
                  </button>
                  <p className="text-[11px] text-slate-400 text-center mt-1">
                    * Lưu ý: Nếu thí sinh bấm chuông TRƯỚC KHI hiện câu hỏi và trả lời sai thì bị trừ 5 điểm (câu có media được miễn trừ).
                  </p>
                </div>
              )}

              {/* Prompt to Show Bonus Theme after Correct Answer */}
              {dauTri.mainQuestionAnsweredCorrectlyBy && dauTri.stage === 'MAIN_QUESTION' && (
                <div className="mb-4 p-4 bg-indigo-950/90 border-2 border-amber-500 rounded-xl space-y-2 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Thí sinh {state.players[dauTri.mainQuestionAnsweredCorrectlyBy]?.name} đã trả lời ĐÚNG (+10đ)!
                    </span>
                    <span className="text-xs text-slate-300 font-semibold">
                      Chủ đề: "{dauTri.activeBonusPack?.chu_de}"
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Câu hỏi chính đang được hiển thị trên màn hình. Khi MC sẵn sàng chuyển sang phần gói thưởng, bấm nút dưới:
                  </p>
                  <button
                    onClick={() => emitSocket(SocketEvent.DAU_TRI_SHOW_BONUS_THEME)}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-lg text-sm shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Hiển thị Chủ đề Gói Thưởng lên Màn hình Thí sinh & Khán giả 👉</span>
                  </button>
                </div>
              )}

              {/* Buzzer Status & Control for Current Main Question */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      dauTri.buzzedPlayer 
                        ? 'bg-amber-400 animate-ping' 
                        : !dauTri.buzzerLocked 
                        ? 'bg-emerald-400 animate-pulse' 
                        : 'bg-slate-600'
                    }`} />
                    <span className="text-xs font-bold text-slate-200 uppercase">
                      {dauTri.buzzedPlayer 
                        ? `THÍ SINH BẤM CHUÔNG: ${state.players[dauTri.buzzedPlayer]?.name || `Vị trí ${dauTri.buzzedPlayer}`}` 
                        : !dauTri.buzzerLocked 
                        ? 'CHUÔNG ĐANG MỞ (SẴN SÀNG NHẬN TÍN HIỆU)' 
                        : 'CHUÔNG ĐANG KHÓA'}
                    </span>
                  </div>

                  {dauTri.buzzedPlayer && (() => {
                    const hasMedia = !!(currentMainQ.media && currentMainQ.media.url);
                    return (
                      <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${
                        !hasMedia && dauTri.buzzedBeforeReveal 
                          ? 'bg-rose-950 text-rose-300 border border-rose-800' 
                          : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}>
                        {hasMedia 
                          ? 'Câu hỏi có media (Sai: 0đ)' 
                          : dauTri.buzzedBeforeReveal 
                          ? 'Bấm trước khi hiện câu (Sai: -5đ)' 
                          : 'Bấm sau khi hiện câu (Sai: 0đ)'}
                      </span>
                    );
                  })()}
                </div>

                {/* If a player has buzzed: Grade Correct or Wrong */}
                {dauTri.buzzedPlayer ? (
                  <div className="p-3 bg-slate-900 border border-amber-500/30 rounded-lg space-y-2">
                    <div className="text-sm font-semibold text-amber-200 text-center">
                      Thí sinh <span className="text-white underline">{state.players[dauTri.buzzedPlayer]?.name}</span> đang trả lời câu hỏi chính:
                    </div>
                    {(() => {
                      const hasMedia = !!(currentMainQ.media && currentMainQ.media.url);
                      return (
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => emitSocket(SocketEvent.DAU_TRI_GRADE_MAIN, { isCorrect: true })}
                            className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-sm flex items-center justify-center space-x-2 shadow-lg transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>ĐÚNG (+10đ)</span>
                          </button>
                          <button
                            onClick={() => emitSocket(SocketEvent.DAU_TRI_GRADE_MAIN, { isCorrect: false })}
                            className="py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-sm flex items-center justify-center space-x-2 shadow-lg transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>SAI {!hasMedia && dauTri.buzzedBeforeReveal ? '(-5đ)' : '(0đ)'} & Mở lại chuông</span>
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="text-xs text-slate-400">
                      Thí sinh đã mất quyền câu này: {dauTri.foulOrWrongPlayers.length > 0 ? (
                        dauTri.foulOrWrongPlayers.map(p => state.players[p]?.name || `TS ${p}`).join(', ')
                      ) : 'Chưa có'}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => emitSocket(SocketEvent.DAU_TRI_SKIP_MAIN)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded border border-slate-700 flex items-center space-x-1"
                      >
                        <SkipForward className="w-3.5 h-3.5" />
                        <span>Bỏ qua câu chính (Khóa chuông)</span>
                      </button>
                      <button
                        onClick={() => emitSocket(SocketEvent.DAU_TRI_NEXT_MAIN)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded shadow flex items-center space-x-1"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Sang câu hỏi chính kế tiếp</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right / Bonus Questions Section (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className={`p-5 rounded-xl border ${
              dauTri.stage !== 'MAIN_QUESTION' 
                ? 'bg-slate-900 border-amber-500/40 ring-1 ring-amber-500/20' 
                : 'bg-slate-900/60 border-slate-800 opacity-80'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wide">
                    GÓI CÂU HỎI THƯỞNG (3 CÂU - 15 ĐIỂM)
                  </h3>
                </div>

                {dauTri.activeBonusPlayerPosition && (
                  <span className="text-xs bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold px-2 py-0.5 rounded">
                    TS: {state.players[dauTri.activeBonusPlayerPosition]?.name}
                  </span>
                )}
              </div>

              {dauTri.activeBonusPack ? (
                <div className="mt-3 space-y-3">
                  {/* Theme info */}
                  <div className="p-3 bg-amber-950/30 border border-amber-900/50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Chủ đề gói thưởng:</span>
                      <button
                        onClick={() => emitSocket(SocketEvent.DAU_TRI_SHOW_BONUS_THEME)}
                        className={`text-xs px-2 py-0.5 rounded font-semibold transition-colors ${
                          dauTri.stage === 'BONUS_THEME' 
                            ? 'bg-amber-500 text-slate-950 font-bold' 
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        Hiện Chủ đề lên Màn hình
                      </button>
                    </div>
                    <p className="text-sm font-bold text-white">
                      "{dauTri.activeBonusPack.chu_de}"
                    </p>
                  </div>

                  {/* 3 Bonus Questions Cards */}
                  <div className="space-y-2.5">
                    {dauTri.activeBonusPack.cau_hoi?.slice(0, dauTri.bonusQuestionsPerPack || 3).map((bq, idx) => {
                      const isActive = dauTri.stage === 'BONUS_QUESTION' && dauTri.currentBonusQuestionIndex === idx;
                      return (
                        <div 
                          key={idx}
                          className={`p-3 rounded-lg border transition-all ${
                            isActive 
                              ? 'bg-slate-950 border-amber-500 ring-1 ring-amber-500/30' 
                              : 'bg-slate-950/60 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-amber-400">
                              Câu thưởng {idx + 1} (5 điểm)
                            </span>
                            <div className="flex items-center space-x-1.5">
                              <button
                                onClick={() => emitSocket(SocketEvent.DAU_TRI_SHOW_BONUS_QUESTION, { questionIndex: idx })}
                                className={`text-xs px-2 py-0.5 rounded font-semibold ${
                                  isActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                              >
                                {isActive ? 'Đang mở' : 'Mở câu này'}
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-slate-200 leading-snug">{bq.noi_dung || '(Nội dung câu thưởng)'}</p>
                          
                          {bq.media?.url && (
                            <div className="mt-1 text-[11px] text-amber-300 font-mono flex items-center gap-1 truncate bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              <span>{bq.media.type === 'video' ? '🎥' : bq.media.type === 'audio' ? '🔊' : '🖼️'}</span>
                              <span className="truncate">{bq.media.url}</span>
                            </div>
                          )}

                          <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-emerald-400">Đ/A: {bq.dap_an_dung || '---'}</span>
                            {bq.chu_thich && (
                              <span className="text-slate-400 italic text-[10px] truncate max-w-[150px]">{bq.chu_thich}</span>
                            )}
                          </div>

                          {/* If this bonus question is active: Timer & Grading */}
                          {isActive && (
                            <div className="mt-2 pt-2 border-t border-amber-500/30 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className={`text-sm font-mono font-black px-2.5 py-0.5 rounded ${
                                    dauTri.bonusTimerSecondsLeft <= 3 
                                      ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-ping' 
                                      : 'bg-slate-800 text-amber-400 border border-amber-500/40'
                                  }`}>
                                    {dauTri.bonusTimerSecondsLeft}
                                  </span>
                                  <button
                                    onClick={() => emitSocket(SocketEvent.DAU_TRI_START_BONUS_TIMER)}
                                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded transition-colors"
                                  >
                                    {dauTri.isBonusTimerRunning ? 'Đếm lại 10s' : 'Bắt đầu 10s'}
                                  </button>
                                </div>

                                <div className="flex items-center space-x-1.5">
                                  <button
                                    onClick={() => emitSocket(SocketEvent.DAU_TRI_GRADE_BONUS, { isCorrect: true })}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded shadow"
                                  >
                                    Đúng (+5đ)
                                  </button>
                                  <button
                                    onClick={() => emitSocket(SocketEvent.DAU_TRI_GRADE_BONUS, { isCorrect: false })}
                                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded shadow"
                                  >
                                    Sai (0đ)
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => emitSocket(SocketEvent.DAU_TRI_NEXT_MAIN)}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <span>Hoàn thành Gói thưởng & Chuyển sang Câu chính tiếp theo</span>
                      <SkipForward className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs">
                  <Award className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  Chưa có gói thưởng nào được mở.<br />
                  Thí sinh trả lời đúng câu hỏi chính sẽ được nhận gói thưởng tương ứng.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BẢNG ĐIỀU KHIỂN ÂM THANH ĐẤU TRÍ */}
      <RoundSoundPanel
        title="Bảng Điều Khiển Âm Thanh: Đấu Trí"
        accentColor="rose"
        columns={3}
        adminCommand={emitSocket}
        sounds={[
          { id: 'UC_Start', label: '1. Vào vòng (UC_Start)' },
          { id: 'General_Ambience', label: '2. Nền Ambience (40%)' },
          { id: 'UC_Begin', label: '3. Chuẩn bị (UC_Begin)' },
          { id: 'UC_Reminder', label: '4. Nhắc nhở (UC_Reminder)' },
          { id: 'UC_Last3Minutes', label: '5. 3 Phút cuối (UC_Last3Minutes)' },
          { id: 'UC_End', label: '6. Hết giờ / Kết thúc (UC_End)' },
          { id: 'UC_CorrectMain', label: '7. Đúng câu chính (UC_CorrectMain)' },
          { id: 'UC_CorrectBonus', label: '8. Đúng câu thưởng (UC_CorrectBonus)' },
          { id: 'UC_Wrong', label: '9. Trả lời sai (UC_Wrong)' },
          { id: 'DT_Buzz', label: '10. Chuông bấm' },
          { id: 'DT_10s_Bonus', label: '11. 10s Câu thưởng' },
          { id: 'General_Space', label: '12. Dấu ba chấm' },
        ]}
      />

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Cấu hình Vòng thi Đấu Trí</h3>
              </div>
              <button 
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Luật kết thúc phần thi:
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setConfigEndRule('QUESTIONS_LIMIT')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      configEndRule === 'QUESTIONS_LIMIT'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-xs sm:text-sm">Số lượng câu</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">Kết thúc sau N câu chính</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfigEndRule('TIME_LIMIT')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      configEndRule === 'TIME_LIMIT'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-xs sm:text-sm">Thời gian</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">Đếm ngược tổng thời gian</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfigEndRule('SCORE_LIMIT')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      configEndRule === 'SCORE_LIMIT'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-xs sm:text-sm">Mốc điểm</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">Có thí sinh đạt X điểm</div>
                  </button>
                </div>
              </div>

              {configEndRule === 'QUESTIONS_LIMIT' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Số lượng câu hỏi chính (1 - 25 câu):
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={25}
                    value={configMaxQuestions}
                    onChange={(e) => setConfigMaxQuestions(parseInt(e.target.value) || 15)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              ) : configEndRule === 'TIME_LIMIT' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Tổng thời gian phần thi (10 - 30 phút):
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={30}
                    value={configTimeMinutes}
                    onChange={(e) => setConfigTimeMinutes(parseInt(e.target.value) || 15)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-amber-400 mt-1">
                    * Hệ thống sẽ tự động phát âm thanh cảnh báo khi còn 3 phút cuối.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Mốc điểm kết thúc phần thi (X điểm):
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={500}
                    step={5}
                    value={configTargetScore}
                    onChange={(e) => setConfigTargetScore(parseInt(e.target.value) || 100)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-indigo-400 mt-1">
                    * Phần thi sẽ tự động kết thúc ngay khi có thí sinh giành được từ {configTargetScore} điểm trở lên.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Số câu hỏi trong mỗi gói thưởng:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setConfigBonusCount(num as 1 | 2 | 3)}
                      className={`py-2 rounded-lg border text-xs font-bold transition-all ${
                        configBonusCount === num 
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold' 
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                      }`}
                    >
                      {num} câu ({num * 5} điểm)
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-md"
              >
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
