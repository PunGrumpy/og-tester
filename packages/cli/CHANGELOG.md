# og-tester

## 0.1.2

### Patch Changes

- dbfe5d2: Fix meta-tag values being truncated at the first apostrophe or quote, which also corrects spurious length-based score deductions.
- 8949915: Fix `--version` reporting a hardcoded string instead of the real package version, and fix HTML entity decoding in scanned pages: numeric forms (`&#8217;`, `&#x2019;`) and common named entities (`&mdash;`, `&hellip;`, `&rsquo;`, ...) now decode correctly, while double-escaped text such as `&amp;lt;` is no longer over-decoded.

## 0.1.1

### Patch Changes

- 8c045aa: Fix single-URL checks scoring lower than the web scanner. `check` (and the default action) scored tags without fetching the og:image, so every page lost 5 points to a false "og:image URL is unreachable" and skipped the canonical check. Both now resolve image metadata and pass the page URL, matching `scan` and the web report.

## 0.1.0

### Minor Changes

- a0ac1c3: Add root-level default action to scan/check URLs or directories directly without subcommands, support loading configuration from package.json or og-tester.config.json, and enable recursive auditing of local HTML files.
