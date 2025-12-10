'use client'

import { useState } from 'react'
import { useOgStore } from '@/hooks/use-og-store'
import { cn } from '@/lib/utils'
import { IconsPanel } from './icons-panel'
import { type MetaCategory, TagTable } from './tag-table'

const CATEGORIES: { id: MetaCategory; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'openGraph', label: 'Open Graph' },
  { id: 'twitter', label: 'Twitter' },
  { id: 'icons', label: 'Icons' }
]

export const MetaTagsTable = () => {
  const [activeCategory, setActiveCategory] = useState<MetaCategory>('general')
  const { data } = useOgStore()

  return (
    <div className="">
      <div className="flex gap-1 border-b">
        {CATEGORIES.map(cat => (
          <button
            className={cn(
              'relative p-4 text-sm transition-colors',
              activeCategory === cat.id
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            type="button"
          >
            {cat.label}
            {activeCategory === cat.id && (
              <span className="absolute right-0 bottom-0 left-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {activeCategory === 'icons' ? (
        <IconsPanel data={data} />
      ) : (
        <TagTable category={activeCategory} data={data} />
      )}
    </div>
  )
}
