"use client";

import { useEffect } from "react";

const GlobalError = ({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) => {
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
          <button
            onClick={() => retry()}
            style={{
              background: "none",
              border: "1px solid currentColor",
              borderRadius: "0.375rem",
              cursor: "pointer",
              font: "inherit",
              marginTop: "1.5rem",
              padding: "0.5rem 0.875rem",
            }}
            type="button"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
};

export default GlobalError;
