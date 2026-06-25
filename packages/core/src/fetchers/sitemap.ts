import * as Effect from "effect/Effect";

import {
  parseSitemap,
  isSitemapIndex,
  parseSitemapIndex,
} from "../parsers/sitemap";
import type { SitemapData, SitemapUrl } from "../schemas/sitemap";

const fetchSitemapUrlsRecursive = (
  url: string
): Effect.Effect<SitemapUrl[], Error> =>
  Effect.gen(function* fetchSitemapUrlsRecursiveGen() {
    const response = yield* Effect.tryPromise({
      catch: (e) =>
        new Error(
          `Failed to fetch sitemap at ${url}: ${e instanceof Error ? e.message : String(e)}`
        ),
      try: () => fetch(url),
    });

    if (!response.ok) {
      return yield* Effect.fail(
        new Error(`Failed to fetch sitemap at ${url}: ${response.status}`)
      );
    }

    const content = yield* Effect.tryPromise({
      catch: (e) =>
        new Error(
          `Failed to read sitemap body at ${url}: ${e instanceof Error ? e.message : String(e)}`
        ),
      try: () => response.text(),
    });

    if (isSitemapIndex(content)) {
      const childSitemaps = parseSitemapIndex(content);
      const childResults = yield* Effect.all(
        childSitemaps.map((childUrl) => fetchSitemapUrlsRecursive(childUrl)),
        { concurrency: 5 }
      );
      return childResults.flat();
    }
    return parseSitemap(content);
  });

export const fetchSitemapEffect = (
  url: string
): Effect.Effect<{ content: string; urls: SitemapUrl[] }, Error> =>
  Effect.gen(function* runFetchSitemap() {
    const parsedUrl = yield* Effect.try({
      catch: (e) =>
        new Error(`Invalid URL: ${e instanceof Error ? e.message : String(e)}`),
      try: () => new URL(url),
    });
    const sitemapUrl = parsedUrl.pathname.endsWith(".xml")
      ? parsedUrl.href
      : `${parsedUrl.origin}/sitemap.xml`;

    const response = yield* Effect.tryPromise({
      catch: (e) =>
        new Error(
          `Failed to fetch sitemap.xml: ${e instanceof Error ? e.message : String(e)}`
        ),
      try: () => fetch(sitemapUrl),
    });

    if (!response.ok) {
      return yield* Effect.fail(
        new Error(`Failed to fetch sitemap.xml: ${response.status}`)
      );
    }

    const content = yield* Effect.tryPromise({
      catch: (e) =>
        new Error(
          `Failed to read sitemap.xml body: ${e instanceof Error ? e.message : String(e)}`
        ),
      try: () => response.text(),
    });

    if (isSitemapIndex(content)) {
      const childSitemaps = parseSitemapIndex(content);
      const childResults = yield* Effect.all(
        childSitemaps.map((childUrl) => fetchSitemapUrlsRecursive(childUrl)),
        { concurrency: 5 }
      );
      return { content, urls: childResults.flat() };
    }
    const urls = parseSitemap(content);
    return { content, urls };
  });

export const fetchSitemap = async (url: string): Promise<SitemapData> => {
  try {
    return await Effect.runPromise(fetchSitemapEffect(url));
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { error: msg };
  }
};
