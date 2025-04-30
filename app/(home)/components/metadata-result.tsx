'use client'

import { ArrowUpRightIcon, Check, Clipboard } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import type { Metadata } from '@/app/api/og/route'
import { Prose } from '@/components/prose'
import { ViewAnimation } from '@/components/providers/view-animation'
import { Button } from '@/components/ui/button'

interface MetadataResultProps {
  metadata: Metadata
}

export const MetadataResults = ({ metadata }: MetadataResultProps) => {
  const [copied, setCopied] = useState(false)

  const hasOgMetadata = metadata.ogTitle || metadata.ogDescription
  const hasTwitterMetadata =
    metadata.twitterTitle || metadata.twitterDescription

  const copyToClipboard = async () => {
    if (metadata.ogUrl) {
      try {
        await navigator.clipboard.writeText(metadata.ogUrl)
        setCopied(true)
        toast.success('URL copied to clipboard')

        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to copy URL'
        toast.error(message)
      }
    }
  }

  return (
    <section className="grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      <div>
        <ViewAnimation
          className="flex h-full flex-col items-start justify-between gap-4 px-4 py-8 sm:px-8"
          initial={{ opacity: 0, translateY: -8 }}
          whileInView={{ opacity: 1, translateY: 0 }}
        >
          <div className="flex flex-col gap-6">
            <Prose>
              <small className="text-muted-foreground">Open Graph</small>
              {hasOgMetadata ? (
                <>
                  {metadata.ogTitle && (
                    <h2 className="my-2 text-3xl">{metadata.ogTitle}</h2>
                  )}
                  {metadata.ogDescription && (
                    <p className="text-foreground/80">
                      {metadata.ogDescription}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground text-sm italic">
                  No Open Graph metadata available
                </p>
              )}
            </Prose>

            <Prose>
              <small className="text-muted-foreground">Twitter Card</small>
              {hasTwitterMetadata ? (
                <>
                  {metadata.twitterTitle && (
                    <h2 className="my-2 text-3xl">{metadata.twitterTitle}</h2>
                  )}
                  {metadata.twitterDescription && (
                    <p className="text-foreground/80">
                      {metadata.twitterDescription}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground text-sm italic">
                  No Twitter Card metadata available
                </p>
              )}
            </Prose>

            {metadata.favicon && (
              <div className="flex items-center gap-2">
                <small className="text-muted-foreground">Favicon</small>
                <div className="rounded border bg-accent/75 p-1">
                  <Image
                    src={
                      metadata.favicon.startsWith('http')
                        ? metadata.favicon
                        : `https:${metadata.favicon}`
                    }
                    alt="Favicon"
                    width={16}
                    height={16}
                    className="h-4 w-4"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-start gap-1 md:flex-row">
            {metadata.ogUrl && (
              <>
                <Button asChild variant="outline" key="website">
                  <Link
                    href={metadata.ogUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Visit Website
                    <ArrowUpRightIcon size={16} />
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  key="copy"
                  onClick={copyToClipboard}
                  className="md:ml-2"
                >
                  {copied ? (
                    <>
                      <Check size={16} className="mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Clipboard size={16} className="mr-1" />
                      Copy URL
                    </>
                  )}
                </Button>
              </>
            )}

            {metadata.ogImage && (
              <Button asChild variant="link" key="image">
                <Link
                  href={metadata.ogImage}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  View Image
                </Link>
              </Button>
            )}
          </div>
        </ViewAnimation>
      </div>

      {metadata.ogImage?.startsWith('https') ? (
        <div className="bg-dashed sm:col-span-2">
          <ViewAnimation
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            delay={0.4}
            className="relative h-full"
          >
            <div className="h-full pt-4 pl-4 sm:pt-8 sm:pl-8">
              <div className="dashed-line-top" />
              <div className="dashed-line-left" />
              <Image
                src={metadata.ogImage}
                alt={metadata.ogTitle || 'No title found'}
                width={820}
                height={500}
                className="h-full w-full rounded-tl-lg border-t border-l sm:rounded-tl-2xl"
              />
            </div>
          </ViewAnimation>
        </div>
      ) : (
        <div className="bg-dashed sm:col-span-2">
          <ViewAnimation
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            delay={0.4}
            className="relative"
          >
            <div className="flex h-full min-h-[500px] items-center justify-center">
              <p className="text-muted-foreground text-sm italic">
                No image available
              </p>
            </div>
          </ViewAnimation>
        </div>
      )}
    </section>
  )
}
