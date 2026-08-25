import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata(
  "Page not found | OG Tester",
  "The page you are looking for does not exist."
);

const NotFound = () => (
  <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-5 py-24 text-center">
    <p className="font-mono text-muted-foreground text-sm">404</p>

    <h1 className="text-balance font-semibold text-4xl leading-[1.05] tracking-[-0.04em] sm:text-5xl">
      Page not found
    </h1>

    <p className="max-w-md text-pretty text-muted-foreground">
      The page you are looking for does not exist.
    </p>

    <Link
      className="inline-flex h-11 items-center rounded-md border border-primary bg-primary px-5 font-medium text-[15px] text-primary-foreground transition-opacity hover:opacity-85 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
      href="/"
    >
      Back to home
    </Link>
  </Container>
);

export default NotFound;
