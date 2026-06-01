import { ImageOff } from 'lucide-react'
import Image from 'next/image'

interface WhatsappPreviewProps {
  image?: string
  displayUrl: string
  title: string
  description?: string
}

export const WhatsappPreview = ({
  image,
  displayUrl,
  title,
  description
}: WhatsappPreviewProps) => (
  <div className="max-w-sm overflow-hidden rounded-lg bg-[#1f2c34]">
    <div className="flex gap-3 p-2">
      <div className="relative size-16 shrink-0 overflow-hidden rounded bg-[#2a3942]">
        {image ? (
          <Image
            alt={title}
            className="object-cover"
            fill
            sizes="64px"
            src={image}
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <ImageOff aria-hidden="true" className="size-5 text-[#8696a0]/50" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-[#8696a0] text-xs">{displayUrl}</p>
        <h3 className="line-clamp-2 font-medium text-[#e9edef] text-sm">
          {title}
        </h3>
        {description ? (
          <p className="line-clamp-2 text-[#8696a0] text-xs">{description}</p>
        ) : null}
      </div>
    </div>
  </div>
)
