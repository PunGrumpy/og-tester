import { fetchOgTags, runScanSite } from "@og-tester/core";
import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { after } from "next/server";

import { checkScanRateLimit, getClientIp } from "@/lib/rate-limit";
import { normalizeDomain } from "@/lib/reports/domain";
import { REPORTS_TAG, reportTag, saveReport } from "@/lib/reports/store";
import { safeFetch } from "@/lib/safe-fetch";

export const POST = async (req: NextRequest) => {
  try {
    const { url } = (await req.json()) as { url?: string };
    if (!url) {
      return Response.json({ error: "URL is required" }, { status: 400 });
    }

    let parsedUrl = url;
    if (!/^https?:\/\//iu.test(url)) {
      parsedUrl = `https://${url}`;
    }

    const clientIp = getClientIp(req.headers.get("x-forwarded-for"));
    const rateLimit = await checkScanRateLimit(clientIp);

    if (!rateLimit.ok) {
      if (rateLimit.reason === "in-progress") {
        return Response.json(
          { error: "A scan is already in progress for your IP address." },
          { status: 429 }
        );
      }
      return Response.json(
        { error: "Please wait 5 seconds before starting a new scan." },
        { status: 429 }
      );
    }

    const { release } = rateLimit;

    const domain = normalizeDomain(parsedUrl);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: unknown) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
        };

        try {
          const [report, og] = await Promise.all([
            runScanSite({
              concurrency: 5,
              fetch: safeFetch,
              maxUrls: 50,
              onProgress: sendEvent,
              siteUrl: parsedUrl,
            }),
            fetchOgTags(parsedUrl, { fetch: safeFetch }).catch(() => ({})),
          ]);

          if (domain) {
            await saveReport({
              domain,
              og,
              report,
              scannedAt: report.scannedAt,
              siteUrl: parsedUrl,
            });
          }

          sendEvent({ report, type: "complete" });
        } catch (error) {
          sendEvent({
            error: error instanceof Error ? error.message : String(error),
            type: "error",
          });
        } finally {
          await release();
          controller.close();
        }
      },
    });

    after(() => {
      revalidateTag(REPORTS_TAG, { expire: 0 });
      if (domain) {
        revalidateTag(reportTag(domain), { expire: 0 });
      }
    });

    return new Response(stream, {
      headers: {
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Content-Type": "text/event-stream",
      },
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
};
