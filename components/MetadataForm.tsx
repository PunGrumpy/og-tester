import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type MetadataFormProps = {
  url: string
  setUrl: (url: string) => void
  onSubmit: (e: React.FormEvent, processedUrl: string) => void
  loading: boolean
}

export function MetadataForm({
  url,
  setUrl,
  onSubmit,
  loading
}: MetadataFormProps) {
  const [inputValue, setInputValue] = useState(url)

  const processUrl = (input: string): string => {
    let processedUrl = input.trim()

    if (!/^https?:\/\//i.test(processedUrl)) {
      processedUrl = 'https://' + processedUrl
    }

    if (!/\.[a-z]{2,}$/i.test(processedUrl)) {
      processedUrl += '.com'
    }

    return processedUrl
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const processedUrl = processUrl(inputValue)
    setUrl(processedUrl)
    onSubmit(e, processedUrl)
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-4 flex space-x-2">
        <Input
          type="text"
          placeholder="Enter a URL (e.g. pungrumpy.com)"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Test'}
        </Button>
      </form>
    </div>
  )
}
