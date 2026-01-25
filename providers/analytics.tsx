'use client'

import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'
import { env } from '@/lib/env'

const Databuddy = dynamic(
  () => import('@databuddy/sdk/react').then(mod => mod.Databuddy),
  { ssr: false }
)

interface AnalyticsProviderProps {
  children: ReactNode
}

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => (
  <>
    {children}
    <Databuddy
      clientId={env.NEXT_PUBLIC_DATABUDDY_CLIENT_ID}
      disabled={process.env.NODE_ENV !== 'production'}
      enableBatching
      trackAttributes
      trackHashChanges
      trackInteractions
      trackOutgoingLinks
      trackPerformance
      trackScrollDepth
      trackWebVitals
    />
  </>
)
