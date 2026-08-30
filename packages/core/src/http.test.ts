import { describe, expect, it } from "bun:test";

import { readBytesCapped, readTextCapped } from "./http";

const CAP = 16;

/** A Response whose body streams `sizes` chunks of that many bytes each. */
const streamedResponse = (chunkSizes: number[]): Response => {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const size of chunkSizes) {
        controller.enqueue(new Uint8Array(size).fill(97));
      }
      controller.close();
    },
  });
  return new Response(stream);
};

describe("readTextCapped", () => {
  it("returns null and does not return the full body when the stream exceeds the cap", async () => {
    // 3 chunks of 10 bytes = 30 bytes, well past CAP=16.
    const response = streamedResponse([10, 10, 10]);
    const result = await readTextCapped(response, CAP);
    expect(result).toBeNull();
  });

  it("returns the full content when the stream is under the cap", async () => {
    const response = streamedResponse([4, 4]);
    const result = await readTextCapped(response, CAP);
    expect(result).toBe("a".repeat(8));
  });

  it("returns null via the content-length fast path without reading the stream", async () => {
    const response = new Response("irrelevant body", {
      headers: { "content-length": "1000" },
    });
    const result = await readTextCapped(response, CAP);
    expect(result).toBeNull();
  });
});

describe("readBytesCapped", () => {
  it("returns null when the stream exceeds the cap", async () => {
    const response = streamedResponse([10, 10, 10]);
    const result = await readBytesCapped(response, CAP);
    expect(result).toBeNull();
  });

  it("returns the full buffer when the stream is under the cap", async () => {
    const response = streamedResponse([4, 4]);
    const result = await readBytesCapped(response, CAP);
    expect(result).not.toBeNull();
    expect(result?.byteLength).toBe(8);
  });
});
