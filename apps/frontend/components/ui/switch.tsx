import { cn } from '@/lib/utils';

type SwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
};

export function Switch({ checked, onCheckedChange, className }: SwitchProps) {
  return (
    <button
      type="button"
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-12 items-center rounded-full border border-transparent shadow-[inset_0_1px_2px_rgba(15,23,42,0.2)] transition-colors',
        checked ? 'bg-gradient-to-r from-secondary to-cyan-600' : 'bg-slate-300',
        className,
      )}
      aria-pressed={checked}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-6' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}
