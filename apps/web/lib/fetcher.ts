import { createFetch, createSchema } from "@better-fetch/fetch";
import { z } from "zod";

import { env } from "./env";
import { ogSchema } from "./schemas/og";
import { robotsSchema } from "./schemas/robots";
import { sitemapSchema } from "./schemas/sitemap";

const schema = createSchema({
  "/api/og": {
    method: "get",
    output: ogSchema,
    query: z.object({
      url: z.url(),
    }),
  },
  "/api/robots": {
    method: "get",
    output: robotsSchema,
    query: z.object({
      url: z.url(),
    }),
  },
  "/api/sitemap": {
    method: "get",
    output: sitemapSchema,
    query: z.object({
      url: z.url(),
    }),
  },
});

const baseURL = env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const fetcher = createFetch({
  baseURL,
  retry: {
    attempts: 2,
    delay: 500,
    type: "linear",
  },
  schema,
});
