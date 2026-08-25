import Link from "next/link";

import { Container } from "@/components/layout";

import { Icons } from "../icons";
import { CommandChip } from "./command-chip";

/**
 * Not sticky, and carrying no background or rule of its own: it sits in the
 * same field as the hero below it, which is what keeps the top of the page
 * quiet. That also leaves it with no state to track, so it stays on the server.
 */
export const Header = () => (
  <header className="relative z-10">
    <Container className="flex min-h-9 items-center justify-between gap-2 py-5 sm:gap-4">
      <Link
        className="flex min-w-0 items-center gap-2 overflow-hidden rounded-sm text-inherit focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        href="/"
      >
        <Icons.logo aria-hidden="true" className="size-[18px] shrink-0" />
        <span aria-hidden="true" className="shrink-0 text-muted-foreground/60">
          <svg fill="none" height="16" viewBox="0 0 16 16" width="16">
            <path
              d="M10.75 1.5 5.25 14.5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.5"
            />
          </svg>
        </span>
        <span className="truncate font-medium text-lg tracking-tight">
          OG Tester
        </span>
      </Link>

      <CommandChip />
    </Container>
  </header>
);
