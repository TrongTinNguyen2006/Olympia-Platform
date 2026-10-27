import React, { useState, useEffect, useRef } from 'react';

interface BorderTimerProps {
  seconds: number;
  total: number;
  isRunning: boolean;
  color?: string;
}

export default function BorderTimer({ seconds, total, isRunning, color = '#ef4444' }: BorderTimerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<SVGRectElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [pathLength, setPathLength] = useState(0);
  const [nodePos, setNodePos] = useState<{ x: number; y: number } | null>(null);
  const [animDist, setAnimDist] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (rectRef.current) {
      try {
        const len = rectRef.current.getTotalLength();
        if (len > 0) setPathLength(len);
      } catch (e) {
        // ignore
      }
    }
  }, [dimensions]);

  const safeTotal = total > 0 ? total : 15;
  const targetEndTimeRef = useRef<number>(Date.now() + seconds * 1000);

  useEffect(() => {
    targetEndTimeRef.current = Date.now() + seconds * 1000;
  }, [seconds, isRunning]);

  useEffect(() => {
    if (!isRunning || pathLength === 0) {
      const clampedSeconds = Math.max(0, Math.min(seconds, safeTotal));
      const elapsedFraction = (safeTotal - clampedSeconds) / safeTotal;
      const dist = pathLength * Math.min(1, Math.max(0, elapsedFraction));
      setAnimDist(dist);
      return;
    }

    let animId: number;
    const loop = () => {
      const now = Date.now();
      const remainMs = Math.max(0, targetEndTimeRef.current - now);
      const remainSec = remainMs / 1000;
      const elapsedFraction = Math.min(1, Math.max(0, (safeTotal - remainSec) / safeTotal));
      const dist = pathLength * elapsedFraction;

      setAnimDist(dist);

      if (rectRef.current && pathLength > 0) {
        try {
          const pt = rectRef.current.getPointAtLength(dist);
          setNodePos({ x: pt.x, y: pt.y });
        } catch (e) {
          // ignore
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isRunning, pathLength, seconds, safeTotal]);

  useEffect(() => {
    if (rectRef.current && pathLength > 0) {
      try {
        const pt = rectRef.current.getPointAtLength(animDist);
        setNodePos({ x: pt.x, y: pt.y });
      } catch (e) {
        // ignore
      }
    }
  }, [animDist, pathLength]);

  const strokeWidth = 5;
  const radius = 16;
  const w = dimensions.width;
  const h = dimensions.height;

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-20 overflow-visible">
      <svg className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="timerBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
          <filter id="timerGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Base Track Reference (always mounted for length calculation) */}
        <rect
          ref={rectRef}
          x={strokeWidth / 2}
          y={strokeWidth / 2}
          width={Math.max(0, w - strokeWidth)}
          height={Math.max(0, h - strokeWidth)}
          rx={radius}
          ry={radius}
          fill="none"
          stroke={isRunning ? "rgba(255, 255, 255, 0.12)" : "none"}
          strokeWidth={strokeWidth}
        />

        {/* Animated Progress Stroke - ONLY SHOWN WHEN IS_RUNNING IS TRUE */}
        {isRunning && pathLength > 0 && animDist > 0 && (
          <rect
            x={strokeWidth / 2}
            y={strokeWidth / 2}
            width={Math.max(0, w - strokeWidth)}
            height={Math.max(0, h - strokeWidth)}
            rx={radius}
            ry={radius}
            fill="none"
            stroke="url(#timerBorderGrad)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${animDist} ${pathLength}`}
            strokeLinecap="round"
            filter="url(#timerGlow)"
          />
        )}

        {/* Glowing Head Node - ONLY SHOWN WHEN IS_RUNNING IS TRUE */}
        {isRunning && nodePos && animDist > 0 && (
          <g transform={`translate(${nodePos.x}, ${nodePos.y})`}>
            <circle r={12} fill={color} opacity={0.6} filter="blur(4px)" />
            <circle r={7} fill="#f59e0b" opacity={0.9} filter="blur(1px)" />
            <circle r={4} fill="#ffffff" />
          </g>
        )}
      </svg>
    </div>
  );
}
