import * as Effect from "effect/Effect";

import { parseOgTags } from "../parsers/og";
import type { OgData } from "../schemas/og";

const USER_AGENT = "OGTester/1.0 (+https://github.com/PunGrumpy/og-tester)";

export const fetchOgTagsEffect = (url: string): Effect.Effect<OgData, Error> =>
  Effect.gen(function* runFetchOg() {
    const response = yield* Effect.tryPromise({
      catch: (e) =>
        new Error(
          `Failed to fetch ${url}: ${e instanceof Error ? e.message : String(e)}`
        ),
      try: () => fetch(url, { headers: { "User-Agent": USER_AGENT } }),
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
      try: () => response.text(),
    });

    return parseOgTags(html, url);
  });

export const fetchOgTags = (url: string): Promise<OgData> =>
  Effect.runPromise(fetchOgTagsEffect(url));
