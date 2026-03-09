import type {
  ResearchSource,
  ResearchOutput,
  EvaluationResult,
} from "@/lib/types";

// Approximate token costs for gpt-4o-mini
const INPUT_COST_PER_1K = 0.00015;
const OUTPUT_COST_PER_1K = 0.0006;

export function computeEvaluation(
  sources: ResearchSource[],
  output: ResearchOutput | null,
  startTime: number
): EvaluationResult {
  const latencyMs = Date.now() - startTime;
  const warnings: string[] = [];

  // Source count
  const sourceCount = sources.length;
  if (sourceCount === 0) warnings.push("No sources found");
  if (sourceCount < 3) warnings.push("Low source count — results may be limited");

  // Coverage: diversity of source types and domains
  const types = new Set(sources.map((s) => s.type));
  const domains = new Set(sources.map((s) => s.domain).filter(Boolean));
  const typeDiversity = types.size / 2; // max 2 types
  const domainDiversity = Math.min(domains.size / 5, 1); // normalize to 5 domains
  const coverageScore = sourceCount > 0
    ? (typeDiversity * 0.4 + domainDiversity * 0.4 + Math.min(sourceCount / 8, 1) * 0.2)
    : 0;

  // Citation completeness: how many sources were actually cited
  const citedSourceIds = new Set(
    output?.citations?.map((c) => c.sourceId) ?? []
  );
  const citationCompleteness =
    sourceCount > 0 ? citedSourceIds.size / sourceCount : 0;

  if (citationCompleteness < 0.5) {
    warnings.push("Less than half of sources were cited in the synthesis");
  }

  // Cost estimation (rough)
  // ~500 tokens planner input/output + source tokens + synthesis tokens
  const sourceTokens = sources.reduce(
    (sum, s) => sum + estimateTokens(s.snippet),
    0
  );
  const totalInputTokens = 500 + sourceTokens + 200; // system + sources + query
  const totalOutputTokens = 800; // approximate synthesis output
  const estimatedCostUsd =
    (totalInputTokens / 1000) * INPUT_COST_PER_1K +
    (totalOutputTokens / 1000) * OUTPUT_COST_PER_1K;

  if (latencyMs > 60000) warnings.push("High latency — pipeline took over 60s");

  return {
    sourceCount,
    coverageScore: Math.round(coverageScore * 100) / 100,
    citationCompleteness: Math.round(citationCompleteness * 100) / 100,
    latencyMs,
    estimatedCostUsd: Math.round(estimatedCostUsd * 10000) / 10000,
    warnings,
  };
}

function estimateTokens(text: string): number {
  // Rough approximation: 1 token ≈ 4 characters
  return Math.ceil((text?.length ?? 0) / 4);
}
