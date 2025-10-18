'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { Metadata } from '@/app/api/og/route'
import { Section } from '@/components/section'
import { cn } from '@/lib/utils'
import { ViewAnimation } from '@/providers/view-animation'
import { HistorySearch } from './components/history-search'
import { InputForm } from './components/input-form'
import { MetadataResults } from './components/metadata-result'
import { ValidateResult } from './components/validate-result'

type HistoryItem = {
  url: string
  timestamp: number
  metadata: Metadata
}

export default function HomePage() {
  const [metadata, setMetadata] = useState<Metadata>({})
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    const savedHistory = localStorage.getItem('urlHistory')
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  const handleMetadataUpdate = (newMetadata: Metadata) => {
    setMetadata(newMetadata)
    setHasSearched(true)
  }

  const updateHistory = (url: string, newMetadata: Metadata) => {
    const now = Date.now()
    const existingIndex = history.findIndex(item => item.url === url)
    let newHistory: HistoryItem[]

    if (existingIndex !== -1) {
      newHistory = [
        { url, timestamp: now, metadata: newMetadata },
        ...history.slice(0, existingIndex),
        ...history.slice(existingIndex + 1)
      ]
    } else {
      newHistory = [{ url, timestamp: now, metadata: newMetadata }, ...history]
    }

    newHistory = newHistory.slice(0, 10)
    localStorage.setItem('urlHistory', JSON.stringify(newHistory))
    setHistory(newHistory)
  }

  const deleteHistoryItem = (urlToDelete: string) => {
    const newHistory = history.filter(item => item.url !== urlToDelete)
    localStorage.setItem('urlHistory', JSON.stringify(newHistory))
    setHistory(newHistory)
  }

  const fetchMetadata = async (url: string): Promise<Metadata> => {
    const response = await fetch(`/api/og?url=${encodeURIComponent(url)}`, {
      headers: {
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY || ''
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(
        `Failed to fetch metadata: ${errorData.error || response.statusText}`
      )
    }

    return response.json()
  }

  return (
    <>
      <Section className="border-t">
        <div className="space-y-8 p-8">
          <div className="text-center">
            <ViewAnimation
              delay={0.2}
              initial={{ opacity: 0, translateY: -8 }}
              whileInView={{ opacity: 1, translateY: 0 }}
            >
              <h1 className="font-bold text-3xl leading-tight tracking-tight sm:text-4xl md:text-5xl">
                Open Graph Tester
              </h1>
            </ViewAnimation>
            <ViewAnimation
              delay={0.4}
              initial={{ opacity: 0, translateY: -8 }}
              whileInView={{ opacity: 1, translateY: 0 }}
            >
              <p className="mt-2 text-muted-foreground">
                Enter a URL to fetch its Open Graph metadata
              </p>
            </ViewAnimation>
          </div>

          <InputForm
            fetchMetadata={fetchMetadata}
            onMetadataUpdate={handleMetadataUpdate}
            updateHistory={updateHistory}
          />
        </div>
      </Section>

      <Section className="min-h-[500px]">
        <MetadataResults metadata={metadata} />
      </Section>

      <ValidateResult hasSearched={hasSearched} metadata={metadata} />

      <Section
        className={cn(
          'relative flex flex-col gap-2 px-4 py-8 font-mono text-xs',
          'space-y-4 sm:px-8 sm:text-sm'
        )}
      >
        <HistorySearch
          history={history}
          onDeleteHistoryItem={deleteHistoryItem}
          onSelectHistoryItem={item => {
            fetchMetadata(item.url)
              .then(response => {
                handleMetadataUpdate(response)
              })
              .catch(error => {
                toast.error(
                  error instanceof Error ? error.message : 'An error occurred'
                )
              })
          }}
        />
        <div className="pointer-events-none absolute right-0 bottom-6 left-0 z-10 h-40 bg-gradient-to-b from-transparent to-backdrop" />
      </Section>
    </>
  )
}
