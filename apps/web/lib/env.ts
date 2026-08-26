import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets-zod";
import { z } from "zod";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_DATABUDDY_CLIENT_ID: z.string(),
  },
  extends: [vercel()],
  runtimeEnv: {
    NEXT_PUBLIC_DATABUDDY_CLIENT_ID:
      process.env.NEXT_PUBLIC_DATABUDDY_CLIENT_ID,
    UNKEY_API_KEY: process.env.UNKEY_API_KEY,
    UNKEY_ROOT_KEY: process.env.UNKEY_ROOT_KEY,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  },
  server: {
    UNKEY_API_KEY: z.string(),
    UNKEY_ROOT_KEY: z.string().startsWith("unkey_"),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
    UPSTASH_REDIS_REST_URL: z.url().optional(),
  },
});
