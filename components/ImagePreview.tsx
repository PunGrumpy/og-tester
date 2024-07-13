import { AlertCircle, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type ImagePreviewProps = {
  src: string | undefined
  alt: string
}

export function ImagePreview({ src, alt }: ImagePreviewProps) {
  const [error, setError] = useState(false)
  const [aspectRatio, setAspectRatio] = useState<number>(16 / 9)
  const [imageSize, setImageSize] = useState<string>('Unknown')

  if (!src) {
    return (
      <Alert>
        <AlertCircle className="size-4" />
        <AlertTitle>No Image</AlertTitle>
        <AlertDescription>No {alt} found in the metadata.</AlertDescription>
      </Alert>
    )
  }

  const isHttps = src.startsWith('https://')

  if (!isHttps) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Insecure Image Source</AlertTitle>
        <AlertDescription>
          The image is served over HTTP, which is not secure and may not load in
          some browsers.
        </AlertDescription>
      </Alert>
    )
  }

  const handleImageLoad = (
    event: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const img = event.target as HTMLImageElement
    const ratio = img.naturalWidth / img.naturalHeight
    setAspectRatio(ratio)
    setImageSize(`${img.naturalWidth} x ${img.naturalHeight}`)
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Error Loading Image</AlertTitle>
        <AlertDescription>
          Failed to load image from URL: {src}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <AspectRatio ratio={aspectRatio}>
        <Image
          src={src}
          alt={alt}
          fill
          className="rounded-md object-cover"
          onError={() => setError(true)}
          onLoad={handleImageLoad}
          unoptimized={src.endsWith('.svg')}
        />
      </AspectRatio>
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="text-xs">
          {imageSize}
        </Badge>
        <Button variant="outline" size="sm" asChild>
          <a href={src} target="_blank" rel="noopener noreferrer">
            Open Original <ExternalLink className="ml-2 size-4" />
          </a>
        </Button>
      </div>
    </div>
  )
}
