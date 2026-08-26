import { ImageOff } from "lucide-react";
import Image from "next/image";

interface SlackPreviewProps {
  image?: string;
  siteName?: string;
  title: string;
  description?: string;
}

export const SlackPreview = ({
  image,
  siteName,
  title,
  description,
}: SlackPreviewProps) => (
  <div className="overflow-hidden rounded border border-white/10 bg-[#1A1D21] p-3 shadow-[inset_3px_0_0_0_#36C5F0]">
    <div className="flex gap-3">
      <div className="flex flex-1 flex-col gap-1">
        {siteName ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#D1D2D3]">
              {siteName}
            </span>
          </div>
        ) : null}
        <p className="truncate font-semibold text-[#1D9BD1]">{title}</p>
        <p className="line-clamp-2 text-sm text-[#ABABAD]">
          {description || "No description"}
        </p>
      </div>
      <div className="relative size-20 shrink-0 overflow-hidden rounded bg-[#222529]">
        {image ? (
          <>
            <Image
              alt={title}
              className="object-cover"
              fill
              sizes="80px"
              src={image}
            />
            <div className="pointer-events-none absolute inset-0 border border-white/10" />
          </>
        ) : (
          <div className="flex size-full items-center justify-center">
            <ImageOff aria-hidden="true" className="size-6 text-[#ABABAD]/50" />
          </div>
        )}
      </div>
    </div>
  </div>
);
