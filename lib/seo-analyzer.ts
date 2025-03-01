import type { Metadata } from '@/app/api/og/route'

export interface SEOIssue {
  severity: 'error' | 'warning' | 'info'
  message: string
  recommendation: string
}

export function analyzeSEO(metadata: Metadata): SEOIssue[] {
  const issues: SEOIssue[] = []

  // Title checks
  if (!metadata.ogTitle) {
    issues.push({
      severity: 'error',
      message: 'Missing og:title',
      recommendation:
        'Add an Open Graph title tag to improve social sharing appearance'
    })
  } else if (metadata.ogTitle.length > 60) {
    issues.push({
      severity: 'warning',
      message: 'og:title is too long (should be under 60 characters)',
      recommendation:
        'Keep the title brief for optimal display on social platforms'
    })
  } else if (metadata.ogTitle.length < 10 && metadata.ogTitle.length > 0) {
    issues.push({
      severity: 'warning',
      message: 'og:title is too short (should be at least 10 characters)',
      recommendation: 'Make the title more descriptive for better engagement'
    })
  }

  // Description checks
  if (!metadata.ogDescription) {
    issues.push({
      severity: 'error',
      message: 'Missing og:description',
      recommendation:
        'Add an Open Graph description to improve social sharing appearance'
    })
  } else if (metadata.ogDescription.length > 160) {
    issues.push({
      severity: 'warning',
      message: 'og:description is too long (should be under 160 characters)',
      recommendation:
        'Keep the description concise for optimal display on social platforms'
    })
  } else if (
    metadata.ogDescription.length < 50 &&
    metadata.ogDescription.length > 0
  ) {
    issues.push({
      severity: 'info',
      message:
        'og:description is relatively short (should be at least 50 characters)',
      recommendation: 'Consider making the description more informative'
    })
  }

  // Image checks
  if (!metadata.ogImage) {
    issues.push({
      severity: 'error',
      message: 'Missing og:image',
      recommendation:
        'Add an Open Graph image to significantly improve engagement on social platforms'
    })
  }

  // URL checks
  if (!metadata.ogUrl) {
    issues.push({
      severity: 'warning',
      message: 'Missing og:url',
      recommendation:
        'Add the canonical URL as og:url to prevent duplicate content issues'
    })
  }

  // Facebook-specific checks
  if (!metadata.ogSiteName) {
    issues.push({
      severity: 'info',
      message: 'Missing og:site_name',
      recommendation: 'Add og:site_name to improve branding on Facebook shares'
    })
  }

  if (!metadata.ogType) {
    issues.push({
      severity: 'info',
      message: 'Missing og:type',
      recommendation:
        'Specify the type of content (e.g., "website", "article") for better classification'
    })
  }

  // Twitter-specific checks
  if (!metadata.twitterCard) {
    issues.push({
      severity: 'warning',
      message: 'Missing twitter:card',
      recommendation:
        'Add twitter:card to control how your content appears on Twitter'
    })
  }

  if (!metadata.twitterTitle && !metadata.ogTitle) {
    issues.push({
      severity: 'warning',
      message: 'Missing twitter:title and og:title',
      recommendation:
        'Add twitter:title or ensure og:title is present as a fallback'
    })
  }

  if (!metadata.twitterDescription && !metadata.ogDescription) {
    issues.push({
      severity: 'warning',
      message: 'Missing twitter:description and og:description',
      recommendation:
        'Add twitter:description or ensure og:description is present as a fallback'
    })
  }

  if (!metadata.twitterImage && !metadata.ogImage) {
    issues.push({
      severity: 'warning',
      message: 'Missing twitter:image and og:image',
      recommendation:
        'Add twitter:image or ensure og:image is present as a fallback'
    })
  }

  // Additional checks
  if (
    metadata.ogTitle &&
    metadata.twitterTitle &&
    metadata.ogTitle !== metadata.twitterTitle
  ) {
    issues.push({
      severity: 'info',
      message: 'Different titles for OpenGraph and Twitter',
      recommendation:
        'Consider using consistent titles across platforms for brand consistency'
    })
  }

  if (
    metadata.ogDescription &&
    metadata.twitterDescription &&
    metadata.ogDescription !== metadata.twitterDescription
  ) {
    issues.push({
      severity: 'info',
      message: 'Different descriptions for OpenGraph and Twitter',
      recommendation:
        'Consider using consistent descriptions across platforms for brand consistency'
    })
  }

  return issues
}
