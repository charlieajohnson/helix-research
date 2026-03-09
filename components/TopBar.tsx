"use client";

export function TopBar({ onNewResearch }: { onNewResearch: () => void }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700/20 glass">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-teal-500/20 to-teal-500/5 border border-teal-500/20 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <span className="font-heading text-base font-semibold tracking-tight text-white">
              Helix
            </span>
            <span className="text-xs text-slate-500 ml-2">AI Research Assistant</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onNewResearch}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-medium text-slate-300 glass hover:bg-slate-700/30 transition-all border border-slate-600/20 hover:border-slate-500/30"
        >
          New Research
        </button>
      </div>
    </div>
  );
}
