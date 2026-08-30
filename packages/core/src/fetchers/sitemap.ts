import * as Effect from "effect/Effect";

import type { FetchOptions } from "../fetch-like";
import { HTML_MAX_BYTES, readTextCapped, withTimeout } from "../http";
import {
  parseSitemap,
  isSitemapIndex,
  parseSitemapIndex,
} from "../parsers/sitemap";
import type { SitemapData, SitemapUrl } from "../schemas/sitemap";

const fetchSitemapUrlsRecursive = (
  url: string,
  options?: FetchOptions
): Effect.Effect<SitemapUrl[], Error> =>
  Effect.gen(function* fetchSitemapUrlsRecursiveGen() {
    const doFetch = withTimeout(options?.fetch ?? fetch);
    const response = yield* Effect.tryPromise({
      catch: (e) =>
        new Error(
          `Failed to fetch sitemap at ${url}: ${e instanceof Error ? e.message : String(e)}`
        ),
      try: () => doFetch(url),
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
      try: () => readTextCapped(response, HTML_MAX_BYTES),
    });

    if (content === null) {
      return yield* Effect.fail(
        new Error(
          `Failed to read sitemap body at ${url}: response is too large`
        )
      );
    }

    if (isSitemapIndex(content)) {
      const childSitemaps = parseSitemapIndex(content);
      const childResults = yield* Effect.all(
        childSitemaps.map((childUrl) =>
          fetchSitemapUrlsRecursive(childUrl, options)
        ),
        { concurrency: 5 }
      );
      return childResults.flat();
    }
    return parseSitemap(content);
  });

export const fetchSitemapEffect = (
  url: string,
  options?: FetchOptions
): Effect.Effect<{ content: string; urls: SitemapUrl[] }, Error> =>
  Effect.gen(function* runFetchSitemap() {
    const doFetch = withTimeout(options?.fetch ?? fetch);
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
      try: () => doFetch(sitemapUrl),
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
      try: () => readTextCapped(response, HTML_MAX_BYTES),
    });

    if (content === null) {
      return yield* Effect.fail(
        new Error("Failed to read sitemap.xml body: response is too large")
      );
    }

    if (isSitemapIndex(content)) {
      const childSitemaps = parseSitemapIndex(content);
      const childResults = yield* Effect.all(
        childSitemaps.map((childUrl) =>
          fetchSitemapUrlsRecursive(childUrl, options)
        ),
        { concurrency: 5 }
      );
      return { content, urls: childResults.flat() };
    }
    const urls = parseSitemap(content);
    return { content, urls };
  });

export const fetchSitemap = async (
  url: string,
  options?: FetchOptions
): Promise<SitemapData> => {
  try {
    return await Effect.runPromise(fetchSitemapEffect(url, options));
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { error: msg };
  }
};
