import type { XmcpConfig } from "xmcp";

const config: XmcpConfig = {
  experimental: {
    adapter: "nextjs",
  },
  http: {
    // adds extra logging to the console
    debug: true,
    endpoint: "mcp",
    port: 3001,
  },
  paths: {
    prompts: false,
    resources: false,
    tools: "tools",
  },
  stdio: false,
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
