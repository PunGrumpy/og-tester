import * as Effect from "effect/Effect";

import { OgDiagnostic } from "../schemas/diagnostic";
import type { OgData } from "../schemas/og";
import type { ImageMeta } from "./image";

export interface OgRule {
  tag: string;
  weight: number;
  category: "og" | "twitter" | "seo" | "image";
  check: (
    data: OgData,
    context?: { pageUrl?: string; imageMeta?: ImageMeta | null }
  ) => Effect.Effect<OgDiagnostic | null>;
}

// Helpers to construct rules
const createMissingRule = (
  tag: keyof OgData,
  weight: number,
  category: "og" | "twitter" | "seo" | "image",
  severity: "error" | "warning" | "info",
  message: string,
  suggestion: string
): OgRule => ({
  category,
  check: (data) =>
    Effect.succeed(
      data[tag]
        ? null
        : new OgDiagnostic({
            message,
            points: weight,
            severity,
            suggestion,
            tag: String(tag),
          })
    ),
  tag: String(tag),
  weight,
});

export const ogRules: OgRule[] = [
  // ==========================================
  // Category 1: Open Graph (weight: 40)
  // ==========================================
  {
    category: "og",
    check: (data) => {
      const val = data["og:title"];
      if (!val) {
        return Effect.succeed(
          new OgDiagnostic({
            message: "Missing og:title tag",
            points: 10,
            severity: "error",
            suggestion:
              '<meta property="og:title" content="Your Page Title" />',
            tag: "og:title",
          })
        );
      }
      const len = val.length;
      if (len < 30 || len > 60) {
        return Effect.succeed(
          new OgDiagnostic({
            message: `og:title length (${len}) is not optimal (30-60 characters)`,
            // minor deduction for suboptimal length
            points: 4,
            severity: "warning",
            suggestion: `Make your og:title between 30 and 60 characters. Current is: "${val}"`,
            tag: "og:title",
          })
        );
      }
      return Effect.succeed(null);
    },
    tag: "og:title",
    weight: 10,
  },
  {
    category: "og",
    check: (data) => {
      const val = data["og:description"];
      if (!val) {
        return Effect.succeed(
          new OgDiagnostic({
            message: "Missing og:description tag",
            points: 10,
            severity: "error",
            suggestion:
              '<meta property="og:description" content="Your page description here." />',
            tag: "og:description",
          })
        );
      }
      const len = val.length;
      if (len < 55 || len > 200) {
        return Effect.succeed(
          new OgDiagnostic({
            message: `og:description length (${len}) is not optimal (55-200 characters)`,
            points: 4,
            severity: "warning",
            suggestion: `Make your og:description between 55 and 200 characters. Current length: ${len}`,
            tag: "og:description",
          })
        );
      }
      return Effect.succeed(null);
    },
    tag: "og:description",
    weight: 10,
  },
  createMissingRule(
    "og:image",
    10,
    "og",
    "error",
    "Missing og:image tag",
    '<meta property="og:image" content="https://example.com/og-image.png" />'
  ),
  {
    category: "og",
    check: (data) => {
      const val = data["og:url"];
      if (!val) {
        return Effect.succeed(
          new OgDiagnostic({
            message: "Missing og:url tag",
            points: 4,
            severity: "warning",
            suggestion:
              '<meta property="og:url" content="https://example.com/page-path" />',
            tag: "og:url",
          })
        );
      }
      try {
        const _url = new URL(val);
        return Effect.succeed(null);
      } catch {
        return Effect.succeed(
          new OgDiagnostic({
            message: "og:url is not a valid absolute URL",
            points: 2,
            severity: "warning",
            suggestion: `Ensure og:url is an absolute URL (e.g., https://example.com/path). Current: "${val}"`,
            tag: "og:url",
          })
        );
      }
    },
    tag: "og:url",
    weight: 4,
  },
  createMissingRule(
    "og:type",
    2,
    "og",
    "info",
    "Missing og:type tag",
    '<meta property="og:type" content="website" />'
  ),
  createMissingRule(
    "og:locale",
    2,
    "og",
    "info",
    "Missing og:locale tag",
    '<meta property="og:locale" content="en_US" />'
  ),
  createMissingRule(
    "og:site_name",
    2,
    "og",
    "info",
    "Missing og:site_name tag",
    '<meta property="og:site_name" content="Your Site Name" />'
  ),

  // ==========================================
  // Category 2: Twitter Card (weight: 20)
  // ==========================================
  {
    category: "twitter",
    check: (data) => {
      const val = data["twitter:card"];
      if (!val) {
        return Effect.succeed(
          new OgDiagnostic({
            message: "Missing twitter:card tag",
            points: 5,
            severity: "warning",
            suggestion:
              '<meta name="twitter:card" content="summary_large_image" />',
            tag: "twitter:card",
          })
        );
      }
      const validCards = ["summary", "summary_large_image", "app", "player"];
      if (!validCards.includes(val)) {
        return Effect.succeed(
          new OgDiagnostic({
            message: `Invalid twitter:card value: "${val}"`,
            points: 3,
            severity: "warning",
            suggestion:
              'Use one of: "summary", "summary_large_image", "app", "player"',
            tag: "twitter:card",
          })
        );
      }
      return Effect.succeed(null);
    },
    tag: "twitter:card",
    weight: 5,
  },
  {
    category: "twitter",
    check: (data) => {
      const val = data["twitter:title"];
      if (!val) {
        return Effect.succeed(
          new OgDiagnostic({
            message: "Missing twitter:title tag",
            points: 5,
            severity: "warning",
            suggestion:
              '<meta name="twitter:title" content="Your Page Title" />',
            tag: "twitter:title",
          })
        );
      }
      const len = val.length;
      if (len < 30 || len > 60) {
        return Effect.succeed(
          new OgDiagnostic({
            message: `twitter:title length (${len}) is not optimal (30-60 characters)`,
            points: 2,
            severity: "info",
            suggestion: `Keep twitter:title between 30 and 60 characters for optimal display. Current: "${val}"`,
            tag: "twitter:title",
          })
        );
      }
      return Effect.succeed(null);
    },
    tag: "twitter:title",
    weight: 5,
  },
  {
    category: "twitter",
    check: (data) => {
      const val = data["twitter:description"];
      if (!val) {
        return Effect.succeed(
          new OgDiagnostic({
            message: "Missing twitter:description tag",
            points: 5,
            severity: "warning",
            suggestion:
              '<meta name="twitter:description" content="Your page description." />',
            tag: "twitter:description",
          })
        );
      }
      const len = val.length;
      if (len < 55 || len > 200) {
        return Effect.succeed(
          new OgDiagnostic({
            message: `twitter:description length (${len}) is not optimal (55-200 characters)`,
            points: 2,
            severity: "info",
            suggestion: `Keep twitter:description between 55 and 200 characters. Current length: ${len}`,
            tag: "twitter:description",
          })
        );
      }
      return Effect.succeed(null);
    },
    tag: "twitter:description",
    weight: 5,
  },
  createMissingRule(
    "twitter:image",
    3,
    "twitter",
    "warning",
    "Missing twitter:image tag",
    '<meta name="twitter:image" content="https://example.com/og-image.png" />'
  ),
  createMissingRule(
    "twitter:site",
    2,
    "twitter",
    "info",
    "Missing twitter:site tag",
    '<meta name="twitter:site" content="@yourusername" />'
  ),

  // ==========================================
  // Category 3: Core SEO (weight: 25)
  // ==========================================
  {
    category: "seo",
    check: (data) => {
      const val = data["title"];
      if (!val) {
        return Effect.succeed(
          new OgDiagnostic({
            message: "Missing <title> tag",
            points: 6,
            severity: "error",
            suggestion: "<title>Your page title for search results</title>",
            tag: "title",
          })
        );
      }
      const len = val.length;
      if (len < 30 || len > 60) {
        return Effect.succeed(
          new OgDiagnostic({
            message: `<title> tag length (${len}) is not optimal (30-60 characters)`,
            points: 2,
            severity: "warning",
            suggestion: `Adjust your title tag length to be between 30 and 60 characters. Current: "${val}"`,
            tag: "title",
          })
        );
      }
      return Effect.succeed(null);
    },
    tag: "title",
    weight: 6,
  },
  {
    category: "seo",
    check: (data) => {
      const val = data["description"];
      if (!val) {
        return Effect.succeed(
          new OgDiagnostic({
            message: "Missing meta description",
            points: 6,
            severity: "error",
            suggestion:
              '<meta name="description" content="A brief summary of the page content." />',
            tag: "description",
          })
        );
      }
      const len = val.length;
      if (len < 50 || len > 160) {
        return Effect.succeed(
          new OgDiagnostic({
            message: `Meta description length (${len}) is not optimal (50-160 characters)`,
            points: 2,
            severity: "warning",
            suggestion: `Keep meta description between 50 and 160 characters for search snippets. Current length: ${len}`,
            tag: "description",
          })
        );
      }
      return Effect.succeed(null);
    },
    tag: "description",
    weight: 6,
  },
  {
    category: "seo",
    check: (data, context) => {
      const val = data["canonical"];
      if (!val) {
        return Effect.succeed(
          new OgDiagnostic({
            message: "Missing link[rel=canonical] tag",
            points: 5,
            severity: "warning",
            suggestion:
              '<link rel="canonical" href="https://example.com/page-canonical" />',
            tag: "canonical",
          })
        );
      }
      try {
        const _url = new URL(val);
      } catch {
        return Effect.succeed(
          new OgDiagnostic({
            message: "Canonical URL is not a valid absolute URL",
            points: 3,
            severity: "warning",
            suggestion: `Ensure the canonical URL is absolute. Current: "${val}"`,
            tag: "canonical",
          })
        );
      }

      if (context?.pageUrl && val !== context.pageUrl) {
        // Allow minor difference (like trailing slash) or raise a warning
        try {
          const u1 = new URL(val);
          const u2 = new URL(context.pageUrl);
          if (
            u1.origin !== u2.origin ||
            u1.pathname.replace(/\/$/u, "") !== u2.pathname.replace(/\/$/u, "")
          ) {
            return Effect.succeed(
              new OgDiagnostic({
                message: `Canonical URL (${val}) does not match current page URL (${context.pageUrl})`,
                points: 2,
                severity: "warning",
                suggestion: `The canonical tag should point to the primary URL of this page.`,
                tag: "canonical",
              })
            );
          }
        } catch {
          // ignore parsing error here
        }
      }
      return Effect.succeed(null);
    },
    tag: "canonical",
    weight: 5,
  },
  {
    category: "seo",
    check: (data) => {
      const val = data["robots"];
      if (val && val.toLowerCase().includes("noindex")) {
        return Effect.succeed(
          new OgDiagnostic({
            message: "Page has noindex directives in robots meta tag",
            points: 3,
            severity: "warning",
            suggestion: `If you want this page indexed by search engines, remove "noindex" from: "${val}"`,
            tag: "robots",
          })
        );
      }
      return Effect.succeed(null);
    },
    tag: "robots",
    weight: 3,
  },
  createMissingRule(
    "viewport",
    2,
    "seo",
    "warning",
    "Missing viewport meta tag",
    '<meta name="viewport" content="width=device-width, initial-scale=1.0" />'
  ),
  createMissingRule(
    "charset",
    1,
    "seo",
    "warning",
    "Missing charset declaration",
    '<meta charset="utf-8" />'
  ),
  createMissingRule(
    "lang",
    2,
    "seo",
    "warning",
    "Missing lang attribute on <html> tag",
    '<html lang="en">'
  ),

  // ==========================================
  // Category 4: og:image Validation (weight: 15)
  // ==========================================
  {
    category: "image",
    check: (data, context) => {
      if (!data["og:image"]) {
        return Effect.succeed(
          new OgDiagnostic({
            message:
              "Image cannot be validated because og:image tag is missing",
            points: 5,
            severity: "error",
            suggestion: "Add a valid og:image tag to pass image validations.",
            tag: "og:image:reachable",
          })
        );
      }
      const meta = context?.imageMeta;
      if (!meta || (meta.size === undefined && !meta.width)) {
        return Effect.succeed(
          new OgDiagnostic({
            message: `og:image URL is unreachable or failed to fetch: "${data["og:image"]}"`,
            points: 5,
            severity: "error",
            suggestion:
              "Verify the og:image URL is correct and publically accessible.",
            tag: "og:image:reachable",
          })
        );
      }
      return Effect.succeed(null);
    },
    tag: "og:image:reachable",
    weight: 5,
  },
  {
    category: "image",
    check: (data, context) => {
      // already covered by reachability/og:image missing
      if (!data["og:image"]) {
        return Effect.succeed(null);
      }

      // covered by reachability
      const meta = context?.imageMeta;
      if (!meta || !meta.width || !meta.height) {
        return Effect.succeed(null);
      }

      if (meta.width < 1200 || meta.height < 630) {
        return Effect.succeed(
          new OgDiagnostic({
            message: `og:image dimensions (${meta.width}x${meta.height}) are below the recommended 1200x630 pixels`,
            points: 5,
            severity: "warning",
            suggestion:
              "Use an image that is at least 1200x630 pixels for rich social sharing previews.",
            tag: "og:image:dimensions",
          })
        );
      }
      return Effect.succeed(null);
    },
    tag: "og:image:dimensions",
    weight: 5,
  },
  {
    category: "image",
    check: (data, context) => {
      if (!data["og:image"]) {
        return Effect.succeed(null);
      }
      const meta = context?.imageMeta;
      if (!meta) {
        return Effect.succeed(null);
      }

      // Extract format
      const type = meta.type?.toLowerCase() || "";
      const validFormats = [
        "png",
        "jpeg",
        "jpg",
        "webp",
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
      ];
      const isFormatValid = validFormats.some((f) => type.includes(f));

      if (!isFormatValid) {
        return Effect.succeed(
          new OgDiagnostic({
            message: `og:image format (${type || "unknown"}) is not optimal. Use PNG, JPEG, or WebP`,
            points: 3,
            severity: "warning",
            suggestion:
              "Convert your image to PNG, JPEG, or WebP. SVG and GIF are not fully supported by all social platforms.",
            tag: "og:image:format",
          })
        );
      }
      return Effect.succeed(null);
    },
    tag: "og:image:format",
    weight: 3,
  },
  {
    category: "image",
    check: (data, context) => {
      if (!data["og:image"]) {
        return Effect.succeed(null);
      }
      const meta = context?.imageMeta;
      if (!meta || !meta.size) {
        return Effect.succeed(null);
      }

      const sizeMB = meta.size / (1024 * 1024);
      if (sizeMB > 8) {
        return Effect.succeed(
          new OgDiagnostic({
            message: `og:image size (${sizeMB.toFixed(2)}MB) exceeds 8MB`,
            points: 2,
            severity: "warning",
            suggestion:
              "Compress your og:image. Some platforms (like Discord/Twitter) will not render previews for images larger than 8MB.",
            tag: "og:image:size",
          })
        );
      }
      return Effect.succeed(null);
    },
    tag: "og:image:size",
    weight: 2,
  },
];
