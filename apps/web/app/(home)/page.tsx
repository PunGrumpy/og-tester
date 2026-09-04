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

const RECENT_ON_HOME = 8;

const FEATURED_DOMAINS = [
  "vercel.com",
  "nextjs.org",
  "stripe.com",
  "pungrumpy.com",
];

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

  const featuredDomains = new Set(featuredEntries.map((entry) => entry.domain));

  return (
    <>
      <Hero />
      <ScoreList
        entries={featuredEntries}
        id="featured"
        title="Featured scores"
      />
      <ScoreList
        entries={recent.entries.filter(
          (entry) => !featuredDomains.has(entry.domain)
        )}
        href="/scans"
        hrefLabel={recent.total === 1 ? "1 scan" : `All ${recent.total} scans`}
        id="recent"
        title="Recent scores"
      />
      <Coverage />
      <ScoringGuide />
    </>
  );
};

export default Home;
