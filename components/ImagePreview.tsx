import Image from 'next/image'
import { useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

type ImagePreviewProps = {
  src: string | undefined
  alt: string
}

export function ImagePreview({ src, alt }: ImagePreviewProps) {
  const [error, setError] = useState(false)

  if (!src) return <p>No {alt} found</p>

  const isHttps = (url: string) => url.startsWith('https://')

  if (!isHttps(src)) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Insecure Image Source</AlertTitle>
        <AlertDescription>
          The image is served over HTTP, which is not secure. URL: {src}
        </AlertDescription>
      </Alert>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-200 p-4 text-center dark:bg-gray-700">
        <p>Error loading image. URL: {src}</p>
      </div>
    )
  }

  return (
    <div className="relative h-[300px] w-full">
      <Image
        src={src}
        alt={alt}
        layout="fill"
        objectFit="contain"
        onError={() => setError(true)}
        unoptimized={src.endsWith('.svg')}
      />
    </div>
  )
}
