import { useEffect, useState } from 'react';

const SIZE = 148;
const STROKE = 13;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ProgressRing({ rate = 0 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setDisplay(rate));
    return () => cancelAnimationFrame(frame);
  }, [rate]);

  const offset = CIRCUMFERENCE - (Math.min(100, Math.max(0, display)) / 100) * CIRCUMFERENCE;

  return (
    <div className="progress-ring-wrap" role="img" aria-label={`${rate} % des tâches terminées`}>
      <svg className="progress-ring" width={SIZE} height={SIZE}>
        <defs>
          <linearGradient id="himaRingGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7E80D8" />
            <stop offset="52%" stopColor="#CD49AA" />
            <stop offset="100%" stopColor="#67CECB" />
          </linearGradient>
        </defs>
        <circle
          className="progress-ring-bg"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
        />
        <circle
          className="progress-ring-fg"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="progress-ring-center">
        <span className="progress-pct">{rate}%</span>
        <span className="progress-pct-sub">terminées</span>
      </div>
    </div>
  );
}
