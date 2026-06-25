/* eslint-disable no-bitwise, complexity */
import * as Effect from "effect/Effect";

export interface ImageMeta {
  width?: number;
  height?: number;
  type?: string;
  size?: number;
}

export const parseImageMeta = (buffer: Uint8Array): ImageMeta => {
  // Check PNG signature: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer.length >= 24
  ) {
    const view = new DataView(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength
    );
    const width = view.getUint32(16, false);
    const height = view.getUint32(20, false);
    return { height, type: "png", width };
  }

  // Check JPEG signature: FF D8
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    const view = new DataView(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength
    );
    while (offset < buffer.length - 8) {
      const marker = view.getUint16(offset, false);
      offset += 2;

      // Start of scan or end of image
      if (marker === 0xff_d9 || marker === 0xff_da) {
        break;
      }

      const length = view.getUint16(offset, false);
      if (
        marker >= 0xff_c0 &&
        marker <= 0xff_c3 &&
        offset + 7 < buffer.length
      ) {
        const height = view.getUint16(offset + 3, false);
        const width = view.getUint16(offset + 5, false);
        return { height, type: "jpeg", width };
      }
      offset += length;
    }
  }

  // Check WebP signature: RIFF ... WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    const view = new DataView(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength
    );
    const type = String.fromCodePoint(
      buffer[12],
      buffer[13],
      buffer[14],
      buffer[15]
    );
    if (type === "VP8 " && buffer.length >= 30) {
      const width = view.getUint16(26, true) & 0x3f_ff;
      const height = view.getUint16(28, true) & 0x3f_ff;
      return { height, type: "webp", width };
    }
    if (type === "VP8L" && buffer.length >= 25) {
      const [b21, b22, b23, b24] = buffer.subarray(21, 25);
      const width = 1 + (b21 | ((b22 & 0x3f) << 8));
      const height =
        1 + (((b22 & 0xc0) >> 6) | (b23 << 2) | ((b24 & 0x0f) << 10));
      return { height, type: "webp", width };
    }
    if (type === "VP8X" && buffer.length >= 30) {
      const width = 1 + (buffer[24] | (buffer[25] << 8) | (buffer[26] << 16));
      const height = 1 + (buffer[27] | (buffer[28] << 8) | (buffer[29] << 16));
      return { height, type: "webp", width };
    }
  }

  return {};
};

const parseResponseMeta = (res: Response): Effect.Effect<ImageMeta, Error> =>
  Effect.gen(function* parseResponseMetaGen() {
    const sizeHeader = res.headers.get("Content-Length");
    const contentRange = res.headers.get("Content-Range");
    let size: number | undefined;
    if (contentRange) {
      const match = contentRange.match(/\/(\d+)$/u);
      if (match) {
        size = Number.parseInt(match[1], 10);
      }
    }
    if (!size && sizeHeader) {
      size = Number.parseInt(sizeHeader, 10);
    }

    const contentType = res.headers.get("Content-Type") || undefined;
    const arrayBuffer = yield* Effect.tryPromise({
      catch: (e) =>
        new Error(
          `Failed to read image body: ${e instanceof Error ? e.message : String(e)}`
        ),
      try: () => res.arrayBuffer(),
    });
    const meta = parseImageMeta(new Uint8Array(arrayBuffer));
    return { ...meta, size, type: meta.type || contentType };
  });

export const checkImageMeta = (
  imageUrl: string
): Effect.Effect<ImageMeta, Error> =>
  Effect.gen(function* checkImageMetaGen() {
    const response = yield* Effect.tryPromise({
      catch: (e) =>
        new Error(
          `Failed to fetch image: ${e instanceof Error ? e.message : String(e)}`
        ),
      try: () =>
        fetch(imageUrl, {
          // Fetch first 128KB
          headers: {
            Range: "bytes=0-131072",
          },
        }),
    });

    if (!response.ok && response.status !== 206) {
      const fallbackResponse = yield* Effect.tryPromise({
        catch: (e) =>
          new Error(
            `Failed fallback fetch image: ${e instanceof Error ? e.message : String(e)}`
          ),
        try: () => fetch(imageUrl),
      });
      if (!fallbackResponse.ok) {
        return yield* Effect.fail(
          new Error(`Failed to fetch image: Status ${fallbackResponse.status}`)
        );
      }
      return yield* parseResponseMeta(fallbackResponse);
    }

    return yield* parseResponseMeta(response);
  });
