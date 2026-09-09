import type { Metadata } from "next";

import { env } from "./env";

const baseUrl = env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export interface CreateMetadataOptions {
  includeDefaultImages?: boolean;
}

const DEFAULT_METADATA_OPTIONS: CreateMetadataOptions = {
  includeDefaultImages: true,
};

export const createMetadata = (
  title: string,
  description: string,
  options = DEFAULT_METADATA_OPTIONS
): Metadata => {
  const { includeDefaultImages = true } = options;
  const defaultImages = [
    {
      height: 960,
      url: new URL("/opengraph-image.png", baseUrl).toString(),
      width: 1600,
    },
  ];

  return {
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
      ...(includeDefaultImages ? { images: defaultImages } : {}),
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
      ...(includeDefaultImages ? { images: defaultImages } : {}),
      title,
    },
  };
};
