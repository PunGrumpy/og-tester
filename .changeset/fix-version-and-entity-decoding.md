---
"og-tester": patch
---

Fix `--version` reporting a hardcoded string instead of the real package version, and fix HTML entity decoding in scanned pages: numeric forms (`&#8217;`, `&#x2019;`) and common named entities (`&mdash;`, `&hellip;`, `&rsquo;`, ...) now decode correctly, while double-escaped text such as `&amp;lt;` is no longer over-decoded.
