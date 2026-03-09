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
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
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

      <GlassPanel variant="elevated" className="mt-8 w-full max-w-3xl p-4 sm:p-5 md:p-6">
        <div className="flex flex-col gap-5">
          <div>
            <SectionLabel>Research Prompt</SectionLabel>

            <div className="mt-3 rounded-[calc(var(--panel-radius)-6px)] border border-white/8 bg-white/[0.035] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-[var(--panel-blur-soft)] sm:px-4 sm:py-3.5">
              <div className="flex items-end gap-3">
                <GlassInput
                  as="textarea"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter a research question..."
                  rows={3}
                  disabled={isSubmitting}
                  panelVariant="bare"
                  className="min-h-[72px] max-h-[180px] px-0 py-0 text-[15px] leading-7 placeholder:text-[color:var(--text-tertiary)] sm:text-base"
                />
                <GlassButton
                  onClick={handleSubmit}
                  disabled={!query.trim() || isSubmitting}
                  tone="primary"
                  className="h-11 min-w-11 self-end rounded-[15px] px-0"
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
          </div>

          {error && <p className="text-xs text-red-300">{error}</p>}

          <div className="flex flex-col gap-3.5 sm:gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-2">
                <SectionLabel>Mode</SectionLabel>
                <div className="inline-flex w-fit flex-wrap items-center gap-1 rounded-full border border-white/8 bg-white/[0.03] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-[var(--panel-blur-soft)]">
                  {(["quick", "standard", "deep"] as const).map((d) => (
                    <GlassChip
                      key={d}
                      onClick={() => setDepth(d)}
                      active={depth === d}
                      tone="accent"
                      className="min-w-[88px]"
                    >
                      {d}
                    </GlassChip>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <SectionLabel>Sources</SectionLabel>
                <div className="inline-flex w-fit flex-wrap items-center gap-1 rounded-full border border-white/8 bg-white/[0.03] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-[var(--panel-blur-soft)]">
                  <GlassChip
                    onClick={() => setIncludeWeb((value) => !value)}
                    active={includeWeb}
                    tone="sky"
                    aria-pressed={includeWeb}
                    className="min-w-[82px]"
                  >
                    Web
                  </GlassChip>
                  <GlassChip
                    onClick={() => setIncludeArxiv((value) => !value)}
                    active={includeArxiv}
                    tone="violet"
                    aria-pressed={includeArxiv}
                    className="min-w-[82px]"
                  >
                    arXiv
                  </GlassChip>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlassPanel>

      <div className="mt-8 flex w-full max-w-3xl flex-col gap-3">
        <SectionLabel>Suggested Prompts</SectionLabel>
        <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
          {EXAMPLE_QUERIES.map((exampleQuery) => (
            <GlassChip
              key={exampleQuery}
              onClick={() => setQuery(exampleQuery)}
              tone="default"
              className="h-auto px-4 py-2.5 text-left text-[11px] normal-case tracking-[0.01em]"
            >
              {exampleQuery}
            </GlassChip>
          ))}
        </div>
      </div>
    </div>
  );
}
