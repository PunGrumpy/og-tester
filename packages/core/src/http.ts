import type { FetchLike } from "./fetch-like";

/** Default budget for a single outbound request, shared by every core fetcher. */
export const DEFAULT_TIMEOUT_MS = 10_000;

/** Cap for HTML/text bodies (og tags, robots.txt, sitemap.xml, crawled pages). */
export const HTML_MAX_BYTES = 2 * 1024 * 1024;

/** Cap for image bodies read while scoring og:image. */
export const IMAGE_MAX_BYTES = 256 * 1024;

/**
 * Wraps a fetch-like function so every call is bound to `timeoutMs`. Merges
 * the timeout with any signal the caller already supplied, rather than
 * replacing it, so callers that pass their own `AbortSignal` keep it in
 * effect alongside the default budget.
 */
export const withTimeout =
  (doFetch: FetchLike, timeoutMs: number = DEFAULT_TIMEOUT_MS): FetchLike =>
  (url, init) => {
    const timeoutSignal = AbortSignal.timeout(timeoutMs);
    const signal = init?.signal
      ? AbortSignal.any([init.signal, timeoutSignal])
      : timeoutSignal;
    return doFetch(url, { ...init, signal });
  };

/**
 * Streams a fetch Response body while enforcing a byte ceiling, so a target
 * that never stops sending data cannot exhaust memory. Cancels the
 * underlying stream and returns `null` as soon as the running total crosses
 * `maxBytes`, instead of buffering the whole body first.
 */
const readCapped = async (
  response: Response,
  maxBytes: number
): Promise<Uint8Array | null> => {
  const contentLength = response.headers.get("content-length");
  if (contentLength && Number(contentLength) > maxBytes) {
    return null;
  }

  const { body } = response;
  if (!body) {
    const buffer = new Uint8Array(await response.arrayBuffer());
    return buffer.byteLength > maxBytes ? null : buffer;
  }

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  for (;;) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- chunks are read sequentially
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    total += value.byteLength;
    if (total > maxBytes) {
      // oxlint-disable-next-line eslint/no-await-in-loop -- cleanup before returning
      await reader.cancel();
      return null;
    }

    chunks.push(value);
  }

  const combined = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return combined;
};

export const readTextCapped = async (
  response: Response,
  maxBytes: number
): Promise<string | null> => {
  const bytes = await readCapped(response, maxBytes);
  return bytes ? new TextDecoder().decode(bytes) : null;
};

export const readBytesCapped = async (
  response: Response,
  maxBytes: number
): Promise<ArrayBuffer | null> => {
  const bytes = await readCapped(response, maxBytes);
  return bytes ? new Uint8Array(bytes).buffer : null;
};
