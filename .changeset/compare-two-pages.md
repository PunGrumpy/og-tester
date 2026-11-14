---
"og-tester": minor
---

Add `og-tester diff <a> <b>` to compare the tags and scores of two URLs, such as staging against production. It lists the tags that differ, the score change per category, and the issues fixed or regressed. Pass `--json` for machine-readable output, or `--fail-on-regression` to exit 1 when B is worse than A.
