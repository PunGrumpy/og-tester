'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import Loading from '@/app/loading'
import { MetadataResults } from '@/components/MetadataResults'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { fetchMetadata, validateMetadata } from '@/lib/utils'
import { MetadataAttributes } from '@/types/metadata'

interface SharedMetadataResultsProps {
  url: string | null
}

export function SharedMetadataResults({ url }: SharedMetadataResultsProps) {
  const [metadata, setMetadata] = useState<MetadataAttributes | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (url) {
      fetchMetadataForShare(url)
    }
  }, [url])

  const fetchMetadataForShare = async (url: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchMetadata(url)
      setMetadata(data)
      toast.success('Metadata fetched successfully')
    } catch (error) {
      console.error('Failed to fetch metadata:', error)
      setError('An unexpected error occurred')
      toast.error('Failed to fetch metadata')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />
  if (error) throw new Error(error)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Shared Metadata Results</CardTitle>
          <CardDescription>Metadata results for the shared URL</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </motion.div>
  )
}
