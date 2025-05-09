import { createEnv } from '@t3-oss/env-nextjs'
import { vercel } from '@t3-oss/env-nextjs/presets-zod'
import { z } from 'zod'

export const env = createEnv({
  extends: [vercel()],
  client: {},
  server: {
    BETTERSTACK_API_KEY: z.string().optional(),
    BETTERSTACK_URL: z.string().url().optional(),
    RYBBIT_ID: z.string().optional()
  },
  runtimeEnv: {
    BETTERSTACK_API_KEY: process.env.BETTERSTACK_API_KEY,
    BETTERSTACK_URL: process.env.BETTERSTACK_URL,
    RYBBIT_ID: process.env.RYBBIT_ID
  }
})
