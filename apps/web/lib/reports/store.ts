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
    await redis.zremrangebyrank(RECENT_KEY, 0, -(RECENT_LIMIT + 1));
  },
});

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
    // oxlint-disable-next-line unicorn/prefer-structured-clone
    await getStore().save(JSON.parse(JSON.stringify(entry)) as StoredReport);
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
