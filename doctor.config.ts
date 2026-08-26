import type { ReactDoctorConfig } from "react-doctor/api";

const config: ReactDoctorConfig = {
  ignore: {
    files: [
      "components/ui/**",

      // Build output: xmcp regenerates this on every dev/build run and it is
      // gitignored, so the crypto and JSON-in-HTML findings inside it are
      // vendor code we neither wrote nor ship from source.
      ".xmcp/**",

      // MCP tool entry points. xmcp discovers these by convention and wires
      // them up through the generated .xmcp/import-map.js, so dead-code
      // analysis sees no static import and calls all three unreachable. They
      // are live — the dev server logs "Registered 3 tools" on boot.
      "tools/**",
    ],
  },
};

export default config;
