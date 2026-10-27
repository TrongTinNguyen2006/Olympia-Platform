/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// --- 1. QUESTION BANK & MONGOOSE SCHEMAS ---

export interface MediaAttachment {
  url: string;
  type: 'image' | 'video' | 'audio';
}

export interface KhoiDongQuestion {
  id: string;
  noi_dung: string;
  dap_an_dung: string;
  chu_thich?: string;
  media?: MediaAttachment;
  linh_vuc?: string;
}

export interface ObstacleRow {
  id: number; // 1-5 (4 rows + 1 central)
  cau_hoi: string;
  dap_an: string; // Auto uppercase on submission
  so_ky_tu: number;
  media?: MediaAttachment;
}

export interface VuotChuongNgaiVat {
  tu_khoa_chinh: string;
  anh_goc_url: string; // Main background image (segmented into 1-4 corners + 1 center or 8 grid pieces)
  so_hang_ngang?: 4 | 8; // Number of horizontal rows (4 or 8)
  hang_ngang: ObstacleRow[]; // 5 or 8 rows
}

export interface TangTocQuestion {
  id: number; // 1-4
  noi_dung: string;
  dap_an_dung: string;
  media?: MediaAttachment;
  media_dap_an?: MediaAttachment;
  anh_dap_an_url?: string; // Optional answer explanation image
  thoi_gian?: 10 | 20 | 30 | 40 | number; // 10, 20, 30, or 40 seconds
  chu_thich?: string;
}

export interface TangTocCaiTienHint {
  stt: number; // 1..4
  noi_dung: string;
  media?: MediaAttachment;
}

export interface TangTocCaiTienQuestion {
  id: number; // 1-4
  loai_cau_hoi: 3 | 4; // 3 hints (30s) or 4 hints (40s)
  noi_dung: string;
  dap_an_dung: string;
  goi_y: TangTocCaiTienHint[];
}

export function getTangTocImprovedPoints(hintIndex: number, loaiCauHoi: 3 | 4 = 3): number {
  if (loaiCauHoi === 4) {
    if (hintIndex === 0) return 40;
    if (hintIndex === 1) return 30;
    if (hintIndex === 2) return 20;
    return 10;
  } else {
    if (hintIndex === 0) return 40;
    if (hintIndex === 1) return 20;
    return 10;
  }
}

export interface VeDichQuestion {
  id: string;
  noi_dung: string;
  dap_an_dung: string;
  muc_diem: 10 | 20 | 30 | 40; // 10, 20, 30, or 40 points
  linh_vuc: string; // Lĩnh vực học thuật
  media?: MediaAttachment;
  chu_thich?: string;
}

export interface CauHoiPhuQuestion {
  id: number; // 1-3
  noi_dung: string;
  dap_an_dung: string;
  media?: MediaAttachment;
  chu_thich?: string;
}

export interface ExternalMediaItem {
  id: string;
  name: string;
  url: string;
  type: 'audio' | 'image' | 'video';
}

export interface MaTranKepQuestion {
  id: number; // 1-12
  noi_dung: string;
  dap_an_1: string;
  dap_an_2: string;
}

export interface MaTranKepData {
  cau_hoi: MaTranKepQuestion[];
  dap_an_nhieu?: string[]; // Up to 4 distractors
}

export interface MaTranKepCard {
  id: string; // e.g. "q1_1", "q1_2", "dis_1"
  text: string;
  questionId?: number; // Question ID if this card belongs to a question
  isDistractor?: boolean;
}

export interface MaTranKepPlayerState {
  board: MaTranKepCard[]; // 12 cards in 4x3 grid
  currentQuestionIndex: number; // 0..11 index in question list
  solvedQuestionIds: number[]; // e.g. [1, 3, 5]
  skippedQuestionIds: number[]; // e.g. [2]
  selectedCellIndices: number[]; // Selected card indices on board (0..11), max 2
  feedbackState: 'NONE' | 'BOTH_CORRECT' | 'ONE_CORRECT' | 'BOTH_INCORRECT';
  feedbackMessage?: string | null;
  isLocked: boolean; // locked for 5s after skipping
  lockEndTime?: number | null;
  maxReachedQuestionIndex?: number;
  score: number;
  isFinished: boolean;
}

export interface MaTranKepRoundState {
  status: 'IDLE' | 'READY' | 'RUNNING' | 'ENDED';
  timerSecondsLeft: number; // 180s countdown
  timerTotalSeconds: number; // 180
  isTimerRunning: boolean;
  questions?: MaTranKepQuestion[];
  activePlayerPosition?: number;
  playerStates: Record<number, MaTranKepPlayerState>; // 1, 2, 3, 4
}

export interface DauTriBonusQuestion {
  id?: string | number;
  noi_dung: string;
  dap_an_dung: string;
  chu_thich?: string;
  media?: MediaAttachment;
}

export interface DauTriBonusPack {
  chu_de: string; // Chủ đề gói câu hỏi thưởng
  cau_hoi: DauTriBonusQuestion[]; // Tối đa 3 câu hỏi thưởng
}

export interface DauTriQuestion {
  id: number; // 1-25
  noi_dung: string;
  dap_an_dung: string;
  chu_thich?: string;
  media?: MediaAttachment;
  goi_thuong: DauTriBonusPack; // Gói câu hỏi thưởng tương ứng
}

export interface DauTriData {
  cau_hoi: DauTriQuestion[];
}

export type DauTriEndRule = 'QUESTIONS_LIMIT' | 'TIME_LIMIT' | 'SCORE_LIMIT';
export type DauTriStage = 'MAIN_QUESTION' | 'BONUS_THEME' | 'BONUS_QUESTION';

export interface DauTriState {
  status: 'CONFIG' | 'READY' | 'PLAYING' | 'ENDED';
  endRule: DauTriEndRule; // 'QUESTIONS_LIMIT' | 'TIME_LIMIT' | 'SCORE_LIMIT'
  maxQuestions: number; // Số câu hỏi chính giới hạn (VD: 10, 15, 20, 25)
  timeLimitSeconds: number; // Giới hạn thời gian (600s - 1800s, 10p - 30p)
  targetScore: number; // Mốc điểm kết thúc game nếu chọn SCORE_LIMIT (VD: 100, 150, 200)
  bonusQuestionsPerPack: 1 | 2 | 3; // 1, 2, hoặc 3 câu hỏi thưởng

  // Tiến trình câu hỏi chính
  currentMainQuestionIndex: number; // 0..24
  isMainQuestionRevealed: boolean; // false: chỉ MC & Controller thấy, màn hình khác hiện "Câu hỏi chính số X – 10 điểm"
  isMainStarted: boolean;
  mainQuestionAnsweredCorrectlyBy: number | null; // Vị trí thí sinh (1-4) trả lời đúng

  // Chuông câu hỏi chính
  buzzerLocked: boolean;
  buzzedPlayer: number | null;
  buzzedTimestamp: number | null;
  buzzedBeforeReveal: boolean; // Bấm chuông trước khi hiển thị câu hỏi -> sai bị trừ 5 điểm
  foulOrWrongPlayers: number[]; // Thí sinh đã bấm chuông và trả lời sai -> mất quyền cho đến câu chính kế tiếp

  // Phần câu hỏi thưởng
  stage: DauTriStage;
  bonusPacksQueueIndex: number; // Con trỏ FIFO lấy gói thưởng chưa dùng
  usedBonusPackIndices?: number[]; // Danh sách các index gói thưởng đã được dùng
  activeBonusPack: DauTriBonusPack | null;
  activeBonusPlayerPosition: number | null; // Thí sinh được quyền trả lời gói thưởng
  currentBonusQuestionIndex: number; // 0, 1, 2
  isBonusQuestionRevealed: boolean;
  bonusTimerSecondsLeft: number; // 10s đếm ngược
  isBonusTimerRunning: boolean;

  // Thời gian tổng phần thi (nếu chọn TIME_LIMIT)
  overallSecondsLeft: number;
  overallTotalSeconds: number;
  isOverallTimerRunning: boolean;
  threeMinWarningPlayed: boolean; // Đã phát cảnh báo 3 phút hay chưa
  reminderPlayed: boolean; // Đã phát cảnh báo 3:03s hoặc còn 3 câu hay chưa
}

// MongoDB Database Match Schema representation
export interface MatchDbModel {
  _id?: string;
  matchCode: string; // Mã ID bộ đề (gồm 6 chữ số)
  matchName?: string; // Tên hiển thị bộ đề (vd: Trận Chung Kết Năm 26)
  matchPassword?: string; // Mật khẩu nạp đề (hashed or plain)
  userId?: string; // ID người dùng sở hữu bộ đề
  ownerEmail?: string; // Email tài khoản tạo đề
  ownerName?: string; // Họ tên người tạo đề
  khoi_dong: {
    cau_hoi: KhoiDongQuestion[]; // 36 questions
  };
  vuot_chuong_ngai_vat: VuotChuongNgaiVat;
  tang_toc: {
    cau_hoi: TangTocQuestion[]; // 4 questions (Traditional)
    cai_tien_cau_hoi?: TangTocCaiTienQuestion[]; // 4 questions (Improved)
  };
  ve_dich: {
    cau_hoi: VeDichQuestion[]; // 24 questions (12 of 20pts, 12 of 30pts)
  };
  cau_hoi_phu: {
    cau_hoi: CauHoiPhuQuestion[]; // 3 questions
  };
  jeopardy?: {
    boardSize: '5x4' | '6x5';
    categories: {
      title: string;
      clues: {
        points: number;
        question: string;
        dap_an_dung: string;
        media?: MediaAttachment;
      }[];
    }[];
  };
  ma_tran_kep?: MaTranKepData;
  chinh_phuc?: {
    de_cau_hoi: {
      de: ChinhPhucQuestion[];
      trung_binh: ChinhPhucQuestion[];
      kho: ChinhPhucQuestion[];
    };
    gmdt?: GMDTQuestion[];
  };
  dau_tri?: DauTriData;
  media_ngoai?: ExternalMediaItem[];
  createdAt?: string;
  updatedAt?: string;
}


// --- 2. MATCH STATE MACHINE (RAM OF BACKEND NODE.JS) ---

export type GameRound = 
  | 'WAITING'      // Đang chờ thí sinh kết nối
  | 'KHOI_DONG'     // Vòng Khởi động
  | 'VCNV'          // Vòng Vượt chướng ngại vật
  | 'TANG_TOC'      // Vòng Tăng tốc
  | 'VE_DICH'       // Vòng Về đích
  | 'CH_PHU'        // Vòng Câu hỏi phụ
  | 'JEOPARDY'      // Vòng Jeopardy! (Phần thi phụ 3.0)
  | 'MA_TRAN_KEP'   // Vòng Ma trận kép
  | 'CHINH_PHUC'    // Vòng Chinh phục
  | 'DAU_TRI'       // Vòng Đấu trí (University Challenge)
  | 'SUMMARY';      // Tổng kết & Vinh danh

export interface Player {
  socketId: string | null;
  name: string;
  position: 1 | 2 | 3 | 4; // Vị trí đứng 1-4
  score: number;
  isReady: boolean;
}

export interface ChatMessage {
  sender: 'ADMIN' | 'MC';
  text: string;
  timestamp: number;
}

export type BuzzerState = 'LOCKED' | 'OPEN' | 'BUZZED';

export type IndividualRule = 'O24' | 'O19_O21';
export type CollectiveRule = 'O23' | 'O22';

export type IndividualScoringMode = 'TRADITIONAL' | 'ADVANCED_1' | 'ADVANCED_2';
export type CollectiveScoringMode = 'TRADITIONAL' | 'ADVANCED_1' | 'ADVANCED_2' | 'ADVANCED_3' | 'ADVANCED_4';

export interface KhoiDongPlayerStats {
  correct: number;
  wrong: number;
  skip: number;
  total: number;
}

export interface KhoiDongState {
  subRound?: 'INDIVIDUAL' | 'COLLECTIVE' | null; // Khởi động cá nhân hay chung (null khi mặc định chưa chọn)
  isConfirmed?: boolean; // Đã hoàn thành chốt cài đặt lượt thi hay chưa (chỉ khi chốt mới hiển thị lượt thi tương ứng trên các màn hình)
  currentPlayerIndex: number | null; // 0-3 corresponding to position 1-4, null when no player selected
  currentQuestionIndex: number;
  answeredQuestions: { [key: string]: 'CORRECT' | 'INCORRECT' | 'SKIPPED' | 'NONE' }; // Map of Q_ID -> result
  isStarted?: boolean;
  startQuestionIndex?: number;
  countAnswered?: number;
  timerType?: 'FIRST_5S' | 'SECOND_5S' | null;
  isPrepRunning?: boolean;
  prepCountdown?: number;
  threeSecCountdown?: number;

  autoNextQuestion?: boolean; // Tự động chuyển sang câu hỏi kế tiếp khi chấm điểm đúng/sai

  // --- VERSION 2.0 CONFIG & TRACKING ---
  individualRule?: IndividualRule; // 'O24' (Luật O24+) or 'O19_O21' (Luật O19/O21)
  individualTimerDuration?: number | null; // 30, 45, 60, 90 seconds or null (Không có)
  individualMaxQuestions?: number | null; // custom number or null (Không có)
  individualScoringMode?: IndividualScoringMode; // TRADITIONAL, ADVANCED_1, ADVANCED_2

  collectiveRule?: CollectiveRule; // 'O23' (Luật O23+) or 'O22' (Luật O22)
  collectiveTimerDuration?: number | null; // 30, 45, 60, 90 seconds or null (Không có)
  collectiveMaxQuestions?: number | null; // custom number or null (Không có)
  collectiveScoringMode?: CollectiveScoringMode; // TRADITIONAL, ADVANCED_1, ADVANCED_2, ADVANCED_3, ADVANCED_4
  collectiveBuzzerDelay?: number | null; // Delay in seconds (0/null: immediate, 2, 3, 5 seconds)
  disqualifyThreshold?: number; // N times wrong before disqualified in ADVANCED_3 / ADVANCED_4 (default 3)

  // Tracking during turns
  wrongCounts?: { [position: number]: number }; // Position 1..4 -> wrong/skip count in active turn
  blockedThisQuestionPlayers?: number[]; // Positions blocked on the CURRENT active question
  blockedNextQuestionPlayers?: number[]; // Positions blocked on the NEXT question
  disqualifiedPlayers?: number[]; // Positions disqualified from current collective turn
  playerStats?: { [position: number]: KhoiDongPlayerStats }; // Detailed stats per player
}

export interface VcnvRowState {
  id: number;
  isOpen: boolean; // Đã mở câu hỏi hàng ngang này chưa
  isAnswered: boolean; // Đã chấm điểm/trả lời xong chưa
  isCorrect?: boolean; // Hàng ngang có ai trả lời đúng không
  playerAnswers: { [position: number]: string }; // Answers submitted by players (Uppercase)
  showAnswers: boolean; // Admin controls whether to show player answers on screen
}

export interface VcnvState {
  showRows?: boolean; // Controls whether horizontal rows and image puzzle are displayed or just title intro
  selectedRow: number | null; // Hàng ngang đang chọn (1-8)
  rows: { [id: number]: VcnvRowState };
  revealedSegments: number[]; // Array of revealed image corners/pieces (1-4 and 5 for center, or 1-8 for 8 rows)
  cnvBuzzedPlayer: number | null; // Thí sinh bấm chuông giành CNV
  cnvBuzzerLocked: boolean; // Khóa chuông sau khi có người bấm hoặc bị phạt
  cnvBuzzedTimestamp: number | null;
  cnvSolved: boolean; // Đã tìm ra chướng ngại vật chưa
  cnvWinnerPosition: number | null; // Người giải đúng CNV
  cnvBuzzedPlayers?: { position: 1 | 2 | 3 | 4; timestamp: number }[];
  cnvBlockedPlayers?: number[];
  soHangNgang?: 4 | 8;
  scoringMode?: 'TRADITIONAL' | 'IMPROVED';
  redCells?: { [rowId: number]: number[] }; // Map of row ID to list of zero-based character indices highlighted red
  isLast15sRunning?: boolean;
  isLast15sStarted?: boolean;
}

export interface TangTocAnswer {
  playerPosition: number;
  answer: string;
  timestamp: number; // Time elapsed since timer start (seconds, rounded to 2 decimals)
}

export interface TangTocState {
  mode?: 'TRADITIONAL' | 'IMPROVED'; // Rule mode
  currentQuestionIndex: number; // 0-3
  answers: TangTocAnswer[]; // List of answers submitted for current question, sorted by timestamp
  showAnswers: boolean; // Show answer listing
  showExplanation: boolean; // Show question explanation / correct answer image
  showMedia?: boolean; // Toggle option to show images/videos simultaneously with questions or not

  // Improved mode tracking
  currentHintIndex?: number; // 0..3 (hint 1, 2, 3, 4)
  buzzerLocked?: boolean;
  buzzedPlayer?: number | null;
  buzzedTimestamp?: number | null;
  buzzedHintIndex?: number | null;
  blockedPlayers?: number[];
  pointsAwarded?: { [position: number]: number };
}

export interface VeDichQuestionChoice {
  points: 10 | 20 | 30 | 40;
  questionId: string; // Refers to ID in DB
}

export interface VeDichPlayerTurn {
  playerPosition: number;
  chosenPackage: VeDichQuestionChoice[]; // Array of choices (length 2-5)
  currentQuestionIndex: number; // 0..N-1
  starUsed: boolean; // Has Golden Star been activated for the current question?
  claimBuzzerState: 'LOCKED' | 'OPEN' | 'BUZZED';
  claimBuzzerPlayer: number | null; // The player who buzzed to steal points
  claimBuzzedTimestamp: number | null;
  showPackageBoard?: boolean;
  packageConfirmed?: boolean;
  draftPackage?: (10 | 20 | 30 | 40 | null)[];
  currentQuestionConfirmed?: boolean;
  starPenalized?: boolean;
}

export interface VeDichPresetPackage {
  id: string;
  name: string;
  pointsList: (10 | 20 | 30 | 40)[];
  totalPoints: number;
}

export interface VeDichPracticeTimer {
  type: 'MAIN' | 'CLAIM';
  duration: number; // Duration in seconds (20, 30, 45, 60, 90)
  startedAt: number;
  secondsLeft: number;
  isRunning: boolean;
}

export interface VeDichState {
  currentPlayerIndex: number | null; // Current active player turn (0-3 corresponding to positions 1-4)
  turns: { [position: number]: VeDichPlayerTurn };
  completedTurns: number[]; // Positions that finished their turn

  // --- VERSION 2.0 CONFIG & TRACKING ---
  ruleMode?: 'O20_PLUS' | 'O19'; // Default 'O20_PLUS'
  o20PackageQuestionCount?: number; // Number of questions per package in O20+ (2..5, default 3)
  o19PresetPackages?: VeDichPresetPackage[]; // Admin configured preset packages in O19
  practiceTimer?: VeDichPracticeTimer | null; // Real-time practice countdown timer
}

export type CHPhuRuleMode = 'TRADITIONAL' | 'IMPROVED' | 'SHOOTOUT';

export interface CHPhuState {
  currentQuestionIndex: number; // 0-24
  foulPlayers: number[]; // Players who buzzed BEFORE timer started (foul)
  incorrectPlayers: number[]; // Players who buzzed and answered incorrectly (cannot buzz again)
  buzzedPlayer: number | null;
  selectedPlayers?: number[]; // Selected candidate positions (1-4) in UI
  confirmedPlayers?: number[]; // Confirmed candidate positions (1-4)
  questionRevealed?: boolean; // If true, the question text is shown on screens
  buzzerMode?: 'CONTINUOUS' | 'ON_TIMER'; // Continuous vs only on timer
  winnerPosition?: number | null; // The player who won CH_PHU (for highlight)
  winnerReason?: string | null;

  // --- VERSION 2.0 EXTENSIONS ---
  ruleMode?: CHPhuRuleMode; // Default 'TRADITIONAL'
  scores?: Record<number, number>; // Separate CHP score map {1: 0, 2: 0, ...}
  totalTime?: Record<number, number>; // Sum of response times in seconds for correct answers in IMPROVED mode
  maxQuestions?: number; // Total max questions (15 for 2 players, 20 for 3, 25 for 4 in IMPROVED mode)
  questionStartTime?: number | null; // Timestamp when 15s/10s timer started for response time calculation

  // For SHOOTOUT / LUAN_LUU:
  currentTurnPlayer?: number | null; // Whose turn it is (1..4)
  turnOrder?: number[]; // Rotation list of active contestant positions, e.g. [1, 2, 3]
  turnIndex?: number; // Index in turnOrder
  playerQuestionCounts?: Record<number, number>; // How many questions answered by each player so far
  history?: Record<number, boolean[]>; // History of true (correct) / false (wrong) per contestant position
  activeContestants?: number[]; // Contestants currently active
  stage?: 'INITIAL' | 'SUDDEN_DEATH' | 'ENDED'; // Game stage for SHOOTOUT
  suddenDeathRound?: number; // Round index in sudden death (e.g. 6, 7...)
}

export interface JeopardyClueState {
  id: string; // e.g. "c0_q0"
  categoryIndex: number;
  clueIndex: number;
  points: number;
  question: string;
  dap_an_dung: string;
  media?: MediaAttachment;
  isAnswered?: boolean;
  answeredByPlayer?: number | null; // 1 | 2 | 3 | 4
  isCorrect?: boolean;
}

export interface JeopardyCategoryState {
  title: string;
  clues: JeopardyClueState[];
  isRevealed?: boolean;
}

export interface JeopardyState {
  boardSize: '5x4' | '6x5';
  categories: JeopardyCategoryState[];
  isBoardShown: boolean;
  selectedClue: { categoryIndex: number; clueIndex: number } | null;
  clueStage: 'CLOSED' | 'READING' | 'OPEN' | 'FINISHED';
  buzzerRuleMode: 'PENALTY_025' | 'STRICT_LOCK';
  scoringMode: 'COMBINED' | 'SEPARATE';
  controlPlayer: number | null; // Contestant who holds board control (yellow highlighted border)
  separateScores: Record<number, number>;
  buzzedPlayer: number | null;
  buzzedTimestamp: number | null;
  incorrectPlayersForClue: number[]; // Players who answered wrong for current clue
  foulPlayersForClue: number[]; // Positions of players who buzzed during READING (PENALTY_025 mode)
  foulUnlockTime: Record<number, number>; // Position -> timestamp when 0.25s delay ends
  is5sTimerRunning: boolean;
  timer5sSeconds: number;
  highlightedCategoryIndex?: number | null;
}

// --- CHINH PHỤC & GIẢI MÃ ĐIỆN THOẠI (GMĐT) TYPES ---

export interface ChinhPhucQuestion {
  id: string;
  noi_dung: string;
  dap_an_dung: string;
  muc_diem: 10 | 20 | 30;
  media?: MediaAttachment;
  chu_thich?: string;
}

export interface GMDTQuestion {
  mat_ma: string; // e.g. "8327515"
  goi_y: string;  // e.g. "Tên nước Việt Nam"
  dap_an_dung: string; // e.g. "VIETNAM"
}

export type PlayerColor = 'RED' | 'YELLOW' | 'BLUE' | 'GREEN';

export interface ChinhPhucCell {
  index: number; // 1..36
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'; // EASY: no symbol (10pt), MEDIUM: '!' (20pt), HARD: '?' (30pt)
  points: 10 | 20 | 30;
  claimedByPlayer: number | null; // Position 1, 2, 3, 4
}

export interface GMDTPlayerProgress {
  inputChars: string[];
  isCorrect: boolean | null;
  timeTakenMs: number | null;
  submittedAt: number | null;
}

export type GMDTStep = 'GIAO_DIEN' | 'MAT_MA' | 'GOI_Y' | 'DEM_GIO' | 'DAP_AN' | 'KET_QUA';

export interface GMDTState {
  step: GMDTStep;
  matMa: string;
  goiY: string;
  dapAnDung: string;
  playerProgress: Record<number, GMDTPlayerProgress>;
  isTimerRunning: boolean;
  timerSecondsLeft: number;
  timerTotalSeconds: number;
  timerStartedAt: number | null;
  ranks: { position: number; rank: 1 | 2 | 3 | 4; timeTakenMs?: number | null }[];
}

export interface RoundCustomSetting {
  title?: string;
  customName?: string;
  logoUrl?: string;
  customLogoUrl?: string;
}

export interface GameLogEntry {
  id: string;
  timestamp: number;
  round: GameRound;
  player?: number;
  playerName?: string;
  type: 'SCORE' | 'BUZZER' | 'ANSWER' | 'ROUND' | 'QUESTION' | 'SYSTEM';
  action: string;
  detail: string;
  scoreBefore?: number;
  scoreAfter?: number;
  scoreDelta?: number;
}

export interface ChinhPhucState {
  colorMethod: 'HIGH_TO_LOW' | 'LOW_TO_HIGH' | 'GMDT' | 'MANUAL' | null;
  colorConfirmed: boolean; // whether manual or auto selection is locked/confirmed
  colorRevealedCount: number; // 0..4
  colorRevealedSlots: boolean[]; // [slot0 (RED), slot1 (YELLOW), slot2 (BLUE), slot3 (GREEN)]
  isBoardShown: boolean;
  is10sTacticalRunning: boolean;
  tacticalRevealedCount: number; // 0..36
  board: ChinhPhucCell[];
  timeMode: 'TRADITIONAL' | 'IMPROVED';
  colorOrder: number[]; // positions 1..4 in turn order (Red -> Yellow -> Blue -> Green)
  playerColors: Record<number, PlayerColor>; // position -> color
  roundNumber: number; // 1..6
  turnIndex: number; // 0..3
  activePlayerPosition: number | null;
  selectedCellIndex: number | null; // 0..35
  selectedQuestion: ChinhPhucQuestion | null;
  questionState: 'IDLE' | 'SHOWING_QUESTION' | 'TIMER_RUNNING' | 'ANSWERED_CORRECT' | 'ANSWERED_INCORRECT';
  timerSecondsLeft: number;
  timerTotalSeconds: number;
  isTimerRunning: boolean;
  streaks5BonusAwarded: Record<number, string[]>;
  gmdt: GMDTState;
  // Dynamic cell count and symbol hiding options
  mediumCount?: number; // 6..12, default 10
  hardCount?: number;   // 6..12, default 8
  autoHideSymbolsAfter10s?: boolean; // default true
  symbolsHidden?: boolean; // whether symbols (! and ?) are currently hidden
  symbolsCountdownSecondsLeft?: number;
}

export interface SummaryState {
  mode: 'ROUNDS' | 'FINAL' | null;
  step: number; // 0 to 4 players revealed
}

export interface AudioConfig {
  volume: number; // 0.0 to 1.0
  isMuted: boolean;
}

export interface AudioEvent {
  soundId: string;
  action: 'PLAY' | 'STOP_ALL' | 'PAUSE' | 'RESUME' | 'STOP';
  timestamp: number;
}

export interface MediaControlState {
  isPlaying: boolean;
  key: number; // Increment to force replay
}

export interface ActiveExternalMedia {
  id?: string;
  name?: string;
  url: string;
  type: 'audio' | 'image' | 'video';
  isPlaying: boolean;
  key: number;
}

// Full real-time state structure stored in Server Memory
export interface MatchState {
  matchCode: string | null;
  tournamentName?: string; // Tên cuộc thi (VD: Chung Kết Olympia 26, Hội Thi Tri Thức...)
  currentRound: GameRound;
  players: { [position: number]: Player }; // Key is position (1-4)
  buzzerState: BuzzerState;
  buzzedPlayer: number | null;
  buzzedTimestamp: number | null;
  
  // Timer system
  timerSeconds: number;
  timerTotal: number;
  isTimerRunning: boolean;

  // Media & Audio controls
  mediaControl: MediaControlState;
  activeExternalMedia?: ActiveExternalMedia | null;
  audioConfig?: AudioConfig;
  audioEvent?: AudioEvent | null;
  audioEvents?: AudioEvent[] | null;

  // Round-specific complex states
  khoi_dong: KhoiDongState;
  vcnv: VcnvState;
  tang_toc: TangTocState;
  ve_dich: VeDichState;
  cau_hoi_phu: CHPhuState;
  jeopardy: JeopardyState;
  ma_tran_kep: MaTranKepRoundState;
  chinh_phuc: ChinhPhucState;
  dau_tri: DauTriState;
  summary: SummaryState;

  // In-app chat between Admin & MC
  chatHistory: ChatMessage[];

  // Timestamp when match questions were last loaded/reloaded
  loadedAt?: number;

  // Stream overlay visibility toggle
  overlayVisible?: boolean;

  // Match event log tracking (scores, buzzers, answers, grading)
  logs?: GameLogEntry[];

  // Custom round names & logos
  roundCustomSettings?: Record<string, RoundCustomSetting>;
}


// --- 3. SOCKET.IO EVENTS REGISTRY ---

export enum SocketEvent {
  // Common connection events
  CONNECTION = 'connection',
  DISCONNECT = 'disconnect',
  STATE_SYNC = 'game:state_sync',
  MATCH_QUESTIONS_UPDATED = 'game:match_questions_updated',
  ERROR = 'game:error',

  // Authentication & Session setup
  ADMIN_AUTH = 'admin:auth',
  ADMIN_LOAD_MATCH = 'admin:load_match',
  ADMIN_KICK_PLAYER = 'admin:kick_player',
  ADMIN_UPDATE_SCORE = 'admin:update_score',
  ADMIN_UPDATE_TOURNAMENT_NAME = 'admin:update_tournament_name',
  ADMIN_TOGGLE_OVERLAY = 'admin:toggle_overlay',
  PLAYER_JOIN = 'player:join',
  PLAYER_JOIN_SUCCESS = 'player:join_success',

  // Control events (Admin -> Server -> Client)
  CHANGE_ROUND = 'admin:change_round',
  NEXT_QUESTION = 'admin:next_question',
  PREV_QUESTION = 'admin:prev_question',
  START_TIMER = 'admin:start_timer',
  PAUSE_TIMER = 'admin:pause_timer',
  RESET_TIMER = 'admin:reset_timer',
  GRADE_ANSWER = 'admin:grade_answer', // Grading questions (Correct / Incorrect)

  // Audio Controls
  ADMIN_PLAY_SOUND = 'admin:play_sound',
  ADMIN_STOP_ALL_SOUNDS = 'admin:stop_all_sounds',
  ADMIN_UPDATE_AUDIO_CONFIG = 'admin:update_audio_config',

  // Khoi dong specific
  KHOI_DONG_SET_ROUND = 'admin:khoi_dong_set_round', // set individual/collective
  KHOI_DONG_SET_PLAYER = 'admin:khoi_dong_set_player',
  KHOI_DONG_START = 'admin:khoi_dong_start',
  KHOI_DONG_SET_START_QUESTION = 'admin:khoi_dong_set_start_question',
  KHOI_DONG_END_TURN = 'admin:khoi_dong_end_turn',
  KHOI_DONG_UPDATE_CONFIG = 'admin:khoi_dong_update_config',
  ADMIN_KHOI_DONG_PLAY_PREP_MUSIC = 'admin:khoi_dong_play_prep_music',
  ADMIN_KHOI_DONG_START_PREP = 'admin:khoi_dong_start_prep',

  // VCNV specific
  VCNV_SHOW_ROWS = 'admin:vcnv_show_rows',
  VCNV_SELECT_ROW = 'admin:vcnv_select_row',
  VCNV_OPEN_SEGMENT = 'admin:vcnv_open_segment',
  VCNV_SHOW_ANSWERS = 'admin:vcnv_show_answers',
  VCNV_AWARD_OBSTACLE = 'admin:vcnv_award_obstacle', // Award points for solving CNV
  VCNV_FOUL_OBSTACLE = 'admin:vcnv_foul_obstacle', // Penalize incorrect CNV solving
  VCNV_TOGGLE_RED_CELL = 'admin:vcnv_toggle_red_cell',
  VCNV_START_15S = 'admin:vcnv_start_15s',
  VCNV_SET_SCORING_MODE = 'admin:vcnv_set_scoring_mode',
  VCNV_SET_SO_HANG_NGANG = 'admin:vcnv_set_so_hang_ngang',
  PLAYER_BUZZ_CNV = 'player:buzz_cnv',

  // Tang toc specific
  TANG_TOC_SHOW_ANSWERS = 'admin:tang_toc_show_answers',
  TANG_TOC_SHOW_EXPLANATION = 'admin:tang_toc_show_explanation',
  TANG_TOC_SET_QUESTION = 'admin:tang_toc_set_question',
  TANG_TOC_TOGGLE_MEDIA = 'admin:tang_toc_toggle_media',
  TANG_TOC_SET_MODE = 'admin:tang_toc_set_mode',
  TANG_TOC_GRADE_IMPROVED = 'admin:tang_toc_grade_improved',
  TANG_TOC_RESUME_TIMER = 'admin:tang_toc_resume_timer',

  // Ve dich specific
  VE_DICH_SELECT_PLAYER = 'admin:ve_dich_select_player',
  VE_DICH_SHOW_PACKAGE_BOARD = 'admin:ve_dich_show_package_board',
  VE_DICH_SET_DRAFT_PACKAGE = 'admin:ve_dich_set_draft_package',
  VE_DICH_SET_PACKAGE = 'player:ve_dich_set_package',
  VE_DICH_SET_QUESTION_INDEX = 'admin:ve_dich_set_question_index',
  VE_DICH_CONFIRM_QUESTION = 'admin:ve_dich_confirm_question',
  VE_DICH_RESET_BUZZER = 'admin:ve_dich_reset_buzzer',
  VE_DICH_END_TURN = 'admin:ve_dich_end_turn',
  VE_DICH_TOGGLE_STAR = 'admin:ve_dich_toggle_star',
  VE_DICH_START_CLAIM = 'admin:ve_dich_start_claim', // Opens 5-second buzz timer for other players
  VE_DICH_SET_RULE_MODE = 'admin:ve_dich_set_rule_mode',
  VE_DICH_SET_PACKAGE_COUNT = 'admin:ve_dich_set_package_count',
  VE_DICH_SET_PRESET_PACKAGES = 'admin:ve_dich_set_preset_packages',
  VE_DICH_START_PRACTICE = 'admin:ve_dich_start_practice',
  VE_DICH_STOP_PRACTICE = 'admin:ve_dich_stop_practice',

  // Cau hoi phu (CHP) specific
  CHP_CONFIRM_PLAYERS = 'admin:chp_confirm_players',
  CHP_REVEAL_QUESTION = 'admin:chp_reveal_question',
  CHP_SET_BUZZER_MODE = 'admin:chp_set_buzzer_mode',
  CHP_SELECT_PLAYERS = 'admin:chp_select_players',
  CHP_SET_RULE_MODE = 'admin:chp_set_rule_mode',

  // Jeopardy specific (v3.0)
  JEOPARDY_SHOW_BOARD = 'admin:jeopardy_show_board',
  JEOPARDY_REVEAL_CATEGORY = 'admin:jeopardy_reveal_category',
  JEOPARDY_SELECT_CLUE = 'admin:jeopardy_select_clue',
  JEOPARDY_START_BUZZER = 'admin:jeopardy_start_buzzer',
  JEOPARDY_GRADE_ANSWER = 'admin:jeopardy_grade_answer',
  JEOPARDY_START_5S = 'admin:jeopardy_start_5s',
  JEOPARDY_CLOSE_CLUE = 'admin:jeopardy_close_clue',
  JEOPARDY_SET_BOARD_SIZE = 'admin:jeopardy_set_board_size',
  JEOPARDY_SET_BUZZER_RULE = 'admin:jeopardy_set_buzzer_rule',
  JEOPARDY_SET_SCORING_MODE = 'admin:jeopardy_set_scoring_mode',
  JEOPARDY_RESET_GAME = 'admin:jeopardy_reset_game',
  JEOPARDY_SET_CONTROL_PLAYER = 'admin:jeopardy_set_control_player',

  // Ma Tran Kep specific
  MA_TRAN_KEP_PREPARE = 'admin:ma_tran_kep_prepare',
  MA_TRAN_KEP_START = 'admin:ma_tran_kep_start',
  MA_TRAN_KEP_END = 'admin:ma_tran_kep_end',
  MA_TRAN_KEP_RESET = 'admin:ma_tran_kep_reset',
  MA_TRAN_KEP_SET_ACTIVE_PLAYER = 'admin:ma_tran_kep_set_active_player',
  MA_TRAN_KEP_TOGGLE_CELL = 'player:ma_tran_kep_toggle_cell',
  MA_TRAN_KEP_SKIP = 'player:ma_tran_kep_skip',
  MA_TRAN_KEP_SELECT_QUESTION = 'player:ma_tran_kep_select_question',

  // Chinh Phuc specific
  CHINH_PHUC_SET_COLOR_METHOD = 'admin:chinh_phuc_set_color_method',
  CHINH_PHUC_SET_MANUAL_COLORS = 'admin:chinh_phuc_set_manual_colors',
  CHINH_PHUC_CONFIRM_COLORS = 'admin:chinh_phuc_confirm_colors',
  CHINH_PHUC_REVEAL_NEXT_COLOR = 'admin:chinh_phuc_reveal_next_color',
  CHINH_PHUC_REVEAL_COLOR_SLOT = 'admin:chinh_phuc_reveal_color_slot',
  CHINH_PHUC_RESET_COLOR_METHOD = 'admin:chinh_phuc_reset_color_method',
  CHINH_PHUC_SHOW_BOARD = 'admin:chinh_phuc_show_board',
  CHINH_PHUC_START_TACTICAL_10S = 'admin:chinh_phuc_start_tactical_10s',
  CHINH_PHUC_REVEAL_ALL_CELLS = 'admin:chinh_phuc_reveal_all_cells',
  CHINH_PHUC_START_ROUND = 'admin:chinh_phuc_start_round',
  CHINH_PHUC_SELECT_CELL = 'admin:chinh_phuc_select_cell',
  CHINH_PHUC_SHOW_QUESTION = 'admin:chinh_phuc_show_question',
  CHINH_PHUC_START_TIMER = 'admin:chinh_phuc_start_timer',
  CHINH_PHUC_GRADE_ANSWER = 'admin:chinh_phuc_grade_answer',
  CHINH_PHUC_NEXT_TURN = 'admin:chinh_phuc_next_turn',
  CHINH_PHUC_END_ROUND = 'admin:chinh_phuc_end_round',
  CHINH_PHUC_SET_TIME_MODE = 'admin:chinh_phuc_set_time_mode',

  // GMDT (Giai ma dien thoai) specific
  GMDT_SET_STEP = 'admin:gmdt_set_step',
  GMDT_START_TIMER = 'admin:gmdt_start_timer',
  GMDT_PUBLISH_RESULTS = 'admin:gmdt_publish_results',
  PLAYER_GMDT_SUBMIT_CHAR = 'player:gmdt_submit_char',
  PLAYER_GMDT_SUBMIT_ALL = 'player:gmdt_submit_all',

  // Dau Tri specific (University Challenge format)
  DAU_TRI_CONFIG = 'admin:dau_tri_config',
  DAU_TRI_SET_CONFIG = 'admin:dau_tri_set_config',
  DAU_TRI_PREPARE = 'admin:dau_tri_prepare',
  DAU_TRI_START_ROUND = 'admin:dau_tri_start_round',
  DAU_TRI_START_MAIN_QUESTION = 'admin:dau_tri_start_main_question',
  DAU_TRI_REVEAL_MAIN_QUESTION = 'admin:dau_tri_reveal_main_question',
  DAU_TRI_BUZZ = 'player:dau_tri_buzz',
  DAU_TRI_GRADE_MAIN = 'admin:dau_tri_grade_main',
  DAU_TRI_GRADE_MAIN_ANSWER = 'admin:dau_tri_grade_main_answer',
  DAU_TRI_SKIP_MAIN = 'admin:dau_tri_skip_main',
  DAU_TRI_SKIP_MAIN_QUESTION = 'admin:dau_tri_skip_main_question',
  DAU_TRI_NEXT_MAIN = 'admin:dau_tri_next_main',
  DAU_TRI_NEXT_MAIN_QUESTION = 'admin:dau_tri_next_main_question',
  DAU_TRI_SHOW_BONUS_THEME = 'admin:dau_tri_show_bonus_theme',
  DAU_TRI_SHOW_BONUS_QUESTION = 'admin:dau_tri_show_bonus_question',
  DAU_TRI_START_BONUS_TIMER = 'admin:dau_tri_start_bonus_timer',
  DAU_TRI_GRADE_BONUS = 'admin:dau_tri_grade_bonus',
  DAU_TRI_GRADE_BONUS_ANSWER = 'admin:dau_tri_grade_bonus_answer',
  DAU_TRI_END_ROUND = 'admin:dau_tri_end_round',
  DAU_TRI_RESET_ROUND = 'admin:dau_tri_reset_round',

  // Summary specific
  SUMMARY_SET_MODE = 'admin:summary_set_mode',
  SUMMARY_SET_STEP = 'admin:summary_set_step',

  // Player action submissions (Client -> Server)
  PLAYER_SUBMIT_ANSWER = 'player:submit_answer',
  PLAYER_BUZZ = 'player:buzz', // Buzz for general questions / collective rounds

  // Chat system
  SEND_CHAT_MESSAGE = 'chat:send_message',
  RECEIVE_CHAT_MESSAGE = 'chat:receive_message',

  // Media controls
  MEDIA_PLAY = 'admin:media_play',
  MEDIA_PAUSE = 'admin:media_pause',
  MEDIA_REPLAY = 'admin:media_replay',
  ADMIN_SET_EXTERNAL_MEDIA = 'admin:set_external_media',
  ADMIN_CLEAR_EXTERNAL_MEDIA = 'admin:clear_external_media',

  // Custom round names & logos
  ADMIN_UPDATE_ROUND_SETTINGS = 'admin:update_round_settings',

  // Logs management
  ADMIN_CLEAR_LOGS = 'admin:clear_logs',

  // Chinh phuc grid config & symbols hiding
  CHINH_PHUC_CONFIG_GRID = 'admin:chinh_phuc_config_grid',
  CHINH_PHUC_TOGGLE_SYMBOLS_HIDDEN = 'admin:chinh_phuc_toggle_symbols_hidden',
  CHINH_PHUC_SET_AUTO_HIDE_SYMBOLS = 'admin:chinh_phuc_set_auto_hide_symbols',

  // Session management
  SESSION_TERMINATED = 'session:terminated'
}
