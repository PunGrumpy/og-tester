import type { Metadata } from "next";

import { env } from "./env";

const baseUrl = env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const createMetadata = (
  title: string,
  description: string
): Metadata => ({
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
  },
  authors: [
    {
      name: "Noppakorn Kaewsalabnil",
      url: "https://www.pungrumpy.com",
    },
  ],
  creator: "Noppakorn Kaewsalabnil",
  description,
  formatDetection: {
    telephone: false,
  },
  keywords: ["web", "og-tester"],
  metadataBase: new URL(baseUrl),
  openGraph: {
    description,
    images: [
      {
        height: 960,
        url: new URL("/opengraph-image.png", baseUrl).toString(),
        width: 1600,
      },
    ],
    locale: "en_US",
    siteName: title,
    title,
    type: "website",
    url: baseUrl,
  },
  title,
  twitter: {
    card: "summary_large_image",
    creator: "@pungrumpy",
    description,
    images: [
      {
        height: 960,
        url: new URL("/opengraph-image.png", baseUrl).toString(),
        width: 1600,
      },
    ],
    title,
  },
});
