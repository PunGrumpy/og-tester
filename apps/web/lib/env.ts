import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets-zod";
import { z } from "zod";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_APPWRITE_ENDPOINT: z.url(),
    NEXT_PUBLIC_APPWRITE_PROJECT_ID: z.string(),
    NEXT_PUBLIC_DATABUDDY_CLIENT_ID: z.string(),
  },
  extends: [vercel()],
  runtimeEnv: {
    BETTERSTACK_API_KEY: process.env.BETTERSTACK_API_KEY,
    BETTERSTACK_URL: process.env.BETTERSTACK_URL,
    NEXT_PUBLIC_APPWRITE_ENDPOINT: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
    NEXT_PUBLIC_APPWRITE_PROJECT_ID:
      process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
    NEXT_PUBLIC_DATABUDDY_CLIENT_ID:
      process.env.NEXT_PUBLIC_DATABUDDY_CLIENT_ID,
    UNKEY_API_KEY: process.env.UNKEY_API_KEY,
    UNKEY_ROOT_KEY: process.env.UNKEY_ROOT_KEY,
  },
  server: {
    BETTERSTACK_API_KEY: z.string().optional(),
    BETTERSTACK_URL: z.url().optional(),
    UNKEY_API_KEY: z.string(),
    UNKEY_ROOT_KEY: z.string().startsWith("unkey_"),
  },
});
