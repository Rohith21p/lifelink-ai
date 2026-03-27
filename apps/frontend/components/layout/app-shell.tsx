'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Sidebar } from './sidebar';
import { TopNavbar } from './top-navbar';
import { AiInsightPanel } from './ai-insight-panel';
import { useUiStore } from '@/lib/stores/ui-store';
import { cn } from '@/lib/utils';

export function AppShell({ children }: { children: ReactNode }) {
  const { insightPanelOpen, mobileSidebarOpen, closeMobileSidebar } = useUiStore();

  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <TopNavbar />
          <main className="flex-1 px-3 py-4 sm:px-4 md:px-6">
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
          className={cn('hidden overflow-hidden xl:block')}
        >
          <AiInsightPanel />
        </motion.div>
      </div>

      <AnimatePresence>
        {mobileSidebarOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
            onClick={closeMobileSidebar}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.2 }}
              className="h-full"
              onClick={(event) => event.stopPropagation()}
            >
              <Sidebar mobile onNavigate={closeMobileSidebar} onClose={closeMobileSidebar} />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Link
        href="/patients/new"
        className="fixed bottom-4 right-4 z-30 inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-4 text-sm font-semibold text-white shadow-glow transition-transform hover:-translate-y-0.5 sm:bottom-6 sm:right-6"
      >
        <Plus className="h-4 w-4" />
        New Case
      </Link>
    </div>
  );
}
