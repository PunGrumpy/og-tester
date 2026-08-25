import { NextResponse } from "next/server";

import { normalizeDomain } from "@/lib/reports/domain";
import { safeFetch } from "@/lib/safe-fetch";

/** Larger than any favicon worth showing at 18px, so it is not worth proxying. */
const MAX_BYTES = 100 * 1024;

/** A hit is cached for a week, a miss for an hour so a new icon shows up. */
const HIT_CACHE = "public, max-age=86400, s-maxage=604800";
const MISS_CACHE = "public, max-age=3600";

/**
 * Raster only, and deliberately not `image/*`.
 *
 * SVG is a document: it can carry script, and this route serves whatever it
 * fetches from our own origin. Passing a third party's SVG through would mean
 * `/api/favicon?host=attacker.example` renders their markup as us, so a reader
 * who follows that link runs their script with our origin's privileges. An
 * `<img>` would not execute it, but a direct navigation would.
 *
 * A site that only publishes an SVG icon therefore gets the globe. That is the
 * cheap half of the trade.
 */
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

/**
 * `nosniff` so a mislabelled body cannot be re-read as HTML, and a CSP that
 * denies everything so even the SVG we author ourselves is inert if someone
 * navigates straight to it.
 */
const SAFETY_HEADERS = {
  "content-security-policy": "default-src 'none'; sandbox",
  "x-content-type-options": "nosniff",
};

/**
 * The stand-in for a site with no icon, served from here rather than drawn
 * behind the image in the page. A failed `<img>` is not a transparent one:
 * the browser paints its own broken-image placeholder over whatever sits
 * underneath, so a fallback only works if the request succeeds.
 *
 * The viewBox is inset by a unit so the globe lands at the same 16px as a real
 * favicon inside the 18px frame, and the grey is picked to read on both a
 * white and a black background — an SVG loaded through `<img>` cannot see the
 * page's theme.
 */
const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 18 18" fill="none" stroke="#8a8a8a"><circle cx="8" cy="8" r="5.5"/><path d="M2.5 8h11M8 2.5c1.5 1.5 2.25 3.33 2.25 5.5S9.5 12 8 13.5C6.5 12 5.75 10.17 5.75 8S6.5 4 8 2.5Z"/></svg>`;

const fallback = () =>
  new NextResponse(FALLBACK_SVG, {
    headers: {
      ...SAFETY_HEADERS,
      "cache-control": MISS_CACHE,
      "content-type": "image/svg+xml; charset=utf-8",
    },
  });

/**
 * The site's own icon, fetched server-side so a list of domains does not hand
 * every reader's browser off to fourteen third parties.
 *
 * The caller picks only the host, never a URL: the path is always
 * `/favicon.ico`, so this cannot be pointed at anything else. `safeFetch`
 * refuses private and reserved addresses on every redirect hop on top of that.
 *
 * A site without one gets the globe instead, so the answer is always an image
 * and a row never shows a browser's broken-image placeholder.
 */
export const GET = async (request: Request) => {
  const raw = new URL(request.url).searchParams.get("host");
  const host = raw ? normalizeDomain(raw) : null;
  // Nothing our own pages ask for — a malformed host is a bad request rather
  // than a site that happens to have no icon.
  if (!host) {
    return new NextResponse(null, { status: 400 });
  }

  try {
    const response = await safeFetch(`https://${host}/favicon.ico`, {
      headers: { accept: "image/*" },
    });
    // Only the media type, so `image/png; charset=binary` still matches.
    const type = (response.headers.get("content-type") ?? "")
      .split(";")[0]
      .trim()
      .toLowerCase();

    // A 404 page served with a 200 is common; it is HTML, not an icon.
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
    // An unreachable site is a missing icon, not a fault on our side.
    return fallback();
  }
};
