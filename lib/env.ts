import { createEnv } from '@t3-oss/env-nextjs'
import { vercel } from '@t3-oss/env-nextjs/presets-zod'
import { z } from 'zod'

export const env = createEnv({
  extends: [vercel()],
  client: {
    NEXT_PUBLIC_DATABUDDY_CLIENT_ID: z.string()
  },
  server: {
    BETTERSTACK_API_KEY: z.string().optional(),
    BETTERSTACK_URL: z.url().optional()
  },
  runtimeEnv: {
    NEXT_PUBLIC_DATABUDDY_CLIENT_ID:
      process.env.NEXT_PUBLIC_DATABUDDY_CLIENT_ID,
    BETTERSTACK_API_KEY: process.env.BETTERSTACK_API_KEY,
    BETTERSTACK_URL: process.env.BETTERSTACK_URL
  }
})
