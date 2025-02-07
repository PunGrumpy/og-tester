'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import type { Metadata } from '@/app/api/og/route'
import { ViewAnimation } from '@/components/providers/ViewAnimation'
import { Section } from '@/components/sections/Section'
import { cn } from '@/lib/utils'

import { ContactForm } from './components/ContactForm'
import { HistorySearch } from './components/HistorySearch'
import { MetadataResults } from './components/MetadataResult'
import { ValidateResult } from './components/ValidateResult'

interface HistoryItem {
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

  const updateHistory = (url: string, metadata: Metadata) => {
    const now = Date.now()
    const existingIndex = history.findIndex(item => item.url === url)
    let newHistory: HistoryItem[]

    if (existingIndex !== -1) {
      newHistory = [
        { url, timestamp: now, metadata },
        ...history.slice(0, existingIndex),
        ...history.slice(existingIndex + 1)
      ]
    } else {
      newHistory = [{ url, timestamp: now, metadata }, ...history]
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
      console.error('API Error:', errorData)
      throw new Error(
        `Failed to fetch metadata: ${errorData.error || response.statusText}`
      )
    }

    return response.json()
  }

  const validateMetadata = (metadata: Metadata): string[] => {
    const issues: string[] = []
    if (!metadata.ogTitle) issues.push('Missing og:title')
    if (!metadata.ogDescription) issues.push('Missing og:description')
    if (!metadata.ogImage) issues.push('Missing og:image')
    if (!metadata.twitterCard) issues.push('Missing twitter:card')
    return issues
  }

  return (
    <>
      <Section className="border-t">
        <div className="space-y-8 p-8">
          <div className="text-center">
            <ViewAnimation
              initial={{ opacity: 0, translateY: -8 }}
              whileInView={{ opacity: 1, translateY: 0 }}
              delay={0.2}
            >
              <h1 className="text-3xl leading-tight font-bold tracking-tight sm:text-4xl md:text-5xl">
                Open Graph Tester
              </h1>
            </ViewAnimation>
            <ViewAnimation
              initial={{ opacity: 0, translateY: -8 }}
              whileInView={{ opacity: 1, translateY: 0 }}
              delay={0.4}
            >
              <p className="text-muted-foreground mt-2">
                Enter a URL to fetch its Open Graph metadata
              </p>
            </ViewAnimation>
          </div>

          <ContactForm
            onMetadataUpdate={handleMetadataUpdate}
            fetchMetadata={fetchMetadata}
            updateHistory={updateHistory}
          />
        </div>
      </Section>

      <Section className="min-h-[500px]">
        <MetadataResults metadata={metadata} />
      </Section>

      <Section>
        <ValidateResult
          metadata={metadata}
          hasSearched={hasSearched}
          validateMetadata={validateMetadata}
        />
      </Section>

      <Section
        className={cn(
          'relative flex flex-col gap-2 px-4 py-8 font-mono text-xs',
          'space-y-4 sm:px-8 sm:text-sm'
        )}
      >
        <HistorySearch
          history={history}
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
          onDeleteHistoryItem={deleteHistoryItem}
        />
        <div className="to-backdrop pointer-events-none absolute right-0 bottom-6 left-0 z-10 h-40 bg-gradient-to-b from-transparent" />
      </Section>
    </>
  )
}
