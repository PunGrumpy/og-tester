import Image from 'next/image'

type DiscordPreviewProps = {
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
      <p className="font-medium text-[#00aff4] text-xs">{siteName}</p>
      <h3 className="cursor-pointer font-semibold text-[#00aff4] hover:underline">
        {title}
      </h3>
      <p className="line-clamp-3 text-[#dcddde] text-sm">{description}</p>
      <div className="relative mt-4 max-w-[300px] overflow-hidden rounded">
        <Image
          alt={title}
          className="object-cover"
          height={300}
          src={image ?? ''}
          width={300}
        />
      </div>
    </div>
  </div>
)
