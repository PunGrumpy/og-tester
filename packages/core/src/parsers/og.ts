import type { OgData } from "../schemas/og";

const TITLE_TAG_REGEX = /<title[^>]*>([^<]+)<\/title>/iu;

const HTML_LANG_REGEX = /<html[^>]*lang=["']?([^"'\s>]+)["']?/iu;
const CHARSET_META_REGEX = /<meta[^>]*charset=["']?([^"'\s>]+)["']?/iu;
const CHARSET_HTTP_EQUIV_REGEX =
  /<meta[^>]*http-equiv=["']?content-type["']?[^>]*content=["']?[^"'>]*charset=["']?([^"'\s>;]+)/iu;

const META_DESC_NAME_FIRST_REGEX =
  /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/iu;

const META_DESC_CONTENT_FIRST_REGEX =
  /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/iu;

const OG_META_PROP_FIRST_REGEX =
  /<meta[^>]*property=["'](og:[^"']+)["'][^>]*content=["']([^"']+)["'][^>]*>/giu;

const OG_META_CONTENT_FIRST_REGEX =
  /<meta[^>]*content=["']([^"']+)["'][^>]*property=["'](og:[^"']+)["'][^>]*>/giu;

const TWITTER_META_PROP_FIRST_REGEX =
  /<meta[^>]*(?:name|property)=["'](twitter:[^"']+)["'][^>]*content=["']([^"']+)["'][^>]*>/giu;

const TWITTER_META_CONTENT_FIRST_REGEX =
  /<meta[^>]*content=["']([^"']+)["'][^>]*(?:name|property)=["'](twitter:[^"']+)["'][^>]*>/giu;

const THEME_COLOR_REGEX =
  /<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["'][^>]*(?:media=["']([^"']+)["'])?[^>]*>/giu;

const THEME_COLOR_REGEX_ALT =
  /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']theme-color["'][^>]*(?:media=["']([^"']+)["'])?[^>]*>/giu;

const THEME_MEDIA_REGEX = /\b(dark|light)\b/u;

const CANONICAL_LINK_REGEX =
  /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/iu;

const HEAD_CONTENT_REGEX = /<head[^>]*>([\s\S]*?)<\/head>/iu;

const ICON_LINK_REGEX =
  /<link[^>]*rel=["']([^"']*icon[^"']*)["'][^>]*href=["']([^"']+)["'][^>]*>/giu;

const ICON_LINK_REGEX_ALT =
  /<link[^>]*href=["']([^"']+)["'][^>]*rel=["']([^"']*icon[^"']*)["'][^>]*>/giu;

const SHORTCUT_ICON_REGEX =
  /<link[^>]*rel=["']shortcut icon["'][^>]*href=["']([^"']+)["'][^>]*>/iu;

const APPLE_TOUCH_ICON_REGEX =
  /<link[^>]*rel=["'](apple-touch-icon[^"']*)["'][^>]*href=["']([^"']+)["'][^>]*>/giu;

const ICON_TYPE_ATTR_REGEX = /type=["']([^"']+)["']/iu;
const ICON_SIZES_ATTR_REGEX = /sizes=["']([^"']+)["']/iu;

const decodeHtmlEntities = (text: string): string =>
  text
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&#x27;", "'")
    .replaceAll("&#x2F;", "/")
    .replaceAll("&nbsp;", " ");

const getMetaContent = (
  html: string,
  name: string,
  attr: "name" | "property"
): string | null => {
  const escapedName = name.replaceAll(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const regex1 = new RegExp(
    `<meta[^>]*${attr}=["']${escapedName}["'][^>]*content=["']([^"']+)["'][^>]*>`,
    "iu"
  );
  const regex2 = new RegExp(
    `<meta[^>]*content=["']([^"']+)["'][^>]*${attr}=["']${escapedName}["'][^>]*>`,
    "iu"
  );

  const match1 = html.match(regex1);
  if (match1) {
    return match1[1];
  }

  const match2 = html.match(regex2);
  if (match2) {
    return match2[1];
  }

  return null;
};

const resolveUrl = (url: string, baseOrigin?: string): string => {
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
  if (descMatch) {
    result.description = decodeHtmlEntities(descMatch[1]);
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
    const [, property, content] = match;
    if (property && content) {
      const value =
        property === "og:image"
          ? resolveUrl(decodeHtmlEntities(content), baseOrigin)
          : decodeHtmlEntities(content);
      result[property] = value;
    }
  }
  for (const match of html.matchAll(OG_META_CONTENT_FIRST_REGEX)) {
    const [, content, property] = match;
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
    const [, property, content] = match;
    if (property && content) {
      const value =
        property === "twitter:image"
          ? resolveUrl(decodeHtmlEntities(content), baseOrigin)
          : decodeHtmlEntities(content);
      result[property] = value;
    }
  }
  for (const match of html.matchAll(TWITTER_META_CONTENT_FIRST_REGEX)) {
    const [, content, property] = match;
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
    const [, color, media] = themeMatch;
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
    const [, color, media] = themeMatch;
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

  if (canonicalMatch) {
    result.canonical = resolveUrl(canonicalMatch[1], baseOrigin);
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

const applyIcons = (
  html: string,
  result: OgData,
  baseOrigin?: string
): void => {
  interface FaviconData {
    rel: string;
    href: string;
    type?: string;
    sizes?: string;
  }

  const favicons: FaviconData[] = [];

  let iconMatch: RegExpExecArray | null;

  ICON_LINK_REGEX.lastIndex = 0;
  ICON_LINK_REGEX_ALT.lastIndex = 0;
  APPLE_TOUCH_ICON_REGEX.lastIndex = 0;

  iconMatch = ICON_LINK_REGEX.exec(html);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (iconMatch !== null) {
    const [fullMatch, rel, rawHref] = iconMatch;
    const href = resolveUrl(rawHref, baseOrigin);
    const typeMatch = fullMatch.match(ICON_TYPE_ATTR_REGEX);
    const sizesMatch = fullMatch.match(ICON_SIZES_ATTR_REGEX);

    favicons.push({
      href,
      rel,
      sizes: sizesMatch?.[1],
      type: typeMatch?.[1],
    });

    iconMatch = ICON_LINK_REGEX.exec(html);
  }

  iconMatch = ICON_LINK_REGEX_ALT.exec(html);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (iconMatch !== null) {
    const [fullMatch, rawHref, rel] = iconMatch;
    const href = resolveUrl(rawHref, baseOrigin);
    const typeMatch = fullMatch.match(ICON_TYPE_ATTR_REGEX);
    const sizesMatch = fullMatch.match(ICON_SIZES_ATTR_REGEX);

    favicons.push({
      href,
      rel,
      sizes: sizesMatch?.[1],
      type: typeMatch?.[1],
    });

    iconMatch = ICON_LINK_REGEX_ALT.exec(html);
  }

  const shortcutMatch = html.match(SHORTCUT_ICON_REGEX);

  if (shortcutMatch) {
    favicons.unshift({
      href: resolveUrl(shortcutMatch[1], baseOrigin),
      rel: "shortcut icon",
    });
  }

  iconMatch = APPLE_TOUCH_ICON_REGEX.exec(html);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (iconMatch !== null) {
    const sizesMatch = iconMatch[0].match(ICON_SIZES_ATTR_REGEX);
    favicons.push({
      href: resolveUrl(iconMatch[2], baseOrigin),
      rel: iconMatch[1],
      sizes: sizesMatch?.[1],
    });

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
