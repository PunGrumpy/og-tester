"use client";

import { useEffect } from "react";

/**
 * The last resort, for a throw in the root layout itself.
 *
 * This one replaces the document, so it ships its own <html> and <body> and
 * cannot use anything from the layout — including the fonts and the theme.
 * Everything here is inline for that reason; it is not a style choice.
 */
const GlobalError = ({ error }: { error: Error & { digest?: string } }) => {
  useEffect(() => {
    console.error("Root layout error", error.digest ?? "", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
          margin: 0,
          minHeight: "100vh",
          padding: "4rem 1.5rem",
        }}
      >
        <main style={{ margin: "0 auto", maxWidth: "34rem" }}>
          <h1
            style={{
              fontSize: "1.5rem",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            OG Tester could not start
          </h1>
          <p style={{ lineHeight: 1.6, marginTop: "0.75rem" }}>
            Something failed before the page could load. Reloading usually
            clears it.
          </p>
          {error.digest ? (
            <p
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, monospace",
                fontSize: "0.8rem",
                opacity: 0.7,
              }}
            >
              {`Reference: ${error.digest}`}
            </p>
          ) : null}
          {/* A plain anchor on purpose: this renders in place of the root
              layout, so there is no router for next/link to use, and a full
              document load is exactly what recovery means here. */}
          {/* oxlint-disable-next-line next/no-html-link-for-pages */}
          <a href="/" style={{ display: "inline-block", marginTop: "1.5rem" }}>
            Reload
          </a>
        </main>
      </body>
    </html>
  );
};

export default GlobalError;
