import type { ResearchSource } from "@/lib/types";
import { randomUUID } from "crypto";

export async function searchArxiv(queries: string[]): Promise<ResearchSource[]> {
  const allResults: ResearchSource[] = [];
  const seenIds = new Set<string>();

  for (const query of queries.slice(0, 3)) {
    try {
      const encoded = encodeURIComponent(query);
      const url = `https://export.arxiv.org/api/query?search_query=all:${encoded}&start=0&max_results=5&sortBy=relevance&sortOrder=descending`;

      const response = await fetch(url, {
        headers: { "User-Agent": "Helix/1.0 (research-agent)" },
      });

      if (!response.ok) {
        console.error(`arXiv search failed for "${query}": ${response.status}`);
        continue;
      }

      const xml = await response.text();
      const entries = parseArxivEntries(xml);

      for (const entry of entries) {
        if (seenIds.has(entry.arxivId)) continue;
        seenIds.add(entry.arxivId);

        allResults.push({
          id: randomUUID(),
          type: "paper",
          title: entry.title,
          url: entry.url,
          snippet: entry.summary.slice(0, 500),
          authors: entry.authors,
          publishedAt: entry.published,
          domain: "arxiv.org",
          score: 0, // will be scored later
        });
      }
    } catch (err) {
      console.error(`arXiv search error for "${query}":`, err);
    }
  }

  return allResults;
}

interface ArxivEntry {
  arxivId: string;
  title: string;
  summary: string;
  authors: string[];
  published: string;
  url: string;
}

function parseArxivEntries(xml: string): ArxivEntry[] {
  const entries: ArxivEntry[] = [];

  // Simple XML parsing — good enough for arXiv Atom feed
  const entryBlocks = xml.split("<entry>").slice(1);

  for (const block of entryBlocks) {
    const title = extractTag(block, "title")?.replace(/\s+/g, " ").trim() ?? "";
    const summary = extractTag(block, "summary")?.replace(/\s+/g, " ").trim() ?? "";
    const published = extractTag(block, "published") ?? "";
    const idUrl = extractTag(block, "id") ?? "";

    // Extract arXiv ID from URL
    const arxivId = idUrl.split("/abs/").pop() ?? idUrl;

    // Extract authors
    const authors: string[] = [];
    const authorMatches = block.matchAll(/<author>\s*<name>([^<]+)<\/name>/g);
    for (const match of authorMatches) {
      authors.push(match[1].trim());
    }

    if (title && summary) {
      entries.push({
        arxivId,
        title,
        summary,
        authors,
        published: published.split("T")[0], // Just the date
        url: idUrl.replace("http://", "https://"),
      });
    }
  }

  return entries;
}

function extractTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const match = xml.match(regex);
  return match ? match[1] : null;
}
