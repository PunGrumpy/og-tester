import { Redis } from "@upstash/redis";

import { env } from "@/lib/env";

const COOLDOWN_MS = 5000;
// Safety net only: release() always clears the lock in the route's finally.
// This TTL just bounds the damage if a request dies before finally runs.
const LOCK_TTL_MS = 5 * 60 * 1000;

export type RateLimitResult =
  | { ok: true; release: () => Promise<void> }
  | { ok: false; reason: "in-progress" | "cooldown" };

interface RateLimiter {
  check: (key: string) => Promise<RateLimitResult>;
}

const lockKey = (key: string) => `scan:lock:${key}`;
const cooldownKey = (key: string) => `scan:cooldown:${key}`;

const createRedisLimiter = (redis: Redis): RateLimiter => ({
  async check(key) {
    const acquired = await redis.set(lockKey(key), "1", {
      nx: true,
      px: LOCK_TTL_MS,
    });
    if (!acquired) {
      return { ok: false, reason: "in-progress" };
    }

    const cooldownActive = await redis.get(cooldownKey(key));
    if (cooldownActive) {
      await redis.del(lockKey(key));
      return { ok: false, reason: "cooldown" };
    }

    return {
      ok: true,
      async release() {
        await Promise.all([
          redis.del(lockKey(key)),
          redis.set(cooldownKey(key), "1", { px: COOLDOWN_MS }),
        ]);
      },
    };
  },
});

const createMemoryLimiter = (): RateLimiter => {
  const activeScans = new Set<string>();
  const cooldowns = new Map<string, number>();

  return {
    check(key) {
      if (activeScans.has(key)) {
        return Promise.resolve({ ok: false, reason: "in-progress" });
      }

      const lastTime = cooldowns.get(key);
      if (lastTime && Date.now() - lastTime < COOLDOWN_MS) {
        return Promise.resolve({ ok: false, reason: "cooldown" });
      }

      activeScans.add(key);

      return Promise.resolve({
        ok: true,
        release() {
          activeScans.delete(key);
          cooldowns.set(key, Date.now());
          return Promise.resolve();
        },
      });
    },
  };
};

let limiter: RateLimiter | undefined;

const getLimiter = (): RateLimiter => {
  if (limiter) {
    return limiter;
  }
  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    limiter = createRedisLimiter(new Redis({ token, url }));
  } else {
    console.warn(
      "UPSTASH_REDIS_REST_URL / _TOKEN are unset — the scan rate limit is kept in memory and will not be shared across instances."
    );
    limiter = createMemoryLimiter();
  }
  return limiter;
};

export const checkScanRateLimit = (key: string): Promise<RateLimitResult> =>
  getLimiter().check(key);

/**
 * Leftmost hop of x-forwarded-for is the real client IP on Vercel; any value
 * after that can be appended by the client itself, so it must not be trusted.
 */
export const getClientIp = (forwarded: string | null | undefined): string => {
  const first = forwarded?.split(",")[0]?.trim();
  return first || "local";
};
