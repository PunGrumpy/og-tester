import Image from 'next/image'

type FacebookPreviewProps = {
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
    <div className="relative aspect-[1.91/1] w-full bg-muted">
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
    <div className="space-y-1 bg-[#3a3b3c] p-3">
      <p className="text-[#b0b3b8] text-xs uppercase">{displayUrl}</p>
      <h3 className="font-semibold text-[#e4e6eb] leading-tight">{title}</h3>
      <p className="line-clamp-1 text-[#b0b3b8] text-sm">{description}</p>
    </div>
  </div>
)
