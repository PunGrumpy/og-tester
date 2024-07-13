'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MetadataAttributes } from '@/types/metadata'
import Image from 'next/image'
import { toast } from 'sonner'

export default function SharePage() {
  const searchParams = useSearchParams()
  const [metadata, setMetadata] = useState<MetadataAttributes | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const url = searchParams.get('url')
    if (url) {
      fetchMetadata(url)
    } else {
      setError('No URL provided')
      setLoading(false)
      toast.error('No URL provided')
    }
  }, [searchParams])

  const fetchMetadata = async (url: string) => {
    try {
      const response = await fetch(
        `/api/fetchMetadata?url=${encodeURIComponent(url)}`
      )
      const data = await response.json()
      if (response.ok) {
        setMetadata(data)
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

  const validateMetadata = (metadata: MetadataAttributes) => {
    const issues = []
    if (!metadata.ogTitle) issues.push('Missing og:title')
    if (!metadata.ogDescription) issues.push('Missing og:description')
    if (!metadata.ogImage) issues.push('Missing og:image')
    if (!metadata.twitterCard) issues.push('Missing twitter:card')
    return issues
  }

  const MetadataItem = ({
    term,
    description
  }: {
    term: string
    description: string | undefined
  }) => (
    <div className="mb-2">
      <dt className="font-semibold text-sm text-muted-foreground">{term}</dt>
      <dd className="mt-1 text-sm">{description || 'Not specified'}</dd>
    </div>
  )

  const ImagePreview = ({
    src,
    alt
  }: {
    src: string | undefined
    alt: string
  }) => {
    if (!src) return <p>No {alt} found</p>
    return (
      <div className="relative w-full h-[300px]">
        <Image
          src={src}
          alt={alt}
          layout="fill"
          objectFit="contain"
          unoptimized={src.endsWith('.svg')}
        />
      </div>
    )
  }

  if (loading) return <div>Loading...</div>
  if (error)
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Shared Metadata Results</CardTitle>
        </CardHeader>
        <CardContent>
          {metadata && (
            <>
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
