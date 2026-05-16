"use client";

import { create } from "zustand";

export const useUIStore = create((set) => ({
  isSidebarOpen: false,
  activeSection: "stream",

  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),

  setActiveSection: (section) => set({ activeSection: section }),
  toggleActiveSection: () =>
    set((s) => ({
      activeSection: s.activeSection === "stream" ? "chat" : "stream",
    })),
}));


