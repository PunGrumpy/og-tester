import * as Effect from "effect/Effect";

import type { RobotsData } from "../schemas/robots";

export const fetchRobotsTxtEffect = (
  url: string
): Effect.Effect<RobotsData, Error> =>
  Effect.gen(function* runFetchRobots() {
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
      try: () => fetch(robotsUrl),
    });

    if (!response.ok) {
      return { error: `Failed to fetch robots.txt: ${response.status}` };
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

export const fetchRobotsTxt = async (url: string): Promise<RobotsData> => {
  try {
    return await Effect.runPromise(fetchRobotsTxtEffect(url));
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { error: msg };
  }
};
