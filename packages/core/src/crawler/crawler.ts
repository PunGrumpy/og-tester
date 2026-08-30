/* eslint-disable promise/prefer-await-to-callbacks */
import * as Effect from "effect/Effect";

import type { FetchLike } from "../fetch-like";
import { fetchRobotsTxtEffect } from "../fetchers/robots";
import { parseRobotsTxt, isUrlDisallowed } from "../parsers/robots";
import type { RobotsRules } from "../parsers/robots";

export const isHtmlPageUrl = (url: URL): boolean => {
  const { pathname } = url;

  // 1. Ignore Next.js internal paths and standard assets
  if (
    pathname.includes("/_next/") ||
    pathname.startsWith("/_next") ||
    pathname.includes("/node_modules/")
  ) {
    return false;
  }

  // 2. Ignore typical asset extensions
  const assetExtensions = [
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".ico",
    ".webp",
    ".avif",
    ".css",
    ".js",
    ".mjs",
    ".ts",
    ".map",
    ".pdf",
    ".epub",
    ".zip",
    ".tar",
    ".gz",
    ".mp4",
    ".webm",
    ".ogg",
    ".mp3",
    ".wav",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
    ".xml",
    ".json",
    ".txt",
  ];

  const lastSegment = pathname.split("/").pop() || "";
  if (lastSegment.includes(".")) {
    const ext = lastSegment.slice(lastSegment.lastIndexOf(".")).toLowerCase();
    if (assetExtensions.includes(ext)) {
      return false;
    }
  }

  return true;
};

export const isSameSite = (url1: URL, url2: URL): boolean => {
  const h1 = url1.hostname.replace(/^www\./iu, "");
  const h2 = url2.hostname.replace(/^www\./iu, "");
  return h1 === h2 && url1.protocol === url2.protocol;
};

export interface CrawlerOptions {
  maxUrls: number;
  concurrency?: number;
  fetch?: FetchLike;
}

export interface DiscoveredUrl {
  url: string;
  /**
   * The page whose HTML linked here. Absent for the entry point, and for
   * anything a sitemap listed rather than a link.
   */
  foundOn?: string;
}

export const crawlSite = (
  startUrl: string,
  options: CrawlerOptions
): Effect.Effect<DiscoveredUrl[], Error> =>
  Effect.gen(function* crawlSiteGen() {
    const originUrl = yield* Effect.try({
      catch: (e) =>
        new Error(
          `Invalid start URL: ${e instanceof Error ? e.message : String(e)}`
        ),
      try: () => new URL(startUrl),
    });

    const { origin } = originUrl;
    const doFetch = options.fetch ?? fetch;

    // 1. Fetch robots.txt and parse rules
    const robotsResult = yield* fetchRobotsTxtEffect(startUrl, {
      fetch: doFetch,
    }).pipe(Effect.result);
    let robotsRules: RobotsRules = { disallowedPatterns: [] };
    if (robotsResult._tag === "Success") {
      robotsRules = parseRobotsTxt(robotsResult.success.content);
    }

    const visited = new Set<string>();
    // Every URL we have seen, against the page we saw it on. The entry point
    // was not linked from anywhere, so it maps to undefined.
    const discovered = new Map<string, string | undefined>();
    const queue: string[] = [originUrl.href];
    discovered.set(originUrl.href, undefined);

    const { maxUrls } = options;
    const concurrency = options.concurrency || 5;

    const extractInternalLinks = (html: string, baseUrl: string): string[] => {
      const links: string[] = [];
      const hrefRegex = /href=["'](?<g1>[^"']+)["']/giu;
      let match;
      while ((match = hrefRegex.exec(html)) !== null) {
        const [, rawHref] = match;
        try {
          const resolved = new URL(rawHref, baseUrl);
          if (isSameSite(resolved, originUrl) && isHtmlPageUrl(resolved)) {
            resolved.hash = "";
            let { href } = resolved;
            if (href.endsWith("/") && href !== `${origin}/`) {
              href = href.slice(0, -1);
            }
            links.push(href);
          }
        } catch {
          // ignore invalid URLs
        }
      }
      return links;
    };

    while (queue.length > 0 && visited.size < maxUrls) {
      const batchSize = Math.min(
        concurrency,
        queue.length,
        maxUrls - visited.size
      );
      const batch = queue.splice(0, batchSize);

      const crawlResults = yield* Effect.all(
        batch.map((url) => {
          visited.add(url);
          const parsed = new URL(url);
          if (isUrlDisallowed(parsed.pathname + parsed.search, robotsRules)) {
            return Effect.succeed({ html: "", skipped: true, url });
          }

          return Effect.tryPromise({
            catch: () => new Error("Failed fetch"),
            try: () => doFetch(url),
          }).pipe(
            Effect.flatMap((response) => {
              if (!response.ok) {
                return Effect.succeed({ html: "", skipped: true, url });
              }
              return Effect.tryPromise({
                catch: () => new Error("Failed read text"),
                try: () => response.text(),
              }).pipe(Effect.map((html) => ({ html, skipped: false, url })));
            }),
            Effect.catch(() => Effect.succeed({ html: "", skipped: true, url }))
          );
        }),
        { concurrency }
      );

      for (const res of crawlResults) {
        if (res.skipped || !res.html) {
          continue;
        }

        const newLinks = extractInternalLinks(res.html, res.url);
        for (const link of newLinks) {
          if (!discovered.has(link) && discovered.size < maxUrls * 2) {
            discovered.set(link, res.url);
            queue.push(link);
          }
        }
      }
    }

    return [...visited]
      .slice(0, maxUrls)
      .map((url) => ({ foundOn: discovered.get(url), url }));
  }).pipe(
    Effect.mapError((err) =>
      err instanceof Error ? err : new Error(String(err))
    )
  );
