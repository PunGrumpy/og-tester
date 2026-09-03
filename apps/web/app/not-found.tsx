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
    <p className="text-muted-foreground font-mono text-sm">404</p>

    <h1 className="text-display font-semibold text-balance">Page not found</h1>

    <p className="text-muted-foreground max-w-md text-pretty">
      The page you are looking for does not exist.
    </p>

    <Link
      className="border-primary bg-primary text-primary-foreground focus-visible:ring-ring/50 text-md inline-flex h-11 items-center rounded-md border px-5 font-medium transition-opacity hover:opacity-85 focus-visible:ring-[3px] focus-visible:outline-none active:scale-[0.96]"
      href="/"
    >
      Back to home
    </Link>
  </Container>
);

export default NotFound;
