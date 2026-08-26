# og-tester

## 0.1.1

### Patch Changes

- 8c045aa: Fix single-URL checks scoring lower than the web scanner. `check` (and the default action) scored tags without fetching the og:image, so every page lost 5 points to a false "og:image URL is unreachable" and skipped the canonical check. Both now resolve image metadata and pass the page URL, matching `scan` and the web report.

## 0.1.0

### Minor Changes

- a0ac1c3: Add root-level default action to scan/check URLs or directories directly without subcommands, support loading configuration from package.json or og-tester.config.json, and enable recursive auditing of local HTML files.
