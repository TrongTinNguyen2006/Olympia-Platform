import React from 'react';
import { motion } from 'motion/react';

interface CircularTimerProps {
  seconds: number;
  total: number;
  isRunning: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function CircularTimer({ seconds, total, isRunning, size = 'md' }: CircularTimerProps) {
  const dimensionMap = {
    sm: { container: 'w-32 h-32', cx: 64, cy: 64, r: 42, strokeWidth: 8, textSize: 'text-2xl' },
    md: { container: 'w-44 h-44', cx: 88, cy: 88, r: 58, strokeWidth: 10, textSize: 'text-3xl' },
    lg: { container: 'w-52 h-52', cx: 104, cy: 104, r: 70, strokeWidth: 12, textSize: 'text-4xl' },
  };

  const { container, cx, cy, r, strokeWidth, textSize } = dimensionMap[size];
  const circumference = 2 * Math.PI * r;
  const maxSec = total > 0 ? total : 0;
  
  // Default 100% full (progress = 1) when idle/not running, count down when running
  const progress = isRunning 
    ? (maxSec > 0 ? Math.max(0, Math.min(1, seconds / maxSec)) : 0)
    : 1;
  const strokeDashoffset = circumference - progress * circumference;

  const displaySeconds = isRunning 
    ? Math.max(0, Math.ceil(seconds))
    : (seconds > 0 ? Math.ceil(seconds) : (maxSec > 0 ? maxSec : 0));

  return (
    <div className={`relative ${container} flex items-center justify-center my-1 shrink-0`}>
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx={cx}
          cy={cy}
          r={r}
          className="stroke-slate-800/80"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <motion.circle
          cx={cx}
          cy={cy}
          r={r}
          className="stroke-indigo-400"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: isRunning ? 0.1 : 0.3, ease: 'linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={`${textSize} font-mono font-black ${seconds <= 5 && isRunning ? 'text-red-400 animate-pulse' : 'text-white'}`}>
          {displaySeconds}s
        </span>
      </div>
    </div>
  );
}
