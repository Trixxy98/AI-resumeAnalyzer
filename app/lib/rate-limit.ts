/**
 * Simple in-memory rate limiter.
 * Tracks request counts per key (e.g. IP address) within a sliding window.
 * Note: resets on server restart. For multi-instance production, use Redis.
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // clean up stale entries every 5 min

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now - entry.windowStart > CLEANUP_INTERVAL_MS) {
      store.delete(key);
    }
  }
}, CLEANUP_INTERVAL_MS);

export interface RateLimitOptions {
  /** Max number of requests allowed per window */
  max: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart >= options.windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: options.max - 1, resetAt: now + options.windowMs };
  }

  entry.count += 1;

  const remaining = Math.max(0, options.max - entry.count);
  const resetAt = entry.windowStart + options.windowMs;

  return {
    allowed: entry.count <= options.max,
    remaining,
    resetAt,
  };
}
