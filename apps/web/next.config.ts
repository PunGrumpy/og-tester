import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },

  images: {
    remotePatterns: [
      {
        hostname: "**",
      },
    ],
  },

  // oxlint-disable-next-line require-await
  redirects: async () => [
    {
      destination: "/api/mcp",
      permanent: true,
      source: "/mcp",
    },
  ],
};

export default nextConfig;
