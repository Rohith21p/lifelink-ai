import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors',
  {
    variants: {
      variant: {
        default: 'border-primary/20 bg-primary/10 text-primary',
        neutral: 'border-border bg-muted/70 text-muted-foreground',
        success: 'border-success/20 bg-success/10 text-success',
        warning: 'border-warning/30 bg-warning/10 text-amber-700',
        danger: 'border-critical/30 bg-critical/10 text-critical',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      <span className="h-1.5 w-1.5 rounded-full bg-current/90" />
      {props.children}
    </div>
  );
}

export { Badge, badgeVariants };
