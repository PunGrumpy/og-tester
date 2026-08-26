import { fetchOgTags, runScanSite } from "@og-tester/core";
import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { after } from "next/server";

import { normalizeDomain } from "@/lib/reports/domain";
import { REPORTS_TAG, reportTag, saveReport } from "@/lib/reports/store";

const activeScans = new Set<string>();
const cooldowns = new Map<string, number>();

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

    const ip = req.headers.get("x-forwarded-for") || "local";
    const now = Date.now();

    if (activeScans.has(ip)) {
      return Response.json(
        { error: "A scan is already in progress for your IP address." },
        { status: 429 }
      );
    }

    const lastTime = cooldowns.get(ip);
    if (lastTime && now - lastTime < 5000) {
      return Response.json(
        { error: "Please wait 5 seconds before starting a new scan." },
        { status: 429 }
      );
    }

    activeScans.add(ip);

    // Resolved out here so `after` below can name the report's own tag; the
    // stream's callback runs too late to hand anything back.
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
          // The entry page's tags come along for the ride: the report page
          // renders the social previews from them, and fetching them here
          // means one stored payload holds everything that page needs.
          const [report, og] = await Promise.all([
            runScanSite({
              concurrency: 5,
              maxUrls: 50,
              onProgress: sendEvent,
              siteUrl: parsedUrl,
            }),
            fetchOgTags(parsedUrl).catch(() => ({})),
          ]);

          // Persisted here rather than from the browser, so a completed report
          // is one the server actually produced.
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
          activeScans.delete(ip);
          cooldowns.set(ip, Date.now());
          controller.close();
        }
      },
    });

    // Clearing the tag has to happen where the request context still exists.
    // Calling it from inside the stream above silently does nothing — the
    // callback runs after the response is handed back, detached from the
    // store `revalidateTag` reads. `after` keeps that context and runs once
    // the response has finished, which is after the report is written.
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
