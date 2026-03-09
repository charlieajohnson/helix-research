"use client";

import { GlassButton, GlassPanel } from "@/components/ui";

export function TopBar({ onNewResearch }: { onNewResearch: () => void }) {
  return (
    <div className="sticky top-0 z-30 px-3 pt-3 sm:px-4">
      <GlassPanel variant="muted" className="px-4 py-2.5 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-teal-300/35 bg-gradient-to-br from-teal-400/25 to-cyan-400/10 text-teal-200">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="truncate font-heading text-base font-semibold tracking-tight text-white">
                Helix
              </div>
              <div className="truncate text-xs text-slate-400">AI Research Assistant</div>
            </div>
          </div>

          <GlassButton onClick={onNewResearch} tone="ghost">
            New Research
          </GlassButton>
        </div>
      </GlassPanel>
    </div>
  );
}
