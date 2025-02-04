import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    BETTERSTACK_API_KEY: z.string().optional(),
    BETTERSTACK_URL: z.string().url().optional(),

    // Added by Vercel
    VERCEL_PROJECT_PRODUCTION_URL: z.string().min(1)
  },
  runtimeEnv: {
    BETTERSTACK_API_KEY: process.env.BETTERSTACK_API_KEY,
    BETTERSTACK_URL: process.env.BETTERSTACK_URL,
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL
  }
})
