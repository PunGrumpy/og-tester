import Image from 'next/image'

type XPreviewProps = {
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
  <div className="overflow-hidden rounded-xl border border-border bg-card">
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
      <p className="text-muted-foreground text-xs">{displayUrl}</p>
      <h3 className="font-semibold leading-tight">{title}</h3>
      <p className="line-clamp-2 text-muted-foreground text-sm">
        {description}
      </p>
    </div>
  </div>
)
