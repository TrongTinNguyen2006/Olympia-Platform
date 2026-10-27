import React from 'react';
import { MatchState } from '../../types.js';
import { 
  Zap, 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  Eye, 
  ShieldAlert, 
  Sparkles, 
  Award, 
  AlertTriangle 
} from 'lucide-react';

interface DauTriMCViewProps {
  state: MatchState;
  questions: any;
}

export const DauTriMCView: React.FC<DauTriMCViewProps> = ({ state, questions }) => {
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

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Khi chưa bắt đầu vòng thi: chỉ hiện tên vòng thi và logo
  if (dauTri.status === 'CONFIG' || dauTri.status === 'READY') {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center text-center p-8 space-y-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-2xl shadow-indigo-950/70 border border-indigo-400/30">
          <Zap className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-indigo-400 block">
            MÀN HÌNH MC
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-wide">
            VÒNG ĐẤU TRÍ
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Chờ Controller bấm &ldquo;Bắt đầu Vòng thi&rdquo; để hiển thị câu hỏi...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* MC Status Banner */}
      <div className="bg-slate-900 border border-indigo-900/80 rounded-2xl p-5 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-black shadow-lg">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Màn hình MC</span>
                <span className="text-slate-600">•</span>
                <span className="text-xs font-semibold text-slate-300">VÒNG ĐẤU TRÍ</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2">
                Câu hỏi Chính #{dauTri.currentMainQuestionIndex + 1}
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  10 Điểm
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {dauTri.endRule === 'TIME_LIMIT' && (
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-mono text-base font-bold border ${
                dauTri.overallSecondsLeft <= 180 
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse' 
                  : 'bg-slate-950 border-slate-800 text-amber-400'
              }`}>
                <Clock className="w-4 h-4" />
                <span>{formatTime(dauTri.overallSecondsLeft)}</span>
                {dauTri.overallSecondsLeft <= 180 && (
                  <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded-full font-bold">
                    3 PHÚT CUỐI
                  </span>
                )}
              </div>
            )}

            {dauTri.endRule === 'SCORE_LIMIT' && (
              <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl font-mono text-sm font-bold border bg-indigo-950/80 border-indigo-700 text-indigo-300">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Mục tiêu: {dauTri.targetScore || 100} điểm</span>
              </div>
            )}

            <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
              Tiến độ: <span className="text-white font-bold">{dauTri.currentMainQuestionIndex + 1}</span> / {dauTri.endRule === 'QUESTIONS_LIMIT' ? dauTri.maxQuestions : questionsList.length} câu
            </div>
          </div>
        </div>
      </div>

      {/* Main MC Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Question Card (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-indigo-900/60 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-400">
                  NỘI DUNG CÂU HỎI CHÍNH (DÀNH CHO MC ĐỌC)
                </span>
              </div>
              {dauTri.isMainQuestionRevealed ? (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> Đã mở màn hình
                </span>
              ) : (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Chưa mở màn hình
                </span>
              )}
            </div>

            {/* Big Question Reader Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-inner">
              <p className="text-xl text-white font-semibold leading-relaxed">
                {currentMainQ.noi_dung}
              </p>

              <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Đáp án chính xác:</span>
                  <span className="text-lg font-black text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-lg border border-emerald-800">
                    {currentMainQ.dap_an_dung}
                  </span>
                </div>
                {currentMainQ.chu_thich && (
                  <div className="text-xs text-slate-400 italic mt-1">
                    Ghi chú MC: {currentMainQ.chu_thich}
                  </div>
                )}
              </div>
            </div>

            {/* Current Buzzer Status Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="text-xs font-bold uppercase text-slate-400 mb-2">Trạng thái chuông:</div>
              {dauTri.buzzedPlayer ? (
                <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm">
                      {dauTri.buzzedPlayer}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">
                        {state.players[dauTri.buzzedPlayer]?.name}
                      </div>
                      <div className="text-xs text-amber-300">
                        {dauTri.buzzedBeforeReveal ? '⚠️ Bấm TRƯỚC khi hiện câu (Sai: -5đ)' : '✅ Bấm SAU khi hiện câu (Sai: 0đ)'}
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-amber-500 text-slate-950 font-extrabold text-xs rounded-full uppercase">
                    Đang trả lời
                  </span>
                </div>
              ) : (
                <div className="text-sm text-slate-300 flex items-center space-x-2">
                  <span className={`w-3 h-3 rounded-full ${!dauTri.buzzerLocked ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                  <span>
                    {!dauTri.buzzerLocked ? 'Chuông đang MỞ (Các thí sinh có thể bấm bất kỳ lúc nào)' : 'Chuông đang KHÓA'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bonus Pack Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-amber-900/60 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                  GÓI CÂU HỎI THƯỞNG (3 CÂU - 15 ĐIỂM)
                </span>
              </div>

              {dauTri.activeBonusPlayerPosition && (
                <span className="text-xs bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold px-2.5 py-0.5 rounded-full">
                  TS: {state.players[dauTri.activeBonusPlayerPosition]?.name}
                </span>
              )}
            </div>

            {dauTri.activeBonusPack ? (
              <div className="space-y-3">
                <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1">
                    Chủ đề gói thưởng:
                  </div>
                  <div className="text-base font-extrabold text-white">
                    "{dauTri.activeBonusPack.chu_de}"
                  </div>
                </div>

                <div className="space-y-2.5">
                  {dauTri.activeBonusPack.cau_hoi?.slice(0, dauTri.bonusQuestionsPerPack || 3).map((bq, idx) => {
                    const isCurrent = dauTri.stage === 'BONUS_QUESTION' && dauTri.currentBonusQuestionIndex === idx;
                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isCurrent 
                            ? 'bg-slate-950 border-amber-500 ring-2 ring-amber-500/20' 
                            : 'bg-slate-950/60 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-black text-amber-400">
                            CÂU THƯỞNG #{idx + 1} (5 ĐIỂM)
                          </span>
                          {isCurrent && (
                            <span className="text-sm font-mono font-black bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded shadow-sm">
                              {dauTri.bonusTimerSecondsLeft}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-slate-100 font-medium leading-snug">
                          {bq.noi_dung}
                        </p>

                        {bq.media?.url && (
                          <div className="mt-2 text-xs bg-slate-900 border border-slate-800 rounded p-1.5 flex items-center gap-2">
                            <span className="font-bold text-amber-400">
                              {bq.media.type === 'video' ? '🎥 Video:' : bq.media.type === 'audio' ? '🔊 Âm thanh:' : '🖼️ Ảnh:'}
                            </span>
                            <span className="truncate text-slate-400 font-mono text-[11px]">{bq.media.url}</span>
                          </div>
                        )}

                        <div className="mt-2 pt-2 border-t border-slate-800 flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-400">
                              Đáp án: <span className="text-white font-black">{bq.dap_an_dung}</span>
                            </span>
                          </div>
                          {bq.chu_thich && (
                            <div className="text-[11px] text-slate-400 italic">
                              Giải thích: {bq.chu_thich}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                <Award className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                Chưa có gói thưởng đang hoạt động.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
