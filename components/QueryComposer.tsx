"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GlassButton,
  GlassChip,
  GlassInput,
  GlassPanel,
  SectionLabel,
} from "@/components/ui";

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
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center px-4 py-8 sm:px-6">
      <div className="mb-8 text-center">
        <div className="mb-3 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur-xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-teal-300/35 bg-gradient-to-br from-teal-400/25 to-cyan-400/10 text-teal-200">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Helix
          </h1>
        </div>
        <p className="text-sm text-slate-400">AI Research Assistant</p>
      </div>

      <GlassPanel variant="elevated" className="w-full max-w-3xl p-4 sm:p-5">
        <SectionLabel>Research Prompt</SectionLabel>

        <div className="mt-3 flex flex-col gap-3">
          <div className="glass-panel glass-panel-muted rounded-[calc(var(--panel-radius)-4px)] p-2">
            <div className="flex items-end gap-2">
              <GlassInput
                as="textarea"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter a research question..."
                rows={2}
                disabled={isSubmitting}
                containerClassName="p-0 bg-transparent border-0 shadow-none"
                className="min-h-[52px] max-h-[140px] px-2.5 py-2"
              />
              <GlassButton
                onClick={handleSubmit}
                disabled={!query.trim() || isSubmitting}
                tone="primary"
                className="h-10 w-10 rounded-xl p-0"
                aria-label="Start research"
              >
                {isSubmitting ? (
                  <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                )}
              </GlassButton>
            </div>
          </div>

          {error && <p className="text-xs text-red-300">{error}</p>}

          <div className="flex flex-wrap items-center gap-2.5">
            {(["quick", "standard", "deep"] as const).map((d) => (
              <GlassChip
                key={d}
                onClick={() => setDepth(d)}
                active={depth === d}
                tone="accent"
              >
                {d}
              </GlassChip>
            ))}
            <div className="mx-1 hidden h-4 w-px bg-white/20 sm:block" />
            <GlassChip
              onClick={() => setIncludeWeb((value) => !value)}
              active={includeWeb}
              tone="sky"
              aria-pressed={includeWeb}
            >
              {includeWeb ? "ON" : "OFF"} Web
            </GlassChip>
            <GlassChip
              onClick={() => setIncludeArxiv((value) => !value)}
              active={includeArxiv}
              tone="violet"
              aria-pressed={includeArxiv}
            >
              {includeArxiv ? "ON" : "OFF"} arXiv
            </GlassChip>
          </div>
        </div>
      </GlassPanel>

      <div className="mt-6 flex max-w-3xl flex-wrap justify-center gap-2.5">
        {EXAMPLE_QUERIES.map((exampleQuery) => (
          <GlassChip
            key={exampleQuery}
            onClick={() => setQuery(exampleQuery)}
            tone="default"
            className="normal-case tracking-normal"
          >
            {exampleQuery}
          </GlassChip>
        ))}
      </div>
    </div>
  );
}
