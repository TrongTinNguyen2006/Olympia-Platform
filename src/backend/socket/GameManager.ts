import { 
  MatchState, 
  Player, 
  GameRound, 
  BuzzerState, 
  KhoiDongState, 
  VcnvState, 
  TangTocState, 
  VeDichState, 
  CHPhuState, 
  JeopardyState,
  JeopardyCategoryState,
  JeopardyClueState,
  ChatMessage,
  MatchDbModel,
  TangTocAnswer,
  AudioEvent,
  VeDichPresetPackage,
  MaTranKepQuestion,
  MaTranKepData,
  MaTranKepCard,
  MaTranKepPlayerState,
  MaTranKepRoundState,
  ChinhPhucState,
  GMDTState,
  ChinhPhucCell,
  GMDTStep,
  PlayerColor,
  ChinhPhucQuestion,
  GMDTQuestion,
  DauTriState,
  DauTriQuestion,
  DauTriBonusPack,
  DauTriBonusQuestion,
  DauTriEndRule,
  DauTriStage,
  GameLogEntry,
  RoundCustomSetting
} from '../../types.js';

export function shuffleArray<T>(arr: T[]): T[] {
  const res = [...arr];
  for (let i = res.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [res[i], res[j]] = [res[j], res[i]];
  }
  return res;
}

const FALLBACK_DISTRACTORS_24: string[] = [
  'SÔNG AMAZON', 'BẮC KINH', 'KIM CƯƠNG', 'OHM',
  'PARIS', 'SẮT', 'CANXI', 'SÔNG NIÊM',
  'TOKYO', 'VÀNG', 'LISSABON', 'JOULE',
  'SÔNG ĐỒNG NAI', 'CẦN THƠ', 'LÂM ĐỒNG', 'BANGKOK',
  'HELI', 'NEON', 'LỤC THỂ', 'AMPE',
  'THĂNG LONG', 'BẠCH ĐẰNG', 'VẠN XUÂN', 'ĐẠI VIỆT'
];

export function createDefaultMaTranKepQuestions(): MaTranKepData {
  return {
    cau_hoi: [
      { id: 1, noi_dung: 'Sông lớn chảy qua Việt Nam', dap_an_1: 'Sông Hồng', dap_an_2: 'Sông Mê Kông' },
      { id: 2, noi_dung: 'Thành phố trực thuộc Trung ương', dap_an_1: 'Hà Nội', dap_an_2: 'Đà Nẵng' },
      { id: 3, noi_dung: 'Tỉnh ven biển miền Trung', dap_an_1: 'Quảng Nam', dap_an_2: 'Bình Định' },
      { id: 4, noi_dung: 'Tác phẩm tiêu biểu của Nam Cao', dap_an_1: 'Chí Phèo', dap_an_2: 'Lão Hạc' },
      { id: 5, noi_dung: 'Kim loại dẫn điện tốt', dap_an_1: 'Bạc', dap_an_2: 'Đồng' },
      { id: 6, noi_dung: 'Hành tinh trong Hệ Mặt Trời', dap_an_1: 'Hỏa Tinh', dap_an_2: 'Mộc Tinh' },
      { id: 7, noi_dung: 'Nhà thơ trong phong trào Thơ Mới', dap_an_1: 'Xuân Diệu', dap_an_2: 'Huy Cận' },
      { id: 8, noi_dung: 'Đại dương trên Trái Đất', dap_an_1: 'Thái Bình Dương', dap_an_2: 'Ấn Độ Dương' },
      { id: 9, noi_dung: 'Số nguyên tố nhỏ hơn 10', dap_an_1: '2', dap_an_2: '7' },
      { id: 10, noi_dung: 'Quốc gia ở Đông Nam Á', dap_an_1: 'Thái Lan', dap_an_2: 'Malaysia' },
      { id: 11, noi_dung: 'Đơn vị đo trong Vật lý', dap_an_1: 'Newton', dap_an_2: 'Watt' },
      { id: 12, noi_dung: 'Hợp chất chứa Carbon', dap_an_1: 'Metan', dap_an_2: 'Ethanol' }
    ],
    dap_an_nhieu: [...FALLBACK_DISTRACTORS_24]
  };
}

export function createDefaultMaTranKepPlayerState(): MaTranKepPlayerState {
  return {
    board: [],
    currentQuestionIndex: 0,
    solvedQuestionIds: [],
    skippedQuestionIds: [],
    selectedCellIndices: [],
    feedbackState: 'NONE',
    feedbackMessage: null,
    isLocked: false,
    lockEndTime: null,
    score: 0,
    isFinished: false
  };
}

export function createDefaultMaTranKepState(): MaTranKepRoundState {
  return {
    status: 'IDLE',
    timerSecondsLeft: 180,
    timerTotalSeconds: 180,
    isTimerRunning: false,
    activePlayerPosition: 1,
    playerStates: {
      1: createDefaultMaTranKepPlayerState(),
      2: createDefaultMaTranKepPlayerState(),
      3: createDefaultMaTranKepPlayerState(),
      4: createDefaultMaTranKepPlayerState()
    }
  };
}

export function createDefaultJeopardyCategories(boardSize: '5x4' | '6x5' = '5x4'): JeopardyCategoryState[] {
  const is6x5 = boardSize === '6x5';
  const numCats = is6x5 ? 6 : 5;
  const numClues = is6x5 ? 5 : 4;

  const sampleCategoriesData = [
    {
      title: 'LỊCH SỬ VIỆT NAM',
      clues: [
        { points: 10, question: 'Vị tướng đã chỉ huy Trận Bạch Đằng năm 938 đánh tan quân Nam Hán?', dap_an_dung: 'NGÔ QUYỀN' },
        { points: 20, question: 'Tên quốc hiệu đầu tiên trong lịch sử nước ta dưới thời Các Vua Hùng?', dap_an_dung: 'VĂN LANG' },
        { points: 30, question: 'Ai là tác giả của bản "Hịch tướng sĩ" nổi tiếng thời nhà Trần?', dap_an_dung: 'TRẦN HƯNG ĐẠO / TRẦN QUỐC TUẤN' },
        { points: 40, question: 'Thủ đô Thăng Long chính thức được Lý Thái Tổ dời về từ đâu vào năm 1010?', dap_an_dung: 'HOA LƯ' },
        { points: 50, question: 'Vị vua cuối cùng của triều đại phong kiến Việt Nam là ai?', dap_an_dung: 'BẢO ĐẠI' },
      ]
    },
    {
      title: 'ĐỊA LÝ & TỰ NHIÊN',
      clues: [
        { points: 10, question: 'Tỉnh thành nào có diện tích tự nhiên lớn nhất Việt Nam?', dap_an_dung: 'NGHỆ AN' },
        { points: 20, question: 'Ngọn núi cao nhất Việt Nam và toàn cõi Đông Dương là núi nào?', dap_an_dung: 'FANSIPAN / PANSIPAN' },
        { points: 30, question: 'Con sông chảy hoàn toàn trên lãnh thổ Việt Nam có chiều dài lớn nhất?', dap_an_dung: 'SÔNG ĐỒNG NAI' },
        { points: 40, question: 'Thành phố trực thuộc trung ương nào nằm ở khu vực Đồng bằng Sông Cửu Long?', dap_an_dung: 'CẦN THƠ' },
        { points: 50, question: 'Hồ nước ngọt tự nhiên lớn nhất Việt Nam nằm ở tỉnh Bắc Kạn?', dap_an_dung: 'HỒ BA BỂ' },
      ]
    },
    {
      title: 'KHOA HỌC & TỰ NHIÊN',
      clues: [
        { points: 10, question: 'Hành tinh nào nằm gần Mặt Trời nhất trong Hệ Mặt Trời?', dap_an_dung: 'SAO THỦY' },
        { points: 20, question: 'Khí nào chiếm tỉ lệ phần trăm thể tích lớn nhất trong không khí quyển Trái Đất?', dap_an_dung: 'NITƠ (N2)' },
        { points: 30, question: 'Bảng tuần hoàn các nguyên tố hóa học do nhà khoa học nào công bố năm 1869?', dap_an_dung: 'MENDELEEV' },
        { points: 40, question: 'Vận tốc ánh sáng trong chân không xấp xỉ bằng bao nhiêu km/s?', dap_an_dung: '300.000 KM/S' },
        { points: 50, question: 'Bào quan trong tế bào nhân thực được gọi là "nhà máy năng lượng" của tế bào?', dap_an_dung: 'TY THỂ' },
      ]
    },
    {
      title: 'VĂN HỌC & NGHỆ THUẬT',
      clues: [
        { points: 10, question: 'Tác giả của kiệt tác "Truyện Kiều" là danh nhân văn hóa nào?', dap_an_dung: 'NGUYỄN DU' },
        { points: 20, question: 'Nhà văn là tác giả của tác phẩm thiếu nhi "Dế Mèn Phiêu Lưu Ký"?', dap_an_dung: 'TÔ HOÀI' },
        { points: 30, question: 'Họa sĩ là tác giả của bức tranh sơn dầu nổi tiếng "Thiếu nữ bên hoa huệ"?', dap_an_dung: 'TÔ NGỌC VÂN' },
        { points: 40, question: 'Nhạc sĩ sáng tác ca khúc "Tiến Quân Ca" - Quốc ca Việt Nam?', dap_an_dung: 'VĂN CAO' },
        { points: 50, question: 'Tập thơ "Nhật ký trong tù" của Chủ tịch Hồ Chí Minh gồm bao nhiêu bài thơ chữ Hán?', dap_an_dung: '133 BÀI THƠ' },
      ]
    },
    {
      title: 'THỂ THAO & GIẢI TRÍ',
      clues: [
        { points: 10, question: 'Giải vô địch bóng đá thế giới FIFA World Cup được tổ chức định kỳ mấy năm 1 lần?', dap_an_dung: '4 NĂM' },
        { points: 20, question: 'Môn thể thao nào được vinh danh là "Môn thể thao Vua"?', dap_an_dung: 'BÓNG ĐÁ' },
        { points: 30, question: 'Vận động viên điền kinh người Jamaica giữ kỷ lục thế giới chạy 100m (9.58s)?', dap_an_dung: 'USAIN BOLT' },
        { points: 40, question: 'Đội tuyển bóng đá nam nào giàu thành tích nhất lịch sử World Cup với 5 lần vô địch?', dap_an_dung: 'BRAZIL' },
        { points: 50, question: 'Quốc gia nào là quê hương của Thế vận hội Olympic thời cổ đại?', dap_an_dung: 'HY LẠP' },
      ]
    },
    {
      title: 'HIỂU BIẾT CHUNG',
      clues: [
        { points: 10, question: 'Đơn vị tiền tệ chính thức của Liên minh Châu Âu (EU) là gì?', dap_an_dung: 'EURO' },
        { points: 20, question: 'Đất nước nào có diện tích lãnh thổ lớn nhất thế giới?', dap_an_dung: 'NGA' },
        { points: 30, question: 'Ngôn ngữ nào có số lượng người nói bản ngữ đông nhất thế giới?', dap_an_dung: 'TIẾNG TRUNG QUỐC' },
        { points: 40, question: 'Tòa nhà cao nhất thế giới hiện nay Burj Khalifa nằm ở thành phố nào?', dap_an_dung: 'DUBAI' },
        { points: 50, question: 'Đại dương nào có diện tích và độ sâu lớn nhất trên Trái Đất?', dap_an_dung: 'THÁI BÌNH DƯƠNG' },
      ]
    }
  ];

  const categories: JeopardyCategoryState[] = [];

  for (let c = 0; c < numCats; c++) {
    const catData = sampleCategoriesData[c] || {
      title: `CHỦ ĐỀ ${c + 1}`,
      clues: []
    };

    const clues: JeopardyClueState[] = [];
    for (let k = 0; k < numClues; k++) {
      const clueData = catData.clues[k] || {
        points: (k + 1) * 10,
        question: `Nội dung gợi ý ${(k + 1) * 10} điểm - Chủ đề ${c + 1}`,
        dap_an_dung: `ĐÁP ÁN ${(k + 1) * 10}Đ`
      };

      clues.push({
        id: `c${c}_q${k}`,
        categoryIndex: c,
        clueIndex: k,
        points: clueData.points,
        question: clueData.question,
        dap_an_dung: clueData.dap_an_dung,
        isAnswered: false,
        answeredByPlayer: null
      });
    }

    categories.push({
      title: catData.title,
      clues
    });
  }

  return categories;
}

function isValid5Sequence(seq: { difficulty: 'EASY' | 'MEDIUM' | 'HARD' }[]): boolean {
  const hasEasy = seq.some(s => s.difficulty === 'EASY');
  const hasMediumOrHard = seq.some(s => s.difficulty === 'MEDIUM' || s.difficulty === 'HARD');
  const typesCount = new Set(seq.map(s => s.difficulty)).size;
  return hasEasy && hasMediumOrHard && typesCount >= 2;
}

export function generateChinhPhucGrid(mediumCount: number = 10, hardCount: number = 8): ChinhPhucCell[] {
  const med = Math.max(6, Math.min(12, Math.round(mediumCount || 10)));
  const hrd = Math.max(6, Math.min(12, Math.round(hardCount || 8)));
  const easy = Math.max(0, 36 - med - hrd);

  let attempts = 0;
  while (attempts < 2000) {
    attempts++;
    const items: { difficulty: 'EASY' | 'MEDIUM' | 'HARD'; points: 10 | 20 | 30 }[] = [];
    for (let i = 0; i < easy; i++) items.push({ difficulty: 'EASY', points: 10 });
    for (let i = 0; i < med; i++) items.push({ difficulty: 'MEDIUM', points: 20 });
    for (let i = 0; i < hrd; i++) items.push({ difficulty: 'HARD', points: 30 });
    
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }

    const getAt = (r: number, c: number) => items[r * 6 + c];

    let valid = true;

    // Check horizontal
    for (let r = 0; r < 6 && valid; r++) {
      for (let c = 0; c <= 1 && valid; c++) {
        const seq = [getAt(r, c), getAt(r, c+1), getAt(r, c+2), getAt(r, c+3), getAt(r, c+4)];
        if (!isValid5Sequence(seq)) valid = false;
      }
    }

    // Check vertical
    for (let c = 0; c < 6 && valid; c++) {
      for (let r = 0; r <= 1 && valid; r++) {
        const seq = [getAt(r, c), getAt(r+1, c), getAt(r+2, c), getAt(r+3, c), getAt(r+4, c)];
        if (!isValid5Sequence(seq)) valid = false;
      }
    }

    // Check diagonals
    const diagSeqs = [
      [0,1,2,3,4].map(i => getAt(i, i)),
      [0,1,2,3,4].map(i => getAt(i+1, i+1)),
      [0,1,2,3,4].map(i => getAt(i, i+1)),
      [0,1,2,3,4].map(i => getAt(i+1, i)),
      [0,1,2,3,4].map(i => getAt(i, 5-i)),
      [0,1,2,3,4].map(i => getAt(i+1, 4-i)),
      [0,1,2,3,4].map(i => getAt(i, 4-i)),
      [0,1,2,3,4].map(i => getAt(i+1, 5-i)),
    ];

    for (const seq of diagSeqs) {
      if (!isValid5Sequence(seq)) {
        valid = false;
        break;
      }
    }

    if (valid) {
      return items.map((it, idx) => ({
        index: idx + 1,
        difficulty: it.difficulty,
        points: it.points,
        claimedByPlayer: null
      }));
    }
  }

  const fallbackItems: { difficulty: 'EASY' | 'MEDIUM' | 'HARD'; points: 10 | 20 | 30 }[] = [];
  for (let i = 0; i < easy; i++) fallbackItems.push({ difficulty: 'EASY', points: 10 });
  for (let i = 0; i < med; i++) fallbackItems.push({ difficulty: 'MEDIUM', points: 20 });
  for (let i = 0; i < hrd; i++) fallbackItems.push({ difficulty: 'HARD', points: 30 });
  return fallbackItems.map((it, idx) => ({
    index: idx + 1,
    difficulty: it.difficulty,
    points: it.points,
    claimedByPlayer: null
  }));
}

export function getAll5LineKeys(): { id: string; cellIndices: number[] }[] {
  const lines: { id: string; cellIndices: number[] }[] = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c <= 1; c++) {
      lines.push({ id: `H_${r}_${c}`, cellIndices: [0,1,2,3,4].map(i => r * 6 + (c + i)) });
    }
  }
  for (let c = 0; c < 6; c++) {
    for (let r = 0; r <= 1; r++) {
      lines.push({ id: `V_${c}_${r}`, cellIndices: [0,1,2,3,4].map(i => (r + i) * 6 + c) });
    }
  }
  lines.push({ id: 'D_M1', cellIndices: [0, 7, 14, 21, 28] });
  lines.push({ id: 'D_M2', cellIndices: [7, 14, 21, 28, 35] });
  lines.push({ id: 'D_M3', cellIndices: [1, 8, 15, 22, 29] });
  lines.push({ id: 'D_M4', cellIndices: [6, 13, 20, 27, 34] });
  lines.push({ id: 'D_A1', cellIndices: [5, 10, 15, 20, 25] });
  lines.push({ id: 'D_A2', cellIndices: [10, 15, 20, 25, 30] });
  lines.push({ id: 'D_A3', cellIndices: [4, 9, 14, 19, 24] });
  lines.push({ id: 'D_A4', cellIndices: [11, 16, 21, 26, 31] });
  return lines;
}

export function checkChinhPhuc5InARowBonus(
  board: ChinhPhucCell[],
  awardedMap: Record<number, string[]>
): { playerPosition: number; bonusPoints: number; lineIds: string[] }[] {
  const allLines = getAll5LineKeys();
  const results: { playerPosition: number; bonusPoints: number; lineIds: string[] }[] = [];

  for (let p = 1; p <= 4; p++) {
    const playerAwarded = awardedMap[p] || [];
    const newlyAwardedLines: string[] = [];

    for (const line of allLines) {
      const isFull = line.cellIndices.every(idx => board[idx]?.claimedByPlayer === p);
      if (isFull && !playerAwarded.includes(line.id)) {
        newlyAwardedLines.push(line.id);
      }
    }

    if (newlyAwardedLines.length > 0) {
      results.push({
        playerPosition: p,
        bonusPoints: newlyAwardedLines.length * 40,
        lineIds: newlyAwardedLines
      });
    }
  }

  return results;
}

export function createDefaultGMDTState(): GMDTState {
  return {
    step: 'GIAO_DIEN',
    matMa: '8327515',
    goiY: 'Tên đất nước ta viết liền không dấu (7 chữ cái)',
    dapAnDung: 'VIETNAM',
    playerProgress: {
      1: { inputChars: Array(7).fill(''), isCorrect: null, timeTakenMs: null, submittedAt: null },
      2: { inputChars: Array(7).fill(''), isCorrect: null, timeTakenMs: null, submittedAt: null },
      3: { inputChars: Array(7).fill(''), isCorrect: null, timeTakenMs: null, submittedAt: null },
      4: { inputChars: Array(7).fill(''), isCorrect: null, timeTakenMs: null, submittedAt: null },
    },
    isTimerRunning: false,
    timerSecondsLeft: 60,
    timerTotalSeconds: 60,
    timerStartedAt: null,
    ranks: []
  };
}

export function createDefaultChinhPhucState(): ChinhPhucState {
  return {
    colorMethod: null,
    colorConfirmed: false,
    colorRevealedCount: 0,
    colorRevealedSlots: [false, false, false, false],
    isBoardShown: false,
    is10sTacticalRunning: false,
    tacticalRevealedCount: 0,
    board: generateChinhPhucGrid(10, 8),
    timeMode: 'TRADITIONAL',
    colorOrder: [1, 2, 3, 4],
    playerColors: { 1: 'RED', 2: 'YELLOW', 3: 'BLUE', 4: 'GREEN' },
    roundNumber: 1,
    turnIndex: 0,
    activePlayerPosition: 1,
    selectedCellIndex: null,
    selectedQuestion: null,
    questionState: 'IDLE',
    timerSecondsLeft: 0,
    timerTotalSeconds: 10,
    isTimerRunning: false,
    streaks5BonusAwarded: { 1: [], 2: [], 3: [], 4: [] },
    gmdt: createDefaultGMDTState(),
    mediumCount: 10,
    hardCount: 8,
    autoHideSymbolsAfter10s: true,
    symbolsHidden: false,
    symbolsCountdownSecondsLeft: 0
  };
}

export function createDefaultDauTriState(): DauTriState {
  return {
    status: 'CONFIG',
    endRule: 'QUESTIONS_LIMIT',
    maxQuestions: 15,
    timeLimitSeconds: 900,
    targetScore: 100,
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
    threeMinWarningPlayed: false,
    reminderPlayed: false
  };
}

export class GameManager {
  private static instance: GameManager | null = null;
  private state: MatchState;
  
  // Timer references
  private timerInterval: NodeJS.Timeout | null = null;
  private categoryHighlightTimeout: NodeJS.Timeout | null = null;
  private dauTriOverallTimerInterval: NodeJS.Timeout | null = null;
  private dauTriBonusTimerInterval: NodeJS.Timeout | null = null;
  private chinhPhucAutoHideTimer: NodeJS.Timeout | null = null;
  private timerStartTime: number = 0; // Absolute timestamp when timer started
  private timerSecondsRemaining: number = 0;
  private timerTotalDuration: number = 0;
  private onTickCallback: ((sec: number) => void) | null = null;
  private onCompleteCallback: (() => void) | null = null;
  public onStateChange: (() => void) | null = null;

  // Active question bank data loaded in memory
  private matchQuestions: MatchDbModel | null = null;

  private constructor() {
    this.state = this.getInitialState();
  }

  public static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  /**
   * Reset or initialize state to default values
   */
  private getInitialState(): MatchState {
    return {
      matchCode: null,
      tournamentName: this.state?.tournamentName || 'Đường Lên Đỉnh Olympia',
      currentRound: 'WAITING',
      players: {
        1: { socketId: null, name: '', position: 1, score: 0, isReady: false },
        2: { socketId: null, name: '', position: 2, score: 0, isReady: false },
        3: { socketId: null, name: '', position: 3, score: 0, isReady: false },
        4: { socketId: null, name: '', position: 4, score: 0, isReady: false },
      },
      buzzerState: 'LOCKED',
      buzzedPlayer: null,
      buzzedTimestamp: null,
      timerSeconds: 0,
      timerTotal: 0,
      isTimerRunning: false,
      overlayVisible: true,

      khoi_dong: {
        subRound: null, // Mặc định chưa chọn lượt cá nhân hay chung
        isConfirmed: false, // Mặc định chưa chốt cài đặt lượt thi
        currentPlayerIndex: null,
        currentQuestionIndex: 0,
        answeredQuestions: {},
        isStarted: false,
        startQuestionIndex: 0,
        countAnswered: 0,
        autoNextQuestion: true,
        isPrepRunning: false,
        prepCountdown: 0,
        individualRule: 'O24',
        individualTimerDuration: null, // O24+ has no time limit
        individualMaxQuestions: 6, // Admin input number
        individualScoringMode: 'TRADITIONAL',
        collectiveRule: 'O23',
        collectiveTimerDuration: null, // O23+ has no time limit
        collectiveMaxQuestions: 12, // Admin input number
        collectiveScoringMode: 'TRADITIONAL',
        collectiveBuzzerDelay: 3,
        disqualifyThreshold: 3,
        wrongCounts: { 1: 0, 2: 0, 3: 0, 4: 0 },
        blockedThisQuestionPlayers: [],
        blockedNextQuestionPlayers: [],
        disqualifiedPlayers: [],
        playerStats: {
          1: { correct: 0, wrong: 0, skip: 0, total: 0 },
          2: { correct: 0, wrong: 0, skip: 0, total: 0 },
          3: { correct: 0, wrong: 0, skip: 0, total: 0 },
          4: { correct: 0, wrong: 0, skip: 0, total: 0 }
        }
      },

      vcnv: {
        showRows: false,
        selectedRow: null,
        rows: {
          1: { id: 1, isOpen: false, isAnswered: false, playerAnswers: {}, showAnswers: false },
          2: { id: 2, isOpen: false, isAnswered: false, playerAnswers: {}, showAnswers: false },
          3: { id: 3, isOpen: false, isAnswered: false, playerAnswers: {}, showAnswers: false },
          4: { id: 4, isOpen: false, isAnswered: false, playerAnswers: {}, showAnswers: false },
          5: { id: 5, isOpen: false, isAnswered: false, playerAnswers: {}, showAnswers: false }, // Center
        },
        revealedSegments: [],
        cnvBuzzedPlayer: null,
        cnvBuzzerLocked: false,
        cnvBuzzedTimestamp: null,
        cnvSolved: false,
        cnvWinnerPosition: null,
        cnvBuzzedPlayers: [],
        cnvBlockedPlayers: []
      },

      tang_toc: {
        mode: 'TRADITIONAL',
        currentQuestionIndex: -1,
        answers: [],
        showAnswers: false,
        showExplanation: false,
        showMedia: true,
        currentHintIndex: 0,
        buzzerLocked: true,
        buzzedPlayer: null,
        buzzedTimestamp: null,
        buzzedHintIndex: null,
        blockedPlayers: []
      },

      ve_dich: {
        currentPlayerIndex: null,
        turns: {
          1: { playerPosition: 1, chosenPackage: [], currentQuestionIndex: 0, starUsed: false, claimBuzzerState: 'LOCKED', claimBuzzerPlayer: null, claimBuzzedTimestamp: null, showPackageBoard: false, packageConfirmed: false, draftPackage: [null, null, null], currentQuestionConfirmed: false, starPenalized: false },
          2: { playerPosition: 2, chosenPackage: [], currentQuestionIndex: 0, starUsed: false, claimBuzzerState: 'LOCKED', claimBuzzerPlayer: null, claimBuzzedTimestamp: null, showPackageBoard: false, packageConfirmed: false, draftPackage: [null, null, null], currentQuestionConfirmed: false, starPenalized: false },
          3: { playerPosition: 3, chosenPackage: [], currentQuestionIndex: 0, starUsed: false, claimBuzzerState: 'LOCKED', claimBuzzerPlayer: null, claimBuzzedTimestamp: null, showPackageBoard: false, packageConfirmed: false, draftPackage: [null, null, null], currentQuestionConfirmed: false, starPenalized: false },
          4: { playerPosition: 4, chosenPackage: [], currentQuestionIndex: 0, starUsed: false, claimBuzzerState: 'LOCKED', claimBuzzerPlayer: null, claimBuzzedTimestamp: null, showPackageBoard: false, packageConfirmed: false, draftPackage: [null, null, null], currentQuestionConfirmed: false, starPenalized: false },
        },
        completedTurns: [],
        ruleMode: 'O20_PLUS',
        o20PackageQuestionCount: 3,
        o19PresetPackages: [
          { id: 'pkg1', name: 'Gói 40 điểm', pointsList: [10, 10, 20], totalPoints: 40 },
          { id: 'pkg2', name: 'Gói 60 điểm', pointsList: [10, 20, 30], totalPoints: 60 },
          { id: 'pkg3', name: 'Gói 80 điểm', pointsList: [20, 30, 30], totalPoints: 80 },
          { id: 'pkg4', name: 'Gói 100 điểm', pointsList: [30, 30, 40], totalPoints: 100 }
        ],
        practiceTimer: null
      },

      cau_hoi_phu: {
        currentQuestionIndex: 0,
        foulPlayers: [],
        incorrectPlayers: [],
        buzzedPlayer: null,
        selectedPlayers: [],
        confirmedPlayers: [],
        questionRevealed: false,
        buzzerMode: 'ON_TIMER',
        ruleMode: 'TRADITIONAL',
        scores: { 1: 0, 2: 0, 3: 0, 4: 0 },
        totalTime: { 1: 0, 2: 0, 3: 0, 4: 0 },
        maxQuestions: 15,
        stage: 'INITIAL',
        playerQuestionCounts: { 1: 0, 2: 0, 3: 0, 4: 0 }
      },

      summary: {
        mode: null,
        step: 0
      },

      jeopardy: {
        boardSize: '5x4',
        categories: createDefaultJeopardyCategories('5x4'),
        isBoardShown: false,
        selectedClue: null,
        clueStage: 'CLOSED',
        buzzerRuleMode: 'PENALTY_025',
        scoringMode: 'SEPARATE',
        controlPlayer: null,
        separateScores: { 1: 0, 2: 0, 3: 0, 4: 0 },
        buzzedPlayer: null,
        buzzedTimestamp: null,
        incorrectPlayersForClue: [],
        foulPlayersForClue: [],
        foulUnlockTime: {},
        is5sTimerRunning: false,
        timer5sSeconds: 5,
      },

      ma_tran_kep: createDefaultMaTranKepState(),
      chinh_phuc: createDefaultChinhPhucState(),
      dau_tri: createDefaultDauTriState(),

      mediaControl: {
        isPlaying: true,
        key: 0
      },

      activeExternalMedia: null,

      audioConfig: {
        volume: 1.0,
        isMuted: false
      },
      audioEvent: null,
      audioEvents: [],

      chatHistory: [],
      logs: [],
      roundCustomSettings: {}
    };
  }

  // --- AUDIO CONTROLS ---

  private audioEventSeq: number = 0;

  private emitAudioEvent(event: Omit<AudioEvent, 'timestamp'> & { timestamp?: number }): void {
    this.audioEventSeq = (this.audioEventSeq + 1) % 1000000;
    const fullEvent: AudioEvent = {
      ...event,
      timestamp: event.timestamp || (Date.now() + this.audioEventSeq * 0.0001)
    };
    this.state.audioEvent = fullEvent;
    if (!this.state.audioEvents) {
      this.state.audioEvents = [];
    }
    this.state.audioEvents.push(fullEvent);
    if (this.state.audioEvents.length > 20) {
      this.state.audioEvents = this.state.audioEvents.slice(-20);
    }
  }

  public playSound(soundId: string): void {
    this.emitAudioEvent({
      soundId,
      action: 'PLAY'
    });
    console.log(`🔊 Audio Event Triggered: ${soundId}`);
  }

  public pauseSound(soundId: string): void {
    this.emitAudioEvent({
      soundId,
      action: 'PAUSE'
    });
    console.log(`⏸️ Audio Paused: ${soundId}`);
  }

  public resumeSound(soundId: string): void {
    this.emitAudioEvent({
      soundId,
      action: 'RESUME'
    });
    console.log(`▶️ Audio Resumed: ${soundId}`);
  }

  public stopSound(soundId: string): void {
    this.emitAudioEvent({
      soundId,
      action: 'STOP'
    });
    console.log(`⏹️ Audio Stopped: ${soundId}`);
  }

  public stopAllSounds(): void {
    this.emitAudioEvent({
      soundId: '',
      action: 'STOP_ALL'
    });
    console.log(`🔇 All Audio Stopped`);
  }

  public updateAudioConfig(volume: number, isMuted: boolean): void {
    this.state.audioConfig = {
      volume: Math.max(0, Math.min(1, volume)),
      isMuted
    };
    console.log(`🔊 Audio Config Updated: Volume=${volume}, Muted=${isMuted}`);
  }

  public setExternalMedia(media: any): void {
    this.state.activeExternalMedia = media;
    console.log(`🎬 External Media state updated:`, media ? media.name || media.url : 'Cleared');
  }

  /**
   * Initializes a new match using nạp đề data
   */
  public initGame(matchCode: string, matchQuestions: MatchDbModel): MatchState {
    this.stopTimer();
    const currentPlayers = this.state.players; // Retain players if reconnecting or changing matches
    
    this.state = this.getInitialState();
    this.state.matchCode = matchCode;
    this.state.tournamentName = matchQuestions?.matchName || this.state.tournamentName || 'Đường Lên Đỉnh Olympia';
    this.state.players = currentPlayers;
    this.state.loadedAt = Date.now();
    this.matchQuestions = matchQuestions;

    const soHN = matchQuestions?.vuot_chuong_ngai_vat?.so_hang_ngang === 8 || matchQuestions?.vuot_chuong_ngai_vat?.hang_ngang?.length === 8 ? 8 : 4;
    this.state.vcnv.soHangNgang = soHN;
    this.state.vcnv.scoringMode = 'TRADITIONAL';
    this.state.vcnv.redCells = {};
    this.state.vcnv.rows = {};
    const rowCount = soHN === 8 ? 8 : 5;
    for (let i = 1; i <= rowCount; i++) {
      this.state.vcnv.rows[i] = { id: i, isOpen: false, isAnswered: false, playerAnswers: {}, showAnswers: false };
    }
    
    if (matchQuestions?.jeopardy?.categories?.length) {
      this.state.jeopardy.boardSize = matchQuestions.jeopardy.boardSize || '5x4';
      const maxCats = this.state.jeopardy.boardSize === '6x5' ? 6 : 5;
      const maxClues = this.state.jeopardy.boardSize === '6x5' ? 5 : 4;
      this.state.jeopardy.categories = matchQuestions.jeopardy.categories.slice(0, maxCats).map((cat, cIdx) => ({
        title: cat.title,
        clues: (cat.clues || []).slice(0, maxClues).map((clue, kIdx) => ({
          id: `c${cIdx}_q${kIdx}`,
          categoryIndex: cIdx,
          clueIndex: kIdx,
          points: clue.points !== undefined && clue.points !== null && !isNaN(Number(clue.points)) ? Number(clue.points) : (kIdx + 1) * 10,
          question: clue.question || '',
          dap_an_dung: clue.dap_an_dung || '',
          media: clue.media,
          isAnswered: (clue as any).isAnswered || false,
          answeredByPlayer: (clue as any).answeredByPlayer || null
        }))
      }));
    } else {
      this.state.jeopardy.categories = createDefaultJeopardyCategories(this.state.jeopardy.boardSize || '5x4');
    }

    if (matchQuestions?.chinh_phuc?.gmdt?.[0]) {
      const gmdtQ = matchQuestions.chinh_phuc.gmdt[0];
      this.state.chinh_phuc.gmdt.matMa = gmdtQ.mat_ma;
      this.state.chinh_phuc.gmdt.goiY = gmdtQ.goi_y;
      this.state.chinh_phuc.gmdt.dapAnDung = gmdtQ.dap_an_dung;
      const len = gmdtQ.mat_ma.length;
      this.state.chinh_phuc.gmdt.playerProgress = {
        1: { inputChars: Array(len).fill(''), isCorrect: null, timeTakenMs: null, submittedAt: null },
        2: { inputChars: Array(len).fill(''), isCorrect: null, timeTakenMs: null, submittedAt: null },
        3: { inputChars: Array(len).fill(''), isCorrect: null, timeTakenMs: null, submittedAt: null },
        4: { inputChars: Array(len).fill(''), isCorrect: null, timeTakenMs: null, submittedAt: null },
      };
    }

    console.log(`🎮 Game initialized for Match: ${matchCode} (VCNV Rows: ${soHN})`);
    return this.state;
  }

  public getMatchState(): MatchState {
    return this.state;
  }

  public getMatchQuestions(): MatchDbModel | null {
    return this.matchQuestions;
  }

  // --- MEDIA CONTROLS ---

  public playMedia(): void {
    this.state.mediaControl.key = Date.now();
    this.state.mediaControl.isPlaying = true;
  }

  public pauseMedia(): void {
    this.state.mediaControl.isPlaying = false;
  }

  public replayMedia(): void {
    this.state.mediaControl.key = Date.now();
    this.state.mediaControl.isPlaying = true;
  }

  // --- PLAYER MANAGEMENT ---

  public setTournamentName(name: string): MatchState {
    this.state.tournamentName = (name || '').trim() || 'Đường Lên Đỉnh Olympia';
    return this.state;
  }

  public addPlayer(name: string, position: 1 | 2 | 3 | 4, socketId: string): { success: boolean; error?: string } {
    const existingPlayer = this.state.players[position];
    if (existingPlayer && existingPlayer.socketId && existingPlayer.socketId !== socketId) {
      return { success: false, error: `Vị trí ${position} đã có thí sinh tham gia!` };
    }

    // Check if player name is already used elsewhere
    for (const pos in this.state.players) {
      const p = this.state.players[pos as unknown as 1 | 2 | 3 | 4];
      if (p.name.toLowerCase() === name.toLowerCase() && Number(pos) !== position) {
        return { success: false, error: `Tên "${name}" đã được sử dụng bởi thí sinh ở vị trí ${pos}!` };
      }
    }

    this.state.players[position] = {
      socketId,
      name,
      position,
      score: existingPlayer ? existingPlayer.score : 0,
      isReady: true
    };

    console.log(`👤 Player joined: ${name} at position ${position} (Socket: ${socketId})`);
    return { success: true };
  }

  public kickPlayer(position: 1 | 2 | 3 | 4): void {
    if (this.state.players[position]) {
      console.log(`👢 Kicked player from position ${position}`);
      this.state.players[position] = {
        socketId: null,
        name: '',
        position,
        score: 0,
        isReady: false
      };
    }
  }

  public addLog(entry: {
    round?: GameRound;
    player?: number;
    playerName?: string;
    type: 'SCORE' | 'BUZZER' | 'ANSWER' | 'ROUND' | 'QUESTION' | 'SYSTEM';
    action: string;
    detail: string;
    scoreBefore?: number;
    scoreAfter?: number;
    scoreDelta?: number;
  }): void {
    if (!this.state.logs) {
      this.state.logs = [];
    }
    const currentRound = entry.round || this.state.currentRound || 'WAITING';
    const playerNum = entry.player;
    const playerName = entry.playerName || (playerNum && this.state.players[playerNum as 1|2|3|4] ? this.state.players[playerNum as 1|2|3|4].name : undefined);

    const logItem: GameLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      round: currentRound,
      player: playerNum,
      playerName,
      type: entry.type,
      action: entry.action,
      detail: entry.detail,
      scoreBefore: entry.scoreBefore,
      scoreAfter: entry.scoreAfter,
      scoreDelta: entry.scoreDelta
    };

    this.state.logs.unshift(logItem);
    if (this.state.logs.length > 1000) {
      this.state.logs.pop();
    }
  }

  public clearLogs(): void {
    this.state.logs = [];
    if (this.onStateChange) this.onStateChange();
  }

  public updateRoundSettings(settings: Record<string, RoundCustomSetting>): void {
    this.state.roundCustomSettings = {
      ...(this.state.roundCustomSettings || {}),
      ...settings
    };
    this.addLog({
      type: 'SYSTEM',
      action: 'Cập nhật tên & logo vòng thi',
      detail: 'Đã lưu cấu hình tùy chỉnh tên và logo các vòng thi.'
    });
    if (this.onStateChange) this.onStateChange();
  }

  public updatePlayerScore(position: 1 | 2 | 3 | 4, newScore: number): void {
    if (this.state.players[position]) {
      const oldScore = this.state.players[position].score;
      const delta = newScore - oldScore;
      console.log(`✏️ Admin manually updated score for position ${position} to ${newScore}`);
      this.state.players[position].score = newScore;
      this.addLog({
        player: position,
        type: 'SCORE',
        action: `Cập nhật điểm (${delta >= 0 ? '+' : ''}${delta}đ)`,
        detail: `Điều chỉnh điểm thí sinh ${this.state.players[position].name || 'Bàn ' + position}: ${oldScore}đ → ${newScore}đ`,
        scoreBefore: oldScore,
        scoreAfter: newScore,
        scoreDelta: delta
      });
      if (this.state.currentRound === 'DAU_TRI') {
        this.checkDauTriScoreLimit();
      }
    }
  }

  public handleDisconnect(socketId: string): number | null {
    for (const pos in this.state.players) {
      const p = this.state.players[pos as unknown as 1 | 2 | 3 | 4];
      if (p.socketId === socketId) {
        console.log(`🔌 Player disconnected: ${p.name} from position ${pos}`);
        p.socketId = null;
        p.isReady = false;
        return p.position;
      }
    }
    return null;
  }

  public changeRound(round: GameRound): MatchState {
    this.stopTimer();
    this.stopAllSounds();
    this.state.currentRound = round;
    this.addLog({
      round,
      type: 'ROUND',
      action: 'Chuyển vòng thi',
      detail: `Chuyển sang vòng thi: ${round}`
    });
    
    // Reset global buzzer states
    this.state.buzzerState = 'LOCKED';
    this.state.buzzedPlayer = null;
    this.state.buzzedTimestamp = null;

    if (round === 'KHOI_DONG') {
      this.state.khoi_dong.subRound = null;
      this.state.khoi_dong.isConfirmed = false;
      this.state.khoi_dong.currentPlayerIndex = null;
      this.state.khoi_dong.currentQuestionIndex = 0;
      this.state.khoi_dong.isStarted = false;
    }

    if (round === 'VCNV') {
      this.state.vcnv.showRows = false;
    }

    if (round === 'VE_DICH') {
      this.state.ve_dich.currentPlayerIndex = null;
    }

    if (round === 'JEOPARDY') {
      this.playSound('Jeopardy_Start');
    }

    if (round === 'CHINH_PHUC') {
      this.playSound('Brainiest_Start');
    }

    if (round === 'DAU_TRI') {
      this.playSound('UC_Start');
    }

    console.log(`🔄 Round changed to: ${round}`);
    return this.state;
  }

  // --- TIMER MANAGEMENT ---

  private updateTangTocHintIndex(): void {
    if (this.state.currentRound === 'TANG_TOC' && this.state.tang_toc.mode === 'IMPROVED') {
      const elapsed = Math.max(0, this.timerTotalDuration - this.timerSecondsRemaining);
      const maxHintIndex = this.timerTotalDuration === 40 ? 3 : 2;
      const hintIdx = Math.min(Math.floor(elapsed / 10), maxHintIndex);
      this.state.tang_toc.currentHintIndex = hintIdx;
    }
  }

  public startTimer(
    seconds: number, 
    onTick: (sec: number) => void, 
    onComplete: () => void
  ): void {
    this.stopTimer();
    
    this.timerTotalDuration = seconds;
    this.timerSecondsRemaining = seconds;
    this.timerStartTime = Date.now();
    this.onTickCallback = onTick;
    this.onCompleteCallback = onComplete;
    
    this.state.timerSeconds = seconds;
    this.state.timerTotal = seconds;
    this.state.isTimerRunning = true;

    // Automatically open buzzer when countdown starts
    this.openBuzzer();
    if (this.state.tang_toc) {
      this.state.tang_toc.buzzerLocked = false;
    }

    this.updateTangTocHintIndex();

    // Tick immediately
    this.onTickCallback(this.timerSecondsRemaining);

    // High-resolution interval updates every 100ms for sub-second smooth progress bars
    this.timerInterval = setInterval(() => {
      const elapsedMs = Date.now() - this.timerStartTime;
      const remaining = Math.max(0, this.timerTotalDuration - (elapsedMs / 1000));
      
      this.timerSecondsRemaining = parseFloat(remaining.toFixed(2));
      this.state.timerSeconds = this.timerSecondsRemaining;
      this.updateTangTocHintIndex();

      if (remaining <= 0) {
        this.stopTimer();
        this.state.timerSeconds = 0;
        if (this.onCompleteCallback) this.onCompleteCallback();
        if (this.onStateChange) this.onStateChange();
      } else {
        if (this.onTickCallback) this.onTickCallback(this.state.timerSeconds);
        if (this.onStateChange) this.onStateChange();
      }
    }, 100);
  }

  public pauseTimer(): void {
    if (this.timerInterval && this.state.isTimerRunning) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
      this.state.isTimerRunning = false;
      
      const elapsed = (Date.now() - this.timerStartTime) / 1000;
      this.timerSecondsRemaining = Math.max(0, this.timerTotalDuration - elapsed);
      this.state.timerSeconds = parseFloat(this.timerSecondsRemaining.toFixed(2));
      
      console.log(`⏸️ Timer paused at ${this.state.timerSeconds}s`);
    }
  }

  public resumeTimer(): void {
    if (!this.state.isTimerRunning && this.timerSecondsRemaining > 0 && this.onTickCallback && this.onCompleteCallback) {
      const remaining = this.timerSecondsRemaining;
      const initialTotal = this.timerTotalDuration || remaining;

      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }

      this.timerTotalDuration = initialTotal;
      this.timerSecondsRemaining = remaining;
      this.timerStartTime = Date.now() - ((initialTotal - remaining) * 1000);

      this.state.timerSeconds = remaining;
      this.state.timerTotal = initialTotal;
      this.state.isTimerRunning = true;

      this.openBuzzer();
      if (this.state.tang_toc) {
        this.state.tang_toc.buzzerLocked = false;
      }

      this.updateTangTocHintIndex();

      if (this.onTickCallback) this.onTickCallback(this.state.timerSeconds);

      this.timerInterval = setInterval(() => {
        const elapsedMs = Date.now() - this.timerStartTime;
        const rem = Math.max(0, this.timerTotalDuration - (elapsedMs / 1000));

        this.timerSecondsRemaining = parseFloat(rem.toFixed(2));
        this.state.timerSeconds = this.timerSecondsRemaining;
        this.updateTangTocHintIndex();

        if (rem <= 0) {
          this.stopTimer();
          this.state.timerSeconds = 0;
          if (this.onCompleteCallback) this.onCompleteCallback();
          if (this.onStateChange) this.onStateChange();
        } else {
          if (this.onTickCallback) this.onTickCallback(this.state.timerSeconds);
          if (this.onStateChange) this.onStateChange();
        }
      }, 100);

      console.log(`▶️ Timer resumed from ${remaining}s (Total duration: ${initialTotal}s)`);
    }
  }

  public stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.state.isTimerRunning = false;
  }

  public resetTimer(): void {
    this.stopTimer();
    this.state.timerSeconds = 0;
    this.state.timerTotal = 0;
    this.timerSecondsRemaining = 0;
    this.timerTotalDuration = 0;
    if (this.state.tang_toc) {
      this.state.tang_toc.currentHintIndex = 0;
      this.state.tang_toc.buzzedHintIndex = null;
      this.state.tang_toc.buzzedPlayer = null;
    }
  }

  // --- BUZZER RACE CONDITION PROTECTION (CRITICAL) ---

  /**
   * General Buzzer Press (Vòng Khởi động chung, Về đích cướp chuông, Câu hỏi phụ, vv.)
   * This synchronous operation prevents race conditions on millisecond scales.
   */
  public pressBuzzer(position: 1 | 2 | 3 | 4): { success: boolean; error?: string } {
    // Jeopardy round special handling for fouls & stages
    if (this.state.currentRound === 'JEOPARDY' && this.state.jeopardy) {
      const jp = this.state.jeopardy;
      if (this.state.buzzerState === 'BUZZED' || jp.buzzedPlayer || jp.clueStage === 'FINISHED') {
        return { success: false };
      }

      if (jp.incorrectPlayersForClue?.includes(position)) {
        return { success: false };
      }

      if (jp.clueStage === 'READING') {
        if (jp.buzzerRuleMode === 'PENALTY_025') {
          if (!jp.foulPlayersForClue.includes(position)) {
            jp.foulPlayersForClue.push(position);
          }
        }
        return { success: false };
      }

      if (jp.clueStage === 'OPEN') {
        if (jp.buzzerRuleMode === 'PENALTY_025') {
          const unlockTime = jp.foulUnlockTime?.[position] || 0;
          if (unlockTime > Date.now()) {
            // Pressed before unlock -> extend 0.25s lock penalty from now
            jp.foulUnlockTime[position] = Date.now() + 250;
            return { success: false };
          }
        }
      } else {
        return { success: false };
      }
    }

    // 1. Check for general Buzzer State
    if (this.state.buzzerState !== 'OPEN') {
      return { success: false, error: 'Chuông hiện tại đang KHÓA!' };
    }

    // 2. Extra validations based on Round
    if (this.state.currentRound === 'KHOI_DONG' && this.state.khoi_dong.subRound === 'COLLECTIVE') {
      const kd = this.state.khoi_dong;
      if (kd.disqualifiedPlayers?.includes(position)) {
        return { success: false, error: 'Bạn đã bị loại khỏi lượt thi Khởi Động chung này!' };
      }
      if (kd.blockedThisQuestionPlayers?.includes(position) || kd.blockedNextQuestionPlayers?.includes(position)) {
        return { success: false, error: 'Bạn bị mất lượt ở câu hỏi này do trả lời sai câu trước đó!' };
      }
    }

    if (this.state.currentRound === 'CH_PHU') {
      if (this.state.cau_hoi_phu.ruleMode === 'SHOOTOUT') {
        return { success: false, error: 'Luật thi Luân lưu không sử dụng chuông giành quyền!' };
      }
      // Check if player has fouls or previous incorrect answers
      if (this.state.cau_hoi_phu.foulPlayers.includes(position)) {
        return { success: false, error: 'Bạn bị phạm quy vì nhấn chuông trước giờ!' };
      }
      if (this.state.cau_hoi_phu.incorrectPlayers.includes(position)) {
        return { success: false, error: 'Bạn đã trả lời sai câu hỏi này trước đó!' };
      }
    }

    if (this.state.currentRound === 'TANG_TOC' && this.state.tang_toc.mode === 'IMPROVED') {
      if (this.state.tang_toc.blockedPlayers?.includes(position)) {
        return { success: false, error: 'Bạn đã bị mất lượt ở câu hỏi này do trả lời sai trước đó!' };
      }
      const currentHint = this.state.tang_toc.currentHintIndex ?? 0;
      this.state.tang_toc.buzzedHintIndex = currentHint;
      this.state.tang_toc.buzzedPlayer = position;
    }

    if (this.state.currentRound === 'VE_DICH') {
      const activePlayerIdx = this.state.ve_dich.currentPlayerIndex;
      if (activePlayerIdx === null) {
        return { success: false, error: 'Không có lượt chơi Về đích nào đang hoạt động!' };
      }
      const activePosition = (activePlayerIdx + 1) as 1 | 2 | 3 | 4;
      if (position === activePosition) {
        return { success: false, error: 'Người chơi chính không thể giành chuông của chính mình!' };
      }
      
      const turn = this.state.ve_dich.turns[activePosition];
      if (turn.claimBuzzerState !== 'OPEN') {
        return { success: false, error: 'Lượt giành quyền chưa mở hoặc đã kết thúc!' };
      }

      // Lock Ve dich Claim Buzzer
      turn.claimBuzzerState = 'BUZZED';
      turn.claimBuzzerPlayer = position;
      turn.claimBuzzedTimestamp = Date.now();
    }

    // LOCK IMMEDIATELY
    this.state.buzzerState = 'BUZZED';
    this.state.buzzedPlayer = position;
    this.state.buzzedTimestamp = Date.now();

    this.playSound('General_Buzz');

    this.addLog({
      round: this.state.currentRound,
      player: position,
      type: 'BUZZER',
      action: 'Nhấn chuông giành quyền',
      detail: `Thí sinh bấm chuông giành quyền trả lời ở vòng ${this.state.currentRound}`
    });

    if (this.state.currentRound === 'CH_PHU') {
      this.state.cau_hoi_phu.buzzedPlayer = position;
      if (this.state.cau_hoi_phu.ruleMode === 'SHOOTOUT') {
        this.pauseSound('Additional_10Seconds');
      } else {
        this.pauseSound('Additional_15Seconds');
      }
    }

    if (this.state.currentRound === 'TANG_TOC') {
      this.pauseSound('Acceleration_10Seconds');
      this.pauseSound('Acceleration_20Seconds');
      this.pauseSound('Acceleration_30Seconds');
      this.pauseSound('Acceleration_40Seconds');
    }

    if (this.state.currentRound === 'JEOPARDY' && this.state.jeopardy) {
      this.state.jeopardy.buzzedPlayer = position;
      // Reset 5s timer for player answer
      this.jeopardyStart5sTimer();
    }

    // Pause the active game timer when buzzed (EXCEPT for O22 collective round where timer runs continuously, and Jeopardy which has its own 5s answer timer)
    const isO22Collective = this.state.currentRound === 'KHOI_DONG' && 
                            this.state.khoi_dong?.subRound === 'COLLECTIVE' && 
                            this.state.khoi_dong?.collectiveRule === 'O22';
    if (!isO22Collective && this.state.currentRound !== 'JEOPARDY') {
      this.pauseTimer();
    }

    console.log(`🔔 BUZZED WINNER: Position ${position} at timestamp ${this.state.buzzedTimestamp}`);
    return { success: true };
  }

  /**
   * Unlock general buzzer
   */
  public openBuzzer(): void {
    this.state.buzzerState = 'OPEN';
    this.state.buzzedPlayer = null;
    this.state.buzzedTimestamp = null;
    console.log('🔓 General buzzer opened');
  }

  /**
   * Lock general buzzer
   */
  public lockBuzzer(): void {
    this.state.buzzerState = 'LOCKED';
    console.log('🔒 General buzzer locked');
  }

  // --- 3.1 VÒNG KHỞI ĐỘNG ---

  public updateKhoiDongScore(
    position: 1 | 2 | 3 | 4,
    action: 'CORRECT' | 'INCORRECT' | 'SKIP'
  ): { pointsAdded: number; isBlockedNext?: boolean; isDisqualified?: boolean } {
    const player = this.state.players[position];
    if (!player) return { pointsAdded: 0 };

    const kd = this.state.khoi_dong;
    if (!kd.wrongCounts) kd.wrongCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    if (!kd.blockedThisQuestionPlayers) kd.blockedThisQuestionPlayers = [];
    if (!kd.blockedNextQuestionPlayers) kd.blockedNextQuestionPlayers = [];
    if (!kd.disqualifiedPlayers) kd.disqualifiedPlayers = [];
    if (!kd.playerStats) {
      kd.playerStats = {
        1: { correct: 0, wrong: 0, skip: 0, total: 0 },
        2: { correct: 0, wrong: 0, skip: 0, total: 0 },
        3: { correct: 0, wrong: 0, skip: 0, total: 0 },
        4: { correct: 0, wrong: 0, skip: 0, total: 0 }
      };
    }
    if (!kd.playerStats[position]) {
      kd.playerStats[position] = { correct: 0, wrong: 0, skip: 0, total: 0 };
    }
    const pStats = kd.playerStats[position];
    pStats.total += 1;
    if (action === 'CORRECT') pStats.correct += 1;
    else if (action === 'INCORRECT') pStats.wrong += 1;
    else if (action === 'SKIP') pStats.skip += 1;

    const subRound = kd.subRound;
    let pointsAdded = 0;

    if (subRound === 'INDIVIDUAL') {
      const scoringMode = kd.individualScoringMode || 'TRADITIONAL';

      if (action === 'CORRECT') {
        pointsAdded = 10;
        player.score += 10;
        this.addLog({
          round: 'KHOI_DONG',
          player: position,
          type: 'SCORE',
          action: 'Đúng Khởi Động Cá Nhân',
          detail: 'Thí sinh trả lời đúng câu hỏi khởi động cá nhân, +10 điểm',
          scoreDelta: 10,
          scoreAfter: player.score
        });
        console.log(`🎯 Player ${player.name} scored +10 (Individual). Score: ${player.score}`);
      } else if (action === 'INCORRECT' || action === 'SKIP') {
        kd.wrongCounts[position] = (kd.wrongCounts[position] || 0) + 1;
        const count = kd.wrongCounts[position];

        if (scoringMode === 'ADVANCED_1') {
          if (action === 'INCORRECT') {
            pointsAdded = -5;
            player.score = Math.max(0, player.score - 5);
            console.log(`❌ Player ${player.name} wrong (Individual Adv 1), -5. Score: ${player.score}`);
          } else {
            console.log(`⏩ Player ${player.name} skipped (Individual Adv 1), 0. Score: ${player.score}`);
          }
        } else if (scoringMode === 'ADVANCED_2') {
          // First 3 wrong/skips free, 4th onwards -5 pts
          if (count >= 4) {
            pointsAdded = -5;
            player.score = Math.max(0, player.score - 5);
            console.log(`❌ Player ${player.name} wrong/skip #${count} (Individual Adv 2), -5. Score: ${player.score}`);
          } else {
            console.log(`⚠️ Player ${player.name} wrong/skip #${count} (Individual Adv 2), 0 (Free <=3). Score: ${player.score}`);
          }
        } else {
          // TRADITIONAL
          console.log(`❌ Player ${player.name} wrong/skip (Individual Traditional), 0. Score: ${player.score}`);
        }

        this.addLog({
          round: 'KHOI_DONG',
          player: position,
          type: pointsAdded !== 0 ? 'SCORE' : 'ANSWER',
          action: action === 'SKIP' ? 'Bỏ qua câu Khởi Động' : 'Sai câu Khởi Động Cá Nhân',
          detail: `Thí sinh ${action === 'SKIP' ? 'bỏ qua' : 'trả lời sai'}${pointsAdded !== 0 ? `, bị trừ ${Math.abs(pointsAdded)} điểm` : ''}`,
          scoreDelta: pointsAdded !== 0 ? pointsAdded : undefined,
          scoreAfter: player.score
        });
      }
      return { pointsAdded };
    } else {
      // COLLECTIVE
      const scoringMode = kd.collectiveScoringMode || 'TRADITIONAL';

      if (action === 'CORRECT') {
        pointsAdded = 10;
        player.score += 10;
        this.addLog({
          round: 'KHOI_DONG',
          player: position,
          type: 'SCORE',
          action: 'Đúng Khởi Động Chung',
          detail: 'Thí sinh trả lời đúng câu hỏi khởi động chung, +10 điểm',
          scoreDelta: 10,
          scoreAfter: player.score
        });
        console.log(`🎯 Player ${player.name} scored +10 (Collective). Score: ${player.score}`);
        return { pointsAdded };
      } else if (action === 'INCORRECT' || action === 'SKIP') {
        kd.wrongCounts[position] = (kd.wrongCounts[position] || 0) + 1;
        const count = kd.wrongCounts[position];

        let isBlockedNext = false;
        let isDisqualified = false;

        if (scoringMode === 'TRADITIONAL') {
          pointsAdded = -5;
          player.score = Math.max(0, player.score - 5);
          console.log(`❌ Player ${player.name} wrong (Collective Traditional), -5. Score: ${player.score}`);
        } else if (scoringMode === 'ADVANCED_1') {
          // Correct +10, Wrong lose turn on next Q, 0 deduction
          isBlockedNext = true;
          if (!kd.blockedNextQuestionPlayers.includes(position)) {
            kd.blockedNextQuestionPlayers.push(position);
          }
          console.log(`❌ Player ${player.name} wrong (Collective Adv 1), lost turn on next Q, 0. Score: ${player.score}`);
        } else if (scoringMode === 'ADVANCED_2') {
          // Progressive: 1st 0, 2nd -5, 3rd -10, 4th -15...
          if (count >= 2) {
            const deduction = (count - 1) * 5;
            pointsAdded = -deduction;
            player.score = Math.max(0, player.score - deduction);
            console.log(`❌ Player ${player.name} wrong #${count} (Collective Adv 2), -${deduction}. Score: ${player.score}`);
          } else {
            console.log(`❌ Player ${player.name} wrong #${count} (Collective Adv 2), 0 (First free). Score: ${player.score}`);
          }
        } else if (scoringMode === 'ADVANCED_3') {
          // Lose turn on next Q. Reaching N times -> Disqualified from turn.
          isBlockedNext = true;
          if (!kd.blockedNextQuestionPlayers.includes(position)) {
            kd.blockedNextQuestionPlayers.push(position);
          }
          const threshold = kd.disqualifyThreshold || 3;
          if (count >= threshold) {
            isDisqualified = true;
            if (!kd.disqualifiedPlayers.includes(position)) {
              kd.disqualifiedPlayers.push(position);
            }
            console.log(`🚫 Player ${player.name} wrong #${count} >= ${threshold} (Collective Adv 3) -> DISQUALIFIED from collective turn!`);
          } else {
            console.log(`❌ Player ${player.name} wrong #${count} (Collective Adv 3), lost turn on next Q, 0. Score: ${player.score}`);
          }
        } else if (scoringMode === 'ADVANCED_4') {
          // Combination 2 & 3: Lose turn on next Q + Progressive deduction + Disqualified at N times
          isBlockedNext = true;
          if (!kd.blockedNextQuestionPlayers.includes(position)) {
            kd.blockedNextQuestionPlayers.push(position);
          }
          if (count >= 2) {
            const deduction = (count - 1) * 5;
            pointsAdded = -deduction;
            player.score = Math.max(0, player.score - deduction);
            console.log(`❌ Player ${player.name} wrong #${count} (Collective Adv 4), -${deduction}. Score: ${player.score}`);
          } else {
            console.log(`❌ Player ${player.name} wrong #${count} (Collective Adv 4), 0 (First free). Score: ${player.score}`);
          }
          const threshold = kd.disqualifyThreshold || 3;
          if (count >= threshold) {
            isDisqualified = true;
            if (!kd.disqualifiedPlayers.includes(position)) {
              kd.disqualifiedPlayers.push(position);
            }
            console.log(`🚫 Player ${player.name} wrong #${count} >= ${threshold} (Collective Adv 4) -> DISQUALIFIED from collective turn!`);
          }
        }

        this.addLog({
          round: 'KHOI_DONG',
          player: position,
          type: pointsAdded !== 0 ? 'SCORE' : 'ANSWER',
          action: 'Sai Khởi Động Chung',
          detail: `Thí sinh trả lời sai câu hỏi chung${pointsAdded !== 0 ? `, bị trừ ${Math.abs(pointsAdded)} điểm` : ''}${isDisqualified ? ' (Bị tước quyền thi đấu)' : ''}`,
          scoreDelta: pointsAdded !== 0 ? pointsAdded : undefined,
          scoreAfter: player.score
        });

        return { pointsAdded, isBlockedNext, isDisqualified };
      }
      return { pointsAdded: 0 };
    }
  }

  public resetKhoiDongTurn(): void {
    this.stopTimer();
    this.lockBuzzer();
    const kd = this.state.khoi_dong;
    kd.isStarted = false;
    kd.isPrepRunning = false;
    kd.prepCountdown = 0;
    kd.countAnswered = 0;
    kd.wrongCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    kd.blockedThisQuestionPlayers = [];
    kd.blockedNextQuestionPlayers = [];
    kd.disqualifiedPlayers = [];
    kd.timerType = null;
    kd.playerStats = {
      1: { correct: 0, wrong: 0, skip: 0, total: 0 },
      2: { correct: 0, wrong: 0, skip: 0, total: 0 },
      3: { correct: 0, wrong: 0, skip: 0, total: 0 },
      4: { correct: 0, wrong: 0, skip: 0, total: 0 }
    };
    this.state.buzzerState = 'LOCKED';
    this.state.buzzedPlayer = null;
    this.state.buzzedTimestamp = null;
    console.log('🔄 Khoi Dong turn state has been completely reset.');
  }

  // --- 3.2 VÒNG VƯỢT CHƯỚNG NGẠI VẬT (VCNV) ---

  /**
   * Buzzer CNV is completely independent from general buzzer.
   * Locked only on specific conditions. Always open by default.
   */
  public pressBuzzerCNV(position: 1 | 2 | 3 | 4): { success: boolean; error?: string } {
    // Check if CNV already solved
    if (this.state.vcnv.cnvSolved) {
      return { success: false, error: 'Chướng ngại vật đã được giải!' };
    }
    // Check if player is already eliminated or blocked from CNV
    if (this.state.vcnv.cnvBuzzerLocked) {
      return { success: false, error: 'Chuông chướng ngại vật đang tạm khóa!' };
    }
    
    // Ensure initialized
    if (!this.state.vcnv.cnvBuzzedPlayers) {
      this.state.vcnv.cnvBuzzedPlayers = [];
    }
    if (!this.state.vcnv.cnvBlockedPlayers) {
      this.state.vcnv.cnvBlockedPlayers = [];
    }

    if (this.state.vcnv.cnvBlockedPlayers.includes(position)) {
      return { success: false, error: 'Bạn đã trả lời sai chướng ngại vật trước đó và bị loại!' };
    }

    if (this.state.vcnv.cnvBuzzedPlayers.some(p => p.position === position)) {
      return { success: false, error: 'Bạn đã bấm chuông chướng ngại vật rồi!' };
    }

    // Add to multiple buzzer queue
    this.state.vcnv.cnvBuzzedPlayers.push({
      position,
      timestamp: Date.now()
    });

    // Sort queue by timestamp ascending just in case
    this.state.vcnv.cnvBuzzedPlayers.sort((a, b) => a.timestamp - b.timestamp);

    // Keep legacy single buzzer pointer updated with the first candidate in queue
    this.state.vcnv.cnvBuzzedPlayer = this.state.vcnv.cnvBuzzedPlayers[0].position;
    this.state.vcnv.cnvBuzzedTimestamp = this.state.vcnv.cnvBuzzedPlayers[0].timestamp;

    this.playSound('Obstacle_Buzz');

    this.addLog({
      round: 'VCNV',
      player: position,
      type: 'BUZZER',
      action: 'Bấm chuông trả lời CNV',
      detail: `Thí sinh bấm chuông giành quyền trả lời Chướng ngại vật`
    });

    // Pause game timer
    this.pauseTimer();

    console.log(`🚨 CNV Buzzer pressed by position ${position}. Queue: ${JSON.stringify(this.state.vcnv.cnvBuzzedPlayers)}`);
    return { success: true };
  }

  public awardObstacle(position: 1 | 2 | 3 | 4, points: number): void {
    const player = this.state.players[position];
    if (!player) return;

    player.score += points;
    this.state.vcnv.cnvSolved = true;
    this.state.vcnv.cnvWinnerPosition = position;
    this.state.vcnv.cnvBuzzedPlayer = null;
    this.state.vcnv.cnvBuzzedTimestamp = null;
    this.state.vcnv.cnvBuzzedPlayers = [];
    this.state.vcnv.selectedRow = null; // Clear selected row so current question automatically hides on all views
    
    // Automatically open all horizontal rows and central segment / all grid pieces
    for (const key in this.state.vcnv.rows) {
      this.state.vcnv.rows[key].isOpen = true;
    }
    const totalSegments = this.state.vcnv.soHangNgang === 8 ? 8 : 5;
    this.state.vcnv.revealedSegments = Array.from({ length: totalSegments }, (_, i) => i + 1);

    this.addLog({
      round: 'VCNV',
      player: position,
      type: 'SCORE',
      action: 'Giải đúng Chướng Ngại Vật',
      detail: `Thí sinh trả lời đúng CNV, được cộng +${points} điểm`,
      scoreDelta: points,
      scoreAfter: player.score
    });

    console.log(`🏆 Obstacle solved by ${player.name}! Received +${points} points.`);
  }

  public toggleVcnvRedCell(rowId: number, charIndex: number): void {
    if (!this.state.vcnv.redCells) {
      this.state.vcnv.redCells = {};
    }
    if (!this.state.vcnv.redCells[rowId]) {
      this.state.vcnv.redCells[rowId] = [];
    }
    const list = this.state.vcnv.redCells[rowId];
    const idx = list.indexOf(charIndex);
    if (idx > -1) {
      list.splice(idx, 1);
    } else {
      list.push(charIndex);
    }
  }

  public setVcnvScoringMode(mode: 'TRADITIONAL' | 'IMPROVED'): void {
    this.state.vcnv.scoringMode = mode;
  }

  public setVcnvSoHangNgang(soHN: 4 | 8): void {
    const templateRowsCount = this.matchQuestions?.vuot_chuong_ngai_vat?.hang_ngang?.length || 0;
    const templateSoHN = this.matchQuestions?.vuot_chuong_ngai_vat?.so_hang_ngang;
    const isTemplate4HN = (templateSoHN === 4) || (templateRowsCount > 0 && templateRowsCount <= 4);

    if (soHN === 8 && isTemplate4HN) {
      console.warn("Cannot switch to 8 rows because template only provides 4 rows.");
      return;
    }

    this.state.vcnv.soHangNgang = soHN;
    this.state.vcnv.rows = {};
    const rowCount = soHN === 8 ? 8 : 5;
    for (let i = 1; i <= rowCount; i++) {
      this.state.vcnv.rows[i] = { id: i, isOpen: false, isAnswered: false, playerAnswers: {}, showAnswers: false };
    }
  }

  public penalizeObstacleSpecific(position: 1 | 2 | 3 | 4): void {
    if (!this.state.vcnv.cnvBlockedPlayers) {
      this.state.vcnv.cnvBlockedPlayers = [];
    }
    if (!this.state.vcnv.cnvBlockedPlayers.includes(position)) {
      this.state.vcnv.cnvBlockedPlayers.push(position);
    }

    // Remove from active buzzers queue
    if (this.state.vcnv.cnvBuzzedPlayers) {
      this.state.vcnv.cnvBuzzedPlayers = this.state.vcnv.cnvBuzzedPlayers.filter(p => p.position !== position);
    } else {
      this.state.vcnv.cnvBuzzedPlayers = [];
    }

    // Update legacy pointers
    if (this.state.vcnv.cnvBuzzedPlayers.length > 0) {
      this.state.vcnv.cnvBuzzedPlayer = this.state.vcnv.cnvBuzzedPlayers[0].position;
      this.state.vcnv.cnvBuzzedTimestamp = this.state.vcnv.cnvBuzzedPlayers[0].timestamp;
    } else {
      this.state.vcnv.cnvBuzzedPlayer = null;
      this.state.vcnv.cnvBuzzedTimestamp = null;
    }

    this.addLog({
      round: 'VCNV',
      player: position,
      type: 'ANSWER',
      action: 'Trả lời sai Chướng Ngại Vật',
      detail: `Thí sinh trả lời sai CNV và bị loại khỏi vòng VCNV`
    });

    console.log(`🚫 Obstacle answer incorrect for position ${position}. Blocked from CNV round.`);
  }

  public penalizeObstacle(): void {
    const penalizedPosition = this.state.vcnv.cnvBuzzedPlayer;
    if (penalizedPosition) {
      this.penalizeObstacleSpecific(penalizedPosition as 1 | 2 | 3 | 4);
    }
  }

  public submitRowAnswer(position: 1 | 2 | 3 | 4, answer: string): void {
    const rowId = this.state.vcnv.selectedRow;
    if (!rowId) return;

    const row = this.state.vcnv.rows[rowId];
    if (row) {
      row.playerAnswers[position] = answer.trim().toUpperCase();
      this.addLog({
        round: 'VCNV',
        player: position,
        type: 'ANSWER',
        action: `Gửi đáp án hàng ngang ${rowId}`,
        detail: `Đáp án: "${answer.trim().toUpperCase()}"`
      });
      console.log(`✏️ Row ${rowId} answer submitted by P${position}: ${answer}`);
    }
  }

  public gradeRowAnswers(correctPositions: (1 | 2 | 3 | 4)[]): void {
    const rowId = this.state.vcnv.selectedRow;
    if (!rowId) return;

    const row = this.state.vcnv.rows[rowId];
    if (row) {
      row.isAnswered = true;
      row.isCorrect = correctPositions.length > 0;
      
      // Award 10 points to correct players
      correctPositions.forEach(pos => {
        const player = this.state.players[pos];
        if (player) {
          player.score += 10;
          this.addLog({
            round: 'VCNV',
            player: pos,
            type: 'SCORE',
            action: `Đúng hàng ngang ${rowId}`,
            detail: `Được cộng +10 điểm hàng ngang ${rowId}`,
            scoreDelta: 10,
            scoreAfter: player.score
          });
          console.log(`⭐ P${pos} awarded 10 points for row ${rowId}`);
        }
      });
    }

    // Automatically hide current question when row is graded across all interfaces
    this.state.vcnv.selectedRow = null;
  }

  // --- 3.3 VÒNG TĂNG TỐC ---

  /**
   * Accel Answer submission with millisecond-precision server-generated timestamp.
   */
  public submitTangTocAnswer(position: 1 | 2 | 3 | 4, answer: string): void {
    if (!this.state.isTimerRunning) {
      console.warn(`⚠️ Answers submitted while timer is not running by P${position}`);
      return;
    }

    const absoluteTimestamp = Date.now();
    // Time elapsed from timer start (seconds, rounded to 2 decimals)
    const elapsedSeconds = (absoluteTimestamp - this.timerStartTime) / 1000;
    const formattedElapsed = parseFloat(elapsedSeconds.toFixed(2));

    const answers = this.state.tang_toc.answers;
    const existingIdx = answers.findIndex(a => a.playerPosition === position);

    const submission: TangTocAnswer = {
      playerPosition: position,
      answer: answer.trim().toUpperCase(),
      timestamp: formattedElapsed
    };

    if (existingIdx !== -1) {
      answers[existingIdx] = submission;
    } else {
      answers.push(submission);
    }

    this.addLog({
      round: 'TANG_TOC',
      player: position,
      type: 'ANSWER',
      action: `Gửi câu trả lời Tăng Tốc`,
      detail: `Đáp án: "${submission.answer}" lúc ${formattedElapsed}s`
    });

    console.log(`🚀 Tang Toc Answer: P${position} -> "${answer}" in ${formattedElapsed}s`);
  }

  /**
   * Sort answers strictly by timestamp ascending
   */
  public getSortedTangTocAnswers(): TangTocAnswer[] {
    return [...this.state.tang_toc.answers].sort((a, b) => a.timestamp - b.timestamp);
  }

  public gradeTangToc(correctPositionsInOrder: (1 | 2 | 3 | 4)[]): void {
    // Scoring order: 40, 30, 20, 10
    const pointsScale = [40, 30, 20, 10];
    let awardIdx = 0;

    correctPositionsInOrder.forEach(pos => {
      if (awardIdx < pointsScale.length) {
        const player = this.state.players[pos];
        if (player) {
          const scoreToAdd = pointsScale[awardIdx];
          player.score += scoreToAdd;
          this.addLog({
            round: 'TANG_TOC',
            player: pos,
            type: 'SCORE',
            action: 'Đúng câu hỏi Tăng Tốc',
            detail: `Xếp thứ ${awardIdx + 1}, được cộng +${scoreToAdd} điểm`,
            scoreDelta: scoreToAdd,
            scoreAfter: player.score
          });
          console.log(`🔥 Tang toc P${pos} gets +${scoreToAdd} points.`);
          awardIdx++;
        }
      }
    });
  }

  // --- 3.4 VÒNG VỀ ĐÍCH ---

  public selectVeDichPlayer(position: 1 | 2 | 3 | 4): void {
    // Current player position in turns is 1-4, index is 0-3
    this.state.ve_dich.currentPlayerIndex = position - 1;
    const turn = this.state.ve_dich.turns[position];
    if (turn) {
      turn.showPackageBoard = false;
      turn.packageConfirmed = false;
      const count = this.state.ve_dich.o20PackageQuestionCount || 3;
      turn.draftPackage = Array(count).fill(null);
      turn.currentQuestionConfirmed = false;
      turn.starPenalized = false;
    }
    console.log(`🎯 Active Ve Dich Player set to: position ${position}`);
  }

  public showVeDichPackageBoard(position: 1 | 2 | 3 | 4, show = true): void {
    const turn = this.state.ve_dich.turns[position];
    if (turn) {
      turn.showPackageBoard = show;
      console.log(`📦 Ve Dich Package Board shown for P${position}: ${show}`);
    }
  }

  public setVeDichRuleMode(ruleMode: 'O20_PLUS' | 'O19'): void {
    this.state.ve_dich.ruleMode = ruleMode;
    console.log(`⚙️ Ve Dich rule mode set to: ${ruleMode}`);
  }

  public setVeDichPackageCount(count: number): void {
    const safeCount = Math.min(5, Math.max(2, count));
    this.state.ve_dich.o20PackageQuestionCount = safeCount;
    for (let pos = 1; pos <= 4; pos++) {
      const turn = this.state.ve_dich.turns[pos];
      if (turn && !turn.packageConfirmed) {
        turn.draftPackage = Array(safeCount).fill(null);
      }
    }
    console.log(`⚙️ Ve Dich O20+ package question count set to: ${safeCount}`);
  }

  public setVeDichPresetPackages(packages: VeDichPresetPackage[]): void {
    this.state.ve_dich.o19PresetPackages = packages;
    console.log(`⚙️ Ve Dich O19 preset packages updated (${packages.length} packages)`);
  }

  public setVeDichDraftPackage(position: 1 | 2 | 3 | 4, index: number, points: 10 | 20 | 30 | 40 | null): void {
    const turn = this.state.ve_dich.turns[position];
    if (turn) {
      const count = this.state.ve_dich.o20PackageQuestionCount || 3;
      if (!turn.draftPackage || turn.draftPackage.length !== count) {
        turn.draftPackage = Array(count).fill(null);
      }
      turn.draftPackage[index] = points;
      console.log(`📦 Draft package updated for P${position} at index ${index}: ${points}`);
    }
  }

  public setVeDichPackage(position: 1 | 2 | 3 | 4, packageChoices: (10 | 20 | 30 | 40)[]): void {
    const turn = this.state.ve_dich.turns[position];
    if (turn) {
      turn.chosenPackage = packageChoices.map((points) => ({
        points,
        questionId: '' // Left blank so admin chooses it from dropdown
      }));
      turn.packageConfirmed = true;
      turn.currentQuestionConfirmed = false;
      turn.starPenalized = false;
      console.log(`📦 Ve dich package confirmed for P${position}: ${packageChoices.join(', ')}`);
    }
  }

  public startVeDichPracticeTimer(type: 'MAIN' | 'CLAIM', onTick?: (sec: number) => void, onComplete?: () => void): void {
    const activeIdx = this.state.ve_dich.currentPlayerIndex;
    const activePos = activeIdx !== null ? ((activeIdx + 1) as 1 | 2 | 3 | 4) : 1;
    const turn = this.state.ve_dich.turns[activePos];
    const currentQ = turn?.chosenPackage?.[turn.currentQuestionIndex];
    const points = currentQ?.points || 20;

    let duration = 30;
    if (points === 10) {
      duration = type === 'MAIN' ? 30 : 20;
    } else if (points === 20) {
      duration = type === 'MAIN' ? 45 : 30;
    } else if (points === 30) {
      duration = type === 'MAIN' ? 60 : 45;
    } else if (points === 40) {
      duration = type === 'MAIN' ? 90 : 60;
    }

    let soundId = 'Finish_Practice30Seconds';
    if (duration === 20) soundId = 'Finish_Practice20Seconds';
    else if (duration === 30) soundId = 'Finish_Practice30Seconds';
    else if (duration === 45) soundId = 'Finish_Practice45Seconds';
    else if (duration === 60) soundId = 'Finish_Practice60Seconds';
    else if (duration === 90) soundId = 'Finish_Practice90Seconds';

    this.playSound(soundId);

    this.state.ve_dich.practiceTimer = {
      type,
      duration,
      startedAt: Date.now(),
      secondsLeft: duration,
      isRunning: true
    };

    this.startTimer(
      duration,
      (sec) => {
        if (this.state.ve_dich.practiceTimer) {
          this.state.ve_dich.practiceTimer.secondsLeft = sec;
        }
        if (onTick) onTick(sec);
      },
      () => {
        if (this.state.ve_dich.practiceTimer) {
          this.state.ve_dich.practiceTimer.isRunning = false;
        }
        if (onComplete) onComplete();
      }
    );
  }

  public stopVeDichPracticeTimer(): void {
    this.stopTimer();
    this.state.ve_dich.practiceTimer = null;
  }

  public toggleStar(position: 1 | 2 | 3 | 4, isUsed: boolean): void {
    const turn = this.state.ve_dich.turns[position];
    if (turn) {
      if (turn.currentQuestionConfirmed) {
        console.log(`🌟 Cannot toggle Star of Hope: Question is already shown/confirmed!`);
        return;
      }
      turn.starUsed = isUsed;
      console.log(`🌟 Star status for P${position}: ${isUsed}`);
    }
  }

  public confirmVeDichQuestion(position: 1 | 2 | 3 | 4, questionId: string): void {
    const turn = this.state.ve_dich.turns[position];
    if (turn) {
      const currentIdx = turn.currentQuestionIndex;
      if (turn.chosenPackage[currentIdx]) {
        turn.chosenPackage[currentIdx].questionId = questionId;
        turn.currentQuestionConfirmed = true;
        // Clean claim buzzer and main buzzer when a new question is confirmed
        turn.claimBuzzerState = 'LOCKED';
        turn.claimBuzzerPlayer = null;
        turn.claimBuzzedTimestamp = null;
        this.state.buzzerState = 'LOCKED';
        this.state.buzzedPlayer = null;
        this.state.buzzedTimestamp = null;
        console.log(`✅ Question confirmed for P${position}, Q${currentIdx + 1}: ${questionId}`);
      }
    }
  }

  public setVeDichQuestionIndex(position: 1 | 2 | 3 | 4, index: number): void {
    const turn = this.state.ve_dich.turns[position];
    const maxLen = turn?.chosenPackage?.length || 5;
    if (turn && index >= 0 && index < maxLen) {
      turn.currentQuestionIndex = index;
      turn.starUsed = false;
      turn.claimBuzzerState = 'LOCKED';
      turn.claimBuzzerPlayer = null;
      turn.claimBuzzedTimestamp = null;
      turn.currentQuestionConfirmed = false;
      turn.starPenalized = false;
      this.lockBuzzer();
      this.resetTimer();
      console.log(`🧭 Question index set to ${index} for P${position}`);
    }
  }

  public resetVeDichBuzzer(): void {
    this.state.buzzerState = 'LOCKED';
    this.state.buzzedPlayer = null;
    this.state.buzzedTimestamp = null;
    
    // Also sync current active turn claim state if there is any active turn
    const activePlayerIdx = this.state.ve_dich.currentPlayerIndex;
    if (activePlayerIdx !== null) {
      const activePosition = (activePlayerIdx + 1) as 1 | 2 | 3 | 4;
      const turn = this.state.ve_dich.turns[activePosition];
      if (turn) {
        turn.claimBuzzerState = 'LOCKED';
        turn.claimBuzzerPlayer = null;
        turn.claimBuzzedTimestamp = null;
      }
    }
    console.log(`🚨 Manual buzzer reset - locked buzzer for contestants by default`);
  }

  public endVeDichTurn(): void {
    this.state.ve_dich.currentPlayerIndex = null;
    this.lockBuzzer();
    console.log(`🚪 Ve Dich turn ended - reset to player selection`);
  }

  /**
   * Start 5-second buzz period for claiming when main player answers incorrectly
   */
  public startClaimBuzzerPeriod(activePlayerPosition: 1 | 2 | 3 | 4): void {
    const turn = this.state.ve_dich.turns[activePlayerPosition];
    const player = this.state.players[activePlayerPosition];
    if (turn && player) {
      turn.claimBuzzerState = 'OPEN';
      turn.claimBuzzerPlayer = null;
      turn.claimBuzzedTimestamp = null;
      
      // Also sync general buzzerState
      this.state.buzzerState = 'OPEN';
      this.state.buzzedPlayer = null;
      this.state.buzzedTimestamp = null;

      // Handle Golden Star (NSHV) point deduction upon claiming trigger
      if (turn.starUsed && !turn.starPenalized) {
        const currentQIndex = turn.currentQuestionIndex;
        const activeQuestionChoice = turn.chosenPackage?.[currentQIndex];
        const points = activeQuestionChoice ? activeQuestionChoice.points : 20;
        player.score = Math.max(0, player.score - points);
        turn.starPenalized = true;
        console.log(`❌ P${activePlayerPosition} (Main) WRONG with Star (Giành quyền triggered). -${points} points. Score: ${player.score}`);
      }
      
      console.log(`⏱️ 5-second claim buzzer opened for opponents of P${activePlayerPosition}`);
    }
  }

  public gradeVeDichMainPlayer(
    activePosition: 1 | 2 | 3 | 4, 
    isCorrect: boolean, 
    points: 10 | 20 | 30 | 40
  ): void {
    const player = this.state.players[activePosition];
    const turn = this.state.ve_dich.turns[activePosition];
    if (!player || !turn) return;

    const starMultiplier = turn.starUsed ? 2 : 1;

    if (isCorrect) {
      const added = points * starMultiplier;
      player.score += added;
      this.addLog({
        round: 'VE_DICH',
        player: activePosition,
        type: 'SCORE',
        action: 'Đúng câu hỏi Về Đích',
        detail: `Trả lời đúng câu ${points}đ ${turn.starUsed ? '(Ngôi Sao Hy Vọng x2)' : ''}, được cộng +${added} điểm`,
        scoreDelta: added,
        scoreAfter: player.score
      });
      console.log(`🎯 P${activePosition} (Main) CORRECT. +${added} points. Score: ${player.score}`);
    } else {
      if (turn.starUsed) {
        // Star used and incorrect: Lose the full points immediately
        player.score = Math.max(0, player.score - points);
        this.addLog({
          round: 'VE_DICH',
          player: activePosition,
          type: 'SCORE',
          action: 'Sai câu hỏi Về Đích (Có NSHV)',
          detail: `Đặt NSHV trả lời sai câu ${points}đ, bị trừ -${points} điểm`,
          scoreDelta: -points,
          scoreAfter: player.score
        });
        console.log(`❌ P${activePosition} (Main) WRONG with Star. -${points} points. Score: ${player.score}`);
      } else {
        this.addLog({
          round: 'VE_DICH',
          player: activePosition,
          type: 'ANSWER',
          action: 'Sai câu hỏi Về Đích',
          detail: `Trả lời không đúng câu hỏi ${points}đ (Chờ cướp điểm)`
        });
        console.log(`❌ P${activePosition} (Main) WRONG (No Star). Point change pending buzzer.`);
      }
    }
  }

  public gradeVeDichClaimer(
    activePosition: 1 | 2 | 3 | 4,
    claimPosition: 1 | 2 | 3 | 4,
    isCorrect: boolean,
    points: 10 | 20 | 30 | 40
  ): void {
    const mainPlayer = this.state.players[activePosition];
    const claimPlayer = this.state.players[claimPosition];
    const turn = this.state.ve_dich.turns[activePosition];
    
    if (!mainPlayer || !claimPlayer || !turn) return;

    if (isCorrect) {
      // Claimer correct: Claimer gets full points, Main Player gets deducted
      claimPlayer.score += points;
      
      // ONLY deduct from Main Player if they haven't been deducted (meaning they did not use Star)
      // Because if they did use Star, they already lost the points immediately upon failing.
      if (!turn.starUsed) {
        mainPlayer.score = Math.max(0, mainPlayer.score - points);
        this.addLog({
          round: 'VE_DICH',
          player: activePosition,
          type: 'SCORE',
          action: 'Bị cướp điểm Về Đích',
          detail: `Bị thí sinh khác cướp điểm câu ${points}đ, bị trừ -${points} điểm`,
          scoreDelta: -points,
          scoreAfter: mainPlayer.score
        });
      }

      this.addLog({
        round: 'VE_DICH',
        player: claimPosition,
        type: 'SCORE',
        action: 'Cướp điểm Về Đích thành công',
        detail: `Giành quyền và trả lời đúng câu ${points}đ, được cộng +${points} điểm`,
        scoreDelta: points,
        scoreAfter: claimPlayer.score
      });
      
      console.log(`👏 Claimer P${claimPosition} CORRECT. +${points} points. Main P${activePosition} -${points} points.`);
    } else {
      // Claimer incorrect: Claimer loses half of points. Main Player is unaffected.
      const penalty = Math.floor(points / 2);
      claimPlayer.score = Math.max(0, claimPlayer.score - penalty);

      this.addLog({
        round: 'VE_DICH',
        player: claimPosition,
        type: 'SCORE',
        action: 'Cướp điểm Về Đích sai',
        detail: `Giành quyền nhưng trả lời không đúng câu ${points}đ, bị trừ 50% (-${penalty} điểm)`,
        scoreDelta: -penalty,
        scoreAfter: claimPlayer.score
      });

      console.log(`👎 Claimer P${claimPosition} WRONG. Penalty -${penalty} points.`);
    }

    // Reset claim state
    turn.claimBuzzerState = 'LOCKED';
    turn.claimBuzzerPlayer = null;
    turn.claimBuzzedTimestamp = null;
  }

  // --- 3.5 VÒNG CÂU HỎI PHỤ ---

  public selectCHPhuPlayers(positions: number[]): void {
    this.state.cau_hoi_phu.selectedPlayers = positions;
  }

  public confirmCHPhuPlayers(positions: number[]): void {
    const sortedPos = positions.slice().sort();
    this.state.cau_hoi_phu.confirmedPlayers = sortedPos;
    this.state.cau_hoi_phu.selectedPlayers = sortedPos;
    
    // Reset round states
    this.state.cau_hoi_phu.foulPlayers = [];
    this.state.cau_hoi_phu.incorrectPlayers = [];
    this.state.cau_hoi_phu.buzzedPlayer = null;
    this.state.cau_hoi_phu.winnerPosition = null;
    this.state.cau_hoi_phu.winnerReason = null;
    this.state.cau_hoi_phu.currentQuestionIndex = 0;
    this.state.buzzerState = (this.state.cau_hoi_phu.ruleMode !== 'SHOOTOUT' && this.state.cau_hoi_phu.buzzerMode === 'CONTINUOUS') ? 'OPEN' : 'LOCKED';
    this.state.buzzedPlayer = null;
    this.state.buzzedTimestamp = null;

    // Reset scores & response times
    const initialScores: Record<number, number> = {};
    const initialTime: Record<number, number> = {};
    const initialCounts: Record<number, number> = {};
    const initialHistory: Record<number, boolean[]> = {};
    sortedPos.forEach(p => {
      initialScores[p] = 0;
      initialTime[p] = 0;
      initialCounts[p] = 0;
      initialHistory[p] = [];
    });
    this.state.cau_hoi_phu.scores = initialScores;
    this.state.cau_hoi_phu.totalTime = initialTime;
    this.state.cau_hoi_phu.playerQuestionCounts = initialCounts;
    this.state.cau_hoi_phu.history = initialHistory;

    // Max questions setup: 2 players -> 15, 3 players -> 20, 4 players -> 25
    const count = sortedPos.length;
    this.state.cau_hoi_phu.maxQuestions = count === 2 ? 15 : count === 3 ? 20 : 25;

    // Setup turn order for SHOOTOUT mode
    this.state.cau_hoi_phu.turnOrder = sortedPos.slice();
    this.state.cau_hoi_phu.activeContestants = sortedPos.slice();
    this.state.cau_hoi_phu.turnIndex = 0;
    this.state.cau_hoi_phu.currentTurnPlayer = sortedPos[0] || null;
    this.state.cau_hoi_phu.stage = 'INITIAL';
    this.state.cau_hoi_phu.suddenDeathRound = 6;
    
    // Play ambience loop for IMPROVED or SHOOTOUT modes
    const ruleMode = this.state.cau_hoi_phu.ruleMode || 'TRADITIONAL';
    if (ruleMode === 'IMPROVED' || ruleMode === 'SHOOTOUT') {
      this.playSound('General_Ambience');
    } else {
      this.stopSound('General_Ambience');
    }

    console.log(`✅ Confirmed CHP contestants: ${sortedPos.join(', ')} with ruleMode ${ruleMode}`);
  }

  public setCHPhuRuleMode(mode: 'TRADITIONAL' | 'IMPROVED' | 'SHOOTOUT'): void {
    this.state.cau_hoi_phu.ruleMode = mode;
    
    // Handle sound ambience logic
    if (mode === 'IMPROVED' || mode === 'SHOOTOUT') {
      if (this.state.cau_hoi_phu.confirmedPlayers && this.state.cau_hoi_phu.confirmedPlayers.length >= 2) {
        this.playSound('General_Ambience');
      }
    } else {
      this.stopSound('General_Ambience');
    }

    // Adjust buzzer state
    if (mode === 'SHOOTOUT') {
      this.state.buzzerState = 'LOCKED';
    } else if (this.state.cau_hoi_phu.buzzerMode === 'CONTINUOUS') {
      this.state.buzzerState = 'OPEN';
    }
    
    console.log(`⚙️ CHP Rule Mode set to: ${mode}`);
  }

  public revealCHPhuQuestion(reveal: boolean): void {
    this.state.cau_hoi_phu.questionRevealed = reveal;
    if (reveal) {
      this.playSound('Additional_QuestionShow');
    }
    console.log(`👀 CHP Question Reveal set to: ${reveal}`);
  }

  public setCHPhuBuzzerMode(mode: 'CONTINUOUS' | 'ON_TIMER'): void {
    this.state.cau_hoi_phu.buzzerMode = mode;
    
    if (this.state.cau_hoi_phu.ruleMode === 'SHOOTOUT') {
      this.state.buzzerState = 'LOCKED';
    } else if (mode === 'CONTINUOUS') {
      this.state.buzzerState = 'OPEN';
    } else {
      this.state.buzzerState = 'LOCKED';
    }
    console.log(`🔔 CHP Buzzer Mode set to: ${mode}`);
  }

  public recordFoulCHPhu(position: 1 | 2 | 3 | 4): void {
    if (!this.state.cau_hoi_phu.foulPlayers.includes(position)) {
      this.state.cau_hoi_phu.foulPlayers.push(position);
      console.log(`⚠️ P${position} committed a foul in Câu hỏi phụ (pressed early)!`);
    }
  }

  public submitIncorrectCHPhu(position: 1 | 2 | 3 | 4): void {
    if (!this.state.cau_hoi_phu.incorrectPlayers.includes(position)) {
      this.state.cau_hoi_phu.incorrectPlayers.push(position);
      console.log(`❌ P${position} answered incorrect in Câu hỏi phụ and is locked out of this question.`);
    }
    // Unlock buzzer for remaining eligible players
    if (this.state.cau_hoi_phu.ruleMode !== 'SHOOTOUT') {
      this.state.buzzerState = 'OPEN';
    }
    this.state.buzzedPlayer = null;
    this.state.buzzedTimestamp = null;
    this.state.cau_hoi_phu.buzzedPlayer = null;
    
    // Resume countdown timer
    this.resumeTimer();

    // Resume sound for remaining time if there are eligible players left
    const soundId = this.state.cau_hoi_phu.ruleMode === 'SHOOTOUT' ? 'Additional_10Seconds' : 'Additional_15Seconds';
    const confirmed = this.state.cau_hoi_phu.confirmedPlayers || [];
    if (this.state.cau_hoi_phu.incorrectPlayers.length < confirmed.length) {
      this.resumeSound(soundId);
    } else {
      this.stopSound(soundId);
    }
  }

  public gradeCHPhu(isCorrect: boolean): void {
    const chp = this.state.cau_hoi_phu;
    const ruleMode = chp.ruleMode || 'TRADITIONAL';
    const confirmed = chp.confirmedPlayers || [];

    if (ruleMode === 'TRADITIONAL') {
      const buzzedPos = this.state.buzzedPlayer || chp.buzzedPlayer;
      if (!buzzedPos) return;

      if (isCorrect) {
        chp.winnerPosition = buzzedPos;
        chp.winnerReason = `Thí sinh Bàn ${buzzedPos} (${this.state.players[buzzedPos as 1|2|3|4]?.name}) trả lời đúng câu hỏi phụ!`;
        this.state.buzzerState = 'LOCKED';
        this.playSound('Additional_Correct');
        this.playSound('Additional_Win');
        this.stopSound('Additional_15Seconds');
      } else {
        this.playSound('Additional_Wrong');
        this.submitIncorrectCHPhu(buzzedPos as 1 | 2 | 3 | 4);
      }
      return;
    }

    if (ruleMode === 'IMPROVED') {
      const buzzedPos = this.state.buzzedPlayer || chp.buzzedPlayer;
      if (!buzzedPos) return;

      if (isCorrect) {
        if (!chp.scores) chp.scores = {};
        chp.scores[buzzedPos] = (chp.scores[buzzedPos] || 0) + 1;

        const total = this.state.timerTotal || 15;
        const currentSec = this.state.timerSeconds;
        const elapsed = Math.max(0.1, Number((total - currentSec).toFixed(2)));
        if (!chp.totalTime) chp.totalTime = {};
        chp.totalTime[buzzedPos] = Number(((chp.totalTime[buzzedPos] || 0) + elapsed).toFixed(2));

        this.playSound('Additional_Correct');
        this.stopSound('Additional_15Seconds');

        this.state.buzzerState = 'LOCKED';
        this.state.buzzedPlayer = null;
        chp.buzzedPlayer = null;

        // Win Condition 1: Reach 5 points
        if (chp.scores[buzzedPos] >= 5) {
          chp.winnerPosition = buzzedPos;
          chp.winnerReason = `Đạt 5 điểm trước đối thủ!`;
          this.playSound('Additional_Win');
          console.log(`🏆 CHP Winner (IMPROVED - Reach 5): P${buzzedPos}`);
          return;
        }

        // Advance to next question (do not auto-reveal)
        chp.questionRevealed = false;
        chp.currentQuestionIndex = (chp.currentQuestionIndex || 0) + 1;
        chp.incorrectPlayers = [];
        chp.foulPlayers = [];

        // Check Win Condition 2: Max questions reached
        const maxQ = chp.maxQuestions || 15;
        if (chp.currentQuestionIndex >= maxQ) {
          this.evaluateCHPhuImprovedWinner();
        }
      } else {
        this.playSound('Additional_Wrong');
        this.submitIncorrectCHPhu(buzzedPos as 1 | 2 | 3 | 4);

        if (chp.incorrectPlayers.length >= confirmed.length) {
          this.stopSound('Additional_15Seconds');
          this.state.buzzerState = 'LOCKED';
          this.state.buzzedPlayer = null;
          chp.buzzedPlayer = null;

          // Advance to next question (do not auto-reveal)
          chp.questionRevealed = false;
          chp.currentQuestionIndex = (chp.currentQuestionIndex || 0) + 1;
          chp.incorrectPlayers = [];
          chp.foulPlayers = [];

          const maxQ = chp.maxQuestions || 15;
          if (chp.currentQuestionIndex >= maxQ) {
            this.evaluateCHPhuImprovedWinner();
          }
        }
      }
      return;
    }

    if (ruleMode === 'SHOOTOUT') {
      const activePlayer = chp.currentTurnPlayer;
      if (!activePlayer) return;

      if (!chp.scores) chp.scores = {};
      if (!chp.playerQuestionCounts) chp.playerQuestionCounts = {};
      if (!chp.history) chp.history = {};
      if (!chp.history[activePlayer]) chp.history[activePlayer] = [];

      if (isCorrect) {
        chp.scores[activePlayer] = (chp.scores[activePlayer] || 0) + 1;
        chp.history[activePlayer].push(true);
        this.playSound('Additional_Correct');
      } else {
        chp.history[activePlayer].push(false);
        this.playSound('Additional_Wrong');
      }

      chp.playerQuestionCounts[activePlayer] = (chp.playerQuestionCounts[activePlayer] || 0) + 1;
      this.pauseTimer();
      this.stopSound('Additional_10Seconds');
      chp.questionRevealed = false;

      this.evaluateCHPhuShootoutTurn();
      return;
    }
  }

  private evaluateCHPhuImprovedWinner(): void {
    const chp = this.state.cau_hoi_phu;
    const confirmed = chp.confirmedPlayers || [];
    if (confirmed.length === 0) return;

    let maxScore = -1;
    confirmed.forEach(p => {
      const sc = chp.scores?.[p] || 0;
      if (sc > maxScore) maxScore = sc;
    });

    const topPlayers = confirmed.filter(p => (chp.scores?.[p] || 0) === maxScore);

    if (topPlayers.length === 1) {
      chp.winnerPosition = topPlayers[0];
      chp.winnerReason = `Giành điểm số cao nhất (${maxScore}đ) sau ${chp.maxQuestions} câu hỏi!`;
      this.playSound('Additional_Win');
    } else {
      let minTime = Infinity;
      let winner = topPlayers[0];
      topPlayers.forEach(p => {
        const time = chp.totalTime?.[p] ?? Infinity;
        if (time < minTime) {
          minTime = time;
          winner = p;
        }
      });
      chp.winnerPosition = winner;
      chp.winnerReason = `Bằng điểm (${maxScore}đ) nhưng có tổng thời gian trả lời đúng ngắn nhất (${minTime.toFixed(1)}s)!`;
      this.playSound('Additional_Win');
    }
  }

  private evaluateCHPhuShootoutTurn(): void {
    const chp = this.state.cau_hoi_phu;
    chp.questionRevealed = false;
    const confirmed = chp.confirmedPlayers || [];
    if (confirmed.length === 0) return;

    const stage = chp.stage || 'INITIAL';

    if (stage === 'INITIAL') {
      let earlyWinner: number | null = null;

      for (const candidate of confirmed) {
        const candScore = chp.scores?.[candidate] || 0;
        let isGuaranteedWin = true;

        for (const opponent of confirmed) {
          if (opponent === candidate) continue;
          const oppScore = chp.scores?.[opponent] || 0;
          const oppAnswered = chp.playerQuestionCounts?.[opponent] || 0;
          const oppRemaining = Math.max(0, 5 - oppAnswered);

          if (candScore - oppScore <= oppRemaining) {
            isGuaranteedWin = false;
            break;
          }
        }

        if (isGuaranteedWin) {
          earlyWinner = candidate;
          break;
        }
      }

      if (earlyWinner) {
        chp.winnerPosition = earlyWinner;
        chp.winnerReason = `Thắng sớm do đối thủ không còn khả năng san bằng điểm số!`;
        this.playSound('Additional_Win');
        return;
      }

      const allFinished5 = confirmed.every(p => (chp.playerQuestionCounts?.[p] || 0) >= 5);

      if (allFinished5) {
        let maxScore = -1;
        confirmed.forEach(p => {
          const sc = chp.scores?.[p] || 0;
          if (sc > maxScore) maxScore = sc;
        });

        const topPlayers = confirmed.filter(p => (chp.scores?.[p] || 0) === maxScore);

        if (topPlayers.length === 1) {
          chp.winnerPosition = topPlayers[0];
          chp.winnerReason = `Giành điểm số cao nhất (${maxScore}đ) sau 5 lượt trả lời luân lưu!`;
          this.playSound('Additional_Win');
          return;
        } else {
          chp.stage = 'SUDDEN_DEATH';
          chp.activeContestants = topPlayers.slice().sort();
          chp.turnOrder = topPlayers.slice().sort();
          chp.turnIndex = 0;
          chp.currentTurnPlayer = chp.turnOrder[0];
          chp.suddenDeathRound = 6;
          chp.currentQuestionIndex = (chp.currentQuestionIndex || 0) + 1;
          console.log(`🔥 Entering CHP Sudden Death for players: ${topPlayers.join(', ')}`);
          return;
        }
      }

      const order = chp.turnOrder || confirmed;
      chp.turnIndex = ((chp.turnIndex || 0) + 1) % order.length;
      chp.currentTurnPlayer = order[chp.turnIndex];
      chp.currentQuestionIndex = (chp.currentQuestionIndex || 0) + 1;
      return;
    }

    if (stage === 'SUDDEN_DEATH') {
      const order = chp.turnOrder || chp.activeContestants || confirmed;
      chp.turnIndex = (chp.turnIndex || 0) + 1;

      if (chp.turnIndex >= order.length) {
        const active = chp.activeContestants || confirmed;
        let maxScore = -1;
        active.forEach(p => {
          const sc = chp.scores?.[p] || 0;
          if (sc > maxScore) maxScore = sc;
        });

        const topPlayers = active.filter(p => (chp.scores?.[p] || 0) === maxScore);

        if (topPlayers.length === 1) {
          chp.winnerPosition = topPlayers[0];
          chp.winnerReason = `Thắng ở lượt trả lời luân lưu sinh tử thứ ${chp.suddenDeathRound || 6}!`;
          this.playSound('Additional_Win');
          return;
        } else {
          chp.activeContestants = topPlayers.slice().sort();
          chp.turnOrder = topPlayers.slice().sort();
          chp.turnIndex = 0;
          chp.currentTurnPlayer = chp.turnOrder[0];
          chp.suddenDeathRound = (chp.suddenDeathRound || 6) + 1;
          chp.currentQuestionIndex = (chp.currentQuestionIndex || 0) + 1;
          return;
        }
      } else {
        chp.currentTurnPlayer = order[chp.turnIndex];
        chp.currentQuestionIndex = (chp.currentQuestionIndex || 0) + 1;
        return;
      }
    }
  }

  // --- JEOPARDY (v3.0) METHODS ---

  public jeopardyRevealCategory(categoryIndex: number): void {
    if (!this.state.jeopardy) return;
    const cat = this.state.jeopardy.categories?.[categoryIndex];
    if (!cat) return;

    cat.isRevealed = true;
    this.state.jeopardy.highlightedCategoryIndex = categoryIndex;
    this.playSound('VCNV_OpenRow');

    if (this.categoryHighlightTimeout) {
      clearTimeout(this.categoryHighlightTimeout);
      this.categoryHighlightTimeout = null;
    }

    const allRevealed = this.state.jeopardy.categories.every(c => c.isRevealed);
    if (allRevealed) {
      this.categoryHighlightTimeout = setTimeout(() => {
        if (this.state.jeopardy) {
          this.state.jeopardy.highlightedCategoryIndex = null;
          if (this.onStateChange) this.onStateChange();
        }
      }, 5000);
    }
  }

  public jeopardyShowBoard(): void {
    if (!this.state.jeopardy) return;
    this.state.jeopardy.isBoardShown = true;
    this.playSound('Jeopardy_ShowBoard');
    setTimeout(() => {
      if (this.state.jeopardy?.isBoardShown && !this.state.jeopardy?.selectedClue) {
        this.playSound('General_Ambience');
        if (this.onStateChange) this.onStateChange();
      }
    }, 3500);
  }

  public jeopardySelectClue(categoryIndex: number, clueIndex: number): void {
    if (!this.state.jeopardy) return;
    const cat = this.state.jeopardy.categories?.[categoryIndex];
    if (!cat) return;
    const clue = cat.clues?.[clueIndex];
    if (!clue) return;

    this.state.jeopardy.selectedClue = { categoryIndex, clueIndex };
    this.state.jeopardy.clueStage = 'READING';
    this.state.jeopardy.buzzedPlayer = null;
    this.state.buzzedPlayer = null;
    this.state.buzzerState = 'LOCKED';
    this.state.jeopardy.incorrectPlayersForClue = [];
    this.state.jeopardy.foulPlayersForClue = [];
    this.state.jeopardy.foulUnlockTime = {};
    this.stopTimer();

    this.playSound('Jeopardy_ClueShow');
  }

  public jeopardyStartBuzzer(): void {
    if (!this.state.jeopardy) return;
    const jp = this.state.jeopardy;
    jp.clueStage = 'OPEN';
    this.state.buzzerState = 'OPEN';

    if (jp.buzzerRuleMode === 'PENALTY_025' && jp.foulPlayersForClue.length > 0) {
      const now = Date.now();
      jp.foulUnlockTime = {};
      jp.foulPlayersForClue.forEach(p => {
        jp.foulUnlockTime[p] = now + 250;
      });
    }

    // Automatically start 5-second countdown timer on buzzer open
    this.jeopardyStart5sTimer();
  }

  public jeopardyGradeAnswer(isCorrect: boolean): void {
    if (!this.state.jeopardy) return;
    const jp = this.state.jeopardy;
    const buzzedPos = this.state.buzzedPlayer || jp.buzzedPlayer;
    if (!buzzedPos || !jp.selectedClue) return;

    const clue = jp.categories?.[jp.selectedClue.categoryIndex]?.clues?.[jp.selectedClue.clueIndex];
    if (!clue) return;

    const points = (clue.points !== undefined && clue.points !== null && !isNaN(Number(clue.points))) ? Number(clue.points) : 10;

    if (isCorrect) {
      if (jp.scoringMode === 'COMBINED') {
        if (this.state.players[buzzedPos]) {
          this.state.players[buzzedPos].score += points;
        }
      }
      jp.separateScores[buzzedPos] = (jp.separateScores[buzzedPos] || 0) + points;

      clue.isAnswered = true;
      clue.answeredByPlayer = buzzedPos;
      clue.isCorrect = true;
      jp.controlPlayer = buzzedPos;
      jp.clueStage = 'FINISHED';

      this.state.buzzedPlayer = null;
      jp.buzzedPlayer = null;
      this.state.buzzerState = 'LOCKED';

      // Auto reset timer to 5s and stop countdown on correct answer
      this.stopTimer();
      jp.is5sTimerRunning = false;
      jp.timer5sSeconds = 5;
      this.state.isTimerRunning = false;
      this.state.timerSeconds = 5;

      this.playSound('Additional_Correct');
    } else {
      if (jp.scoringMode === 'COMBINED') {
        if (this.state.players[buzzedPos]) {
          this.state.players[buzzedPos].score -= points;
        }
      }
      jp.separateScores[buzzedPos] = (jp.separateScores[buzzedPos] || 0) - points;

      if (!jp.incorrectPlayersForClue.includes(buzzedPos)) {
        jp.incorrectPlayersForClue.push(buzzedPos);
      }

      this.state.buzzedPlayer = null;
      jp.buzzedPlayer = null;

      this.playSound('Additional_Wrong');

      // Stop current active timer
      this.stopTimer();

      // Check if all active players answered wrong
      const playerPositions = Object.keys(this.state.players).map(Number).filter(p => this.state.players[p]?.name);
      const activePositions = playerPositions.length > 0 ? playerPositions : [1, 2, 3, 4];
      const allIncorrect = activePositions.every(p => jp.incorrectPlayersForClue.includes(p));

      if (allIncorrect) {
        clue.isAnswered = true;
        clue.answeredByPlayer = null;
        clue.isCorrect = false;
        jp.clueStage = 'FINISHED';
        this.state.buzzerState = 'LOCKED';

        // Auto reset timer to 5s and stop countdown
        jp.is5sTimerRunning = false;
        jp.timer5sSeconds = 5;
        this.state.isTimerRunning = false;
        this.state.timerSeconds = 5;
      } else {
        // Reopen buzzer and restart 5s timer for remaining eligible players
        this.jeopardyStartBuzzer();
      }
    }
  }

  public jeopardyStart5sTimer(): void {
    if (!this.state.jeopardy) return;
    const jp = this.state.jeopardy;
    jp.is5sTimerRunning = true;
    jp.timer5sSeconds = 5;

    this.stopTimer();

    this.timerTotalDuration = 5;
    this.timerSecondsRemaining = 5;
    this.timerStartTime = Date.now();
    this.onTickCallback = (sec) => {
      if (this.state.jeopardy) {
        this.state.jeopardy.timer5sSeconds = sec;
      }
    };
    this.onCompleteCallback = () => {
      if (this.state.jeopardy) {
        this.state.jeopardy.is5sTimerRunning = false;
        this.state.jeopardy.timer5sSeconds = 0;
        this.state.buzzerState = 'LOCKED';
      }
    };

    this.state.timerSeconds = 5;
    this.state.timerTotal = 5;
    this.state.isTimerRunning = true;

    this.onTickCallback(5);

    this.timerInterval = setInterval(() => {
      const elapsedMs = Date.now() - this.timerStartTime;
      const remaining = Math.max(0, 5 - (elapsedMs / 1000));

      this.timerSecondsRemaining = parseFloat(remaining.toFixed(2));
      this.state.timerSeconds = this.timerSecondsRemaining;
      if (this.state.jeopardy) {
        this.state.jeopardy.timer5sSeconds = this.timerSecondsRemaining;
      }

      if (remaining <= 0) {
        this.stopTimer();
        this.state.timerSeconds = 0;
        if (this.state.jeopardy) {
          this.state.jeopardy.timer5sSeconds = 0;
          this.state.jeopardy.is5sTimerRunning = false;
          this.state.jeopardy.clueStage = 'FINISHED';
          this.state.buzzerState = 'LOCKED';

          if (this.state.jeopardy.selectedClue) {
            const { categoryIndex, clueIndex } = this.state.jeopardy.selectedClue;
            const clue = this.state.jeopardy.categories?.[categoryIndex]?.clues?.[clueIndex];
            if (clue && !clue.isCorrect) {
              clue.isAnswered = true;
            }
          }

          this.playSound('Jeopardy_End5Seconds');
        }
        if (this.onCompleteCallback) this.onCompleteCallback();
        if (this.onStateChange) this.onStateChange();
      } else {
        if (this.onTickCallback) this.onTickCallback(this.state.timerSeconds);
        if (this.onStateChange) this.onStateChange();
      }
    }, 100);
  }

  public jeopardyCloseClue(): void {
    if (!this.state.jeopardy) return;
    this.stopTimer();

    if (this.state.jeopardy.selectedClue) {
      const { categoryIndex, clueIndex } = this.state.jeopardy.selectedClue;
      const clue = this.state.jeopardy.categories?.[categoryIndex]?.clues?.[clueIndex];
      if (clue && !clue.isCorrect) {
        clue.isAnswered = true;
      }
    }

    this.state.jeopardy.selectedClue = null;
    this.state.jeopardy.clueStage = 'CLOSED';
    this.state.jeopardy.buzzedPlayer = null;
    this.state.buzzedPlayer = null;
    this.state.buzzerState = 'LOCKED';
    this.state.jeopardy.is5sTimerRunning = false;
    this.state.jeopardy.timer5sSeconds = 5;
    this.state.isTimerRunning = false;
    this.state.timerSeconds = 5;
  }

  public jeopardySetBoardSize(boardSize: '5x4' | '6x5'): void {
    if (!this.state.jeopardy) return;

    const templateCategoryCount = this.matchQuestions?.jeopardy?.categories?.length || 0;
    const isTemplate5x4 = templateCategoryCount > 0 && templateCategoryCount <= 5;
    if (boardSize === '6x5' && isTemplate5x4) {
      console.warn("Cannot switch to 6x5 because template only provides 5 categories (5x4).");
      return;
    }

    this.state.jeopardy.boardSize = boardSize;
    this.state.jeopardy.selectedClue = null;
    this.state.jeopardy.clueStage = 'CLOSED';

    if (this.matchQuestions?.jeopardy?.categories?.length) {
      const rawCats = this.matchQuestions.jeopardy.categories;
      const maxCats = boardSize === '6x5' ? 6 : 5;
      const maxClues = boardSize === '6x5' ? 5 : 4;
      this.state.jeopardy.categories = rawCats.slice(0, maxCats).map((cat, cIdx) => ({
        title: cat.title,
        clues: (cat.clues || []).slice(0, maxClues).map((clue: any, kIdx: number) => ({
          id: `c${cIdx}_q${kIdx}`,
          categoryIndex: cIdx,
          clueIndex: kIdx,
          points: clue.points !== undefined && clue.points !== null && !isNaN(Number(clue.points)) ? Number(clue.points) : (kIdx + 1) * 10,
          question: clue.question || '',
          dap_an_dung: clue.dap_an_dung || '',
          media: clue.media,
          isAnswered: false,
          answeredByPlayer: null
        }))
      }));
    } else {
      this.state.jeopardy.categories = createDefaultJeopardyCategories(boardSize);
    }
  }

  public jeopardySetBuzzerRule(mode: 'PENALTY_025' | 'STRICT_LOCK'): void {
    if (!this.state.jeopardy) return;
    this.state.jeopardy.buzzerRuleMode = mode;
  }

  public jeopardySetScoringMode(mode: 'COMBINED' | 'SEPARATE'): void {
    if (!this.state.jeopardy) return;
    this.state.jeopardy.scoringMode = mode;
  }

  public jeopardySetControlPlayer(pos: number | null): void {
    if (!this.state.jeopardy) return;
    this.state.jeopardy.controlPlayer = pos;
  }

  public jeopardyResetGame(): void {
    if (!this.state.jeopardy) return;
    if (this.categoryHighlightTimeout) {
      clearTimeout(this.categoryHighlightTimeout);
      this.categoryHighlightTimeout = null;
    }
    const size = this.state.jeopardy.boardSize;
    const ruleMode = this.state.jeopardy.buzzerRuleMode;
    const scoringMode = this.state.jeopardy.scoringMode;

    let cats: JeopardyCategoryState[] = [];
    if (this.matchQuestions?.jeopardy?.categories?.length) {
      const rawCats = this.matchQuestions.jeopardy.categories;
      const maxCats = size === '6x5' ? 6 : 5;
      const maxClues = size === '6x5' ? 5 : 4;
      cats = rawCats.slice(0, maxCats).map((cat, cIdx) => ({
        title: cat.title,
        clues: (cat.clues || []).slice(0, maxClues).map((clue: any, kIdx: number) => ({
          id: `c${cIdx}_q${kIdx}`,
          categoryIndex: cIdx,
          clueIndex: kIdx,
          points: clue.points !== undefined && clue.points !== null && !isNaN(Number(clue.points)) ? Number(clue.points) : (kIdx + 1) * 10,
          question: clue.question || '',
          dap_an_dung: clue.dap_an_dung || '',
          media: clue.media,
          isAnswered: false,
          answeredByPlayer: null
        }))
      }));
    } else {
      cats = createDefaultJeopardyCategories(size);
    }

    this.state.jeopardy = {
      boardSize: size,
      categories: cats,
      isBoardShown: false,
      selectedClue: null,
      clueStage: 'CLOSED',
      buzzerRuleMode: ruleMode,
      scoringMode: scoringMode,
      controlPlayer: null,
      separateScores: { 1: 0, 2: 0, 3: 0, 4: 0 },
      buzzedPlayer: null,
      buzzedTimestamp: null,
      incorrectPlayersForClue: [],
      foulPlayersForClue: [],
      foulUnlockTime: {},
      is5sTimerRunning: false,
      timer5sSeconds: 5,
    };
    this.playSound('Jeopardy_Finish');
  }

  // --- GENERAL CHAT ---

  public addChatMessage(sender: 'ADMIN' | 'MC', text: string): ChatMessage {
    const msg: ChatMessage = {
      sender,
      text,
      timestamp: Date.now()
    };
    this.state.chatHistory.push(msg);
    return msg;
  }

  // --- MA TRẬN KÉP METHODS ---

  private getDistractorPool(customDistractors?: string[]): string[] {
    const custom = (customDistractors || []).map(d => (d || '').trim()).filter(d => d.length > 0);
    if (custom.length > 0) {
      const pool = Array.from(new Set(custom));
      // Only pad if less than 24
      if (pool.length < 24) {
        for (const fb of FALLBACK_DISTRACTORS_24) {
          if (!pool.some(p => p.toLowerCase() === fb.toLowerCase())) {
            pool.push(fb);
          }
        }
      }
      return pool;
    }
    return [...FALLBACK_DISTRACTORS_24];
  }

  private stopMainTimeSound(): void {
    this.stopSound('Gridlocked_MainTime');
    this.stopSound('Gridlocked_MainTime90Seconds');
    this.stopSound('Gridlocked_MainTime120Seconds');
    this.stopSound('Gridlocked_MainTime150Seconds');
    this.stopSound('Gridlocked_MainTime180Seconds');
  }

  private generateMaTranKepBoardForPlayer(pos: number): MaTranKepCard[] {
    const data = this.matchQuestions?.ma_tran_kep || createDefaultMaTranKepQuestions();
    const questions = data.cau_hoi && data.cau_hoi.length > 0 ? data.cau_hoi : createDefaultMaTranKepQuestions().cau_hoi;
    const distractorPool = this.getDistractorPool(data.dap_an_nhieu);

    const cards: MaTranKepCard[] = [];

    // 1. Both answers for Q1, Q2, Q3 (indices 0, 1, 2) -> 6 cards
    for (let i = 0; i < 3 && i < questions.length; i++) {
      const q = questions[i];
      cards.push({ id: `q${q.id}_a1`, text: q.dap_an_1, questionId: q.id });
      cards.push({ id: `q${q.id}_a2`, text: q.dap_an_2, questionId: q.id });
    }

    // 2. 1 answer for Q4, Q5, Q6, Q7 (indices 3, 4, 5, 6) -> 4 cards
    for (let i = 3; i < 7 && i < questions.length; i++) {
      const q = questions[i];
      const pickA1 = Math.random() < 0.5;
      if (pickA1) {
        cards.push({ id: `q${q.id}_a1`, text: q.dap_an_1, questionId: q.id });
      } else {
        cards.push({ id: `q${q.id}_a2`, text: q.dap_an_2, questionId: q.id });
      }
    }

    // 3. 2 distractor cards -> 2 cards
    const shuffledDistractors = shuffleArray([...distractorPool]);
    for (let i = 0; i < 2 && i < shuffledDistractors.length; i++) {
      cards.push({ id: `dis_${i + 1}`, text: shuffledDistractors[i], isDistractor: true });
    }

    // If still fewer than 12 cards, pad with additional unique distractors from distractorPool
    let fallbackOffset = 0;
    while (cards.length < 12) {
      const existing = cards.map(c => c.text.trim().toLowerCase());
      let addedText = '';
      for (let k = 0; k < distractorPool.length; k++) {
        const candidate = distractorPool[(fallbackOffset + k) % distractorPool.length];
        if (!existing.includes(candidate.trim().toLowerCase())) {
          addedText = candidate;
          fallbackOffset = (fallbackOffset + k + 1) % distractorPool.length;
          break;
        }
      }
      if (!addedText) {
        addedText = distractorPool[cards.length % distractorPool.length];
      }
      cards.push({ id: `dis_pad_${cards.length + 1}`, text: addedText, isDistractor: true });
    }

    // Shuffle all 12 cards so positions are completely random across the 4x3 grid
    return shuffleArray(cards);
  }

  private ensureQuestionAnswersOnBoard(
    pState: MaTranKepPlayerState, 
    targetQ: MaTranKepQuestion, 
    rawDistractors: string[], 
    allQuestions: MaTranKepQuestion[],
    newlyFreedIndices?: [number, number]
  ): void {
    if (!targetQ) return;

    const fullDistractorPool = this.getDistractorPool(rawDistractors);

    // 1. If newlyFreedIndices are provided (e.g. after a correct answer), fill those 2 slots following the user's algorithm
    if (newlyFreedIndices && newlyFreedIndices.length === 2) {
      const [f1, f2] = newlyFreedIndices;
      const boardTexts = pState.board
        .filter((_, idx) => idx !== f1 && idx !== f2)
        .map(c => (c.text || '').trim().toLowerCase());

      // Priority: find the first unsolved question (Q4+) that has exactly 1 answer missing from boardTexts
      let priorityCard: MaTranKepCard | null = null;
      for (let i = 0; i < allQuestions.length; i++) {
        const q = allQuestions[i];
        if (!pState.solvedQuestionIds.includes(q.id)) {
          const hasA1 = boardTexts.includes(q.dap_an_1.trim().toLowerCase());
          const hasA2 = boardTexts.includes(q.dap_an_2.trim().toLowerCase());
          if (hasA1 && !hasA2) {
            priorityCard = { id: `q${q.id}_a2`, text: q.dap_an_2, questionId: q.id };
            break;
          } else if (hasA2 && !hasA1) {
            priorityCard = { id: `q${q.id}_a1`, text: q.dap_an_1, questionId: q.id };
            break;
          }
        }
      }

      // Candidate pool for second slot (or both if no priorityCard) - drawn strictly from the 24 distractor pool
      const candidatePool: MaTranKepCard[] = [];
      fullDistractorPool.forEach((dText, dIdx) => {
        if (dText) {
          const dNorm = dText.trim().toLowerCase();
          if (!boardTexts.includes(dNorm) && priorityCard?.text.trim().toLowerCase() !== dNorm) {
            candidatePool.push({ id: `dis_${dIdx + 1}`, text: dText, isDistractor: true });
          }
        }
      });

      const shuffledCandidates = shuffleArray(candidatePool);

      const newCardsToPlace: MaTranKepCard[] = [];
      if (priorityCard) {
        newCardsToPlace.push(priorityCard);
      }
      while (newCardsToPlace.length < 2 && shuffledCandidates.length > 0) {
        const c = shuffledCandidates.pop();
        if (c) newCardsToPlace.push(c);
      }

      let fallbackCounter = 0;
      while (newCardsToPlace.length < 2) {
        const existingTexts = [
          ...boardTexts,
          ...newCardsToPlace.map(c => c.text.trim().toLowerCase())
        ];
        let chosenText = '';
        for (let k = 0; k < fullDistractorPool.length; k++) {
          const cand = fullDistractorPool[(fallbackCounter + k) % fullDistractorPool.length];
          if (!existingTexts.includes(cand.trim().toLowerCase())) {
            chosenText = cand;
            fallbackCounter = (fallbackCounter + k + 1) % fullDistractorPool.length;
            break;
          }
        }
        if (!chosenText) {
          chosenText = fullDistractorPool[newCardsToPlace.length % fullDistractorPool.length];
        }
        newCardsToPlace.push({ id: `dis_extra_${Date.now()}_${newCardsToPlace.length}`, text: chosenText, isDistractor: true });
      }

      const shuffledFreed = shuffleArray(newCardsToPlace);
      pState.board[f1] = shuffledFreed[0];
      pState.board[f2] = shuffledFreed[1];
    }

    // 2. Guarantee that targetQ's 2 correct answers are present on the board
    const ans1 = targetQ.dap_an_1.trim();
    const ans2 = targetQ.dap_an_2.trim();
    const norm1 = ans1.toLowerCase();
    const norm2 = ans2.toLowerCase();

    let hasAns1 = pState.board.some(c => (c.text || '').trim().toLowerCase() === norm1);
    let hasAns2 = pState.board.some(c => (c.text || '').trim().toLowerCase() === norm2);

    const getReplaceableIndex = (excludeNorms: string[]): number => {
      const distractorIndices: number[] = [];
      const solvedIndices: number[] = [];
      const otherIndices: number[] = [];

      pState.board.forEach((card, idx) => {
        const tNorm = (card.text || '').trim().toLowerCase();
        if (excludeNorms.includes(tNorm)) return;

        if (card.isDistractor) {
          distractorIndices.push(idx);
        } else if (card.questionId && pState.solvedQuestionIds.includes(card.questionId)) {
          solvedIndices.push(idx);
        } else {
          otherIndices.push(idx);
        }
      });

      if (distractorIndices.length > 0) return shuffleArray(distractorIndices)[0];
      if (solvedIndices.length > 0) return shuffleArray(solvedIndices)[0];
      if (otherIndices.length > 0) return shuffleArray(otherIndices)[0];
      return -1;
    };

    if (!hasAns1) {
      const idxToReplace = getReplaceableIndex([norm2]);
      if (idxToReplace >= 0) {
        pState.board[idxToReplace] = {
          id: `q${targetQ.id}_a1_${Date.now()}`,
          text: ans1,
          questionId: targetQ.id
        };
        hasAns1 = true;
      }
    }

    if (!hasAns2) {
      const idxToReplace = getReplaceableIndex([norm1]);
      if (idxToReplace >= 0) {
        pState.board[idxToReplace] = {
          id: `q${targetQ.id}_a2_${Date.now()}`,
          text: ans2,
          questionId: targetQ.id
        };
        hasAns2 = true;
      }
    }
  }

  public prepareMaTranKep(): void {
    this.state.currentRound = 'MA_TRAN_KEP';
    if (!this.state.ma_tran_kep) {
      this.state.ma_tran_kep = createDefaultMaTranKepState();
    }
    const data = this.matchQuestions?.ma_tran_kep || createDefaultMaTranKepQuestions();
    this.state.ma_tran_kep.questions = data.cau_hoi && data.cau_hoi.length > 0 ? data.cau_hoi : createDefaultMaTranKepQuestions().cau_hoi;
    this.state.ma_tran_kep.status = 'READY';
    this.playSound('Gridlocked_Ready');
  }

  public startMaTranKep(durationSeconds: number = 180): void {
    const duration = [90, 120, 150, 180].includes(durationSeconds) ? durationSeconds : 180;
    this.state.currentRound = 'MA_TRAN_KEP';
    if (!this.state.ma_tran_kep) {
      this.state.ma_tran_kep = createDefaultMaTranKepState();
    }

    const data = this.matchQuestions?.ma_tran_kep || createDefaultMaTranKepQuestions();
    const questions = data.cau_hoi && data.cau_hoi.length > 0 ? data.cau_hoi : createDefaultMaTranKepQuestions().cau_hoi;
    const distractors = this.getDistractorPool(data.dap_an_nhieu);

    this.state.ma_tran_kep.questions = questions;
    this.state.ma_tran_kep.status = 'RUNNING';
    this.state.ma_tran_kep.timerSecondsLeft = duration;
    this.state.ma_tran_kep.timerTotalSeconds = duration;
    this.state.ma_tran_kep.isTimerRunning = true;

    this.stopMainTimeSound();
    const soundId = `Gridlocked_MainTime${duration}Seconds`;
    this.playSound(soundId);

    // Initialize each contestant's state & board
    [1, 2, 3, 4].forEach(pos => {
      const pState: MaTranKepPlayerState = {
        board: this.generateMaTranKepBoardForPlayer(pos),
        currentQuestionIndex: 0,
        solvedQuestionIds: [],
        skippedQuestionIds: [],
        selectedCellIndices: [],
        feedbackState: 'NONE',
        feedbackMessage: null,
        isLocked: false,
        lockEndTime: null,
        maxReachedQuestionIndex: 0,
        score: 0,
        isFinished: false
      };
      if (questions[0]) {
        this.ensureQuestionAnswersOnBoard(pState, questions[0], distractors, questions);
      }
      this.state.ma_tran_kep.playerStates[pos] = pState;
    });

    // Start countdown timer
    this.startTimer(duration, (sec) => {
      if (this.state.ma_tran_kep) {
        this.state.ma_tran_kep.timerSecondsLeft = Math.ceil(sec);
      }
    }, () => {
      if (this.state.ma_tran_kep) {
        this.state.ma_tran_kep.timerSecondsLeft = 0;
        this.state.ma_tran_kep.isTimerRunning = false;
      }
    });
  }

  public endMaTranKep(): void {
    this.stopTimer();
    this.stopMainTimeSound();
    if (this.state.ma_tran_kep) {
      this.state.ma_tran_kep.status = 'ENDED';
      this.state.ma_tran_kep.isTimerRunning = false;
    }
    this.playSound('Gridlocked_End');
  }

  public resetMaTranKep(): void {
    this.stopTimer();
    this.stopMainTimeSound();
    this.state.ma_tran_kep = createDefaultMaTranKepState();
  }

  public setMaTranKepActivePlayer(position: number): void {
    if (!this.state.ma_tran_kep) {
      this.state.ma_tran_kep = createDefaultMaTranKepState();
    }
    this.state.ma_tran_kep.activePlayerPosition = position;
    if (this.onStateChange) this.onStateChange();
  }

  public toggleMaTranKepCell(position: number, cellIndex: number): void {
    if (this.state.currentRound !== 'MA_TRAN_KEP' || !this.state.ma_tran_kep || this.state.ma_tran_kep.status !== 'RUNNING') {
      return;
    }

    const pState = this.state.ma_tran_kep.playerStates[position];
    if (!pState || pState.isLocked || pState.isFinished || pState.feedbackState !== 'NONE') {
      return;
    }

    // Toggle logic: if already selected, deselect
    const selectedIdx = pState.selectedCellIndices.indexOf(cellIndex);
    if (selectedIdx >= 0) {
      pState.selectedCellIndices.splice(selectedIdx, 1);
      if (this.onStateChange) this.onStateChange();
      return;
    }

    // Otherwise, select
    pState.selectedCellIndices.push(cellIndex);

    // If 2 cells selected, evaluate answer!
    if (pState.selectedCellIndices.length === 2) {
      const data = this.matchQuestions?.ma_tran_kep || createDefaultMaTranKepQuestions();
      const questions = data.cau_hoi && data.cau_hoi.length > 0 ? data.cau_hoi : createDefaultMaTranKepQuestions().cau_hoi;
      const currentQ = questions[pState.currentQuestionIndex];

      if (!currentQ) return;

      const [idx1, idx2] = pState.selectedCellIndices;
      const cardA = pState.board[idx1];
      const cardB = pState.board[idx2];

      const normA = (cardA?.text || '').trim().toLowerCase();
      const normB = (cardB?.text || '').trim().toLowerCase();
      const target1 = currentQ.dap_an_1.trim().toLowerCase();
      const target2 = currentQ.dap_an_2.trim().toLowerCase();

      // Check how many selected answers match current question's correct answers
      const isA_1 = normA === target1;
      const isA_2 = normA === target2;
      const isB_1 = normB === target1;
      const isB_2 = normB === target2;

      const isBothCorrect = (isA_1 && isB_2) || (isA_2 && isB_1);
      const isOneCorrect = !isBothCorrect && (isA_1 || isA_2 || isB_1 || isB_2);

      if (isBothCorrect) {
        // Correct both!
        pState.feedbackState = 'BOTH_CORRECT';
        pState.score += 10;
        if (this.state.players[position]) {
          this.state.players[position].score += 10;
        }
        if (!pState.solvedQuestionIds.includes(currentQ.id)) {
          pState.solvedQuestionIds.push(currentQ.id);
        }
        // Remove from skipped list if present
        const skippedIdx = pState.skippedQuestionIds.indexOf(currentQ.id);
        if (skippedIdx >= 0) {
          pState.skippedQuestionIds.splice(skippedIdx, 1);
        }

        this.playSound('Gridlocked_Correct');

        // 1s feedback timeout before replacing answers and moving to next question
        setTimeout(() => {
          if (!this.state.ma_tran_kep) return;

          // Check if player solved all 12 questions
          if (pState.solvedQuestionIds.length >= 12 || pState.solvedQuestionIds.length >= questions.length) {
            pState.isFinished = true;
            pState.feedbackState = 'NONE';
            pState.selectedCellIndices = [];
            this.stopTimer();
            if (this.state.ma_tran_kep) {
              this.state.ma_tran_kep.isTimerRunning = false;
              this.state.ma_tran_kep.status = 'ENDED';
            }
            this.stopMainTimeSound();
            this.playSound('Gridlocked_Winner');
            if (this.onStateChange) this.onStateChange();
            return;
          }

          // Find next unsolved question index
          let nextIdx = pState.currentQuestionIndex;
          for (let i = 1; i <= questions.length; i++) {
            const checkIdx = (pState.currentQuestionIndex + i) % questions.length;
            const q = questions[checkIdx];
            if (q && !pState.solvedQuestionIds.includes(q.id)) {
              nextIdx = checkIdx;
              break;
            }
          }

          pState.currentQuestionIndex = nextIdx;
          pState.maxReachedQuestionIndex = Math.max(pState.maxReachedQuestionIndex ?? 0, nextIdx);
          const nextQ = questions[nextIdx];

          // Replace solved cards and ensure nextQ answers are present on board, then shuffle
          this.ensureQuestionAnswersOnBoard(pState, nextQ, data.dap_an_nhieu || [], questions, [idx1, idx2]);

          pState.selectedCellIndices = [];
          pState.feedbackState = 'NONE';
          if (this.onStateChange) this.onStateChange();
        }, 1000);

      } else if (isOneCorrect) {
        pState.feedbackState = 'ONE_CORRECT';
        pState.feedbackMessage = 'Có 1 trong 2 đáp án đúng';
        this.playSound('MaTranKep_Partial');

        setTimeout(() => {
          pState.selectedCellIndices = [];
          pState.feedbackState = 'NONE';
          pState.feedbackMessage = null;
          if (this.onStateChange) this.onStateChange();
        }, 1000);

      } else {
        pState.feedbackState = 'BOTH_INCORRECT';
        this.playSound('MaTranKep_Wrong');

        setTimeout(() => {
          pState.selectedCellIndices = [];
          pState.feedbackState = 'NONE';
          if (this.onStateChange) this.onStateChange();
        }, 1000);
      }
    }

    if (this.onStateChange) this.onStateChange();
  }

  public skipMaTranKepQuestion(position: number): void {
    if (this.state.currentRound !== 'MA_TRAN_KEP' || !this.state.ma_tran_kep || this.state.ma_tran_kep.status !== 'RUNNING') {
      return;
    }

    const pState = this.state.ma_tran_kep.playerStates[position];
    if (!pState || pState.isLocked || pState.isFinished) {
      return;
    }

    const data = this.matchQuestions?.ma_tran_kep || createDefaultMaTranKepQuestions();
    const questions = data.cau_hoi && data.cau_hoi.length > 0 ? data.cau_hoi : createDefaultMaTranKepQuestions().cau_hoi;

    const remainingCount = questions.length - pState.solvedQuestionIds.length;
    if (remainingCount <= 1) {
      return;
    }

    const currentQ = questions[pState.currentQuestionIndex];
    if (currentQ && !pState.skippedQuestionIds.includes(currentQ.id)) {
      pState.skippedQuestionIds.push(currentQ.id);
    }

    let nextIdx = pState.currentQuestionIndex;
    for (let i = 1; i <= questions.length; i++) {
      const checkIdx = (pState.currentQuestionIndex + i) % questions.length;
      const q = questions[checkIdx];
      if (q && !pState.solvedQuestionIds.includes(q.id)) {
        nextIdx = checkIdx;
        break;
      }
    }

    pState.currentQuestionIndex = nextIdx;
    pState.maxReachedQuestionIndex = Math.max(pState.maxReachedQuestionIndex ?? 0, nextIdx);
    pState.selectedCellIndices = [];
    pState.isLocked = true;
    pState.lockEndTime = Date.now() + 5000;

    const nextQ = questions[nextIdx];
    if (nextQ) {
      this.ensureQuestionAnswersOnBoard(pState, nextQ, data.dap_an_nhieu || [], questions);
    }

    this.playSound('Gridlocked_Pass');

    setTimeout(() => {
      if (pState) {
        pState.isLocked = false;
        pState.lockEndTime = null;
        if (this.onStateChange) this.onStateChange();
      }
    }, 5000);

    if (this.onStateChange) this.onStateChange();
  }

  public selectMaTranKepQuestion(position: number, questionIndex: number): void {
    if (this.state.currentRound !== 'MA_TRAN_KEP' || !this.state.ma_tran_kep || this.state.ma_tran_kep.status !== 'RUNNING') {
      return;
    }
    const pState = this.state.ma_tran_kep.playerStates[position];
    if (!pState || pState.isLocked || pState.isFinished) return;

    const data = this.matchQuestions?.ma_tran_kep || createDefaultMaTranKepQuestions();
    const questions = data.cau_hoi && data.cau_hoi.length > 0 ? data.cau_hoi : createDefaultMaTranKepQuestions().cau_hoi;

    if (questionIndex < 0 || questionIndex >= questions.length) return;

    const targetQ = questions[questionIndex];
    if (!targetQ) return;

    // Player can switch to questionIndex if it's <= maxReachedQuestionIndex OR if question is in solved or skipped list
    const maxReached = Math.max(pState.maxReachedQuestionIndex ?? 0, pState.currentQuestionIndex);
    const isAllowed = questionIndex <= maxReached ||
                      pState.solvedQuestionIds.includes(targetQ.id) ||
                      pState.skippedQuestionIds.includes(targetQ.id);

    if (!isAllowed) return;

    pState.currentQuestionIndex = questionIndex;
    pState.maxReachedQuestionIndex = Math.max(maxReached, questionIndex);
    pState.selectedCellIndices = [];
    pState.feedbackState = 'NONE';
    pState.feedbackMessage = null;

    // Ensure target question's 2 answers are present on the 12-cell board and randomly shuffled
    this.ensureQuestionAnswersOnBoard(pState, targetQ, data.dap_an_nhieu || [], questions);

    if (this.onStateChange) this.onStateChange();
  }

  // --- CHINH PHỤC & GMĐT METHODS ---

  public setChinhPhucColorMethod(method: 'HIGH_TO_LOW' | 'LOW_TO_HIGH' | 'GMDT' | 'MANUAL', manualOrder?: number[]): void {
    this.state.chinh_phuc.colorMethod = method;
    this.state.chinh_phuc.colorRevealedCount = 0;
    this.state.chinh_phuc.colorRevealedSlots = [false, false, false, false];

    if (method === 'MANUAL') {
      this.state.chinh_phuc.colorConfirmed = false;
      if (manualOrder && manualOrder.length === 4) {
        this.setChinhPhucManualColors(manualOrder, true);
        return;
      }
      if (this.onStateChange) this.onStateChange();
      return;
    }

    let positions = [1, 2, 3, 4];

    if (method === 'HIGH_TO_LOW') {
      positions.sort((a, b) => {
        const scoreA = this.state.players[a]?.score || 0;
        const scoreB = this.state.players[b]?.score || 0;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return a - b; // Tie-breaker: smaller position preferred
      });
    } else if (method === 'LOW_TO_HIGH') {
      positions.sort((a, b) => {
        const scoreA = this.state.players[a]?.score || 0;
        const scoreB = this.state.players[b]?.score || 0;
        if (scoreA !== scoreB) return scoreA - scoreB;
        return a - b; // Tie-breaker: smaller position preferred
      });
    } else if (method === 'GMDT') {
      const ranks = this.state.chinh_phuc.gmdt.ranks || [];
      if (ranks.length > 0) {
        positions.sort((a, b) => {
          const rankA = ranks.find(r => r.position === a)?.rank ?? 99;
          const rankB = ranks.find(r => r.position === b)?.rank ?? 99;
          if (rankA !== rankB) return rankA - rankB;
          return a - b;
        });
      }
    }

    this.state.chinh_phuc.colorOrder = positions;
    const colors: PlayerColor[] = ['RED', 'YELLOW', 'BLUE', 'GREEN'];
    this.state.chinh_phuc.playerColors = {
      [positions[0]]: colors[0],
      [positions[1]]: colors[1],
      [positions[2]]: colors[2],
      [positions[3]]: colors[3],
    };
    this.state.chinh_phuc.activePlayerPosition = positions[0];
    this.state.chinh_phuc.colorConfirmed = true;

    console.log(`🎯 Chinh Phuc Color Method set to ${method}:`, this.state.chinh_phuc.playerColors);
    if (this.onStateChange) this.onStateChange();
  }

  public setChinhPhucManualColors(order: number[], confirm: boolean = true): void {
    if (!order || order.length !== 4) return;
    this.state.chinh_phuc.colorMethod = 'MANUAL';
    this.state.chinh_phuc.colorOrder = order;
    const colors: PlayerColor[] = ['RED', 'YELLOW', 'BLUE', 'GREEN'];
    this.state.chinh_phuc.playerColors = {
      [order[0]]: colors[0],
      [order[1]]: colors[1],
      [order[2]]: colors[2],
      [order[3]]: colors[3],
    };
    this.state.chinh_phuc.activePlayerPosition = order[0];
    this.state.chinh_phuc.colorConfirmed = confirm;
    console.log(`🎯 Chinh Phuc Manual Colors confirmed:`, this.state.chinh_phuc.playerColors);
    if (this.onStateChange) this.onStateChange();
  }

  public confirmChinhPhucColors(): void {
    this.state.chinh_phuc.colorConfirmed = true;
    if (this.onStateChange) this.onStateChange();
  }

  public endChinhPhucRound(): void {
    this.stopTimer();
    this.stopSound('Brainiest_Bed1');
    this.stopSound('Brainiest_Bed2');
    this.stopSound('Brainiest_CodebreakerTimer');
    this.state.chinh_phuc.is10sTacticalRunning = false;
    this.state.chinh_phuc.questionState = 'IDLE';
    this.state.chinh_phuc.selectedCellIndex = null;
    this.state.chinh_phuc.selectedQuestion = null;
    this.playSound('Brainiest_End');
    console.log('🏁 Chinh Phuc Round Ended');
    if (this.onStateChange) this.onStateChange();
  }

  public revealNextChinhPhucColor(): void {
    const slots = this.state.chinh_phuc.colorRevealedSlots || [false, false, false, false];
    const nextIdx = slots.findIndex(s => !s);
    if (nextIdx !== -1) {
      slots[nextIdx] = true;
      this.state.chinh_phuc.colorRevealedSlots = [...slots];
      this.state.chinh_phuc.colorRevealedCount = slots.filter(Boolean).length;
      const soundMap = ['Brainiest_First', 'Brainiest_Second', 'Brainiest_Third', 'Brainiest_Fourth'];
      this.playSound(soundMap[nextIdx] || 'Brainiest_First');
      console.log(`🎯 Chinh Phuc Revealed Color Slot ${nextIdx} (${this.state.chinh_phuc.colorRevealedCount}/4)`);
      if (this.onStateChange) this.onStateChange();
    }
  }

  public revealChinhPhucColorSlot(slotIndex: number, revealed?: boolean): void {
    if (slotIndex < 0 || slotIndex >= 4) return;
    const slots = [...(this.state.chinh_phuc.colorRevealedSlots || [false, false, false, false])];
    const isNowRevealed = revealed !== undefined ? revealed : !slots[slotIndex];
    slots[slotIndex] = isNowRevealed;
    this.state.chinh_phuc.colorRevealedSlots = slots;
    this.state.chinh_phuc.colorRevealedCount = slots.filter(Boolean).length;
    if (isNowRevealed) {
      const soundMap = ['Brainiest_First', 'Brainiest_Second', 'Brainiest_Third', 'Brainiest_Fourth'];
      this.playSound(soundMap[slotIndex] || 'Brainiest_First');
    }
    if (this.onStateChange) this.onStateChange();
  }

  public resetChinhPhucColorMethod(): void {
    this.state.chinh_phuc.colorMethod = null;
    this.state.chinh_phuc.colorConfirmed = false;
    this.state.chinh_phuc.colorRevealedCount = 0;
    this.state.chinh_phuc.colorRevealedSlots = [false, false, false, false];
    if (this.onStateChange) this.onStateChange();
  }

  public showChinhPhucBoard(): void {
    this.state.chinh_phuc.isBoardShown = true;
    this.playSound('Brainiest_Bed1');
    console.log(`🎯 Chinh Phuc Board Shown`);
    if (this.onStateChange) this.onStateChange();
  }

  public startChinhPhuc10sTactical(): void {
    this.stopSound('Brainiest_Bed1');
    this.state.chinh_phuc.is10sTacticalRunning = true;
    this.state.chinh_phuc.tacticalRevealedCount = 0;
    this.state.chinh_phuc.symbolsHidden = false;
    this.playSound('Brainiest_ShowBoard');

    let count = 0;
    const interval = setInterval(() => {
      count++;
      this.state.chinh_phuc.tacticalRevealedCount = count;
      if (this.onStateChange) this.onStateChange();

      if (count >= 36) {
        clearInterval(interval);
        this.state.chinh_phuc.is10sTacticalRunning = false;
        if (this.state.chinh_phuc.autoHideSymbolsAfter10s) {
          this.triggerChinhPhucAutoHideSymbolsTimer();
        }
        if (this.onStateChange) this.onStateChange();
      }
    }, 100);
  }

  public revealAllChinhPhucCells(): void {
    this.state.chinh_phuc.tacticalRevealedCount = 36;
    this.state.chinh_phuc.is10sTacticalRunning = false;
    this.state.chinh_phuc.symbolsHidden = false;
    if (this.state.chinh_phuc.autoHideSymbolsAfter10s) {
      this.triggerChinhPhucAutoHideSymbolsTimer();
    }
    if (this.onStateChange) this.onStateChange();
  }

  public triggerChinhPhucAutoHideSymbolsTimer(): void {
    if (this.chinhPhucAutoHideTimer) {
      clearInterval(this.chinhPhucAutoHideTimer);
      this.chinhPhucAutoHideTimer = null;
    }

    if (!this.state.chinh_phuc.autoHideSymbolsAfter10s) {
      return;
    }

    this.state.chinh_phuc.symbolsCountdownSecondsLeft = 10;
    if (this.onStateChange) this.onStateChange();

    this.chinhPhucAutoHideTimer = setInterval(() => {
      if (this.state.chinh_phuc.symbolsCountdownSecondsLeft > 0) {
        this.state.chinh_phuc.symbolsCountdownSecondsLeft -= 1;
        if (this.state.chinh_phuc.symbolsCountdownSecondsLeft <= 0) {
          if (this.chinhPhucAutoHideTimer) {
            clearInterval(this.chinhPhucAutoHideTimer);
            this.chinhPhucAutoHideTimer = null;
          }
          this.state.chinh_phuc.symbolsHidden = true;
          this.state.chinh_phuc.symbolsCountdownSecondsLeft = 0;
          this.addLog({
            round: 'CHINH_PHUC',
            type: 'SYSTEM',
            action: 'Ẩn ký hiệu ô',
            detail: 'Đã tự động ẩn ký hiệu các ô (!, ?) sau 10 giây quan sát.'
          });
          console.log('🙈 Chinh Phuc cell symbols hidden after 10s observation');
        }
        if (this.onStateChange) this.onStateChange();
      } else {
        if (this.chinhPhucAutoHideTimer) {
          clearInterval(this.chinhPhucAutoHideTimer);
          this.chinhPhucAutoHideTimer = null;
        }
      }
    }, 1000);
  }

  public toggleChinhPhucSymbolsHidden(hidden?: boolean): void {
    if (this.chinhPhucAutoHideTimer) {
      clearInterval(this.chinhPhucAutoHideTimer);
      this.chinhPhucAutoHideTimer = null;
    }
    this.state.chinh_phuc.symbolsCountdownSecondsLeft = 0;
    this.state.chinh_phuc.symbolsHidden = hidden !== undefined ? hidden : !this.state.chinh_phuc.symbolsHidden;
    this.addLog({
      round: 'CHINH_PHUC',
      type: 'SYSTEM',
      action: this.state.chinh_phuc.symbolsHidden ? 'Ẩn ký hiệu ô' : 'Hiện ký hiệu ô',
      detail: this.state.chinh_phuc.symbolsHidden ? 'Admin đã ẩn ký hiệu ô (!, ?).' : 'Admin đã hiển thị lại ký hiệu ô (!, ?).'
    });
    if (this.onStateChange) this.onStateChange();
  }

  public setChinhPhucAutoHideSymbols(autoHide: boolean): void {
    this.state.chinh_phuc.autoHideSymbolsAfter10s = autoHide;
    if (!autoHide && this.chinhPhucAutoHideTimer) {
      clearInterval(this.chinhPhucAutoHideTimer);
      this.chinhPhucAutoHideTimer = null;
      this.state.chinh_phuc.symbolsCountdownSecondsLeft = 0;
    }
    if (this.onStateChange) this.onStateChange();
  }

  public configureChinhPhucGrid(mediumCount: number, hardCount: number): void {
    const med = Math.max(6, Math.min(12, Math.round(mediumCount || 10)));
    const hrd = Math.max(6, Math.min(12, Math.round(hardCount || 8)));
    this.state.chinh_phuc.mediumCount = med;
    this.state.chinh_phuc.hardCount = hrd;
    this.state.chinh_phuc.board = generateChinhPhucGrid(med, hrd);
    this.state.chinh_phuc.tacticalRevealedCount = 0;
    this.state.chinh_phuc.symbolsHidden = false;
    this.state.chinh_phuc.symbolsCountdownSecondsLeft = 0;
    if (this.chinhPhucAutoHideTimer) {
      clearInterval(this.chinhPhucAutoHideTimer);
      this.chinhPhucAutoHideTimer = null;
    }
    this.addLog({
      round: 'CHINH_PHUC',
      type: 'SYSTEM',
      action: 'Tạo lại bảng Chinh Phục',
      detail: `Cấu hình bảng 36 ô: ${36 - med - hrd} câu Dễ (10đ), ${med} câu Trung bình (20đ), ${hrd} câu Khó (30đ).`
    });
    console.log(`🎲 Chinh Phuc grid re-generated: Easy=${36-med-hrd}, Medium=${med}, Hard=${hrd}`);
    if (this.onStateChange) this.onStateChange();
  }

  public startChinhPhucRound(): void {
    this.state.chinh_phuc.roundNumber = 1;
    this.state.chinh_phuc.turnIndex = 0;
    const activePos = this.state.chinh_phuc.colorOrder[0] || 1;
    this.state.chinh_phuc.activePlayerPosition = activePos;
    this.state.chinh_phuc.selectedCellIndex = null;
    this.state.chinh_phuc.selectedQuestion = null;
    this.state.chinh_phuc.questionState = 'IDLE';
    this.playSound('Brainiest_StartTurn');
    console.log(`🎯 Chinh Phuc Round 1 Started. Active player: ${activePos}`);
    if (this.onStateChange) this.onStateChange();
  }

  public selectChinhPhucCell(cellIndex: number, question?: ChinhPhucQuestion): void {
    if (cellIndex < 0 || cellIndex >= 36) return;
    this.state.chinh_phuc.selectedCellIndex = cellIndex;
    this.state.chinh_phuc.questionState = 'IDLE';

    if (question) {
      this.state.chinh_phuc.selectedQuestion = question;
    } else {
      this.state.chinh_phuc.selectedQuestion = null;
    }

    this.stopSound('Brainiest_Bed2');
    this.playSound('Brainiest_Choose');

    console.log(`🎯 Chinh Phuc Cell ${cellIndex + 1} Selected (waiting for question reveal).`);
    if (this.onStateChange) this.onStateChange();
  }

  public showChinhPhucQuestion(question?: ChinhPhucQuestion): void {
    const cellIdx = this.state.chinh_phuc.selectedCellIndex;
    if (cellIdx === null || cellIdx < 0 || cellIdx >= 36) return;

    if (question) {
      this.state.chinh_phuc.selectedQuestion = question;
    } else if (!this.state.chinh_phuc.selectedQuestion) {
      const cell = this.state.chinh_phuc.board[cellIdx];
      const diff = cell?.difficulty || 'EASY';
      const points = cell?.points || 10;
      const loadedCP = this.matchQuestions?.chinh_phuc?.de_cau_hoi;
      let list: ChinhPhucQuestion[] = [];
      if (diff === 'EASY') list = loadedCP?.de || [];
      else if (diff === 'MEDIUM') list = loadedCP?.trung_binh || [];
      else list = loadedCP?.kho || [];

      if (list.length > 0) {
        const randomQ = list[Math.floor(Math.random() * list.length)];
        this.state.chinh_phuc.selectedQuestion = randomQ;
      } else {
        this.state.chinh_phuc.selectedQuestion = {
          id: `cp_cell_${cellIdx + 1}`,
          noi_dung: `Câu hỏi ${diff === 'EASY' ? 'Dễ (10đ)' : diff === 'MEDIUM' ? 'Trung bình (20đ)' : 'Khó (30đ)'} cho ô số ${cellIdx + 1}`,
          dap_an_dung: 'ĐÁP ÁN MẪU',
          muc_diem: points
        };
      }
    }

    this.state.chinh_phuc.questionState = 'SHOWING_QUESTION';
    this.playSound('Brainiest_ShowQuestion');
    console.log(`🎯 Chinh Phuc Question Revealed for Cell ${cellIdx + 1}.`);
    if (this.onStateChange) this.onStateChange();
  }

  public startChinhPhucQuestionTimer(mode?: 'TRADITIONAL' | 'IMPROVED'): void {
    if (mode) this.state.chinh_phuc.timeMode = mode;
    const timeMode = this.state.chinh_phuc.timeMode;
    const cellIdx = this.state.chinh_phuc.selectedCellIndex;
    const cell = cellIdx !== null ? this.state.chinh_phuc.board[cellIdx] : null;
    const points = cell?.points || 10;

    let seconds = 10;
    if (timeMode === 'IMPROVED') {
      if (points === 20) seconds = 15;
      else if (points === 30) seconds = 20;
      else seconds = 10;
    }

    this.state.chinh_phuc.timerTotalSeconds = seconds;
    this.state.chinh_phuc.timerSecondsLeft = seconds;
    this.state.chinh_phuc.questionState = 'TIMER_RUNNING';

    this.stopTimer();
    this.startTimer(
      seconds,
      (sec) => {
        this.state.chinh_phuc.timerSecondsLeft = sec;
        this.state.chinh_phuc.isTimerRunning = true;
        if (this.onStateChange) this.onStateChange();
      },
      () => {
        this.state.chinh_phuc.isTimerRunning = false;
        this.playSound('TimeUp');
        if (this.onStateChange) this.onStateChange();
      }
    );

    if (timeMode === 'TRADITIONAL') {
      this.playSound('Brainiest_10Seconds');
    } else {
      if (seconds === 15) {
        this.playSound('Finish_15Seconds');
      } else if (seconds === 20) {
        this.playSound('Finish_20Seconds');
      } else {
        this.playSound('Finish_10Seconds');
      }
    }
    if (this.onStateChange) this.onStateChange();
  }

  public gradeChinhPhucAnswer(isCorrect: boolean): void {
    this.stopTimer();
    const cellIdx = this.state.chinh_phuc.selectedCellIndex;
    const activePos = this.state.chinh_phuc.activePlayerPosition;

    if (cellIdx !== null && cellIdx >= 0 && cellIdx < 36 && activePos) {
      const cell = this.state.chinh_phuc.board[cellIdx];
      if (isCorrect) {
        const oldScore = this.state.players[activePos]?.score || 0;
        if (this.state.players[activePos]) {
          this.state.players[activePos].score += cell.points;
        }
        cell.claimedByPlayer = activePos;
        this.state.chinh_phuc.questionState = 'ANSWERED_CORRECT';
        this.playSound('Brainiest_Correct');

        this.addLog({
          round: 'CHINH_PHUC',
          player: activePos,
          type: 'SCORE',
          action: `Đúng ô ${cellIdx + 1} (+${cell.points}đ)`,
          detail: `Thí sinh ${this.state.players[activePos]?.name || 'Bàn ' + activePos} trả lời đúng câu hỏi ô ${cellIdx + 1} (${cell.difficulty === 'EASY' ? 'Dễ 10đ' : cell.difficulty === 'MEDIUM' ? 'TB 20đ' : 'Khó 30đ'}). Điểm: ${oldScore}đ → ${this.state.players[activePos]?.score}đ`,
          scoreBefore: oldScore,
          scoreAfter: this.state.players[activePos]?.score,
          scoreDelta: cell.points
        });

        // Check 5-in-a-row bonus (+40 points)
        const bonuses = checkChinhPhuc5InARowBonus(
          this.state.chinh_phuc.board,
          this.state.chinh_phuc.streaks5BonusAwarded
        );
        for (const bonus of bonuses) {
          const oldStreakScore = this.state.players[bonus.playerPosition as 1 | 2 | 3 | 4]?.score || 0;
          if (this.state.players[bonus.playerPosition as 1 | 2 | 3 | 4]) {
            this.state.players[bonus.playerPosition as 1 | 2 | 3 | 4].score += bonus.bonusPoints;
          }
          if (!this.state.chinh_phuc.streaks5BonusAwarded[bonus.playerPosition]) {
            this.state.chinh_phuc.streaks5BonusAwarded[bonus.playerPosition] = [];
          }
          this.state.chinh_phuc.streaks5BonusAwarded[bonus.playerPosition].push(...bonus.lineIds);
          this.playSound('Bonus_5InARow');

          this.addLog({
            round: 'CHINH_PHUC',
            player: bonus.playerPosition,
            type: 'SCORE',
            action: `Thưởng hàng 5 ô (+${bonus.bonusPoints}đ)`,
            detail: `Thí sinh ${this.state.players[bonus.playerPosition as 1 | 2 | 3 | 4]?.name || 'Bàn ' + bonus.playerPosition} hoàn thành chuỗi 5 ô liên tiếp. Điểm: ${oldStreakScore}đ → ${this.state.players[bonus.playerPosition as 1 | 2 | 3 | 4]?.score}đ`,
            scoreBefore: oldStreakScore,
            scoreAfter: this.state.players[bonus.playerPosition as 1 | 2 | 3 | 4]?.score,
            scoreDelta: bonus.bonusPoints
          });
          console.log(`🎉 5-in-a-row Bonus awarded to Player ${bonus.playerPosition}: +${bonus.bonusPoints}pts!`);
        }
      } else {
        cell.claimedByPlayer = null;
        this.state.chinh_phuc.questionState = 'ANSWERED_INCORRECT';
        this.playSound('Brainiest_Incorrect');

        this.addLog({
          round: 'CHINH_PHUC',
          player: activePos,
          type: 'ANSWER',
          action: `Sai ô ${cellIdx + 1}`,
          detail: `Thí sinh ${this.state.players[activePos]?.name || 'Bàn ' + activePos} trả lời sai câu hỏi ô ${cellIdx + 1}.`
        });
      }
    }

    if (this.onStateChange) this.onStateChange();
  }

  public nextChinhPhucTurn(): void {
    const cp = this.state.chinh_phuc;
    cp.selectedCellIndex = null;
    cp.selectedQuestion = null;
    cp.questionState = 'IDLE';

    let nextTurnIndex = cp.turnIndex + 1;
    if (nextTurnIndex >= 4) {
      nextTurnIndex = 0;
      cp.roundNumber += 1;
    }
    cp.turnIndex = nextTurnIndex;
    cp.activePlayerPosition = cp.colorOrder[nextTurnIndex] || 1;

    this.playSound('Brainiest_Bed2');
    console.log(`🎯 Chinh Phuc Turn Advanced. Round: ${cp.roundNumber}, TurnIdx: ${cp.turnIndex}, Active Player: ${cp.activePlayerPosition}`);
    if (this.onStateChange) this.onStateChange();
  }

  // GMĐT Methods
  public setGMDTStep(step: GMDTStep): void {
    const gmdt = this.state.chinh_phuc.gmdt;
    const oldStep = gmdt.step;
    gmdt.step = step;

    if (step === 'MAT_MA') {
      this.playSound('Brainiest_CodebreakerClue');
    } else if (step === 'GOI_Y') {
      this.stopSound('Brainiest_Bed1');
      this.playSound('Brainiest_CodebreakerClue');
    } else if (step === 'DEM_GIO') {
      gmdt.isTimerRunning = true;
      gmdt.timerStartedAt = Date.now();
      gmdt.timerSecondsLeft = 60;
      this.playSound('Brainiest_CodebreakerTimer');
    } else if (step === 'DAP_AN' || step === 'KET_QUA') {
      if (gmdt.isTimerRunning || oldStep === 'DEM_GIO') {
        this.stopSound('Brainiest_CodebreakerTimer');
        this.playSound('Brainiest_CodebreakerEnd');
      }
      gmdt.isTimerRunning = false;

      if (step === 'KET_QUA') {
        const correctPlayers: { pos: number; time: number }[] = [];
        const incorrectPlayers: number[] = [];

        for (let p = 1; p <= 4; p++) {
          const prog = gmdt.playerProgress[p];
          if (prog && prog.isCorrect) {
            correctPlayers.push({ pos: p, time: prog.timeTakenMs || 999999 });
          } else {
            incorrectPlayers.push(p);
          }
        }

        correctPlayers.sort((a, b) => a.time - b.time);
        incorrectPlayers.sort((a, b) => a - b);

        const ranks: { position: number; rank: 1 | 2 | 3 | 4; timeTakenMs?: number | null }[] = [];
        let rankCounter = 1;
        for (const cp of correctPlayers) {
          ranks.push({ position: cp.pos, rank: rankCounter as 1|2|3|4, timeTakenMs: cp.time });
          rankCounter++;
        }
        for (const p of incorrectPlayers) {
          ranks.push({ position: p, rank: rankCounter as 1|2|3|4, timeTakenMs: null });
          rankCounter++;
        }

        gmdt.ranks = ranks;
        this.setChinhPhucColorMethod('GMDT');
      }
    }

    if (this.onStateChange) this.onStateChange();
  }

  public submitGMDTChar(position: number, inputChars: string[]): void {
    const gmdt = this.state.chinh_phuc.gmdt;
    if (!gmdt.playerProgress[position]) {
      gmdt.playerProgress[position] = { inputChars: [], isCorrect: null, timeTakenMs: null, submittedAt: null };
    }

    const prog = gmdt.playerProgress[position];
    prog.inputChars = inputChars;

    const userRaw = inputChars.join('').trim().toUpperCase();
    const correctRaw = gmdt.dapAnDung.trim().toUpperCase();

    const normUser = userRaw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
    const normCorrect = correctRaw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');

    if (normUser === normCorrect && normUser.length > 0) {
      if (!prog.isCorrect) {
        prog.isCorrect = true;
        prog.timeTakenMs = Date.now() - (gmdt.timerStartedAt || Date.now());
        prog.submittedAt = Date.now();
        this.playSound('CorrectAnswer');

        const solvedCount = Object.values(gmdt.playerProgress).filter(p => p.isCorrect).length;
        if (solvedCount >= 3) {
          gmdt.isTimerRunning = false;
          this.stopSound('Brainiest_CodebreakerTimer');
          this.playSound('Brainiest_CodebreakerEnd');
          this.setGMDTStep('DAP_AN');
        }
      }
    } else if (normUser.length === gmdt.matMa.length) {
      prog.isCorrect = false;
      this.playSound('WrongAnswer');
    }

    if (this.onStateChange) this.onStateChange();
  }

  // ==========================================
  // --- ĐẤU TRÍ (UNIVERSITY CHALLENGE) METHODS ---
  // ==========================================

  public setDauTriConfig(config: {
    endRule?: DauTriEndRule;
    maxQuestions?: number;
    timeLimitMinutes?: number;
    targetScore?: number;
    bonusQuestionsPerPack?: 1 | 2 | 3;
  }): void {
    const dt = this.state.dau_tri;
    if (config.endRule !== undefined) dt.endRule = config.endRule;
    if (config.maxQuestions !== undefined) dt.maxQuestions = Math.max(1, Math.min(25, config.maxQuestions));
    if (config.targetScore !== undefined) {
      dt.targetScore = Math.max(10, Math.min(500, config.targetScore));
      if (dt.status === 'PLAYING') {
        this.checkDauTriScoreLimit();
      }
    }
    if (config.timeLimitMinutes !== undefined) {
      const clampedMins = Math.max(10, Math.min(30, config.timeLimitMinutes));
      dt.timeLimitSeconds = clampedMins * 60;
      dt.overallSecondsLeft = clampedMins * 60;
      dt.overallTotalSeconds = clampedMins * 60;
    }
    if (config.bonusQuestionsPerPack !== undefined) {
      dt.bonusQuestionsPerPack = config.bonusQuestionsPerPack;
    }
    console.log(`🧠 Dau Tri config updated:`, config);
    if (this.onStateChange) this.onStateChange();
  }

  public checkDauTriScoreLimit(): boolean {
    const dt = this.state.dau_tri;
    if (dt.endRule !== 'SCORE_LIMIT' || dt.status !== 'PLAYING') return false;
    const target = dt.targetScore || 100;
    for (let pos = 1; pos <= 4; pos++) {
      const p = this.state.players[pos as 1 | 2 | 3 | 4];
      if (p && p.score >= target) {
        console.log(`🏆 Player ${pos} reached or exceeded target score (${p.score} >= ${target})! Ending Dau Tri round with UC_End.`);
        this.endDauTriRound();
        return true;
      }
    }
    return false;
  }

  public prepareDauTri(): void {
    this.state.currentRound = 'DAU_TRI';
    if (!this.state.dau_tri) {
      this.state.dau_tri = createDefaultDauTriState();
    }
    this.state.dau_tri.status = 'READY';
    this.playSound('UC_Begin');
    console.log('🎵 Dau Tri Preparation Started (UC_Begin played)');
    if (this.onStateChange) this.onStateChange();
  }

  public startDauTriRound(): void {
    const dt = this.state.dau_tri;
    dt.status = 'PLAYING';
    dt.stage = 'MAIN_QUESTION';
    dt.currentMainQuestionIndex = 0;
    dt.bonusPacksQueueIndex = 0;
    dt.usedBonusPackIndices = [];
    dt.threeMinWarningPlayed = false;
    dt.reminderPlayed = false;
    dt.mainQuestionAnsweredCorrectlyBy = null;
    dt.activeBonusPack = null;
    dt.activeBonusPlayerPosition = null;

    this.stopDauTriOverallTimer();
    this.stopDauTriBonusTimer();

    if (dt.endRule === 'TIME_LIMIT') {
      dt.overallSecondsLeft = dt.timeLimitSeconds;
      dt.overallTotalSeconds = dt.timeLimitSeconds;
      dt.isOverallTimerRunning = true;
      this.startDauTriOverallTimer();
    }

    this.startDauTriMainQuestion(0);
    console.log(`🚀 Dau Tri Round Started! (End Rule: ${dt.endRule}) - No music played.`);
    if (this.onStateChange) this.onStateChange();
  }

  public startDauTriMainQuestion(index?: number): void {
    const dt = this.state.dau_tri;
    if (index !== undefined) {
      // Check question limit termination (đã đi qua tối đa số câu hỏi quy định)
      if (dt.endRule === 'QUESTIONS_LIMIT' && index >= dt.maxQuestions) {
        console.log(`🏁 Reached question limit (${dt.maxQuestions}). Ending round with UC_End.`);
        this.endDauTriRound();
        return;
      }

      // Check 25 questions or bank exhaustion (đi qua hết 25 câu)
      const questionsCount = this.matchQuestions?.dau_tri?.cau_hoi?.length || 25;
      if (index >= 25 || index >= questionsCount) {
        console.log(`🏁 Reached 25 questions or bank exhausted (${index}). Ending round with UC_End.`);
        this.endDauTriRound();
        return;
      }

      dt.currentMainQuestionIndex = index;
    }
    dt.stage = 'MAIN_QUESTION';
    dt.isMainStarted = true;

    // UC_Reminder: phát khi còn lại 3 câu hỏi chính (chuyển sang câu thứ 23 hoặc N-2 đối với chế độ giới hạn câu hỏi)
    if (!dt.reminderPlayed) {
      const triggerIndex = dt.endRule === 'QUESTIONS_LIMIT' ? (dt.maxQuestions - 3) : 22;
      const upperLimit = dt.endRule === 'QUESTIONS_LIMIT' ? dt.maxQuestions : 25;
      if (dt.currentMainQuestionIndex >= triggerIndex && dt.currentMainQuestionIndex < upperLimit) {
        dt.reminderPlayed = true;
        this.playSound('UC_Reminder');
        console.log(`⚠️ UC_Reminder triggered in Dau Tri (question #${dt.currentMainQuestionIndex + 1}, 3 questions remaining)!`);
      }
    }

    // Check media on current question
    const questions = this.matchQuestions?.dau_tri?.cau_hoi || [];
    const currentQ = questions[dt.currentMainQuestionIndex];
    const hasMedia = !!(currentQ?.media && currentQ?.media?.url);

    // Đối với câu hỏi có hình ảnh/video/âm thanh: câu hỏi được tự động hiển thị trên màn hình
    // Riêng video/âm thanh chỉ phát khi controller bấm nút phát
    dt.isMainQuestionRevealed = hasMedia;
    this.pauseMedia(); // Stop/pause any media initially

    dt.mainQuestionAnsweredCorrectlyBy = null;
    dt.buzzerLocked = false;
    dt.buzzedPlayer = null;
    dt.buzzedTimestamp = null;
    dt.buzzedBeforeReveal = false;
    dt.foulOrWrongPlayers = [];

    // Global buzzer state
    this.state.buzzerState = 'OPEN';
    this.state.buzzedPlayer = null;
    this.state.buzzedTimestamp = null;

    console.log(`❓ Dau Tri Main Question #${dt.currentMainQuestionIndex + 1} started (Has Media: ${hasMedia}, Auto-revealed: ${dt.isMainQuestionRevealed}). Buzzer OPEN.`);
    if (this.onStateChange) this.onStateChange();
  }

  public revealDauTriMainQuestion(): void {
    const dt = this.state.dau_tri;
    dt.isMainQuestionRevealed = true;
    console.log(`👁️ Dau Tri Main Question revealed on all screens. (Subsequent wrong buzz: no -5 penalty)`);
    if (this.onStateChange) this.onStateChange();
  }

  public buzzDauTri(position: number): void {
    const dt = this.state.dau_tri;
    if (dt.status !== 'PLAYING' || dt.stage !== 'MAIN_QUESTION' || dt.buzzerLocked) {
      return;
    }
    if (dt.foulOrWrongPlayers.includes(position)) {
      console.log(`⛔ Player ${position} lost turn on current main question.`);
      return;
    }

    if (dt.buzzedPlayer === null) {
      dt.buzzedPlayer = position;
      dt.buzzedTimestamp = Date.now();
      dt.buzzerLocked = true;
      dt.buzzedBeforeReveal = !dt.isMainQuestionRevealed;

      this.state.buzzerState = 'BUZZED';
      this.state.buzzedPlayer = position;
      this.state.buzzedTimestamp = dt.buzzedTimestamp;

      this.playSound('DauTri_Buzz');
      console.log(`🔔 Player ${position} buzzed on Dau Tri Main Question #${dt.currentMainQuestionIndex + 1} (Before reveal: ${dt.buzzedBeforeReveal})`);

      this.addLog({
        round: 'DAU_TRI',
        player: position,
        type: 'BUZZER',
        action: 'Bấm chuông Đấu Trí',
        detail: `Thí sinh ${this.state.players[position]?.name || 'Bàn ' + position} bấm chuông câu chính #${dt.currentMainQuestionIndex + 1}${dt.buzzedBeforeReveal ? ' (trước khi hiện câu hỏi)' : ''}.`
      });

      if (this.onStateChange) this.onStateChange();
    }
  }

  public gradeDauTriMainAnswer(isCorrect: boolean): void {
    const dt = this.state.dau_tri;
    const buzzed = dt.buzzedPlayer;
    if (!buzzed) return;

    const questions = this.matchQuestions?.dau_tri?.cau_hoi || [];
    const currentQ = questions[dt.currentMainQuestionIndex];
    const hasMedia = !!(currentQ?.media && currentQ?.media?.url);

    // Sau khi chấm đúng/sai, câu hỏi sẽ được hiển thị trên màn hình
    dt.isMainQuestionRevealed = true;

    if (isCorrect) {
      // Correct: +10 points
      const oldScore = this.state.players[buzzed]?.score || 0;
      if (this.state.players[buzzed]) {
        this.state.players[buzzed].score += 10;
      }
      dt.mainQuestionAnsweredCorrectlyBy = buzzed;
      dt.buzzerLocked = true;
      this.state.buzzerState = 'LOCKED';

      this.playSound('UC_CorrectMain');

      this.addLog({
        round: 'DAU_TRI',
        player: buzzed,
        type: 'SCORE',
        action: 'Đúng câu chính (+10đ)',
        detail: `Thí sinh ${this.state.players[buzzed]?.name || 'Bàn ' + buzzed} trả lời ĐÚNG câu chính #${dt.currentMainQuestionIndex + 1}. Điểm: ${oldScore}đ → ${this.state.players[buzzed]?.score}đ`,
        scoreBefore: oldScore,
        scoreAfter: this.state.players[buzzed]?.score,
        scoreDelta: 10
      });

      // If score limit is reached, end round immediately
      if (this.checkDauTriScoreLimit()) {
        if (this.onStateChange) this.onStateChange();
        return;
      }

      // Retrieve bonus pack:
      // - Nếu câu hỏi chính là câu hỏi có media và thí sinh trả lời đúng:
      //   Luôn lấy gói câu hỏi thưởng nằm ở vị trí tương ứng với câu hỏi chính đó (dt.currentMainQuestionIndex).
      // - Nếu câu hỏi chính không có media:
      //   Tiếp tục lấy danh sách gói thưởng theo thứ tự FIFO như bình thường, bỏ qua các gói đã được dùng trước đó.
      if (!dt.usedBonusPackIndices) {
        dt.usedBonusPackIndices = [];
      }

      let chosenPackIndex: number;

      if (hasMedia) {
        // Luôn lấy gói thưởng tại vị trí của câu hỏi chính có media này
        chosenPackIndex = dt.currentMainQuestionIndex;
      } else {
        // Lấy theo danh sách gói thưởng bình thường (FIFO), bỏ qua các gói đã sử dụng
        let nextIndex = dt.bonusPacksQueueIndex;
        while (dt.usedBonusPackIndices.includes(nextIndex) && nextIndex < questions.length) {
          nextIndex++;
        }
        chosenPackIndex = nextIndex < questions.length ? nextIndex : dt.bonusPacksQueueIndex;
        dt.bonusPacksQueueIndex = chosenPackIndex + 1;
      }

      // Đánh dấu gói này đã được sử dụng
      if (!dt.usedBonusPackIndices.includes(chosenPackIndex)) {
        dt.usedBonusPackIndices.push(chosenPackIndex);
      }

      // Đảm bảo con trỏ danh sách gói thưởng bình thường (bonusPacksQueueIndex)
      // không trỏ vào gói đã từng sử dụng
      while (dt.usedBonusPackIndices.includes(dt.bonusPacksQueueIndex) && dt.bonusPacksQueueIndex < questions.length) {
        dt.bonusPacksQueueIndex++;
      }

      const targetQuestion = questions[chosenPackIndex] || questions[0];
      
      dt.activeBonusPack = targetQuestion?.goi_thuong || {
        chu_de: `Gói câu hỏi thưởng ${chosenPackIndex + 1}`,
        cau_hoi: [
          { noi_dung: 'Câu hỏi thưởng 1', dap_an_dung: 'Đáp án 1' },
          { noi_dung: 'Câu hỏi thưởng 2', dap_an_dung: 'Đáp án 2' },
          { noi_dung: 'Câu hỏi thưởng 3', dap_an_dung: 'Đáp án 3' }
        ]
      };
      dt.activeBonusPlayerPosition = buzzed;

      // Giữ nguyên hiển thị câu hỏi chính (dt.stage = 'MAIN_QUESTION').
      // Chủ đề gói thưởng được hiển thị khi controller nhấn nút (showDauTriBonusTheme).
      dt.stage = 'MAIN_QUESTION';
      dt.currentBonusQuestionIndex = 0;
      dt.isBonusQuestionRevealed = false;
      dt.bonusTimerSecondsLeft = 10;
      dt.isBonusTimerRunning = false;

      console.log(`✅ Player ${buzzed} answered correctly (+10 pts). Bonus pack #${chosenPackIndex + 1} prepared ("${dt.activeBonusPack.chu_de}") [Media question: ${hasMedia}]. Next normal queue index: ${dt.bonusPacksQueueIndex}.`);
    } else {
      // Incorrect
      // Riêng những câu hỏi có media, không áp dụng luật trừ 5 điểm
      const oldScore = this.state.players[buzzed]?.score || 0;
      let delta = 0;
      if (!hasMedia && dt.buzzedBeforeReveal) {
        if (this.state.players[buzzed]) {
          this.state.players[buzzed].score -= 5;
          delta = -5;
        }
        console.log(`❌ Player ${buzzed} answered WRONG BEFORE REVEAL (-5 pts).`);
      } else {
        console.log(`❌ Player ${buzzed} answered WRONG (0 pts penalty${hasMedia ? ' - Media question exempt' : ''}).`);
      }

      this.addLog({
        round: 'DAU_TRI',
        player: buzzed,
        type: 'SCORE',
        action: delta < 0 ? 'Sai trước khi hiện (-5đ)' : 'Sai câu chính (0đ)',
        detail: `Thí sinh ${this.state.players[buzzed]?.name || 'Bàn ' + buzzed} trả lời SAI câu chính #${dt.currentMainQuestionIndex + 1}${delta < 0 ? ' (bấm trước khi hiện, phạt -5đ)' : ''}. Điểm: ${oldScore}đ → ${this.state.players[buzzed]?.score}đ`,
        scoreBefore: oldScore,
        scoreAfter: this.state.players[buzzed]?.score,
        scoreDelta: delta
      });

      this.playSound('UC_Wrong');

      dt.foulOrWrongPlayers.push(buzzed);
      dt.buzzedPlayer = null;
      dt.buzzedTimestamp = null;
      this.state.buzzedPlayer = null;
      this.state.buzzedTimestamp = null;

      // Check if all players have attempted
      if (dt.foulOrWrongPlayers.length >= 4) {
        dt.buzzerLocked = true;
        this.state.buzzerState = 'LOCKED';
        console.log(`🔒 All 4 players missed question #${dt.currentMainQuestionIndex + 1}. Buzzer locked.`);
      } else {
        // Unlock buzzer for remaining players
        dt.buzzerLocked = false;
        this.state.buzzerState = 'OPEN';
        console.log(`🔓 Buzzer re-opened for remaining players on question #${dt.currentMainQuestionIndex + 1}.`);
      }
    }

    if (this.onStateChange) this.onStateChange();
  }

  public skipDauTriMainQuestion(): void {
    const dt = this.state.dau_tri;
    dt.isMainQuestionRevealed = true;
    dt.buzzerLocked = true;
    dt.buzzedPlayer = null;
    this.state.buzzerState = 'LOCKED';
    this.state.buzzedPlayer = null;
    console.log(`⏭️ Dau Tri Main Question #${dt.currentMainQuestionIndex + 1} skipped. Buzzer locked. Bonus queue intact.`);
    if (this.onStateChange) this.onStateChange();
  }

  public nextDauTriMainQuestion(): void {
    const dt = this.state.dau_tri;
    const nextIdx = dt.currentMainQuestionIndex + 1;

    // 1. Check Question Limit termination (đã đi qua tối đa số câu hỏi quy định)
    if (dt.endRule === 'QUESTIONS_LIMIT' && nextIdx >= dt.maxQuestions) {
      console.log(`🏁 Reached question limit (${dt.maxQuestions}). Ending round with UC_End.`);
      this.endDauTriRound();
      return;
    }

    // 2. Check Score Limit termination (có thí sinh vượt qua mốc điểm)
    if (this.checkDauTriScoreLimit()) {
      return;
    }

    // 3. Check Bank Exhaustion / 25 questions (đi qua hết 25 câu)
    const questionsCount = this.matchQuestions?.dau_tri?.cau_hoi?.length || 25;
    if (nextIdx >= 25 || nextIdx >= questionsCount) {
      console.log(`🏁 All questions in bank or 25 questions exhausted (${nextIdx}). Ending round with UC_End.`);
      this.endDauTriRound();
      return;
    }

    this.startDauTriMainQuestion(nextIdx);
  }

  public showDauTriBonusTheme(): void {
    const dt = this.state.dau_tri;
    dt.stage = 'BONUS_THEME';
    dt.isBonusQuestionRevealed = false;
    this.stopDauTriBonusTimer();
    console.log(`🎁 Displaying Bonus Theme: "${dt.activeBonusPack?.chu_de}"`);
    if (this.onStateChange) this.onStateChange();
  }

  public showDauTriBonusQuestion(questionIndex: number): void {
    const dt = this.state.dau_tri;
    dt.stage = 'BONUS_QUESTION';
    dt.currentBonusQuestionIndex = questionIndex;
    dt.isBonusQuestionRevealed = true;
    dt.bonusTimerSecondsLeft = 10;
    dt.isBonusTimerRunning = false;
    this.stopDauTriBonusTimer();
    console.log(`🎁 Displaying Bonus Question #${questionIndex + 1}`);
    if (this.onStateChange) this.onStateChange();
  }

  public startDauTriBonusTimer(): void {
    const dt = this.state.dau_tri;
    this.stopDauTriBonusTimer();
    dt.bonusTimerSecondsLeft = 10;
    dt.isBonusTimerRunning = true;
    this.playSound('DauTri_10s_Timer');

    this.dauTriBonusTimerInterval = setInterval(() => {
      if (dt.bonusTimerSecondsLeft > 0) {
        dt.bonusTimerSecondsLeft--;
        if (this.onStateChange) this.onStateChange();
      }
      if (dt.bonusTimerSecondsLeft <= 0) {
        this.stopDauTriBonusTimer();
        dt.isBonusTimerRunning = false;
        if (this.onStateChange) this.onStateChange();
      }
    }, 1000);

    if (this.onStateChange) this.onStateChange();
  }

  public stopDauTriBonusTimer(): void {
    if (this.dauTriBonusTimerInterval) {
      clearInterval(this.dauTriBonusTimerInterval);
      this.dauTriBonusTimerInterval = null;
    }
    this.state.dau_tri.isBonusTimerRunning = false;
  }

  public gradeDauTriBonusAnswer(isCorrect: boolean): void {
    const dt = this.state.dau_tri;
    this.stopDauTriBonusTimer();

    const activePlayer = dt.activeBonusPlayerPosition;
    if (isCorrect) {
      const oldScore = activePlayer ? this.state.players[activePlayer]?.score || 0 : 0;
      if (activePlayer && this.state.players[activePlayer]) {
        this.state.players[activePlayer].score += 5;
      }
      this.playSound('UC_CorrectBonus');

      this.addLog({
        round: 'DAU_TRI',
        player: activePlayer || undefined,
        type: 'SCORE',
        action: 'Đúng câu thưởng (+5đ)',
        detail: `Thí sinh ${activePlayer ? this.state.players[activePlayer]?.name || 'Bàn ' + activePlayer : ''} trả lời ĐÚNG câu hỏi thưởng #${dt.currentBonusQuestionIndex + 1}. Điểm: ${oldScore}đ → ${activePlayer ? this.state.players[activePlayer]?.score : 0}đ`,
        scoreBefore: oldScore,
        scoreAfter: activePlayer ? this.state.players[activePlayer]?.score : 0,
        scoreDelta: 5
      });

      console.log(`✅ Bonus Question #${dt.currentBonusQuestionIndex + 1} CORRECT (+5 pts for Player ${activePlayer})`);
      if (this.checkDauTriScoreLimit()) {
        if (this.onStateChange) this.onStateChange();
        return;
      }
    } else {
      this.playSound('UC_Wrong');

      this.addLog({
        round: 'DAU_TRI',
        player: activePlayer || undefined,
        type: 'ANSWER',
        action: 'Sai câu thưởng (0đ)',
        detail: `Thí sinh ${activePlayer ? this.state.players[activePlayer]?.name || 'Bàn ' + activePlayer : ''} trả lời SAI câu hỏi thưởng #${dt.currentBonusQuestionIndex + 1}.`
      });

      console.log(`❌ Bonus Question #${dt.currentBonusQuestionIndex + 1} WRONG (0 pts)`);
    }

    if (this.onStateChange) this.onStateChange();
  }

  private startDauTriOverallTimer(): void {
    this.stopDauTriOverallTimer();
    const dt = this.state.dau_tri;

    this.dauTriOverallTimerInterval = setInterval(() => {
      if (dt.overallSecondsLeft > 0) {
        dt.overallSecondsLeft--;

        // UC_Reminder: Phát khi còn 3:03 giây trên đồng hồ (183s)
        if (dt.overallSecondsLeft <= 183 && !dt.reminderPlayed) {
          dt.reminderPlayed = true;
          this.playSound('UC_Reminder');
          console.log(`⚠️ UC_Reminder triggered in Dau Tri (3:03 remaining)!`);
        }

        // UC_Last3Minutes: Phát khi còn 3 phút trên đồng hồ (180s), dừng General_Ambience
        if (dt.overallSecondsLeft <= 180 && !dt.threeMinWarningPlayed) {
          dt.threeMinWarningPlayed = true;
          this.stopSound('General_Ambience');
          this.playSound('UC_Last3Minutes');
          console.log(`⚠️ UC_Last3Minutes triggered in Dau Tri (3:00 remaining)! General_Ambience stopped.`);
        }

        if (this.onStateChange) this.onStateChange();
      }

      // UC_End: Phát khi hết thời gian
      if (dt.overallSecondsLeft <= 0) {
        this.stopDauTriOverallTimer();
        dt.isOverallTimerRunning = false;
        console.log(`⏰ Time Expired in Dau Tri! Ending round immediately.`);
        this.endDauTriRound();
      }
    }, 1000);
  }

  private stopDauTriOverallTimer(): void {
    if (this.dauTriOverallTimerInterval) {
      clearInterval(this.dauTriOverallTimerInterval);
      this.dauTriOverallTimerInterval = null;
    }
    this.state.dau_tri.isOverallTimerRunning = false;
  }

  public endDauTriRound(): void {
    const dt = this.state.dau_tri;
    if (dt.status === 'ENDED') {
      return;
    }
    dt.status = 'ENDED';
    dt.buzzerLocked = true;
    this.state.buzzerState = 'LOCKED';
    this.stopDauTriOverallTimer();
    this.stopDauTriBonusTimer();
    this.stopSound('General_Ambience');
    this.stopSound('DauTri_10s_Timer');
    this.playSound('UC_End');
    console.log(`🏆 Dau Tri Round Ended (UC_End played).`);
    if (this.onStateChange) this.onStateChange();
  }

  public resetDauTriRound(): void {
    this.stopDauTriOverallTimer();
    this.stopDauTriBonusTimer();
    this.stopSound('General_Ambience');
    this.state.dau_tri = createDefaultDauTriState();
    this.state.buzzerState = 'LOCKED';
    this.state.buzzedPlayer = null;
    console.log(`🔄 Dau Tri Round Reset to initial config.`);
    if (this.onStateChange) this.onStateChange();
  }
}
