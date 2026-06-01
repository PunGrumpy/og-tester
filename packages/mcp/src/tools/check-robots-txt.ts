import { z } from "zod";
import { fetchRobotsTxt } from "@og-tester/core";

export const schema = {
  url: z.string().url().describe("The URL of the site to fetch robots.txt from"),
};

export default async function handler(args: { url: string }): Promise<{
  content: Array<{
    type: "text";
    text: string;
  }>;
}> {
  const data = await fetchRobotsTxt(args.url);

  return {
    content: [
      {
        type: "text" as const,
        text: data.error ? `Error: ${data.error}` : data.content ?? "Empty robots.txt",
      },
    ],
  };
}
