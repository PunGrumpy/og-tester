import { createFetch, createSchema } from '@better-fetch/fetch'
import { z } from 'zod'
import { env } from './env'
import { ogSchema } from './schema'

const schema = createSchema({
  '/api/og': {
    method: 'get',
    query: z.object({
      url: z.url()
    }),
    output: ogSchema
  }
})

const baseURL = env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'http://localhost:3000'

export const fetcher = createFetch({
  baseURL,
  retry: {
    attempts: 2,
    delay: 500,
    type: 'linear'
  },
  schema
})
