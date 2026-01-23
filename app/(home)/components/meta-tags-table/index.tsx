'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ViewAnimation } from '@/components/view-animation'
import { useOgStore } from '@/hooks/use-og-store'
import { IconsPanel } from './icons-panel'
import { TagTable } from './tag-table'

const CATEGORIES = [
  { id: 'general', label: 'General' },
  { id: 'openGraph', label: 'Open Graph' },
  { id: 'twitter', label: 'Twitter' },
  { id: 'icons', label: 'Icons' }
] as const

export const MetaTagsTable = () => {
  const { data } = useOgStore()

  return (
    <ViewAnimation
      delay={0.8}
      initial={{ opacity: 0, translateY: -8 }}
      whileInView={{ opacity: 1, translateY: 0 }}
    >
      <Tabs defaultValue="general">
        <TabsList className="h-auto w-full justify-start gap-0 rounded-none border-b bg-transparent p-0">
          {CATEGORIES.map(cat => (
            <TabsTrigger
              className="relative -mb-px rounded-none border-transparent px-4 py-3 data-[state=active]:border-border data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              key={cat.id}
              value={cat.id}
            >
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="general">
          <TagTable category="general" data={data} />
        </TabsContent>
        <TabsContent value="openGraph">
          <TagTable category="openGraph" data={data} />
        </TabsContent>
        <TabsContent value="twitter">
          <TagTable category="twitter" data={data} />
        </TabsContent>
        <TabsContent value="icons">
          <IconsPanel data={data} />
        </TabsContent>
      </Tabs>
    </ViewAnimation>
  )
}
