import { ImageResponse } from "next/og";

import { normalizeDomain } from "@/lib/reports/domain";
import type { PageTreeNode } from "@/lib/reports/page-tree";
import { buildPageTree, labelUnder, pathOf } from "@/lib/reports/page-tree";
import { getReport } from "@/lib/reports/store";

export const size = {
  height: 630,
  width: 1200,
};

export const contentType = "image/png";

const DIAL_SIZE = 104;
const RADIUS = DIAL_SIZE / 4;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface FlatTreeRow {
  depth: number;
  dotColor: string;
  hasParent: boolean;
  isSubaction: boolean;
  key: string;
  label: string;
  score: number;
}

const getDotColor = (score: number, depth: number): string => {
  if (depth >= 2) {
    // Purple for sub-actions / search / endpoints
    return "#8b5cf6";
  }
  if (score >= 80) {
    // Emerald green
    return "#10b981";
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
    return "40px";
  }
  if (length > 16) {
    return "48px";
  }
  return "56px";
};

const flattenTree = (
  nodes: PageTreeNode[],
  parentUrl?: string,
  depth = 0,
  maxRows = 6
): FlatTreeRow[] => {
  const result: FlatTreeRow[] = [];

  for (const node of nodes) {
    if (result.length >= maxRows) {
      break;
    }

    const rawPath = pathOf(node.page.url);
    const rawLabel =
      depth === 0 && (rawPath === "/" || rawPath === "")
        ? "home"
        : labelUnder(node.page.url, parentUrl);

    const isSubaction =
      rawLabel.toLowerCase() === "search" ||
      rawLabel.toLowerCase().includes("filter") ||
      depth >= 2;

    const dotColor = isSubaction
      ? "#8b5cf6"
      : getDotColor(node.page.score, depth);

    result.push({
      depth,
      dotColor,
      hasParent: depth > 0,
      isSubaction,
      key: node.key,
      label: rawLabel,
      score: node.page.score,
    });

    if (node.children.length > 0 && result.length < maxRows) {
      const childrenRows = flattenTree(
        node.children,
        node.page.url,
        depth + 1,
        maxRows - result.length
      );
      result.push(...childrenRows);
    }
  }

  return result;
};

const defaultPreviewRows: FlatTreeRow[] = [
  {
    depth: 0,
    dotColor: "#10b981",
    hasParent: false,
    isSubaction: false,
    key: "p-home",
    label: "home",
    score: 100,
  },
  {
    depth: 1,
    dotColor: "#10b981",
    hasParent: true,
    isSubaction: false,
    key: "p-docs",
    label: "docs",
    score: 95,
  },
  {
    depth: 1,
    dotColor: "#10b981",
    hasParent: true,
    isSubaction: false,
    key: "p-features",
    label: "/features",
    score: 90,
  },
  {
    depth: 2,
    dotColor: "#8b5cf6",
    hasParent: true,
    isSubaction: true,
    key: "p-search",
    label: "search",
    score: 85,
  },
  {
    depth: 0,
    dotColor: "#10b981",
    hasParent: false,
    isSubaction: false,
    key: "p-docs-root",
    label: "docs",
    score: 92,
  },
  {
    depth: 1,
    dotColor: "#8b5cf6",
    hasParent: true,
    isSubaction: true,
    key: "p-docs-search",
    label: "search",
    score: 88,
  },
];

interface ImageProps {
  params: Promise<{ domain: string }>;
}

export default async function Image({ params }: ImageProps) {
  const { domain: rawDomain } = await params;
  const domain = normalizeDomain(decodeURIComponent(rawDomain)) ?? rawDomain;
  const stored = await getReport(domain);

  const hasReport = stored !== null;
  const score = hasReport ? Math.round(stored.report.averageScore) : null;
  const totalPages = hasReport ? stored.report.totalPages : 0;
  const categoryAverages = hasReport
    ? stored.report.categoryAverages
    : { image: 0, og: 0, seo: 0, twitter: 0 };

  const filled =
    score === null
      ? 0
      : (Math.min(Math.max(score, 0), 100) / 100) * CIRCUMFERENCE;

  const treeRows = hasReport
    ? flattenTree(buildPageTree(stored.report.pages), undefined, 0, 6)
    : defaultPreviewRows;

  const remainingPages =
    hasReport && totalPages > treeRows.length ? totalPages - treeRows.length : 0;

  const domainFontSize = getDomainFontSize(domain.length);

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          backgroundColor: "#ffffff",
          display: "flex",
          flexDirection: "row",
          fontFamily: "sans-serif",
          height: "100%",
          justifyContent: "space-between",
          padding: "64px 76px",
          width: "100%",
        }}
      >
        {/* Left Column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "space-between",
            width: "530px",
          }}
        >
          {/* Header */}
          <div style={{ alignItems: "center", display: "flex", gap: "12px" }}>
            <svg
              fill="none"
              height="26"
              viewBox="0 0 64 64"
              width="26"
            >
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

          {/* Main Content */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "32px" }}
          >
            <div
              style={{
                color: "#09090b",
                fontSize: domainFontSize,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                wordBreak: "break-all",
              }}
            >
              {domain}
            </div>

            {/* Score Row */}
            <div style={{ alignItems: "center", display: "flex", gap: "24px" }}>
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
                {score !== null && score > 0 ? (
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
                <div
                  style={{
                    alignItems: "baseline",
                    display: "flex",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      color: "#09090b",
                      fontSize: "76px",
                      fontWeight: 700,
                      letterSpacing: "-0.04em",
                      lineHeight: 1,
                    }}
                  >
                    {score ?? "--"}
                  </span>
                  <span
                    style={{
                      color: "#71717a",
                      fontSize: "24px",
                      fontWeight: 500,
                    }}
                  >
                    / 100
                  </span>
                </div>
                <span
                  style={{
                    color: "#71717a",
                    fontSize: "18px",
                    fontWeight: 500,
                    marginTop: "8px",
                  }}
                >
                  {hasReport ? "Agentic Score" : "Ready to scan"}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ alignItems: "center", display: "flex", gap: "8px" }}>
            <span style={{ color: "#a1a1aa", fontSize: "14px" }}>
              Open Graph · Twitter Card · Core SEO
            </span>
          </div>
        </div>

        {/* Right Column - Tree Card */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e4e4e7",
            borderRadius: "24px",
            boxShadow: "0 4px 24px -2px rgba(0, 0, 0, 0.05)",
            display: "flex",
            flexDirection: "column",
            height: "490px",
            justifyContent: "space-between",
            padding: "32px",
            width: "470px",
          }}
        >
          {/* Tree Rows */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            {treeRows.map((row) => (
              <div
                key={row.key}
                style={{
                  alignItems: "center",
                  display: "flex",
                  gap: "10px",
                  paddingLeft: row.depth > 0 ? `${row.depth * 20}px` : "0px",
                }}
              >
                <div
                  style={{
                    backgroundColor: row.dotColor,
                    borderRadius: "4px",
                    flexShrink: 0,
                    height: "8px",
                    width: "8px",
                  }}
                />
                <span
                  style={{
                    color: row.isSubaction ? "#52525b" : "#18181b",
                    fontFamily: "monospace",
                    fontSize: "17px",
                    fontWeight: row.depth === 0 ? 600 : 400,
                  }}
                >
                  {row.label}
                </span>
                {hasReport ? (
                  <span
                    style={{
                      color: "#a1a1aa",
                      fontFamily: "monospace",
                      fontSize: "13px",
                      marginLeft: "auto",
                    }}
                  >
                    {row.score}
                  </span>
                ) : null}
              </div>
            ))}

            {remainingPages > 0 ? (
              <div
                style={{
                  color: "#a1a1aa",
                  fontFamily: "monospace",
                  fontSize: "13px",
                  paddingLeft: "20px",
                }}
              >
                {`+ ${remainingPages} more pages scanned`}
              </div>
            ) : null}
          </div>

          {/* Category Summary Pill */}
          <div
            style={{
              alignItems: "center",
              backgroundColor: "#f4f4f5",
              borderRadius: "14px",
              display: "flex",
              justifyContent: "space-between",
              padding: "14px 18px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  color: "#71717a",
                  fontSize: "11px",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                OG
              </span>
              <span
                style={{
                  color: "#18181b",
                  fontSize: "16px",
                  fontWeight: 600,
                }}
              >
                {hasReport ? `${categoryAverages.og}%` : "--"}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  color: "#71717a",
                  fontSize: "11px",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                Twitter
              </span>
              <span
                style={{
                  color: "#18181b",
                  fontSize: "16px",
                  fontWeight: 600,
                }}
              >
                {hasReport ? `${categoryAverages.twitter}%` : "--"}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  color: "#71717a",
                  fontSize: "11px",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                SEO
              </span>
              <span
                style={{
                  color: "#18181b",
                  fontSize: "16px",
                  fontWeight: 600,
                }}
              >
                {hasReport ? `${categoryAverages.seo}%` : "--"}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  color: "#71717a",
                  fontSize: "11px",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                Images
              </span>
              <span
                style={{
                  color: "#18181b",
                  fontSize: "16px",
                  fontWeight: 600,
                }}
              >
                {hasReport ? `${categoryAverages.image}%` : "--"}
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
