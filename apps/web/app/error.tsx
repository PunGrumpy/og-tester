"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Container } from "@/components/layout";
import { SECONDARY_BUTTON } from "@/components/secondary-button";

/**
 * The floor under every route.
 *
 * A report renders metadata from a site we do not control, so a value that
 * breaks a render is a question of when, not whether. Without this, one bad
 * tag takes the whole page to a blank screen; with it, the header and footer
 * survive and the reader gets a way forward.
 */
const RouteError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    // The digest is the only handle on the server-side stack, which Next
    // withholds from the client in production.
    console.error("Route error", error.digest ?? "", error);
  }, [error]);

  return (
    <Container className="flex flex-col items-start gap-5 py-20">
      <div className="grid gap-2">
        <h1 className="m-0 text-balance font-semibold text-2xl tracking-tight">
          This page could not be shown
        </h1>
        <p className="max-w-prose text-pretty text-muted-foreground">
          Something in the report failed to render. Trying again usually works;
          if it does not, the site being scanned may have metadata we cannot
          read yet.
        </p>
        {error.digest ? (
          <p className="mt-1 font-mono text-muted-foreground text-xs">
            {`Reference: ${error.digest}`}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          className="inline-flex min-h-9 items-center rounded-md border border-primary bg-primary px-4 font-medium text-primary-foreground text-sm transition-opacity hover:opacity-85 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
        <Link className={SECONDARY_BUTTON} href="/">
          Start over
        </Link>
      </div>
    </Container>
  );
};

export default RouteError;
