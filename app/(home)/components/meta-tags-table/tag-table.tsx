'use client'

import { ExternalLink } from 'lucide-react'
import Image from 'next/image'
import type { ReactElement } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import type { OgData } from '@/lib/schemas/og'

type TagTableProps = {
  data: OgData | null
  category: MetaCategory
  isLoading?: boolean
}

type MetaTagRow = {
  key: string
  value: string | React.ReactNode
  isImage?: boolean
  imageUrl?: string
}

export type MetaCategory = 'general' | 'openGraph' | 'twitter' | 'icons'

const isUrl = (url: string): boolean =>
  url.startsWith('http://') || url.startsWith('https://')

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: This is a complex function that needs to be refactored.
const getGeneralTags = (data: OgData | null): MetaTagRow[] => {
  const defaultTags = [
    { key: 'title', value: '—' },
    { key: 'description', value: '—' },
    { key: 'author', value: '—' },
    { key: 'viewport', value: '—' },
    { key: 'canonical url', value: '—' },
    { key: 'robots', value: '—' }
  ]

  if (!data) {
    return defaultTags
  }

  const rows: MetaTagRow[] = []
  if (data.title) {
    rows.push({ key: 'title', value: data.title })
  }
  if (data.description) {
    rows.push({ key: 'description', value: data.description })
  }
  if (data.author) {
    rows.push({ key: 'author', value: data.author })
  }
  if (data.viewport) {
    rows.push({ key: 'viewport', value: data.viewport })
  }
  if (data.canonical) {
    rows.push({ key: 'canonical url', value: data.canonical })
  }
  if (data.robots) {
    rows.push({ key: 'robots', value: data.robots })
  }
  if (data.applicationName) {
    rows.push({ key: 'application name', value: data.applicationName })
  }
  if (data.keywords) {
    rows.push({ key: 'keywords', value: data.keywords })
  }
  if (data.generator) {
    rows.push({ key: 'generator', value: data.generator })
  }

  if (data.themeColor || data.themeColorLight || data.themeColorDark) {
    const colors: string[] = []
    if (data.themeColorLight) {
      colors.push(`${data.themeColorLight} (light)`)
    }
    if (data.themeColorDark) {
      colors.push(`${data.themeColorDark} (dark)`)
    }
    if (data.themeColor && !data.themeColorLight && !data.themeColorDark) {
      colors.push(data.themeColor)
    }

    rows.push({
      key: 'theme color',
      value: (
        <div className="space-y-1">
          {colors.map((color, i) => {
            const colorValue = color.split(' ')[0]
            return (
              <div className="flex items-center gap-2" key={i.toString()}>
                <span
                  className="size-4 shrink-0 rounded border"
                  style={{ backgroundColor: colorValue }}
                />
                <span>{color}</span>
              </div>
            )
          })}
        </div>
      )
    })
  }

  return rows.length > 0 ? rows : defaultTags
}

const getOpenGraphTags = (data: OgData | null): MetaTagRow[] => {
  const defaultTags = [
    { key: 'og:title', value: '—' },
    { key: 'og:description', value: '—' },
    { key: 'og:image', value: '—', isImage: true },
    { key: 'og:url', value: '—' },
    { key: 'og:type', value: '—' },
    { key: 'og:site_name', value: '—' }
  ]

  if (!data) {
    return defaultTags
  }

  const rows: MetaTagRow[] = []
  if (data['og:title']) {
    rows.push({ key: 'og:title', value: data['og:title'] })
  }
  if (data['og:description']) {
    rows.push({ key: 'og:description', value: data['og:description'] })
  }
  if (data['og:image']) {
    rows.push({
      key: 'og:image',
      value: data['og:image'],
      isImage: true,
      imageUrl: data['og:image']
    })
  }
  if (data['og:url']) {
    rows.push({ key: 'og:url', value: data['og:url'] })
  }
  if (data['og:type']) {
    rows.push({ key: 'og:type', value: data['og:type'] })
  }
  if (data['og:site_name']) {
    rows.push({ key: 'og:site_name', value: data['og:site_name'] })
  }
  if (data['og:locale']) {
    rows.push({ key: 'og:locale', value: data['og:locale'] })
  }
  if (data['og:image:width']) {
    rows.push({ key: 'og:image:width', value: data['og:image:width'] })
  }
  if (data['og:image:height']) {
    rows.push({ key: 'og:image:height', value: data['og:image:height'] })
  }

  return rows.length > 0 ? rows : defaultTags
}

const getTwitterTags = (data: OgData | null): MetaTagRow[] => {
  const defaultTags = [
    { key: 'twitter:card', value: '—' },
    { key: 'twitter:title', value: '—' },
    { key: 'twitter:description', value: '—' },
    { key: 'twitter:image', value: '—', isImage: true },
    { key: 'twitter:site', value: '—' }
  ]

  if (!data) {
    return defaultTags
  }

  const rows: MetaTagRow[] = []
  if (data['twitter:card']) {
    rows.push({ key: 'twitter:card', value: data['twitter:card'] })
  }
  if (data['twitter:title']) {
    rows.push({ key: 'twitter:title', value: data['twitter:title'] })
  }
  if (data['twitter:description']) {
    rows.push({
      key: 'twitter:description',
      value: data['twitter:description']
    })
  }
  if (data['twitter:image']) {
    rows.push({
      key: 'twitter:image',
      value: data['twitter:image'],
      isImage: true,
      imageUrl: data['twitter:image']
    })
  }
  if (data['twitter:site']) {
    rows.push({ key: 'twitter:site', value: data['twitter:site'] })
  }
  if (data['twitter:creator']) {
    rows.push({ key: 'twitter:creator', value: data['twitter:creator'] })
  }

  return rows.length > 0 ? rows : defaultTags
}

export const TagTable = ({
  data,
  category,
  isLoading
}: TagTableProps): ReactElement => {
  const getTags = (): MetaTagRow[] => {
    switch (category) {
      case 'general':
        return getGeneralTags(data)
      case 'openGraph':
        return getOpenGraphTags(data)
      case 'twitter':
        return getTwitterTags(data)
      default:
        return []
    }
  }

  const tags = getTags()

  return (
    <div className="overflow-hidden p-4">
      <table className="w-full border">
        <tbody className="divide-y">
          {/** biome-ignore lint/complexity/noExcessiveCognitiveComplexity: This is a complex function that needs to be refactored. */}
          {tags.map(({ key, value, isImage, imageUrl }, index) => {
            let content: React.ReactNode

            if (isLoading) {
              content = <Skeleton className="h-4 w-3/4" />
            } else if (isImage) {
              if (imageUrl) {
                let linkLabel = imageUrl
                if (typeof value === 'string' && value.length > 0) {
                  linkLabel = value
                }

                content = (
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded border bg-muted">
                        <Image
                          alt={linkLabel}
                          className="h-full w-full object-cover"
                          height={96}
                          onError={e => {
                            const parent = e.currentTarget.parentElement
                            if (parent) {
                              parent.innerHTML =
                                '<span class="text-muted-foreground text-xs">Failed</span>'
                            }
                          }}
                          src={imageUrl}
                          width={96}
                        />
                      </div>
                      <a
                        className="inline-flex items-center gap-1 break-all text-primary hover:underline"
                        href={imageUrl}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {linkLabel}
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </div>
                  </div>
                )
              } else {
                content = value
              }
            } else if (typeof value === 'string') {
              if (isUrl(value)) {
                content = (
                  <a
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                    href={value}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {value}
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                )
              } else {
                content = value
              }
            } else {
              content = value
            }

            return (
              <tr className="divide-x" key={`${key}-${index.toString()}`}>
                <td className="w-40 whitespace-nowrap px-4 py-3 align-top font-medium text-primary text-sm">
                  {key}
                </td>
                <td className="break-all px-4 py-3 text-muted-foreground text-sm">
                  {content}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
