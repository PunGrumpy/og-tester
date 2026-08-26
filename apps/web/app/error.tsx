"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Container } from "@/components/layout";
import { SECONDARY_BUTTON } from "@/components/secondary-button";

const RouteError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    console.error("Route error", error.digest ?? "", error);
  }, [error]);

  return (
    <Container className="flex flex-col items-start gap-5 py-20">
      <div className="grid gap-2">
        <h1 className="m-0 text-2xl font-semibold tracking-tight text-balance">
          This page could not be shown
        </h1>
        <p className="max-w-measure text-muted-foreground text-pretty">
          Something in the report failed to render. Trying again usually works;
          if it does not, the site being scanned may have metadata we cannot
          read yet.
        </p>
        {error.digest ? (
          <p className="text-muted-foreground mt-1 font-mono text-xs">
            {`Reference: ${error.digest}`}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          className="border-primary bg-primary text-primary-foreground focus-visible:ring-ring/50 inline-flex min-h-9 items-center rounded-md border px-4 text-sm font-medium transition-opacity hover:opacity-85 focus-visible:ring-[3px] focus-visible:outline-none active:scale-[0.96]"
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
