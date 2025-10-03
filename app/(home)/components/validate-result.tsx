import type { Metadata } from '@/app/api/og/route'
import { Badge } from '@/components/ui/badge'
import { analyzeSEO } from '@/lib/seo-analyzer'
import { cn } from '@/lib/utils'
import { ViewAnimation } from '@/providers/view-animation'
import { AlertCircle, AlertTriangle, Info } from 'lucide-react'

type ValidateResultProps = {
  metadata: Metadata
  hasSearched: boolean
}

export const ValidateResult = ({
  metadata,
  hasSearched
}: ValidateResultProps) => {
  if (!hasSearched) {
    return null
  }

  const seoIssues = analyzeSEO(metadata)

  if (seoIssues.length === 0) {
    return (
      <section className="space-y-4 p-8">
        <ViewAnimation
          initial={{ opacity: 0, translateY: -8 }}
          whileInView={{ opacity: 1, translateY: 0 }}
        >
          <Badge
            variant="outline"
            className="rounded-full border-success bg-success/15 px-3 py-2 text-success"
          >
            All metadata looks good!
          </Badge>
        </ViewAnimation>
      </section>
    )
  }

  const errorIssues = seoIssues.filter(issue => issue.severity === 'error')
  const warningIssues = seoIssues.filter(issue => issue.severity === 'warning')
  const infoIssues = seoIssues.filter(issue => issue.severity === 'info')

  return (
    <section className="space-y-4 p-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-medium text-xl">Metadata Analysis</h2>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-destructive bg-destructive/10 text-destructive-foreground"
          >
            {errorIssues.length} Errors
          </Badge>
          <Badge
            variant="outline"
            className="border-warning bg-warning/10 text-warning"
          >
            {warningIssues.length} Warnings
          </Badge>
          <Badge
            variant="outline"
            className="border-foreground bg-primary/10 text-foreground"
          >
            {infoIssues.length} Suggestions
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {seoIssues.map((issue, index) => (
          <ViewAnimation
            key={index}
            initial={{ opacity: 0, translateY: -8 }}
            whileInView={{ opacity: 1, translateY: 0 }}
            delay={index * 0.1}
          >
            <Badge
              variant="outline"
              className={cn(
                'flex items-center gap-1 rounded-full px-3 py-2',
                issue.severity === 'error' &&
                  'border-destructive bg-destructive/15 text-destructive-foreground',
                issue.severity === 'warning' &&
                  'border-warning bg-warning/10 text-warning',
                issue.severity === 'info' &&
                  'border-foreground bg-primary/10 text-foreground'
              )}
            >
              {issue.severity === 'error' && (
                <AlertCircle className="h-3 w-3 text-destructive" />
              )}
              {issue.severity === 'warning' && (
                <AlertTriangle className="h-3 w-3 text-warning" />
              )}
              {issue.severity === 'info' && (
                <Info className="h-3 w-3 text-foreground" />
              )}
              {issue.message}
            </Badge>
          </ViewAnimation>
        ))}
      </div>
    </section>
  )
}
