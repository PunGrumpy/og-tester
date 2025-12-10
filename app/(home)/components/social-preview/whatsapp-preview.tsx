import Image from 'next/image'

type WhatsappPreviewProps = {
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
      <div className="relative size-16 shrink-0 overflow-hidden rounded">
        {image ? (
          <Image
            alt={title}
            className="object-cover"
            fill
            sizes="100vw"
            src={image}
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-[#8696a0] text-xs">{displayUrl}</p>
        <h3 className="line-clamp-2 font-medium text-[#e9edef] text-sm">
          {title}
        </h3>
        <p className="line-clamp-2 text-[#8696a0] text-xs">{description}</p>
      </div>
    </div>
  </div>
)
