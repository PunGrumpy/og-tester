import { Metadata } from '@/app/api/og/route'
import { ViewAnimation } from '@/components/providers/ViewAnimation'
import { Badge } from '@/components/ui/badge'

interface ValidateResultProps {
  metadata: Metadata
  hasSearched: boolean
}

function analyzeSEO(metadata: Metadata): string[] {
  const issues: string[] = []

  if (!metadata.ogTitle) issues.push('Missing og:title')
  if (!metadata.ogDescription) issues.push('Missing og:description')
  if (!metadata.ogImage) issues.push('Missing og:image')

  if (metadata.ogTitle && metadata.ogTitle.length > 60) {
    issues.push('og:title is too long (should be under 60 characters)')
  }

  if (metadata.ogDescription && metadata.ogDescription.length > 160) {
    issues.push('og:description is too long (should be under 160 characters)')
  }

  if (!metadata.twitterCard) issues.push('Missing twitter:card')
  if (!metadata.twitterTitle) issues.push('Missing twitter:title')
  if (!metadata.twitterDescription) issues.push('Missing twitter:description')
  if (!metadata.twitterImage) issues.push('Missing twitter:image')

  return issues
}

export const ValidateResult: React.FC<ValidateResultProps> = ({
  metadata,
  hasSearched
}) => {
  const seoIssues = analyzeSEO(metadata)

  if (!hasSearched || seoIssues.length === 0) return null

  return (
    <section className="space-y-4 p-4">
      <div className="flex flex-wrap gap-2">
        {seoIssues.map((issue, index) => (
          <ViewAnimation
            key={index}
            initial={{ opacity: 0, translateY: -8 }}
            whileInView={{ opacity: 1, translateY: 0 }}
            delay={index * 0.2}
          >
            <Badge
              variant="outline"
              className="border-warning bg-warning/15 text-warning-foreground rounded-full px-3 py-2"
            >
              {issue}
            </Badge>
          </ViewAnimation>
        ))}
      </div>
    </section>
  )
}
