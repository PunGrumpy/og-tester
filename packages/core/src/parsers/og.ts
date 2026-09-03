import type { FaviconData, OgData } from "../schemas/og";

const TITLE_TAG_REGEX = /<title[^>]*>(?<g1>[^<]+)<\/title>/iu;

const HTML_LANG_REGEX = /<html[^>]*lang=["']?(?<g1>[^"'\s>]+)["']?/iu;
const CHARSET_META_REGEX = /<meta[^>]*charset=["']?(?<g1>[^"'\s>]+)["']?/iu;
const CHARSET_HTTP_EQUIV_REGEX =
  /<meta[^>]*http-equiv=["']?content-type["']?[^>]*content=["']?[^"'>]*charset=["']?(?<g1>[^"'\s>;]+)/iu;

const HEAD_CONTENT_REGEX = /<head[^>]*>(?<g1>[\s\S]*?)<\/head>/iu;

const THEME_MEDIA_REGEX = /\b(?<g1>dark|light)\b/u;

// A tag body is a run of unquoted characters or whole quoted strings, so a
// quote of one kind inside a value delimited by the other never ends the tag
// and the scanner never has to back up into a value it already read. Every
// alternative starts with a different character, which keeps matching linear
// on any input, including a `<meta` that appears inside an inline script.
const TAG_REGEX =
  /<(?<name>meta|link)\b(?<body>(?:[^>"']|"[^"]*"|'[^']*')*)>/giu;

const ATTRIBUTE_REGEX =
  /(?<name>[^\s"'<>/=]+)(?:\s*=\s*(?:"(?<double>[^"]*)"|'(?<single>[^']*)'|(?<bare>[^\s"'=<>`]+)))?/gu;

interface Tag {
  name: "meta" | "link";
  attributes: Map<string, string>;
}

const parseAttributes = (body: string): Map<string, string> => {
  const attributes = new Map<string, string>();
  for (const match of body.matchAll(ATTRIBUTE_REGEX)) {
    const { name, double, single, bare } = match.groups ?? {};
    if (!name) {
      continue;
    }
    const key = name.toLowerCase();
    if (attributes.has(key)) {
      continue;
    }
    attributes.set(key, double ?? single ?? bare ?? "");
  }
  return attributes;
};

const collectTags = (html: string): Tag[] => {
  const tags: Tag[] = [];
  for (const match of html.matchAll(TAG_REGEX)) {
    const { name, body } = match.groups ?? {};
    if (name === "meta" || name === "link") {
      tags.push({ attributes: parseAttributes(body ?? ""), name });
    }
  }
  return tags;
};

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

const attributeIs = (tag: Tag, attribute: string, value: string): boolean =>
  tag.attributes.get(attribute)?.toLowerCase() === value;

const findNamedMetaContent = (
  tags: Tag[],
  name: string
): string | undefined => {
  const tag = tags.find(
    (candidate) =>
      candidate.name === "meta" &&
      attributeIs(candidate, "name", name) &&
      candidate.attributes.has("content")
  );
  return tag?.attributes.get("content");
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

const applyDescription = (tags: Tag[], result: OgData): void => {
  const description = findNamedMetaContent(tags, "description");
  if (description !== undefined) {
    result.description = decodeHtmlEntities(description);
  }
};

const applyStandardMeta = (tags: Tag[], result: OgData): void => {
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
    const value = findNamedMetaContent(tags, metaName);
    if (value) {
      result[propName] = decodeHtmlEntities(value);
    }
  }
};

const applyPrefixedMeta = (
  tags: Tag[],
  result: OgData,
  prefix: "og:" | "twitter:",
  imageProperty: "og:image" | "twitter:image",
  baseOrigin?: string
): void => {
  for (const tag of tags) {
    if (tag.name !== "meta") {
      continue;
    }
    const property = [
      tag.attributes.get("property"),
      tag.attributes.get("name"),
    ].find((candidate) => candidate?.toLowerCase().startsWith(prefix));
    const content = tag.attributes.get("content");
    if (!property || !content) {
      continue;
    }
    const value = decodeHtmlEntities(content);
    result[property] =
      property === imageProperty ? resolveUrl(value, baseOrigin) : value;
  }
};

const applyThemeColors = (tags: Tag[], result: OgData): void => {
  for (const tag of tags) {
    if (tag.name !== "meta" || !attributeIs(tag, "name", "theme-color")) {
      continue;
    }
    const color = tag.attributes.get("content");
    if (color === undefined) {
      continue;
    }
    const theme = tag.attributes.get("media")?.match(THEME_MEDIA_REGEX)?.[1];
    if (theme === "dark") {
      result.themeColorDark = color;
    } else if (theme === "light") {
      result.themeColorLight = color;
    } else {
      result.themeColor = color;
    }
  }
};

const applyCanonical = (
  tags: Tag[],
  result: OgData,
  baseOrigin?: string
): void => {
  const canonical = tags.find(
    (tag) =>
      tag.name === "link" &&
      attributeIs(tag, "rel", "canonical") &&
      tag.attributes.has("href")
  );
  const href = canonical?.attributes.get("href");
  if (href !== undefined) {
    result.canonical = resolveUrl(href, baseOrigin);
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

const applyIcons = (tags: Tag[], result: OgData, baseOrigin?: string): void => {
  const favicons: FaviconData[] = [];

  for (const tag of tags) {
    const rel = tag.attributes.get("rel");
    const href = tag.attributes.get("href");
    if (
      tag.name !== "link" ||
      !rel?.toLowerCase().includes("icon") ||
      href === undefined
    ) {
      continue;
    }
    const favicon: FaviconData = {
      href: resolveUrl(href, baseOrigin),
      rel,
      sizes: tag.attributes.get("sizes"),
      type: tag.attributes.get("type"),
    };
    if (rel.toLowerCase() === "shortcut icon") {
      favicons.unshift(favicon);
    } else {
      favicons.push(favicon);
    }
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

  const tags = collectTags(html);

  applyTitle(html, result);
  applyDescription(tags, result);
  applyStandardMeta(tags, result);
  applyPrefixedMeta(tags, result, "og:", "og:image", baseOrigin);
  applyPrefixedMeta(tags, result, "twitter:", "twitter:image", baseOrigin);
  applyThemeColors(tags, result);
  applyCanonical(tags, result, baseOrigin);
  applyLang(html, result);
  applyCharset(html, result);
  applyRawHead(html, result);
  applyIcons(tags, result, baseOrigin);

  return result;
};
