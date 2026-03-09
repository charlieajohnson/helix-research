# Helix — MVP Spec

> **Purpose**: Portfolio project — AI research agent with visible orchestration.
> **Model**: GPT-5 mini via OpenAI API (Chat Completions + structured outputs).
> **Stack**: Next.js (app router), TypeScript, Tailwind, Zustand, Postgres (Neon), Vercel.
> **Timeline**: Build today, deploy today.

---

## What It Is

Helix takes a research question, plans a search strategy, searches the web and arXiv, ranks and deduplicates sources, synthesizes a cited brief, and evaluates quality — all visible as a live pipeline in the UI.

The point is **visible agent orchestration**, not chat.

```
User query
  → PLAN        (decompose into subquestions + search queries)
  → SEARCH      (web + arXiv in parallel)
  → RANK        (dedupe, score, assign citation labels)
  → SYNTHESIZE  (structured brief citing ranked sources)
  → EVALUATE    (coverage, cost, latency, warnings)
  → COMPLETE
```

---

## Architecture

### Single Next.js app (no monorepo)

The original spec calls for a pnpm monorepo with 7 packages. For a one-day MVP, flatten everything into one Next.js project. Extract packages later if needed.

```
helix/
├── app/
│   ├── page.tsx                 ← landing / query composer
│   ├── research/[id]/page.tsx   ← active session view
│   ├── api/
│   │   ├── research/route.ts    ← POST: create + run session
│   │   ├── research/[id]/route.ts ← GET: fetch session state
│   │   └── health/route.ts
│   └── layout.tsx
├── lib/
│   ├── agent/
│   │   ├── orchestrator.ts      ← runResearchSession()
│   │   ├── planner.ts           ← plan step (OpenAI call)
│   │   ├── synthesizer.ts       ← synthesis step (OpenAI call)
│   │   └── evaluator.ts         ← compute metrics
│   ├── tools/
│   │   ├── web-search.ts        ← Tavily adapter
│   │   ├── arxiv.ts             ← arXiv API adapter
│   │   └── scoring.ts           ← dedupe + rank
│   ├── db/
│   │   ├── schema.ts            ← Drizzle schema
│   │   ├── client.ts            ← Neon connection
│   │   └── queries.ts           ← CRUD helpers
│   ├── prompts/
│   │   ├── planner.ts
│   │   └── synthesis.ts
│   └── types.ts                 ← all shared types + Zod schemas
├── components/
│   ├── QueryComposer.tsx
│   ├── PipelineTracker.tsx
│   ├── SourceCard.tsx
│   ├── SynthesisPanel.tsx
│   ├── ObservabilityPanel.tsx
│   └── ui/                      ← glass panels, metric cards, etc.
├── .env.example
├── drizzle.config.ts
├── tailwind.config.ts
├── package.json
└── README.md
```

### Why this instead of the monorepo

The monorepo adds Turbo, pnpm workspaces, cross-package TypeScript references, and 7 separate `package.json` files — all infra overhead with zero user-facing value on day one. A flat Next.js app with well-organized `lib/` folders gives you the same separation of concerns without the scaffolding tax. If Helix grows, you extract `lib/agent` → `packages/agents` later.

---

## Model: GPT-5 mini (OpenAI API)

All LLM calls go through the OpenAI Chat Completions API with structured outputs (JSON mode or function calling).

```ts
// lib/agent/planner.ts
import OpenAI from "openai";

const client = new OpenAI(); // reads OPENAI_API_KEY from env

const completion = await client.chat.completions.create({
  model: "gpt-5-mini",        // swap model string as needed
  response_format: { type: "json_object" },
  messages: [
    { role: "system", content: PLANNER_SYSTEM_PROMPT },
    { role: "user", content: query },
  ],
});
```

Two LLM calls total per session:
1. **Planner** — decomposes query → subquestions + search queries
2. **Synthesizer** — ranked sources → structured brief with citations

Evaluation is deterministic (no LLM call needed for MVP).

---

## Data Model

Using Drizzle ORM with Neon Postgres.

### research_sessions
| Column     | Type      | Notes                                        |
|------------|-----------|----------------------------------------------|
| id         | uuid (pk) |                                              |
| query      | text      |                                              |
| status     | text      | intake → planning → searching → ranking → synthesizing → evaluating → complete → failed |
| config     | jsonb     | `{ depth, includeWeb, includeArxiv }`        |
| created_at | timestamp |                                              |
| updated_at | timestamp |                                              |

### research_plans
| Column           | Type      |
|------------------|-----------|
| id               | uuid (pk) |
| session_id       | uuid (fk) |
| objective        | text      |
| subquestions     | jsonb     |
| search_queries   | jsonb     | `{ web: string[], papers: string[] }`        |
| success_criteria | jsonb     |

### research_sources
| Column           | Type      |
|------------------|-----------|
| id               | uuid (pk) |
| session_id       | uuid (fk) |
| type             | text      | `web` or `paper`                             |
| title            | text      |
| url              | text      |
| snippet          | text      |
| authors          | jsonb     |
| published_at     | text      |
| domain           | text      |
| score            | float     |
| citation_label   | text      | `[S1]`, `[S2]`, etc.                         |

### research_outputs
| Column         | Type      |
|----------------|-----------|
| id             | uuid (pk) |
| session_id     | uuid (fk) |
| summary        | text      |
| key_findings   | jsonb     |
| open_questions | jsonb     |
| limitations    | jsonb     |
| citations      | jsonb     | `[{ label, sourceId }]`                      |

### evaluation_results
| Column               | Type      |
|----------------------|-----------|
| id                   | uuid (pk) |
| session_id           | uuid (fk) |
| source_count         | int       |
| coverage_score       | float     |
| citation_completeness| float     |
| latency_ms           | int       |
| estimated_cost_usd   | float     |
| warnings             | jsonb     |

---

## Agent Pipeline

### Orchestrator

```ts
async function runResearchSession(query: string, config: SessionConfig) {
  const session = await createSession(query, config);

  await setStatus(session.id, "planning");
  const plan = await planStep(query, config);
  await savePlan(session.id, plan);

  await setStatus(session.id, "searching");
  const [webResults, paperResults] = await Promise.all([
    config.includeWeb ? searchWeb(plan.searchQueries.web) : [],
    config.includeArxiv ? searchArxiv(plan.searchQueries.papers) : [],
  ]);

  await setStatus(session.id, "ranking");
  const ranked = dedupeAndRank([...webResults, ...paperResults]);
  await saveSources(session.id, ranked);

  await setStatus(session.id, "synthesizing");
  const output = await synthesizeStep(query, ranked);
  await saveOutput(session.id, output);

  await setStatus(session.id, "evaluating");
  const evaluation = computeEvaluation(session, ranked, output);
  await saveEvaluation(session.id, evaluation);

  await setStatus(session.id, "complete");
  return { session, plan, sources: ranked, output, evaluation };
}
```

### Step contracts

Every step:
- Accepts typed input, returns typed output (Zod-validated)
- Updates session status in DB
- Is independently testable

### Tool adapters

**Web search** — Tavily API (generous free tier, returns snippets). One adapter function:
```ts
async function searchWeb(queries: string[]): Promise<ResearchSource[]>
```

**arXiv search** — arXiv API (free, no key needed). Parse Atom XML response:
```ts
async function searchArxiv(queries: string[]): Promise<ResearchSource[]>
```

**Scoring** — Deterministic heuristic:
- Keyword overlap with original query (relevance)
- Domain reputation weighting (credibility)
- Recency bonus for web results
- Dedupe by URL + fuzzy title match
- Assign `[S1]`, `[S2]`, etc. labels to top N

---

## API Endpoints

### `POST /api/research`
Create and run a session. Returns immediately with session ID; pipeline runs server-side.

```json
// Request
{ "query": "...", "config": { "depth": "standard", "includeWeb": true, "includeArxiv": true } }

// Response 201
{ "id": "uuid", "status": "planning" }
```

### `GET /api/research/[id]`
Full session state — plan, sources, output, evaluation, current status.

```json
// Response 200
{
  "session": { ... },
  "plan": { ... },
  "sources": [ ... ],
  "output": { ... },
  "evaluation": { ... }
}
```

Frontend polls this endpoint every 2s while status !== `complete` and !== `failed`.

### `GET /api/health`
Returns `{ status: "ok" }`.

---

## Frontend Design — "Helix"

Cosmic/ethereal dark theme with glassmorphism panels over a nebula background. Feels like a research instrument, not a chatbot.

### Design System

```
Theme:        Deep space dark — navy-black backgrounds, frosted glass panels
Background:   Nebula/cosmic gradient or blurred starfield (CSS radial gradients + noise)
Glass:        backdrop-blur + semi-transparent backgrounds + subtle borders
Font stack:   Sora or Outfit (headings) + Inter or DM Sans (body) + IBM Plex Mono (data)
Accent:       Cool silver-blue (#B8C9E0) for labels, soft white for headings
Data accent:  Muted teal or cyan for metrics, amber for cost/warnings
Radius:       12px panels, 8px cards, 24px pills
```

### Layout (Desktop)

```
┌──────────────────────────────────────────────────────────────────┐
│  Top Bar: HELIX logo · "AI Research Assistant" · New Research    │
├──────────┬───────────────────────────────────┬───────────────────┤
│ Left     │  Center                           │  Right            │
│ Sidebar  │                                   │  Sidebar          │
│          │  Pipeline Tracker                 │                   │
│ Recent   │  PLAN — SEARCH — SYNTHESIZE — EVAL│  OBSERVABILITY    │
│ History  │                                   │                   │
│          │  Stage Content                    │  Cost             │
│ query 1  │  (plan / sources / brief)         │  Latency          │
│ query 2  │                                   │  Source Coverage  │
│ query 3  │  Source Cards                     │  Accuracy         │
│ ...      │  (6 Relevant Sources · 48k tokens)│  Warnings         │
│          │                                   │                   │
│          │  Synthesis Brief                  │  Stop button      │
│          │  (cited findings + references)    │                   │
│          ├───────────────────────────────────┤                   │
│          │  Bottom: $0.43 · ▶ · 41.3s       │                   │
└──────────┴───────────────────────────────────┴───────────────────┘
```

### Layout (Mobile)

Stacked single-column:
- Header with logo
- Pipeline tracker (horizontal, scrollable)
- Stage content (plan → sources → brief)
- Source cards
- Bottom bar with cost + latency

### Key UI Components

**QueryComposer** — Input field, optional depth selector (quick/standard/deep), source toggles (web, arXiv), run button.

**PipelineTracker** — Horizontal strip: `PLAN — SEARCH — SYNTHESIZE — EVALUATE`. Active stage is bold/highlighted. Connected by lines. Shows progress dots.

**SourceCard** — Glass card showing title, type badge (web/paper), domain, score, snippet preview, citation label `[S1]`, link-out icon.

**SynthesisPanel** — Rendered markdown: summary paragraph, numbered key findings, open questions, limitations. Inline citation labels link to source cards.

**ObservabilityPanel** — Right sidebar metrics: cost (USD), latency (seconds), source count, coverage score, token count. Each with a small label and value.

**BottomBar** — Cost indicator, play/stop button, elapsed time.

### Animations

- Pipeline stages animate left-to-right as they activate
- Source cards fade-up as they arrive
- Synthesis text streams in (or fades in paragraph by paragraph)
- Glass panels have subtle hover states
- Cosmic background has slow, gentle drift animation

---

## Build Order

Build in this sequence. Each step is testable before moving on.

### Phase 1 — Scaffold + Data (first session)

1. `npx create-next-app@latest helix` with TypeScript, Tailwind, App Router
2. Install deps: `openai`, `drizzle-orm`, `@neondatabase/serverless`, `zod`, `zustand`
3. Define all types + Zod schemas in `lib/types.ts`
4. Set up Drizzle schema + Neon connection in `lib/db/`
5. Run initial migration — verify tables exist

### Phase 2 — Tools + Agent (second session)

6. Build Tavily web search adapter (`lib/tools/web-search.ts`)
7. Build arXiv adapter (`lib/tools/arxiv.ts`)
8. Build dedupe + scoring utilities (`lib/tools/scoring.ts`)
9. Build planner step — OpenAI call with structured JSON output
10. Build synthesis step — OpenAI call with source context
11. Build evaluator — deterministic metrics computation
12. Wire orchestrator (`lib/agent/orchestrator.ts`) — run all steps in sequence
13. Test orchestrator locally with a sample query via script

### Phase 3 — API + Frontend (third session)

14. Create `POST /api/research` and `GET /api/research/[id]` routes
15. Build QueryComposer component
16. Build PipelineTracker component
17. Build SourceCard + source list
18. Build SynthesisPanel (markdown rendering with citations)
19. Build ObservabilityPanel (right sidebar metrics)
20. Wire frontend: submit query → poll status → render results
21. Add cosmic background + glass panel styling
22. Mobile responsive pass

### Phase 4 — Ship (fourth session)

23. Error handling: failed searches degrade gracefully, invalid LLM output retries once
24. Deploy to Vercel, connect Neon DB, set env vars
25. Smoke test in production
26. Write README with architecture diagram, screenshots, setup instructions

---

## Environment Variables

```env
OPENAI_API_KEY=
TAVILY_API_KEY=
DATABASE_URL=               # Neon Postgres connection string
NEXT_PUBLIC_APP_URL=
```

---

## Dependencies

```json
{
  "openai": "^5",
  "drizzle-orm": "^0.40",
  "@neondatabase/serverless": "^1",
  "zod": "^3",
  "zustand": "^5",
  "react-markdown": "^9",
  "framer-motion": "^12"
}
```

Dev: `drizzle-kit`, `@types/node`, `typescript`, `tailwindcss`, `postcss`.

---

## What This Demonstrates (Portfolio)

- **Agent orchestration** — deterministic state machine, not a chat loop
- **Tool use** — web search + arXiv adapters behind clean interfaces
- **Structured outputs** — Zod-validated LLM responses, typed throughout
- **Source provenance** — every claim traced to a ranked, scored source
- **Observability** — cost, latency, coverage visible in the UI
- **Evaluation** — quality metrics computed per session
- **Product design** — polished glassmorphism UI, responsive, animated
- **Production deployment** — Vercel + Neon, working public URL

---

## What's Explicitly Deferred

- PDF/document upload
- User accounts / auth
- Background job queues (Upstash, Inngest)
- Streaming partial results (SSE)
- Multi-agent loops / autonomous recursion
- Export to PDF/docx
- Re-run single stage
- Advanced evals suite

These are all reasonable v2 features. The MVP ships without them.
