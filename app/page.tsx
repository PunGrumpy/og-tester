'use client'

import { motion } from 'framer-motion'
import { Share2Icon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { MetadataForm } from '@/components/MetadataForm'
import { MetadataResults } from '@/components/MetadataResults'
import { RecentTests } from '@/components/RecentTests'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { MetadataAttributes } from '@/types/metadata'
import { HistoryItem } from '@/types/storage'
import { deleteHistoryItem, updateHistory } from '@/utils/historyUtils'
import { fetchMetadata, validateMetadata } from '@/utils/metadataUtils'

export default function Home() {
  const [url, setUrl] = useState('')
  const [metadata, setMetadata] = useState<MetadataAttributes | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    const savedHistory = localStorage.getItem('urlHistory')
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  const handleFetchMetadata = useCallback(
    async (e: React.FormEvent, processedUrl: string) => {
      e.preventDefault()
      setLoading(true)
      setError(null)
      try {
        const data = await fetchMetadata(processedUrl)
        setMetadata(data)
        setHistory(updateHistory(history, processedUrl, data))
        toast.success('Metadata fetched successfully')
      } catch (error) {
        console.error('Failed to fetch metadata:', error)
        setError('An unexpected error occurred')
        toast.error('Failed to fetch metadata')
      } finally {
        setLoading(false)
      }
    },
    [history]
  )

  const generateShareableLink = () => {
    const baseUrl = window.location.origin
    const shareUrl = `${baseUrl}/share?url=${encodeURIComponent(url)}`
    navigator.clipboard.writeText(shareUrl)
    toast.success('Shareable link copied to clipboard!')
  }

  const handleDeleteHistoryItem = useCallback(
    (urlToDelete: string) => {
      setHistory(deleteHistoryItem(history, urlToDelete))
      toast.success('History item deleted')
    },
    [history]
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>
            <div className="flex items-center justify-between">
              OG & Twitter Card Tester
              <Button onClick={generateShareableLink} variant="ghost">
                <Share2Icon className="mr-2 size-4" />
                Share Results
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Enter a URL to test its Open Graph and Twitter Card metadata
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MetadataForm
            url={url}
            setUrl={setUrl}
            onSubmit={handleFetchMetadata}
            loading={loading}
          />

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {metadata && (
            <MetadataResults
              metadata={metadata}
              validateMetadata={validateMetadata}
            />
          )}

          <RecentTests
            history={history}
            onSelectHistoryItem={item => {
              setUrl(item.url)
              setMetadata(item.metadata)
            }}
            onDeleteHistoryItem={handleDeleteHistoryItem}
          />
        </CardContent>
      </Card>
    </motion.div>
  )
}
