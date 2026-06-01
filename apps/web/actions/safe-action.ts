import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE
} from 'next-safe-action'
import { z } from 'zod'
import { parseError } from '@/lib/error'

export const actionClient = createSafeActionClient({
  handleServerError(error) {
    const message = parseError(error.message) || DEFAULT_SERVER_ERROR_MESSAGE
    return message
  }
})

export const actionClientWithMeta = createSafeActionClient({
  defineMetadataSchema() {
    return z.object({
      name: z.string(),
      track: z
        .object({
          event: z.string(),
          channel: z.string()
        })
        .optional()
    })
  },
  handleServerError(error) {
    const message = parseError(error.message) || DEFAULT_SERVER_ERROR_MESSAGE
    return message
  }
})
