"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@/components/ui";

const EXAMPLE_QUERIES = [
  "Latest advances in RLHF for fine-tuning LLMs",
  "How do diffusion models compare to GANs for image generation?",
  "State of quantum error correction in 2025",
  "Retrieval-augmented generation vs fine-tuning tradeoffs",
];

export function QueryComposer() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [depth, setDepth] = useState<"quick" | "standard" | "deep">("standard");
  const [includeWeb, setIncludeWeb] = useState(true);
  const [includeArxiv, setIncludeArxiv] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!query.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          config: { depth, includeWeb, includeArxiv },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Request failed: ${res.status}`);
      }

      const { id } = await res.json();

      // Navigate to the session page — this is now the source of truth
      router.push(`/research/${id}`);
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500/20 to-teal-500/5 border border-teal-500/20 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-white">
          Helix
        </h1>
      </div>
      <p className="text-sm text-slate-500 mb-8">AI Research Assistant</p>

      {/* Input */}
      <GlassPanel bright className="w-full max-w-2xl p-1.5">
        <div className="flex items-end gap-2">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter a research question..."
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 resize-none outline-none px-3 py-2.5 min-h-[44px] max-h-[120px] font-body"
            rows={1}
            disabled={isSubmitting}
          />
          <button
            onClick={handleSubmit}
            disabled={!query.trim() || isSubmitting}
            className="flex-shrink-0 w-9 h-9 rounded-lg bg-teal-500/90 text-cosmos-950 flex items-center justify-center transition-all hover:bg-teal-400 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            )}
          </button>
        </div>
      </GlassPanel>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 mt-2">{error}</p>
      )}

      {/* Options */}
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-2">
          {(["quick", "standard", "deep"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDepth(d)}
              className={`px-2.5 py-1 rounded-pill text-[11px] font-mono font-medium transition-all ${
                depth === d
                  ? "bg-teal-500/15 text-teal-400 border border-teal-500/25"
                  : "text-slate-500 hover:text-slate-400 border border-transparent"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="w-px h-4 bg-slate-700/50" />
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={includeWeb}
            onChange={(e) => setIncludeWeb(e.target.checked)}
            className="sr-only"
          />
          <div className={`w-3 h-3 rounded-sm border transition-all ${includeWeb ? "bg-sky-500/30 border-sky-500/40" : "border-slate-600"}`}>
            {includeWeb && (
              <svg viewBox="0 0 12 12" className="text-sky-400" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="2 6 5 9 10 3" />
              </svg>
            )}
          </div>
          <span className="text-[11px] font-mono text-slate-500">Web</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={includeArxiv}
            onChange={(e) => setIncludeArxiv(e.target.checked)}
            className="sr-only"
          />
          <div className={`w-3 h-3 rounded-sm border transition-all ${includeArxiv ? "bg-violet-500/30 border-violet-500/40" : "border-slate-600"}`}>
            {includeArxiv && (
              <svg viewBox="0 0 12 12" className="text-violet-400" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="2 6 5 9 10 3" />
              </svg>
            )}
          </div>
          <span className="text-[11px] font-mono text-slate-500">arXiv</span>
        </label>
      </div>

      {/* Example queries */}
      <div className="flex flex-wrap gap-2 mt-8 max-w-2xl justify-center">
        {EXAMPLE_QUERIES.map((eq) => (
          <button
            key={eq}
            onClick={() => setQuery(eq)}
            className="text-xs text-slate-500 hover:text-teal-400 bg-slate-800/30 hover:bg-teal-500/5 border border-slate-700/30 hover:border-teal-500/20 px-3 py-1.5 rounded-pill transition-all"
          >
            {eq}
          </button>
        ))}
      </div>
    </div>
  );
}
