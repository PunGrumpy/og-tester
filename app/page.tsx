'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trash, Copy, Share2 } from 'lucide-react'
import { HistoryItem } from '@/types/storage'
import { MetadataAttributes } from '@/types/metadata'
import { toast } from 'sonner'

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

  const fetchMetadata = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `/api/fetchMetadata?url=${encodeURIComponent(url)}`
      )
      const data = await response.json()
      if (response.ok) {
        setMetadata(data)
        updateHistory(url, data)
        toast.success('Metadata fetched successfully')
      } else {
        setError(data.error || 'An error occurred while fetching metadata')
        toast.error('Failed to fetch metadata')
      }
    } catch (error) {
      console.error('Failed to fetch metadata:', error)
      setError('An unexpected error occurred')
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const updateHistory = (url: string, metadata: MetadataAttributes) => {
    const now = Date.now()
    const existingIndex = history.findIndex(item => item.url === url)
    let newHistory

    if (existingIndex !== -1) {
      newHistory = [
        { url, timestamp: now, metadata },
        ...history.slice(0, existingIndex),
        ...history.slice(existingIndex + 1)
      ]
    } else {
      newHistory = [{ url, timestamp: now, metadata }, ...history]
    }

    newHistory = newHistory.slice(0, 10)

    setHistory(newHistory)
    localStorage.setItem('urlHistory', JSON.stringify(newHistory))
  }

  const deleteHistoryItem = (urlToDelete: string) => {
    const newHistory = history.filter(item => item.url !== urlToDelete)
    setHistory(newHistory)
    localStorage.setItem('urlHistory', JSON.stringify(newHistory))
  }

  const validateMetadata = (metadata: MetadataAttributes) => {
    const issues = []
    if (!metadata.ogTitle) issues.push('Missing og:title')
    if (!metadata.ogDescription) issues.push('Missing og:description')
    if (!metadata.ogImage) issues.push('Missing og:image')
    if (!metadata.twitterCard) issues.push('Missing twitter:card')
    return issues
  }

  const isHttps = (url: string) => url.startsWith('https://')

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const generateShareableLink = () => {
    const baseUrl = window.location.origin
    const shareUrl = `${baseUrl}/share?url=${encodeURIComponent(url)}`
    copyToClipboard(shareUrl)
    toast.success('Shareable link copied to clipboard!')
  }

  const MetadataItem = ({
    term,
    description
  }: {
    term: string
    description: string | undefined
  }) => (
    <div className="mb-2 flex justify-between items-center">
      <div>
        <dt className="font-semibold text-sm text-muted-foreground">{term}</dt>
        <dd className="mt-1 text-sm">{description || 'Not specified'}</dd>
      </div>
      {description && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => copyToClipboard(description)}
        >
          <Copy className="h-4 w-4" />
          <span className="sr-only">Copy</span>
        </Button>
      )}
    </div>
  )

  const ImagePreview = ({
    src,
    alt
  }: {
    src: string | undefined
    alt: string
  }) => {
    const [error, setError] = useState(false)

    if (!src) return <p>No {alt} found</p>

    if (!isHttps(src)) {
      return (
        <Alert variant="destructive">
          <AlertTitle>Insecure Image Source</AlertTitle>
          <AlertDescription>
            The image is served over HTTP, which is not secure. URL: {src}
          </AlertDescription>
        </Alert>
      )
    }

    if (error) {
      return (
        <div className="bg-gray-200 dark:bg-gray-700 p-4 text-center">
          <p>Error loading image. URL: {src}</p>
        </div>
      )
    }

    return (
      <div className="relative w-full h-[300px]">
        <Image
          src={src}
          alt={alt}
          layout="fill"
          objectFit="contain"
          onError={() => setError(true)}
          unoptimized={src.endsWith('.svg')}
        />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8 px-4"
    >
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>
            <div className="flex items-center justify-between">
              OG & Twitter Card Tester
              <Button onClick={generateShareableLink} variant="ghost">
                <Share2 className="mr-2 h-4 w-4" />
                Share Results
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Enter a URL to test its Open Graph and Twitter Card metadata
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={fetchMetadata} className="flex space-x-2 mb-4">
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

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {metadata && (
            <div className="mt-6">
              <h2 className="text-xl font-bold mb-4">Metadata Results</h2>
              <Tabs defaultValue="all">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="og">Open Graph</TabsTrigger>
                  <TabsTrigger value="twitter">Twitter</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Open Graph</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="space-y-2">
                          <MetadataItem
                            term="Title"
                            description={metadata.ogTitle}
                          />
                          <MetadataItem
                            term="Description"
                            description={metadata.ogDescription}
                          />
                          <MetadataItem
                            term="URL"
                            description={metadata.ogUrl}
                          />
                          <MetadataItem
                            term="Site Name"
                            description={metadata.ogSiteName}
                          />
                          <MetadataItem
                            term="Type"
                            description={metadata.ogType}
                          />
                        </dl>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Twitter Card</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="space-y-2">
                          <MetadataItem
                            term="Card"
                            description={metadata.twitterCard}
                          />
                          <MetadataItem
                            term="Site"
                            description={metadata.twitterSite}
                          />
                          <MetadataItem
                            term="Title"
                            description={metadata.twitterTitle}
                          />
                          <MetadataItem
                            term="Description"
                            description={metadata.twitterDescription}
                          />
                        </dl>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="og">
                  <Card>
                    <CardHeader>
                      <CardTitle>Open Graph</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-2">
                        <MetadataItem
                          term="Title"
                          description={metadata.ogTitle}
                        />
                        <MetadataItem
                          term="Description"
                          description={metadata.ogDescription}
                        />
                        <MetadataItem term="URL" description={metadata.ogUrl} />
                        <MetadataItem
                          term="Site Name"
                          description={metadata.ogSiteName}
                        />
                        <MetadataItem
                          term="Type"
                          description={metadata.ogType}
                        />
                      </dl>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="twitter">
                  <Card>
                    <CardHeader>
                      <CardTitle>Twitter Card</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-2">
                        <MetadataItem
                          term="Card"
                          description={metadata.twitterCard}
                        />
                        <MetadataItem
                          term="Site"
                          description={metadata.twitterSite}
                        />
                        <MetadataItem
                          term="Title"
                          description={metadata.twitterTitle}
                        />
                        <MetadataItem
                          term="Description"
                          description={metadata.twitterDescription}
                        />
                      </dl>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Image Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="og">
                    <TabsList>
                      <TabsTrigger value="og">Open Graph</TabsTrigger>
                      <TabsTrigger value="twitter">Twitter Card</TabsTrigger>
                    </TabsList>
                    <TabsContent value="og">
                      <ImagePreview src={metadata.ogImage} alt="OG Image" />
                    </TabsContent>
                    <TabsContent value="twitter">
                      <ImagePreview
                        src={metadata.twitterImage}
                        alt="Twitter Card Image"
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Validation</CardTitle>
                </CardHeader>
                <CardContent>
                  {validateMetadata(metadata).map((issue, index) => (
                    <Badge
                      key={index}
                      variant="destructive"
                      className="mr-2 mb-2"
                    >
                      {issue}
                    </Badge>
                  ))}
                  {validateMetadata(metadata).length === 0 && (
                    <Badge variant="default">
                      All required metadata present
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                {history.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center mb-2 group"
                  >
                    <Button
                      variant="link"
                      onClick={() => {
                        setUrl(item.url)
                        setMetadata(item.metadata)
                      }}
                    >
                      {item.url}
                    </Button>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteHistoryItem(item.url)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </motion.div>
  )
}
