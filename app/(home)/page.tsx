'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Section } from '@/components/sections/Section'
import { fetchMetadata } from '@/lib/utils'
import { MetadataAttributes } from '@/types/metadata'
import { HistoryItem } from '@/types/storage'

import { ContactForm } from './components/ContactForm'
import { HistorySearch } from './components/HistorySearch'
import { MetadataResults } from './components/MetadataResult'

export default function HomePage() {
  const [metadata, setMetadata] = useState<MetadataAttributes>({})
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    const savedHistory = localStorage.getItem('urlHistory')
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  const handleMetadataUpdate = (newMetadata: MetadataAttributes) => {
    setMetadata(newMetadata)
  }

  return (
    <>
      <Section className="border-t">
        <div className="space-y-8 p-8">
          <div className="text-center">
            <h1 className="text-3xl leading-tight font-bold tracking-tight sm:text-4xl md:text-5xl">
              Open Graph Tester
            </h1>
            <p className="text-muted-foreground mt-2">
              Enter a URL to fetch its Open Graph metadata
            </p>
          </div>

          <ContactForm
            onMetadataUpdate={handleMetadataUpdate}
            history={history}
            setHistory={setHistory}
          />
        </div>
      </Section>

      <Section className="min-h-[500px]">
        <MetadataResults metadata={metadata} validateMetadata={() => []} />
      </Section>

      <Section>
        <div className="p-8">
          <h2 className="text-xl leading-tight font-bold tracking-tight sm:text-2xl md:text-3xl">
            Search History
          </h2>
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
        </div>
      </Section>
    </>
  )
}
