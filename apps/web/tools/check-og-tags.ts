import { fetchOgTags } from "@og-tester/core";
import { z } from "zod";

export const schema = {
  url: z.url().describe("The URL to fetch and analyze OG/meta tags for"),
};

const handler = async (args: {
  url: string;
}): Promise<{
  content: {
    type: "text";
    text: string;
  }[];
}> => {
  const data = await fetchOgTags(args.url);

  return {
    content: [
      {
        text: JSON.stringify(data, null, 2),
        type: "text" as const,
      },
    ],
  };
};

export default handler;
