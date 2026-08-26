"use client";

import { useEffect } from "react";

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
