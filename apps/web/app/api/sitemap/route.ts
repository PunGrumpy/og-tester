import { parseSitemap } from "@og-tester/core";
import { withUnkey } from "@unkey/nextjs";
import type { NextRequestWithUnkeyContext } from "@unkey/nextjs";
import { NextResponse } from "next/server";

import { env } from "@/lib/env";
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
      response = await safeFetch(`${url}/sitemap.xml`, {
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
        { error: "Failed to fetch sitemap.xml" },
        { status: 500 }
      );
    }

    const data = await response.text();
    const urls = parseSitemap(data);

    return NextResponse.json({ content: data, urls });
  },
  {
    rootKey: env.UNKEY_ROOT_KEY,
    tags: ["og-tester", "robots"],
  }
);
