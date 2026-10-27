import React, { useEffect, useState, useRef } from 'react';

interface SmoothTimerBarProps {
  seconds: number;
  total: number;
  isRunning: boolean;
  className?: string;
  barGradient?: string;
  heightClass?: string;
}

export default function SmoothTimerBar({
  seconds,
  total,
  isRunning,
  className = '',
  barGradient = 'from-emerald-500 via-teal-400 to-amber-400',
  heightClass = 'h-3'
}: SmoothTimerBarProps) {
  const [percent, setPercent] = useState<number>(() => {
    if (!total || total <= 0) return 0;
    return Math.min(100, Math.max(0, ((total - seconds) / total) * 100));
  });

  const lastSecondsRef = useRef(seconds);
  const lastTimeRef = useRef(Date.now());
  const animationFrameRef = useRef<number | null>(null);

  // Synchronize reference anchor whenever seconds or isRunning state updates from socket
  useEffect(() => {
    lastSecondsRef.current = seconds;
    lastTimeRef.current = Date.now();
  }, [seconds, isRunning]);

  useEffect(() => {
    if (!isRunning || !total || total <= 0) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      const staticPct = (total && total > 0 && seconds >= 0)
        ? Math.min(100, Math.max(0, ((total - seconds) / total) * 100))
        : 0;
      setPercent(staticPct);
      return;
    }

    const updateProgress = () => {
      const elapsedSec = (Date.now() - lastTimeRef.current) / 1000;
      const currentRemaining = Math.max(0, lastSecondsRef.current - elapsedSec);
      const currentPct = Math.min(100, Math.max(0, ((total - currentRemaining) / total) * 100));
      setPercent(currentPct);

      if (currentRemaining > 0 && isRunning) {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isRunning, total, seconds]);

  if (!isRunning) {
    return null;
  }

  const hasPosClass = className.includes('absolute') || className.includes('relative') || className.includes('fixed');
  const posClass = hasPosClass ? '' : 'relative';

  return (
    <div className={`w-full ${heightClass} bg-slate-950/90 pointer-events-none z-30 ${posClass} ${className}`}>
      {/* Background Track */}
      <div className="w-full h-full bg-slate-900/90 relative">
        {/* Progress Fill */}
        <div
          className={`h-full bg-gradient-to-r ${barGradient} relative shadow-[0_0_16px_rgba(16,185,129,0.9)]`}
          style={{ width: `${percent}%` }}
        >
          {/* Node Time Indicator - Positioned strictly on top (z-40) */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white rounded-full z-40 border-2 border-slate-950 shadow-[0_0_12px_#fff,0_0_24px_#10b981]" />
        </div>
      </div>
    </div>
  );
}
