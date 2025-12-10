import { z } from 'zod'

export const faviconSchema = z.object({
  rel: z.string(),
  href: z.string(),
  type: z.string().optional(),
  sizes: z.string().optional()
})

export type FaviconData = z.infer<typeof faviconSchema>

export const ogSchema = z
  .object({
    // Basic meta tags
    title: z.string().optional(),
    description: z.string().optional(),
    author: z.string().optional(),
    viewport: z.string().optional(),
    canonical: z.string().optional(),
    robots: z.string().optional(),
    applicationName: z.string().optional(),
    keywords: z.string().optional(),
    generator: z.string().optional(),
    license: z.string().optional(),
    colorScheme: z.string().optional(),
    themeColor: z.string().optional(),
    themeColorLight: z.string().optional(),
    themeColorDark: z.string().optional(),
    formatDetection: z.string().optional(),

    // Open Graph
    'og:title': z.string().optional(),
    'og:description': z.string().optional(),
    'og:image': z.string().optional(),
    'og:image:width': z.string().optional(),
    'og:image:height': z.string().optional(),
    'og:image:type': z.string().optional(),
    'og:url': z.string().optional(),
    'og:type': z.string().optional(),
    'og:site_name': z.string().optional(),
    'og:locale': z.string().optional(),

    // Twitter Card
    'twitter:card': z.string().optional(),
    'twitter:title': z.string().optional(),
    'twitter:description': z.string().optional(),
    'twitter:image': z.string().optional(),
    'twitter:site': z.string().optional(),
    'twitter:creator': z.string().optional(),

    // Icons
    favicons: z.array(faviconSchema).optional(),

    // Raw data
    rawHead: z.string().optional()
  })
  .loose()

export type OgData = z.infer<typeof ogSchema>

export const imageInfoSchema = z.object({
  url: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  size: z.number().optional(),
  type: z.string().optional()
})

export type ImageInfo = z.infer<typeof imageInfoSchema>
