import * as Effect from "effect/Effect";

import { fetchSitemapEffect } from "../fetchers/sitemap";
import { crawlSite, isHtmlPageUrl, isSameSite } from "./crawler";

export interface DiscoveryOptions {
  maxUrls: number;
  concurrency?: number;
}

export const discoverUrls = (
  siteUrl: string,
  options: DiscoveryOptions
): Effect.Effect<string[], Error> =>
  Effect.gen(function* discoverUrlsGen() {
    const sitemapResult = yield* fetchSitemapEffect(siteUrl).pipe(
      Effect.result
    );
    let sitemapUrls: string[] = [];

    if (sitemapResult._tag === "Success") {
      sitemapUrls = (sitemapResult.success.urls || []).map(
        (u: { loc: string }) => u.loc
      );
    }

    if (sitemapUrls.length > 0) {
      const originUrl = yield* Effect.try({
        catch: (e) =>
          new Error(
            `Invalid site URL: ${e instanceof Error ? e.message : String(e)}`
          ),
        try: () => new URL(siteUrl),
      });

      const sameOriginUrls = sitemapUrls.filter((urlStr) => {
        try {
          const parsed = new URL(urlStr);
          return isSameSite(parsed, originUrl) && isHtmlPageUrl(parsed);
        } catch {
          return false;
        }
      });

      if (sameOriginUrls.length > 0) {
        return sameOriginUrls.slice(0, options.maxUrls);
      }
    }

    return yield* crawlSite(siteUrl, {
      concurrency: options.concurrency,
      maxUrls: options.maxUrls,
    });
  }).pipe(
    // eslint-disable-next-line promise/prefer-await-to-callbacks
    Effect.mapError((err) =>
      err instanceof Error ? err : new Error(String(err))
    )
  );
