import { Copy } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

type MetadataItemProps = {
  term: string
  value: string | undefined
}

export function MetadataItem({ term, value }: MetadataItemProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  return (
    <div className="mb-2 flex items-start justify-between">
      <div className="grow">
        <dt className="text-sm font-semibold text-muted-foreground">{term}</dt>
        <dd className="mt-1 break-all text-sm">{value || 'Not specified'}</dd>
      </div>
      {value && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => copyToClipboard(value)}
          className="ml-2 shrink-0"
        >
          <Copy className="size-4" />
          <span className="sr-only">Copy</span>
        </Button>
      )}
    </div>
  )
}
