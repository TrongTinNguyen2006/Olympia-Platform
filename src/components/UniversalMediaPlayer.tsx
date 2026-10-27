import React, { useEffect, useRef } from 'react';
import { MediaAttachment, MediaControlState } from '../types.js';
import { Volume2, Image as ImageIcon, Music } from 'lucide-react';

interface UniversalMediaPlayerProps {
  media?: MediaAttachment;
  mediaControl?: MediaControlState;
  className?: string;
  largeMode?: boolean;
  round?: string;
  isTimerRunning?: boolean;
  hideControls?: boolean;
  hideFrame?: boolean;
}

export function formatMediaUrl(rawUrl: string, type?: 'image' | 'audio' | 'video'): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();

  // Handle Google Drive links:
  // - https://drive.google.com/file/d/FILE_ID/view...
  // - https://drive.google.com/open?id=FILE_ID
  // - https://drive.google.com/uc?id=FILE_ID
  // - https://docs.google.com/uc?export=download&id=FILE_ID
  const driveFileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || 
                           url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveFileIdMatch && driveFileIdMatch[1]) {
    const fileId = driveFileIdMatch[1];
    // lh3.googleusercontent.com/d/FILE_ID is Google's direct CDN proxy for Drive files!
    // Streams raw bytes directly with proper CORS headers for <audio>, <video>, <img>
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  // Handle Dropbox links
  if (url.includes('dropbox.com')) {
    return url.replace('www.dropbox.com', 'dl.dropboxusercontent.com')
              .replace('?dl=0', '?dl=1');
  }

  return url;
}

export function getYouTubeEmbedUrl(url: string, isPlaying: boolean, controls: number = 1, isMuted: boolean = false): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2] && match[2].length === 11) {
    const videoId = match[2];
    return `https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}&controls=${controls}&enablejsapi=1&rel=0`;
  }
  return null;
}

export function getVimeoEmbedUrl(url: string, isPlaying: boolean, isMuted: boolean = false): string | null {
  if (!url) return null;
  const match = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/);
  if (match && match[3]) {
    return `https://player.vimeo.com/video/${match[3]}?autoplay=${isPlaying ? 1 : 0}&muted=${isMuted ? 1 : 0}`;
  }
  return null;
}

export default function UniversalMediaPlayer({
  media,
  mediaControl,
  className = '',
  largeMode = false,
  round = '',
  isTimerRunning = false,
  hideControls = false,
  hideFrame = false,
}: UniversalMediaPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isAutoplayBlocked, setIsAutoplayBlocked] = React.useState(false);
  const [loadError, setLoadError] = React.useState(false);
  const [currentAudioSrcIndex, setCurrentAudioSrcIndex] = React.useState(0);

  const rawUrl = media?.url || '';
  const primaryCleanUrl = formatMediaUrl(rawUrl, media?.type);

  // Derive Google Drive file ID if applicable
  const driveMatch = rawUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || rawUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  const driveFileId = driveMatch ? driveMatch[1] : null;

  // Build audio fallback candidate list
  const audioSources = React.useMemo(() => {
    if (!primaryCleanUrl) return [];
    if (driveFileId) {
      return [
        `https://lh3.googleusercontent.com/d/${driveFileId}`,
        `https://drive.usercontent.google.com/download?id=${driveFileId}&export=download`,
        `https://docs.google.com/uc?export=download&id=${driveFileId}`,
      ];
    }
    return [primaryCleanUrl];
  }, [primaryCleanUrl, driveFileId]);

  const cleanUrl = audioSources[currentAudioSrcIndex] || primaryCleanUrl;

  // Reset fallback index and error state when media URL changes
  useEffect(() => {
    setCurrentAudioSrcIndex(0);
    setLoadError(false);
    setIsAutoplayBlocked(false);
  }, [rawUrl]);

  // Auto-detect type if extension or URL indicates audio/video
  let type = media?.type || 'image';
  if (primaryCleanUrl) {
    const lower = primaryCleanUrl.toLowerCase();
    if (lower.match(/\.(mp3|wav|ogg|m4a|aac|flac)($|\?)/)) {
      type = 'audio';
    } else if (
      lower.match(/\.(mp4|webm|mov|m4v)($|\?)/) || 
      lower.includes('youtube.com') || 
      lower.includes('youtu.be') ||
      lower.includes('vimeo.com')
    ) {
      if (type !== 'audio') {
        type = 'video';
      }
    }
  }

  // Determine active playback state:
  // - If mediaControl explicitly requested play, or timer is currently running, or Khoi Dong, or preview (no round).
  const isKhoiDong = round === 'KHOI_DONG';
  const isPlaying = !!(mediaControl?.isPlaying || isTimerRunning || isKhoiDong || !round);

  const mediaKey = mediaControl?.key ?? 0;
  const isMuted = round === 'TANG_TOC';

  // Check specialized video providers
  const ytEmbedUrl = getYouTubeEmbedUrl(primaryCleanUrl, isPlaying, hideControls ? 0 : 1, isMuted);
  const vimeoEmbedUrl = getVimeoEmbedUrl(primaryCleanUrl, isPlaying, isMuted);
  const driveEmbedUrl = (type === 'video' && driveFileId && !ytEmbedUrl && !vimeoEmbedUrl)
    ? `https://drive.google.com/file/d/${driveFileId}/preview`
    : null;

  const lastUrl = useRef<string | null>(null);
  const lastMediaKey = useRef<number>(0);

  // Audio Playback Effect
  useEffect(() => {
    if (type !== 'audio' || ytEmbedUrl || !audioRef.current) return;
    const audio = audioRef.current;

    if (!cleanUrl) return;

    const isUrlChanged = lastUrl.current !== cleanUrl;
    const isKeyChanged = lastMediaKey.current !== mediaKey;

    lastUrl.current = cleanUrl;
    lastMediaKey.current = mediaKey;

    if (isUrlChanged) {
      audio.src = cleanUrl;
      audio.load();
    } else if (isKeyChanged && mediaKey > 0) {
      try {
        audio.currentTime = 0;
      } catch (e) {}
    }

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsAutoplayBlocked(false);
          })
          .catch((err) => {
            console.warn('Audio play request blocked or deferred by autoplay policy:', err);
            setIsAutoplayBlocked(true);
          });
      }
    } else {
      audio.pause();
    }
  }, [cleanUrl, isPlaying, mediaKey, type, ytEmbedUrl]);

  // Fallback to next candidate URL if current audio fails to load
  const handleAudioError = () => {
    if (type === 'audio' && audioSources.length > 1 && currentAudioSrcIndex < audioSources.length - 1) {
      console.warn(`Audio source #${currentAudioSrcIndex} failed. Trying fallback source...`);
      setCurrentAudioSrcIndex((prev) => prev + 1);
    } else if (type === 'audio') {
      console.error('All audio candidate URLs failed to load.');
      setLoadError(true);
    }
  };

  // User gesture listener to automatically unlock audio/video if autoplay was blocked
  useEffect(() => {
    if ((type !== 'audio' && type !== 'video') || ytEmbedUrl || !isPlaying) return;

    const unlockMedia = () => {
      if (type === 'audio' && audioRef.current && audioRef.current.paused && isPlaying) {
        audioRef.current
          .play()
          .then(() => {
            setIsAutoplayBlocked(false);
          })
          .catch(() => {});
      }
      if (type === 'video' && videoRef.current && videoRef.current.paused && isPlaying) {
        videoRef.current
          .play()
          .then(() => {
            setIsAutoplayBlocked(false);
          })
          .catch(() => {});
      }
    };

    window.addEventListener('click', unlockMedia);
    window.addEventListener('touchstart', unlockMedia);
    window.addEventListener('keydown', unlockMedia);

    return () => {
      window.removeEventListener('click', unlockMedia);
      window.removeEventListener('touchstart', unlockMedia);
      window.removeEventListener('keydown', unlockMedia);
    };
  }, [type, ytEmbedUrl, isPlaying, cleanUrl]);

  // Automatically pause audio in VCNV and VE_DICH when the timer stops
  const prevIsTimerRunningAudio = useRef(isTimerRunning);
  useEffect(() => {
    if (type === 'audio' && (round === 'VCNV' || round === 'VE_DICH')) {
      if (!isTimerRunning && prevIsTimerRunningAudio.current) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
      }
    }
    prevIsTimerRunningAudio.current = isTimerRunning;
  }, [isTimerRunning, round, type]);

  // Ensure video element muting state is updated
  useEffect(() => {
    if (type === 'video' && videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted, type]);

  // Handle Play/Pause and Replay on native Video element
  useEffect(() => {
    if (type === 'video' && videoRef.current && !ytEmbedUrl && !driveEmbedUrl && !vimeoEmbedUrl) {
      videoRef.current.src = cleanUrl;
      videoRef.current.load();
    }
  }, [cleanUrl, type, ytEmbedUrl, driveEmbedUrl, vimeoEmbedUrl]);

  const prevIsTimerRunning = useRef(isTimerRunning);
  useEffect(() => {
    if (type === 'video' && videoRef.current && !ytEmbedUrl && !driveEmbedUrl && !vimeoEmbedUrl) {
      if (isPlaying) {
        if (!prevIsTimerRunning.current && isTimerRunning) {
          try {
            videoRef.current.currentTime = 0;
          } catch (e) {}
        }
        videoRef.current.play().catch((err) => {
          console.log('Video play error:', err);
          setIsAutoplayBlocked(true);
        });
      } else {
        videoRef.current.pause();
      }
    }
    prevIsTimerRunning.current = isTimerRunning;
  }, [isPlaying, isTimerRunning, type, ytEmbedUrl, driveEmbedUrl, vimeoEmbedUrl]);

  useEffect(() => {
    if (type === 'video' && videoRef.current && !ytEmbedUrl && !driveEmbedUrl && !vimeoEmbedUrl && mediaKey > 0) {
      videoRef.current.currentTime = 0;
      if (isPlaying) {
        videoRef.current.play().catch((err) => console.log('Video replay error:', err));
      }
    }
  }, [mediaKey]);

  if (!cleanUrl) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center text-slate-500 bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl aspect-video w-full">
        <ImageIcon className="w-8 h-8 mb-2 stroke-[1.25]" />
        <p className="text-xs">Không có tệp đính kèm media</p>
      </div>
    );
  }

  // Audio with hidden controls (e.g. on viewer/player/MC)
  if (type === 'audio' && hideControls) {
    if (ytEmbedUrl) {
      return (
        <div className={`w-full h-full flex items-center justify-center relative overflow-hidden ${className}`}>
          <iframe
            key={`${ytEmbedUrl}-${mediaKey}-${isPlaying}`}
            src={ytEmbedUrl}
            title="YouTube audio player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full object-contain pointer-events-none opacity-0"
          />
        </div>
      );
    }

    return (
      <div className="hidden">
        <audio
          ref={audioRef}
          src={cleanUrl}
          controls={false}
          preload="auto"
          onError={handleAudioError}
        />
        {isAutoplayBlocked && (
          <button
            type="button"
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.play().then(() => setIsAutoplayBlocked(false)).catch(() => {});
              }
            }}
            className="fixed bottom-4 right-4 z-50 px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-full shadow-2xl animate-bounce flex items-center gap-2 cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>Click để bật âm thanh câu hỏi</span>
          </button>
        )}
      </div>
    );
  }

  if (hideFrame) {
    return (
      <div className={`w-full h-full flex items-center justify-center relative overflow-hidden ${className}`}>
        {/* 1. IMAGE DISPLAY */}
        {type === 'image' && (
          <img
            key={`${cleanUrl}-${mediaKey}`}
            src={cleanUrl}
            alt="Media câu hỏi"
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        )}

        {/* 2. AUDIO DISPLAY */}
        {type === 'audio' && (
          ytEmbedUrl ? (
            <iframe
              key={`${ytEmbedUrl}-${mediaKey}-${isPlaying}`}
              src={ytEmbedUrl}
              title="YouTube audio player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full object-contain"
            />
          ) : (
            <>
              <audio
                ref={audioRef}
                src={cleanUrl}
                controls={false}
                preload="auto"
                onError={handleAudioError}
                className="hidden"
              />
              {isAutoplayBlocked && (
                <button
                  type="button"
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.play().then(() => setIsAutoplayBlocked(false)).catch(() => {});
                    }
                  }}
                  className="px-3 py-1 bg-amber-500 text-slate-950 font-bold text-xs rounded-full shadow-lg animate-pulse flex items-center gap-1 cursor-pointer z-30"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Bật âm thanh</span>
                </button>
              )}
            </>
          )
        )}

        {/* 3. VIDEO DISPLAY */}
        {type === 'video' && (
          <div className="w-full h-full flex items-center justify-center relative">
            {ytEmbedUrl ? (
              <iframe
                key={`${ytEmbedUrl}-${mediaKey}-${isPlaying}`}
                src={ytEmbedUrl}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full object-contain"
              />
            ) : vimeoEmbedUrl ? (
              <iframe
                key={`${vimeoEmbedUrl}-${mediaKey}-${isPlaying}`}
                src={vimeoEmbedUrl}
                title="Vimeo video player"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="w-full h-full object-contain"
              />
            ) : driveEmbedUrl ? (
              <iframe
                key={`${driveEmbedUrl}-${mediaKey}`}
                src={driveEmbedUrl}
                title="Google Drive video player"
                frameBorder="0"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="w-full h-full object-contain"
              />
            ) : (
              <video
                ref={videoRef}
                key={`${cleanUrl}-${mediaKey}`}
                src={cleanUrl}
                autoPlay={isPlaying}
                muted={isMuted}
                controls={!hideControls}
                playsInline
                onError={() => setLoadError(true)}
                className="w-full h-full object-contain"
              />
            )}
            {hideControls && (
              <div className="absolute inset-0 bg-transparent z-10 cursor-default pointer-events-none" />
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`relative rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 flex items-center justify-center shadow-2xl transition-all ${className}`}
    >
      {/* 1. IMAGE DISPLAY */}
      {type === 'image' && (
        <div className="w-full h-full flex items-center justify-center relative p-1">
          <img
            key={`${cleanUrl}-${mediaKey}`}
            src={cleanUrl}
            alt="Media câu hỏi"
            className="h-full aspect-video object-contain rounded-xl"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* 2. AUDIO DISPLAY */}
      {type === 'audio' && (
        <div className="p-6 w-full flex flex-col items-center justify-center text-center space-y-3">
          {ytEmbedUrl ? (
            <div className="w-full aspect-video max-h-[220px] rounded-xl overflow-hidden">
              <iframe
                key={`${ytEmbedUrl}-${mediaKey}-${isPlaying}`}
                src={ytEmbedUrl}
                title="YouTube audio player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
                <Music className="w-5 h-5 animate-bounce text-teal-400" />
                <span>Âm thanh đính kèm câu hỏi</span>
              </div>

              {loadError ? (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
                  ⚠️ Không thể tải file âm thanh. Vui lòng kiểm tra lại đường dẫn link (hoặc mở quyền chia sẻ trên Google Drive).
                </div>
              ) : (
                <audio
                  ref={audioRef}
                  src={cleanUrl}
                  controls={true}
                  preload="auto"
                  onError={handleAudioError}
                  className="w-full max-w-md h-10 rounded-lg accent-teal-500"
                />
              )}

              {isAutoplayBlocked && !loadError && (
                <div className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-xs font-bold flex items-center gap-2 animate-pulse">
                  <Volume2 className="w-4 h-4" />
                  <span>Trình duyệt đang chặn tự động phát âm thanh. Nhấp vào nút bên dưới để mở!</span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = 0;
                      audioRef.current.play().then(() => setIsAutoplayBlocked(false)).catch(e => console.error(e));
                    }
                  }}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-full transition-all cursor-pointer flex items-center gap-2 shadow-md hover:scale-105 active:scale-95"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>▶️ Phát âm thanh / Từ đầu</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* 3. VIDEO DISPLAY */}
      {type === 'video' && (
        <div className="w-full h-full flex flex-col items-center justify-center relative p-1">
          {ytEmbedUrl ? (
            <div className="h-full aspect-video flex items-center justify-center relative">
              <iframe
                key={`${ytEmbedUrl}-${mediaKey}-${isPlaying}`}
                src={ytEmbedUrl}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="h-full aspect-video rounded-xl object-contain"
              />
            </div>
          ) : vimeoEmbedUrl ? (
            <div className="h-full aspect-video flex items-center justify-center relative">
              <iframe
                key={`${vimeoEmbedUrl}-${mediaKey}-${isPlaying}`}
                src={vimeoEmbedUrl}
                title="Vimeo video player"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="h-full aspect-video rounded-xl object-contain"
              />
            </div>
          ) : driveEmbedUrl ? (
            <div className="h-full aspect-video flex items-center justify-center relative">
              <iframe
                key={`${driveEmbedUrl}-${mediaKey}`}
                src={driveEmbedUrl}
                title="Google Drive video player"
                frameBorder="0"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="h-full aspect-video rounded-xl object-contain"
              />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              {loadError ? (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center space-y-2">
                  <p>⚠️ Không thể phát video trực tiếp. Vui lòng kiểm tra lại quyền truy cập link hoặc định dạng file.</p>
                  <a
                    href={rawUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block px-3 py-1 bg-red-500 hover:bg-red-400 text-white font-bold rounded-lg text-[11px]"
                  >
                    🔗 Mở video trong thẻ mới
                  </a>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  key={`${cleanUrl}-${mediaKey}`}
                  src={cleanUrl}
                  autoPlay={isPlaying}
                  muted={isMuted}
                  controls={!hideControls}
                  playsInline
                  onError={() => setLoadError(true)}
                  className="h-full aspect-video object-contain rounded-xl"
                />
              )}
            </div>
          )}

          {hideControls && (
            <div className="absolute inset-0 bg-transparent z-10 cursor-default pointer-events-none" />
          )}
        </div>
      )}
    </div>
  );
}
