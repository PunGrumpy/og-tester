"use client";

import { ChevronDown, ChevronUp, Search } from "lucide-react";
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

import { PageDetail } from "./page-detail";
import { ScoreBadge } from "./score-badge";

interface PagesTableProps {
  pages: PageScoreResult[];
}

type SortField = "url" | "score" | "og" | "twitter" | "seo" | "image";
type SortOrder = "asc" | "desc";

const getCategoryScore = (page: PageScoreResult, id: string): number => {
  const cat = page.categories.find((c) => c.id === id);
  if (!cat) {
    return 0;
  }
  // Return percentage
  return cat.maxScore > 0 ? Math.round((cat.score / cat.maxScore) * 100) : 0;
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
      const path = page.url ? new URL(page.url).pathname.toLowerCase() : "/";
      return path.includes(search.toLowerCase());
    });

    // Sort
    return filtered.toSorted((a, b) => {
      let valA: string | number = "";
      let valB: string | number = "";

      if (sortBy === "url") {
        valA = a.url ? new URL(a.url).pathname : "";
        valB = b.url ? new URL(b.url).pathname : "";
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

  const renderSortIndicator = (field: SortField) => {
    if (sortBy !== field) {
      return null;
    }
    return sortOrder === "asc" ? (
      <ChevronUp className="inline-block size-3 ml-1 shrink-0" />
    ) : (
      <ChevronDown className="inline-block size-3 ml-1 shrink-0" />
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-sm">
        <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
          <Search className="size-4" />
        </span>
        <Input
          className="pl-9 focus-visible:ring-primary/50 shadow-xs"
          placeholder="Filter by page path (e.g. /blog)..."
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead
                className="cursor-pointer select-none font-semibold hover:text-primary transition-colors active:scale-[0.98] duration-200"
                onClick={() => handleSort("url")}
              >
                Page Path {renderSortIndicator("url")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none font-semibold text-center hover:text-primary transition-colors active:scale-[0.98] duration-200"
                onClick={() => handleSort("score")}
              >
                Overall {renderSortIndicator("score")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none font-semibold text-center hover:text-primary transition-colors active:scale-[0.98] duration-200 hidden sm:table-cell"
                onClick={() => handleSort("og")}
              >
                OG {renderSortIndicator("og")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none font-semibold text-center hover:text-primary transition-colors active:scale-[0.98] duration-200 hidden sm:table-cell"
                onClick={() => handleSort("twitter")}
              >
                Twitter {renderSortIndicator("twitter")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none font-semibold text-center hover:text-primary transition-colors active:scale-[0.98] duration-200 hidden sm:table-cell"
                onClick={() => handleSort("seo")}
              >
                SEO {renderSortIndicator("seo")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none font-semibold text-center hover:text-primary transition-colors active:scale-[0.98] duration-200 hidden sm:table-cell"
                onClick={() => handleSort("image")}
              >
                Image {renderSortIndicator("image")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedPages.length === 0 ? (
              <TableRow>
                <TableCell
                  className="text-center py-8 text-muted-foreground text-sm"
                  colSpan={7}
                >
                  No matching pages found.
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedPages.map((page) => {
                const urlKey = page.url || "";
                const isExpanded = expandedRows.has(urlKey);
                const path = page.url ? new URL(page.url).pathname : "/";

                return (
                  <React.Fragment key={urlKey}>
                    <TableRow
                      className="cursor-pointer hover:bg-muted/30 transition-colors duration-150"
                      onClick={() => toggleRow(urlKey)}
                    >
                      <TableCell className="p-4 text-center">
                        {isExpanded ? (
                          <ChevronUp className="size-4 text-muted-foreground inline" />
                        ) : (
                          <ChevronDown className="size-4 text-muted-foreground inline" />
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-semibold text-foreground max-w-[200px] sm:max-w-md truncate">
                        {path || "/"}
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        <ScoreBadge score={page.score} />
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs text-muted-foreground tabular-nums hidden sm:table-cell">
                        {getCategoryScore(page, "og")}%
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs text-muted-foreground tabular-nums hidden sm:table-cell">
                        {getCategoryScore(page, "twitter")}%
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs text-muted-foreground tabular-nums hidden sm:table-cell">
                        {getCategoryScore(page, "seo")}%
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs text-muted-foreground tabular-nums hidden sm:table-cell">
                        {getCategoryScore(page, "image")}%
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow className="hover:bg-transparent border-t-0">
                        <TableCell className="p-0" colSpan={7}>
                          <PageDetail result={page} />
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
