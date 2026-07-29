"use client";

import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import React, { useState, useMemo } from "react";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PageScoreResult } from "@/hooks/use-scanner-store";
import { collapse } from "@/lib/motion";
import { cn } from "@/lib/utils";

import { ReportSection } from "../report-section";
import { ScoreBadge } from "../score-badge";
import { PageDetail } from "./page-detail";

interface PagesTableProps {
  pages: PageScoreResult[];
}

type SortField = "url" | "score" | "og" | "twitter" | "seo" | "image";
type SortOrder = "asc" | "desc";

const safeGetPathname = (url: string | undefined | null): string => {
  if (!url) {
    return "/";
  }
  try {
    if (url.startsWith("/")) {
      return url;
    }
    const absoluteUrl = url.includes("://") ? url : `https://${url}`;
    return new URL(absoluteUrl).pathname || "/";
  } catch {
    return url;
  }
};

const getCategoryScore = (page: PageScoreResult, id: string): number => {
  const cat = page.categories.find((c) => c.id === id);
  if (!cat) {
    return 0;
  }
  // Return percentage
  return cat.maxScore > 0 ? Math.round((cat.score / cat.maxScore) * 100) : 0;
};

const SortIndicator = ({
  field,
  sortBy,
  sortOrder,
}: {
  field: SortField;
  sortBy: SortField;
  sortOrder: SortOrder;
}) => {
  if (sortBy !== field) {
    return null;
  }
  return sortOrder === "asc" ? (
    <ChevronUp
      aria-hidden="true"
      className="inline-block size-3 ml-1 shrink-0"
    />
  ) : (
    <ChevronDown
      aria-hidden="true"
      className="inline-block size-3 ml-1 shrink-0"
    />
  );
};

interface SortColumn {
  field: SortField;
  label: string;
  center?: boolean;
  desktopOnly?: boolean;
}

const SORT_COLUMNS: SortColumn[] = [
  { field: "url", label: "Page Path" },
  { center: true, field: "score", label: "Overall" },
  { center: true, desktopOnly: true, field: "og", label: "OG" },
  { center: true, desktopOnly: true, field: "twitter", label: "Twitter" },
  { center: true, desktopOnly: true, field: "seo", label: "SEO" },
  { center: true, desktopOnly: true, field: "image", label: "Image" },
];

// The sort control is a real button inside the header cell so it is reachable
// by keyboard, and `aria-sort` exposes the current direction.
const SortableHead = ({
  column,
  sortBy,
  sortOrder,
  onSort,
}: {
  column: SortColumn;
  sortBy: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
}) => {
  const isActive = sortBy === column.field;

  const ariaSort = (() => {
    if (!isActive) {
      return "none";
    }
    return sortOrder === "asc" ? "ascending" : "descending";
  })();

  return (
    <TableHead
      aria-sort={ariaSort}
      className={cn(
        "h-auto p-0 font-semibold",
        column.desktopOnly && "hidden sm:table-cell"
      )}
    >
      <button
        className={cn(
          "flex w-full items-center gap-1 px-2 py-2.5 transition-[color,transform] duration-240 hover:text-primary active:scale-[0.96]",
          column.center ? "justify-center" : "justify-start"
        )}
        onClick={() => onSort(column.field)}
        type="button"
      >
        {column.label}
        <SortIndicator
          field={column.field}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      </button>
    </TableHead>
  );
};

export const PagesTable = ({ pages }: PagesTableProps) => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("score");
  // default asc to show lowest scores first (needs fix)
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const toggleRow = (url: string) => {
    const next = new Set(expandedRows);
    if (next.has(url)) {
      next.delete(url);
    } else {
      next.add(url);
    }
    setExpandedRows(next);
  };

  const filteredAndSortedPages = useMemo(() => {
    // Filter
    const filtered = pages.filter((page) => {
      const path = safeGetPathname(page.url).toLowerCase();
      return path.includes(search.toLowerCase());
    });

    // Sort
    return filtered.toSorted((a, b) => {
      let valA: string | number = "";
      let valB: string | number = "";

      if (sortBy === "url") {
        valA = safeGetPathname(a.url);
        valB = safeGetPathname(b.url);
      } else if (sortBy === "score") {
        valA = a.score;
        valB = b.score;
      } else {
        valA = getCategoryScore(a, sortBy);
        valB = getCategoryScore(b, sortBy);
      }

      if (valA < valB) {
        return sortOrder === "asc" ? -1 : 1;
      }
      if (valA > valB) {
        return sortOrder === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [pages, search, sortBy, sortOrder]);

  const pageCount = pages.length;

  return (
    <ReportSection
      description={
        pageCount === 1 ? "1 page scanned" : `${pageCount} pages scanned`
      }
      title="Pages"
    >
      <div className="relative max-w-sm">
        <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
          <Search aria-hidden="true" className="size-4" />
        </span>
        <Input
          aria-label="Filter by page path"
          className="pl-9 focus-visible:ring-primary/50"
          placeholder="Filter by page path (e.g. /blog)…"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <span className="sr-only">Expand page details</span>
              </TableHead>
              {SORT_COLUMNS.map((column) => (
                <SortableHead
                  column={column}
                  key={column.field}
                  onSort={handleSort}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                />
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedPages.length === 0 ? (
              <TableRow>
                <TableCell
                  className="py-8 text-center text-muted-foreground text-sm"
                  colSpan={7}
                >
                  No pages match “{search}”.{" "}
                  <button
                    className="font-medium text-foreground underline underline-offset-4"
                    onClick={() => setSearch("")}
                    type="button"
                  >
                    Clear filter
                  </button>
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedPages.map((page) => {
                const urlKey = page.url || "";
                const isExpanded = expandedRows.has(urlKey);
                const path = safeGetPathname(page.url);

                return (
                  <React.Fragment key={urlKey}>
                    <TableRow
                      className="cursor-pointer hover:bg-muted/30 transition-colors duration-140"
                      onClick={() => toggleRow(urlKey)}
                    >
                      <TableCell className="p-0 text-center">
                        <button
                          aria-expanded={isExpanded}
                          aria-label={`${isExpanded ? "Hide" : "Show"} details for ${path || "/"}`}
                          className="inline-flex size-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleRow(urlKey);
                          }}
                          type="button"
                        >
                          {isExpanded ? (
                            <ChevronUp aria-hidden="true" className="size-4" />
                          ) : (
                            <ChevronDown
                              aria-hidden="true"
                              className="size-4"
                            />
                          )}
                        </button>
                      </TableCell>
                      <TableCell
                        className="max-w-[200px] truncate py-1.5 font-mono font-semibold text-foreground text-xs sm:max-w-md"
                        title={path || "/"}
                      >
                        {path || "/"}
                      </TableCell>
                      <TableCell className="py-1.5 text-center font-semibold">
                        <ScoreBadge score={page.score} />
                      </TableCell>
                      <TableCell className="hidden py-1.5 text-center font-mono text-muted-foreground text-xs tabular-nums sm:table-cell">
                        {getCategoryScore(page, "og")}%
                      </TableCell>
                      <TableCell className="hidden py-1.5 text-center font-mono text-muted-foreground text-xs tabular-nums sm:table-cell">
                        {getCategoryScore(page, "twitter")}%
                      </TableCell>
                      <TableCell className="hidden py-1.5 text-center font-mono text-muted-foreground text-xs tabular-nums sm:table-cell">
                        {getCategoryScore(page, "seo")}%
                      </TableCell>
                      <TableCell className="hidden py-1.5 text-center font-mono text-muted-foreground text-xs tabular-nums sm:table-cell">
                        {getCategoryScore(page, "image")}%
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-transparent border-t-0">
                      <TableCell className="p-0 border-t-0" colSpan={7}>
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <m.div {...collapse} className="overflow-hidden">
                              <PageDetail result={page} />
                            </m.div>
                          )}
                        </AnimatePresence>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </ReportSection>
  );
};
