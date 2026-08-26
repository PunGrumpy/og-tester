import Link from "next/link";
import { Suspense } from "react";

import { Container } from "@/components/layout";

import { Icons } from "../icons";
import { CommandChip, CommandChipFallback } from "./command-chip";

export const Header = () => (
  <header className="relative z-10">
    <Container className="flex min-h-9 items-center justify-between gap-2 py-5 sm:gap-4">
      <Link
        className="focus-visible:ring-ring/50 flex min-w-0 items-center gap-2 overflow-hidden rounded-sm text-inherit focus-visible:ring-[3px] focus-visible:outline-none"
        href="/"
      >
        <Icons.Logo aria-hidden="true" className="size-[18px] shrink-0" />
        <span aria-hidden="true" className="text-muted-foreground/60 shrink-0">
          <svg fill="none" height="16" viewBox="0 0 16 16" width="16">
            <path
              d="M10.75 1.5 5.25 14.5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.5"
            />
          </svg>
        </span>
        <span className="truncate text-lg font-medium tracking-tight">
          OG Tester
        </span>
      </Link>

      <Suspense fallback={<CommandChipFallback />}>
        <CommandChip />
      </Suspense>
    </Container>
  </header>
);
