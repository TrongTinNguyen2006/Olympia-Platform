import React, { useState, useEffect } from 'react';

interface CountUpScoreProps {
  score: number;
}

export default function CountUpScore({ score }: CountUpScoreProps) {
  const [displayScore, setDisplayScore] = useState(score);

  useEffect(() => {
    let start = displayScore;
    const end = score;
    if (start === end) return;

    const duration = 1000; // Animation duration in milliseconds
    const startTime = performance.now();

    const updateScore = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out quad formula
      const easedProgress = progress * (2 - progress);
      const currentVal = Math.round(start + (end - start) * easedProgress);

      setDisplayScore(currentVal);

      if (progress < 1) {
        requestAnimationFrame(updateScore);
      }
    };

    const animId = requestAnimationFrame(updateScore);
    return () => cancelAnimationFrame(animId);
  }, [score, displayScore]);

  return <span className="font-mono font-black tabular-nums">{displayScore}</span>;
}
