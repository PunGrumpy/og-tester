import { Trash } from 'lucide-react'
import type { Metadata } from '@/app/api/og/route'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ViewAnimation } from '@/providers/view-animation'

type HistoryItem = {
  url: string
  timestamp: number
  metadata: Metadata
}

type HistorySearchProps = {
  history: HistoryItem[]
  onSelectHistoryItem: (item: HistoryItem) => void
  onDeleteHistoryItem: (url: string) => void
}

export const HistorySearch = ({
  history,
  onSelectHistoryItem,
  onDeleteHistoryItem
}: HistorySearchProps) => (
  <ScrollArea className="h-[336px]">
    {history.map((item, index) => (
      <ViewAnimation
        delay={index * 0.1}
        initial={{ opacity: 0, translateY: -8 }}
        key={item.url}
        whileInView={{ opacity: 1, translateY: 0 }}
      >
        <div className="group mb-2 flex items-center justify-between">
          <button
            className="cursor-pointer duration-300 hover:underline hover:underline-offset-4"
            onClick={() => onSelectHistoryItem(item)}
            type="button"
          >
            {item.url}
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">
              {new Date(item.timestamp).toLocaleString().split(',')[0]}
            </span>
            <Button
              className="cursor-pointer"
              onClick={() => onDeleteHistoryItem(item.url)}
              size="icon"
              variant="ghost"
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
