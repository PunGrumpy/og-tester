import { parseOgTags } from "@og-tester/core";
import { withUnkey } from "@unkey/nextjs";
import type { NextRequestWithUnkeyContext } from "@unkey/nextjs";
import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { parseError } from "@/lib/error";
import { readTextCapped } from "@/lib/read-capped";
import { BlockedUrlError, safeFetch } from "@/lib/safe-fetch";

const HTML_MAX_BYTES = 2 * 1024 * 1024;

export const GET = withUnkey(
  async (request: NextRequestWithUnkeyContext) => {
    const { searchParams } = request.nextUrl;
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let response: Response;
    try {
      response = await safeFetch(url, {
        cache: "no-store",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; OGTester/1.0)",
        },
      });
    } catch (error) {
      if (error instanceof BlockedUrlError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      throw error;
    }

    if (!response.ok) {
      const message = parseError(response.statusText);
      return NextResponse.json({ error: message }, { status: response.status });
    }

    const html = await readTextCapped(response, HTML_MAX_BYTES);
    if (html === null) {
      return NextResponse.json(
        { error: "Response body is too large" },
        { status: 413 }
      );
    }
    const ogData = parseOgTags(html, url);

    return NextResponse.json(ogData);
  },
  {
    rootKey: env.UNKEY_ROOT_KEY,
    tags: ["og-tester"],
  }
);
