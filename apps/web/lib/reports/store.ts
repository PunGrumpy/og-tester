import "server-only";
import type { ScanReport } from "@og-tester/core";
import { Redis } from "@upstash/redis";
import { unstable_cache } from "next/cache";

import { env } from "@/lib/env";
import type { OgData } from "@/lib/schemas/og";

interface StoredReport {
  domain: string;
  siteUrl: string;
  /** ISO 8601, set when the scan completed. */
  scannedAt: string;
  report: ScanReport;
  /** Tags from the entry page, for the previews the report page renders. */
  og: OgData;
}

export interface RecentEntry {
  domain: string;
  score: number;
  scannedAt: string;
}

/**
 * How many domains the index keeps. Everything past this falls off the end of
 * the browsable list; the report itself stays reachable at its own URL.
 */
const RECENT_LIMIT = 500;

/**
 * One tag over every read, so a finished scan invalidates the lists and the
 * report together rather than each entry aging out on its own clock. The scan
 * route clears it; see `revalidateReports`.
 */
export const REPORTS_TAG = "reports";

/**
 * How long a cached read survives without anyone clearing the tag.
 *
 * The tag is the fast path, but it only fires if the request that wrote the
 * report gets far enough to clear it. This window is the guarantee underneath
 * that: a list is never more than a minute behind the store, whatever happened
 * to the scan that filled it.
 */
const CACHE_SECONDS = 60;

const toRecentEntry = (entry: StoredReport): RecentEntry => ({
  domain: entry.domain,
  scannedAt: entry.scannedAt,
  score: entry.report.averageScore,
});

const key = (domain: string) => `report:${domain}`;
const RECENT_KEY = "reports:recent";

/**
 * Reports are keyed by domain and never expire on their own — a report is a
 * snapshot with a date on it, and a stale one is still the last thing we
 * observed. Rescanning is what replaces it.
 *
 * Redis is used when it is configured and an in-process Map when it is not, so
 * `bun dev` works with no credentials. The Map is per-instance and dies with
 * the process, which is fine for development and useless in production — hence
 * the warning rather than a silent fallback.
 */
interface ReportPage {
  entries: RecentEntry[];
  /** Domains in the index, for working out how many pages there are. */
  total: number;
}

interface ReportStore {
  get(domain: string): Promise<StoredReport | null>;
  save(entry: StoredReport): Promise<void>;
  list(offset: number, limit: number): Promise<ReportPage>;
}

const createRedisStore = (redis: Redis): ReportStore => ({
  async get(domain) {
    return await redis.get<StoredReport>(key(domain));
  },
  async list(offset, limit) {
    // Newest first, and the score is the timestamp so the set stays ordered
    // without a second read. The count comes from the same sorted set, so a
    // page and its total can never disagree about what is in the index.
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
    return {
      entries: entries
        .filter((entry): entry is StoredReport => entry !== null)
        .map(toRecentEntry),
      total,
    };
  },
  async save(entry) {
    await Promise.all([
      redis.set(key(entry.domain), entry),
      redis.zadd(RECENT_KEY, {
        member: entry.domain,
        score: Date.parse(entry.scannedAt),
      }),
    ]);
    // Keep the tail bounded; rank 0 is the oldest with the default ordering.
    await redis.zremrangebyrank(RECENT_KEY, 0, -(RECENT_LIMIT + 1));
  },
});

/**
 * Held on `globalThis` because Next bundles this module once per route, so a
 * plain module-level Map would give the scan route and the report page a store
 * each, and nothing saved by one would ever be found by the other.
 */
const memoryEntries = ((): Map<string, StoredReport> => {
  const scope = globalThis as typeof globalThis & {
    __ogTesterReports?: Map<string, StoredReport>;
  };
  scope.__ogTesterReports ??= new Map();
  return scope.__ogTesterReports;
})();

const memoryStore: ReportStore = {
  get(domain) {
    return Promise.resolve(memoryEntries.get(domain) ?? null);
  },
  list(offset, limit) {
    const sorted = [...memoryEntries.values()].toSorted(
      (a, b) => Date.parse(b.scannedAt) - Date.parse(a.scannedAt)
    );
    return Promise.resolve({
      entries: sorted.slice(offset, offset + limit).map(toRecentEntry),
      total: sorted.length,
    });
  },
  save(entry) {
    memoryEntries.set(entry.domain, entry);
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

/**
 * Reads never take the whole page down with them: a report that cannot be
 * fetched is indistinguishable from one that was never run, and both mean the
 * reader gets a fresh scan.
 */
export const getReport = unstable_cache(
  async (domain: string): Promise<StoredReport | null> => {
    try {
      return await getStore().get(domain);
    } catch (error) {
      console.error("Failed to read report", error);
      return null;
    }
  },
  ["report"],
  { revalidate: CACHE_SECONDS, tags: [REPORTS_TAG] }
);

export const saveReport = async (entry: StoredReport): Promise<void> => {
  try {
    // Round-tripped through JSON so both backends hold the same plain shape:
    // the scorer builds diagnostics as Effect schema classes, which Redis
    // flattens on write but the in-memory map would keep — and a prototype
    // cannot cross the server/client boundary. Not `structuredClone`, which
    // preserves the `undefined` values Redis drops; JSON is what Redis does.
    // oxlint-disable-next-line unicorn/prefer-structured-clone
    await getStore().save(JSON.parse(JSON.stringify(entry)) as StoredReport);
  } catch (error) {
    console.error("Failed to save report", error);
  }
};

/**
 * A window onto the index, newest first.
 *
 * Cached rather than read per request: the lists change only when a scan
 * finishes, and that path clears the tag itself, so the pages can be served
 * from the data cache without ever going stale.
 */
export const listReports = unstable_cache(
  async (offset = 0, limit = 10): Promise<ReportPage> => {
    try {
      return await getStore().list(offset, limit);
    } catch (error) {
      console.error("Failed to list reports", error);
      return { entries: [], total: 0 };
    }
  },
  ["reports"],
  { revalidate: CACHE_SECONDS, tags: [REPORTS_TAG] }
);
