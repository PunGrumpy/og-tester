<div align="center">
    <h1>🧪 OG Tester</h1>
    <p>A tool to help you debug and preview your meta, Twitter, and Open Graph tags</p>
    <img src="http://og.pungrumpy.com/preview.png" alt="Preview" />
</div>

## ✨ Features

- 🔍 **URL Testing** - Enter any URL to fetch and analyze its meta tags
- 📱 **Multi-Platform Previews** - See how your links appear on:
  - Twitter/X
  - Slack
  - Facebook
  - LinkedIn
  - Discord
  - WhatsApp
- 📊 **Comprehensive Meta Tags Table** - View and inspect all meta tags organized by category:
  - **General Tags** - title, description, author, viewport, canonical URL, robots, keywords, theme colors
  - **Open Graph Tags** - og:title, og:description, og:image, og:url, og:type, og:site_name, og:locale, image dimensions
  - **Twitter Tags** - twitter:card, twitter:title, twitter:description, twitter:image, twitter:site, twitter:creator
  - **Icons Panel** - Display all favicons with sizes and types
- 🖼️ **Image Previews** - Visual preview of Open Graph and Twitter Card images

## 🔀 Comparing two pages

When a link preview breaks, `og-tester diff` shows what differs between a page that works and one that doesn't, such as staging against production or before against after a deploy.

```sh
og-tester diff https://example.com https://staging.example.com
```

```text
A 63 → B 23 (−40)

Differing tags:   title, description, og:url, ...
Categories:       og 20 → 6 (−14), twitter 10 → 0 (−10), ...
Regressed (only in B): og:url, twitter:card, ...
Fixed (only in A):     ...
```

- URLs without a scheme default to `https://`.
- `--json` prints the diff (`a`, `b`, `scoreDelta`, `categories`, `tags`, `fixed`, `regressed`) to stdout. Errors go to stderr as `{ "error": "..." }`.
- `--fail-on-regression` exits 1 when B scores lower than A or has a diagnostic A doesn't, so a deploy pipeline can gate on it.
- A diagnostic counts as the same on both sides when it targets the same tag. A tag whose message changed (a title going from 61 to 65 characters) shows up in the score and category deltas, not in the Fixed and Regressed lists.
- Only the general, Open Graph and Twitter tags that `check` reports are compared. Favicons are not.

## 🤝 Contributing

See [CONTRIBUTING.md](https://github.com/PunGrumpy/og-tester/blob/main/CONTRIBUTING.md) for setup, environment variables, and the `bun run check` workflow.

## 📝 License

Licensed under the [MIT License](LICENSE).
