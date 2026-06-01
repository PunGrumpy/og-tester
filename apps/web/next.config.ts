import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: '**'
      }
    ]
  },
  experimental: {
    turbopackFileSystemCacheForDev: true
  }
}

export default nextConfig
