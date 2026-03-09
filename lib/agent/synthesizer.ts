import OpenAI from "openai";
import {
  ResearchOutputSchema,
  type ResearchOutput,
  type ResearchSource,
} from "@/lib/types";
import {
  SYNTHESIS_SYSTEM_PROMPT,
  buildSynthesisUserMessage,
} from "@/lib/prompts/synthesis";

const client = new OpenAI();

export async function synthesizeStep(
  query: string,
  sources: ResearchSource[]
): Promise<ResearchOutput> {
  if (sources.length === 0) {
    return {
      summary: "No sources were found for this research query. Try broadening your search terms or enabling additional source types.",
      keyFindings: [],
      openQuestions: [query],
      limitations: ["No sources available for synthesis"],
      citations: [],
    };
  }

  const sourceContext = sources.map((s) => ({
    id: s.id,
    citationLabel: s.citationLabel ?? "[S?]",
    title: s.title,
    snippet: s.snippet,
    type: s.type,
    domain: s.domain,
  }));

  const userMessage = buildSynthesisUserMessage(query, sourceContext);

  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.4,
        max_tokens: 2000,
        messages: [
          { role: "system", content: SYNTHESIS_SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
      });

      const raw = completion.choices[0]?.message?.content;
      if (!raw) throw new Error("Empty response from synthesizer");

      const parsed = JSON.parse(raw);

      // Validate citation sourceIds against actual sources
      const validSourceIds = new Set(sources.map((s) => s.id));
      if (parsed.citations) {
        parsed.citations = parsed.citations.filter(
          (c: any) => validSourceIds.has(c.sourceId)
        );
      }

      const output = ResearchOutputSchema.parse(parsed);
      return output;
    } catch (err) {
      if (attempts >= maxAttempts) {
        console.error("Synthesizer failed after retries:", err);
        // Return a fallback synthesis
        return {
          summary: `Research was conducted on "${query}" with ${sources.length} sources found. However, the synthesis step encountered an error. Please review the individual sources below.`,
          keyFindings: sources.slice(0, 3).map(
            (s) => `${s.citationLabel} ${s.title}: ${s.snippet.slice(0, 100)}...`
          ),
          openQuestions: ["Full synthesis could not be completed"],
          limitations: ["Synthesis step failed — raw sources are available"],
          citations: sources.map((s) => ({
            label: s.citationLabel ?? "[S?]",
            sourceId: s.id,
          })),
        };
      }
    }
  }

  throw new Error("Synthesizer failed unexpectedly");
}
