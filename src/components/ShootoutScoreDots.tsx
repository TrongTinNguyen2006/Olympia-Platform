import React from 'react';
import { Check, X } from 'lucide-react';

interface ShootoutScoreDotsProps {
  history?: boolean[];
  isCurrentTurn?: boolean;
  totalDots?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function ShootoutScoreDots({
  history = [],
  isCurrentTurn = false,
  totalDots = 5,
  size = 'md',
  showLabel = false,
}: ShootoutScoreDotsProps) {
  const currentTotal = history.length + (isCurrentTurn ? 1 : 0);
  let startIndex = 0;
  if (currentTotal > totalDots) {
    startIndex = currentTotal - totalDots;
  }

  const dotIndices = Array.from({ length: totalDots }, (_, i) => startIndex + i);

  const sizeClasses = {
    sm: {
      circle: 'w-5 h-5 text-[10px]',
      icon: 'w-3 h-3',
      gap: 'gap-1',
    },
    md: {
      circle: 'w-7 h-7 text-xs',
      icon: 'w-4 h-4',
      gap: 'gap-1.5',
    },
    lg: {
      circle: 'w-9 h-9 text-sm',
      icon: 'w-5 h-5',
      gap: 'gap-2',
    },
  }[size];

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`flex items-center ${sizeClasses.gap}`}>
        {dotIndices.map((idx) => {
          const val = history[idx];
          const isNextForCurrentTurn = isCurrentTurn && idx === history.length;

          if (val === true) {
            return (
              <div
                key={idx}
                className={`${sizeClasses.circle} rounded-full bg-emerald-500 border border-emerald-400 text-white font-black flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.6)] transform scale-100 transition-all`}
                title={`Lượt ${idx + 1}: Đúng`}
              >
                <Check className={sizeClasses.icon} strokeWidth={3} />
              </div>
            );
          }

          if (val === false) {
            return (
              <div
                key={idx}
                className={`${sizeClasses.circle} rounded-full bg-rose-600 border border-rose-400 text-white font-black flex items-center justify-center shadow-[0_0_10px_rgba(225,29,72,0.6)] transform scale-100 transition-all`}
                title={`Lượt ${idx + 1}: Sai`}
              >
                <X className={sizeClasses.icon} strokeWidth={3} />
              </div>
            );
          }

          if (isNextForCurrentTurn) {
            return (
              <div
                key={idx}
                className={`${sizeClasses.circle} rounded-full bg-amber-500/25 border-2 border-amber-400 text-amber-300 font-bold flex items-center justify-center animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.5)]`}
                title={`Lượt ${idx + 1}: Đang trả lời`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              </div>
            );
          }

          return (
            <div
              key={idx}
              className={`${sizeClasses.circle} rounded-full bg-slate-900 border border-slate-700/70 text-slate-600 font-bold flex items-center justify-center`}
              title={`Lượt ${idx + 1}: Chưa thực hiện`}
            >
              <span className="w-1 h-1 rounded-full bg-slate-700" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ImprovedScoreDotsProps {
  score?: number;
  maxScore?: number;
  totalTime?: number;
  size?: 'sm' | 'md' | 'lg';
  showTime?: boolean;
}

export function ImprovedScoreDots({
  score = 0,
  maxScore = 5,
  totalTime = 0,
  size = 'md',
  showTime = true,
}: ImprovedScoreDotsProps) {
  const dots = Array.from({ length: maxScore }, (_, i) => i);

  const sizeClasses = {
    sm: {
      circle: 'w-5 h-5 text-[10px]',
      icon: 'w-3 h-3',
      gap: 'gap-1',
    },
    md: {
      circle: 'w-7 h-7 text-xs',
      icon: 'w-4 h-4',
      gap: 'gap-1.5',
    },
    lg: {
      circle: 'w-9 h-9 text-sm',
      icon: 'w-5 h-5',
      gap: 'gap-2',
    },
  }[size];

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center ${sizeClasses.gap}`}>
        {dots.map((idx) => {
          const isFilled = idx < score;
          if (isFilled) {
            return (
              <div
                key={idx}
                className={`${sizeClasses.circle} rounded-full bg-emerald-500 border border-emerald-400 text-white font-black flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.6)]`}
                title={`Đúng (${idx + 1}/${maxScore})`}
              >
                <Check className={sizeClasses.icon} strokeWidth={3} />
              </div>
            );
          }
          return (
            <div
              key={idx}
              className={`${sizeClasses.circle} rounded-full bg-slate-900 border border-slate-700/70 text-slate-600 font-bold flex items-center justify-center`}
              title={`Chưa đạt`}
            >
              <span className="w-1 h-1 rounded-full bg-slate-700" />
            </div>
          );
        })}
      </div>
      {showTime && totalTime > 0 && (
        <span className="text-[11px] font-mono font-semibold text-slate-400 shrink-0">
          ({totalTime.toFixed(1)}s)
        </span>
      )}
    </div>
  );
}

