"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GlassButton,
  GlassChip,
  GlassPanel,
} from "@/components/ui";

const EXAMPLE_QUERIES = [
  "Latest advances in RLHF for fine-tuning LLMs",
  "How do diffusion models compare to GANs for image generation?",
  "State of quantum error correction in 2026",
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
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-4 py-6 sm:px-6 sm:py-8">
      <div className="w-full max-w-3xl text-center">
        <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.035] px-3.5 py-2 shadow-[0_12px_30px_rgba(2,8,20,0.14)] backdrop-blur-lg">
          <div className="flex h-9 w-9 items-center justify-center rounded-[14px] border border-teal-300/24 bg-gradient-to-br from-teal-300/22 to-cyan-300/6 text-teal-100">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="font-heading text-[1.95rem] font-semibold tracking-[-0.03em] text-[color:var(--text-primary)] sm:text-[2.3rem]">
            Helix
          </h1>
        </div>
        <p className="mt-3 text-sm text-[color:var(--text-secondary)]">AI Research Assistant</p>
      </div>

      <GlassPanel variant="elevated" className="mt-6 w-full max-w-3xl p-4 sm:p-5">
        <GlassPanel variant="muted" className="p-1.5">
          <div className="flex items-end gap-2">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter a research question..."
              rows={1}
              disabled={isSubmitting}
              className="min-h-12 max-h-40 min-w-0 flex-1 resize-none bg-transparent px-3 py-3 text-[15px] leading-6 text-[color:var(--text-primary)] outline-none placeholder:text-[color:var(--text-tertiary)] sm:text-base"
            />
            <GlassButton
              onClick={handleSubmit}
              disabled={!query.trim() || isSubmitting}
              tone="primary"
              className="h-9 w-9 self-end rounded-xl p-0"
              aria-label="Start research"
            >
              {isSubmitting ? (
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              )}
            </GlassButton>
          </div>
        </GlassPanel>

        {error && <p className="mt-2 text-xs text-red-300">{error}</p>}

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {(["quick", "standard", "deep"] as const).map((d) => (
            <GlassChip
              key={d}
              onClick={() => setDepth(d)}
              active={depth === d}
              tone="accent"
              className="min-h-8 px-3 py-1.5 text-[11px] tracking-[0.08em]"
            >
              {d}
            </GlassChip>
          ))}
          <div className="mx-0.5 hidden h-4 w-px bg-white/12 sm:block" />
          <GlassChip
            onClick={() => setIncludeWeb((value) => !value)}
            active={includeWeb}
            tone="sky"
            aria-pressed={includeWeb}
            className="min-h-8 px-3 py-1.5 text-[11px] tracking-[0.08em]"
          >
            Web
          </GlassChip>
          <GlassChip
            onClick={() => setIncludeArxiv((value) => !value)}
            active={includeArxiv}
            tone="violet"
            aria-pressed={includeArxiv}
            className="min-h-8 px-3 py-1.5 text-[11px] tracking-[0.08em]"
          >
            arXiv
          </GlassChip>
        </div>
      </GlassPanel>

      <div className="mt-6 flex w-full max-w-3xl flex-wrap justify-center gap-2">
        {EXAMPLE_QUERIES.map((exampleQuery) => (
          <GlassChip
            key={exampleQuery}
            onClick={() => setQuery(exampleQuery)}
            tone="default"
            className="min-h-0 px-4 py-1.5 text-xs normal-case tracking-normal"
          >
            {exampleQuery}
          </GlassChip>
        ))}
      </div>
    </div>
  );
}
