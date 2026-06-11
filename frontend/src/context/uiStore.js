/**
 * UI Store
 * Zustand store for UI state
 */

import { create } from "zustand";

export const useUIStore = create((set) => ({
  // State
  toast: null,
  modal: null,
  sidebarOpen: true,
  isLoading: false,

  // Toast actions
  showToast: (message, type = "info", duration = 3000) => {
    set({ toast: { message, type, id: Date.now() } });
    if (duration > 0) {
      setTimeout(() => set({ toast: null }), duration);
    }
  },

  hideToast: () => set({ toast: null }),

  // Modal actions
  openModal: (modalType, data = null) => {
    set({ modal: { type: modalType, data } });
  },

  closeModal: () => set({ modal: null }),

  // Sidebar actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  closeSidebar: () => set({ sidebarOpen: false }),

  // Loading actions
  setLoading: (isLoading) => set({ isLoading }),
}));
