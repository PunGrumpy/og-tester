import { describe, expect, test } from "bun:test";

import { isUrlDisallowed, parseRobotsTxt } from "./robots";

describe("parseRobotsTxt / isUrlDisallowed", () => {
  test("prefix match: Disallow: /admin blocks /admin and subpaths, is case-insensitive, and does not block unrelated paths", () => {
    const rules = parseRobotsTxt("User-agent: *\nDisallow: /admin");

    expect(isUrlDisallowed("/admin", rules)).toBe(true);
    expect(isUrlDisallowed("/admin/x", rules)).toBe(true);
    expect(isUrlDisallowed("/ADMIN", rules)).toBe(true);
    expect(isUrlDisallowed("/public", rules)).toBe(false);
  });

  test("wildcard match: Disallow: /*.pdf blocks any path containing .pdf but not other extensions", () => {
    const rules = parseRobotsTxt("User-agent: *\nDisallow: /*.pdf");

    expect(isUrlDisallowed("/a.pdf", rules)).toBe(true);
    expect(isUrlDisallowed("/dir/b.pdf", rules)).toBe(true);
    expect(isUrlDisallowed("/a.txt", rules)).toBe(false);
  });

  test("single-char wildcard: Disallow: /p?ge blocks /page and /pige but not /pge or /paage", () => {
    const rules = parseRobotsTxt("User-agent: *\nDisallow: /p?ge");

    expect(isUrlDisallowed("/page", rules)).toBe(true);
    expect(isUrlDisallowed("/pige", rules)).toBe(true);
    expect(isUrlDisallowed("/pge", rules)).toBe(false);
    expect(isUrlDisallowed("/paage", rules)).toBe(false);
  });

  test("only User-agent: * rules are honored; other agent groups are ignored", () => {
    const rules = parseRobotsTxt(
      "User-agent: Googlebot\nDisallow: /x\n\nUser-agent: *\nDisallow: /y"
    );

    expect(isUrlDisallowed("/x", rules)).toBe(false);
    expect(isUrlDisallowed("/y", rules)).toBe(true);
  });

  test("does not backtrack catastrophically on a pathological pattern", () => {
    const rules = parseRobotsTxt(
      `User-agent: *\nDisallow: /${"a*".repeat(50)}`
    );
    const start = performance.now();
    const blocked = isUrlDisallowed(`/${"a".repeat(400)}b`, rules);
    const elapsed = performance.now() - start;

    // Milliseconds; the old regex-based matcher hangs for seconds or more.
    expect(elapsed).toBeLessThan(50);
    expect(typeof blocked).toBe("boolean");
  });
});
