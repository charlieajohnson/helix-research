# Helix research desk

[Live product](https://helix-research-flax.vercel.app)

Helix turns a difficult question into an evidence-backed brief. It preserves the research plan, ranked source set, cited findings, limitations and open questions so an analyst can inspect the work behind the answer.

It is designed for technical strategy, investment research, product intelligence and R&D workflows where a defensible first brief matters more than a fast chat response.

## Research flow

```text
Question
  -> plan the research
  -> search web and arXiv sources
  -> deduplicate and rank evidence
  -> synthesise a cited brief
  -> evaluate coverage and citation use
```

The pipeline is deterministic and bounded. Planning and synthesis use two structured OpenAI calls. Search, ranking and evaluation remain explicit application steps.

## Product surface

- Decision-led research composer with configurable depth and source sets
- Visible plan and stage progression
- Executive read with citations linked to source records
- Evidence ledger with source metadata and excerpts
- Open questions, limitations and run details
- Non-cacheable session responses and no public session index
- Best-effort request limits on new briefs

Helix prepares a research brief. Material claims should be verified against the linked primary sources.

## Stack

- Next.js 15, React 19 and TypeScript
- Tailwind CSS and Zustand
- OpenAI for structured planning and synthesis
- Tavily and arXiv for source retrieval
- Neon Postgres with Drizzle ORM
- Vercel deployment

## Local setup

Requirements: Node.js 20 or later, a Neon database, an OpenAI API key and a Tavily API key.

```bash
npm install
cp .env.example .env.local
```

Set:

```env
OPENAI_API_KEY=
TAVILY_API_KEY=
DATABASE_URL=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Push the schema and start the app:

```bash
npm run db:push
npm run dev
```

Validation:

```bash
npm run typecheck
npm run build
```

## Main application boundaries

```text
app/
  page.tsx                         landing and query composer
  research/[id]/page.tsx           live research record
  api/research/route.ts             create a bounded research run
  api/research/[id]/route.ts        read one private, non-cacheable record
components/                         product interface
lib/agent/                          planning, synthesis and orchestration
lib/tools/                          Tavily, arXiv and deterministic ranking
lib/db/                             Drizzle schema and queries
```

The source repository contains no credentials. Use Vercel project variables for production configuration.
