import { Copy } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

type MetadataItemProps = {
  term: string
  value: string | undefined
}

export function MetadataItem({ term, value }: MetadataItemProps) {
  const copyToClipboard = () => {
    if (value) {
      navigator.clipboard.writeText(value)
      toast.success('Copied to clipboard')
    }
  }

  return (
    <div className="flex items-start justify-between">
      <div>
        <dt className="text-sm font-semibold text-muted-foreground">{term}</dt>
        <dd className="mt-1 text-sm">{value || 'Not specified'}</dd>
      </div>
      {value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="text-muted-foreground hover:text-primary"
        >
          <Copy className="size-4" />
          <span className="sr-only">Copy</span>
        </Button>
      )}
    </div>
  )
}
