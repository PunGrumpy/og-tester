import * as Effect from "effect/Effect";

import { parseSitemap } from "../parsers/sitemap";
import type { SitemapData, SitemapUrl } from "../schemas/sitemap";

export const fetchSitemapEffect = (
  url: string
): Effect.Effect<{ content: string; urls: SitemapUrl[] }, Error> =>
  Effect.gen(function* runFetchSitemap() {
    const parsedUrl = yield* Effect.try({
      catch: (e) =>
        new Error(`Invalid URL: ${e instanceof Error ? e.message : String(e)}`),
      try: () => new URL(url),
    });
    const sitemapUrl = `${parsedUrl.origin}/sitemap.xml`;

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
