"use client";

import { GlassButton } from "@/components/ui";

export function TopBar({ onNewResearch }: { onNewResearch: () => void }) {
  return (
    <header className="flex min-h-[4.5rem] shrink-0 items-center justify-between border-b border-[color:var(--rule)] px-4 py-3 sm:px-6">
      <div className="flex min-w-0 items-baseline gap-4">
        <span className="font-heading text-2xl font-medium tracking-[-0.04em] text-[color:var(--paper)]">helix.</span>
        <span className="hidden font-mono text-[9px] uppercase tracking-[0.16em] text-[color:var(--paper-faint)] sm:inline">
          Research desk
        </span>
      </div>
      <GlassButton onClick={onNewResearch} tone="ghost">
        New brief <span aria-hidden="true">+</span>
      </GlassButton>
    </header>
  );
}
