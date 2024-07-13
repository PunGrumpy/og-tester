import { Copy } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

type MetadataItemProps = {
  term: string
  description: string | undefined
}

export function MetadataItem({ term, description }: MetadataItemProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  return (
    <div className="mb-2 flex items-center justify-between">
      <div>
        <dt className="text-sm font-semibold text-muted-foreground">{term}</dt>
        <dd className="mt-1 text-sm">{description || 'Not specified'}</dd>
      </div>
      {description && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => copyToClipboard(description)}
        >
          <Copy className="size-4" />
          <span className="sr-only">Copy</span>
        </Button>
      )}
    </div>
  )
}
