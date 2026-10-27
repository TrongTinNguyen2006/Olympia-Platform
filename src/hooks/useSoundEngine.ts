import { useEffect, useRef, useCallback, useState } from 'react';
import { Socket } from 'socket.io-client';
import { MatchState, SocketEvent } from '../types';
import { SOUND_REGISTRY, SOUND_PATH_PREFIX } from '../lib/soundRegistry';
import { synthesizeSound } from '../lib/synthAudio';

const BACKGROUND_BEDS = ['General_Ambience', 'Brainiest_Bed1', 'Brainiest_Bed2'];

export function useSoundEngine(matchState: MatchState | null, socket?: Socket | null) {
  const audioCacheRef = useRef<{ [soundId: string]: HTMLAudioElement }>({});
  const activeAudiosRef = useRef<HTMLAudioElement[]>([]);
  const playingSoundIdsRef = useRef<Set<string>>(new Set());
  const processedTsSetRef = useRef<Set<number>>(new Set());
  const pendingTimeoutsRef = useRef<number[]>([]);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState<boolean>(false);

  // Unblock AudioContext and HTML5 Audio elements upon user interaction
  const unlockAudio = useCallback(() => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        const ctx = new AudioCtxClass();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
      }

      // Play silent HTML5 Audio element to unblock native audio elements
      const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
      silentAudio.play().then(() => {
        setIsAudioUnlocked(true);
      }).catch(() => {
        setIsAudioUnlocked(true);
      });
    } catch (e) {
      console.warn('Audio unlock error:', e);
      setIsAudioUnlocked(true);
    }
  }, []);

  useEffect(() => {
    const handleUserGesture = () => {
      unlockAudio();
      removeListeners();
    };

    const removeListeners = () => {
      window.removeEventListener('click', handleUserGesture, true);
      window.removeEventListener('touchstart', handleUserGesture, true);
      window.removeEventListener('keydown', handleUserGesture, true);
      window.removeEventListener('mousedown', handleUserGesture, true);
    };

    window.addEventListener('click', handleUserGesture, true);
    window.addEventListener('touchstart', handleUserGesture, true);
    window.addEventListener('keydown', handleUserGesture, true);
    window.addEventListener('mousedown', handleUserGesture, true);

    return () => {
      removeListeners();
    };
  }, [unlockAudio]);

  // Initialize or get HTML5 Audio instance
  const getAudioInstance = useCallback((soundId: string): HTMLAudioElement | null => {
    if (typeof window === 'undefined') return null;

    const def = SOUND_REGISTRY.find(s => s.id === soundId);
    if (!def) return null;

    if (!audioCacheRef.current[soundId]) {
      const audio = new Audio(`${SOUND_PATH_PREFIX}${def.fileName}`);
      audio.preload = 'auto';
      audioCacheRef.current[soundId] = audio;
    }

    return audioCacheRef.current[soundId];
  }, []);

  // Stop all active audio elements (preserves background beds unless includeBeds is true)
  const stopAllLocalAudios = useCallback((includeBeds = false) => {
    // Clear all pending chained audio timeouts
    pendingTimeoutsRef.current.forEach(t => window.clearTimeout(t));
    pendingTimeoutsRef.current = [];

    const preservedBeds = new Set<string>();
    if (!includeBeds) {
      BACKGROUND_BEDS.forEach(bedId => {
        if (playingSoundIdsRef.current.has(bedId)) {
          preservedBeds.add(bedId);
        }
      });
    }

    playingSoundIdsRef.current.clear();
    preservedBeds.forEach(bedId => {
      playingSoundIdsRef.current.add(bedId);
    });

    // 1. Pause active audios
    activeAudiosRef.current.forEach(audio => {
      const isPreserved = !includeBeds && BACKGROUND_BEDS.some(bedId => audioCacheRef.current[bedId] === audio && preservedBeds.has(bedId));
      if (!isPreserved) {
        try {
          audio.pause();
          audio.onended = null;
          if (audio.readyState > 0) {
            audio.currentTime = 0;
          }
        } catch (e) {
          console.warn('Error pausing audio:', e);
        }
      }
    });
    activeAudiosRef.current = includeBeds ? [] : activeAudiosRef.current.filter(audio =>
      BACKGROUND_BEDS.some(bedId => audioCacheRef.current[bedId] === audio && preservedBeds.has(bedId))
    );

    // 2. Pause all cached audios as a safety fallback
    Object.entries(audioCacheRef.current).forEach(([id, audio]: [string, HTMLAudioElement]) => {
      if (!includeBeds && BACKGROUND_BEDS.includes(id) && preservedBeds.has(id)) return;
      try {
        audio.pause();
        audio.onended = null;
        if (audio.readyState > 0) {
          audio.currentTime = 0;
        }
      } catch (e) {
        console.warn('Error pausing cached audio:', e);
      }
    });
  }, []);

  const pauseSoundLocal = useCallback((soundId: string) => {
    playingSoundIdsRef.current.delete(soundId);
    const audio = audioCacheRef.current[soundId];
    if (audio) {
      try {
        audio.pause();
      } catch (e) {
        console.warn('Error pausing audio:', soundId, e);
      }
    }
  }, []);

  const stopSoundLocal = useCallback((soundId: string) => {
    playingSoundIdsRef.current.delete(soundId);
    const audio = audioCacheRef.current[soundId];
    if (audio) {
      try {
        audio.pause();
        if (audio.readyState > 0) {
          audio.currentTime = 0;
        }
      } catch (e) {
        console.warn('Error stopping audio:', soundId, e);
      }
      activeAudiosRef.current = activeAudiosRef.current.filter(a => a !== audio);
    }
  }, []);

  // Play audio locally
  const playSoundLocal = useCallback((soundId: string) => {
    const def = SOUND_REGISTRY.find(s => s.id === soundId);
    if (!def) return;

    const config = matchState?.audioConfig || { volume: 1.0, isMuted: false };
    if (config.isMuted) return;

    // "dừng lại khi âm UC_Last3Minutes phát hoặc âm UC_End phát"
    if (
      soundId === 'UC_Last3Minutes' ||
      soundId === 'UC_End' ||
      soundId === 'DauTri_3Min_Warning' ||
      soundId === 'DauTri_End'
    ) {
      stopSoundLocal('General_Ambience');
    }

    // "Các dòng kết thúc bằng dấu (*) nghĩa là được phép chạy đè các âm thanh khác phát trước đó, nếu không có thì ngay lập tức dừng khi có âm thanh khác phát sau nó."
    if (!def.canOverlay) {
      stopAllLocalAudios(false);
    }

    playingSoundIdsRef.current.add(soundId);

    const audio = getAudioInstance(soundId);
    if (audio) {
      try {
        const isReducedBed = BACKGROUND_BEDS.includes(soundId);
        const isDauTriAmbience = soundId === 'General_Ambience' && matchState?.currentRound === 'DAU_TRI';
        const targetVol = isDauTriAmbience
          ? config.volume * 0.4
          : (isReducedBed ? config.volume * 0.3 : config.volume);
        audio.volume = Math.max(0, Math.min(1, targetVol));
        audio.loop = isDauTriAmbience ? true : !!def.loop;

        // Auto-chaining for Chinh Phuc & Dau Tri intro
        if (soundId === 'Brainiest_Start') {
          audio.onended = () => {
            playSoundLocal('Brainiest_Bed1');
          };
        } else if (soundId === 'Brainiest_StartTurn') {
          audio.onended = () => {
            playSoundLocal('Brainiest_Bed2');
          };
        } else if (soundId === 'UC_Start' || soundId === 'DauTri_Start') {
          // Sau khi nhạc UC_Start phát, nhạc General_Ambience được phát ra liên tục dưới nền với âm lượng bằng 40%
          audio.onended = () => {
            playSoundLocal('General_Ambience');
          };
        } else {
          audio.onended = null;
        }

        // Reset playback position safely without throwing DOMException if not loaded
        try {
          if (audio.readyState > 0 && audio.currentTime > 0) {
            audio.currentTime = 0;
          }
        } catch (seekErr) {
          console.warn(`Could not reset currentTime for ${soundId}:`, seekErr);
        }

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Check if audio was requested to stop while playPromise was resolving
              if (!playingSoundIdsRef.current.has(soundId)) {
                try {
                  audio.pause();
                  if (audio.readyState > 0) {
                    audio.currentTime = 0;
                  }
                } catch (pErr) {
                  console.warn(`Error pausing audio after delayed resolution for ${soundId}:`, pErr);
                }
              } else {
                if (!activeAudiosRef.current.includes(audio)) {
                  activeAudiosRef.current.push(audio);
                }
              }
            })
            .catch((err) => {
              console.warn(`HTML5 audio play failed for ${soundId} (${err.message}). Falling back to Web Audio synth.`);
              if (playingSoundIdsRef.current.has(soundId)) {
                synthesizeSound(def.synthType || 'chime', config.volume);
                if (soundId === 'Brainiest_Start') {
                  const t = window.setTimeout(() => {
                    playSoundLocal('Brainiest_Bed1');
                  }, 4000);
                  pendingTimeoutsRef.current.push(t);
                } else if (soundId === 'Brainiest_StartTurn') {
                  const t = window.setTimeout(() => {
                    playSoundLocal('Brainiest_Bed2');
                  }, 3000);
                  pendingTimeoutsRef.current.push(t);
                } else if (soundId === 'UC_Start' || soundId === 'DauTri_Start') {
                  const t = window.setTimeout(() => {
                    playSoundLocal('General_Ambience');
                  }, 4000);
                  pendingTimeoutsRef.current.push(t);
                }
              }
            });
        }
      } catch (err) {
        console.warn(`Audio play catch for ${soundId}:`, err);
        synthesizeSound(def.synthType || 'chime', config.volume);
      }
    } else {
      synthesizeSound(def.synthType || 'chime', config.volume);
      if (soundId === 'UC_Start' || soundId === 'DauTri_Start') {
        const t = window.setTimeout(() => {
          playSoundLocal('General_Ambience');
        }, 4000);
        pendingTimeoutsRef.current.push(t);
      }
    }
  }, [getAudioInstance, matchState?.audioConfig, matchState?.currentRound, stopAllLocalAudios, stopSoundLocal]);

  const resumeSoundLocal = useCallback((soundId: string) => {
    const def = SOUND_REGISTRY.find(s => s.id === soundId);
    if (!def) return;

    const config = matchState?.audioConfig || { volume: 1.0, isMuted: false };
    if (config.isMuted) return;

    playingSoundIdsRef.current.add(soundId);

    const audio = getAudioInstance(soundId);
    if (audio) {
      try {
        const isReducedBed = BACKGROUND_BEDS.includes(soundId);
        const targetVol = isReducedBed ? config.volume * 0.3 : config.volume;
        audio.volume = Math.max(0, Math.min(1, targetVol));
        audio.loop = !!def.loop;

        try {
          if (audio.ended && audio.readyState > 0) {
            audio.currentTime = 0;
          }
        } catch (seekErr) {
          console.warn(`Could not reset currentTime on resume for ${soundId}:`, seekErr);
        }

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              if (!activeAudiosRef.current.includes(audio)) {
                activeAudiosRef.current.push(audio);
              }
            })
            .catch((err) => {
              console.warn(`HTML5 audio resume failed for ${soundId} (${err.message}).`);
            });
        }
      } catch (err) {
        console.warn('Error resuming audio:', soundId, err);
      }
    }
  }, [getAudioInstance, matchState?.audioConfig]);

  // Effect: Stop all active sounds and background beds when transitioning between rounds
  const prevRoundRef = useRef<string | undefined>(matchState?.currentRound);
  useEffect(() => {
    if (
      prevRoundRef.current !== undefined &&
      matchState?.currentRound &&
      prevRoundRef.current !== matchState?.currentRound
    ) {
      stopAllLocalAudios(true);
    }
    prevRoundRef.current = matchState?.currentRound;
  }, [matchState?.currentRound, stopAllLocalAudios]);

  // Effect: Listen for real-time audio event broadcast from socket / state
  useEffect(() => {
    const events: Array<{ soundId?: string; action: string; timestamp?: number }> = [];
    if (matchState?.audioEvents && matchState.audioEvents.length > 0) {
      events.push(...matchState.audioEvents);
    } else if (matchState?.audioEvent) {
      events.push(matchState.audioEvent);
    }

    if (events.length === 0) return;

    const now = Date.now();
    events.forEach(evt => {
      const { soundId, action, timestamp } = evt;
      if (!timestamp) return;

      // Ignore old audio events older than 6 seconds (prevents bursts of historical audio on mount)
      if (now - timestamp > 6000) {
        processedTsSetRef.current.add(timestamp);
        return;
      }

      if (!processedTsSetRef.current.has(timestamp)) {
        processedTsSetRef.current.add(timestamp);

        if (processedTsSetRef.current.size > 100) {
          const items = Array.from(processedTsSetRef.current);
          processedTsSetRef.current = new Set(items.slice(50));
        }

        if (action === 'STOP_ALL') {
          stopAllLocalAudios(true);
        } else if (action === 'PLAY' && soundId) {
          playSoundLocal(soundId);
        } else if (action === 'PAUSE' && soundId) {
          pauseSoundLocal(soundId);
        } else if (action === 'RESUME' && soundId) {
          resumeSoundLocal(soundId);
        } else if (action === 'STOP' && soundId) {
          stopSoundLocal(soundId);
        }
      }
    });
  }, [matchState?.audioEvents, matchState?.audioEvent, playSoundLocal, pauseSoundLocal, resumeSoundLocal, stopSoundLocal, stopAllLocalAudios]);

  // Effect: Update volume & mute status of currently playing audios when config changes
  useEffect(() => {
    if (!matchState?.audioConfig) return;
    const { volume, isMuted } = matchState.audioConfig;

    activeAudiosRef.current.forEach(audio => {
      audio.muted = isMuted;
      const isDauTriAmbience = audioCacheRef.current['General_Ambience'] === audio && matchState?.currentRound === 'DAU_TRI';
      const isReducedBed = BACKGROUND_BEDS.some(bedId => audioCacheRef.current[bedId] === audio);
      const targetVol = isDauTriAmbience
        ? volume * 0.4
        : (isReducedBed ? volume * 0.3 : volume);
      audio.volume = Math.max(0, Math.min(1, targetVol));
    });
  }, [matchState?.audioConfig, matchState?.currentRound]);

  // Effect: Safeguard to immediately pause Tang Toc countdown sounds when a contestant buzzes or timer stops
  const prevTimerRunningTT = useRef<boolean>(false);
  useEffect(() => {
    if (matchState?.currentRound === 'TANG_TOC') {
      const isBuzzed = !!(matchState.buzzerState === 'BUZZED' || matchState.buzzedPlayer || matchState.tang_toc?.buzzedPlayer);
      const isTimerRunning = !!matchState.isTimerRunning;

      if (isBuzzed || (!isTimerRunning && prevTimerRunningTT.current)) {
        pauseSoundLocal('Acceleration_10Seconds');
        pauseSoundLocal('Acceleration_20Seconds');
        pauseSoundLocal('Acceleration_30Seconds');
        pauseSoundLocal('Acceleration_40Seconds');
      }
      prevTimerRunningTT.current = isTimerRunning;
    }
  }, [matchState?.currentRound, matchState?.buzzerState, matchState?.buzzedPlayer, matchState?.tang_toc?.buzzedPlayer, matchState?.isTimerRunning, pauseSoundLocal]);

  // Admin Trigger methods
  const triggerPlaySound = useCallback((soundId: string) => {
    if (socket) {
      socket.emit(SocketEvent.ADMIN_PLAY_SOUND, { soundId });
    } else {
      playSoundLocal(soundId);
    }
  }, [socket, playSoundLocal]);

  const triggerStopAll = useCallback(() => {
    stopAllLocalAudios(true);
    if (socket) {
      socket.emit(SocketEvent.ADMIN_STOP_ALL_SOUNDS);
    }
  }, [socket, stopAllLocalAudios]);

  const triggerUpdateConfig = useCallback((volume: number, isMuted: boolean) => {
    if (socket) {
      socket.emit(SocketEvent.ADMIN_UPDATE_AUDIO_CONFIG, { volume, isMuted });
    }
  }, [socket]);

  return {
    isAudioUnlocked,
    unlockAudio,
    triggerPlaySound,
    triggerStopAll,
    triggerUpdateConfig,
    playSoundLocal,
    stopAllLocalAudios
  };
}
