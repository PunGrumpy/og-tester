'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { ViewAnimation } from '@/components/providers/ViewAnimation'
import { Section } from '@/components/sections/Section'
import { cn, fetchMetadata } from '@/lib/utils'
import { MetadataAttributes } from '@/types/metadata'
import { HistoryItem } from '@/types/storage'

import { ContactForm } from './components/ContactForm'
import { HistorySearch } from './components/HistorySearch'
import { MetadataResults } from './components/MetadataResult'
import { ValidateResult } from './components/ValidateResult'

export default function HomePage() {
  const [metadata, setMetadata] = useState<MetadataAttributes>({})
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    const savedHistory = localStorage.getItem('urlHistory')
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  const handleMetadataUpdate = (newMetadata: MetadataAttributes) => {
    setMetadata(newMetadata)
    setHasSearched(true)
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
            history={history}
            setHistory={setHistory}
          />
        </div>
      </Section>

      <Section className="min-h-[500px]">
        <MetadataResults metadata={metadata} />
      </Section>

      <Section>
        <ValidateResult metadata={metadata} hasSearched={hasSearched} />
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
          onDeleteHistoryItem={url => {
            setHistory(history.filter(item => item.url !== url))
            localStorage.setItem(
              'urlHistory',
              JSON.stringify(history.filter(item => item.url !== url))
            )
            toast.success('History item deleted')
          }}
        />
        <div className="to-backdrop pointer-events-none absolute right-0 bottom-6 left-0 z-10 h-40 bg-gradient-to-b from-transparent" />
      </Section>
    </>
  )
}
