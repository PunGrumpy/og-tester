'use client'

import { TabsContent } from '@radix-ui/react-tabs'
import { Icons } from '@/components/icons'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ViewAnimation } from '@/components/view-animation'
import { useOgStore } from '@/hooks/use-og-store'
import type { OgData } from '@/lib/schemas/og'
import { DiscordPreview } from './discord-preview'
import { FacebookPreview } from './facebook-preview'
import { LinkedinPreview } from './linkedin-preview'
import { SlackPreview } from './slack-preview'
import { WhatsappPreview } from './whatsapp-preview'
import { XPreview } from './x-preview'

const PLATFORMS = [
  { id: 'x', icon: <Icons.x />, label: 'Twitter/X' },
  { id: 'slack', icon: <Icons.slack />, label: 'Slack' },
  { id: 'facebook', icon: <Icons.facebook />, label: 'Facebook' },
  { id: 'linkedin', icon: <Icons.linkedin />, label: 'LinkedIn' },
  { id: 'discord', icon: <Icons.discord />, label: 'Discord' },
  { id: 'whatsapp', icon: <Icons.whatsapp />, label: 'WhatsApp' }
]

const PROTOCOL_REGEX = /^[a-zA-Z]+:\/\//
const WWW_REGEX = /^www\./
const SPLIT_HOST_REGEX = /[/?#]/

const parseDisplayUrl = (url: string) => {
  const trimmed = url.trim()

  const withoutProtocol = trimmed.replace(PROTOCOL_REGEX, '')
  const withoutWww = withoutProtocol.replace(WWW_REGEX, '')
  const hostname = withoutWww.split(SPLIT_HOST_REGEX)[0]

  return hostname
}

const getPreviewImage = (data: OgData, url: string) => ({
  title: data['og:title'] || data['twitter:title'] || data.title || 'No title',
  description:
    data['og:description'] || data['twitter:description'] || data.description,
  image: data['og:image'] || data['twitter:image'],
  siteName: data['og:site_name'],
  displayUrl: parseDisplayUrl(url)
})

export const SocialPreview = () => {
  const { url, data } = useOgStore()
  const preview = getPreviewImage(data, url)

  return (
    <ViewAnimation
      className="flex flex-col gap-4 p-4"
      delay={0.8}
      initial={{ opacity: 0, translateY: -8 }}
      whileInView={{ opacity: 1, translateY: 0 }}
    >
      <Tabs defaultValue="x">
        <TabsList className="h-10 gap-1">
          {PLATFORMS.map(platform => (
            <TabsTrigger className="" key={platform.id} value={platform.id}>
              {platform.icon}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="x">
          <XPreview
            description={preview.description}
            displayUrl={preview.displayUrl}
            image={preview.image}
            title={preview.title}
          />
        </TabsContent>
        <TabsContent value="slack">
          <SlackPreview
            description={preview.description}
            image={preview.image}
            siteName={preview.siteName}
            title={preview.title}
          />
        </TabsContent>
        <TabsContent value="facebook">
          <FacebookPreview
            description={preview.description}
            displayUrl={preview.displayUrl}
            image={preview.image}
            title={preview.title}
          />
        </TabsContent>
        <TabsContent value="linkedin">
          <LinkedinPreview
            displayUrl={preview.displayUrl}
            image={preview.image}
            title={preview.title}
          />
        </TabsContent>
        <TabsContent value="discord">
          <DiscordPreview
            description={preview.description}
            image={preview.image}
            siteName={preview.siteName}
            title={preview.title}
          />
        </TabsContent>
        <TabsContent value="whatsapp">
          <WhatsappPreview
            description={preview.description}
            displayUrl={preview.displayUrl}
            image={preview.image}
            title={preview.title}
          />
        </TabsContent>
      </Tabs>
    </ViewAnimation>
  )
}
