import * as Effect from "effect/Effect";

import type { FetchOptions } from "../fetch-like";
import { HTML_MAX_BYTES, readTextCapped, withTimeout } from "../http";
import { parseOgTags } from "../parsers/og";
import type { OgData } from "../schemas/og";

const USER_AGENT = "OGTester/1.0 (+https://github.com/PunGrumpy/og-tester)";

export const fetchOgTagsEffect = (
  url: string,
  options?: FetchOptions
): Effect.Effect<OgData, Error> =>
  Effect.gen(function* runFetchOg() {
    const doFetch = withTimeout(options?.fetch ?? fetch);
    const response = yield* Effect.tryPromise({
      catch: (e) =>
        new Error(
          `Failed to fetch ${url}: ${e instanceof Error ? e.message : String(e)}`
        ),
      try: () => doFetch(url, { headers: { "User-Agent": USER_AGENT } }),
    });

    if (!response.ok) {
      return yield* Effect.fail(
        new Error(
          `Failed to fetch ${url}: ${response.status} ${response.statusText}`
        )
      );
    }

    const html = yield* Effect.tryPromise({
      catch: (e) =>
        new Error(
          `Failed to read response body: ${e instanceof Error ? e.message : String(e)}`
        ),
      try: () => readTextCapped(response, HTML_MAX_BYTES),
    });

    if (html === null) {
      return yield* Effect.fail(
        new Error(`Failed to fetch ${url}: response body is too large`)
      );
    }

    return parseOgTags(html, url);
  });

export const fetchOgTags = (
  url: string,
  options?: FetchOptions
): Promise<OgData> => Effect.runPromise(fetchOgTagsEffect(url, options));
