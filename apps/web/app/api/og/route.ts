import { parseOgTags } from "@og-tester/core";
import { withUnkey } from "@unkey/nextjs";
import type { NextRequestWithUnkeyContext } from "@unkey/nextjs";
import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { parseError } from "@/lib/error";
import { BlockedUrlError, safeFetch } from "@/lib/safe-fetch";

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
      // A refused target is the caller's input being rejected, not a server
      // fault, so it answers 400 rather than surfacing as an unhandled 500.
      if (error instanceof BlockedUrlError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      throw error;
    }

    if (!response.ok) {
      const message = parseError(response.statusText);
      return NextResponse.json({ error: message }, { status: response.status });
    }

    const html = await response.text();
    const ogData = parseOgTags(html, url);

    return NextResponse.json(ogData);
  },
  {
    rootKey: env.UNKEY_ROOT_KEY,
    tags: ["og-tester"],
  }
);
