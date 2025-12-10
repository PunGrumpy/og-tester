import Image from 'next/image'

type SlackPreviewProps = {
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
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground text-sm">{siteName}</span>
        </div>
        <h3 className="cursor-pointer font-bold text-[#1264A3] hover:underline">
          {title}
        </h3>
        <p className="line-clamp-2 text-muted-foreground text-sm">
          {description || 'No description'}
        </p>
      </div>
      <div className="relative size-20 shrink-0 overflow-hidden rounded">
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
    </div>
  </div>
)
