import { NextResponse } from "next/server";

import { normalizeDomain } from "@/lib/reports/domain";
import { safeFetch } from "@/lib/safe-fetch";

const MAX_BYTES = 100 * 1024;

const HIT_CACHE = "public, max-age=86400, s-maxage=604800";
const MISS_CACHE = "public, max-age=3600";

const ALLOWED_TYPES = new Set([
  "image/avif",
  "image/bmp",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/vnd.microsoft.icon",
  "image/webp",
  "image/x-icon",
]);

const SAFETY_HEADERS = {
  "content-security-policy": "default-src 'none'; sandbox",
  "x-content-type-options": "nosniff",
};

const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 18 18" fill="none" stroke="#8a8a8a"><circle cx="8" cy="8" r="5.5"/><path d="M2.5 8h11M8 2.5c1.5 1.5 2.25 3.33 2.25 5.5S9.5 12 8 13.5C6.5 12 5.75 10.17 5.75 8S6.5 4 8 2.5Z"/></svg>`;

const fallback = () =>
  new NextResponse(FALLBACK_SVG, {
    headers: {
      ...SAFETY_HEADERS,
      "cache-control": MISS_CACHE,
      "content-type": "image/svg+xml; charset=utf-8",
    },
  });

export const GET = async (request: Request) => {
  const raw = new URL(request.url).searchParams.get("host");
  const host = raw ? normalizeDomain(raw) : null;
  if (!host) {
    return new NextResponse(null, { status: 400 });
  }

  try {
    const response = await safeFetch(`https://${host}/favicon.ico`, {
      headers: { accept: "image/*" },
    });
    const type = (response.headers.get("content-type") ?? "")
      .split(";")[0]
      .trim()
      .toLowerCase();

    if (!(response.ok && ALLOWED_TYPES.has(type))) {
      return fallback();
    }

    const body = await response.arrayBuffer();
    if (body.byteLength === 0 || body.byteLength > MAX_BYTES) {
      return fallback();
    }

    return new NextResponse(body, {
      headers: {
        ...SAFETY_HEADERS,
        "cache-control": HIT_CACHE,
        "content-type": type,
      },
    });
  } catch {
    return fallback();
  }
};
