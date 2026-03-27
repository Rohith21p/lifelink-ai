import * as React from 'react';
import { cn } from '@/lib/utils';

type Option = {
  label: string;
  value: string;
};

type SelectProps = {
  value?: string;
  onChange?: (value: string) => void;
  options: Option[];
  className?: string;
  placeholder?: string;
  disabled?: boolean;
};

export function Select({ value, onChange, options, className, placeholder, disabled }: SelectProps) {
  return (
    <select
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
      className={cn(
        'h-11 w-full rounded-xl border border-input/90 bg-white/95 px-3 text-sm text-slate-800 transition-colors focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 disabled:cursor-not-allowed disabled:opacity-50 sm:h-10',
        className,
      )}
      disabled={disabled}
    >
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
