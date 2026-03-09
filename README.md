# Helix — AI Research Assistant

> AI-powered research agent with visible orchestration, source provenance, and structured synthesis.

Helix takes a research question, plans a search strategy, searches the web and arXiv, ranks and deduplicates sources, synthesizes a cited brief, and evaluates quality — all visible as a live pipeline in the UI.

## Architecture

```
User query
  → PLAN        (decompose into subquestions + search queries)
  → SEARCH      (web + arXiv in parallel)
  → RANK        (dedupe, score, assign citation labels)
  → SYNTHESIZE  (structured brief citing ranked sources)
  → EVALUATE    (coverage, cost, latency, warnings)
  → COMPLETE
```

### Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, Zustand, Framer Motion
- **Backend**: Next.js API routes, OpenAI API (GPT-4o-mini / GPT-5-mini)
- **Search**: Tavily (web), arXiv API (papers)
- **Database**: Neon Postgres + Drizzle ORM
- **Deployment**: Vercel

### Key Design Decisions

- **Deterministic pipeline** — controlled state machine, not an autonomous loop
- **Two LLM calls** — planner + synthesizer. Evaluation is deterministic
- **No LangChain** — direct OpenAI SDK usage for transparency
- **Zod-validated** — every step has typed input/output contracts
- **Flat architecture** — single Next.js app, no monorepo overhead

## Setup

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) Postgres database
- An [OpenAI](https://platform.openai.com) API key
- A [Tavily](https://tavily.com) API key (free tier)

### Install

```bash
git clone <repo-url> && cd helix
npm install
```

### Configure

```bash
cp .env.example .env
```

Fill in your keys:

```env
OPENAI_API_KEY=sk-...
TAVILY_API_KEY=tvly-...
DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database

Push the schema to your Neon database:

```bash
npm run db:push
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment (Vercel)

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add environment variables (same as `.env`)
4. Deploy — Vercel handles the rest

## Project Structure

```
helix/
├── app/                         ← Next.js app router
│   ├── page.tsx                 ← Landing / query composer
│   ├── research/[id]/page.tsx   ← Active session view
│   └── api/
│       ├── research/route.ts    ← POST: create + run session
│       ├── research/[id]/route.ts ← GET: fetch session state
│       └── health/route.ts
├── lib/
│   ├── agent/                   ← Pipeline steps
│   │   ├── orchestrator.ts      ← Runs the full pipeline
│   │   ├── planner.ts           ← Decomposes query → plan
│   │   ├── synthesizer.ts       ← Sources → cited brief
│   │   └── evaluator.ts         ← Computes quality metrics
│   ├── tools/                   ← Search adapters
│   │   ├── web-search.ts        ← Tavily API
│   │   ├── arxiv.ts             ← arXiv API (no key needed)
│   │   └── scoring.ts           ← Dedupe + rank
│   ├── db/                      ← Drizzle ORM
│   │   ├── schema.ts
│   │   ├── client.ts
│   │   └── queries.ts
│   ├── prompts/                 ← LLM prompts
│   ├── types.ts                 ← Zod schemas + types
│   └── store.ts                 ← Zustand state
└── components/                  ← React UI
    ├── QueryComposer.tsx
    ├── PipelineTracker.tsx
    ├── SourceCard.tsx
    ├── SynthesisPanel.tsx
    ├── ObservabilityPanel.tsx
    └── ui/
```

## What This Demonstrates

- **Agent orchestration** — deterministic state machine, not a chat loop
- **Tool use** — web search + arXiv adapters behind clean interfaces
- **Structured outputs** — Zod-validated LLM responses, typed throughout
- **Source provenance** — every claim traced to a ranked, scored source
- **Observability** — cost, latency, coverage visible in the UI
- **Evaluation** — quality metrics computed per session
- **Product design** — glassmorphism UI with cosmic aesthetic
- **Production deployment** — Vercel + Neon, working public URL

## License

MIT
