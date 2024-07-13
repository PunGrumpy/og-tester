import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MetadataAttributes } from '@/types/metadata'

import { ImagePreview } from './ImagePreview'
import { MetadataItem } from './MetadataItem'

type MetadataResultsProps = {
  metadata: MetadataAttributes
  validateMetadata: (metadata: MetadataAttributes) => string[]
}

export function MetadataResults({
  metadata,
  validateMetadata
}: MetadataResultsProps) {
  const renderMetadataItems = (items: [string, string | undefined][]) => (
    <dl className="space-y-2">
      {items.map(([key, value]) => (
        <MetadataItem key={key} term={key} value={value} />
      ))}
    </dl>
  )

  return (
    <div className="mt-6">
      <h2 className="mb-4 text-xl font-bold">Metadata Results</h2>
      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="og">Open Graph</TabsTrigger>
          <TabsTrigger value="twitter">Twitter</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Open Graph</CardTitle>
              </CardHeader>
              <CardContent>
                {renderMetadataItems(
                  Object.entries(metadata).filter(([key]) =>
                    key.startsWith('og')
                  )
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Twitter Card</CardTitle>
              </CardHeader>
              <CardContent>
                {renderMetadataItems(
                  Object.entries(metadata).filter(([key]) =>
                    key.startsWith('twitter')
                  )
                )}
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
              {renderMetadataItems(
                Object.entries(metadata).filter(([key]) => key.startsWith('og'))
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="twitter">
          <Card>
            <CardHeader>
              <CardTitle>Twitter Card</CardTitle>
            </CardHeader>
            <CardContent>
              {renderMetadataItems(
                Object.entries(metadata).filter(([key]) =>
                  key.startsWith('twitter')
                )
              )}
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
            <Badge key={index} variant="destructive" className="mb-2 mr-2">
              {issue}
            </Badge>
          ))}
          {validateMetadata(metadata).length === 0 && (
            <Badge variant="default">All required metadata present</Badge>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
