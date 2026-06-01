import { ImageOff } from 'lucide-react'
import Image from 'next/image'

interface LinkedinPreviewProps {
  image?: string
  displayUrl: string
  title: string
}

export const LinkedinPreview = ({
  image,
  displayUrl,
  title
}: LinkedinPreviewProps) => (
  <div className="overflow-hidden rounded-lg border border-[#38434f] bg-[#1d2226]">
    <div className="relative aspect-[1.91/1] w-full bg-[#38434f]">
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
          <ImageOff aria-hidden="true" className="size-8 text-[#ffffff]/30" />
        </div>
      )}
    </div>
    <div className="space-y-1 p-3">
      <h3 className="truncate font-semibold text-[#ffffff] leading-tight">
        {title}
      </h3>
      <p className="text-[#ffffff99] text-xs">{displayUrl}</p>
    </div>
  </div>
)
