import { create } from "zustand";
import type { SessionResponse, SessionConfig } from "@/lib/types";

interface ResearchStore {
  // Current session
  currentSession: SessionResponse | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  startResearch: (query: string, config?: Partial<SessionConfig>) => Promise<void>;
  pollSession: (id: string) => Promise<void>;
  clearSession: () => void;
}

export const useResearchStore = create<ResearchStore>((set, get) => ({
  currentSession: null,
  isLoading: false,
  error: null,

  startResearch: async (query, config) => {
    set({ isLoading: true, error: null, currentSession: null });

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          config: {
            depth: "standard",
            includeWeb: true,
            includeArxiv: true,
            ...config,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Request failed: ${res.status}`);
      }

      const { id } = await res.json();

      // Start polling
      const poll = async () => {
        const store = get();
        try {
          await store.pollSession(id);
          const session = get().currentSession;
          if (
            session &&
            session.session.status !== "complete" &&
            session.session.status !== "failed"
          ) {
            setTimeout(poll, 2000);
          } else {
            set({ isLoading: false });
          }
        } catch {
          set({ isLoading: false });
        }
      };

      poll();
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  pollSession: async (id) => {
    try {
      const res = await fetch(`/api/research/${id}`);
      if (!res.ok) throw new Error("Failed to fetch session");
      const data: SessionResponse = await res.json();
      set({ currentSession: data });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  clearSession: () => {
    set({ currentSession: null, isLoading: false, error: null });
  },
}));
