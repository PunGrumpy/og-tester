/**
 * A fetch-compatible function signature that every core fetcher accepts as an
 * injectable dependency. Defaults to the global `fetch` everywhere, so the
 * CLI (which legitimately talks to localhost during development) is
 * unaffected. Callers that need to guard outbound requests — e.g. the web
 * app's SSRF-safe fetch — pass their own implementation through.
 */
export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

export interface FetchOptions {
  fetch?: FetchLike;
}
