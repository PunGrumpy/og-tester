import { z } from "zod";
import { fetchOgTags } from "@og-tester/core";

export const schema = {
  url: z.string().url().describe("The URL to fetch and analyze OG/meta tags for"),
};

export default async function handler(args: { url: string }) {
  const data = await fetchOgTags(args.url);

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}
