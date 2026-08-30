import "server-only";
import type { ScanReport } from "@og-tester/core";
import { Redis } from "@upstash/redis";
import { cacheLife, cacheTag } from "next/cache";

import { env } from "@/lib/env";
import type { OgData } from "@/lib/schemas/og";

interface StoredReport {
  domain: string;
  siteUrl: string;
  scannedAt: string;
  report: ScanReport;
  og: OgData;
}

export interface RecentEntry {
  domain: string;
  score: number;
  scannedAt: string;
}

const RECENT_LIMIT = 500;

export const REPORTS_TAG = "reports";

export const reportTag = (domain: string) => `reports:${domain}`;

const CACHE_PROFILE = "minutes";

const toRecentEntry = (entry: StoredReport): RecentEntry => ({
  domain: entry.domain,
  scannedAt: entry.scannedAt,
  score: entry.report.averageScore,
});

const key = (domain: string) => `report:${domain}`;
const RECENT_KEY = "reports:recent";

// A report behind a shareable link can be regenerated with one click, so 30
// days is plenty of retention without letting the store grow unbounded.
const REPORT_TTL_SECONDS = 60 * 60 * 24 * 30;

interface ReportPage {
  entries: RecentEntry[];
  total: number;
}

interface ReportStore {
  get: (domain: string) => Promise<StoredReport | null>;
  save: (entry: StoredReport) => Promise<void>;
  list: (offset: number, limit: number) => Promise<ReportPage>;
}

const createRedisStore = (redis: Redis): ReportStore => ({
  async get(domain) {
    return await redis.get<StoredReport>(key(domain));
  },
  async list(offset, limit) {
    const [domains, total] = await Promise.all([
      redis.zrange<string[]>(RECENT_KEY, offset, offset + limit - 1, {
        rev: true,
      }),
      redis.zcard(RECENT_KEY),
    ]);
    if (domains.length === 0) {
      return { entries: [], total };
    }
    const entries = await redis.mget<(StoredReport | null)[]>(
      ...domains.map(key)
    );
    const missing = domains.filter((_, i) => entries[i] === null);
    if (missing.length > 0) {
      await redis.zrem(RECENT_KEY, ...missing).catch((error) => {
        console.error("Failed to prune stale report index members", error);
      });
    }
    return {
      entries: entries
        .filter((entry): entry is StoredReport => entry !== null)
        .map(toRecentEntry),
      total: Math.max(0, total - missing.length),
    };
  },
  async save(entry) {
    await Promise.all([
      redis.set(key(entry.domain), entry, { ex: REPORT_TTL_SECONDS }),
      redis.zadd(RECENT_KEY, {
        member: entry.domain,
        score: Date.parse(entry.scannedAt),
      }),
    ]);
    // zremrangebyrank returns a count, not the removed members, so read the
    // range beyond the newest RECENT_LIMIT first and delete their payloads
    // alongside the trim. Read-then-delete is not atomic; a concurrent save
    // can race it, but the loser only deletes an entry the winner also
    // considered evictable, and the TTL above backstops anything missed.
    const evicted = await redis.zrange<string[]>(
      RECENT_KEY,
      0,
      -(RECENT_LIMIT + 1)
    );
    if (evicted.length > 0) {
      await Promise.all([
        redis.del(...evicted.map(key)),
        redis.zremrangebyrank(RECENT_KEY, 0, -(RECENT_LIMIT + 1)),
      ]);
    }
  },
});

// Holds the JSON Redis would hold, not the object handed in. The scorer builds
// diagnostics as schema classes and Redis flattens them on write, so keeping
// live objects here would make the two backends return different shapes for
// the same report.
const memoryEntries = ((): Map<string, string> => {
  const scope = globalThis as typeof globalThis & {
    __ogTesterReports?: Map<string, string>;
  };
  scope.__ogTesterReports ??= new Map();
  return scope.__ogTesterReports;
})();

const readEntry = (raw: string) => JSON.parse(raw) as StoredReport;

const memoryStore: ReportStore = {
  get(domain) {
    const raw = memoryEntries.get(domain);
    return Promise.resolve(raw ? readEntry(raw) : null);
  },
  list(offset, limit) {
    const sorted = [...memoryEntries.values()]
      .map(readEntry)
      .toSorted((a, b) => Date.parse(b.scannedAt) - Date.parse(a.scannedAt));
    return Promise.resolve({
      entries: sorted.slice(offset, offset + limit).map(toRecentEntry),
      total: sorted.length,
    });
  },
  save(entry) {
    memoryEntries.set(entry.domain, JSON.stringify(entry));
    return Promise.resolve();
  },
};

let store: ReportStore | undefined;

const getStore = (): ReportStore => {
  if (store) {
    return store;
  }
  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    store = createRedisStore(new Redis({ token, url }));
  } else {
    console.warn(
      "UPSTASH_REDIS_REST_URL / _TOKEN are unset — reports are kept in memory and will not survive a restart."
    );
    store = memoryStore;
  }
  return store;
};

export const getReport = async (
  domain: string
): Promise<StoredReport | null> => {
  "use cache";
  cacheLife(CACHE_PROFILE);
  cacheTag(reportTag(domain));
  try {
    return await getStore().get(domain);
  } catch (error) {
    console.error("Failed to read report", error);
    return null;
  }
};

export const saveReport = async (entry: StoredReport): Promise<void> => {
  try {
    await getStore().save(entry);
  } catch (error) {
    console.error("Failed to save report", error);
  }
};

export const listReports = async (
  offset = 0,
  limit = 10
): Promise<ReportPage> => {
  "use cache";
  cacheLife(CACHE_PROFILE);
  cacheTag(REPORTS_TAG);
  try {
    return await getStore().list(offset, limit);
  } catch (error) {
    console.error("Failed to list reports", error);
    return { entries: [], total: 0 };
  }
};
