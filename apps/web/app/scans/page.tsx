import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ScoreList } from "@/components/home/score-list";
import { Container } from "@/components/layout";
import { createMetadata } from "@/lib/metadata";
import { listReports } from "@/lib/reports/store";

/** Rows per page. Enough to fill a screen without becoming a wall. */
const PER_PAGE = 25;

export const metadata: Metadata = createMetadata(
  "All scans | OG Tester",
  "Every site scanned with OG Tester, newest first, with its last known metadata score."
);

const parsePage = (raw: string | string[] | undefined): number => {
  const value = Number(Array.isArray(raw) ? raw[0] : (raw ?? "1"));
  return Number.isInteger(value) && value >= 1 ? value : 1;
};

const LINK_CLASS =
  "inline-flex min-h-9 items-center rounded-md border px-3 text-sm transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none dark:hover:bg-muted/50";

/**
 * At the ends of the range there is nowhere to go, and a disabled link is not
 * a thing — so it renders as plain text rather than a control that ignores
 * you.
 */
const PageLink = ({
  disabled,
  label,
  page,
  rel,
}: {
  disabled: boolean;
  label: string;
  page: number;
  rel: "prev" | "next";
}) =>
  disabled ? (
    <span className="inline-flex min-h-9 items-center px-3 text-muted-foreground/60 text-sm">
      {label}
    </span>
  ) : (
    <Link
      className={LINK_CLASS}
      href={page <= 1 ? "/scans" : `/scans?page=${page}`}
      rel={rel}
    >
      {label}
    </Link>
  );

const ScansPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) => {
  const params = await searchParams;
  const page = parsePage(params.page);
  const { entries, total } = await listReports((page - 1) * PER_PAGE, PER_PAGE);
  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));

  // A page number past the end is a wrong URL, not an empty list — say so
  // rather than showing a heading over nothing.
  if (page > lastPage && total > 0) {
    notFound();
  }

  return (
    <>
      <Container className="pt-14 pb-2 sm:pt-20">
        <h1 className="m-0 text-balance font-semibold text-2xl tracking-tight">
          All scans
        </h1>
        <p className="mt-2 max-w-2xl text-pretty text-muted-foreground">
          {total === 0
            ? "Nothing has been scanned yet. Enter a URL on the home page to be the first."
            : `${total} ${total === 1 ? "site" : "sites"}, newest first. Every row links to that site's full report.`}
        </p>
      </Container>

      <ScoreList
        aside={total === 0 ? undefined : `Page ${page} of ${lastPage}`}
        entries={entries}
        id="all-scans"
        title="Scanned sites"
      />

      {lastPage > 1 ? (
        <Container className="pb-16">
          {/* Two links, not a numbered strip: the list is chronological, so
              "older" and "newer" say more than a page number would. */}
          <nav
            aria-label="Pagination"
            className="flex items-center justify-between gap-4 border-t pt-4"
          >
            <PageLink
              disabled={page <= 1}
              label="Newer"
              page={page - 1}
              rel="prev"
            />
            <span
              aria-hidden="true"
              className="font-mono text-muted-foreground text-sm tabular-nums"
            >
              {`${page} / ${lastPage}`}
            </span>
            <PageLink
              disabled={page >= lastPage}
              label="Older"
              page={page + 1}
              rel="next"
            />
          </nav>
        </Container>
      ) : null}
    </>
  );
};

export default ScansPage;
