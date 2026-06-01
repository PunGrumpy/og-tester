import { defineConfig } from "tsdown";

export default defineConfig({
  banner: { js: "#!/usr/bin/env node" },
  clean: true,
  deps: {
    onlyBundle: ["zod"],
  },
  entry: ["src/index.ts"],
  format: ["esm"],
  minify: true,
});
