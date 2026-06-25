import { runScanSite } from "@og-tester/core";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

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

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: unknown) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
        };

        try {
          const report = await runScanSite({
            concurrency: 5,
            maxUrls: 50,
            onProgress: sendEvent,
            siteUrl: parsedUrl,
          });
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
