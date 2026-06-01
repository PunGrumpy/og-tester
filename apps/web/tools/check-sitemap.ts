import { fetchSitemap } from "@og-tester/core";
import { z } from "zod";

export const schema = {
  url: z
    .url()
    .describe("The URL of the site to fetch and parse sitemap.xml from"),
};

const handler = async (args: {
  url: string;
}): Promise<{
  content: {
    type: "text";
    text: string;
  }[];
}> => {
  const data = await fetchSitemap(args.url);

  return {
    content: [
      {
        text: data.error
          ? `Error: ${data.error}`
          : JSON.stringify(
              { urlCount: data.urls?.length ?? 0, urls: data.urls },
              null,
              2
            ),
        type: "text" as const,
      },
    ],
  };
};

export default handler;
