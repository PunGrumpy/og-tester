import type { XmcpConfig } from 'xmcp'

const config: XmcpConfig = {
  http: {
    port: 3001,
    endpoint: 'mcp',
    debug: true // adds extra logging to the console
  },
  stdio: true
}

export default config
