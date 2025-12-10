import { z } from 'zod'

export const ogSchema = z
  .object({
    'twitter:image': z.string().optional(),
    'twitter:card': z.string().optional(),
    'twitter:title': z.string().optional(),
    'twitter:description': z.string().optional(),
    'twitter:site': z.string().optional(),
    'twitter:creator': z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    'og:image': z.string().optional(),
    'og:site_name': z.string().optional(),
    'og:title': z.string().optional(),
    'og:description': z.string().optional(),
    'og:url': z.string().optional(),
    'og:type': z.string().optional(),
    'og:locale': z.string().optional()
  })
  .loose()

export type OgTags = z.infer<typeof ogSchema>
