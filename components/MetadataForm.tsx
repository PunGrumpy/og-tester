import { Share2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type MetadataFormProps = {
  url: string
  setUrl: (url: string) => void
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
}

export function MetadataForm({
  url,
  setUrl,
  onSubmit,
  loading
}: MetadataFormProps) {
  return (
    <div>
      <form onSubmit={onSubmit} className="mb-4 flex space-x-2">
        <Input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={e => setUrl(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Test'}
        </Button>
      </form>
    </div>
  )
}
