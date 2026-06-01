import { ImageOff } from 'lucide-react'
import Image from 'next/image'

interface XPreviewProps {
  image?: string
  displayUrl: string
  title: string
  description?: string
}

export const XPreview = ({
  image,
  displayUrl,
  title,
  description
}: XPreviewProps) => (
  <div className="overflow-hidden rounded-xl border bg-card">
    <div className="relative aspect-[1.91/1] w-full bg-muted">
      {image ? (
        <Image
          alt={title}
          className="object-cover"
          fill
          sizes="(max-width: 768px) 100vw, 420px"
          src={image}
        />
      ) : (
        <div className="flex size-full items-center justify-center">
          <ImageOff
            aria-hidden="true"
            className="size-8 text-muted-foreground/50"
          />
        </div>
      )}
    </div>

    <div className="space-y-1 p-3">
      <p className="text-muted-foreground text-xs">{displayUrl}</p>
      <h3 className="truncate font-semibold leading-tight">{title}</h3>
      {description ? (
        <p className="line-clamp-2 text-muted-foreground text-sm">
          {description}
        </p>
      ) : null}
    </div>
  </div>
)
