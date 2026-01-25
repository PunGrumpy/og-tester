'use client'

import { Output, Theme } from 'appwrite'
import { ImageOff } from 'lucide-react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from '@/components/ui/empty'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { ViewAnimation } from '@/components/view-animation'
import { useOgStore } from '@/hooks/use-og-store'
import { screenshot } from '@/lib/screenshot'
import { PoweredBy } from './powered-by'

export const ScreenshotPreview = () => {
  const { url } = useOgStore()
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [fullpage, setFullpage] = useState(false)
  const { resolvedTheme: currentTheme } = useTheme()
  const [theme, setTheme] = useState<Theme>(
    currentTheme === 'dark' ? Theme.Dark : Theme.Light
  )

  const screenshotUrl = useMemo(() => {
    if (!url) {
      return null
    }

    return screenshot({
      url,
      fullpage,
      theme,
      output: Output.Webp
    })
  }, [url, fullpage, theme])

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    setHasError(false)
  }, [])

  const handleError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
  }, [])

  useEffect(() => {
    if (screenshotUrl) {
      setIsLoading(true)
      setHasError(false)
    }
  }, [screenshotUrl])

  if (!url) {
    return (
      <ViewAnimation
        className="flex flex-col gap-4 p-4"
        delay={1}
        initial={{ opacity: 0, translateY: -8 }}
        whileInView={{ opacity: 1, translateY: 0 }}
      >
        <Empty className="min-h-[300px] flex-1 border">
          <EmptyHeader>
            <EmptyTitle>No screenshot available</EmptyTitle>
            <EmptyDescription>
              Enter a URL above to capture a full webpage screenshot.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
        <PoweredBy />
      </ViewAnimation>
    )
  }

  return (
    <ViewAnimation
      className="flex flex-col gap-4 p-4"
      delay={1}
      initial={{ opacity: 0, translateY: -8 }}
      whileInView={{ opacity: 1, translateY: 0 }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-semibold text-lg">Full Page Screenshot</h2>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={theme === Theme.Dark}
              id="theme-switch"
              onCheckedChange={checked =>
                setTheme(checked ? Theme.Dark : Theme.Light)
              }
              size="sm"
            />
            <Label
              className="text-muted-foreground text-xs"
              htmlFor="theme-switch"
            >
              Dark
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={fullpage}
              id="fullpage-switch"
              onCheckedChange={setFullpage}
              size="sm"
            />
            <Label
              className="text-muted-foreground text-xs"
              htmlFor="fullpage-switch"
            >
              Full page
            </Label>
          </div>
        </div>
      </div>

      <div className="relative min-h-[300px] overflow-hidden rounded-lg border bg-muted">
        {isLoading && (
          <div className="absolute inset-0 z-10">
            <Skeleton className="size-full rounded-none" />
          </div>
        )}

        {hasError && (
          <div className="flex size-full min-h-[300px] items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImageOff className="size-8" />
              <p className="text-sm">Failed to load screenshot</p>
            </div>
          </div>
        )}

        {!hasError && screenshotUrl && (
          <Image
            alt={`Screenshot of ${url}`}
            className="h-auto w-full object-contain"
            height={fullpage ? 2000 : 720}
            key={screenshotUrl}
            onError={handleError}
            onLoad={handleLoad}
            src={screenshotUrl}
            width={1280}
          />
        )}
      </div>

      <PoweredBy />
    </ViewAnimation>
  )
}
