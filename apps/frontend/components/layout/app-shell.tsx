'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Sidebar } from './sidebar';
import { TopNavbar } from './top-navbar';
import { AiInsightPanel } from './ai-insight-panel';
import { useUiStore } from '@/lib/stores/ui-store';
import { cn } from '@/lib/utils';

export function AppShell({ children }: { children: ReactNode }) {
  const { insightPanelOpen } = useUiStore();

  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <TopNavbar />
          <main className="flex-1 p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24 }}
              className="mx-auto w-full max-w-[1280px]"
            >
              {children}
            </motion.div>
          </main>
        </div>

        <motion.div
          initial={false}
          animate={{
            width: insightPanelOpen ? 336 : 0,
            opacity: insightPanelOpen ? 1 : 0,
          }}
          transition={{ duration: 0.25 }}
          className={cn('overflow-hidden')}
        >
          <AiInsightPanel />
        </motion.div>
      </div>

      <Link
        href="/patients/new"
        className="fixed bottom-6 right-6 z-40 inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-4 text-sm font-semibold text-white shadow-glow transition-transform hover:-translate-y-0.5"
      >
        <Plus className="h-4 w-4" />
        New Case
      </Link>
    </div>
  );
}
