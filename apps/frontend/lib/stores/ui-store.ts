import { create } from 'zustand';

type UiStore = {
  sidebarCollapsed: boolean;
  insightPanelOpen: boolean;
  mobileSidebarOpen: boolean;
  setSidebarCollapsed: (value: boolean) => void;
  toggleSidebarCollapsed: () => void;
  toggleInsightPanel: () => void;
  setInsightPanelOpen: (value: boolean) => void;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleMobileSidebar: () => void;
};

export const useUiStore = create<UiStore>((set) => ({
  sidebarCollapsed: false,
  insightPanelOpen: true,
  mobileSidebarOpen: false,
  setSidebarCollapsed: (value) => set({ sidebarCollapsed: value }),
  toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleInsightPanel: () => set((state) => ({ insightPanelOpen: !state.insightPanelOpen })),
  setInsightPanelOpen: (value) => set({ insightPanelOpen: value }),
  openMobileSidebar: () => set({ mobileSidebarOpen: true }),
  closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
  toggleMobileSidebar: () =>
    set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
}));
