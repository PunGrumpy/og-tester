import { ImageOff } from 'lucide-react'
import Image from 'next/image'

interface DiscordPreviewProps {
  image?: string
  siteName?: string
  title: string
  description?: string
}

export const DiscordPreview = ({
  image,
  siteName,
  title,
  description
}: DiscordPreviewProps) => (
  <div className="max-w-md overflow-hidden rounded border-l-4 border-l-[#5865F2] bg-[#2f3136] p-4">
    <div className="space-y-2">
      {siteName ? (
        <p className="font-medium text-[#00aff4] text-xs">{siteName}</p>
      ) : null}
      <h3 className="truncate font-semibold text-[#00aff4]">{title}</h3>
      {description ? (
        <p className="line-clamp-3 text-[#dcddde] text-sm">{description}</p>
      ) : null}
      <div className="relative mt-4 aspect-video max-w-[300px] overflow-hidden rounded bg-[#202225]">
        {image ? (
          <Image
            alt={title}
            className="object-cover"
            fill
            sizes="300px"
            src={image}
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <ImageOff aria-hidden="true" className="size-8 text-[#dcddde]/30" />
          </div>
        )}
      </div>
    </div>
  </div>
)
