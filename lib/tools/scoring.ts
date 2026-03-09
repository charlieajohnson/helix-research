import type { ResearchSource } from "@/lib/types";

// Domain reputation tiers (higher = more credible)
const DOMAIN_SCORES: Record<string, number> = {
  "arxiv.org": 0.9,
  "nature.com": 0.95,
  "science.org": 0.95,
  "ieee.org": 0.9,
  "acm.org": 0.9,
  "nih.gov": 0.9,
  "gov": 0.85,
  "edu": 0.85,
  "wikipedia.org": 0.6,
  "medium.com": 0.3,
  "reddit.com": 0.2,
};

export function dedupeAndRank(
  sources: ResearchSource[],
  maxResults: number = 10
): ResearchSource[] {
  // 1. Deduplicate by URL
  const seen = new Map<string, ResearchSource>();
  for (const source of sources) {
    const normalizedUrl = normalizeUrl(source.url);
    const existing = seen.get(normalizedUrl);
    if (!existing || source.score > existing.score) {
      seen.set(normalizedUrl, source);
    }
  }

  // 2. Deduplicate by fuzzy title match
  const deduped: ResearchSource[] = [];
  const titleSet = new Set<string>();
  for (const source of seen.values()) {
    const normalizedTitle = source.title.toLowerCase().replace(/[^a-z0-9]/g, "");
    // Skip if we've seen a very similar title (>80% match by prefix)
    let isDupe = false;
    for (const existing of titleSet) {
      if (similarityScore(normalizedTitle, existing) > 0.8) {
        isDupe = true;
        break;
      }
    }
    if (!isDupe) {
      titleSet.add(normalizedTitle);
      deduped.push(source);
    }
  }

  // 3. Score each source
  const scored = deduped.map((source) => ({
    ...source,
    score: computeScore(source),
  }));

  // 4. Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // 5. Take top N and assign citation labels
  return scored.slice(0, maxResults).map((source, i) => ({
    ...source,
    citationLabel: `[S${i + 1}]`,
  }));
}

function computeScore(source: ResearchSource): number {
  let score = 0;

  // Base score from search relevance
  score += (source.score || 0.5) * 0.4;

  // Domain credibility
  const domainScore = getDomainScore(source.domain ?? "");
  score += domainScore * 0.3;

  // Recency bonus (web sources)
  if (source.type === "web" && source.publishedAt) {
    const age = daysSince(source.publishedAt);
    const recencyScore = Math.max(0, 1 - age / 365);
    score += recencyScore * 0.15;
  }

  // Paper bonus — academic sources get a slight boost
  if (source.type === "paper") {
    score += 0.1;
  }

  // Snippet quality — longer, more substantive snippets score higher
  const snippetLength = source.snippet?.length ?? 0;
  score += Math.min(snippetLength / 500, 1) * 0.05;

  return Math.min(score, 1);
}

function getDomainScore(domain: string): number {
  if (!domain) return 0.4;

  // Direct match
  if (DOMAIN_SCORES[domain]) return DOMAIN_SCORES[domain];

  // TLD match
  const tld = domain.split(".").pop() ?? "";
  if (DOMAIN_SCORES[tld]) return DOMAIN_SCORES[tld];

  // Check if domain ends with a known high-reputation suffix
  for (const [key, value] of Object.entries(DOMAIN_SCORES)) {
    if (domain.endsWith(key)) return value;
  }

  return 0.4; // default
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname}${u.pathname}`.replace(/\/+$/, "").toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

function similarityScore(a: string, b: string): number {
  if (a === b) return 1;
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (longer.length === 0) return 1;

  // Simple prefix/substring overlap
  let matches = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (shorter[i] === longer[i]) matches++;
  }
  return matches / longer.length;
}

function daysSince(dateStr: string): number {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  } catch {
    return 365; // default to old
  }
}
