import { Trash } from 'lucide-react'

import type { Metadata } from '@/app/api/og/route'
import { ViewAnimation } from '@/components/providers/view-animation'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface HistoryItem {
  url: string
  timestamp: number
  metadata: Metadata
}

interface HistorySearchProps {
  history: HistoryItem[]
  onSelectHistoryItem: (item: HistoryItem) => void
  onDeleteHistoryItem: (url: string) => void
}

export const HistorySearch = ({
  history,
  onSelectHistoryItem,
  onDeleteHistoryItem
}: HistorySearchProps) => {
  return (
    <ScrollArea className="h-[336px]">
      {history.map((item, index) => (
        <ViewAnimation
          key={index}
          initial={{ opacity: 0, translateY: -8 }}
          whileInView={{ opacity: 1, translateY: 0 }}
          delay={index * 0.1}
        >
          <div
            key={index}
            className="group mb-2 flex items-center justify-between"
          >
            <button
              type="button"
              className="cursor-pointer duration-300 hover:underline hover:underline-offset-4"
              onClick={() => onSelectHistoryItem(item)}
            >
              {item.url}
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">
                {new Date(item.timestamp).toLocaleString().split(',')[0]}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteHistoryItem(item.url)}
                className="cursor-pointer"
              >
                <Trash className="size-4 text-destructive" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </div>
        </ViewAnimation>
      ))}
    </ScrollArea>
  )
}
