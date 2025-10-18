import Script from 'next/script'
import { env } from '@/lib/env'

const { RYBBIT_ID } = env

export const AnalyticsProvider = () => (
  <>
    {RYBBIT_ID && (
      <Script
        data-site-id={RYBBIT_ID}
        defer
        src="https://app.rybbit.io/api/script.js"
      />
    )}
  </>
)
