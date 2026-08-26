---
"og-tester": patch
---

Fix single-URL checks scoring lower than the web scanner. `check` (and the default action) scored tags without fetching the og:image, so every page lost 5 points to a false "og:image URL is unreachable" and skipped the canonical check. Both now resolve image metadata and pass the page URL, matching `scan` and the web report.
