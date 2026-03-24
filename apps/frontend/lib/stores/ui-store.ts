import { create } from 'zustand';

type UiStore = {
  sidebarCollapsed: boolean;
  insightPanelOpen: boolean;
  setSidebarCollapsed: (value: boolean) => void;
  toggleSidebarCollapsed: () => void;
  toggleInsightPanel: () => void;
  setInsightPanelOpen: (value: boolean) => void;
};

export const useUiStore = create<UiStore>((set) => ({
  sidebarCollapsed: false,
  insightPanelOpen: true,
  setSidebarCollapsed: (value) => set({ sidebarCollapsed: value }),
  toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleInsightPanel: () => set((state) => ({ insightPanelOpen: !state.insightPanelOpen })),
  setInsightPanelOpen: (value) => set({ insightPanelOpen: value }),
}));
