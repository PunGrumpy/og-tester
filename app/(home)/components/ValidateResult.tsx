import { ViewAnimation } from '@/components/providers/ViewAnimation'
import { Badge } from '@/components/ui/badge'
import { validateMetadata } from '@/lib/utils'
import { MetadataAttributes } from '@/types/metadata'

interface ValidateResultProps {
  metadata: MetadataAttributes
  hasSearched: boolean
}

export const ValidateResult = ({
  metadata,
  hasSearched
}: ValidateResultProps) => {
  const errors = validateMetadata(metadata)

  if (!hasSearched || errors.length === 0) return null

  return (
    <section className="flex flex-wrap gap-2 p-4">
      {errors.map((error, index) => (
        <ViewAnimation
          key={index}
          initial={{ opacity: 0, translateY: -8 }}
          whileInView={{ opacity: 1, translateY: 0 }}
          delay={index * 0.2}
        >
          <Badge
            variant="outline"
            className="border-destructive bg-destructive/15 rounded-full px-3 py-2"
          >
            {error}
          </Badge>
        </ViewAnimation>
      ))}
    </section>
  )
}
