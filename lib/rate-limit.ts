const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 6;

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function checkResearchRateLimit(key: string) {
  const now = Date.now();

  if (buckets.size > 500) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(bucketKey);
    }
  }

  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1, retryAfterSeconds: 0 };
  }

  if (current.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS - current.count, retryAfterSeconds: 0 };
}
