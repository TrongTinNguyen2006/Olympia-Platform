import { Server, Socket } from 'socket.io';
import { GameManager } from './GameManager.js';
import { SocketEvent, MatchDbModel, GameRound, KhoiDongState, VeDichPresetPackage, getTangTocImprovedPoints, ChinhPhucQuestion, GMDTStep } from '../../types.js';
import fs from 'fs';
import path from 'path';
import { MatchModel } from '../models/Match.js';
import { DEFAULT_MOCK_MATCH } from '../config/seedData.js';

const ADMIN_TOKEN = 'OLYMPIA_ADMIN_SECRET_KEY'; // Admin/MC session token
const ROOM_PREFIX = 'match:';

function checkAndPlayKhoiDongQuestionSound(manager: GameManager) {
  const state = manager.getMatchState();
  if (state.currentRound !== 'KHOI_DONG' || !state.khoi_dong.isStarted) return;

  const subRound = state.khoi_dong.subRound;
  const startIdx = state.khoi_dong.startQuestionIndex ?? 0;
  const currentIdx = state.khoi_dong.currentQuestionIndex ?? 0;
  const countAnswered = state.khoi_dong.countAnswered ?? 0;

  // Calculate relative question position in turn (1-indexed)
  const relativeQ = (currentIdx - startIdx) + 1;

  const timerDuration = subRound === 'INDIVIDUAL' 
    ? state.khoi_dong.individualTimerDuration 
    : state.khoi_dong.collectiveTimerDuration;
  
  const maxQuestions = subRound === 'INDIVIDUAL'
    ? state.khoi_dong.individualMaxQuestions
    : state.khoi_dong.collectiveMaxQuestions;

  // 1. FOR TURNS WITH TIME LIMIT (30/45/60/90s)
  if (timerDuration && timerDuration > 0) {
    if (relativeQ === 1) {
      if (timerDuration === 30) manager.playSound('Warm-up_30Seconds');
      else if (timerDuration === 45) manager.playSound('Warm-up_45Seconds');
      else if (timerDuration === 60) manager.playSound('Warm-up_60Seconds');
      else if (timerDuration === 90) manager.playSound('Warm-up_90Seconds');
      else manager.playSound('Warm-up_60Seconds');
    }
    return;
  }

  // 2. FOR TURNS WITHOUT TIME LIMIT (NO TIMER)
  // Logic: N questions total
  // Warm-up_MainFirstHalf: question 1 to ceil(N/2)
  // Warm-up_MainLastHalf: question ceil(N/2)+1 to N-1
  // Warm-up_MainFinalQuestion: question N
  if (maxQuestions && maxQuestions > 0) {
    const N = maxQuestions;
    const firstHalfLimit = Math.ceil(N / 2);

    if (N === 1) {
      if (relativeQ === 1) manager.playSound('Warm-up_MainFinalQuestion');
    } else {
      if (relativeQ === 1) {
        manager.playSound('Warm-up_MainFirstHalf');
      } else if (relativeQ === firstHalfLimit + 1 && relativeQ < N) {
        manager.playSound('Warm-up_MainLastHalf');
      } else if (relativeQ === N && countAnswered < N) {
        manager.playSound('Warm-up_MainFinalQuestion');
      }
    }
  } else {
    // Unlimited questions, no time limit
    if (relativeQ === 1) {
      manager.playSound('Warm-up_MainFirstHalf');
    }
  }
}

export function setupSocketHandlers(io: Server) {
  const manager = GameManager.getInstance();
  manager.onStateChange = () => {
    io.emit(SocketEvent.STATE_SYNC, manager.getMatchState());
  };

  io.on(SocketEvent.CONNECTION, (socket: Socket) => {
    let currentMatchCode: string | null = null;
    let playerPosition: 1 | 2 | 3 | 4 | null = null;

    console.log(`🔌 New client socket connected: ${socket.id}`);

    // Synchronize current state to newly connected client
    socket.emit(SocketEvent.STATE_SYNC, manager.getMatchState());
    const activeQuestions = manager.getMatchQuestions();
    if (activeQuestions) {
      socket.emit(SocketEvent.MATCH_QUESTIONS_UPDATED, {
        matchCode: manager.getMatchState().matchCode,
        matchQuestions: activeQuestions
      });
    }

    // --- 1. ADMIN & AUTH ACTIONS ---

    socket.on(SocketEvent.ADMIN_AUTH, (data: { token: string; matchCode: string }, callback: (res: { success: boolean }) => void) => {
      if (data.token === ADMIN_TOKEN) {
        currentMatchCode = data.matchCode;
        const roomId = `${ROOM_PREFIX}${currentMatchCode}`;
        socket.join(roomId);
        console.log(`🔑 Admin authorized for match: ${data.matchCode}`);
        callback({ success: true });
        socket.emit(SocketEvent.STATE_SYNC, manager.getMatchState());
      } else {
        callback({ success: false });
      }
    });

    socket.on(SocketEvent.ADMIN_LOAD_MATCH, async (data: { matchCode: string; matchData?: MatchDbModel }) => {
      const code = data.matchCode.trim().toUpperCase();
      let matchData = data.matchData;

      if (!matchData) {
        // 1. Try reading from matches_db.json
        const DB_FILE = path.join(process.cwd(), 'matches_db.json');
        if (fs.existsSync(DB_FILE)) {
          try {
            const raw = fs.readFileSync(DB_FILE, 'utf8');
            const parsed = JSON.parse(raw);
            if (parsed[code]) {
              matchData = parsed[code];
            }
          } catch (e) {
            console.error('Error reading matches_db.json inside socket handler:', e);
          }
        }

        // 2. Try loading from MongoDB if not found in local file
        if (!matchData && process.env.MONGO_URI && MatchModel.db?.readyState === 1) {
          try {
            const dbMatch = await (MatchModel as any).findOne({ matchCode: code });
            if (dbMatch) {
              matchData = dbMatch.toObject ? dbMatch.toObject() : dbMatch;
            }
          } catch (err) {
            console.warn('MongoDB query in socket handler failed:', err);
          }
        }
      }

      if (!matchData) {
        console.error(`❌ Could not load questions for match code ${code} (not found)`);
        socket.emit(SocketEvent.ERROR, { message: `Không tìm thấy câu hỏi cho mã trận đấu ${code}. Vui lòng tạo đề trước trong Kho Đề.` });
        return;
      }

      // Setup the entire state machine on memory
      manager.initGame(code, matchData);
      currentMatchCode = code;

      // Broadcast new state and loaded questions to everyone
      io.emit(SocketEvent.STATE_SYNC, manager.getMatchState());
      io.emit(SocketEvent.MATCH_QUESTIONS_UPDATED, {
        matchCode: code,
        matchQuestions: manager.getMatchQuestions()
      });
      console.log(`📦 Loaded Match ${code} successfully and broadcast to all.`);
    });

    let collectiveBuzzerTimeout: NodeJS.Timeout | null = null;

    const triggerCollectiveBuzzerOpen = () => {
      const state = manager.getMatchState();
      if (collectiveBuzzerTimeout) {
        clearTimeout(collectiveBuzzerTimeout);
        collectiveBuzzerTimeout = null;
      }

      if (state.currentRound === 'KHOI_DONG' && state.khoi_dong.subRound === 'COLLECTIVE') {
        manager.lockBuzzer();
        const delay = state.khoi_dong.collectiveBuzzerDelay ?? 3;
        const isO22 = state.khoi_dong.collectiveRule === 'O22';

        if (delay <= 0) {
          manager.openBuzzer();
          state.khoi_dong.timerType = null;
          syncStateToRoom();
          return;
        }

        if (isO22) {
          // O22: overall round timer is running, use non-blocking timeout for buzzer delay
          state.khoi_dong.timerType = null;
          collectiveBuzzerTimeout = setTimeout(() => {
            const current = manager.getMatchState();
            if (current.currentRound === 'KHOI_DONG' && current.khoi_dong.subRound === 'COLLECTIVE') {
              manager.openBuzzer();
              console.log(`🔔 Collective O22 buzzer automatically opened after ${delay}s delay!`);
              syncStateToRoom();
            }
          }, delay * 1000);
        } else {
          // O23: per-question timer countdown
          state.khoi_dong.timerType = 'FIRST_5S';
          manager.startTimer(
            delay,
            () => {
              syncStateToRoom();
            },
            () => {
              const currentState = manager.getMatchState();
              if (currentState.currentRound === 'KHOI_DONG' && currentState.khoi_dong.subRound === 'COLLECTIVE') {
                manager.openBuzzer();
                currentState.khoi_dong.timerType = null;
                console.log(`🔔 Collective O23 buzzer automatically opened after ${delay}s delay!`);
              }
              syncStateToRoom();
            }
          );
        }
      }
    };

    socket.on(SocketEvent.ADMIN_KICK_PLAYER, (data: { position: 1 | 2 | 3 | 4 }) => {
      const state = manager.getMatchState();
      const kickedPlayer = state.players[data.position];
      
      if (kickedPlayer && kickedPlayer.socketId) {
        const playerSocket = io.sockets.sockets.get(kickedPlayer.socketId);
        if (playerSocket) {
          playerSocket.emit(SocketEvent.ERROR, { message: 'Bạn đã bị Admin mời ra khỏi trận đấu!' });
          playerSocket.leave(`${ROOM_PREFIX}${state.matchCode}`);
        }
      }

      manager.kickPlayer(data.position);
      syncStateToRoom();
    });

    socket.on(SocketEvent.ADMIN_UPDATE_SCORE, (data: { position: 1 | 2 | 3 | 4; score: number }) => {
      if (data && typeof data.position === 'number' && typeof data.score === 'number') {
        manager.updatePlayerScore(data.position, data.score);
        syncStateToRoom();
      }
    });

    socket.on(SocketEvent.ADMIN_UPDATE_TOURNAMENT_NAME, (data: { tournamentName: string }) => {
      if (data && data.tournamentName !== undefined) {
        manager.setTournamentName(data.tournamentName);
        syncStateToRoom();
      }
    });

    socket.on(SocketEvent.ADMIN_TOGGLE_OVERLAY, (data?: { visible?: boolean }) => {
      const state = manager.getMatchState();
      if (data?.visible !== undefined) {
        state.overlayVisible = data.visible;
      } else {
        state.overlayVisible = state.overlayVisible === false ? true : false;
      }
      syncStateToRoom();
    });

    // --- AUDIO CONTROLS (ADMIN) ---

    socket.on(SocketEvent.ADMIN_PLAY_SOUND, (data: { soundId: string }) => {
      if (data?.soundId) {
        manager.playSound(data.soundId);
        if (data.soundId === 'Additional_Buzz' || data.soundId === 'General_Buzz') {
          manager.pauseSound('Additional_15Seconds');
        }
        syncStateToRoom();
      }
    });

    socket.on(SocketEvent.ADMIN_STOP_ALL_SOUNDS, () => {
      manager.stopAllSounds();
      syncStateToRoom();
    });

    socket.on(SocketEvent.ADMIN_UPDATE_AUDIO_CONFIG, (data: { volume: number; isMuted: boolean }) => {
      if (data && typeof data.volume === 'number' && typeof data.isMuted === 'boolean') {
        manager.updateAudioConfig(data.volume, data.isMuted);
        syncStateToRoom();
      }
    });

    socket.on(SocketEvent.ADMIN_UPDATE_ROUND_SETTINGS, (data: { settings: any }) => {
      if (data?.settings) {
        manager.updateRoundSettings(data.settings);
        syncStateToRoom();
      }
    });

    socket.on(SocketEvent.ADMIN_CLEAR_LOGS, () => {
      manager.clearLogs();
      syncStateToRoom();
    });

    socket.on(SocketEvent.CHINH_PHUC_CONFIG_GRID, (data: { mediumCount: number; hardCount: number }) => {
      manager.configureChinhPhucGrid(data.mediumCount, data.hardCount);
      syncStateToRoom();
    });

    socket.on(SocketEvent.CHINH_PHUC_TOGGLE_SYMBOLS_HIDDEN, (data?: { hidden?: boolean }) => {
      manager.toggleChinhPhucSymbolsHidden(data?.hidden);
      syncStateToRoom();
    });

    socket.on(SocketEvent.CHINH_PHUC_SET_AUTO_HIDE_SYMBOLS, (data: { autoHide: boolean }) => {
      manager.setChinhPhucAutoHideSymbols(data.autoHide);
      syncStateToRoom();
    });

    // --- 2. PLAYER LOGIC & JOIN EXPERIENCE ---

    socket.on(SocketEvent.PLAYER_JOIN, (data: { name: string; position: 1 | 2 | 3 | 4; matchCode: string }, callback: (res: { success: boolean; error?: string }) => void) => {
      const joinResult = manager.addPlayer(data.name, data.position, socket.id);
      
      if (joinResult.success) {
        currentMatchCode = data.matchCode;
        playerPosition = data.position;
        callback({ success: true });
        
        // Broadcast update to all
        io.emit(SocketEvent.PLAYER_JOIN_SUCCESS, { position: data.position, name: data.name });
        syncStateToRoom();
      } else {
        callback({ success: false, error: joinResult.error });
      }
    });

    // --- 3. CORE ROUND CONTROL ---

    socket.on(SocketEvent.CHANGE_ROUND, (data: { round: GameRound }) => {
      manager.changeRound(data.round);
      if (data.round === 'KHOI_DONG') {
        manager.playSound('Warm-up_Start');
      } else if (
        data.round !== 'DAU_TRI' &&
        data.round !== 'VCNV' &&
        data.round !== 'TANG_TOC' &&
        data.round !== 'VE_DICH' &&
        data.round !== 'CH_PHU' &&
        data.round !== 'MA_TRAN_KEP' &&
        data.round !== 'JEOPARDY' &&
        data.round !== 'CHINH_PHUC' &&
        data.round !== 'WAITING' &&
        data.round !== 'SUMMARY'
      ) {
        manager.playSound('start_round');
      }
      
      // Auto custom parameters based on round transitions
      const state = manager.getMatchState();
      
      // Only KHOI_DONG round auto-plays media; all other rounds must wait for Admin play trigger
      state.mediaControl.isPlaying = (data.round === 'KHOI_DONG');
      state.mediaControl.key = Date.now();

      if (data.round === 'KHOI_DONG') {
        state.khoi_dong.subRound = 'INDIVIDUAL';
        state.khoi_dong.currentPlayerIndex = null;
        state.khoi_dong.currentQuestionIndex = 0;
      } else if (data.round === 'VCNV') {
        state.vcnv.selectedRow = null;
        state.vcnv.cnvBuzzedPlayer = null;
        state.vcnv.cnvBuzzerLocked = false;
        state.vcnv.cnvSolved = false;
        manager.playSound('Obstacle_Start');
      } else if (data.round === 'TANG_TOC') {
        state.tang_toc.currentQuestionIndex = -1;
        state.tang_toc.answers = [];
        state.tang_toc.showAnswers = false;
        manager.playSound('Acceleration_Start');
      } else if (data.round === 'VE_DICH') {
        state.ve_dich.currentPlayerIndex = null;
        manager.playSound('Finish_Start');
      } else if (data.round === 'CH_PHU') {
        state.cau_hoi_phu.currentQuestionIndex = 0;
        state.cau_hoi_phu.buzzedPlayer = null;
        state.cau_hoi_phu.foulPlayers = [];
        state.cau_hoi_phu.incorrectPlayers = [];
        // Question Phu buzzer is open by default
        manager.openBuzzer();
        manager.playSound('Additional_Start');
      } else if (data.round === 'MA_TRAN_KEP') {
        manager.playSound('Gridlocked_Start');
      }
      
      syncStateToRoom();
    });

    socket.on(SocketEvent.NEXT_QUESTION, () => {
      const state = manager.getMatchState();

      // Reset media playback for the new question: auto-play ONLY for KHOI_DONG
      state.mediaControl.isPlaying = (state.currentRound === 'KHOI_DONG');
      state.mediaControl.key = Date.now();
      
      if (state.currentRound === 'KHOI_DONG') {
        const totalQs = manager.getMatchQuestions()?.khoi_dong?.cau_hoi?.length || 36;
        if (state.khoi_dong.subRound === 'INDIVIDUAL') {
          if (state.khoi_dong.currentQuestionIndex < totalQs - 1) {
            state.khoi_dong.currentQuestionIndex++;
          }
        } else {
          // Shift blockedNextQuestionPlayers to blockedThisQuestionPlayers for the new question
          state.khoi_dong.blockedThisQuestionPlayers = [...(state.khoi_dong.blockedNextQuestionPlayers || [])];
          state.khoi_dong.blockedNextQuestionPlayers = [];
          if (state.khoi_dong.currentQuestionIndex < totalQs - 1) {
            state.khoi_dong.currentQuestionIndex++;
            triggerCollectiveBuzzerOpen();
          }
        }
        checkAndPlayKhoiDongQuestionSound(manager);
      } else if (state.currentRound === 'TANG_TOC') {
        if (state.tang_toc.currentQuestionIndex < 3) {
          state.tang_toc.currentQuestionIndex++;
          state.tang_toc.answers = [];
          state.tang_toc.showAnswers = false;
          state.tang_toc.showExplanation = false;
          state.tang_toc.currentHintIndex = 0;
          state.tang_toc.buzzedPlayer = null;
          state.tang_toc.buzzedHintIndex = null;
          state.tang_toc.blockedPlayers = [];
          manager.resetTimer();
          manager.playSound('Acceleration_QuestionShow');
        }
      } else if (state.currentRound === 'VE_DICH') {
        const playerPos = state.ve_dich.currentPlayerIndex !== null ? (state.ve_dich.currentPlayerIndex + 1) as 1 | 2 | 3 | 4 : null;
        if (playerPos) {
          const turn = state.ve_dich.turns[playerPos];
          if (turn && turn.currentQuestionIndex < 2) {
            turn.currentQuestionIndex++;
            turn.starUsed = false;
            turn.claimBuzzerState = 'LOCKED';
            turn.claimBuzzerPlayer = null;
            turn.claimBuzzedTimestamp = null;
            turn.currentQuestionConfirmed = false;
            turn.starPenalized = false;
            manager.lockBuzzer();
            manager.resetTimer();
          }
        }
      } else if (state.currentRound === 'CH_PHU') {
        if (state.cau_hoi_phu.currentQuestionIndex < 24) {
          state.cau_hoi_phu.currentQuestionIndex++;
          state.cau_hoi_phu.buzzedPlayer = null;
          state.cau_hoi_phu.winnerPosition = null;
          state.cau_hoi_phu.foulPlayers = [];
          state.cau_hoi_phu.incorrectPlayers = [];
          state.cau_hoi_phu.questionRevealed = false;
          state.buzzedPlayer = null;
          state.buzzedTimestamp = null;
          if (state.cau_hoi_phu.buzzerMode === 'CONTINUOUS') {
            manager.openBuzzer();
          } else {
            manager.lockBuzzer();
          }
          manager.resetTimer();
        }
      }
      syncStateToRoom();
    });

    socket.on(SocketEvent.PREV_QUESTION, () => {
      const state = manager.getMatchState();

      // Reset media playback for the new question: auto-play ONLY for KHOI_DONG
      state.mediaControl.isPlaying = (state.currentRound === 'KHOI_DONG');
      state.mediaControl.key = Date.now();
      
      if (state.currentRound === 'KHOI_DONG') {
        if (state.khoi_dong.currentQuestionIndex > 0) {
          state.khoi_dong.currentQuestionIndex--;
          if (state.khoi_dong.subRound === 'COLLECTIVE') {
            triggerCollectiveBuzzerOpen();
          }
        }
        checkAndPlayKhoiDongQuestionSound(manager);
      } else if (state.currentRound === 'TANG_TOC') {
        if (state.tang_toc.currentQuestionIndex > 0) {
          state.tang_toc.currentQuestionIndex--;
          state.tang_toc.answers = [];
          state.tang_toc.showAnswers = false;
          state.tang_toc.showExplanation = false;
          state.tang_toc.currentHintIndex = 0;
          state.tang_toc.buzzedPlayer = null;
          state.tang_toc.buzzedHintIndex = null;
          state.tang_toc.blockedPlayers = [];
          manager.resetTimer();
          manager.playSound('Acceleration_QuestionShow');
        }
      } else if (state.currentRound === 'VE_DICH') {
        const playerPos = state.ve_dich.currentPlayerIndex !== null ? (state.ve_dich.currentPlayerIndex + 1) as 1 | 2 | 3 | 4 : null;
        if (playerPos) {
          const turn = state.ve_dich.turns[playerPos];
          if (turn && turn.currentQuestionIndex > 0) {
            turn.currentQuestionIndex--;
            turn.starUsed = false;
            turn.claimBuzzerState = 'LOCKED';
            turn.claimBuzzerPlayer = null;
            turn.claimBuzzedTimestamp = null;
            turn.currentQuestionConfirmed = false;
            turn.starPenalized = false;
            manager.lockBuzzer();
            manager.resetTimer();
          }
        }
      } else if (state.currentRound === 'CH_PHU') {
        if (state.cau_hoi_phu.currentQuestionIndex > 0) {
          state.cau_hoi_phu.currentQuestionIndex--;
          state.cau_hoi_phu.buzzedPlayer = null;
          state.cau_hoi_phu.winnerPosition = null;
          state.cau_hoi_phu.foulPlayers = [];
          state.cau_hoi_phu.incorrectPlayers = [];
          state.cau_hoi_phu.questionRevealed = false;
          state.buzzedPlayer = null;
          state.buzzedTimestamp = null;
          if (state.cau_hoi_phu.buzzerMode === 'CONTINUOUS') {
            manager.openBuzzer();
          } else {
            manager.lockBuzzer();
          }
          manager.resetTimer();
        }
      }
      syncStateToRoom();
    });

    // --- TIMER CLIENT-SERVER CONTROLS ---

    socket.on(SocketEvent.START_TIMER, (data: { seconds: number }) => {
      const state = manager.getMatchState();
      console.log(`⏱️ Starting ${data.seconds}s countdown for round ${state.currentRound}`);

      if (state.currentRound === 'KHOI_DONG') {
        const isTimedRule = (state.khoi_dong.subRound === 'INDIVIDUAL' && state.khoi_dong.individualRule === 'O19_O21') ||
                            (state.khoi_dong.subRound === 'COLLECTIVE' && state.khoi_dong.collectiveRule === 'O22');

        if (data.seconds === 3) {
          manager.playSound('Warm-up_3Seconds');
          state.khoi_dong.threeSecCountdown = 3;
          syncStateToRoom();

          if ((global as any)._kdThreeSecInterval) {
            clearInterval((global as any)._kdThreeSecInterval);
          }

          (global as any)._kdThreeSecInterval = setInterval(() => {
            const st = manager.getMatchState();
            if (st.khoi_dong?.threeSecCountdown && st.khoi_dong.threeSecCountdown > 0) {
              st.khoi_dong.threeSecCountdown -= 1;
              if (st.khoi_dong.threeSecCountdown <= 0) {
                if (st.khoi_dong.subRound === 'COLLECTIVE') {
                  manager.lockBuzzer();
                }
                clearInterval((global as any)._kdThreeSecInterval);
                (global as any)._kdThreeSecInterval = null;
              }
              syncStateToRoom();
            } else {
              clearInterval((global as any)._kdThreeSecInterval);
              (global as any)._kdThreeSecInterval = null;
            }
          }, 1000);

          if (isTimedRule) {
            return;
          }
        } else if (data.seconds === 5) {
          manager.playSound('Warm-up_5Seconds');
          if (isTimedRule) {
            return;
          }
        }
      } else if (state.currentRound === 'VCNV') {
        manager.playSound('Obstacle_RowThinking');
      } else if (state.currentRound === 'TANG_TOC') {
        if (data.seconds === 10) {
          manager.playSound('Acceleration_10Seconds');
        } else if (data.seconds === 20) {
          manager.playSound('Acceleration_20Seconds');
        } else if (data.seconds === 30) {
          manager.playSound('Acceleration_30Seconds');
        } else if (data.seconds === 40) {
          manager.playSound('Acceleration_40Seconds');
        } else {
          manager.playSound(data.seconds <= 20 ? 'Acceleration_20Seconds' : 'Acceleration_30Seconds');
        }

        state.mediaControl.isPlaying = true;
        state.mediaControl.key = Date.now();

        manager.openBuzzer();
        state.tang_toc.buzzerLocked = false;
        if (state.tang_toc.mode === 'IMPROVED') {
          state.tang_toc.currentHintIndex = 0;
          state.tang_toc.buzzedPlayer = null;
        }
      } else if (state.currentRound === 'VE_DICH') {
        if (data.seconds === 5) {
          manager.playSound('Finish_5Seconds');
        } else if (data.seconds === 10) {
          manager.playSound('Finish_10Seconds');
        } else if (data.seconds === 15) {
          manager.playSound('Finish_15Seconds');
        } else if (data.seconds === 20) {
          manager.playSound('Finish_20Seconds');
        } else if (data.seconds === 30) {
          manager.playSound('Finish_30Seconds');
        } else {
          manager.playSound(data.seconds <= 10 ? 'Finish_10Seconds' : data.seconds <= 15 ? 'Finish_15Seconds' : data.seconds <= 20 ? 'Finish_20Seconds' : 'Finish_30Seconds');
        }
      } else if (state.currentRound === 'CH_PHU') {
        if (state.cau_hoi_phu.ruleMode === 'SHOOTOUT') {
          manager.playSound('Additional_10Seconds');
        } else {
          manager.playSound('Additional_15Seconds');
        }
      }

      // Special rule: Collective Round buzzer automatically opens exactly when Timer Starts (if not already handled)
      if (state.currentRound === 'KHOI_DONG' && state.khoi_dong.subRound === 'COLLECTIVE') {
        state.khoi_dong.timerType = 'SECOND_5S';
        manager.openBuzzer();
      }

      if (state.currentRound === 'CH_PHU' && state.cau_hoi_phu.ruleMode !== 'SHOOTOUT') {
        manager.openBuzzer();
      }

      if (state.currentRound === 'VCNV' && state.vcnv.selectedRow) {
        const row = state.vcnv.rows[state.vcnv.selectedRow];
        if (row) {
          row.isOpen = true;
        }
      }

      manager.startTimer(
        data.seconds,
        () => {
          // Send ticking update to keep clients visually aligned
          syncStateToRoom();
        },
        () => {
          // Complete callback: lock input when timer expires
          const finishedState = manager.getMatchState();
          finishedState.isTimerRunning = false;
          
          if (finishedState.currentRound === 'KHOI_DONG' && finishedState.khoi_dong.subRound === 'COLLECTIVE') {
            finishedState.khoi_dong.timerType = null;
            manager.lockBuzzer();
            console.log("🔒 Collective round buzzer locked after second 5s timer expired!");
          } else if (finishedState.currentRound === 'VCNV') {
            finishedState.vcnv.cnvBuzzerLocked = false; // Always keep open, never lock
          } else if (finishedState.currentRound === 'TANG_TOC') {
            finishedState.mediaControl.isPlaying = false;
          } else if (finishedState.currentRound === 'VE_DICH') {
            const playerPos = finishedState.ve_dich.currentPlayerIndex !== null ? (finishedState.ve_dich.currentPlayerIndex + 1) as 1 | 2 | 3 | 4 : null;
            if (playerPos) {
              const turn = finishedState.ve_dich.turns[playerPos];
              if (turn.claimBuzzerState === 'OPEN') {
                turn.claimBuzzerState = 'LOCKED';
                manager.lockBuzzer();
              }
            }
          } else if (finishedState.currentRound === 'CH_PHU') {
            manager.lockBuzzer();
          }
          syncStateToRoom();
        }
      );
      syncStateToRoom();
    });

    socket.on(SocketEvent.PAUSE_TIMER, () => {
      manager.pauseTimer();
      const state = manager.getMatchState();
      if (state.currentRound === 'VCNV') {
        manager.pauseSound('Obstacle_RowThinking');
      } else if (state.currentRound === 'TANG_TOC') {
        manager.pauseSound('Acceleration_10Seconds');
        manager.pauseSound('Acceleration_20Seconds');
        manager.pauseSound('Acceleration_30Seconds');
        manager.pauseSound('Acceleration_40Seconds');
        state.mediaControl.isPlaying = false;
      } else if (state.currentRound === 'CH_PHU') {
        if (state.cau_hoi_phu.ruleMode === 'SHOOTOUT') {
          manager.pauseSound('Additional_10Seconds');
        } else {
          manager.pauseSound('Additional_15Seconds');
        }
      }
      syncStateToRoom();
    });

    socket.on(SocketEvent.RESET_TIMER, () => {
      manager.resetTimer();
      const state = manager.getMatchState();
      if (state.currentRound === 'VCNV') {
        manager.stopSound('Obstacle_RowThinking');
      } else if (state.currentRound === 'TANG_TOC') {
        manager.stopSound('Acceleration_10Seconds');
        manager.stopSound('Acceleration_20Seconds');
        manager.stopSound('Acceleration_30Seconds');
        manager.stopSound('Acceleration_40Seconds');
        state.mediaControl.isPlaying = false;
      } else if (state.currentRound === 'CH_PHU') {
        if (state.cau_hoi_phu.ruleMode === 'SHOOTOUT') {
          manager.stopSound('Additional_10Seconds');
        } else {
          manager.stopSound('Additional_15Seconds');
        }
      }
      if (state.currentRound === 'KHOI_DONG' && state.khoi_dong.subRound === 'COLLECTIVE') {
        state.khoi_dong.timerType = null;
      }
      syncStateToRoom();
    });

    // --- GRADING / SCORING ENGINE ---

    socket.on(SocketEvent.GRADE_ANSWER, (data: { isCorrect: boolean; pointsOverride?: number }) => {
      const state = manager.getMatchState();

      // Trigger corresponding sound effect
      const action: 'CORRECT' | 'INCORRECT' | 'SKIP' = (data as any).grade || ((data as any).isSkip ? 'SKIP' : (data.isCorrect ? 'CORRECT' : 'INCORRECT'));

      if (state.currentRound === 'KHOI_DONG') {
        if (action === 'CORRECT') {
          manager.playSound('Warm-up_Correct');
        } else {
          manager.playSound('Warm-up_Wrong');
        }
      } else if (state.currentRound === 'CH_PHU') {
        // Sound is handled directly in manager.gradeCHPhu
      } else {
        if (data.isCorrect) {
          manager.playSound('correct');
        } else {
          manager.playSound('wrong');
        }
      }

      if (state.currentRound === 'KHOI_DONG') {
        const subRound = state.khoi_dong.subRound;
        const totalQs = manager.getMatchQuestions()?.khoi_dong?.cau_hoi?.length || 36;
        const autoNext = state.khoi_dong.autoNextQuestion ?? true;
        
        if (subRound === 'INDIVIDUAL') {
          const maxQs = state.khoi_dong.individualMaxQuestions;
          const count = state.khoi_dong.countAnswered ?? 0;

          // If turn is active and already answered/graded maxQuestions, block grading a second time!
          if (state.khoi_dong.isStarted && maxQs && maxQs > 0 && count >= maxQs) {
            console.log(`Turn question limit reached (${count}/${maxQs}). Blocked 2nd grading attempt.`);
            return;
          }

          if (state.khoi_dong.currentPlayerIndex !== null && state.khoi_dong.currentPlayerIndex !== undefined) {
            const activePos = (state.khoi_dong.currentPlayerIndex + 1) as 1 | 2 | 3 | 4;
            manager.updateKhoiDongScore(activePos, action);
          }
          
          const isTimedTurn = !!(state.khoi_dong.individualTimerDuration && state.khoi_dong.individualTimerDuration > 0);
          const isTimerExpired = isTimedTurn && (!state.isTimerRunning || state.timerSeconds <= 0);

          if (isTimerExpired) {
            // When timer is expired in INDIVIDUAL turn (e.g. O19/O21), grading updates score/stats but MUST NOT advance to next question
            console.log(`Individual timer expired (${state.timerSeconds}s, running: ${state.isTimerRunning}). Score updated without advancing question.`);
          } else if (state.khoi_dong.isStarted) {
            const nextCount = count + 1;
            state.khoi_dong.countAnswered = nextCount;
            
            if (autoNext) {
              const startIdx = state.khoi_dong.startQuestionIndex ?? 0;
              if (!maxQs || maxQs === 0 || nextCount < maxQs) {
                state.khoi_dong.currentQuestionIndex = (startIdx + nextCount) % totalQs;
              } else {
                // Reached max questions
                state.khoi_dong.currentQuestionIndex = (startIdx + maxQs - 1) % totalQs;
              }
              checkAndPlayKhoiDongQuestionSound(manager);
            }
          } else {
            if (autoNext) {
              if (state.khoi_dong.currentQuestionIndex < totalQs - 1) {
                state.khoi_dong.currentQuestionIndex++;
              }
            }
          }
        } else {
          // Collective: graded player is who buzzed
          const buzzedPos = state.buzzedPlayer as 1 | 2 | 3 | 4;
          if (buzzedPos) {
            manager.updateKhoiDongScore(buzzedPos, action);
          }

          if (state.khoi_dong.isStarted) {
            const count = state.khoi_dong.countAnswered ?? 0;
            state.khoi_dong.countAnswered = count + 1;
          }

          if (autoNext) {
            state.khoi_dong.blockedThisQuestionPlayers = [...(state.khoi_dong.blockedNextQuestionPlayers || [])];
            state.khoi_dong.blockedNextQuestionPlayers = [];
            if (state.khoi_dong.currentQuestionIndex < totalQs - 1) {
              state.khoi_dong.currentQuestionIndex++;
              triggerCollectiveBuzzerOpen();
            }
            checkAndPlayKhoiDongQuestionSound(manager);
          }
        }
        
        // Lock buzzer & reset
        manager.lockBuzzer();
        state.buzzedPlayer = null;
        state.buzzedTimestamp = null;
      }
      
      else if (state.currentRound === 'VCNV') {
        // Horizontal rows graded by checkboxes
        const selected = state.vcnv.selectedRow;
        if (selected) {
          const correctPositions = (data as any).correctPositions || [];
          manager.gradeRowAnswers(correctPositions);
          if (correctPositions.length > 0) {
            manager.playSound('Obstacle_RowRight');
          } else {
            manager.playSound('Obstacle_RowWrong');
          }
          manager.resumeTimer();
        }
      }

      else if (state.currentRound === 'TANG_TOC') {
        const correctPositions = (data as any).correctPositions || [];
        manager.gradeTangToc(correctPositions);
        if (correctPositions.length > 0) {
          manager.playSound('Acceleration_Right');
        } else {
          manager.playSound('Acceleration_Wrong');
        }
      }

      else if (state.currentRound === 'VE_DICH') {
        const mainPlayerPos = state.ve_dich.currentPlayerIndex !== null ? (state.ve_dich.currentPlayerIndex + 1) as 1 | 2 | 3 | 4 : null;
        if (mainPlayerPos) {
          const turn = state.ve_dich.turns[mainPlayerPos];
          const activeQuestion = turn.chosenPackage[turn.currentQuestionIndex];
          const points = activeQuestion ? activeQuestion.points : 20;

          if (turn.claimBuzzerPlayer) {
            // Grading the claim burglar
            manager.gradeVeDichClaimer(mainPlayerPos, turn.claimBuzzerPlayer as 1 | 2 | 3 | 4, data.isCorrect, points);
          } else {
            // Grading the main player
            manager.gradeVeDichMainPlayer(mainPlayerPos, data.isCorrect, points);
          }

          if (data.isCorrect) {
            manager.playSound('Finish_Right');
          } else {
            manager.playSound('Finish_Wrong');
          }
        }
      }

      else if (state.currentRound === 'CH_PHU') {
        manager.gradeCHPhu(data.isCorrect);
      }

      syncStateToRoom();
    });

    // --- KHOI DONG SPECIFIC CONTROLS ---

    socket.on(SocketEvent.KHOI_DONG_UPDATE_CONFIG, (data: Partial<KhoiDongState>) => {
      const state = manager.getMatchState();
      if (!state.khoi_dong) return;
      Object.assign(state.khoi_dong, data);
      syncStateToRoom();
    });

    const resetKhoiDongPlayerStats = (state: any) => {
      if (state.khoi_dong) {
        state.khoi_dong.playerStats = {
          1: { correct: 0, wrong: 0, skip: 0, total: 0 },
          2: { correct: 0, wrong: 0, skip: 0, total: 0 },
          3: { correct: 0, wrong: 0, skip: 0, total: 0 },
          4: { correct: 0, wrong: 0, skip: 0, total: 0 }
        };
      }
    };

    socket.on(SocketEvent.KHOI_DONG_SET_ROUND, (data: { subRound: 'INDIVIDUAL' | 'COLLECTIVE' | null }) => {
      const state = manager.getMatchState();
      state.khoi_dong.subRound = data.subRound;
      state.khoi_dong.isConfirmed = false;
      manager.resetKhoiDongTurn();
      if (data.subRound === 'COLLECTIVE') {
        const startQ = (state.khoi_dong.individualMaxQuestions || 6) * 4;
        state.khoi_dong.currentQuestionIndex = startQ;
        state.khoi_dong.startQuestionIndex = startQ;
        manager.lockBuzzer();
      } else if (data.subRound === 'INDIVIDUAL') {
        state.khoi_dong.currentPlayerIndex = null;
        state.khoi_dong.currentQuestionIndex = 0;
        state.khoi_dong.startQuestionIndex = 0;
      } else {
        state.khoi_dong.currentPlayerIndex = null;
        state.khoi_dong.currentQuestionIndex = 0;
        state.khoi_dong.startQuestionIndex = 0;
        state.khoi_dong.isStarted = false;
      }
      syncStateToRoom();
    });

    socket.on(SocketEvent.KHOI_DONG_SET_PLAYER, (data: { playerIndex: number | null }) => {
      const state = manager.getMatchState();
      manager.resetKhoiDongTurn();
      state.khoi_dong.currentPlayerIndex = data.playerIndex;
      const questionsPerCandidate = state.khoi_dong.individualMaxQuestions || 6;
      const startIndex = data.playerIndex !== null && data.playerIndex !== undefined ? data.playerIndex * questionsPerCandidate : 0;
      state.khoi_dong.startQuestionIndex = startIndex;
      state.khoi_dong.currentQuestionIndex = startIndex;
      syncStateToRoom();
    });

    socket.on(SocketEvent.KHOI_DONG_END_TURN, () => {
      const state = manager.getMatchState();
      manager.playSound('Warm-up_Finish');
      manager.resetKhoiDongTurn();
      state.khoi_dong.isConfirmed = false;
      state.khoi_dong.currentPlayerIndex = null;
      state.khoi_dong.currentQuestionIndex = 0;
      state.khoi_dong.startQuestionIndex = 0;
      syncStateToRoom();
    });

    socket.on(SocketEvent.KHOI_DONG_SET_START_QUESTION, (data: { startQuestionIndex: number }) => {
      const state = manager.getMatchState();
      state.khoi_dong.startQuestionIndex = data.startQuestionIndex;
      state.khoi_dong.currentQuestionIndex = data.startQuestionIndex;
      syncStateToRoom();
    });

    socket.on(SocketEvent.KHOI_DONG_START, () => {
      const state = manager.getMatchState();
      manager.resetKhoiDongTurn();
      state.khoi_dong.isConfirmed = true;
      state.khoi_dong.isStarted = true;
      state.khoi_dong.currentQuestionIndex = state.khoi_dong.startQuestionIndex ?? 0;
      if (state.khoi_dong.subRound === 'COLLECTIVE') {
        triggerCollectiveBuzzerOpen();
      }
      checkAndPlayKhoiDongQuestionSound(manager);

      if (state.khoi_dong.subRound === 'INDIVIDUAL') {
        const duration = state.khoi_dong.individualTimerDuration;
        if (duration && duration > 0) {
          manager.startTimer(
            duration,
            () => { syncStateToRoom(); },
            () => {
              const endState = manager.getMatchState();
              endState.isTimerRunning = false;
              syncStateToRoom();
            }
          );
        } else {
          manager.stopTimer();
        }
      } else {
        const duration = state.khoi_dong.collectiveTimerDuration;
        if (state.khoi_dong.collectiveRule === 'O22' && duration && duration > 0) {
          manager.startTimer(
            duration,
            () => { syncStateToRoom(); },
            () => {
              const endState = manager.getMatchState();
              endState.isTimerRunning = false;
              syncStateToRoom();
            }
          );
        }
      }

      syncStateToRoom();
    });

    socket.on(SocketEvent.ADMIN_KHOI_DONG_PLAY_PREP_MUSIC, () => {
      // Broadcast prep music trigger to all connected clients
      manager.playSound('Warm-up_BeginTurn');
      syncStateToRoom();
    });

    socket.on(SocketEvent.ADMIN_KHOI_DONG_START_PREP, () => {
      const state = manager.getMatchState();
      manager.playSound('Warm-up_QuestionShow');
      manager.resetKhoiDongTurn();
      state.khoi_dong.isConfirmed = true;
      state.khoi_dong.isPrepRunning = true;
      state.khoi_dong.prepCountdown = 3;
      syncStateToRoom();

      // Countdown sequence: 3 -> 2 -> 1 -> 0 (Start question)
      setTimeout(() => {
        const s1 = manager.getMatchState();
        if (s1.khoi_dong.isPrepRunning) {
          s1.khoi_dong.prepCountdown = 2;
          syncStateToRoom();
        }
      }, 1000);

      setTimeout(() => {
        const s2 = manager.getMatchState();
        if (s2.khoi_dong.isPrepRunning) {
          s2.khoi_dong.prepCountdown = 1;
          syncStateToRoom();
        }
      }, 2000);

      setTimeout(() => {
        const s3 = manager.getMatchState();
        if (s3.khoi_dong.isPrepRunning) {
          s3.khoi_dong.prepCountdown = 0;
          s3.khoi_dong.isPrepRunning = false;
          s3.khoi_dong.isStarted = true;
          s3.khoi_dong.countAnswered = 0;
          s3.khoi_dong.currentQuestionIndex = s3.khoi_dong.startQuestionIndex ?? 0;
          if (s3.khoi_dong.subRound === 'COLLECTIVE') {
            triggerCollectiveBuzzerOpen();
          }
          checkAndPlayKhoiDongQuestionSound(manager);

          if (s3.khoi_dong.subRound === 'INDIVIDUAL') {
            const duration = s3.khoi_dong.individualTimerDuration;
            if (duration && duration > 0) {
              manager.startTimer(
                duration,
                () => { syncStateToRoom(); },
                () => {
                  const endState = manager.getMatchState();
                  endState.isTimerRunning = false;
                  syncStateToRoom();
                }
              );
            } else {
              manager.stopTimer();
            }
          } else {
            const duration = s3.khoi_dong.collectiveTimerDuration;
            if (s3.khoi_dong.collectiveRule === 'O22' && duration && duration > 0) {
              manager.startTimer(
                duration,
                () => { syncStateToRoom(); },
                () => {
                  const endState = manager.getMatchState();
                  endState.isTimerRunning = false;
                  syncStateToRoom();
                }
              );
            }
          }

          syncStateToRoom();
        }
      }, 3000);
    });

    // --- VCNV SPECIFIC CONTROLS ---

    socket.on(SocketEvent.VCNV_SHOW_ROWS, () => {
      const state = manager.getMatchState();
      state.vcnv.showRows = true;
      manager.playSound('Obstacle_RowShow');
      syncStateToRoom();
    });

    socket.on(SocketEvent.VCNV_SELECT_ROW, (data: { rowId: number }) => {
      const state = manager.getMatchState();
      manager.playSound('Obstacle_RowChoose');
      state.vcnv.selectedRow = data.rowId;
      // Reset rows player answers
      const row = state.vcnv.rows[data.rowId];
      if (row) {
        row.playerAnswers = {};
        row.showAnswers = false;
      }
      // VCNV specific: media should start as paused and only play when Admin triggers
      state.mediaControl.isPlaying = false;
      state.mediaControl.key = Date.now();
      syncStateToRoom();
    });

    socket.on(SocketEvent.VCNV_OPEN_SEGMENT, (data: { segmentId: number }) => {
      const state = manager.getMatchState();
      manager.playSound('Obstacle_PictureShow');
      if (!state.vcnv.revealedSegments.includes(data.segmentId)) {
        state.vcnv.revealedSegments.push(data.segmentId);
      }
      // Open row visual too
      if (state.vcnv.rows[data.segmentId]) {
        state.vcnv.rows[data.segmentId].isOpen = true;
      }
      syncStateToRoom();
    });

    socket.on(SocketEvent.VCNV_SHOW_ANSWERS, () => {
      const state = manager.getMatchState();
      const selected = state.vcnv.selectedRow;
      if (selected) {
        const row = state.vcnv.rows[selected];
        if (row) {
          row.showAnswers = !row.showAnswers;
          if (row.showAnswers) {
            manager.playSound('Obstacle_ShowAnswer');
          }
        }
      }
      syncStateToRoom();
    });

    socket.on(SocketEvent.VCNV_AWARD_OBSTACLE, (data: { position: 1 | 2 | 3 | 4; points: number }) => {
      manager.awardObstacle(data.position, data.points);
      manager.playSound('Obstacle_Right');
      syncStateToRoom();
    });

    socket.on(SocketEvent.VCNV_FOUL_OBSTACLE, () => {
      manager.penalizeObstacle();
      manager.playSound('Obstacle_RowWrong');
      syncStateToRoom();
    });

    socket.on(SocketEvent.VCNV_START_15S, () => {
      const state = manager.getMatchState();
      state.vcnv.isLast15sRunning = true;
      state.vcnv.isLast15sStarted = true;
      manager.playSound('Obstacle_RowThinking');
      manager.startTimer(
        15,
        (sec) => {
          syncStateToRoom();
        },
        () => {
          const st = manager.getMatchState();
          st.vcnv.isLast15sRunning = false;
          st.vcnv.cnvBuzzerLocked = true;
          console.log('🔒 15s VCNV countdown finished. CNV Buzzer locked.');
          syncStateToRoom();
        }
      );
      syncStateToRoom();
    });

    socket.on(SocketEvent.VCNV_TOGGLE_RED_CELL, (data: { rowId: number; charIndex: number }) => {
      manager.toggleVcnvRedCell(data.rowId, data.charIndex);
      syncStateToRoom();
    });

    socket.on(SocketEvent.VCNV_SET_SCORING_MODE, (data: { mode: 'TRADITIONAL' | 'IMPROVED' }) => {
      manager.setVcnvScoringMode(data.mode);
      syncStateToRoom();
    });

    socket.on(SocketEvent.VCNV_SET_SO_HANG_NGANG, (data: { soHN: 4 | 8 }) => {
      manager.setVcnvSoHangNgang(data.soHN);
      syncStateToRoom();
    });

    // --- TANG TOC SPECIFIC CONTROLS ---

    socket.on(SocketEvent.TANG_TOC_SHOW_ANSWERS, (data?: { show: boolean }) => {
      const state = manager.getMatchState();
      const nextShow = (data && typeof data.show === 'boolean') ? data.show : !state.tang_toc.showAnswers;
      if (!state.tang_toc.showAnswers && nextShow) {
        manager.playSound('Acceleration_AnswerShow');
      }
      state.tang_toc.showAnswers = nextShow;
      syncStateToRoom();
    });

    socket.on(SocketEvent.TANG_TOC_SHOW_EXPLANATION, () => {
      const state = manager.getMatchState();
      state.tang_toc.showExplanation = true;
      syncStateToRoom();
    });

    socket.on(SocketEvent.TANG_TOC_TOGGLE_MEDIA, (data?: { show: boolean }) => {
      const state = manager.getMatchState();
      if (data && typeof data.show === 'boolean') {
        state.tang_toc.showMedia = data.show;
      } else {
        state.tang_toc.showMedia = state.tang_toc.showMedia !== false ? false : true;
      }
      syncStateToRoom();
    });

    socket.on(SocketEvent.TANG_TOC_SET_QUESTION, (data: { questionIndex: number }) => {
      const state = manager.getMatchState();
      state.tang_toc.currentQuestionIndex = data.questionIndex;
      state.tang_toc.answers = [];
      state.tang_toc.showAnswers = false;
      state.tang_toc.showExplanation = false;
      state.tang_toc.currentHintIndex = 0;
      state.tang_toc.buzzedPlayer = null;
      state.tang_toc.buzzedHintIndex = null;
      state.tang_toc.blockedPlayers = [];
      manager.lockBuzzer();
      
      // Media starts paused for Tăng Tốc until Admin triggers audio/play
      state.mediaControl.isPlaying = false;
      state.mediaControl.key = Date.now();

      if (state.tang_toc.showMedia === undefined) {
        state.tang_toc.showMedia = true;
      }
      manager.resetTimer();
      if (data.questionIndex >= 0) {
        manager.playSound('Acceleration_QuestionShow');
      }
      syncStateToRoom();
    });

    socket.on(SocketEvent.TANG_TOC_SET_MODE, (data: { mode: 'TRADITIONAL' | 'IMPROVED' }) => {
      const state = manager.getMatchState();
      state.tang_toc.mode = data.mode;
      state.tang_toc.buzzedPlayer = null;
      state.tang_toc.blockedPlayers = [];
      state.tang_toc.currentHintIndex = 0;
      manager.lockBuzzer();
      syncStateToRoom();
    });

    socket.on(SocketEvent.TANG_TOC_GRADE_IMPROVED, (data: { isCorrect: boolean }) => {
      const state = manager.getMatchState();
      const tangToc = state.tang_toc;
      const buzzedPos = state.buzzedPlayer || tangToc.buzzedPlayer;
      if (!buzzedPos) return;

      if (data.isCorrect) {
        // Stop timer countdown sound explicitly so it won't linger or resume
        manager.stopSound('Acceleration_10Seconds');
        manager.stopSound('Acceleration_20Seconds');
        manager.stopSound('Acceleration_30Seconds');
        manager.stopSound('Acceleration_40Seconds');

        // Calculate points based on hint index when buzzed & question type (3 or 4 hints)
        const currentQIndex = tangToc.currentQuestionIndex ?? 0;
        const caiTienQ = manager.getMatchQuestions()?.tang_toc?.cai_tien_cau_hoi?.[currentQIndex];
        const numHints = caiTienQ?.loai_cau_hoi === 4 ? 4 : (caiTienQ?.goi_y?.length || 3);

        const hintIdx = tangToc.buzzedHintIndex ?? tangToc.currentHintIndex ?? 0;
        const points = getTangTocImprovedPoints(hintIdx, numHints as 3 | 4);

        manager.updatePlayerScore(buzzedPos as 1 | 2 | 3 | 4, points);
        manager.playSound('Acceleration_Right');
        manager.stopTimer();
        state.buzzerState = 'LOCKED';
        tangToc.buzzedPlayer = null;
        state.buzzedPlayer = null;

        // Reveal all hints for this question when answered correctly
        const maxHintIdx = numHints - 1;
        tangToc.currentHintIndex = maxHintIdx;
        tangToc.showExplanation = true;
      } else {
        if (!tangToc.blockedPlayers) tangToc.blockedPlayers = [];
        if (!tangToc.blockedPlayers.includes(buzzedPos)) {
          tangToc.blockedPlayers.push(buzzedPos);
        }
        tangToc.buzzedPlayer = null;
        state.buzzedPlayer = null;

        // Resume timer and open buzzer for remaining candidates
        manager.resumeTimer();
        manager.openBuzzer();
        tangToc.buzzerLocked = false;

        // Resume countdown sound from exact paused location
        if (state.timerTotal === 40) {
          manager.resumeSound('Acceleration_40Seconds');
        } else if (state.timerTotal === 30) {
          manager.resumeSound('Acceleration_30Seconds');
        } else if (state.timerTotal === 20) {
          manager.resumeSound('Acceleration_20Seconds');
        } else if (state.timerTotal === 10) {
          manager.resumeSound('Acceleration_10Seconds');
        } else {
          manager.resumeSound('Acceleration_30Seconds');
        }
      }
      syncStateToRoom();
    });

    socket.on(SocketEvent.TANG_TOC_RESUME_TIMER, () => {
      const state = manager.getMatchState();
      manager.resumeTimer();
      manager.openBuzzer();
      state.tang_toc.buzzerLocked = false;
      if (state.timerTotal === 40) {
        manager.resumeSound('Acceleration_40Seconds');
      } else if (state.timerTotal === 30) {
        manager.resumeSound('Acceleration_30Seconds');
      } else if (state.timerTotal === 20) {
        manager.resumeSound('Acceleration_20Seconds');
      } else if (state.timerTotal === 10) {
        manager.resumeSound('Acceleration_10Seconds');
      } else {
        manager.resumeSound('Acceleration_30Seconds');
      }
      syncStateToRoom();
    });

    // --- VE DICH SPECIFIC CONTROLS ---

    socket.on(SocketEvent.VE_DICH_SELECT_PLAYER, (data: { position: 1 | 2 | 3 | 4 }) => {
      manager.selectVeDichPlayer(data.position);
      manager.playSound('Finish_UserStart');
      syncStateToRoom();
    });

    socket.on(SocketEvent.VE_DICH_SHOW_PACKAGE_BOARD, (data?: { position?: 1 | 2 | 3 | 4; show?: boolean }) => {
      const state = manager.getMatchState();
      const pos = data?.position || (state.ve_dich.currentPlayerIndex !== null ? (state.ve_dich.currentPlayerIndex + 1) as 1 | 2 | 3 | 4 : null);
      if (pos) {
        const turn = state.ve_dich.turns[pos];
        const nextShow = typeof data?.show === 'boolean' ? data.show : !(turn?.showPackageBoard);
        manager.showVeDichPackageBoard(pos, nextShow);
        if (nextShow) {
          manager.playSound('Finish_PackShow');
        }
        syncStateToRoom();
      }
    });

    socket.on(SocketEvent.VE_DICH_SET_DRAFT_PACKAGE, (data: { position: 1 | 2 | 3 | 4; index: number; points: 10 | 20 | 30 | 40 | null }) => {
      manager.setVeDichDraftPackage(data.position, data.index, data.points);
      manager.playSound('Finish_Choice');
      syncStateToRoom();
    });

    socket.on(SocketEvent.VE_DICH_SET_PACKAGE, (data: { position: 1 | 2 | 3 | 4; packages: (10 | 20 | 30 | 40)[] }) => {
      manager.setVeDichPackage(data.position, data.packages);
      manager.playSound('Finish_PackChoose');
      syncStateToRoom();
    });

    socket.on(SocketEvent.VE_DICH_SET_RULE_MODE, (data: { ruleMode: 'O20_PLUS' | 'O19' }) => {
      manager.setVeDichRuleMode(data.ruleMode);
      syncStateToRoom();
    });

    socket.on(SocketEvent.VE_DICH_SET_PACKAGE_COUNT, (data: { count: number }) => {
      manager.setVeDichPackageCount(data.count);
      syncStateToRoom();
    });

    socket.on(SocketEvent.VE_DICH_SET_PRESET_PACKAGES, (data: { packages: VeDichPresetPackage[] }) => {
      manager.setVeDichPresetPackages(data.packages);
      syncStateToRoom();
    });

    socket.on(SocketEvent.VE_DICH_START_PRACTICE, (data: { type: 'MAIN' | 'CLAIM' }) => {
      manager.startVeDichPracticeTimer(
        data.type,
        () => syncStateToRoom(),
        () => syncStateToRoom()
      );
      syncStateToRoom();
    });

    socket.on(SocketEvent.VE_DICH_STOP_PRACTICE, () => {
      manager.stopVeDichPracticeTimer();
      syncStateToRoom();
    });

    socket.on(SocketEvent.VE_DICH_SET_QUESTION_INDEX, (data: { position: 1 | 2 | 3 | 4; index: number }) => {
      manager.setVeDichQuestionIndex(data.position, data.index);
      const state = manager.getMatchState();
      state.mediaControl.isPlaying = false;
      state.mediaControl.key = Date.now();
      syncStateToRoom();
    });

    socket.on(SocketEvent.VE_DICH_CONFIRM_QUESTION, (data: { position: 1 | 2 | 3 | 4; questionId: string }) => {
      manager.confirmVeDichQuestion(data.position, data.questionId);
      const state = manager.getMatchState();
      state.mediaControl.isPlaying = false;
      state.mediaControl.key = Date.now();
      syncStateToRoom();
    });

    socket.on(SocketEvent.VE_DICH_RESET_BUZZER, () => {
      manager.resetVeDichBuzzer();
      syncStateToRoom();
    });

    socket.on(SocketEvent.VE_DICH_END_TURN, () => {
      manager.endVeDichTurn();
      manager.playSound('Finish_Finish');
      syncStateToRoom();
    });

    socket.on(SocketEvent.VE_DICH_TOGGLE_STAR, (data: { position: 1 | 2 | 3 | 4; isUsed: boolean }) => {
      manager.toggleStar(data.position, data.isUsed);
      if (data.isUsed) {
        manager.playSound('Finish_StarChoose');
      }
      syncStateToRoom();
    });

    socket.on(SocketEvent.VE_DICH_START_CLAIM, (data: { activePosition: 1 | 2 | 3 | 4 }) => {
      manager.startClaimBuzzerPeriod(data.activePosition);
      manager.playSound('Finish_5Seconds');
      // Start a 5-second timer so that it counts down on all screens and automatically locks when it expires!
      manager.startTimer(
        5,
        () => {
          syncStateToRoom();
        },
        () => {
          const finishedState = manager.getMatchState();
          finishedState.isTimerRunning = false;
          const turn = finishedState.ve_dich.turns[data.activePosition];
          if (turn && turn.claimBuzzerState === 'OPEN') {
            turn.claimBuzzerState = 'LOCKED';
            manager.lockBuzzer();
          }
          syncStateToRoom();
        }
      );
      syncStateToRoom();
    });

    // --- CANDIDATE INTERACTIONS ---

    socket.on(SocketEvent.PLAYER_SUBMIT_ANSWER, (data: { answer: string }) => {
      const state = manager.getMatchState();
      if (!playerPosition) return;

      if (state.currentRound === 'VCNV') {
        manager.submitRowAnswer(playerPosition, data.answer);
      } else if (state.currentRound === 'TANG_TOC') {
        manager.submitTangTocAnswer(playerPosition, data.answer);
      }
      syncStateToRoom();
    });

    socket.on(SocketEvent.PLAYER_BUZZ, () => {
      if (!playerPosition) return;
      const state = manager.getMatchState();

      if (state.currentRound === 'DAU_TRI') {
        manager.buzzDauTri(playerPosition);
        syncStateToRoom();
        return;
      }

      // Check if player is participating in CH_PHU
      if (state.currentRound === 'CH_PHU') {
        const confirmed = state.cau_hoi_phu.confirmedPlayers || [];
        if (!confirmed.includes(playerPosition)) {
          socket.emit(SocketEvent.ERROR, { message: 'Bạn không tham gia thi Câu hỏi phụ!' });
          return;
        }

        // Under CONTINUOUS mode, if pressed before timer started -> FOUL
        if (state.cau_hoi_phu.buzzerMode === 'CONTINUOUS' && !state.isTimerRunning) {
          manager.recordFoulCHPhu(playerPosition);
          syncStateToRoom();
          return;
        }
        
        // Under ON_TIMER mode, if timer not running -> can't buzz!
        if (state.cau_hoi_phu.buzzerMode === 'ON_TIMER' && !state.isTimerRunning) {
          socket.emit(SocketEvent.ERROR, { message: 'Chuông chưa được mở!' });
          return;
        }
      }

      const result = manager.pressBuzzer(playerPosition);
      if (result.success) {
        if (state.currentRound === 'TANG_TOC') {
          manager.pauseSound('Acceleration_10Seconds');
          manager.pauseSound('Acceleration_20Seconds');
          manager.pauseSound('Acceleration_30Seconds');
          manager.pauseSound('Acceleration_40Seconds');
          state.mediaControl.isPlaying = false;
        } else if (state.currentRound === 'CH_PHU') {
          if (state.cau_hoi_phu.ruleMode === 'SHOOTOUT') {
            manager.pauseSound('Additional_10Seconds');
          } else {
            manager.pauseSound('Additional_15Seconds');
          }
        }
        syncStateToRoom();
      } else {
        socket.emit(SocketEvent.ERROR, { message: result.error });
      }
    });

    socket.on(SocketEvent.PLAYER_BUZZ_CNV, () => {
      if (!playerPosition) return;
      const result = manager.pressBuzzerCNV(playerPosition);
      if (result.success) {
        manager.playSound('General_Buzz');
        syncStateToRoom();
      } else {
        socket.emit(SocketEvent.ERROR, { message: result.error });
      }
    });

    // --- CAU HOI PHU SPECIFIC CONTROLS ---

    socket.on(SocketEvent.CHP_SELECT_PLAYERS, (data: { positions: number[] }) => {
      manager.selectCHPhuPlayers(data.positions);
      syncStateToRoom();
    });

    socket.on(SocketEvent.CHP_CONFIRM_PLAYERS, (data: { positions: number[] }) => {
      manager.confirmCHPhuPlayers(data.positions);
      syncStateToRoom();
    });

    socket.on(SocketEvent.CHP_REVEAL_QUESTION, (data: { reveal: boolean }) => {
      manager.revealCHPhuQuestion(data.reveal);
      syncStateToRoom();
    });

    socket.on(SocketEvent.CHP_SET_BUZZER_MODE, (data: { mode: 'CONTINUOUS' | 'ON_TIMER' }) => {
      manager.setCHPhuBuzzerMode(data.mode);
      syncStateToRoom();
    });

    socket.on(SocketEvent.CHP_SET_RULE_MODE, (data: { mode: 'TRADITIONAL' | 'IMPROVED' | 'SHOOTOUT' }) => {
      manager.setCHPhuRuleMode(data.mode);
      syncStateToRoom();
    });

    // --- JEOPARDY SPECIFIC CONTROLS (v3.0) ---

    socket.on(SocketEvent.JEOPARDY_SHOW_BOARD, () => {
      manager.jeopardyShowBoard();
      syncStateToRoom();
    });

    socket.on(SocketEvent.JEOPARDY_REVEAL_CATEGORY, (data: { categoryIndex: number }) => {
      manager.jeopardyRevealCategory(data.categoryIndex);
      syncStateToRoom();
    });

    socket.on(SocketEvent.JEOPARDY_SELECT_CLUE, (data: { categoryIndex: number; clueIndex: number }) => {
      manager.jeopardySelectClue(data.categoryIndex, data.clueIndex);
      syncStateToRoom();
    });

    socket.on(SocketEvent.JEOPARDY_START_BUZZER, () => {
      manager.jeopardyStartBuzzer();
      syncStateToRoom();
    });

    socket.on(SocketEvent.JEOPARDY_GRADE_ANSWER, (data: { isCorrect: boolean }) => {
      manager.jeopardyGradeAnswer(data.isCorrect);
      syncStateToRoom();
    });

    socket.on(SocketEvent.JEOPARDY_START_5S, () => {
      manager.jeopardyStart5sTimer();
      syncStateToRoom();
    });

    socket.on(SocketEvent.JEOPARDY_CLOSE_CLUE, () => {
      manager.jeopardyCloseClue();
      syncStateToRoom();
    });

    socket.on(SocketEvent.JEOPARDY_SET_BOARD_SIZE, (data: { boardSize: '5x4' | '6x5' }) => {
      manager.jeopardySetBoardSize(data.boardSize);
      syncStateToRoom();
    });

    socket.on(SocketEvent.JEOPARDY_SET_BUZZER_RULE, (data: { mode: 'PENALTY_025' | 'STRICT_LOCK' }) => {
      manager.jeopardySetBuzzerRule(data.mode);
      syncStateToRoom();
    });

    socket.on(SocketEvent.JEOPARDY_SET_SCORING_MODE, (data: { mode: 'COMBINED' | 'SEPARATE' }) => {
      manager.jeopardySetScoringMode(data.mode);
      syncStateToRoom();
    });

    socket.on(SocketEvent.JEOPARDY_RESET_GAME, () => {
      manager.jeopardyResetGame();
      syncStateToRoom();
    });

    socket.on(SocketEvent.JEOPARDY_SET_CONTROL_PLAYER, (data: { position: number | null }) => {
      manager.jeopardySetControlPlayer(data.position);
      syncStateToRoom();
    });

    // --- MA TRẬN KÉP CONTROLS ---

    socket.on(SocketEvent.MA_TRAN_KEP_PREPARE, () => {
      manager.prepareMaTranKep();
      syncStateToRoom();
    });

    socket.on(SocketEvent.MA_TRAN_KEP_START, (data?: { duration?: number }) => {
      manager.startMaTranKep(data?.duration);
      syncStateToRoom();
    });

    socket.on(SocketEvent.MA_TRAN_KEP_END, () => {
      manager.endMaTranKep();
      syncStateToRoom();
    });

    socket.on(SocketEvent.MA_TRAN_KEP_RESET, () => {
      manager.resetMaTranKep();
      syncStateToRoom();
    });

    socket.on(SocketEvent.MA_TRAN_KEP_SET_ACTIVE_PLAYER, (data: { position: number }) => {
      manager.setMaTranKepActivePlayer(data.position);
      syncStateToRoom();
    });

    socket.on(SocketEvent.MA_TRAN_KEP_TOGGLE_CELL, (data: { position: number; cellIndex: number }) => {
      manager.toggleMaTranKepCell(data.position, data.cellIndex);
      syncStateToRoom();
    });

    socket.on(SocketEvent.MA_TRAN_KEP_SKIP, (data: { position: number }) => {
      manager.skipMaTranKepQuestion(data.position);
      syncStateToRoom();
    });

    socket.on(SocketEvent.MA_TRAN_KEP_SELECT_QUESTION, (data: { position: number; questionIndex: number }) => {
      manager.selectMaTranKepQuestion(data.position, data.questionIndex);
      syncStateToRoom();
    });

    // --- CHINH PHỤC CONTROLS ---

    socket.on(SocketEvent.CHINH_PHUC_SET_COLOR_METHOD, (data: { method: 'HIGH_TO_LOW' | 'LOW_TO_HIGH' | 'GMDT' | 'MANUAL'; manualOrder?: number[] }) => {
      manager.setChinhPhucColorMethod(data.method, data.manualOrder);
      syncStateToRoom();
    });

    socket.on(SocketEvent.CHINH_PHUC_SET_MANUAL_COLORS, (data: { order: number[]; confirm?: boolean }) => {
      manager.setChinhPhucManualColors(data.order, data.confirm !== false);
      syncStateToRoom();
    });

    socket.on(SocketEvent.CHINH_PHUC_CONFIRM_COLORS, () => {
      manager.confirmChinhPhucColors();
      syncStateToRoom();
    });

    socket.on(SocketEvent.CHINH_PHUC_REVEAL_NEXT_COLOR, () => {
      manager.revealNextChinhPhucColor();
      syncStateToRoom();
    });

    socket.on(SocketEvent.CHINH_PHUC_REVEAL_COLOR_SLOT, (data: { slotIndex: number; revealed?: boolean }) => {
      manager.revealChinhPhucColorSlot(data.slotIndex, data.revealed);
      syncStateToRoom();
    });

    socket.on(SocketEvent.CHINH_PHUC_RESET_COLOR_METHOD, () => {
      manager.resetChinhPhucColorMethod();
      syncStateToRoom();
    });

    socket.on(SocketEvent.CHINH_PHUC_SHOW_BOARD, () => {
      manager.showChinhPhucBoard();
      syncStateToRoom();
    });

    socket.on(SocketEvent.CHINH_PHUC_START_TACTICAL_10S, () => {
      manager.startChinhPhuc10sTactical();
      syncStateToRoom();
    });

    socket.on(SocketEvent.CHINH_PHUC_REVEAL_ALL_CELLS, () => {
      manager.revealAllChinhPhucCells();
      syncStateToRoom();
    });

    socket.on(SocketEvent.CHINH_PHUC_START_ROUND, () => {
      manager.startChinhPhucRound();
      syncStateToRoom();
    });

    socket.on(SocketEvent.CHINH_PHUC_SELECT_CELL, (data: { cellIndex: number; question?: ChinhPhucQuestion }) => {
      manager.selectChinhPhucCell(data.cellIndex, data.question);
      syncStateToRoom();
    });

    socket.on(SocketEvent.CHINH_PHUC_SHOW_QUESTION, (data?: { question?: ChinhPhucQuestion }) => {
      manager.showChinhPhucQuestion(data?.question);
      syncStateToRoom();
    });

    socket.on(SocketEvent.CHINH_PHUC_START_TIMER, (data?: { mode?: 'TRADITIONAL' | 'IMPROVED' }) => {
      manager.startChinhPhucQuestionTimer(data?.mode);
      syncStateToRoom();
    });

    socket.on(SocketEvent.CHINH_PHUC_GRADE_ANSWER, (data: { isCorrect: boolean }) => {
      manager.gradeChinhPhucAnswer(data.isCorrect);
      syncStateToRoom();
    });

    socket.on(SocketEvent.CHINH_PHUC_NEXT_TURN, () => {
      manager.nextChinhPhucTurn();
      syncStateToRoom();
    });

    socket.on(SocketEvent.CHINH_PHUC_END_ROUND, () => {
      manager.endChinhPhucRound();
      syncStateToRoom();
    });

    // --- GMĐT (MINI-GAME) CONTROLS ---

    socket.on(SocketEvent.GMDT_SET_STEP, (data: { step: GMDTStep }) => {
      manager.setGMDTStep(data.step);
      syncStateToRoom();
    });

    socket.on(SocketEvent.PLAYER_GMDT_SUBMIT_CHAR, (data: { position: number; inputChars: string[] }) => {
      manager.submitGMDTChar(data.position, data.inputChars);
      syncStateToRoom();
    });

    // --- ĐẤU TRÍ (UNIVERSITY CHALLENGE) CONTROLS ---

    socket.on(SocketEvent.DAU_TRI_CONFIG, (data: any) => {
      manager.setDauTriConfig(data);
      syncStateToRoom();
    });

    socket.on(SocketEvent.DAU_TRI_PREPARE, () => {
      manager.prepareDauTri();
      syncStateToRoom();
    });

    socket.on(SocketEvent.DAU_TRI_START_ROUND, () => {
      manager.startDauTriRound();
      syncStateToRoom();
    });

    socket.on(SocketEvent.DAU_TRI_REVEAL_MAIN_QUESTION, () => {
      manager.revealDauTriMainQuestion();
      syncStateToRoom();
    });

    socket.on(SocketEvent.DAU_TRI_BUZZ, (data: { position: number }) => {
      manager.buzzDauTri(data.position);
      syncStateToRoom();
    });

    socket.on(SocketEvent.DAU_TRI_GRADE_MAIN, (data: { isCorrect: boolean }) => {
      manager.gradeDauTriMainAnswer(data.isCorrect);
      syncStateToRoom();
    });

    socket.on(SocketEvent.DAU_TRI_SKIP_MAIN, () => {
      manager.skipDauTriMainQuestion();
      syncStateToRoom();
    });

    socket.on(SocketEvent.DAU_TRI_NEXT_MAIN, () => {
      manager.nextDauTriMainQuestion();
      syncStateToRoom();
    });

    socket.on(SocketEvent.DAU_TRI_SHOW_BONUS_THEME, () => {
      manager.showDauTriBonusTheme();
      syncStateToRoom();
    });

    socket.on(SocketEvent.DAU_TRI_SHOW_BONUS_QUESTION, (data: { questionIndex: number }) => {
      manager.showDauTriBonusQuestion(data.questionIndex);
      syncStateToRoom();
    });

    socket.on(SocketEvent.DAU_TRI_START_BONUS_TIMER, () => {
      manager.startDauTriBonusTimer();
      syncStateToRoom();
    });

    socket.on(SocketEvent.DAU_TRI_GRADE_BONUS, (data: { isCorrect: boolean }) => {
      manager.gradeDauTriBonusAnswer(data.isCorrect);
      syncStateToRoom();
    });

    socket.on(SocketEvent.DAU_TRI_END_ROUND, () => {
      manager.endDauTriRound();
      syncStateToRoom();
    });

    socket.on(SocketEvent.DAU_TRI_RESET_ROUND, () => {
      manager.resetDauTriRound();
      syncStateToRoom();
    });

    // --- SUMMARY SPECIFIC CONTROLS ---

    socket.on(SocketEvent.SUMMARY_SET_MODE, (data: { mode: 'ROUNDS' | 'FINAL' | null }) => {
      const state = manager.getMatchState();
      state.summary.mode = data.mode;
      state.summary.step = 0;
      if (data.mode === 'ROUNDS') {
        manager.playSound('General_ScoreSummary');
      }
      syncStateToRoom();
    });

    socket.on(SocketEvent.SUMMARY_SET_STEP, (data: { step: number }) => {
      const state = manager.getMatchState();
      state.summary.step = data.step;
      if (data.step > 0) {
        manager.playSound('summary_fanfare');
      }
      syncStateToRoom();
    });

    // --- CHAT SYSTEM MC <-> ADMIN ---

    socket.on(SocketEvent.MEDIA_PLAY, () => {
      manager.playMedia();
      const state = manager.getMatchState();
      if (state.activeExternalMedia) {
        manager.setExternalMedia({ ...state.activeExternalMedia, isPlaying: true });
      }
      syncStateToRoom();
    });

    socket.on(SocketEvent.MEDIA_PAUSE, () => {
      manager.pauseMedia();
      const state = manager.getMatchState();
      if (state.activeExternalMedia) {
        manager.setExternalMedia({ ...state.activeExternalMedia, isPlaying: false });
      }
      syncStateToRoom();
    });

    socket.on(SocketEvent.MEDIA_REPLAY, () => {
      manager.replayMedia();
      const state = manager.getMatchState();
      if (state.activeExternalMedia) {
        manager.setExternalMedia({ ...state.activeExternalMedia, isPlaying: true, key: Date.now() });
      }
      syncStateToRoom();
    });

    socket.on(SocketEvent.ADMIN_SET_EXTERNAL_MEDIA, (data: { id?: string; name?: string; url: string; type: 'audio' | 'image' | 'video'; isPlaying?: boolean }) => {
      if (!data || !data.url) return;
      manager.setExternalMedia({
        id: data.id || 'custom',
        name: data.name || 'Media ngoài',
        url: data.url,
        type: data.type || 'image',
        isPlaying: data.isPlaying !== false,
        key: Date.now()
      });
      syncStateToRoom();
    });

    socket.on(SocketEvent.ADMIN_CLEAR_EXTERNAL_MEDIA, () => {
      manager.setExternalMedia(null);
      syncStateToRoom();
    });

    socket.on(SocketEvent.SEND_CHAT_MESSAGE, (data: { sender: 'ADMIN' | 'MC'; text: string }) => {
      const msg = manager.addChatMessage(data.sender, data.text);
      io.emit(SocketEvent.RECEIVE_CHAT_MESSAGE, msg);
    });

    // --- DISCONNECT HANDLE ---

    socket.on(SocketEvent.DISCONNECT, () => {
      const disconnectedPos = manager.handleDisconnect(socket.id);
      if (disconnectedPos) {
        io.emit(SocketEvent.ERROR, { message: `Thí sinh đứng ở vị trí ${disconnectedPos} đã mất kết nối!` });
      }
      syncStateToRoom();
    });

    // --- CORE BROADCAST SYNC UTILITY ---

    function syncStateToRoom() {
      const match = manager.getMatchState();
      // Broadcast state to ALL connected sockets for flawless, zero-flicker real-time synchronization
      io.emit(SocketEvent.STATE_SYNC, match);
    }
  });
}
