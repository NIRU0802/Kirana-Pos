import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: number;
  username: string;
  role: "admin" | "cashier" | "manager";
}

interface AppState {
  user: AuthUser | null;
  theme: "light" | "dark";
  sidebarOpen: boolean;
  setUser: (u: AuthUser | null) => void;
  setTheme: (t: "light" | "dark") => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null, theme: "light", sidebarOpen: true,
      setUser: (user) => set({ user }),
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== "undefined")
          document.documentElement.classList.toggle("dark", theme === "dark");
      },
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    { name: "kirana-app", partialize: (s) => ({ theme: s.theme }) }
  )
);
