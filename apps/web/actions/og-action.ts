'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { env } from '@/lib/env'
import { fetcher } from '@/lib/fetcher'
import { ogSchema } from '@/lib/schemas/og'
import { actionClientWithMeta } from './safe-action'

export const ogAction = actionClientWithMeta
  .metadata({
    name: 'og-tester'
  })
  .inputSchema(
    z.object({
      url: z.url()
    })
  )
  .outputSchema(ogSchema)
  .action(async ({ parsedInput: { url } }) => {
    const { data } = await fetcher('/api/og', {
      query: {
        url
      },
      credentials: 'include',
      auth: {
        type: 'Bearer',
        token: env.UNKEY_API_KEY
      }
    })

    if (!data) {
      throw new Error('Failed to fetch OG tags')
    }

    revalidatePath('/')

    return data
  })
