import * as Effect from "effect/Effect";

import { discoverUrls } from "../crawler/discovery";
import { fetchOgTagsEffect } from "../fetchers/og";
import type { OgData } from "../schemas/og";
import type { CategoryId } from "../scoring/categories";
import { scoreOgTags } from "../scoring/engine";
import type { PageScoreResult } from "../scoring/engine";
import { checkImageMeta } from "../scoring/image";

export interface ScanOptions {
  siteUrl: string;
  maxUrls: number;
  concurrency: number;
  onProgress?: (event: ScanProgressEvent) => void;
  signal?: AbortSignal;
}

export interface ScanProgressEvent {
  type: "discovery" | "checking" | "complete" | "error";
  url?: string;
  totalUrls: number;
  completedUrls: number;
  result?: PageScoreResult;
}

export interface ScanReport {
  siteUrl: string;
  scannedAt: string;
  totalPages: number;
  averageScore: number;
  categoryAverages: Record<CategoryId, number>;
  pages: PageScoreResult[];
  summary: {
    // 90-100
    excellent: number;
    // 75-89
    good: number;
    // 50-74
    fair: number;
    // 0-49
    poor: number;
  };
}

/* eslint-disable promise/prefer-await-to-callbacks */
export const scanSite = (
  options: ScanOptions
): Effect.Effect<ScanReport, Error> =>
  Effect.gen(function* scanSiteGen() {
    if (options.onProgress) {
      options.onProgress({
        completedUrls: 0,
        totalUrls: 0,
        type: "discovery",
      });
    }

    const urls = yield* discoverUrls(options.siteUrl, {
      concurrency: options.concurrency,
      maxUrls: options.maxUrls,
    });

    if (urls.length === 0) {
      return {
        averageScore: 0,
        categoryAverages: { image: 0, og: 0, seo: 0, twitter: 0 },
        pages: [],
        scannedAt: new Date().toISOString(),
        siteUrl: options.siteUrl,
        summary: { excellent: 0, fair: 0, good: 0, poor: 0 },
        totalPages: 0,
      };
    }

    let completedUrls = 0;
    const totalUrls = urls.length;

    if (options.onProgress) {
      options.onProgress({
        completedUrls: 0,
        totalUrls,
        type: "checking",
      });
    }

    const scanSingleUrl = (url: string) =>
      Effect.gen(function* scanSingleUrlGen() {
        if (options.signal?.aborted) {
          return yield* Effect.fail(new Error("Scan aborted"));
        }

        const dataResult = yield* fetchOgTagsEffect(url).pipe(Effect.result);
        let data: OgData = {};
        if (dataResult._tag === "Success") {
          data = dataResult.success;
        }

        let imageMeta = null;
        if (data["og:image"]) {
          const imgResult = yield* checkImageMeta(data["og:image"]).pipe(
            Effect.result
          );
          if (imgResult._tag === "Success") {
            imageMeta = imgResult.success;
          }
        }

        const scoreResult = yield* scoreOgTags(data, {
          imageMeta,
          pageUrl: url,
        });

        completedUrls += 1;
        if (options.onProgress) {
          options.onProgress({
            completedUrls,
            result: scoreResult,
            totalUrls,
            type: "checking",
            url,
          });
        }

        return scoreResult;
      });

    const pageScores = yield* Effect.all(
      urls.map((url) => scanSingleUrl(url)),
      { concurrency: options.concurrency }
    );

    // Aggregate statistics
    const totalPages = pageScores.length;
    const sumScore = pageScores.reduce((sum, p) => sum + p.score, 0);
    const averageScore = Math.round(sumScore / totalPages);

    const categorySums: Record<CategoryId, number> = {
      image: 0,
      og: 0,
      seo: 0,
      twitter: 0,
    };
    for (const page of pageScores) {
      for (const cat of page.categories) {
        const percentage =
          cat.maxScore > 0 ? (cat.score / cat.maxScore) * 100 : 0;
        categorySums[cat.id] += percentage;
      }
    }

    const categoryAverages: Record<CategoryId, number> = {
      image: Math.round(categorySums.image / totalPages),
      og: Math.round(categorySums.og / totalPages),
      seo: Math.round(categorySums.seo / totalPages),
      twitter: Math.round(categorySums.twitter / totalPages),
    };

    const summary = { excellent: 0, fair: 0, good: 0, poor: 0 };
    for (const page of pageScores) {
      if (page.score >= 90) {
        summary.excellent += 1;
      } else if (page.score >= 75) {
        summary.good += 1;
      } else if (page.score >= 50) {
        summary.fair += 1;
      } else {
        summary.poor += 1;
      }
    }

    const report: ScanReport = {
      averageScore,
      categoryAverages,
      pages: pageScores,
      scannedAt: new Date().toISOString(),
      siteUrl: options.siteUrl,
      summary,
      totalPages,
    };

    if (options.onProgress) {
      options.onProgress({
        completedUrls,
        totalUrls,
        type: "complete",
      });
    }

    return report;
  }).pipe(
    Effect.mapError((err) =>
      err instanceof Error ? err : new Error(String(err))
    )
  );

export const runScanSite = (options: ScanOptions): Promise<ScanReport> =>
  Effect.runPromise(scanSite(options));
