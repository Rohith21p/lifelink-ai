import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-br from-primary via-sky-600 to-cyan-600 text-primary-foreground shadow-glow hover:brightness-[1.02] hover:shadow-[0_22px_35px_-22px_rgba(2,132,199,0.65)]',
        secondary:
          'bg-gradient-to-br from-secondary via-teal-600 to-cyan-600 text-secondary-foreground shadow-[0_16px_26px_-18px_rgba(13,148,136,0.55)] hover:brightness-[1.03]',
        outline:
          'border border-input/90 bg-white/90 text-slate-700 shadow-[0_12px_26px_-22px_rgba(15,23,42,0.38)] hover:border-primary/30 hover:bg-white',
        ghost: 'text-slate-700 hover:bg-muted/70 hover:text-slate-900',
        destructive: 'bg-destructive text-destructive-foreground shadow-[0_16px_28px_-18px_rgba(220,38,38,0.55)] hover:brightness-105',
      },
      size: {
        default: 'h-11 px-4 py-2',
        sm: 'h-9 rounded-lg px-3 text-xs',
        lg: 'h-11 px-6 text-[0.95rem]',
        icon: 'h-10 w-10 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
