import type { XmcpConfig } from "xmcp";

const config: XmcpConfig = {
  http: {
    // adds extra logging to the console
    debug: true,
    endpoint: "mcp",
    port: 3001,
  },
  stdio: true,
};

export default config;
