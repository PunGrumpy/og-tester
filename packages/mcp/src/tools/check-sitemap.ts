import { z } from "zod";
import { fetchSitemap } from "@og-tester/core";

export const schema = {
  url: z.string().url().describe("The URL of the site to fetch and parse sitemap.xml from"),
};

export default async function handler(args: { url: string }) {
  const data = await fetchSitemap(args.url);

  return {
    content: [
      {
        type: "text" as const,
        text: data.error
          ? `Error: ${data.error}`
          : JSON.stringify({ urlCount: data.urls?.length ?? 0, urls: data.urls }, null, 2),
      },
    ],
  };
}
