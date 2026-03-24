import { cn } from '@/lib/utils';

type ProgressProps = {
  value: number;
  className?: string;
  barClassName?: string;
};

export function Progress({ value, className, barClassName }: ProgressProps) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className={cn('h-2.5 w-full overflow-hidden rounded-full bg-slate-100', className)}>
      <div
        className={cn(
          'h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500',
          barClassName,
        )}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
