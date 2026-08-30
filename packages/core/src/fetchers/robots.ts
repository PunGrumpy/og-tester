import * as Effect from "effect/Effect";

import type { FetchOptions } from "../fetch-like";
import type { RobotsData } from "../schemas/robots";

export const fetchRobotsTxtEffect = (
  url: string,
  options?: FetchOptions
): Effect.Effect<{ content: string }, Error> =>
  Effect.gen(function* runFetchRobots() {
    const doFetch = options?.fetch ?? fetch;
    const parsedUrl = yield* Effect.try({
      catch: (e) =>
        new Error(`Invalid URL: ${e instanceof Error ? e.message : String(e)}`),
      try: () => new URL(url),
    });
    const robotsUrl = `${parsedUrl.origin}/robots.txt`;

    const response = yield* Effect.tryPromise({
      catch: (e) =>
        new Error(
          `Failed to fetch robots.txt: ${e instanceof Error ? e.message : String(e)}`
        ),
      try: () => doFetch(robotsUrl),
    });

    if (!response.ok) {
      return yield* Effect.fail(
        new Error(`Failed to fetch robots.txt: ${response.status}`)
      );
    }

    const content = yield* Effect.tryPromise({
      catch: (e) =>
        new Error(
          `Failed to read robots.txt body: ${e instanceof Error ? e.message : String(e)}`
        ),
      try: () => response.text(),
    });

    return { content };
  });

export const fetchRobotsTxt = async (
  url: string,
  options?: FetchOptions
): Promise<RobotsData> => {
  try {
    return await Effect.runPromise(fetchRobotsTxtEffect(url, options));
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { error: msg };
  }
};
