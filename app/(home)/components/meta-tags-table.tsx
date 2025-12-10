'use client'

import { ExternalLink } from 'lucide-react'
import { useOgStore } from '@/hooks/use-og-store'

const TAG_ORDER: readonly string[] = [
  'twitter:image',
  'twitter:card',
  'twitter:title',
  'twitter:description',
  'title',
  'description',
  'og:image',
  'og:site_name',
  'og:title',
  'og:description',
  'og:url'
] as const

const isUrl = (url: string): boolean =>
  url.startsWith('http://') || url.startsWith('https://')

type MetaTag = {
  key: string
  value: string
}

export const MetaTagsTable = () => {
  const { data } = useOgStore()
  const sortedEntries: MetaTag[] = TAG_ORDER.filter(
    (key): key is string => data[key] !== undefined
  ).map(key => ({
    key,
    value: data[key] as string
  }))

  for (const [key, value] of Object.entries(data)) {
    if (!TAG_ORDER.includes(key) && typeof value === 'string') {
      sortedEntries.push({ key, value })
    }
  }

  return (
    <div className="overflow-hidden">
      <table className="w-full">
        <tbody className="divide-y">
          {sortedEntries.map(({ key, value }: MetaTag) => (
            <tr className="divide-x" key={key}>
              <td className="w-40 whitespace-nowrap px-4 py-3 font-medium text-sm">
                {key}
              </td>
              <td className="break-all px-4 py-3 text-muted-foreground text-sm">
                {isUrl(value) ? (
                  <a
                    className="inline-flex items-center gap-1 text-cyan-400 transition-colors hover:underline"
                    href={value}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {value}
                    <ExternalLink className="size-3 shrink-0" />
                  </a>
                ) : (
                  value
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
