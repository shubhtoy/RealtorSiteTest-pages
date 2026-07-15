/**
 * In-memory sliding-window rate limiter keyed by client IP.
 *
 * Single-instance scope: all state lives in a module-level Map inside one
 * server process, so limits are only enforced per instance. Behind a load
 * balancer, multiple instances, or a serverless platform (where invocations may
 * be isolated or cold-started), counts are NOT shared — use a distributed store
 * (e.g. Redis) if you need cross-instance enforcement.
 */

export type RateLimitOptions = {
  /** Maximum number of requests allowed within the window. */
  limit: number;
  /** Sliding window size in milliseconds. */
  windowMs: number;
};

export type RateLimitResult = {
  /** Whether this request is under the limit and may proceed. */
  allowed: boolean;
  /** Requests remaining in the current window (0 when blocked). */
  remaining: number;
  /** Milliseconds until the caller may retry (0 when allowed). */
  retryAfterMs: number;
};

// key -> ascending list of request timestamps (ms) still inside the window.
const buckets = new Map<string, number[]>();

/**
 * Records a request for `key` and reports whether it is within `limit` over the
 * trailing `windowMs`. Timestamps older than the window are discarded on each
 * call, giving a true sliding window rather than fixed buckets.
 */
export function rateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  const recent = (buckets.get(key) ?? []).filter((ts) => ts > windowStart);

  if (recent.length >= limit) {
    // Persist the pruned list so stale timestamps don't accumulate.
    buckets.set(key, recent);
    const oldest = recent[0] ?? now;
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, oldest + windowMs - now),
    };
  }

  recent.push(now);
  buckets.set(key, recent);
  return {
    allowed: true,
    remaining: Math.max(0, limit - recent.length),
    retryAfterMs: 0,
  };
}
