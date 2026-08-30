/**
 * Streams a fetch Response body while enforcing a byte ceiling, so a target
 * that streams gigabytes of data cannot drive the function OOM. Aborts the
 * read (and cancels the underlying stream) as soon as the running total
 * crosses `maxBytes`, rather than buffering the whole body first.
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
