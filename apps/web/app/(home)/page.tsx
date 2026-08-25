import type { Metadata } from "next";

import { Coverage } from "@/components/check/coverage";
import { Hero } from "@/components/hero";
import { ScoreList } from "@/components/home/score-list";
import { ScoringGuide } from "@/components/scoring-guide";
import { createMetadata } from "@/lib/metadata";
import { getReport, listReports } from "@/lib/reports/store";

export const metadata: Metadata = createMetadata(
  "OG Tester",
  "Test your Open Graph metadata with this tool"
);

/** The home page shows a taste of the index; /scans has the rest. */
const RECENT_ON_HOME = 8;

/** Hand-picked, and shown only once each has actually been scanned. */
const FEATURED_DOMAINS = [
  "vercel.com",
  "nextjs.org",
  "stripe.com",
  "pungrumpy.com",
];

/**
 * Served from the data cache rather than rebuilt per request. Every read is
 * tagged, and finishing a scan clears the tag, so a new result still appears
 * immediately — the difference is that the fourteen reads behind this page
 * only happen when something has actually changed.
 */

const Home = async () => {
  const [featured, recent] = await Promise.all([
    Promise.all(FEATURED_DOMAINS.map((domain) => getReport(domain))),
    listReports(0, RECENT_ON_HOME),
  ]);

  const featuredEntries = featured
    .filter((entry) => entry !== null)
    .map((entry) => ({
      domain: entry.domain,
      scannedAt: entry.scannedAt,
      score: entry.report.averageScore,
    }));

  const featuredDomains = new Set(featuredEntries.map((e) => e.domain));

  return (
    <>
      <Hero />
      <ScoreList
        entries={featuredEntries}
        id="featured"
        title="Featured scores"
      />
      <ScoreList
        // Featured already has its own block, so the same domain does not
        // appear twice on one screen.
        entries={recent.entries.filter(
          (entry) => !featuredDomains.has(entry.domain)
        )}
        href="/scans"
        hrefLabel={`All ${recent.total} scans`}
        id="recent"
        title="Recent scores"
      />
      <Coverage />
      <ScoringGuide />
    </>
  );
};

export default Home;
