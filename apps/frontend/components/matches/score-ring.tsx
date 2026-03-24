import { cn } from '@/lib/utils';

type ScoreRingProps = {
  score: number;
  size?: number;
  className?: string;
};

export function ScoreRing({ score, size = 72, className }: ScoreRingProps) {
  const safeScore = Math.max(0, Math.min(100, score));
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeScore / 100) * circumference;

  const scoreColor =
    safeScore >= 80 ? 'text-success' : safeScore >= 55 ? 'text-warning' : 'text-critical';

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ height: size, width: size }}>
      <svg className="-rotate-90" height={size} width={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={8}
          className="text-slate-200"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={8}
          strokeLinecap="round"
          className={scoreColor}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className={cn('absolute text-sm font-semibold text-slate-900', scoreColor)}>{safeScore}%</span>
    </div>
  );
}
