import OpenAI from "openai";
import { ResearchPlanSchema, type ResearchPlan, type SessionConfig } from "@/lib/types";
import { PLANNER_SYSTEM_PROMPT } from "@/lib/prompts/planner";

const client = new OpenAI();

export async function planStep(
  query: string,
  config: SessionConfig
): Promise<ResearchPlan> {
  const depthGuidance =
    config.depth === "quick"
      ? "Keep the plan focused — 2-3 subquestions and 2 search queries per source type."
      : config.depth === "deep"
        ? "Be thorough — 4-5 subquestions and 3-4 search queries per source type."
        : "Use moderate depth — 3-4 subquestions and 2-3 search queries per source type.";

  const sourceGuidance = [
    config.includeWeb ? "Web search is enabled." : "Web search is DISABLED — do not generate web queries.",
    config.includeArxiv ? "arXiv paper search is enabled." : "arXiv search is DISABLED — do not generate paper queries.",
  ].join(" ");

  const userMessage = `Research query: "${query}"

Settings:
- ${depthGuidance}
- ${sourceGuidance}

Generate a research plan.`;

  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 1000,
        messages: [
          { role: "system", content: PLANNER_SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
      });

      const raw = completion.choices[0]?.message?.content;
      if (!raw) throw new Error("Empty response from planner");

      const parsed = JSON.parse(raw);
      const plan = ResearchPlanSchema.parse(parsed);

      // Enforce source config
      if (!config.includeWeb) plan.searchQueries.web = [];
      if (!config.includeArxiv) plan.searchQueries.papers = [];

      return plan;
    } catch (err) {
      if (attempts >= maxAttempts) {
        console.error("Planner failed after retries:", err);
        // Return a fallback plan
        return {
          objective: `Research: ${query}`,
          subquestions: [query],
          searchQueries: {
            web: config.includeWeb ? [query] : [],
            papers: config.includeArxiv ? [query] : [],
          },
          successCriteria: ["Find relevant sources", "Synthesize findings"],
        };
      }
    }
  }

  // TypeScript wants a return here even though the loop handles it
  throw new Error("Planner failed unexpectedly");
}
