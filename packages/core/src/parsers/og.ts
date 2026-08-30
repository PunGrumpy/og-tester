import type { OgData } from "../schemas/og";

const TITLE_TAG_REGEX = /<title[^>]*>(?<g1>[^<]+)<\/title>/iu;

const HTML_LANG_REGEX = /<html[^>]*lang=["']?(?<g1>[^"'\s>]+)["']?/iu;
const CHARSET_META_REGEX = /<meta[^>]*charset=["']?(?<g1>[^"'\s>]+)["']?/iu;
const CHARSET_HTTP_EQUIV_REGEX =
  /<meta[^>]*http-equiv=["']?content-type["']?[^>]*content=["']?[^"'>]*charset=["']?(?<g1>[^"'\s>;]+)/iu;

const META_DESC_NAME_FIRST_REGEX =
  /<meta[^>]*name=["']description["'][^>]*content=(?<q1>["'])(?<g1>.*?)\k<q1>[^>]*>/iu;

const META_DESC_CONTENT_FIRST_REGEX =
  /<meta[^>]*content=(?<q1>["'])(?<g1>.*?)\k<q1>[^>]*name=["']description["'][^>]*>/iu;

const OG_META_PROP_FIRST_REGEX =
  /<meta[^>]*property=(?<q1>["'])(?<g1>og:[^"']+)\k<q1>[^>]*content=(?<q2>["'])(?<g2>.*?)\k<q2>[^>]*>/giu;

const OG_META_CONTENT_FIRST_REGEX =
  /<meta[^>]*content=(?<q1>["'])(?<g1>.*?)\k<q1>[^>]*property=(?<q2>["'])(?<g2>og:[^"']+)\k<q2>[^>]*>/giu;

const TWITTER_META_PROP_FIRST_REGEX =
  /<meta[^>]*(?:name|property)=(?<q1>["'])(?<g1>twitter:[^"']+)\k<q1>[^>]*content=(?<q2>["'])(?<g2>.*?)\k<q2>[^>]*>/giu;

const TWITTER_META_CONTENT_FIRST_REGEX =
  /<meta[^>]*content=(?<q1>["'])(?<g1>.*?)\k<q1>[^>]*(?:name|property)=(?<q2>["'])(?<g2>twitter:[^"']+)\k<q2>[^>]*>/giu;

const THEME_COLOR_REGEX =
  /<meta[^>]*name=["']theme-color["'][^>]*content=(?<q1>["'])(?<g1>.*?)\k<q1>[^>]*(?:media=(?<q2>["'])(?<g2>.*?)\k<q2>)?[^>]*>/giu;

const THEME_COLOR_REGEX_ALT =
  /<meta[^>]*content=(?<q1>["'])(?<g1>.*?)\k<q1>[^>]*name=["']theme-color["'][^>]*(?:media=(?<q2>["'])(?<g2>.*?)\k<q2>)?[^>]*>/giu;

const THEME_MEDIA_REGEX = /\b(?<g1>dark|light)\b/u;

const CANONICAL_LINK_REGEX =
  /<link[^>]*rel=["']canonical["'][^>]*href=(?<q1>["'])(?<g1>.*?)\k<q1>[^>]*>/iu;

const HEAD_CONTENT_REGEX = /<head[^>]*>(?<g1>[\s\S]*?)<\/head>/iu;

const ICON_LINK_REGEX =
  /<link[^>]*rel=(?<q1>["'])(?<g1>.*?icon.*?)\k<q1>[^>]*href=(?<q2>["'])(?<g2>.*?)\k<q2>[^>]*>/giu;

const ICON_LINK_REGEX_ALT =
  /<link[^>]*href=(?<q1>["'])(?<g1>.*?)\k<q1>[^>]*rel=(?<q2>["'])(?<g2>.*?icon.*?)\k<q2>[^>]*>/giu;

const SHORTCUT_ICON_REGEX =
  /<link[^>]*rel=["']shortcut icon["'][^>]*href=(?<q1>["'])(?<g1>.*?)\k<q1>[^>]*>/iu;

const APPLE_TOUCH_ICON_REGEX =
  /<link[^>]*rel=(?<q1>["'])(?<g1>apple-touch-icon.*?)\k<q1>[^>]*href=(?<q2>["'])(?<g2>.*?)\k<q2>[^>]*>/giu;

const ICON_TYPE_ATTR_REGEX = /type=["'](?<g1>[^"']+)["']/iu;
const ICON_SIZES_ATTR_REGEX = /sizes=["'](?<g1>[^"']+)["']/iu;

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  copy: "©",
  gt: ">",
  hellip: "…",
  ldquo: "“",
  lsquo: "‘",
  lt: "<",
  mdash: "—",
  nbsp: " ",
  ndash: "–",
  quot: '"',
  rdquo: "”",
  reg: "®",
  rsquo: "’",
  trade: "™",
};

const ENTITY_REGEX =
  /&(?:#x(?<hex>[0-9a-f]{1,6})|#(?<dec>\d{1,7})|(?<named>[a-z]{2,31}));/giu;

const MAX_CODE_POINT = 0x10_ff_ff;

const decodeHtmlEntities = (text: string): string =>
  text.replace(ENTITY_REGEX, (match, ...rest) => {
    const groups = rest.at(-1) as Record<string, string | undefined>;
    if (groups.hex !== undefined || groups.dec !== undefined) {
      const codePoint =
        groups.hex === undefined
          ? Number(groups.dec as string)
          : Number.parseInt(groups.hex, 16);
      return codePoint > 0 && codePoint <= MAX_CODE_POINT
        ? String.fromCodePoint(codePoint)
        : match;
    }
    return NAMED_ENTITIES[(groups.named as string).toLowerCase()] ?? match;
  });

const getMetaContent = (
  html: string,
  name: string,
  attr: "name" | "property"
): string | null => {
  const escapedName = name.replaceAll(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const regex1 = new RegExp(
    `<meta[^>]*${attr}=["']${escapedName}["'][^>]*content=(?<q>["'])(?<content>.*?)\\k<q>[^>]*>`,
    "iu"
  );
  const regex2 = new RegExp(
    `<meta[^>]*content=(?<q>["'])(?<content>.*?)\\k<q>[^>]*${attr}=["']${escapedName}["'][^>]*>`,
    "iu"
  );

  const match1 = html.match(regex1);
  if (match1?.groups?.content !== undefined) {
    return match1.groups.content;
  }

  const match2 = html.match(regex2);
  if (match2?.groups?.content !== undefined) {
    return match2.groups.content;
  }

  return null;
};

const resolveUrl = (rawUrl: string, baseOrigin?: string): string => {
  // Attribute values carry whatever whitespace the author's formatter left in
  // them, and a meta tag on its own line is ordinary. Untrimmed, a trailing
  // newline survives all the way to the consumer's <img>, and a leading one
  // defeats every prefix test below — turning an absolute URL into
  // `${baseOrigin}/ https://…`.
  const url = rawUrl.trim();

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  if (!baseOrigin) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${baseOrigin}${url}`;
  }

  return `${baseOrigin}/${url}`;
};

const applyTitle = (html: string, result: OgData): void => {
  const titleMatch = html.match(TITLE_TAG_REGEX);
  if (titleMatch) {
    result.title = decodeHtmlEntities(titleMatch[1].trim());
  }
};

const applyDescription = (html: string, result: OgData): void => {
  const descMatch =
    html.match(META_DESC_NAME_FIRST_REGEX) ||
    html.match(META_DESC_CONTENT_FIRST_REGEX);
  if (descMatch?.groups?.g1 !== undefined) {
    result.description = decodeHtmlEntities(descMatch.groups.g1);
  }
};

const applyStandardMeta = (html: string, result: OgData): void => {
  const nameMetaTags: Record<string, string> = {
    "application-name": "applicationName",
    author: "author",
    "color-scheme": "colorScheme",
    "format-detection": "formatDetection",
    generator: "generator",
    keywords: "keywords",
    license: "license",
    robots: "robots",
    viewport: "viewport",
  };

  for (const [metaName, propName] of Object.entries(nameMetaTags)) {
    const value = getMetaContent(html, metaName, "name");
    if (value) {
      result[propName] = decodeHtmlEntities(value);
    }
  }
};

const applyOpenGraph = (
  html: string,
  result: OgData,
  baseOrigin?: string
): void => {
  for (const match of html.matchAll(OG_META_PROP_FIRST_REGEX)) {
    const { g1: property, g2: content } = match.groups ?? {};
    if (property && content) {
      const value =
        property === "og:image"
          ? resolveUrl(decodeHtmlEntities(content), baseOrigin)
          : decodeHtmlEntities(content);
      result[property] = value;
    }
  }
  for (const match of html.matchAll(OG_META_CONTENT_FIRST_REGEX)) {
    const { g1: content, g2: property } = match.groups ?? {};
    if (property && content) {
      const value =
        property === "og:image"
          ? resolveUrl(decodeHtmlEntities(content), baseOrigin)
          : decodeHtmlEntities(content);
      result[property] = value;
    }
  }
};

const applyTwitterCard = (
  html: string,
  result: OgData,
  baseOrigin?: string
): void => {
  for (const match of html.matchAll(TWITTER_META_PROP_FIRST_REGEX)) {
    const { g1: property, g2: content } = match.groups ?? {};
    if (property && content) {
      const value =
        property === "twitter:image"
          ? resolveUrl(decodeHtmlEntities(content), baseOrigin)
          : decodeHtmlEntities(content);
      result[property] = value;
    }
  }
  for (const match of html.matchAll(TWITTER_META_CONTENT_FIRST_REGEX)) {
    const { g1: content, g2: property } = match.groups ?? {};
    if (property && content) {
      const value =
        property === "twitter:image"
          ? resolveUrl(decodeHtmlEntities(content), baseOrigin)
          : decodeHtmlEntities(content);
      result[property] = value;
    }
  }
};

const applyThemeColors = (html: string, result: OgData): void => {
  let themeMatch: RegExpExecArray | null;

  THEME_COLOR_REGEX.lastIndex = 0;
  THEME_COLOR_REGEX_ALT.lastIndex = 0;

  themeMatch = THEME_COLOR_REGEX.exec(html);
  while (themeMatch !== null) {
    const { g1: color, g2: media } = themeMatch.groups ?? {};
    const theme =
      typeof media === "string"
        ? media.match(THEME_MEDIA_REGEX)?.[1]
        : undefined;

    if (theme === "dark") {
      result.themeColorDark = color;
    } else if (theme === "light") {
      result.themeColorLight = color;
    } else {
      result.themeColor = color;
    }

    themeMatch = THEME_COLOR_REGEX.exec(html);
  }

  themeMatch = THEME_COLOR_REGEX_ALT.exec(html);
  while (themeMatch !== null) {
    const { g1: color, g2: media } = themeMatch.groups ?? {};
    const theme =
      typeof media === "string"
        ? media.match(THEME_MEDIA_REGEX)?.[1]
        : undefined;

    if (theme === "dark") {
      result.themeColorDark = color;
    } else if (theme === "light") {
      result.themeColorLight = color;
    } else {
      result.themeColor = color;
    }

    themeMatch = THEME_COLOR_REGEX_ALT.exec(html);
  }
};

const applyCanonical = (
  html: string,
  result: OgData,
  baseOrigin?: string
): void => {
  const canonicalMatch = html.match(CANONICAL_LINK_REGEX);

  if (canonicalMatch?.groups?.g1 !== undefined) {
    result.canonical = resolveUrl(canonicalMatch.groups.g1, baseOrigin);
  }
};

const applyLang = (html: string, result: OgData): void => {
  const langMatch = html.match(HTML_LANG_REGEX);
  if (langMatch) {
    result.lang = decodeHtmlEntities(langMatch[1]);
  }
};

const applyCharset = (html: string, result: OgData): void => {
  const charsetMatch =
    html.match(CHARSET_META_REGEX) || html.match(CHARSET_HTTP_EQUIV_REGEX);
  if (charsetMatch) {
    result.charset = decodeHtmlEntities(charsetMatch[1]);
  }
};

const applyRawHead = (html: string, result: OgData): void => {
  const headMatch = html.match(HEAD_CONTENT_REGEX);
  if (headMatch) {
    result.rawHead = headMatch[1].trim();
  }
};

interface FaviconData {
  rel: string;
  href: string;
  type?: string;
  sizes?: string;
}

const buildFavicon = (
  rel: string | undefined,
  rawHref: string | undefined,
  baseOrigin: string | undefined,
  type: string | undefined,
  sizes: string | undefined
): FaviconData | null => {
  if (!rel || rawHref === undefined) {
    return null;
  }

  return {
    href: resolveUrl(rawHref, baseOrigin),
    rel,
    sizes,
    type,
  };
};

const applyIcons = (
  html: string,
  result: OgData,
  baseOrigin?: string
): void => {
  const favicons: FaviconData[] = [];

  let iconMatch: RegExpExecArray | null;

  ICON_LINK_REGEX.lastIndex = 0;
  ICON_LINK_REGEX_ALT.lastIndex = 0;
  APPLE_TOUCH_ICON_REGEX.lastIndex = 0;

  iconMatch = ICON_LINK_REGEX.exec(html);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (iconMatch !== null) {
    const [fullMatch] = iconMatch;
    const { g1: rel, g2: rawHref } = iconMatch.groups ?? {};
    const favicon = buildFavicon(
      rel,
      rawHref,
      baseOrigin,
      fullMatch.match(ICON_TYPE_ATTR_REGEX)?.[1],
      fullMatch.match(ICON_SIZES_ATTR_REGEX)?.[1]
    );

    if (favicon) {
      favicons.push(favicon);
    }

    iconMatch = ICON_LINK_REGEX.exec(html);
  }

  iconMatch = ICON_LINK_REGEX_ALT.exec(html);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (iconMatch !== null) {
    const [fullMatch] = iconMatch;
    const { g1: rawHref, g2: rel } = iconMatch.groups ?? {};
    const favicon = buildFavicon(
      rel,
      rawHref,
      baseOrigin,
      fullMatch.match(ICON_TYPE_ATTR_REGEX)?.[1],
      fullMatch.match(ICON_SIZES_ATTR_REGEX)?.[1]
    );

    if (favicon) {
      favicons.push(favicon);
    }

    iconMatch = ICON_LINK_REGEX_ALT.exec(html);
  }

  const shortcutMatch = html.match(SHORTCUT_ICON_REGEX);

  if (shortcutMatch?.groups?.g1 !== undefined) {
    favicons.unshift({
      href: resolveUrl(shortcutMatch.groups.g1, baseOrigin),
      rel: "shortcut icon",
    });
  }

  iconMatch = APPLE_TOUCH_ICON_REGEX.exec(html);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (iconMatch !== null) {
    const { g1: rel, g2: rawHref } = iconMatch.groups ?? {};
    const favicon = buildFavicon(
      rel,
      rawHref,
      baseOrigin,
      undefined,
      iconMatch[0].match(ICON_SIZES_ATTR_REGEX)?.[1]
    );

    if (favicon) {
      favicons.push(favicon);
    }

    iconMatch = APPLE_TOUCH_ICON_REGEX.exec(html);
  }

  if (favicons.length > 0) {
    result.favicons = favicons;
  }
};

export const parseOgTags = (html: string, pageUrl?: string): OgData => {
  const result: OgData = {};

  let baseOrigin: string | undefined;

  if (pageUrl) {
    try {
      const url = new URL(pageUrl);
      baseOrigin = url.origin;
    } catch {
      baseOrigin = undefined;
    }
  }

  applyTitle(html, result);
  applyDescription(html, result);
  applyStandardMeta(html, result);
  applyOpenGraph(html, result, baseOrigin);
  applyTwitterCard(html, result, baseOrigin);
  applyThemeColors(html, result);
  applyCanonical(html, result, baseOrigin);
  applyLang(html, result);
  applyCharset(html, result);
  applyRawHead(html, result);
  applyIcons(html, result, baseOrigin);

  return result;
};
