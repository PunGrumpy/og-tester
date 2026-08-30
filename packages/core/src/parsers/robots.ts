export interface RobotsRules {
  disallowedPatterns: string[];
}

export const parseRobotsTxt = (content: string): RobotsRules => {
  const disallowedPatterns: string[] = [];
  const lines = content.split(/\r?\n/u);
  let isWildcardAgent = false;

  for (let line of lines) {
    line = line.trim();
    if (line.startsWith("#") || line === "") {
      continue;
    }

    const parts = line.split(":");
    if (parts.length < 2) {
      continue;
    }

    const key = parts[0].trim().toLowerCase();
    const value = parts.slice(1).join(":").trim();

    if (key === "user-agent") {
      isWildcardAgent = value === "*";
    } else if (isWildcardAgent && key === "disallow" && value !== "") {
      if (value.length > 512) {
        continue;
      }

      // Fold the unanchored ("contains") case into a leading `*` so the
      // linear matcher can slide to any start position in a single pass.
      const normalized = value.startsWith("/") ? value : `*${value}`;
      disallowedPatterns.push(normalized);
    }
  }

  return { disallowedPatterns };
};

// Linear (saved-star, two-pointer) glob matcher: O(path length x pattern
// length), no backtracking. `*` matches any sequence (including empty),
// `?` matches any single character, every other character is literal.
// This is a prefix match (no implicit end anchor), matching the previous
// RegExp-based behavior.
const globMatchesPrefix = (path: string, pattern: string): boolean => {
  const text = path.toLowerCase();
  const pat = pattern.toLowerCase();
  let ti = 0;
  let pi = 0;
  let starPi = -1;
  let starTi = 0;

  while (pi < pat.length) {
    const pc = pat[pi];
    if (ti < text.length && (pc === "?" || pc === text[ti])) {
      ti += 1;
      pi += 1;
    } else if (pc === "*") {
      starPi = pi;
      starTi = ti;
      pi += 1;
    } else if (starPi === -1) {
      return false;
    } else {
      starTi += 1;
      if (starTi > text.length) {
        return false;
      }
      ti = starTi;
      pi = starPi + 1;
    }
  }

  return true;
};

export const isUrlDisallowed = (urlPath: string, rules: RobotsRules): boolean =>
  rules.disallowedPatterns.some((pattern) =>
    globMatchesPrefix(urlPath, pattern)
  );
