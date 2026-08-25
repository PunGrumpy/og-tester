import { ImageOff } from "lucide-react";
import Image from "next/image";

interface LinkedinPreviewProps {
  image?: string;
  displayUrl: string;
  title: string;
}

export const LinkedinPreview = ({
  image,
  displayUrl,
  title,
}: LinkedinPreviewProps) => (
  <div className="overflow-hidden rounded-lg border border-[#38434f] bg-[#1d2226]">
    <div className="relative aspect-[1.91/1] w-full bg-[#38434f]">
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
          <ImageOff aria-hidden="true" className="size-8 text-[#ffffff]/30" />
        </div>
      )}
    </div>
    <div className="flex flex-col gap-1 p-3">
      <p className="truncate leading-tight font-semibold text-[#ffffff]">
        {title}
      </p>
      <p className="text-xs text-[#ffffff99]">{displayUrl}</p>
    </div>
  </div>
);
