import { create } from 'zustand';

export const useUIStore = create((set) => ({
  theme: 'dark',
  sidebarOpen: true,
  activeModal: null,
  toasts: [],

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),

  addToast: (toast) => {
    const id = Date.now();
    set((s) => ({ toasts: [...s.toasts, { id, ...toast }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, toast.duration ?? 4000);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// Convenience helper
export const toast = {
  success: (message) => useUIStore.getState().addToast({ type: 'success', message }),
  error: (message) => useUIStore.getState().addToast({ type: 'error', message }),
  info: (message) => useUIStore.getState().addToast({ type: 'info', message }),
};
