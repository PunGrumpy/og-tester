"use client";

import { ExternalLink, ImageOff } from "lucide-react";
import Image from "next/image";

import type { OgStatus } from "@/hooks/use-og-store";
import { toImageSrc } from "@/lib/image-src";
import type { OgData } from "@/lib/schemas/og";

import { ReportSection } from "./section";

interface Field {
  key: string;
  dataKey: keyof OgData;
  isImage?: boolean;
}

const GROUPS: { id: string; label: string; blurb: string; fields: Field[] }[] =
  [
    {
      blurb:
        "What the page says about itself, before any platform-specific tag.",
      fields: [
        { dataKey: "title", key: "title" },
        { dataKey: "description", key: "description" },
        { dataKey: "author", key: "author" },
        { dataKey: "viewport", key: "viewport" },
        { dataKey: "canonical", key: "canonical" },
        { dataKey: "robots", key: "robots" },
        { dataKey: "applicationName", key: "application-name" },
        { dataKey: "keywords", key: "keywords" },
        { dataKey: "generator", key: "generator" },
        { dataKey: "themeColor", key: "theme-color" },
      ],
      id: "general",
      label: "General",
    },
    {
      blurb: "The tags every platform reads first when it builds a preview.",
      fields: [
        { dataKey: "og:title", key: "og:title" },
        { dataKey: "og:description", key: "og:description" },
        { dataKey: "og:image", isImage: true, key: "og:image" },
        { dataKey: "og:url", key: "og:url" },
        { dataKey: "og:type", key: "og:type" },
        { dataKey: "og:site_name", key: "og:site_name" },
        { dataKey: "og:locale", key: "og:locale" },
        { dataKey: "og:image:width", key: "og:image:width" },
        { dataKey: "og:image:height", key: "og:image:height" },
      ],
      id: "open-graph",
      label: "Open Graph tags",
    },
    {
      blurb: "Read by X in preference to the Open Graph tags above.",
      fields: [
        { dataKey: "twitter:card", key: "twitter:card" },
        { dataKey: "twitter:title", key: "twitter:title" },
        { dataKey: "twitter:description", key: "twitter:description" },
        { dataKey: "twitter:image", isImage: true, key: "twitter:image" },
        { dataKey: "twitter:site", key: "twitter:site" },
        { dataKey: "twitter:creator", key: "twitter:creator" },
      ],
      id: "twitter",
      label: "Twitter Card tags",
    },
  ];

const isUrl = (value: string) =>
  value.startsWith("http://") || value.startsWith("https://");

const TagLink = ({ href }: { href: string }) => (
  <a
    className="text-foreground decoration-border hover:decoration-foreground break-all underline underline-offset-4 transition-colors"
    href={href}
    rel="noopener noreferrer"
    target="_blank"
  >
    {href}
    <ExternalLink aria-hidden="true" className="ml-1 inline size-3" />
    <span className="sr-only">(opens in new tab)</span>
  </a>
);

const TagValue = ({ field, data }: { field: Field; data: OgData }) => {
  const raw = data[field.dataKey];
  const value = typeof raw === "string" ? raw : "";

  if (!value) {
    return <span className="text-muted-foreground">Not set</span>;
  }

  if (field.isImage) {
    const src = toImageSrc(value);
    return (
      <span className="flex items-start gap-3">
        <span className="bg-muted relative flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md outline outline-black/10 dark:outline-white/10">
          {src ? (
            <Image
              alt=""
              className="size-full object-cover"
              height={80}
              src={src}
              width={80}
            />
          ) : (
            <ImageOff
              aria-hidden="true"
              className="text-muted-foreground size-4"
            />
          )}
        </span>
        <TagLink href={value} />
      </span>
    );
  }

  if (isUrl(value)) {
    return <TagLink href={value} />;
  }

  return <span className="break-words">{value}</span>;
};

interface TagSectionsProps {
  canRescan: boolean;
  data: OgData;
  errorMessage: string;
  status: OgStatus;
}

export const TagSections = ({
  canRescan,
  data,
  errorMessage,
  status,
}: TagSectionsProps) => {
  if (status !== "ready") {
    const failure = canRescan
      ? `${errorMessage} Rescan above once the page responds.`
      : `${errorMessage} The scan is still running; you can rescan once it finishes.`;
    return (
      <ReportSection
        description={
          status === "loading" ? "Reading the page’s tags…" : failure
        }
        id="tags-status"
        title="Tags"
      />
    );
  }

  return (
    <>
      {GROUPS.map((group) => (
        <ReportSection
          description={group.blurb}
          id={`tags-${group.id}`}
          key={group.id}
          title={group.label}
        >
          <dl className="m-0 divide-y border-y p-0">
            {group.fields.map((field) => (
              <div
                className="grid gap-1 py-4 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] sm:gap-6"
                key={field.key}
              >
                <dt className="text-muted-foreground font-mono text-sm">
                  {field.key}
                </dt>
                <dd className="text-foreground m-0 min-w-0 text-sm">
                  <TagValue data={data} field={field} />
                </dd>
              </div>
            ))}
          </dl>
        </ReportSection>
      ))}
    </>
  );
};
