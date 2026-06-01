import type { XmcpConfig } from "xmcp";

const config: XmcpConfig = {
  experimental: {
    adapter: "nextjs",
  },
  http: {
    debug: process.env.NODE_ENV !== "production",
  },
  paths: {
    prompts: false,
    resources: false,
    tools: "tools",
  },
  template: {
    description:
      "Test and preview your Open Graph and Twitter Card metadata. See how your links will appear when shared on social media platforms.",
    icons: [
      {
        mimeType: "image/png",
        src: "http://og.pungrumpy.com/icon.png",
      },
    ],
    name: "OG Tester MCP",
  },
};

export default config;
