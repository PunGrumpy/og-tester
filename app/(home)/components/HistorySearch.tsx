import { Trash } from 'lucide-react'

import { ViewAnimation } from '@/components/providers/ViewAnimation'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { HistoryItem } from '@/types/storage'

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
    <ScrollArea className="mt-4 h-[336px]">
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
            <h3
              className="cursor-pointer"
              onClick={() => onSelectHistoryItem(item)}
            >
              {item.url}
            </h3>
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
                <Trash className="text-destructive size-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </div>
        </ViewAnimation>
      ))}
    </ScrollArea>
  )
}
