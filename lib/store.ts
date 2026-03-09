import { create } from "zustand";
import type { SessionResponse } from "@/lib/types";

interface RecentSession {
  id: string;
  query: string;
  status: string;
  createdAt: string;
}

interface ResearchStore {
  // Current session data (hydrated from DB via polling)
  currentSession: SessionResponse | null;
  isPolling: boolean;
  error: string | null;

  // Recent sessions for sidebar
  recentSessions: RecentSession[];

  // Actions
  pollSession: (id: string) => Promise<void>;
  startPolling: (id: string) => void;
  stopPolling: () => void;
  setSession: (session: SessionResponse) => void;
  clearSession: () => void;
  fetchRecentSessions: () => Promise<void>;
}

let pollInterval: ReturnType<typeof setInterval> | null = null;

export const useResearchStore = create<ResearchStore>((set, get) => ({
  currentSession: null,
  isPolling: false,
  error: null,
  recentSessions: [],

  pollSession: async (id: string) => {
    try {
      const res = await fetch(`/api/research/${id}`);
      if (!res.ok) throw new Error("Failed to fetch session");
      const data: SessionResponse = await res.json();
      set({ currentSession: data, error: null });

      // Auto-stop polling when terminal state reached
      if (data.session.status === "complete" || data.session.status === "failed") {
        get().stopPolling();
        // Refresh recent sessions to show updated status
        get().fetchRecentSessions();
      }
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  startPolling: (id: string) => {
    // Clear any existing interval
    if (pollInterval) clearInterval(pollInterval);

    set({ isPolling: true, error: null });

    // Immediate first poll
    get().pollSession(id);

    // Then poll every 1.5s for live stage updates
    pollInterval = setInterval(() => {
      get().pollSession(id);
    }, 1500);
  },

  stopPolling: () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
    set({ isPolling: false });
  },

  setSession: (session) => {
    set({ currentSession: session });
  },

  clearSession: () => {
    get().stopPolling();
    set({ currentSession: null, isPolling: false, error: null });
  },

  fetchRecentSessions: async () => {
    try {
      const res = await fetch("/api/research");
      if (!res.ok) return;
      const data = await res.json();
      set({ recentSessions: data.sessions ?? [] });
    } catch {
      // Silent fail — sidebar is non-critical
    }
  },
}));
