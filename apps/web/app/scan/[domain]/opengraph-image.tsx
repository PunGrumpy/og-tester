import { fetchOgTags, runScanSite } from "@og-tester/core";
import { ImageResponse } from "next/og";
import type { ReactNode } from "react";

import { domainToUrl, normalizeDomain } from "@/lib/reports/domain";
import { getReport, saveReport } from "@/lib/reports/store";
import { safeFetch } from "@/lib/safe-fetch";

export const size = {
  height: 630,
  width: 1200,
};

export const contentType = "image/png";

const DIAL_SIZE = 112;
const RADIUS = DIAL_SIZE / 4;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export interface TreeNode {
  children?: TreeNode[];
  dotColor: string;
  label: string;
}

const getDotColor = (score: number, isSubaction: boolean): string => {
  if (isSubaction) {
    // Purple for nested sub-actions / search / endpoints
    return "#8b5cf6";
  }
  if (score >= 80) {
    // Emerald green
    return "#059669";
  }
  if (score >= 50) {
    // Amber
    return "#f59e0b";
  }
  // Red
  return "#ef4444";
};

const getDomainFontSize = (length: number): string => {
  if (length > 25) {
    return "42px";
  }
  if (length > 16) {
    return "48px";
  }
  return "56px";
};

interface PathItem {
  parts: string[];
  path: string;
  score: number;
}

type SectionEntry = [string, PathItem[]];

const cleanSlug = (slug: string): string => {
  if (!slug) {
    return "page";
  }
  const cleanPath = slug.replace(/[?#].*$/u, "");
  const parts = cleanPath.split("/");
  const lastPart = parts.findLast(Boolean) || slug;
  return lastPart.length > 18 ? `${lastPart.slice(0, 16)}...` : lastPart;
};

const extractPathItems = (
  pages: { score: number; url: string }[]
): { homeScore: number; items: PathItem[] } => {
  const items: PathItem[] = [];
  const [firstPage] = pages;
  let homeScore = firstPage?.score ?? 89;

  for (const pageItem of pages) {
    try {
      const parsedUrl = new URL(pageItem.url);
      const pathname = parsedUrl.pathname.replace(/\/$/u, "");
      if (!pathname) {
        homeScore = pageItem.score;
        continue;
      }
      const parts = pathname.split("/").filter(Boolean);
      items.push({ parts, path: pathname, score: pageItem.score });
    } catch {
      // Ignore invalid URL items
    }
  }

  return { homeScore, items };
};

const groupAndSortSections = (items: PathItem[]): SectionEntry[] => {
  const sectionMap = new Map<string, PathItem[]>();
  for (const item of items) {
    const [top] = item.parts;
    if (!top) {
      continue;
    }
    if (!sectionMap.has(top)) {
      sectionMap.set(top, []);
    }
    sectionMap.get(top)?.push(item);
  }

  return [...sectionMap.entries()].toSorted(
    ([nameA, itemsA], [nameB, itemsB]) => {
      if (nameA === "docs") {
        return -1;
      }
      if (nameB === "docs") {
        return 1;
      }
      return itemsB.length - itemsA.length;
    }
  );
};

const buildBranchChild = (branchSec: SectionEntry): TreeNode => {
  const [secName, secItems] = branchSec;
  const [firstItem] = secItems;
  const parts = firstItem?.parts ?? [];
  const hasDeepSub = parts.length >= 3;
  const branchLabel = hasDeepSub ? `/${parts[1]}` : `/${secName}`;
  const subPart = hasDeepSub ? parts[2] : parts[1] || parts[0];
  const subLabel = cleanSlug(subPart || "search");
  const subScore = firstItem?.score ?? 89;

  return {
    children: [
      {
        dotColor: getDotColor(subScore, true),
        label: subLabel,
      },
    ],
    dotColor: getDotColor(subScore, false),
    label: branchLabel,
  };
};

const buildHomeTree = (
  homeScore: number,
  primarySection?: SectionEntry,
  secondarySection?: SectionEntry
): TreeNode => {
  const homeChildren: TreeNode[] = [];

  const leafName = primarySection ? primarySection[0] : "docs";
  const leafScore = primarySection?.[1]?.[0]?.score ?? homeScore;
  homeChildren.push({
    dotColor: getDotColor(leafScore, false),
    label: leafName,
  });

  const branchSec = secondarySection || primarySection;
  if (branchSec) {
    homeChildren.push(buildBranchChild(branchSec));
  }

  return {
    children: homeChildren,
    dotColor: getDotColor(homeScore, false),
    label: "home",
  };
};

const buildSectionTree = (section: SectionEntry): TreeNode => {
  const [secName, items] = section;
  const [item1, maybeItem2] = items;
  const item2 = maybeItem2 || item1;

  const parts1 = item1?.parts ?? [];
  const parts2 = item2?.parts ?? [];

  const subPart1 = parts1[1] || parts1[0] || "search";
  const subPart2 =
    parts2[1] || (items.length > 1 ? parts2[0] : undefined) || "search";

  const label1 = cleanSlug(subPart1);
  const label2 = cleanSlug(subPart2);

  const children: TreeNode[] = [
    {
      dotColor: getDotColor(item1?.score ?? 89, true),
      label: label1,
    },
  ];

  if (items.length > 1 || label2 !== label1) {
    children.push({
      dotColor: getDotColor(item2?.score ?? 89, true),
      label: label2,
    });
  }

  return {
    children,
    dotColor: getDotColor(item1?.score ?? 89, false),
    label: secName,
  };
};

const buildTreeNodes = (
  pages: { score: number; url: string }[]
): TreeNode[] => {
  if (pages.length === 0) {
    return [{ dotColor: "#059669", label: "home" }];
  }

  const { homeScore, items } = extractPathItems(pages);
  if (items.length === 0) {
    return [{ dotColor: getDotColor(homeScore, false), label: "home" }];
  }

  const sortedSections = groupAndSortSections(items);
  const [primarySection, secondarySection] = sortedSections;

  const result: TreeNode[] = [
    buildHomeTree(homeScore, primarySection, secondarySection),
  ];

  if (primarySection) {
    result.push(buildSectionTree(primarySection));
  }

  return result;
};

const BrandHeader = () => (
  <div style={{ alignItems: "center", display: "flex", gap: "12px" }}>
    <svg fill="none" height="26" viewBox="0 0 64 64" width="26">
      <path
        d="M28.08 -0.42C72.72 -5.4 77.23 61.69 33.28 63.29C-7.86 64.79 -12.3 4.1 28.08 -0.42ZM36.79 5.76C34.54 6.11 30.96 7.81 29.14 9.21C24.75 12.57 13.55 23.7 9.99 28.04C-3.7 44.73 18.28 66.82 35.96 52.58C39.99 49.33 54.71 34.91 56.56 30.9C62.77 17.47 51.56 3.5 36.79 5.76Z"
        fill="#09090b"
      />
    </svg>
    <span style={{ color: "#a1a1aa", fontSize: "22px" }}>/</span>
    <span
      style={{
        color: "#09090b",
        fontSize: "22px",
        fontWeight: 600,
        letterSpacing: "-0.02em",
      }}
    >
      OG Tester
    </span>
  </div>
);

interface ScoreGaugeProps {
  filled: number;
  score: number;
}

const ScoreGauge = ({ filled, score }: ScoreGaugeProps) => (
  <div style={{ alignItems: "center", display: "flex", gap: "28px" }}>
    <svg
      height={DIAL_SIZE}
      viewBox={`0 0 ${DIAL_SIZE} ${DIAL_SIZE}`}
      width={DIAL_SIZE}
    >
      <circle
        cx={DIAL_SIZE / 2}
        cy={DIAL_SIZE / 2}
        fill="#f4f4f5"
        r={DIAL_SIZE / 2}
      />
      {score > 0 ? (
        <circle
          cx={DIAL_SIZE / 2}
          cy={DIAL_SIZE / 2}
          fill="none"
          r={RADIUS}
          stroke="#18181b"
          strokeDasharray={`${filled} ${CIRCUMFERENCE}`}
          strokeWidth={DIAL_SIZE / 2}
          transform={`rotate(-90 ${DIAL_SIZE / 2} ${DIAL_SIZE / 2})`}
        />
      ) : null}
    </svg>

    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ alignItems: "baseline", display: "flex", gap: "8px" }}>
        <span
          style={{
            color: "#09090b",
            fontSize: "80px",
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          {score}
        </span>
        <span style={{ color: "#71717a", fontSize: "26px", fontWeight: 500 }}>
          / 100
        </span>
      </div>
      <span
        style={{
          color: "#71717a",
          fontSize: "20px",
          fontWeight: 500,
          marginTop: "8px",
        }}
      >
        Open Graph score
      </span>
    </div>
  </div>
);

interface TreeCardProps {
  nodes: TreeNode[];
}

const renderTreeNodes = (nodes: TreeNode[]): ReactNode => (
  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
    {nodes.map((node) => {
      const { children, dotColor, label } = node;
      return (
        <div key={label} style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ alignItems: "center", display: "flex", gap: "12px" }}>
            <div
              style={{
                backgroundColor: dotColor,
                borderRadius: "4px",
                flexShrink: 0,
                height: "8px",
                width: "8px",
              }}
            />
            <span
              style={{
                color: "#18181b",
                fontFamily: "monospace",
                fontSize: "20px",
              }}
            >
              {label}
            </span>
          </div>

          {children && children.length > 0 ? (
            <div
              style={{
                borderLeft: "1.5px solid #e5e7eb",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                marginLeft: "3.5px",
                marginTop: "16px",
                paddingLeft: "18px",
              }}
            >
              {children.map((child) => {
                const {
                  children: grandChildren,
                  dotColor: childColor,
                  label: childLabel,
                } = child;

                return (
                  <div
                    key={childLabel}
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    <div
                      style={{
                        alignItems: "center",
                        display: "flex",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: childColor,
                          borderRadius: "4px",
                          flexShrink: 0,
                          height: "8px",
                          width: "8px",
                        }}
                      />
                      <span
                        style={{
                          color: "#18181b",
                          fontFamily: "monospace",
                          fontSize: "20px",
                        }}
                      >
                        {childLabel}
                      </span>
                    </div>

                    {grandChildren && grandChildren.length > 0 ? (
                      <div
                        style={{
                          borderLeft: "1.5px solid #e5e7eb",
                          display: "flex",
                          flexDirection: "column",
                          gap: "16px",
                          marginLeft: "3.5px",
                          marginTop: "16px",
                          paddingLeft: "18px",
                        }}
                      >
                        {grandChildren.map((grand) => (
                          <div
                            key={grand.label}
                            style={{
                              alignItems: "center",
                              display: "flex",
                              gap: "12px",
                            }}
                          >
                            <div
                              style={{
                                backgroundColor: grand.dotColor,
                                borderRadius: "4px",
                                flexShrink: 0,
                                height: "8px",
                                width: "8px",
                              }}
                            />
                            <span
                              style={{
                                color: "#52525b",
                                fontFamily: "monospace",
                                fontSize: "20px",
                              }}
                            >
                              {grand.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      );
    })}
  </div>
);

const TreeCard = ({ nodes }: TreeCardProps) => (
  <div
    style={{
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "24px",
      boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.03)",
      display: "flex",
      flexDirection: "column",
      height: "486px",
      justifyContent: "center",
      padding: "36px 32px",
      width: "440px",
    }}
  >
    {renderTreeNodes(nodes)}
  </div>
);

interface ImageProps {
  params: Promise<{ domain: string }>;
}

export default async function Image({ params }: ImageProps) {
  const { domain: rawDomain } = await params;
  const domain = normalizeDomain(decodeURIComponent(rawDomain)) ?? rawDomain;
  const stored = await getReport(domain);

  let report = stored?.report;

  if (!report) {
    try {
      const siteUrl = domainToUrl(domain);
      const [scannedReport, fetchedOg] = await Promise.all([
        runScanSite({
          concurrency: 4,
          fetch: safeFetch,
          maxUrls: 8,
          siteUrl,
        }),
        fetchOgTags(siteUrl, { fetch: safeFetch }).catch(() => ({})),
      ]);

      report = scannedReport;
      await saveReport({
        domain,
        og: fetchedOg,
        report,
        scannedAt: report.scannedAt,
        siteUrl,
      });
    } catch {
      // Gracefully continue with fallback if host unreachable
    }
  }

  const score = report ? Math.round(report.averageScore) : 89;
  const filled = (Math.min(Math.max(score, 0), 100) / 100) * CIRCUMFERENCE;

  const validPages = (report?.pages ?? []).filter(
    (page): page is typeof page & { url: string } =>
      typeof page.url === "string"
  );
  const treeNodes = buildTreeNodes(validPages);

  const domainFontSize = getDomainFontSize(domain.length);

  return new ImageResponse(
    <div
      style={{
        backgroundColor: "#f5f5f5",
        display: "flex",
        fontFamily: "sans-serif",
        height: "100%",
        padding: "72px",
        position: "relative",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          width: "600px",
        }}
      >
        <BrandHeader />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: "auto",
            marginTop: "auto",
          }}
        >
          <span
            style={{
              color: "#09090b",
              fontSize: domainFontSize,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
            }}
          >
            {domain}
          </span>
        </div>

        <ScoreGauge filled={filled} score={score} />
      </div>

      <div
        style={{
          alignItems: "center",
          display: "flex",
          height: "100%",
          justifyContent: "flex-end",
          width: "456px",
        }}
      >
        <TreeCard nodes={treeNodes} />
      </div>
    </div>,
    {
      ...size,
    }
  );
}
