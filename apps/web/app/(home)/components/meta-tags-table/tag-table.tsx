"use client";

import { ExternalLink } from "lucide-react";
import Image from "next/image";
import type { ReactElement } from "react";
import { useMemo } from "react";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useOgStore } from "@/hooks/use-og-store";
import type { OgData } from "@/lib/schemas/og";

interface TagTableProps {
  data: OgData | null;
  category: MetaCategory;
  isLoading?: boolean;
}

interface MetaTagRow {
  key: string;
  dataKey?: keyof OgData;
  value: string | React.ReactNode;
  isImage?: boolean;
  imageUrl?: string;
}

export type MetaCategory = "general" | "openGraph" | "twitter" | "icons";

interface FieldDefinition {
  key: string;
  dataKey: keyof OgData;
  isImage?: boolean;
}

const GENERAL_FIELDS: FieldDefinition[] = [
  { dataKey: "title", key: "title" },
  { dataKey: "description", key: "description" },
  { dataKey: "author", key: "author" },
  { dataKey: "viewport", key: "viewport" },
  { dataKey: "canonical", key: "canonical url" },
  { dataKey: "robots", key: "robots" },
  { dataKey: "applicationName", key: "application name" },
  { dataKey: "keywords", key: "keywords" },
  { dataKey: "generator", key: "generator" },
  { dataKey: "themeColor", key: "theme color" },
];

const OPEN_GRAPH_FIELDS: FieldDefinition[] = [
  { dataKey: "og:title", key: "og:title" },
  { dataKey: "og:description", key: "og:description" },
  { dataKey: "og:image", isImage: true, key: "og:image" },
  { dataKey: "og:url", key: "og:url" },
  { dataKey: "og:type", key: "og:type" },
  { dataKey: "og:site_name", key: "og:site_name" },
  { dataKey: "og:locale", key: "og:locale" },
  { dataKey: "og:image:width", key: "og:image:width" },
  { dataKey: "og:image:height", key: "og:image:height" },
];

const TWITTER_FIELDS: FieldDefinition[] = [
  { dataKey: "twitter:card", key: "twitter:card" },
  { dataKey: "twitter:title", key: "twitter:title" },
  { dataKey: "twitter:description", key: "twitter:description" },
  { dataKey: "twitter:image", isImage: true, key: "twitter:image" },
  { dataKey: "twitter:site", key: "twitter:site" },
  { dataKey: "twitter:creator", key: "twitter:creator" },
];

const isUrl = (url: string): boolean =>
  url.startsWith("http://") || url.startsWith("https://");

const renderThemeColorRow = (data: OgData): MetaTagRow => {
  const colors: string[] = [];
  if (data.themeColorLight) {
    colors.push(`${data.themeColorLight} (light)`);
  }
  if (data.themeColorDark) {
    colors.push(`${data.themeColorDark} (dark)`);
  }
  if (data.themeColor && !data.themeColorLight && !data.themeColorDark) {
    colors.push(data.themeColor);
  }

  return {
    key: "theme color",
    value: (
      <div className="space-y-1">
        {colors.map((color) => {
          const [colorValue] = color.split(" ");
          return (
            <div className="flex items-center gap-2" key={color}>
              <span
                className="size-4 shrink-0 rounded border"
                style={{ backgroundColor: colorValue }}
              />
              <span>{color}</span>
            </div>
          );
        })}
      </div>
    ),
  };
};

const buildTags = (
  fields: FieldDefinition[],
  data: OgData | null,
  isEditing: boolean,
  isGeneral = false
): MetaTagRow[] => {
  if (isEditing) {
    return fields.map((f) => ({
      dataKey: f.dataKey,
      imageUrl:
        f.isImage && data?.[f.dataKey]
          ? (data[f.dataKey] as string)
          : undefined,
      isImage: f.isImage,
      key: f.key,
      value: (data?.[f.dataKey] as string) || "",
    }));
  }

  const defaultTags = fields.slice(0, 6).map((f) => ({
    isImage: f.isImage,
    key: f.key,
    value: "—",
  }));

  if (!data) {
    return defaultTags;
  }

  const rows: MetaTagRow[] = [];

  for (const f of fields) {
    if (
      isGeneral &&
      f.key === "theme color" &&
      (data.themeColor || data.themeColorLight || data.themeColorDark)
    ) {
      rows.push(renderThemeColorRow(data));
      continue;
    }

    const val = data[f.dataKey];
    if (val) {
      rows.push({
        imageUrl: f.isImage ? (val as string) : undefined,
        isImage: f.isImage,
        key: f.key,
        value: val as string,
      });
    }
  }

  return rows.length > 0 ? rows : defaultTags;
};

interface TagRowProps {
  row: MetaTagRow;
  isLoading?: boolean;
  isEditing: boolean;
  updateTag: (key: keyof OgData, value: string) => void;
}

const TagRow = ({
  row,
  isLoading,
  isEditing,
  updateTag,
}: TagRowProps): ReactElement => {
  const { key, dataKey, value, isImage, imageUrl } = row;
  let content: React.ReactNode;

  if (isLoading) {
    content = <Skeleton className="h-4 w-3/4" />;
  } else if (isEditing && dataKey) {
    content = (
      <div className="space-y-2">
        <Input
          className="h-8 text-sm"
          onChange={(e) => updateTag(dataKey, e.target.value)}
          value={typeof value === "string" ? value : ""}
        />
        {isImage && imageUrl && (
          <div className="mt-2 flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded border bg-muted">
            <Image
              alt="Preview"
              className="h-full w-full object-cover"
              height={96}
              onError={(e) => {
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML =
                    '<span class="text-muted-foreground text-xs">Failed</span>';
                }
              }}
              src={imageUrl}
              width={96}
            />
          </div>
        )}
      </div>
    );
  } else if (isImage) {
    if (imageUrl) {
      const linkLabel =
        typeof value === "string" && value.length > 0 ? value : imageUrl;

      content = (
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded border bg-muted">
              <Image
                alt={linkLabel}
                className="h-full w-full object-cover"
                height={96}
                onError={(e) => {
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML =
                      '<span class="text-muted-foreground text-xs">Failed</span>';
                  }
                }}
                src={imageUrl}
                width={96}
              />
            </div>
            <a
              className="inline-flex items-center gap-1 break-all text-primary hover:underline"
              href={imageUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              {linkLabel}
              <ExternalLink aria-hidden="true" className="size-3 shrink-0" />
              <span className="sr-only">(opens in new tab)</span>
            </a>
          </div>
        </div>
      );
    } else {
      content = value;
    }
  } else if (typeof value === "string") {
    content = isUrl(value) ? (
      <a
        className="inline-flex items-center gap-1 text-primary hover:underline"
        href={value}
        rel="noopener noreferrer"
        target="_blank"
      >
        {value}
        <ExternalLink aria-hidden="true" className="size-3 shrink-0" />
        <span className="sr-only">(opens in new tab)</span>
      </a>
    ) : (
      value
    );
  } else {
    content = value;
  }

  return (
    <tr className="divide-x">
      <td className="w-40 whitespace-nowrap px-4 py-3 align-top font-medium text-primary text-sm">
        {key}
      </td>
      <td className="break-all px-4 py-3 text-muted-foreground text-sm">
        {content}
      </td>
    </tr>
  );
};

export const TagTable = ({
  data,
  category,
  isLoading,
}: TagTableProps): ReactElement => {
  const { isEditing, updateTag } = useOgStore();

  const tags = useMemo(() => {
    switch (category) {
      case "general": {
        return buildTags(GENERAL_FIELDS, data, isEditing, true);
      }
      case "openGraph": {
        return buildTags(OPEN_GRAPH_FIELDS, data, isEditing);
      }
      case "twitter": {
        return buildTags(TWITTER_FIELDS, data, isEditing);
      }
      default: {
        return [];
      }
    }
  }, [category, data, isEditing]);

  return (
    <div className="m-4 overflow-hidden rounded-lg border border-border">
      <table aria-label={`${category} meta tags`} className="w-full">
        <thead className="sr-only">
          <tr>
            <th scope="col">Property</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody className="divide-y rounded-lg">
          {tags.map((row) => (
            <TagRow
              isEditing={isEditing}
              isLoading={isLoading}
              key={`${category}-${row.key}`}
              row={row}
              updateTag={updateTag}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
