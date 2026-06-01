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
};

export default nextConfig;
