'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DemoRole = 'EXECUTIVE' | 'COORDINATOR' | 'ADMIN';

type DemoStore = {
  demoMode: boolean;
  role: DemoRole;
  setRole: (role: DemoRole) => void;
  toggleDemoMode: () => void;
};

export const useDemoStore = create<DemoStore>()(
  persist(
    (set) => ({
      demoMode: true,
      role: 'EXECUTIVE',
      setRole: (role) => set({ role }),
      toggleDemoMode: () => set((state) => ({ demoMode: !state.demoMode })),
    }),
    {
      name: 'lifelink-demo-store',
    },
  ),
);
