import { ImageOff } from 'lucide-react'
import Image from 'next/image'

interface SlackPreviewProps {
  image?: string
  siteName?: string
  title: string
  description?: string
}

export const SlackPreview = ({
  image,
  siteName,
  title,
  description
}: SlackPreviewProps) => (
  <div className="overflow-hidden rounded border-l-4 border-l-[#36C5F0] bg-card p-3">
    <div className="flex gap-3">
      <div className="flex-1 space-y-1">
        {siteName ? (
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground text-sm">
              {siteName}
            </span>
          </div>
        ) : null}
        <h3 className="truncate font-bold text-[#1264A3]">{title}</h3>
        <p className="line-clamp-2 text-muted-foreground text-sm">
          {description || 'No description'}
        </p>
      </div>
      <div className="relative size-20 shrink-0 overflow-hidden rounded bg-muted">
        {image ? (
          <Image
            alt={title}
            className="object-cover"
            fill
            sizes="80px"
            src={image}
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <ImageOff
              aria-hidden="true"
              className="size-6 text-muted-foreground/50"
            />
          </div>
        )}
      </div>
    </div>
  </div>
)
