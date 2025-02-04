import { Trash } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { HistoryItem } from '@/types/storage'

type RecentTestsProps = {
  history: HistoryItem[]
  onSelectHistoryItem: (item: HistoryItem) => void
  onDeleteHistoryItem: (url: string) => void
}

export function RecentTests({
  history,
  onSelectHistoryItem,
  onDeleteHistoryItem
}: RecentTestsProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Recent Tests</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          {history.map((item, index) => (
            <div
              key={index}
              className="group mb-2 flex items-center justify-between"
            >
              <Button variant="link" onClick={() => onSelectHistoryItem(item)}>
                {item.url}
              </Button>
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground text-sm">
                  {new Date(item.timestamp).toLocaleString()}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteHistoryItem(item.url)}
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash className="size-4 text-red-500" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
