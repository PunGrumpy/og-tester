import Image from 'next/image'

type LinkedinPreviewProps = {
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
    <div className="space-y-1 p-3">
      <h3 className="font-semibold text-[#ffffff] leading-tight">{title}</h3>
      <p className="text-[#ffffff99] text-xs">{displayUrl}</p>
    </div>
  </div>
)
