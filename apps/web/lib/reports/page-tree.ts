import type { PageScoreResult } from "@/hooks/use-scanner-store";

export interface PageTreeNode {
  page: PageScoreResult;
  children: PageTreeNode[];
}

export const pathOf = (url: string | undefined): string => {
  if (!url) {
    return "/";
  }
  try {
    return new URL(url).pathname || "/";
  } catch {
    return url;
  }
};

const pathKey = (url: string | undefined): string =>
  pathOf(url).replace(/\/$/u, "") || "/";

/**
 * The page a page hangs from: whoever linked to it while the crawler was
 * walking, and otherwise the nearest scanned page up its own path. A sitemap
 * lists pages without linking them, so those sites fall entirely to the
 * second rule and still read as a structure.
 */
const parentOf = (
  page: PageScoreResult,
  byUrl: Map<string, PageScoreResult>,
  byPath: Map<string, PageScoreResult>
): PageScoreResult | undefined => {
  if (page.foundOn && page.foundOn !== page.url) {
    const linked = byUrl.get(page.foundOn);
    if (linked) {
      return linked;
    }
  }

  const segments = pathOf(page.url).split("/").filter(Boolean);
  for (let depth = segments.length - 1; depth >= 0; depth -= 1) {
    const ancestor = byPath.get(`/${segments.slice(0, depth).join("/")}`);
    if (ancestor && ancestor !== page) {
      return ancestor;
    }
  }
  return undefined;
};

export const buildPageTree = (pages: PageScoreResult[]): PageTreeNode[] => {
  const byUrl = new Map(pages.map((page) => [page.url ?? "", page]));
  const byPath = new Map<string, PageScoreResult>();
  for (const page of pages) {
    byPath.set(pathKey(page.url), page);
  }

  const nodes = new Map<PageScoreResult, PageTreeNode>(
    pages.map((page) => [page, { children: [], page }])
  );
  const roots: PageTreeNode[] = [];

  for (const page of pages) {
    const node = nodes.get(page);
    if (!node) {
      continue;
    }

    const parent = parentOf(page, byUrl, byPath);
    // Two pages can link to each other, and a link can point back up the
    // tree. Walking the chain first keeps either from swallowing the list.
    let cursor = parent;
    let cyclic = false;
    while (cursor) {
      if (cursor === page) {
        cyclic = true;
        break;
      }
      cursor = parentOf(cursor, byUrl, byPath);
    }

    const parentNode = cyclic || !parent ? undefined : nodes.get(parent);
    if (parentNode) {
      parentNode.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sort = (list: PageTreeNode[]) => {
    list.sort((a, b) => pathOf(a.page.url).localeCompare(pathOf(b.page.url)));
    for (const child of list) {
      sort(child.children);
    }
  };
  sort(roots);

  return roots;
};
