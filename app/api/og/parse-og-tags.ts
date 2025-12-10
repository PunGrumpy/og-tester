import type { OgData } from '@/lib/schemas/og'

const TITLE_TAG_REGEX = /<title[^>]*>([^<]+)<\/title>/i

const META_DESC_NAME_FIRST_REGEX =
  /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i

const META_DESC_CONTENT_FIRST_REGEX =
  /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i

const OG_META_PROP_FIRST_REGEX =
  /<meta[^>]*property=["'](og:[^"']+)["'][^>]*content=["']([^"']+)["'][^>]*>/gi

const OG_META_CONTENT_FIRST_REGEX =
  /<meta[^>]*content=["']([^"']+)["'][^>]*property=["'](og:[^"']+)["'][^>]*>/gi

const TWITTER_META_PROP_FIRST_REGEX =
  /<meta[^>]*(?:name|property)=["'](twitter:[^"']+)["'][^>]*content=["']([^"']+)["'][^>]*>/gi

const TWITTER_META_CONTENT_FIRST_REGEX =
  /<meta[^>]*content=["']([^"']+)["'][^>]*(?:name|property)=["'](twitter:[^"']+)["'][^>]*>/gi

const THEME_COLOR_REGEX =
  /<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["'][^>]*(?:media=["']([^"']+)["'])?[^>]*>/gi

const THEME_COLOR_REGEX_ALT =
  /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']theme-color["'][^>]*(?:media=["']([^"']+)["'])?[^>]*>/gi

const CANONICAL_LINK_REGEX =
  /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i

const HEAD_CONTENT_REGEX = /<head[^>]*>([\s\S]*?)<\/head>/i

const ICON_LINK_REGEX =
  /<link[^>]*rel=["']([^"']*icon[^"']*)["'][^>]*href=["']([^"']+)["'][^>]*>/gi

const ICON_LINK_REGEX_ALT =
  /<link[^>]*href=["']([^"']+)["'][^>]*rel=["']([^"']*icon[^"']*)["'][^>]*>/gi

const SHORTCUT_ICON_REGEX =
  /<link[^>]*rel=["']shortcut icon["'][^>]*href=["']([^"']+)["'][^>]*>/i

const APPLE_TOUCH_ICON_REGEX =
  /<link[^>]*rel=["'](apple-touch-icon[^"']*)["'][^>]*href=["']([^"']+)["'][^>]*>/gi

const ICON_TYPE_ATTR_REGEX = /type=["']([^"']+)["']/i
const ICON_SIZES_ATTR_REGEX = /sizes=["']([^"']+)["']/i

const decodeHtmlEntities = (text: string): string =>
  text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&nbsp;/g, ' ')

const getMetaContent = (
  html: string,
  name: string,
  attr: 'name' | 'property'
): string | null => {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex1 = new RegExp(
    `<meta[^>]*${attr}=["']${escapedName}["'][^>]*content=["']([^"']+)["'][^>]*>`,
    'i'
  )
  const regex2 = new RegExp(
    `<meta[^>]*content=["']([^"']+)["'][^>]*${attr}=["']${escapedName}["'][^>]*>`,
    'i'
  )

  const match1 = html.match(regex1)
  if (match1) {
    return match1[1]
  }

  const match2 = html.match(regex2)
  if (match2) {
    return match2[1]
  }

  return null
}

const resolveUrl = (url: string, baseOrigin?: string): string => {
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:')
  ) {
    return url
  }

  if (url.startsWith('//')) {
    return `https:${url}`
  }

  if (!baseOrigin) {
    return url
  }

  if (url.startsWith('/')) {
    return `${baseOrigin}${url}`
  }

  return `${baseOrigin}/${url}`
}

const applyTitle = (html: string, result: OgData): void => {
  const titleMatch = html.match(TITLE_TAG_REGEX)
  if (titleMatch) {
    result.title = decodeHtmlEntities(titleMatch[1].trim())
  }
}

const applyDescription = (html: string, result: OgData): void => {
  const descMatch =
    html.match(META_DESC_NAME_FIRST_REGEX) ||
    html.match(META_DESC_CONTENT_FIRST_REGEX)
  if (descMatch) {
    result.description = decodeHtmlEntities(descMatch[1])
  }
}

const applyStandardMeta = (html: string, result: OgData): void => {
  const nameMetaTags: Record<string, string> = {
    author: 'author',
    viewport: 'viewport',
    robots: 'robots',
    'application-name': 'applicationName',
    keywords: 'keywords',
    generator: 'generator',
    license: 'license',
    'color-scheme': 'colorScheme',
    'format-detection': 'formatDetection'
  }

  for (const [metaName, propName] of Object.entries(nameMetaTags)) {
    const value = getMetaContent(html, metaName, 'name')
    if (value) {
      result[propName] = decodeHtmlEntities(value)
    }
  }
}

const applyOpenGraph = (
  html: string,
  result: OgData,
  baseOrigin?: string
): void => {
  for (const match of html.matchAll(OG_META_PROP_FIRST_REGEX)) {
    const [, property, content] = match
    if (property && content) {
      const value =
        property === 'og:image'
          ? resolveUrl(decodeHtmlEntities(content), baseOrigin)
          : decodeHtmlEntities(content)
      result[property] = value
    }
  }
  for (const match of html.matchAll(OG_META_CONTENT_FIRST_REGEX)) {
    const [, content, property] = match
    if (property && content) {
      const value =
        property === 'og:image'
          ? resolveUrl(decodeHtmlEntities(content), baseOrigin)
          : decodeHtmlEntities(content)
      result[property] = value
    }
  }
}

const applyTwitterCard = (
  html: string,
  result: OgData,
  baseOrigin?: string
): void => {
  for (const match of html.matchAll(TWITTER_META_PROP_FIRST_REGEX)) {
    const [, property, content] = match
    if (property && content) {
      const value =
        property === 'twitter:image'
          ? resolveUrl(decodeHtmlEntities(content), baseOrigin)
          : decodeHtmlEntities(content)
      result[property] = value
    }
  }
  for (const match of html.matchAll(TWITTER_META_CONTENT_FIRST_REGEX)) {
    const [, content, property] = match
    if (property && content) {
      const value =
        property === 'twitter:image'
          ? resolveUrl(decodeHtmlEntities(content), baseOrigin)
          : decodeHtmlEntities(content)
      result[property] = value
    }
  }
}

const applyThemeColors = (html: string, result: OgData): void => {
  let themeMatch: RegExpExecArray | null

  THEME_COLOR_REGEX.lastIndex = 0
  THEME_COLOR_REGEX_ALT.lastIndex = 0

  themeMatch = THEME_COLOR_REGEX.exec(html)
  while (themeMatch !== null) {
    const color = themeMatch[1]
    const media = themeMatch[2]

    if (media?.includes('dark')) {
      result.themeColorDark = color
    } else if (media?.includes('light')) {
      result.themeColorLight = color
    } else {
      result.themeColor = color
    }

    themeMatch = THEME_COLOR_REGEX.exec(html)
  }

  themeMatch = THEME_COLOR_REGEX_ALT.exec(html)
  while (themeMatch !== null) {
    const color = themeMatch[1]
    const media = themeMatch[2]

    if (media?.includes('dark')) {
      result.themeColorDark = color
    } else if (media?.includes('light')) {
      result.themeColorLight = color
    } else {
      result.themeColor = color
    }

    themeMatch = THEME_COLOR_REGEX_ALT.exec(html)
  }
}

const applyCanonical = (
  html: string,
  result: OgData,
  baseOrigin?: string
): void => {
  const canonicalMatch = html.match(CANONICAL_LINK_REGEX)

  if (canonicalMatch) {
    result.canonical = resolveUrl(canonicalMatch[1], baseOrigin)
  }
}

const applyRawHead = (html: string, result: OgData): void => {
  const headMatch = html.match(HEAD_CONTENT_REGEX)
  if (headMatch) {
    result.rawHead = headMatch[1].trim()
  }
}

const applyIcons = (
  html: string,
  result: OgData,
  baseOrigin?: string
): void => {
  type FaviconData = {
    rel: string
    href: string
    type?: string
    sizes?: string
  }

  const favicons: FaviconData[] = []

  let iconMatch: RegExpExecArray | null

  ICON_LINK_REGEX.lastIndex = 0
  ICON_LINK_REGEX_ALT.lastIndex = 0
  APPLE_TOUCH_ICON_REGEX.lastIndex = 0

  iconMatch = ICON_LINK_REGEX.exec(html)
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (iconMatch !== null) {
    const rel = iconMatch[1]
    const href = resolveUrl(iconMatch[2], baseOrigin)
    const typeMatch = iconMatch[0].match(ICON_TYPE_ATTR_REGEX)
    const sizesMatch = iconMatch[0].match(ICON_SIZES_ATTR_REGEX)

    favicons.push({
      rel,
      href,
      type: typeMatch?.[1],
      sizes: sizesMatch?.[1]
    })

    iconMatch = ICON_LINK_REGEX.exec(html)
  }

  iconMatch = ICON_LINK_REGEX_ALT.exec(html)
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (iconMatch !== null) {
    const href = resolveUrl(iconMatch[1], baseOrigin)
    const rel = iconMatch[2]
    const typeMatch = iconMatch[0].match(ICON_TYPE_ATTR_REGEX)
    const sizesMatch = iconMatch[0].match(ICON_SIZES_ATTR_REGEX)

    favicons.push({
      rel,
      href,
      type: typeMatch?.[1],
      sizes: sizesMatch?.[1]
    })

    iconMatch = ICON_LINK_REGEX_ALT.exec(html)
  }

  const shortcutMatch = html.match(SHORTCUT_ICON_REGEX)

  if (shortcutMatch) {
    favicons.unshift({
      rel: 'shortcut icon',
      href: resolveUrl(shortcutMatch[1], baseOrigin)
    })
  }

  iconMatch = APPLE_TOUCH_ICON_REGEX.exec(html)
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (iconMatch !== null) {
    const sizesMatch = iconMatch[0].match(ICON_SIZES_ATTR_REGEX)
    favicons.push({
      rel: iconMatch[1],
      href: resolveUrl(iconMatch[2], baseOrigin),
      sizes: sizesMatch?.[1]
    })

    iconMatch = APPLE_TOUCH_ICON_REGEX.exec(html)
  }

  if (favicons.length > 0) {
    result.favicons = favicons
  }
}

export const parseOgTags = (html: string, pageUrl?: string): OgData => {
  const result: OgData = {}

  let baseOrigin: string | undefined

  if (pageUrl) {
    try {
      const url = new URL(pageUrl)
      baseOrigin = url.origin
    } catch {
      baseOrigin = undefined
    }
  }

  applyTitle(html, result)
  applyDescription(html, result)
  applyStandardMeta(html, result)
  applyOpenGraph(html, result, baseOrigin)
  applyTwitterCard(html, result, baseOrigin)
  applyThemeColors(html, result)
  applyCanonical(html, result, baseOrigin)
  applyRawHead(html, result)
  applyIcons(html, result, baseOrigin)

  return result
}
