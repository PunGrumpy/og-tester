import type { HTMLElement } from 'node-html-parser'

export const getAttribute = (
  element: HTMLElement | null,
  attr: string
): string | undefined => element?.getAttribute(attr) ?? undefined

export const getContent = (element: HTMLElement | null): string | undefined =>
  getAttribute(element, 'content')

export const getText = (element: HTMLElement | null): string | undefined =>
  element?.text ?? undefined

export const resolveUrl = (
  url: string | undefined,
  baseUrl: string
): string | undefined => {
  if (!url) {
    return
  }
  try {
    return new URL(url, baseUrl).toString()
  } catch {
    return
  }
}

export const createQueryHelpers = (root: HTMLElement, baseUrl: string) => {
  const select = (selector: string) => root.querySelector(selector)
  const selectAll = (selector: string) => root.querySelectorAll(selector)

  const getOg = (property: `og:${string}`) =>
    getContent(select(`meta[property='${property}']`))

  const getOgAll = (property: `og:${string}`) =>
    selectAll(`meta[property='${property}']`).map(getContent)

  const getTwitter = (name: `twitter:${string}`) =>
    getContent(select(`meta[name='${name}']`)) ??
    getContent(select(`meta[property='${name}']`))

  const getMeta = (name: string) => getContent(select(`meta[name='${name}']`))

  return {
    select,
    selectAll,
    getOg,
    getOgAll,
    getTwitter,
    getMeta,
    getAttribute,
    getContent,
    getText,
    resolveUrl: (url: string | undefined) => resolveUrl(url, baseUrl)
  }
}

export type QueryHelpers = ReturnType<typeof createQueryHelpers>
