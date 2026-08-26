import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Suspense } from "react";

import { ScoreList } from "@/components/home/score-list";
import { Container, PageSection, SectionHeading } from "@/components/layout";
import { SECONDARY_BUTTON } from "@/components/secondary-button";
import { createMetadata } from "@/lib/metadata";
import { listReports } from "@/lib/reports/store";

const PER_PAGE = 25;

const LIST_TITLE = "Scanned sites";

export const metadata: Metadata = createMetadata(
  "All scans | OG Tester",
  "Every site scanned with OG Tester, newest first, with its last known metadata score."
);

const parsePage = (raw: string | string[] | undefined): number => {
  const value = Number(Array.isArray(raw) ? raw[0] : (raw ?? "1"));
  return Number.isInteger(value) && value >= 1 ? value : 1;
};

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
    <span className="text-muted-foreground inline-flex min-h-9 items-center px-3 text-sm">
      {label}
    </span>
  ) : (
    <Link
      className={SECONDARY_BUTTON}
      href={page <= 1 ? "/scans" : `/scans?page=${page}`}
      rel={rel}
    >
      {label}
    </Link>
  );

interface ScansPageProps {
  searchParams: Promise<{ page?: string | string[] }>;
}

/** Shared by the shell and the streamed page so the two cannot drift apart. */
const Heading = ({ children }: { children?: ReactNode }) => (
  <Container className="pt-14 pb-2 sm:pt-20">
    <h1 className="m-0 text-2xl font-semibold tracking-tight text-balance">
      All scans
    </h1>
    {children}
  </Container>
);

const Listing = async ({ searchParams }: ScansPageProps) => {
  const params = await searchParams;
  const page = parsePage(params.page);
  const { entries, total } = await listReports((page - 1) * PER_PAGE, PER_PAGE);
  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));

  if (page > lastPage && total > 0) {
    notFound();
  }

  return (
    <>
      <Heading>
        <p className="text-muted-foreground max-w-measure mt-2 text-pretty">
          {total === 0
            ? "Nothing has been scanned yet. Enter a URL on the home page to be the first."
            : `${total} ${total === 1 ? "site" : "sites"}, newest first. Every row links to that site's full report.`}
        </p>
      </Heading>

      <ScoreList
        aside={total === 0 ? undefined : `Page ${page} of ${lastPage}`}
        entries={entries}
        id="all-scans"
        title={LIST_TITLE}
      />

      {lastPage > 1 ? (
        <Container className="pb-16">
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
              className="text-muted-foreground font-mono text-sm tabular-nums"
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

/** The frame both the heading and the list land in, minus anything per-page. */
const ScansFallback = () => (
  <>
    <Heading />
    <PageSection className="py-8 sm:py-10">
      <SectionHeading title={LIST_TITLE} />
      <div className="mt-3.5 border-t" />
    </PageSection>
  </>
);

/**
 * The heading and the list frame are the same on every page of the index, so
 * they prerender. Which window you asked for comes from the URL, so the count
 * and the rows stream in.
 */
const ScansPage = ({ searchParams }: ScansPageProps) => (
  <Suspense fallback={<ScansFallback />}>
    <Listing searchParams={searchParams} />
  </Suspense>
);

export default ScansPage;
