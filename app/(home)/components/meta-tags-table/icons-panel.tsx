'use client'

import Image from 'next/image'
import type { ReactElement } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import type { OgData } from '@/lib/schemas/og'

type IconsPanelProps = {
  data: OgData | null
  isLoading?: boolean
}

export const IconsPanel = ({
  data,
  isLoading
}: IconsPanelProps): ReactElement => {
  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-4">
        {[1, 2, 3].map(i => (
          <div className="flex items-center gap-2" key={i}>
            <Skeleton className="size-10 rounded" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!data?.favicons || data.favicons.length === 0) {
    return (
      <div className="rounded-lg p-8 text-center">
        <p className="text-muted-foreground text-sm">No icons found</p>
      </div>
    )
  }

  const favicons = data.favicons

  return (
    <div className="m-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {favicons.map((icon, index) => (
        <div
          className="flex items-center gap-3 rounded-lg border px-3 py-2"
          key={index.toString()}
        >
          <div className="flex size-8 items-center justify-center overflow-hidden rounded border bg-muted">
            <Image
              alt={icon.rel}
              className="size-full object-contain"
              height={32}
              src={icon.href}
              width={32}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-muted-foreground text-sm">{icon.rel}</p>
            {icon.sizes ? (
              <p className="text-muted-foreground/60 text-xs">{icon.sizes}</p>
            ) : null}
            {icon.type ? (
              <p className="text-muted-foreground/60 text-xs">{icon.type}</p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}
