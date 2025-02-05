import { ArrowUpRightIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { Prose } from '@/components/Prose'
import { ViewAnimation } from '@/components/providers/ViewAnimation'
import { Button } from '@/components/ui/button'
import { MetadataAttributes } from '@/types/metadata'

interface MetadataResultProps {
  metadata: MetadataAttributes
  validateMetadata: (metadata: MetadataAttributes) => string[]
}

export const MetadataResults = ({ metadata }: MetadataResultProps) => {
  const hasOgMetadata = metadata.ogTitle || metadata.ogDescription
  const hasTwitterMetadata =
    metadata.twitterTitle || metadata.twitterDescription

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
          </div>

          <div className="flex flex-col items-start gap-1 md:flex-row">
            {metadata.ogUrl && (
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

      {metadata.ogImage && metadata.ogImage.startsWith('https') ? (
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
