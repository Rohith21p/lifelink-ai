'use client';

import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

type MetricCardProps = {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
};

function useCountUp(target: number) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frameId: number;
    const start = performance.now();
    const duration = 700;

    const tick = (time: number) => {
      const progress = Math.min(1, (time - start) / duration);
      setDisplay(Math.round(target * progress));
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [target]);

  return display;
}

export function MetricCard({ title, value, subtitle, icon: Icon }: MetricCardProps) {
  const numericValue = typeof value === 'number' ? value : Number.NaN;
  const count = useCountUp(Number.isNaN(numericValue) ? 0 : numericValue);
  const displayValue = Number.isNaN(numericValue) ? value : count;

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.18 }}>
      <Card className="overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">{title}</p>
              <h3 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-900">{displayValue}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{subtitle}</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-primary/15 via-sky-100 to-secondary/15 p-2.5 text-primary">
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
