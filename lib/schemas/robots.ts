import { z } from 'zod'

export const robotsSchema = z.object({
  content: z.string().optional(),
  error: z.string().optional()
})

export type RobotsData = z.infer<typeof robotsSchema>
