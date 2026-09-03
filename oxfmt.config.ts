import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  ignorePatterns: [
    "apps/web/components/ui",
    ".agents",
    ".changeset",
    ".github",
    // Reformatting this fixture onto multiple lines would remove the single
    // line shape the parser regression test depends on.
    "packages/core/test/fixtures/minified-inline-script.html",
  ],
});
