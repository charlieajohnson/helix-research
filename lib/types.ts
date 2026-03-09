import { z } from "zod";

// ── Session Config ─────────────────────────────────────────────────────────────

export const SessionConfigSchema = z.object({
  depth: z.enum(["quick", "standard", "deep"]).default("standard"),
  includeWeb: z.boolean().default(true),
  includeArxiv: z.boolean().default(true),
});

export type SessionConfig = z.infer<typeof SessionConfigSchema>;

// ── Session Status ─────────────────────────────────────────────────────────────

export const SESSION_STATUSES = [
  "intake",
  "planning",
  "searching",
  "ranking",
  "synthesizing",
  "evaluating",
  "complete",
  "failed",
] as const;

export type SessionStatus = (typeof SESSION_STATUSES)[number];

// ── Research Session ───────────────────────────────────────────────────────────

export type ResearchSession = {
  id: string;
  query: string;
  status: SessionStatus;
  config: SessionConfig;
  createdAt: string;
  updatedAt: string;
};

// ── Research Plan ──────────────────────────────────────────────────────────────

export const ResearchPlanSchema = z.object({
  objective: z.string(),
  subquestions: z.array(z.string()),
  searchQueries: z.object({
    web: z.array(z.string()),
    papers: z.array(z.string()),
  }),
  successCriteria: z.array(z.string()),
});

export type ResearchPlan = z.infer<typeof ResearchPlanSchema>;

// ── Research Source ─────────────────────────────────────────────────────────────

export type ResearchSource = {
  id: string;
  sessionId?: string;
  type: "web" | "paper";
  title: string;
  url: string;
  snippet: string;
  authors?: string[];
  publishedAt?: string;
  domain?: string;
  score: number;
  citationLabel?: string;
};

// ── Research Output ────────────────────────────────────────────────────────────

export const ResearchOutputSchema = z.object({
  summary: z.string(),
  keyFindings: z.array(z.string()),
  openQuestions: z.array(z.string()),
  limitations: z.array(z.string()),
  citations: z.array(
    z.object({
      label: z.string(),
      sourceId: z.string(),
    })
  ),
});

export type ResearchOutput = z.infer<typeof ResearchOutputSchema>;

// ── Evaluation Result ──────────────────────────────────────────────────────────

export type EvaluationResult = {
  sourceCount: number;
  coverageScore: number;
  citationCompleteness: number;
  latencyMs: number;
  estimatedCostUsd: number;
  warnings: string[];
};

// ── Full Session Response ──────────────────────────────────────────────────────

export type SessionResponse = {
  session: ResearchSession;
  plan: ResearchPlan | null;
  sources: ResearchSource[];
  output: ResearchOutput | null;
  evaluation: EvaluationResult | null;
};

// ── API Request Schemas ────────────────────────────────────────────────────────

export const CreateResearchRequestSchema = z.object({
  query: z.string().min(5, "Query must be at least 5 characters"),
  config: SessionConfigSchema.optional(),
});

export type CreateResearchRequest = z.infer<typeof CreateResearchRequestSchema>;
