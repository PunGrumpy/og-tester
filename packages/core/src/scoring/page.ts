import * as Effect from "effect/Effect";

import type { FetchOptions } from "../fetch-like";
import type { OgData } from "../schemas/og";
import { scoreOgTags } from "./engine";
import type { PageScoreResult } from "./engine";
import { checkImageMeta } from "./image";
import type { ImageMeta } from "./image";

/**
 * Score parsed tags with the og:image fetched first, so the image rules judge
 * real bytes. Callers that skip that step see those rules fail on pages whose
 * og:image is perfectly fine.
 */
export const scorePage = (
  data: OgData,
  pageUrl?: string,
  options?: FetchOptions
): Effect.Effect<PageScoreResult> =>
  Effect.gen(function* scorePageGen() {
    let imageMeta: ImageMeta | null = null;
    const imageUrl = data["og:image"];
    if (imageUrl) {
      const result = yield* checkImageMeta(imageUrl, options).pipe(
        Effect.result
      );
      if (result._tag === "Success") {
        imageMeta = result.success;
      }
    }

    return yield* scoreOgTags(data, { imageMeta, pageUrl });
  });

export const runScorePage = (
  data: OgData,
  pageUrl?: string,
  options?: FetchOptions
): Promise<PageScoreResult> =>
  Effect.runPromise(scorePage(data, pageUrl, options));
