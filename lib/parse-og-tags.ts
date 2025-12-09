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

export type OgTags = {
  'twitter:image'?: string
  'twitter:card'?: string
  'twitter:title'?: string
  'twitter:description'?: string
  'twitter:site'?: string
  'twitter:creator'?: string
  title?: string
  description?: string
  'og:image'?: string
  'og:site_name'?: string
  'og:title'?: string
  'og:description'?: string
  'og:url'?: string
  'og:type'?: string
  'og:locale'?: string
  [key: string]: string | undefined
}

const decodeHtmlEntities = (text: string): string =>
  text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')

const applyTitle = (html: string, result: OgTags): void => {
  const titleMatch = html.match(TITLE_TAG_REGEX)
  if (titleMatch) {
    result.title = decodeHtmlEntities(titleMatch[1].trim())
  }
}

const applyDescription = (html: string, result: OgTags): void => {
  const descMatch =
    html.match(META_DESC_NAME_FIRST_REGEX) ||
    html.match(META_DESC_CONTENT_FIRST_REGEX)
  if (descMatch) {
    result.description = decodeHtmlEntities(descMatch[1])
  }
}

const applyOpenGraph = (html: string, result: OgTags): void => {
  for (const match of html.matchAll(OG_META_PROP_FIRST_REGEX)) {
    const [, property, content] = match
    if (property && content) {
      result[property] = decodeHtmlEntities(content)
    }
  }
  for (const match of html.matchAll(OG_META_CONTENT_FIRST_REGEX)) {
    const [, content, property] = match
    if (property && content) {
      result[property] = decodeHtmlEntities(content)
    }
  }
}

const applyTwitterCard = (html: string, result: OgTags): void => {
  for (const match of html.matchAll(TWITTER_META_PROP_FIRST_REGEX)) {
    const [, property, content] = match
    if (property && content) {
      result[property] = decodeHtmlEntities(content)
    }
  }
  for (const match of html.matchAll(TWITTER_META_CONTENT_FIRST_REGEX)) {
    const [, content, property] = match
    if (property && content) {
      result[property] = decodeHtmlEntities(content)
    }
  }
}

export const parseOgTags = (html: string): OgTags => {
  const result: OgTags = {}

  applyTitle(html, result)
  applyDescription(html, result)
  applyOpenGraph(html, result)
  applyTwitterCard(html, result)

  return result
}
