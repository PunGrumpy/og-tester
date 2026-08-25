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

      // Imported only by components/ui/sidebar.tsx, which the first entry
      // already excludes, so it reads as orphaned purely because of that.
      "hooks/use-mobile.ts",
    ],

    // Narrower than `files`: one rule, one file, everything else still runs.
    overrides: [
      {
        // The favicon proxy serves .ico for almost every site, and Next's
        // image optimiser does not handle .ico — measured against this build,
        // 15086 bytes in and 15086 bytes out, still image/x-icon. It also
        // refuses the route outright ("url parameter is not allowed") because
        // the path carries a query string. So next/image would cost a round
        // trip and return the same bytes; the srcset it adds is moot for a
        // fixed 18px slot, and the img already sets loading="lazy".
        files: ["components/home/score-list.tsx"],
        rules: ["react-doctor/nextjs-no-img-element"],
      },
      {
        // `global-error` renders in place of the root layout, so there is no
        // App Router context for next/link to use. The rule's own summary —
        // "plain anchor reloads internal links" — describes exactly the
        // behaviour we want here: the tree that failed must not be re-entered
        // by a soft navigation.
        files: ["app/global-error.tsx"],
        rules: ["react-doctor/nextjs-no-a-element"],
      },
      {
        // The JSON round trip is not a clone, it is a normalisation: Redis
        // stores JSON, so the in-memory backend has to hand back exactly what
        // Redis would. structuredClone is the wrong tool precisely because it
        // preserves more — undefined values that Redis drops on write, and
        // Dates that Redis would return as strings — leaving the two backends
        // returning different objects for the same report. oxlint flags the
        // same line and carries the same reasoning inline.
        files: ["lib/reports/store.ts"],
        rules: ["react-doctor/no-json-parse-stringify-clone"],
      },
    ],
  },
};

export default config;
