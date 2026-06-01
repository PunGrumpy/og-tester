import { fetchRobotsTxt } from "@og-tester/core";
import { z } from "zod";

export const schema = {
  url: z.url().describe("The URL of the site to fetch robots.txt from"),
};

const handler = async (args: {
  url: string;
}): Promise<{
  content: {
    type: "text";
    text: string;
  }[];
}> => {
  const data = await fetchRobotsTxt(args.url);

  return {
    content: [
      {
        text: data.error
          ? `Error: ${data.error}`
          : (data.content ?? "Empty robots.txt"),
        type: "text" as const,
      },
    ],
  };
};

export default handler;
