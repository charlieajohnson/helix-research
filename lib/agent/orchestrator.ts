import type { SessionConfig } from "@/lib/types";
import {
  createSession,
  setSessionStatus,
  savePlan,
  saveSources,
  saveOutput,
  saveEvaluation,
} from "@/lib/db/queries";
import { planStep } from "./planner";
import { synthesizeStep } from "./synthesizer";
import { computeEvaluation } from "./evaluator";
import { searchWeb } from "@/lib/tools/web-search";
import { searchArxiv } from "@/lib/tools/arxiv";
import { dedupeAndRank } from "@/lib/tools/scoring";

export async function runResearchSession(
  query: string,
  config: SessionConfig
): Promise<string> {
  const startTime = Date.now();

  // 1. Create session
  const session = await createSession(query, config);
  const sessionId = session.id;

  try {
    // 2. Plan
    await setSessionStatus(sessionId, "planning");
    const plan = await planStep(query, config);
    await savePlan(sessionId, plan);

    // 3. Search (parallel)
    await setSessionStatus(sessionId, "searching");
    const [webResults, paperResults] = await Promise.all([
      config.includeWeb ? searchWeb(plan.searchQueries.web) : Promise.resolve([]),
      config.includeArxiv ? searchArxiv(plan.searchQueries.papers) : Promise.resolve([]),
    ]);

    // 4. Rank
    await setSessionStatus(sessionId, "ranking");
    const ranked = dedupeAndRank([...webResults, ...paperResults]);
    await saveSources(sessionId, ranked);

    // 5. Synthesize
    await setSessionStatus(sessionId, "synthesizing");
    const output = await synthesizeStep(query, ranked);
    await saveOutput(sessionId, output);

    // 6. Evaluate
    await setSessionStatus(sessionId, "evaluating");
    const evaluation = computeEvaluation(ranked, output, startTime);
    await saveEvaluation(sessionId, evaluation);

    // 7. Complete
    await setSessionStatus(sessionId, "complete");
  } catch (err) {
    console.error(`Session ${sessionId} failed:`, err);
    await setSessionStatus(sessionId, "failed");
  }

  return sessionId;
}
