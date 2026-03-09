import type { ResearchSource } from "@/lib/types";
import { randomUUID } from "crypto";

interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
}

interface TavilyResponse {
  results: TavilyResult[];
}

export async function searchWeb(queries: string[]): Promise<ResearchSource[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    console.warn("TAVILY_API_KEY not set — returning empty web results");
    return [];
  }

  const allResults: ResearchSource[] = [];
  const seenUrls = new Set<string>();

  // Run queries sequentially to stay within rate limits
  for (const query of queries.slice(0, 4)) {
    try {
      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          query,
          max_results: 5,
          include_answer: false,
          search_depth: "basic",
        }),
      });

      if (!response.ok) {
        console.error(`Tavily search failed for "${query}": ${response.status}`);
        continue;
      }

      const data: TavilyResponse = await response.json();

      for (const result of data.results) {
        if (seenUrls.has(result.url)) continue;
        seenUrls.add(result.url);

        const domain = extractDomain(result.url);

        allResults.push({
          id: randomUUID(),
          type: "web",
          title: result.title,
          url: result.url,
          snippet: result.content?.slice(0, 500) ?? "",
          domain,
          publishedAt: result.published_date,
          score: result.score ?? 0,
        });
      }
    } catch (err) {
      console.error(`Tavily search error for "${query}":`, err);
    }
  }

  return allResults;
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "unknown";
  }
}
