import { ImageOff } from "lucide-react";
import Image from "next/image";

interface FacebookPreviewProps {
  image?: string;
  displayUrl: string;
  title: string;
  description?: string;
}

export const FacebookPreview = ({
  image,
  displayUrl,
  title,
  description,
}: FacebookPreviewProps) => (
  <div className="overflow-hidden rounded-lg border bg-[#242526]">
    <div className="relative aspect-[1.91/1] w-full bg-[#3a3b3c]">
      {image ? (
        <>
          <Image
            alt={title}
            className="object-cover"
            fill
            sizes="(max-width: 768px) 100vw, 420px"
            src={image}
          />
          <div className="pointer-events-none absolute inset-0 border border-black/10 dark:border-white/10" />
        </>
      ) : (
        <div className="flex size-full items-center justify-center">
          <ImageOff aria-hidden="true" className="size-8 text-[#b0b3b8]/50" />
        </div>
      )}
    </div>
    <div className="flex flex-col gap-1 bg-[#3a3b3c] p-3">
      <p className="text-xs text-[#b0b3b8] uppercase">{displayUrl}</p>
      <p className="truncate leading-tight font-semibold text-[#e4e6eb]">
        {title}
      </p>
      {description ? (
        <p className="line-clamp-1 text-sm text-[#b0b3b8]">{description}</p>
      ) : null}
    </div>
  </div>
);
