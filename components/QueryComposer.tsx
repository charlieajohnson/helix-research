"use client";

import Image from "next/image";
import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";

const STARTING_POINTS = [
  {
    label: "Technical landscape",
    query:
      "Map the current technical and commercial landscape for AI inference infrastructure. Prioritise primary sources, recent evidence and points of disagreement.",
  },
  {
    label: "Diligence brief",
    query:
      "Prepare a diligence brief on revenue-based financing platforms for an investment committee. Cover market structure, economics, risks and unresolved questions.",
  },
  {
    label: "Evidence review",
    query:
      "Review the evidence for retrieval-augmented generation versus fine-tuning in production systems. Separate established findings from contested claims.",
  },
];

export function QueryComposer() {
  const router = useRouter();
  const submissionLock = useRef(false);
  const [query, setQuery] = useState("");
  const [depth, setDepth] = useState<"quick" | "standard" | "deep">("standard");
  const [includeWeb, setIncludeWeb] = useState(true);
  const [includeArxiv, setIncludeArxiv] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();
    const cleanedQuery = query.trim();

    if (submissionLock.current) return;
    if (cleanedQuery.length < 5) {
      setError("Use at least five characters so Helix can plan the brief.");
      return;
    }
    if (!includeWeb && !includeArxiv) {
      setError("Keep at least one source set enabled.");
      return;
    }

    submissionLock.current = true;
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: cleanedQuery,
          config: { depth, includeWeb, includeArxiv },
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error ?? `Request failed: ${response.status}`);
      }

      router.push(`/research/${data.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The brief could not be started.");
      submissionLock.current = false;
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[color:var(--ink)]">
      <header className="mx-auto flex max-w-[1440px] items-center justify-between border-b border-[color:var(--rule)] px-5 py-4 sm:px-8 lg:px-12">
        <a href="/" className="font-heading text-2xl font-medium tracking-[-0.04em] text-[color:var(--paper)]">
          helix.
        </a>
        <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.18em] text-[color:var(--paper-faint)] sm:text-[10px]">
          <span>Research desk</span>
          <span className="h-1.5 w-1.5 bg-[color:var(--signal)]" aria-hidden="true" />
          <span>Public beta</span>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1440px] border-b border-[color:var(--rule)] lg:grid-cols-[minmax(0,1.06fr)_minmax(28rem,0.94fr)]">
        <div className="flex flex-col justify-center px-5 py-14 sm:px-8 sm:py-20 lg:min-h-[calc(100dvh-4.5rem)] lg:px-12 lg:py-24 xl:px-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--signal)]">
            Helix / Research desk
          </p>
          <h1 className="mt-6 max-w-[12ch] font-heading text-[clamp(4rem,8vw,8.6rem)] font-medium leading-[0.84] tracking-[-0.055em] text-[color:var(--paper)]">
            Research you can inspect.
          </h1>
          <p className="mt-8 max-w-xl text-base leading-7 text-[color:var(--paper-muted)] sm:text-lg sm:leading-8">
            Turn a difficult question into an evidence-backed brief. Keep the search path, source set, uncertainty and next questions intact.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 max-w-2xl" noValidate>
            <label htmlFor="research-query" className="mb-3 block font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--paper-muted)]">
              What decision or question are you preparing for?
            </label>
            <div className="border border-[color:var(--rule-strong)] bg-[color:var(--paper)] p-2 focus-within:border-[color:var(--signal)]">
              <textarea
                id="research-query"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Frame the question, decision and evidence threshold."
                rows={4}
                minLength={5}
                maxLength={600}
                disabled={isSubmitting}
                aria-describedby={error ? "query-error" : "query-guidance"}
                className="min-h-28 w-full resize-none bg-transparent px-3 py-3 text-base leading-7 text-[color:var(--ink)] outline-none placeholder:text-[#716b62] disabled:opacity-60"
              />
              <div className="flex flex-col gap-3 border-t border-black/15 px-3 pb-1 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <p id="query-guidance" className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#665f56]">
                  Web and academic sources · linked evidence
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting || query.trim().length < 5}
                  className="inline-flex min-h-11 items-center justify-center gap-3 bg-[color:var(--signal)] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--ink)] transition-colors hover:bg-[color:var(--signal-bright)] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {isSubmitting ? "Opening desk" : "Build a brief"}
                  <span aria-hidden="true">↗</span>
                </button>
              </div>
            </div>

            {error && (
              <p id="query-error" role="alert" className="mt-3 text-sm text-[color:var(--danger)]">
                {error}
              </p>
            )}

            <details className="group mt-4 border-y border-[color:var(--rule)] py-3">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--paper-muted)]">
                Research settings
                <span className="text-[color:var(--signal)] transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <div className="grid gap-5 pb-2 pt-4 sm:grid-cols-2">
                <fieldset>
                  <legend className="font-mono text-[9px] uppercase tracking-[0.14em] text-[color:var(--paper-faint)]">Depth</legend>
                  <div className="mt-2 flex gap-2">
                    {(["quick", "standard", "deep"] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setDepth(option)}
                        aria-pressed={depth === option}
                        className={`min-h-11 flex-1 border px-3 py-2 font-mono text-[9px] uppercase tracking-[0.1em] transition-colors ${
                          depth === option
                            ? "border-[color:var(--signal)] bg-[color:var(--signal)] text-[color:var(--ink)]"
                            : "border-[color:var(--rule)] text-[color:var(--paper-muted)] hover:border-[color:var(--rule-strong)]"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="font-mono text-[9px] uppercase tracking-[0.14em] text-[color:var(--paper-faint)]">Sources</legend>
                  <div className="mt-2 flex gap-4">
                    <SourceToggle
                      label="Web"
                      checked={includeWeb}
                      disabled={includeWeb && !includeArxiv}
                      onChange={setIncludeWeb}
                    />
                    <SourceToggle
                      label="arXiv"
                      checked={includeArxiv}
                      disabled={includeArxiv && !includeWeb}
                      onChange={setIncludeArxiv}
                    />
                  </div>
                </fieldset>
              </div>
            </details>
          </form>

          <div className="mt-8 max-w-2xl">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[color:var(--paper-faint)]">Start with</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3">
              {STARTING_POINTS.map((startingPoint) => (
                <button
                  key={startingPoint.label}
                  type="button"
                  onClick={() => {
                    setQuery(startingPoint.query);
                    setError(null);
                  }}
                  className="min-h-11 border-b border-[color:var(--rule)] text-left text-sm text-[color:var(--paper-muted)] transition-colors hover:border-[color:var(--signal)] hover:text-[color:var(--paper)]"
                >
                  {startingPoint.label} <span className="ml-1 text-[color:var(--signal)]">↗</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <figure className="research-plate lg:min-h-[calc(100dvh-4.5rem)]">
          <Image
            src="/images/helix-research-plate.webp"
            alt="Abstract geometric study in black, bone and vermilion"
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 46vw"
            className="object-cover"
          />
          <figcaption className="absolute inset-x-0 bottom-0 z-10 grid gap-5 border-t border-white/25 bg-black/78 p-5 backdrop-blur-sm sm:grid-cols-[auto_1fr] sm:p-7">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#ff6a33]">Plate 01</p>
              <p className="mt-2 font-heading text-3xl font-medium tracking-[-0.03em] text-[#f1eee6]">Evidence resolution</p>
            </div>
            <div className="grid grid-cols-3 gap-3 border-t border-white/20 pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
              {["What the evidence says", "Where it disagrees", "What to verify next"].map((line, index) => (
                <div key={line}>
                  <span className="font-mono text-[8px] text-[#ff6a33]">0{index + 1}</span>
                  <p className="mt-2 text-[11px] leading-5 text-[#d0c9bf]">{line}</p>
                </div>
              ))}
            </div>
          </figcaption>
        </figure>
      </section>

      <section className="mx-auto grid max-w-[1440px] divide-y divide-[color:var(--rule)] border-b border-[color:var(--rule)] md:grid-cols-3 md:divide-x md:divide-y-0">
        {[
          ["01 / Plan", "See how the question is decomposed before synthesis."],
          ["02 / Evidence", "Open every source behind the brief."],
          ["03 / Gaps", "Keep limitations and unresolved questions in view."],
        ].map(([title, copy]) => (
          <div key={title} className="px-5 py-8 sm:px-8 lg:px-12">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[color:var(--signal)]">{title}</p>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[color:var(--paper-muted)]">{copy}</p>
          </div>
        ))}
      </section>

      <footer className="mx-auto flex max-w-[1440px] flex-col gap-3 px-5 py-8 text-xs leading-5 text-[color:var(--paper-faint)] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <span>Helix prepares a research brief. Verify material claims against primary sources.</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.14em]">Search trail included</span>
      </footer>
    </div>
  );
}

function SourceToggle({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={`flex min-h-11 items-center gap-3 font-mono text-[10px] uppercase tracking-[0.1em] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded-none accent-[color:var(--signal)]"
      />
      {label}
    </label>
  );
}
