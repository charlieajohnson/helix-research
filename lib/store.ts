import { create } from "zustand";
import type { SessionResponse } from "@/lib/types";

interface ResearchStore {
  currentSession: SessionResponse | null;
  isPolling: boolean;
  error: string | null;
  startPolling: (id: string) => void;
  stopPolling: () => void;
  clearSession: () => void;
}

let pollTimer: ReturnType<typeof setTimeout> | null = null;
let pollController: AbortController | null = null;
let pollGeneration = 0;

function cancelActivePoll() {
  pollGeneration += 1;
  pollController?.abort();
  pollController = null;
  if (pollTimer) clearTimeout(pollTimer);
  pollTimer = null;
}

export const useResearchStore = create<ResearchStore>((set, get) => ({
  currentSession: null,
  isPolling: false,
  error: null,

  startPolling: (id: string) => {
    cancelActivePoll();
    const generation = pollGeneration;
    let consecutiveFailures = 0;

    set((state) => ({
      currentSession: state.currentSession?.session.id === id ? state.currentSession : null,
      isPolling: true,
      error: null,
    }));

    const poll = async () => {
      if (generation !== pollGeneration) return;
      pollController = new AbortController();

      try {
        const response = await fetch(`/api/research/${id}`, {
          cache: "no-store",
          signal: pollController.signal,
        });

        if (generation !== pollGeneration) return;

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          const message = body.error ?? "The research session could not be loaded.";

          if (response.status === 400 || response.status === 404) {
            set({ currentSession: null, isPolling: false, error: message });
            return;
          }
          throw new Error(message);
        }

        const data: SessionResponse = await response.json();
        if (generation !== pollGeneration || data.session.id !== id) return;

        consecutiveFailures = 0;
        set({ currentSession: data, error: null });

        if (data.session.status === "complete" || data.session.status === "failed") {
          pollController = null;
          set({ isPolling: false });
          return;
        }

        pollTimer = setTimeout(() => void poll(), 1500);
      } catch (caught) {
        if (generation !== pollGeneration || pollController?.signal.aborted) return;

        consecutiveFailures += 1;
        const message = caught instanceof Error ? caught.message : "The research session could not be loaded.";

        if (consecutiveFailures >= 3) {
          set({ isPolling: false, error: `${message} Refresh or start a new brief.` });
          return;
        }

        set({ error: "Connection interrupted. Retrying…" });
        pollTimer = setTimeout(() => void poll(), 1500 * consecutiveFailures);
      }
    };

    void poll();
  },

  stopPolling: () => {
    cancelActivePoll();
    set({ isPolling: false });
  },

  clearSession: () => {
    get().stopPolling();
    set({ currentSession: null, error: null });
  },
}));
