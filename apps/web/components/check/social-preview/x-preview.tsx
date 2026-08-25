import { ImageOff } from "lucide-react";
import Image from "next/image";

interface XPreviewProps {
  image?: string;
  displayUrl: string;
  title: string;
  description?: string;
}

export const XPreview = ({
  image,
  displayUrl,
  title,
  description,
}: XPreviewProps) => (
  <div className="bg-card overflow-hidden rounded-xl border">
    <div className="bg-muted relative aspect-[1.91/1] w-full">
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
          <ImageOff
            aria-hidden="true"
            className="text-muted-foreground/50 size-8"
          />
        </div>
      )}
    </div>

    <div className="flex flex-col gap-1 p-3">
      <p className="text-muted-foreground text-xs">{displayUrl}</p>
      <p className="truncate leading-tight font-semibold">{title}</p>
      {description ? (
        <p className="text-muted-foreground line-clamp-2 text-sm">
          {description}
        </p>
      ) : null}
    </div>
  </div>
);
