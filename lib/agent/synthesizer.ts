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

  // Build a label → sourceId map so we can construct citations ourselves
  const labelToId = new Map<string, string>();
  for (const s of sources) {
    if (s.citationLabel) {
      labelToId.set(s.citationLabel, s.id);
    }
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

      // Build citations from the labels the LLM actually used
      const usedLabels: string[] = parsed.citationLabels ?? [];
      // Also scan the text for any [SN] labels the LLM used but didn't list
      const allText = [parsed.summary, ...(parsed.keyFindings ?? [])].join(" ");
      const foundLabels = allText.match(/\[S\d+\]/g) ?? [];
      const allLabels = [...new Set([...usedLabels, ...foundLabels])];

      const citations = allLabels
        .map((label: string) => {
          const sourceId = labelToId.get(label);
          return sourceId ? { label, sourceId } : null;
        })
        .filter(Boolean) as { label: string; sourceId: string }[];

      const output: ResearchOutput = {
        summary: parsed.summary ?? "",
        keyFindings: parsed.keyFindings ?? [],
        openQuestions: parsed.openQuestions ?? [],
        limitations: parsed.limitations ?? [],
        citations,
      };

      ResearchOutputSchema.parse(output);
      return output;
    } catch (err) {
      if (attempts >= maxAttempts) {
        console.error("Synthesizer failed after retries:", err);
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
