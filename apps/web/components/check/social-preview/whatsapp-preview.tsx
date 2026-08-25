import { ImageOff } from "lucide-react";
import Image from "next/image";

interface WhatsappPreviewProps {
  image?: string;
  displayUrl: string;
  title: string;
  description?: string;
}

export const WhatsappPreview = ({
  image,
  displayUrl,
  title,
  description,
}: WhatsappPreviewProps) => (
  <div className="max-w-sm overflow-hidden rounded-lg bg-[#1f2c34]">
    <div className="flex gap-3 p-2">
      <div className="relative size-16 shrink-0 overflow-hidden rounded bg-[#2a3942]">
        {image ? (
          <>
            <Image
              alt={title}
              className="object-cover"
              fill
              sizes="64px"
              src={image}
            />
            <div className="pointer-events-none absolute inset-0 border border-black/10 dark:border-white/10" />
          </>
        ) : (
          <div className="flex size-full items-center justify-center">
            <ImageOff aria-hidden="true" className="size-5 text-[#8696a0]/50" />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-xs text-[#8696a0]">{displayUrl}</p>
        <p className="line-clamp-2 text-sm font-medium text-[#e9edef]">
          {title}
        </p>
        {description ? (
          <p className="line-clamp-2 text-xs text-[#8696a0]">{description}</p>
        ) : null}
      </div>
    </div>
  </div>
);
