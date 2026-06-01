import { parseOgTags } from "../parsers/og";
import type { OgData } from "../schemas/og";

const USER_AGENT = "OGTester/1.0 (+https://github.com/PunGrumpy/og-tester)";

export const fetchOgTags = async (url: string): Promise<OgData> => {
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}`
    );
  }

  const html = await response.text();
  return parseOgTags(html, url);
};
