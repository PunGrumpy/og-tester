---
"og-tester": patch
---

Parse meta and link tags with a linear-time attribute scanner. The previous regexes backtracked across the whole document on minified pages with long inline scripts, which pinned the CPU for minutes and made hosted scans time out. The same change stops a favicon `rel` from swallowing neighboring tags and reads `theme-color` media queries whichever side of `content` they sit on.
