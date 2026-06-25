export interface RobotsRules {
  disallowedPatterns: RegExp[];
}

export const parseRobotsTxt = (content: string): RobotsRules => {
  const disallowedPatterns: RegExp[] = [];
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
      // Convert robots.txt path pattern to simple RegExp:
      // - escape RegExp characters
      // - convert wildcards
      const regexStr = value
        .replaceAll(/[.+^${}()|[\]\\]/gu, "\\$&")
        .replaceAll("*", ".*")
        .replaceAll("?", ".");

      const startAnchor = regexStr.startsWith("/") ? "^" : "";
      const pattern = new RegExp(startAnchor + regexStr, "iu");
      disallowedPatterns.push(pattern);
    }
  }

  return { disallowedPatterns };
};

export const isUrlDisallowed = (urlPath: string, rules: RobotsRules): boolean =>
  rules.disallowedPatterns.some((pattern) => pattern.test(urlPath));
