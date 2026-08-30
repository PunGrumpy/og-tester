import { withUnkey } from "@unkey/nextjs";
import type { NextRequestWithUnkeyContext } from "@unkey/nextjs";
import { NextResponse } from "next/server";

import { env } from "@/lib/env";
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
      response = await safeFetch(`${url}/robots.txt`, {
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
      return NextResponse.json(
        { error: "Failed to fetch robots.txt" },
        { status: 500 }
      );
    }

    const data = await readTextCapped(response, HTML_MAX_BYTES);
    if (data === null) {
      return NextResponse.json(
        { error: "robots.txt is too large" },
        { status: 413 }
      );
    }

    return NextResponse.json({ content: data });
  },
  {
    rootKey: env.UNKEY_ROOT_KEY,
    tags: ["og-tester", "robots"],
  }
);
