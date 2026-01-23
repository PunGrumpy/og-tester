import { ImageOff } from 'lucide-react'
import Image from 'next/image'

interface FacebookPreviewProps {
  image?: string
  displayUrl: string
  title: string
  description?: string
}

export const FacebookPreview = ({
  image,
  displayUrl,
  title,
  description
}: FacebookPreviewProps) => (
  <div className="overflow-hidden rounded-lg border bg-[#242526]">
    <div className="relative aspect-[1.91/1] w-full bg-[#3a3b3c]">
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
          <ImageOff aria-hidden="true" className="size-8 text-[#b0b3b8]/50" />
        </div>
      )}
    </div>
    <div className="space-y-1 bg-[#3a3b3c] p-3">
      <p className="text-[#b0b3b8] text-xs uppercase">{displayUrl}</p>
      <h3 className="truncate font-semibold text-[#e4e6eb] leading-tight">
        {title}
      </h3>
      {description ? (
        <p className="line-clamp-1 text-[#b0b3b8] text-sm">{description}</p>
      ) : null}
    </div>
  </div>
)
