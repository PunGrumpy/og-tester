"use client";

import { useMemo } from "react";

import type { PageScoreResult } from "@/hooks/use-scanner-store";
import type { PageTreeNode } from "@/lib/reports/page-tree";
import { buildPageTree, pathOf } from "@/lib/reports/page-tree";
import type { Standing } from "@/lib/reports/verdict";
import { getStanding } from "@/lib/reports/verdict";
import { cn } from "@/lib/utils";

import { ReportSection } from "./section";

const CHIP_TONE: Record<Standing, string> = {
  clean:
    "text-score-excellent border-score-excellent/35 bg-score-excellent/[0.07]",
  partial: "text-score-fair border-score-fair/35 bg-score-fair/[0.07]",
  weak: "text-score-poor border-score-poor/35 bg-score-poor/[0.07]",
};

const Chip = ({ page }: { page: PageScoreResult }) => {
  const standing = getStanding(page.score);
  const path = pathOf(page.url);

  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-2 rounded-md border px-2.5 py-1.5 font-mono text-xs leading-none",
        CHIP_TONE[standing]
      )}
      title={page.url}
    >
      <span className="truncate">{path}</span>
      <span className="text-muted-foreground shrink-0 tabular-nums">
        {page.score}
      </span>
    </span>
  );
};

const Branch = ({ nodes }: { nodes: PageTreeNode[] }) => (
  <ul className="m-0 grid list-none gap-2 p-0">
    {nodes.map((node) => (
      <li className="m-0 min-w-0" key={node.page.url ?? pathOf(node.page.url)}>
        <Chip page={node.page} />
        {node.children.length > 0 ? (
          <div className="mt-2 ml-3 border-l pl-4">
            <Branch nodes={node.children} />
          </div>
        ) : null}
      </li>
    ))}
  </ul>
);

export const PageTree = ({ pages }: { pages: PageScoreResult[] }) => {
  const roots = useMemo(() => buildPageTree(pages), [pages]);
  const linked = pages.filter((page) => page.foundOn).length;

  if (pages.length < 2) {
    return null;
  }

  return (
    <ReportSection
      description={
        linked > 0
          ? `${pages.length} pages, ${linked} of them reached by following a link from the page above it.`
          : `${pages.length} pages, listed by the site's sitemap rather than reached by a link, so they are grouped by path.`
      }
      id="page-tree"
      title="How these pages were found"
    >
      <Branch nodes={roots} />
    </ReportSection>
  );
};
