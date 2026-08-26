import { ImageOff } from "lucide-react";
import Image from "next/image";

interface DiscordPreviewProps {
  image?: string;
  siteName?: string;
  title: string;
  description?: string;
}

export const DiscordPreview = ({
  image,
  siteName,
  title,
  description,
}: DiscordPreviewProps) => (
  <div className="border-border/50 max-w-md overflow-hidden rounded border bg-[#2f3136] p-4 shadow-[inset_3px_0_0_0_#5865F2]">
    <div className="flex flex-col gap-2">
      {siteName ? (
        <p className="text-xs font-medium text-[#00aff4]">{siteName}</p>
      ) : null}
      <p className="truncate font-semibold text-[#00aff4]">{title}</p>
      {description ? (
        <p className="line-clamp-3 text-sm text-[#dcddde]">{description}</p>
      ) : null}
      <div className="relative mt-4 aspect-video max-w-[300px] overflow-hidden rounded bg-[#202225]">
        {image ? (
          <>
            <Image
              alt={title}
              className="object-cover"
              fill
              sizes="300px"
              src={image}
            />
            <div className="pointer-events-none absolute inset-0 border border-black/10 dark:border-white/10" />
          </>
        ) : (
          <div className="flex size-full items-center justify-center">
            <ImageOff aria-hidden="true" className="size-8 text-[#dcddde]/30" />
          </div>
        )}
      </div>
    </div>
  </div>
);
