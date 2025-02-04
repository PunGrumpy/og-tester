import { Trash } from 'lucide-react'

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
    <div className="mt-6 w-full">
      <ScrollArea className="">
        {history.map((item, index) => (
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
              <span className="text-muted-foreground text-sm">
                {new Date(item.timestamp).toLocaleString()}
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
        ))}
      </ScrollArea>
    </div>
  )
}
