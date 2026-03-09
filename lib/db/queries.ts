import { eq } from "drizzle-orm";
import { db } from "./client";
import {
  researchSessions,
  researchPlans,
  researchSources,
  researchOutputs,
  evaluationResults,
} from "./schema";
import type {
  SessionConfig,
  SessionStatus,
  ResearchPlan,
  ResearchSource,
  ResearchOutput,
  EvaluationResult,
  SessionResponse,
} from "@/lib/types";

// ── Sessions ───────────────────────────────────────────────────────────────────

export async function createSession(query: string, config: SessionConfig) {
  const [session] = await db()
    .insert(researchSessions)
    .values({ query, config, status: "intake" })
    .returning();
  return session;
}

export async function setSessionStatus(id: string, status: SessionStatus) {
  await db()
    .update(researchSessions)
    .set({ status, updatedAt: new Date() })
    .where(eq(researchSessions.id, id));
}

export async function getSession(id: string) {
  const [session] = await db()
    .select()
    .from(researchSessions)
    .where(eq(researchSessions.id, id));
  return session ?? null;
}

// ── Plans ──────────────────────────────────────────────────────────────────────

export async function savePlan(sessionId: string, plan: ResearchPlan) {
  const [row] = await db()
    .insert(researchPlans)
    .values({
      sessionId,
      objective: plan.objective,
      subquestions: plan.subquestions,
      searchQueries: plan.searchQueries,
      successCriteria: plan.successCriteria,
    })
    .returning();
  return row;
}

export async function getPlan(sessionId: string) {
  const [row] = await db()
    .select()
    .from(researchPlans)
    .where(eq(researchPlans.sessionId, sessionId));
  return row ?? null;
}

// ── Sources ────────────────────────────────────────────────────────────────────

export async function saveSources(sessionId: string, sources: ResearchSource[]) {
  if (sources.length === 0) return [];
  const rows = await db()
    .insert(researchSources)
    .values(
      sources.map((s) => ({
        sessionId,
        type: s.type,
        title: s.title,
        url: s.url,
        snippet: s.snippet,
        authors: s.authors ?? [],
        publishedAt: s.publishedAt,
        domain: s.domain,
        score: s.score,
        citationLabel: s.citationLabel,
      }))
    )
    .returning();
  return rows;
}

export async function getSources(sessionId: string) {
  return db()
    .select()
    .from(researchSources)
    .where(eq(researchSources.sessionId, sessionId));
}

// ── Outputs ────────────────────────────────────────────────────────────────────

export async function saveOutput(sessionId: string, output: ResearchOutput) {
  const [row] = await db()
    .insert(researchOutputs)
    .values({
      sessionId,
      summary: output.summary,
      keyFindings: output.keyFindings,
      openQuestions: output.openQuestions,
      limitations: output.limitations,
      citations: output.citations,
    })
    .returning();
  return row;
}

export async function getOutput(sessionId: string) {
  const [row] = await db()
    .select()
    .from(researchOutputs)
    .where(eq(researchOutputs.sessionId, sessionId));
  return row ?? null;
}

// ── Evaluations ────────────────────────────────────────────────────────────────

export async function saveEvaluation(sessionId: string, evaluation: EvaluationResult) {
  const [row] = await db()
    .insert(evaluationResults)
    .values({
      sessionId,
      sourceCount: evaluation.sourceCount,
      coverageScore: evaluation.coverageScore,
      citationCompleteness: evaluation.citationCompleteness,
      latencyMs: evaluation.latencyMs,
      estimatedCostUsd: evaluation.estimatedCostUsd,
      warnings: evaluation.warnings,
    })
    .returning();
  return row;
}

export async function getEvaluation(sessionId: string) {
  const [row] = await db()
    .select()
    .from(evaluationResults)
    .where(eq(evaluationResults.sessionId, sessionId));
  return row ?? null;
}

// ── Full Session Fetch ─────────────────────────────────────────────────────────

export async function getFullSession(id: string): Promise<SessionResponse | null> {
  const session = await getSession(id);
  if (!session) return null;

  const [plan, sources, output, evaluation] = await Promise.all([
    getPlan(id),
    getSources(id),
    getOutput(id),
    getEvaluation(id),
  ]);

  return {
    session: {
      id: session.id,
      query: session.query,
      status: session.status as any,
      config: session.config as any,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    },
    plan: plan
      ? {
          objective: plan.objective,
          subquestions: plan.subquestions as string[],
          searchQueries: plan.searchQueries as any,
          successCriteria: plan.successCriteria as string[],
        }
      : null,
    sources: sources.map((s) => ({
      id: s.id,
      sessionId: s.sessionId,
      type: s.type as "web" | "paper",
      title: s.title,
      url: s.url,
      snippet: s.snippet,
      authors: (s.authors as string[]) ?? [],
      publishedAt: s.publishedAt ?? undefined,
      domain: s.domain ?? undefined,
      score: s.score,
      citationLabel: s.citationLabel ?? undefined,
    })),
    output: output
      ? {
          summary: output.summary,
          keyFindings: output.keyFindings as string[],
          openQuestions: output.openQuestions as string[],
          limitations: output.limitations as string[],
          citations: output.citations as any[],
        }
      : null,
    evaluation: evaluation
      ? {
          sourceCount: evaluation.sourceCount,
          coverageScore: evaluation.coverageScore,
          citationCompleteness: evaluation.citationCompleteness,
          latencyMs: evaluation.latencyMs,
          estimatedCostUsd: evaluation.estimatedCostUsd,
          warnings: evaluation.warnings as string[],
        }
      : null,
  };
}
