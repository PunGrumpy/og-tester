import type { OgData } from "../schemas/og";

type ScalarTag = Exclude<keyof OgData, "favicons" | "rawHead">;

export const GENERAL_TAG_FIELDS = [
  "title",
  "description",
  "author",
  "canonical",
  "robots",
  "keywords",
  "themeColor",
] as const satisfies readonly ScalarTag[];

export const OG_TAG_FIELDS = [
  "og:title",
  "og:description",
  "og:image",
  "og:url",
  "og:type",
  "og:site_name",
  "og:locale",
] as const satisfies readonly ScalarTag[];

export const TWITTER_TAG_FIELDS = [
  "twitter:card",
  "twitter:title",
  "twitter:description",
  "twitter:image",
  "twitter:site",
  "twitter:creator",
] as const satisfies readonly ScalarTag[];

export const TAG_FIELDS = [
  ...GENERAL_TAG_FIELDS,
  ...OG_TAG_FIELDS,
  ...TWITTER_TAG_FIELDS,
] as const;
