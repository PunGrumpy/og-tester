"use client";

import { Fragment, useMemo } from "react";

import type { PageScoreResult } from "@/hooks/use-scanner-store";
import type { PageTreeNode } from "@/lib/reports/page-tree";
import { buildPageTree, labelUnder, pathOf } from "@/lib/reports/page-tree";
import type { Standing } from "@/lib/reports/verdict";
import { getStanding } from "@/lib/reports/verdict";
import { cn } from "@/lib/utils";

import { ReportSection } from "./section";

/** Every row is this tall, so a connector can meet a chip at its middle. */
const ROW = 28;
const HALF = ROW / 2;

const CHIP_TONE: Record<Standing, string> = {
  clean:
    "text-score-excellent border-score-excellent/40 bg-score-excellent/[0.06]",
  partial: "text-score-fair border-score-fair/40 bg-score-fair/[0.06]",
  weak: "text-score-poor border-score-poor/40 bg-score-poor/[0.06]",
};

const LinkGlyph = () => (
  <svg
    aria-hidden="true"
    className="size-3 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
    <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
  </svg>
);

const ListedGlyph = () => (
  <svg
    aria-hidden="true"
    className="size-3 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M8 6h12M8 12h12M8 18h12M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
  </svg>
);

const Glyph = ({ page }: { page: PageScoreResult }) =>
  page.foundOn ? <LinkGlyph /> : <ListedGlyph />;

const Chip = ({
  label,
  mixed,
  page,
}: {
  label: string;
  mixed: boolean;
  page: PageScoreResult;
}) => (
  <span
    className={cn(
      "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 font-mono text-xs leading-none",
      CHIP_TONE[getStanding(page.score)]
    )}
    style={{ height: ROW }}
    title={`${page.url ?? pathOf(page.url)} — ${page.foundOn ? `linked from ${page.foundOn}` : "listed in the sitemap"}`}
  >
    {mixed ? <Glyph page={page} /> : null}
    <span className="max-w-[22rem] truncate">{label}</span>
    <span className="text-muted-foreground tabular-nums">{page.score}</span>
  </span>
);

/** The line that carries the eye from one chip to the next along a chain. */
const Link = () => (
  <span aria-hidden="true" className="bg-border h-px w-5 shrink-0" />
);

/**
 * A node and every single-child descendant, drawn along one row, with any
 * real branch stacked underneath it.
 *
 * Collapsing chains sideways is what stops the tree becoming a tall stack:
 * only a page that led to more than one other page starts a new column.
 */
const Chain = ({
  mixed,
  node,
  parentUrl,
}: {
  mixed: boolean;
  node: PageTreeNode;
  parentUrl?: string;
}) => {
  const row: PageTreeNode[] = [node];
  let last = node;
  while (last.children.length === 1) {
    const [only] = last.children;
    if (!only) {
      break;
    }
    row.push(only);
    last = only;
  }

  const branches = last.children.length > 1 ? last.children : [];

  return (
    <div className="min-w-0">
      <div className="flex items-center" style={{ height: ROW }}>
        {row.map((step, index) => (
          <Fragment key={step.key}>
            {index > 0 ? <Link /> : null}
            <Chip
              label={labelUnder(
                step.page.url,
                index === 0 ? parentUrl : row[index - 1]?.page.url
              )}
              mixed={mixed}
              page={step.page}
            />
          </Fragment>
        ))}
      </div>

      {branches.length > 0 ? (
        <ul className="m-0 list-none p-0">
          {branches.map((child, index) => (
            <li className="relative m-0 pl-7" key={child.key}>
              {/* The spine stops at the last child rather than running past it. */}
              <span
                aria-hidden="true"
                className="bg-border absolute top-0 left-0 w-px"
                style={{
                  height: index === branches.length - 1 ? HALF : "100%",
                }}
              />
              <span
                aria-hidden="true"
                className="bg-border absolute left-0 h-px w-5"
                style={{ top: HALF }}
              />
              <Chain mixed={mixed} node={child} parentUrl={last.page.url} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

export const PageTree = ({ pages }: { pages: PageScoreResult[] }) => {
  const roots = useMemo(() => buildPageTree(pages), [pages]);
  const linked = pages.filter((page) => page.foundOn).length;
  const listed = pages.length - linked;
  // One glyph repeated down every row says nothing; it only earns its place
  // when a report holds both kinds.
  const mixed = linked > 0 && listed > 0;

  if (pages.length < 2) {
    return null;
  }

  return (
    <ReportSection
      description="A line runs from a page to the pages it linked to. Anything the sitemap listed instead sits under the nearest page above it."
      id="page-tree"
      title="How these pages were found"
    >
      <p className="text-muted-foreground m-0 flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-xs">
        <span>
          <span className="text-foreground font-medium tabular-nums">
            {pages.length}
          </span>
          {" pages"}
        </span>
        {linked > 0 ? (
          <span>
            <span className="text-foreground font-medium tabular-nums">
              {linked}
            </span>
            {" followed a link"}
          </span>
        ) : null}
        {listed > 0 ? (
          <span>
            <span className="text-foreground font-medium tabular-nums">
              {listed}
            </span>
            {" listed in the sitemap"}
          </span>
        ) : null}
      </p>

      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="grid gap-1">
          {roots.map((root) => (
            <Chain key={root.key} mixed={mixed} node={root} />
          ))}
        </div>
      </div>
    </ReportSection>
  );
};
